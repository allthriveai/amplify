import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { exec } from "node:child_process";
import matter from "gray-matter";
import { loadConfig } from "../../config.js";

const USAGE = `lumis storyboard — visual pre-production editor

Usage:
  lumis storyboard <slug>            Open storyboard for a story's timeline
  lumis storyboard <timeline.md>     Open storyboard for a specific timeline file`;

const PORT = 4800;

export async function storyboardCommand(args: string[]): Promise<void> {
  const input = args[0];
  if (!input) {
    console.log(USAGE);
    process.exit(1);
  }

  const config = loadConfig();
  const { generateStoryboardHtml } = await import("../../studio/storyboard.js");
  const { startStoryboardServer } = await import("../../studio/storyboard-server.js");

  // Resolve the timeline file
  let timelinePath: string;
  let slug: string;
  if (input.endsWith(".md")) {
    timelinePath = input;
    slug = basename(input, ".md");
  } else {
    slug = input;
    const { resolveStoryDir } = await import("../../vault/paths.js");
    const storyDir = resolveStoryDir(config, input);

    let files: string[];
    try {
      files = readdirSync(storyDir).filter((f) => f.startsWith("video-") && f.endsWith(".md"));
    } catch {
      console.error(`Story folder not found: ${storyDir}`);
      process.exit(1);
    }

    if (files.length === 0) {
      console.error(`No timeline files (video-*.md) found in ${storyDir}`);
      console.error("Run /director-video first to create a timeline.");
      process.exit(1);
    }

    // Pick the most recently modified
    files.sort((a, b) => statSync(join(storyDir, b)).mtimeMs - statSync(join(storyDir, a)).mtimeMs);
    timelinePath = join(storyDir, files[0]);
    if (files.length > 1) {
      console.log(`Found ${files.length} timelines, using most recent: ${files[0]}`);
    }
  }

  // Parse timeline
  const raw = readFileSync(timelinePath, "utf-8");
  const parsed = matter(raw);
  const timeline = parsed.data as Record<string, unknown>;
  const notes = parsed.content;

  if (!timeline.shots || !Array.isArray(timeline.shots)) {
    console.error("Timeline has no shots array in frontmatter.");
    process.exit(1);
  }

  const serverUrl = `http://127.0.0.1:${PORT}`;

  // Generate HTML with server URL baked in
  const html = generateStoryboardHtml({
    timeline: timeline as any,
    directorsNotes: notes,
    timelinePath,
    serverUrl,
  });

  // Save HTML next to timeline
  const htmlPath = join(dirname(timelinePath), `storyboard-${slug}.html`);
  writeFileSync(htmlPath, html);

  // Start server
  const server = await startStoryboardServer({
    htmlPath,
    timelinePath,
    port: PORT,
  });

  const shots = timeline.shots as Array<{ duration: number }>;
  const totalDuration = shots.reduce((s, sh) => s + sh.duration, 0);

  console.log(`Storyboard: ${htmlPath}`);
  console.log(`Server: ${server.url}`);
  console.log(`Timeline: ${timelinePath}`);
  console.log(`${shots.length} shots, ${totalDuration}s total`);
  console.log("\nCmd+S saves directly to timeline. Ctrl+C to stop server.");

  // Open in browser
  exec(`open ${server.url}`);

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\nStopping storyboard server.");
    server.close();
    process.exit(0);
  });
}
