import { join } from "node:path";
import { LumisConfig } from "../types/config.js";

/** Resolve an absolute path within the vault */
export function resolvePath(config: LumisConfig, relativePath: string): string {
  return join(config.vaultPath, relativePath);
}

/** Resolve the moments directory */
export function resolveMomentsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.moments);
}

/** Resolve the stories directory */
export function resolveStoriesDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.stories);
}

/** Resolve the pattern map canvas path */
export function resolveCanvasPath(config: LumisConfig): string {
  return resolvePath(config, config.paths.canvas);
}

/** Resolve today's daily note path */
export function resolveDailyNotePath(config: LumisConfig, date: string): string {
  // TODO: Use dailyNoteFormat to build the filename
  return resolvePath(config, join(config.paths.dailyNotes, `${date}.md`));
}
