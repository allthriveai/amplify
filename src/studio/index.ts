import { join } from "node:path";
import { mkdir } from "node:fs/promises";

import type { LumisConfig } from "../types/config.js";
import type { Script } from "../types/studio.js";
import { resolveStudioOutputsDir } from "../vault/paths.js";
import { createHeyGenClient } from "./heygen.js";
import { renderVideo } from "./render.js";

export { createHeyGenClient } from "./heygen.js";
export type { HeyGenClient } from "./heygen.js";
export { createElevenLabsClient } from "./elevenlabs.js";
export type { ElevenLabsClient } from "./elevenlabs.js";
export { renderVideo, previewVideo } from "./render.js";
export type { RenderProps } from "./render.js";

/** How long to wait between status polls (ms) */
const POLL_INTERVAL = 10_000;
/** Maximum number of polls before giving up */
const MAX_POLLS = 120;

/**
 * Orchestrate the full video production pipeline:
 * 1. Validate studio config
 * 2. Generate avatar video via HeyGen
 * 3. Poll until the video is ready
 * 4. Download the raw video
 * 5. Render branded output with Remotion
 * 6. Return the final output path
 */
export async function produceVideo(
  config: LumisConfig,
  script: Script,
): Promise<string> {
  // 1. Validate studio config
  const studio = config.studio;
  if (!studio) {
    throw new Error(
      "Studio config missing. Add a 'studio' section to .lumisrc with heygenApiKey and heygenAvatarId.",
    );
  }
  if (!studio.heygenApiKey) {
    throw new Error("Studio config missing heygenApiKey.");
  }
  if (!studio.heygenAvatarId) {
    throw new Error("Studio config missing heygenAvatarId.");
  }

  // 2. Create HeyGen client and generate avatar video
  const heygen = createHeyGenClient(
    studio.heygenApiKey,
    studio.heygenAvatarId,
    studio.heygenVoiceId,
  );

  const taskId = await heygen.generateVideo(script.content);

  // 3. Poll for completion
  let videoUrl: string | undefined;
  for (let i = 0; i < MAX_POLLS; i++) {
    const result = await heygen.checkStatus(taskId);

    if (result.status === "completed" && result.videoUrl) {
      videoUrl = result.videoUrl;
      break;
    }

    if (result.status === "failed") {
      throw new Error(`HeyGen video generation failed for task ${taskId}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  if (!videoUrl) {
    throw new Error(
      `HeyGen video generation timed out after ${(MAX_POLLS * POLL_INTERVAL) / 1000}s for task ${taskId}.`,
    );
  }

  // 4. Download raw video to public/raw/
  const rawDir = join(process.cwd(), "public", "raw");
  await mkdir(rawDir, { recursive: true });

  const rawFilename = `${script.filename}.mp4`;
  const rawPath = join(rawDir, rawFilename);
  await heygen.downloadVideo(videoUrl, rawPath);

  // 5. Render branded video with Remotion
  const outputDir = resolveStudioOutputsDir(config);
  await mkdir(outputDir, { recursive: true });

  const outputFilename = `${script.filename}.mp4`;
  const outputPath = join(outputDir, outputFilename);

  await renderVideo(
    {
      videoSrc: rawPath,
      title: script.frontmatter.title,
      durationInFrames: 900, // 30s at 30fps as default; Remotion will adjust
    },
    outputPath,
  );

  // 6. Return the final output path
  return outputPath;
}
