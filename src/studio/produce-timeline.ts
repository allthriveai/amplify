import { existsSync } from "node:fs";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";

import type { LumisConfig } from "../types/config.js";
import type { Timeline, ResolvedShot, TextCardType, TransitionConfig } from "../types/director.js";
import { readTimeline } from "../vault/timeline-reader.js";
import { writeTimeline } from "../vault/timeline-writer.js";
import { resolveStoryDir } from "../vault/paths.js";
import { createHeyGenClient } from "./heygen.js";
import { createElevenLabsClient } from "./elevenlabs.js";
import { renderDirectorCut } from "./render.js";
import { brand } from "./compositions/brand.js";
import { resolveAssetPath, copyAssetToRaw, detectAssetType } from "./assets.js";
import {
  TRANSITION_FADE_FRAMES,
  TRANSITION_SLIDE_FRAMES,
  TRANSITION_OVERLAY_FRAMES,
} from "./compositions/animations.js";

/**
 * Extract audio from HeyGen .mp4 to .mp3 for cleaner audio playback.
 * Uses Remotion's bundled ffmpeg so no external dependency is needed.
 */
function extractAudio(mp4Path: string): string {
  const mp3Path = mp4Path.replace(/\.mp4$/, ".mp3");
  if (existsSync(mp3Path)) return mp3Path;
  execSync(
    `npx remotion ffmpeg -i "${mp4Path}" -vn -acodec libmp3lame -q:a 2 "${mp3Path}" -y`,
    { stdio: "pipe" },
  );
  return mp3Path;
}

/**
 * Assign transitions between shots based on shot type context.
 * Rules:
 * - No transition before the first shot
 * - branded-intro -> next: light-leak overlay
 * - hook beat -> next: light-leak overlay
 * - avatar <-> text-card/screen-capture: slide
 * - Default: fade
 */
function assignTransitions(shots: ResolvedShot[]): void {
  for (let i = 1; i < shots.length; i++) {
    const prev = shots[i - 1];
    const curr = shots[i];

    // After branded-intro or hook beat: light-leak overlay
    if (prev.shotType === "branded-intro" || prev.beat === "hook") {
      curr.transitionIn = { type: "light-leak", durationInFrames: TRANSITION_OVERLAY_FRAMES };
      continue;
    }

    // Avatar <-> text-card or screen-capture: slide
    const isAvatarToVisual =
      prev.shotType === "avatar" &&
      (curr.shotType === "text-card" || curr.shotType === "screen-capture");
    const isVisualToAvatar =
      (prev.shotType === "text-card" || prev.shotType === "screen-capture") &&
      curr.shotType === "avatar";

    if (isAvatarToVisual || isVisualToAvatar) {
      curr.transitionIn = { type: "slide", durationInFrames: TRANSITION_SLIDE_FRAMES };
      continue;
    }

    // Default: fade
    curr.transitionIn = { type: "fade", durationInFrames: TRANSITION_FADE_FRAMES };
  }
}

/**
 * Recalculate startFrame offsets accounting for transition overlaps.
 * Crossfade/slide transitions overlap adjacent shots, shortening the timeline.
 * Overlay transitions (light-leak) don't shift timing.
 */
