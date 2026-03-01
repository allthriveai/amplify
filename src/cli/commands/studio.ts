import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "../../config.js";
import { resolveStoriesDir, resolveStudioOutputsDir } from "../../vault/paths.js";
import { parseFrontmatter } from "../../vault/frontmatter.js";
import type { TimelineFrontmatter } from "../../types/director.js";

const USAGE = `lumis studio — video production

Commands:
  lumis studio list                    List director cuts across stories
  lumis studio render <slug>           Render a story's timeline to branded video
  lumis studio preview                 Preview in Remotion Studio`;

/** `lumis studio <subcommand> [args]` — video production */
export async function studioCommand(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case "list": {
      await listDirectorCuts();
      break;
    }
    case "render": {
      const slug = args[0];
      if (!slug) {
        console.error("Usage: lumis studio render <slug>");
        process.exit(1);
      }
      await renderStory(slug);
      break;
    }
    case "preview": {
      await previewStory();
      break;
    }
    default:
      console.log(USAGE);
  }
}

async function listDirectorCuts(): Promise<void> {
  const config = await loadConfig();
  const storiesDir = resolveStoriesDir(config);

  let storyFolders: string[];
  try {
    storyFolders = readdirSync(storiesDir).filter((f) => {
      const fullPath = join(storiesDir, f);
      try {
        return readdirSync(fullPath).length > 0;
      } catch {
        return false;
      }
    });
  } catch {
    storyFolders = [];
  }

  if (storyFolders.length === 0) {
    console.log("No stories found. Run /craft-content to create one.");
    return;
  }

  // Print header
  console.log(
    `${"Story".padEnd(30)} ${"Director Cut".padEnd(45)} ${"Status".padEnd(12)}`,
  );
  console.log("-".repeat(89));

  for (const folder of storyFolders) {
    const folderPath = join(storiesDir, folder);
    const files = readdirSync(folderPath).filter(
      (f) => f.endsWith(".md") && f !== "story.md" && f !== "raw.md" && f !== "README.md",
    );

    for (const file of files) {
      try {
        const raw = readFileSync(join(folderPath, file), "utf-8");
        const { frontmatter } = parseFrontmatter<{ status?: string }>(raw);
        const status = String(frontmatter.status ?? "draft");
        console.log(
          `${folder.padEnd(30)} ${file.padEnd(45)} ${status.padEnd(12)}`,
        );
      } catch {
        console.log(
          `${folder.padEnd(30)} ${file.padEnd(45)} ${"unknown".padEnd(12)}`,
        );
      }
    }
  }
}

async function renderStory(slug: string): Promise<void> {
  const config = await loadConfig();
  const storiesDir = resolveStoriesDir(config);
  const storyDir = join(storiesDir, slug);

  if (!existsSync(storyDir)) {
    console.error(`Story not found: ${storyDir}`);
    process.exit(1);
  }

  // Find timeline files in the story folder
  const timelineFiles = readdirSync(storyDir).filter(
    (f) => f.startsWith("video-") && f.endsWith(".md"),
  );

  if (timelineFiles.length === 0) {
    console.error(`No video timeline found in ${storyDir}. Run /director-video first.`);
    process.exit(1);
  }

  const timelineFile = timelineFiles[timelineFiles.length - 1];
  console.log(`Rendering ${slug}/${timelineFile}...`);

  const { produceTimeline } = await import("../../studio/index.js");
  const outputPath = await produceTimeline(config, slug);

  console.log(`Done! Output: ${outputPath}`);
}

async function previewStory(): Promise<void> {
  const { previewVideo } = await import("../../studio/index.js");
  console.log("Opening Remotion Studio...");
  await previewVideo();
}
