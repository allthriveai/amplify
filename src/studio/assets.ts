import { existsSync } from "node:fs";
import { join } from "node:path";
import { copyFile, mkdir } from "node:fs/promises";

import type { LumisConfig } from "../types/config.js";
import type { Shot } from "../types/director.js";
import { resolveStoryDir } from "../vault/paths.js";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

/** Detect if a file is video or image based on extension */
export function detectAssetType(filename: string): "video" | "image" | "unknown" {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  return "unknown";
}

/** Resolve an asset filename to its absolute path in the story's assets/ folder */
export function resolveAssetPath(
  config: LumisConfig,
  slug: string,
  assetFilename: string,
): string | null {
  const storyDir = resolveStoryDir(config, slug);
  const assetPath = join(storyDir, "assets", assetFilename);
  return existsSync(assetPath) ? assetPath : null;
}

/** Copy a resolved asset into the Remotion public/raw/{slug}/ directory for rendering */
export async function copyAssetToRaw(
  assetPath: string,
  rawDir: string,
  shotId: number,
): Promise<string> {
  await mkdir(rawDir, { recursive: true });
  const ext = assetPath.slice(assetPath.lastIndexOf("."));
  const dest = join(rawDir, `asset-${shotId}${ext}`);
  await copyFile(assetPath, dest);
  return dest;
}

/** Validate all assets in a timeline exist before production starts */
export function validateAssets(
  config: LumisConfig,
  slug: string,
  shots: Shot[],
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const shot of shots) {
    if (shot.shotType === "screen-capture" && shot.asset) {
      const resolved = resolveAssetPath(config, slug, shot.asset);
      if (!resolved) {
        missing.push(shot.asset);
      }
    }
  }

  return { valid: missing.length === 0, missing };
}