function recalculateFrameOffsets(shots: ResolvedShot[]): void {
  let currentFrame = 0;
  for (const shot of shots) {
    // Overlapping transitions shorten the timeline
    if (shot.transitionIn && shot.transitionIn.type !== "light-leak" && shot.transitionIn.type !== "none") {
      currentFrame -= shot.transitionIn.durationInFrames;
    }
    shot.startFrame = currentFrame;
    currentFrame += shot.durationInFrames;
  }
}

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
 * 2. Validate config, generate avatar clips via HeyGen (parallel, max 3)
 * 3. Generate ElevenLabs voiceover audio for narrated shots
 * 4. Resolve screen-capture assets from story screenshots/ folder
 * 5. Build ResolvedShot[] with cumulative startFrame offsets
 * 6. Render with Remotion DirectorCut composition
 * 7. Update timeline status, output to {stories}/{slug}/{slug}.mp4
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

  // 3. Generate avatar clips via HeyGen in parallel (max 3 concurrent)
  const rawDir = join(process.cwd(), "public", "raw", slug);
  await mkdir(rawDir, { recursive: true });

  const videoMap = new Map<number, string>(); // shot id -> local path

  const audioMap_avatar = new Map<number, string>(); // shot id -> mp3 path

  // Skip avatar shots that already have raw files (both .mp4 and .mp3)
  const pendingAvatarShots = avatarShots.filter((shot) => {
    const localPath = join(rawDir, `shot-${shot.id}.mp4`);
    const mp3Path = join(rawDir, `shot-${shot.id}.mp3`);
    if (existsSync(localPath)) {
      videoMap.set(shot.id, localPath);
      // Extract audio if mp3 doesn't exist yet
      if (!existsSync(mp3Path)) {
        try { extractAudio(localPath); } catch { /* proceed without mp3 */ }
      }
      if (existsSync(mp3Path)) {
        audioMap_avatar.set(shot.id, mp3Path);
      }
      return false;
    }
    return true;
  });

  if (pendingAvatarShots.length < avatarShots.length) {
    report("heygen", `Skipping ${avatarShots.length - pendingAvatarShots.length} cached avatar clips.`);
  }

  if (pendingAvatarShots.length > 0) {
    if (!studio?.heygenApiKey) {
      throw new Error("Studio config missing heygenApiKey. Add it to .lumisrc under studio.");
    }
    if (!studio?.heygenAvatarId) {
      throw new Error("Studio config missing heygenAvatarId. Add it to .lumisrc under studio.");
    }

    const heygen = createHeyGenClient(
      studio.heygenApiKey,
      studio.heygenAvatarId,
      studio.heygenVoiceId,
    );

    report("heygen", `Generating ${pendingAvatarShots.length} avatar clips...`);

    // Process in batches of MAX_CONCURRENT
    for (let i = 0; i < pendingAvatarShots.length; i += MAX_CONCURRENT) {
      const batch = pendingAvatarShots.slice(i, i + MAX_CONCURRENT);

      const tasks = await Promise.all(
        batch.map(async (shot) => {
          const title = `${slug} / shot-${shot.id} / ${shot.beat}`;
          const taskId = await heygen.generateVideo(shot.script ?? "", title);
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

        // Extract clean mp3 audio from the avatar video
        try {
          const mp3Path = extractAudio(localPath);
          audioMap_avatar.set(shot.id, mp3Path);
          report("heygen", `Shot ${shot.id} downloaded + audio extracted.`);
        } catch {
          report("heygen", `Shot ${shot.id} downloaded (audio extraction failed, using mp4).`);
        }
      }
    }
  }

  // 4. Generate ElevenLabs voiceover audio
  const voiceoverShots = shots.filter(
    (s) => s.voiceover && s.voiceoverSource === "elevenlabs",
  );
  const audioMap = new Map<number, string>();

  // Skip voiceover shots that already have raw files
  const pendingVoiceovers = voiceoverShots.filter((shot) => {
    const outputPath = join(rawDir, `voiceover-${shot.id}.mp3`);
    if (existsSync(outputPath)) {
      audioMap.set(shot.id, outputPath);
      return false;
    }
    return true;
  });

  if (pendingVoiceovers.length < voiceoverShots.length) {
    report("elevenlabs", `Skipping ${voiceoverShots.length - pendingVoiceovers.length} cached voiceovers.`);
  }

  if (pendingVoiceovers.length > 0) {
    if (!studio?.elevenlabsApiKey) {
      throw new Error("Studio config missing elevenlabsApiKey. Add it to .lumisrc under studio.");
    }
    if (!studio?.elevenlabsVoiceId) {
      throw new Error("Studio config missing elevenlabsVoiceId. Add it to .lumisrc under studio.");
    }

    const elevenlabs = createElevenLabsClient(studio.elevenlabsApiKey, studio.elevenlabsVoiceId);
    report("elevenlabs", `Generating ${pendingVoiceovers.length} voiceover clips...`);

    for (const shot of pendingVoiceovers) {
      const outputPath = join(rawDir, `voiceover-${shot.id}.mp3`);
      await elevenlabs.generateSpeech(shot.voiceover!, outputPath);
      audioMap.set(shot.id, outputPath);
      report("elevenlabs", `Voiceover for shot ${shot.id} generated.`);
    }
  }

  // 5. Resolve screen-capture assets
  const screenShots = shots.filter(
    (s) => s.shotType === "screen-capture" && s.asset,
  );
  const assetMap = new Map<number, { path: string; isVideo: boolean }>();

  if (screenShots.length > 0) {
    report("assets", `Resolving ${screenShots.length} screen capture assets...`);

    const missing: string[] = [];
    for (const shot of screenShots) {
      const assetPath = resolveAssetPath(config, slug, shot.asset!);
      if (assetPath) {
        const copiedPath = await copyAssetToRaw(assetPath, rawDir, shot.id);
        const assetType = detectAssetType(shot.asset!);
        assetMap.set(shot.id, { path: copiedPath, isVideo: assetType === "video" });
        report("assets", `Asset for shot ${shot.id} resolved.`);
      } else {
        missing.push(shot.asset!);
      }
    }

    if (missing.length > 0) {
      report("assets", `Warning: missing assets: ${missing.join(", ")}`);
    }
  }

  // 6. Build ResolvedShot[] with cumulative startFrame offsets
  report("resolve", "Building shot sequence...");

  // Remotion serves files from public/ — convert absolute paths to relative
  const publicDir = join(process.cwd(), "public");
  const toStaticPath = (absPath: string) => absPath.startsWith(publicDir)
    ? absPath.slice(publicDir.length + 1)
    : absPath;

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
      const src = videoMap.get(shot.id);
      if (src) resolved.videoSrc = toStaticPath(src);
      // Prefer extracted .mp3 for cleaner audio playback
      const mp3 = audioMap_avatar.get(shot.id);
      if (mp3) resolved.audioSrc = toStaticPath(mp3);
    }

    if (shot.shotType === "screen-capture") {
      const asset = assetMap.get(shot.id);
      if (asset) {
        resolved.isVideo = asset.isVideo;
        if (asset.isVideo) {
          resolved.videoSrc = toStaticPath(asset.path);
        } else {
          resolved.imageSrc = toStaticPath(asset.path);
        }
      }
    }

    if (shot.shotType === "text-card") {
      const displayText = shot.text ?? shot.script;
      if (displayText) {
        resolved.textCard = {
          type: shot.textCardType ?? "statement",
          lines: displayText.split("\n"),
        };
      }
    }

    if (audioMap.has(shot.id)) {
      resolved.audioSrc = toStaticPath(audioMap.get(shot.id)!);
    }

    return resolved;
  });

  // 7. Assign transitions and recalculate frame offsets
  report("resolve", "Assigning transitions...");
  assignTransitions(resolvedShots);
  recalculateFrameOffsets(resolvedShots);

  // 8. Render with Remotion
  report("render", "Rendering with Remotion...");

  const outputDir = resolveStoryDir(config, slug);
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${slug}.mp4`);

  await renderDirectorCut(
    {
      shots: resolvedShots,
      title: timeline.frontmatter.title,
    },
    outputPath,
  );

  // 9. Update timeline status to rendered
  writeTimeline(config, slug, { ...timeline.frontmatter, status: "rendered" }, timeline.content);

  report("done", `Output: ${outputPath}`);
  return outputPath;
}
