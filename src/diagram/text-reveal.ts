import { mkdtemp, writeFile, mkdir, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface TextRevealOptions {
  text: string;
  /** Absolute path to background image */
  backgroundImage?: string;
  /** Fallback background color/gradient */
  backgroundColor?: string;
  format?: "mp4" | "gif";
  /** Viewport width. Default: 1080 */
  width?: number;
  /** Viewport height. Default: 1080 */
  height?: number;
  /** ms to hold between word reveals. Default: 200 */
  wordDuration?: number;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  /** rgba for glass background. Default: rgba(255,255,255,0.12) */
  glassColor?: string;
  /** Backdrop blur in px. Default: 24 */
  glassBlur?: number;
}

export async function renderTextRevealVideo(
  options: TextRevealOptions,
  outputPath: string,
): Promise<string> {
  const {
    text,
    backgroundImage,
    backgroundColor = "#1a1a2e",
    format = "mp4",
    width = 1080,
    height = 1080,
    wordDuration = 200,
    fontFamily = "'Inter', system-ui, sans-serif",
    fontSize = 52,
    fontColor = "#ffffff",
    glassColor = "rgba(255, 255, 255, 0.12)",
    glassBlur = 24,
  } = options;

  const FPS = 30;
  const wordHoldFrames = Math.round((wordDuration / 1000) * FPS);
  const emptyHoldFrames = Math.round(0.5 * FPS); // 0.5s intro
  const endHoldFrames = Math.round(2.0 * FPS); // 2s final hold

  // Build background CSS
  let bgCss: string;
  if (backgroundImage) {
    const imgData = await readFile(backgroundImage);
    const ext = backgroundImage.split(".").pop()?.toLowerCase() ?? "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
    const b64 = imgData.toString("base64");
    bgCss = `url('data:${mime};base64,${b64}') center/cover no-repeat`;
  } else {
    bgCss = backgroundColor;
  }

  // Split text into words
  const words = text.split(/\s+/).filter(Boolean);

  const wordSpans = words
    .map((w, i) => `<span class="word" data-index="${i}">${escapeHtml(w)}</span>`)
    .join("\n      ");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      background: ${bgCss};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .text-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      max-width: 85%;
      gap: 8px;
      padding: 40px;
    }
    .word {
      display: inline-block;
      padding: 6px 18px;
      background: ${glassColor};
      backdrop-filter: blur(${glassBlur}px);
      -webkit-backdrop-filter: blur(${glassBlur}px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.10);
      color: ${fontColor};
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.3;
      opacity: 0;
      transform: translateY(8px) scale(0.95);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .word.revealed {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  </style>
</head>
<body>
  <div class="text-container">
      ${wordSpans}
  </div>
</body>
</html>`;

  // Set up temp directory
  const tmpDir = await mkdtemp(join(tmpdir(), "lumis-text-reveal-"));
  const htmlPath = join(tmpDir, "reveal.html");
  const framesDir = join(tmpDir, "frames");
  await mkdir(framesDir);
  await writeFile(htmlPath, html);

  let frameIndex = 0;
  function framePath(): string {
    const p = join(framesDir, `frame-${String(frameIndex).padStart(5, "0")}.png`);
    frameIndex++;
    return p;
  }

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width, height } });

    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    // Let fonts load
    await page.waitForTimeout(1000);

    // Empty state (just background)
    for (let i = 0; i < emptyHoldFrames; i++) {
      await page.screenshot({ path: framePath(), type: "png" });
    }

    // Reveal words one by one
    for (let w = 0; w < words.length; w++) {
      await page.evaluate((idx) => {
        const el = document.querySelector(`.word[data-index="${idx}"]`);
        el?.classList.add("revealed");
      }, w);

      // Wait for CSS transition (250ms)
      await page.waitForTimeout(250);

      // Capture transition + hold
      for (let i = 0; i < wordHoldFrames; i++) {
        await page.screenshot({ path: framePath(), type: "png" });
      }
    }

    // End hold — all words visible
    for (let i = 0; i < endHoldFrames; i++) {
      await page.screenshot({ path: framePath(), type: "png" });
    }

    await browser.close();

    // Stitch into video
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

    if (format === "gif") {
      await runFfmpeg([
        "-y",
        "-i", mp4Path,
        "-vf", `fps=15,scale=${Math.min(width, 600)}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        "-loop", "0",
        outputPath,
      ]);
    }

    return outputPath;
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function runFfmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync("ffmpeg", ["-version"], { timeout: 5000 });
    await execFileAsync("ffmpeg", args, { timeout: 120000 });
    return;
  } catch {
    // Fall through to Remotion
  }

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

  throw new Error("FFmpeg not found. Install: brew install ffmpeg");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
