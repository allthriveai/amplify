import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import type { RenderDiagramVideoOptions } from "../types/diagram.js";
import { renderDiagramHtml } from "./render-html.js";
import { computeAnimationOrder } from "./animation-order.js";

const execFileAsync = promisify(execFile);

/**
 * Render a diagram as an animated MP4 or GIF.
 *
 * 1. Generates animation-ready HTML
 * 2. Opens it in headless Playwright, reveals nodes one by one
 * 3. Captures screenshots at each state
 * 4. Stitches frames into video with FFmpeg (via Remotion)
 */
export async function renderDiagramVideo(
  options: RenderDiagramVideoOptions,
  outputPath: string,
): Promise<string> {
  const {
    title,
    nodes,
    edges,
    diagramType,
    brand,
    format = "mp4",
    width = 1080,
    height = 1080,
    frameDuration = 600,
    transitionDuration = 300,
  } = options;

  const FPS = 30;
  const holdFrames = Math.round((frameDuration / 1000) * FPS);
  const transitionFrames = Math.round((transitionDuration / 1000) * FPS);
  const emptyHoldFrames = 15; // 0.5s
  const titleHoldFrames = 20; // ~0.7s
  const endHoldFrames = 45; // 1.5s

  // 1. Generate animation-ready HTML
  const html = renderDiagramHtml({
    title,
    nodes,
    edges,
    diagramType,
    brand,
    animated: true,
  });

  // 2. Set up temp directory
  const tmpDir = await mkdtemp(join(tmpdir(), "lumis-diagram-video-"));
  const htmlPath = join(tmpDir, "diagram.html");
  const framesDir = join(tmpDir, "frames");
  await mkdir(framesDir);
  await writeFile(htmlPath, html);

  let frameIndex = 0;

  function framePath(): string {
    const path = join(framesDir, `frame-${String(frameIndex).padStart(5, "0")}.png`);
    frameIndex++;
    return path;
  }

  try {
    // 3. Launch Playwright
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width, height } });

    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

    // Wait for React Flow to render nodes
    await page.waitForSelector(".react-flow__renderer", { timeout: 15000 });
    // Give dagre layout a moment to settle
    await page.waitForTimeout(1000);

    // Click fit-view button if available
    const fitViewBtn = page.locator(".react-flow__controls-fitview");
    if (await fitViewBtn.isVisible()) {
      await fitViewBtn.click();
      await page.waitForTimeout(500);
    }

    // 4. Capture empty state
    for (let i = 0; i < emptyHoldFrames; i++) {
      await page.screenshot({ path: framePath(), type: "png" });
    }

    // 5. Reveal title bar
    await page.evaluate(() => {
      document.getElementById("title-bar")?.classList.add("revealed");
    });
    // Transition frames
    for (let i = 0; i < transitionFrames; i++) {
      await page.screenshot({ path: framePath(), type: "png" });
    }
    // Hold title
    for (let i = 0; i < titleHoldFrames; i++) {
      await page.screenshot({ path: framePath(), type: "png" });
    }

    // 6. Compute animation order and build edge lookup
    const order = computeAnimationOrder(nodes, edges, diagramType);
    const outgoingEdges = new Map<string, string[]>();
    for (const e of edges) {
      const existing = outgoingEdges.get(e.source) ?? [];
      existing.push(e.id);
      outgoingEdges.set(e.source, existing);
    }

    // 7. Reveal nodes one by one
    for (const nodeId of order) {
      // Reveal node
      await page.evaluate((id) => {
        // React Flow renders nodes with data-id attribute
        const el = document.querySelector(`.react-flow__node[data-id="${id}"]`);
        el?.classList.add("revealed");
      }, nodeId);

      // Wait for transition
      await page.waitForTimeout(transitionDuration);

      // Capture transition settle frame
      for (let i = 0; i < transitionFrames; i++) {
        await page.screenshot({ path: framePath(), type: "png" });
      }

      // Reveal outgoing edges from this node
      const edgeIds = outgoingEdges.get(nodeId) ?? [];
      if (edgeIds.length > 0) {
        await page.evaluate((ids) => {
          for (const edgeId of ids) {
            // React Flow renders edges with data-id on .react-flow__edge
            const el = document.querySelector(`.react-flow__edge[data-id="${edgeId}"]`);
            el?.classList.add("revealed");
          }
        }, edgeIds);

        await page.waitForTimeout(transitionDuration);

        // Capture edge transition
        for (let i = 0; i < transitionFrames; i++) {
          await page.screenshot({ path: framePath(), type: "png" });
        }
      }

      // Hold on this state
      for (let i = 0; i < holdFrames; i++) {
        await page.screenshot({ path: framePath(), type: "png" });
      }
    }

    // Reveal any remaining edges not yet shown
    await page.evaluate(() => {
      document.querySelectorAll(".react-flow__edge").forEach((el) => {
        el.classList.add("revealed");
      });
    });
    await page.waitForTimeout(transitionDuration);

    // 8. End hold
    for (let i = 0; i < endHoldFrames; i++) {
      await page.screenshot({ path: framePath(), type: "png" });
    }

    await browser.close();

    // 9. Stitch frames into video with FFmpeg
    const mp4Path = format === "gif" ? join(tmpDir, "output.mp4") : outputPath;

    await runFfmpeg([
      "-y",
      "-framerate", String(FPS),
      "-i", join(framesDir, "frame-%05d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-preset", "medium",
      mp4Path,
    ]);

    // 10. Convert to GIF if requested
    if (format === "gif") {
      await runFfmpeg([
        "-y",
        "-i", mp4Path,
        "-vf", "fps=15,scale=600:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        "-loop", "0",
        outputPath,
      ]);
    }

    return outputPath;
  } finally {
    // Clean up temp directory
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Run FFmpeg with given args. Tries system ffmpeg first, then Remotion's bundled version.
 */
async function runFfmpeg(args: string[]): Promise<void> {
  // Try system ffmpeg
  try {
    await execFileAsync("ffmpeg", ["-version"], { timeout: 5000 });
    await execFileAsync("ffmpeg", args, { timeout: 120000 });
    return;
  } catch {
    // Fall through to Remotion
  }

  // Try Remotion's bundled ffmpeg via npx
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("npx", ["remotion", "ffmpeg", ...args], {
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 120000,
      });
      let stderr = "";
      proc.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      });
      proc.on("error", reject);
    });
    return;
  } catch {
    // Fall through
  }

  throw new Error(
    "FFmpeg not found. Install it with: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)",
  );
}
