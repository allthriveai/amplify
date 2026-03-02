import { readdirSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import OBSWebSocket from "obs-websocket-js";

import type { LumisConfig } from "../types/config.js";
import { resolveStoryAssetsDir } from "../vault/paths.js";
import { setOutputPath } from "./setup.js";

/** Start recording to a story's assets folder */
export async function startRecording(
  obs: OBSWebSocket,
  config: LumisConfig,
  slug: string,
): Promise<string> {
  const assetsDir = resolveStoryAssetsDir(config, slug);
  await mkdir(assetsDir, { recursive: true });

  await setOutputPath(obs, assetsDir);

  const { outputActive } = await obs.call("GetRecordStatus");
  if (outputActive) {
    throw new Error("OBS is already recording. Stop the current recording first.");
  }

  await obs.call("StartRecord");
  return assetsDir;
}

/** Stop recording and return info about the captured file */
export async function stopRecording(
  obs: OBSWebSocket,
): Promise<{ outputPath: string }> {
  const { outputActive } = await obs.call("GetRecordStatus");
  if (!outputActive) {
    throw new Error("OBS is not currently recording.");
  }

  const result = await obs.call("StopRecord");
  return { outputPath: result.outputPath };
}

/** List captured video/image assets for a story */
export function listCapturedAssets(
  config: LumisConfig,
  slug: string,
): { name: string; size: string; modified: Date }[] {
  const assetsDir = resolveStoryAssetsDir(config, slug);
  const mediaExtensions = new Set([
    ".mp4", ".mov", ".webm", ".mkv",
    ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ]);

  let files: string[];
  try {
    files = readdirSync(assetsDir);
  } catch {
    return [];
  }

  return files
    .filter((f) => {
      const ext = f.slice(f.lastIndexOf(".")).toLowerCase();
      return mediaExtensions.has(ext);
    })
    .map((f) => {
      const stat = statSync(join(assetsDir, f));
      return {
        name: f,
        size: formatBytes(stat.size),
        modified: stat.mtime,
      };
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
