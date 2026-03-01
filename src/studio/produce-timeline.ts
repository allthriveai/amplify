import { join } from "node:path";
import { mkdir } from "node:fs/promises";

import type { LumisConfig } from "../types/config.js";
import type { Timeline, ResolvedShot, TextCardType } from "../types/director.js";
import { readTimeline } from "../vault/timeline-reader.js";
import { writeTimeline } from "../vault/timeline-writer.js";
import { resolveStudioOutputsDir } from "../vault/paths.js";
import { createHeyGenClient } from "./heygen.js";
import { renderDirectorCut } from "./render.js";
import { brand } from "./compositions/brand.js";

/** How long to wait between HeyGen status polls (ms) */
const POLL_INTERVAL = 10_000;
/** Maximum number of polls before giving up */
const MAX_POLLS = 120;
/** Max concurrent HeyGen requests */
const MAX_CONCURRENT = 3;

interface ProduceProgress {
  phase: string;
  detail: string;
}

/**
 * Produce a Director Cut timeline:
 * 1. Read timeline from story folder
 * 2. Generate avatar clips via HeyGen (parallel, max 3 concurrent)
 * 3. Poll until all clips complete
 * 4. Download to public/raw/{slug}/
 * 5. Build ResolvedShot[] with cumulative startFrame offsets
 * 6. Render with Remotion DirectorCut composition
 * 7. Output to {studioOutputs}/{slug}.mp4
 */
export async function produceTimeline(
  config: LumisConfig,
  slug: string,
  onProgress?: (progress: ProduceProgress) => void,
): Promise<string> {
  const report = (phase: string, detail: string) => {
    onProgress?.({ phase, detail });
  };

  // 1. Read timeline
  const timeline = readTimeline(config, slug);
  if (!timeline) {
    throw new Error(`No timeline found at stories/${slug}/timeline.md`);
  }

  // Update status to producing
  writeTimeline(config, slug, { ...timeline.frontmatter, status: "producing" }, timeline.content);

  try {
    return await produceFromTimeline(config, slug, timeline, report);
  } catch (error) {
    // Reset status so the timeline isn't stuck at "producing"
    writeTimeline(config, slug, { ...timeline.frontmatter, status: "draft" }, timeline.content);
    throw error;
  }
}

async function produceFromTimeline(
  config: LumisConfig,
  slug: string,
  timeline: Timeline,
  report: (phase: string, detail: string) => void,
): Promise<string> {
  const shots = timeline.frontmatter.shots;
  const avatarShots = shots.filter((s) => s.shotType === "avatar");

  // 2. Validate studio config
  const studio = config.studio;
  if (avatarShots.length > 0) {
    if (!studio?.heygenApiKey) {
      throw new Error("Studio config missing heygenApiKey. Add it to .lumisrc under studio.");
    }
    if (!studio?.heygenAvatarId) {
      throw new Error("Studio config missing heygenAvatarId. Add it to .lumisrc under studio.");
    }
  }

  // 3. Generate avatar clips via HeyGen in parallel (max 3 concurrent)
  const rawDir = join(process.cwd(), "public", "raw", slug);
  await mkdir(rawDir, { recursive: true });

  const videoMap = new Map<number, string>(); // shot id -> local path

  if (avatarShots.length > 0 && studio?.heygenApiKey && studio?.heygenAvatarId) {
    const heygen = createHeyGenClient(
      studio.heygenApiKey,
      studio.heygenAvatarId,
      studio.heygenVoiceId,
    );

    report("heygen", `Generating ${avatarShots.length} avatar clips...`);

    // Process in batches of MAX_CONCURRENT
    for (let i = 0; i < avatarShots.length; i += MAX_CONCURRENT) {
      const batch = avatarShots.slice(i, i + MAX_CONCURRENT);

      const tasks = await Promise.all(
        batch.map(async (shot) => {
          const taskId = await heygen.generateVideo(shot.script ?? "");
          return { shot, taskId };
        }),
      );

      // Poll each task until complete
      for (const { shot, taskId } of tasks) {
        report("heygen", `Waiting for shot ${shot.id} (${shot.beat})...`);

        let videoUrl: string | undefined;
        for (let p = 0; p < MAX_POLLS; p++) {
          const result = await heygen.checkStatus(taskId);

          if (result.status === "completed" && result.videoUrl) {
            videoUrl = result.videoUrl;
            break;
          }

          if (result.status === "failed") {
            throw new Error(`HeyGen failed for shot ${shot.id} (task ${taskId}).`);
          }

          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }

        if (!videoUrl) {
          throw new Error(`HeyGen timed out for shot ${shot.id} (task ${taskId}).`);
        }

        const localPath = join(rawDir, `shot-${shot.id}.mp4`);
        await heygen.downloadVideo(videoUrl, localPath);
        videoMap.set(shot.id, localPath);

        report("heygen", `Shot ${shot.id} downloaded.`);
      }
    }
  }

  // 4. Build ResolvedShot[] with cumulative startFrame offsets
  report("resolve", "Building shot sequence...");

  const fps = brand.timing.fps;
  let currentFrame = 0;

  const resolvedShots: ResolvedShot[] = shots.map((shot) => {
    const durationInFrames = shot.duration * fps;
    const startFrame = currentFrame;
    currentFrame += durationInFrames;

    const resolved: ResolvedShot = {
      ...shot,
      durationInFrames,
      startFrame,
    };

    if (shot.shotType === "avatar") {
      resolved.videoSrc = videoMap.get(shot.id);
    }

    if (shot.shotType === "text-card" && shot.script) {
      resolved.textCard = {
        type: shot.textCardType ?? "statement",
        lines: shot.script.split("\n"),
      };
    }

    return resolved;
  });

  // 5. Render with Remotion
  report("render", "Rendering with Remotion...");

  const outputDir = resolveStudioOutputsDir(config);
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${slug}.mp4`);

  await renderDirectorCut(
    {
      shots: resolvedShots,
      title: timeline.frontmatter.title,
    },
    outputPath,
  );

  // 6. Update timeline status to rendered
  writeTimeline(config, slug, { ...timeline.frontmatter, status: "rendered" }, timeline.content);

  report("done", `Output: ${outputPath}`);
  return outputPath;
}
