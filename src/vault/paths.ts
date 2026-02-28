import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { ResearchCategory } from "../types/research.js";

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

/** Resolve the research root directory */
export function resolveResearchDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.research);
}

/** Resolve the TL;DR companion notes directory */
export function resolveTldrDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.researchTldr);
}

/** Resolve a specific research category subfolder */
export function resolveResearchCategoryDir(config: LumisConfig, category: ResearchCategory): string {
  return join(resolveResearchDir(config), category.folder);
}

/** Resolve the learnings directory */
export function resolveLearningsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.learnings);
}

/** Resolve the amplify structures directory */
export function resolveAmplifyStructuresDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.amplifyStructures);
}

/** Resolve the amplify triggers directory */
export function resolveAmplifyTriggersDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.amplifyTriggers);
}

/** Resolve the hooks file path */
export function resolveAmplifyHooksPath(config: LumisConfig): string {
  return resolvePath(config, join(config.paths.amplifyHooks, "Hooks.md"));
}

/** Resolve the prompts file path */
export function resolveAmplifyPromptsPath(config: LumisConfig): string {
  return resolvePath(config, join(config.paths.amplifyPrompts, "Prompts.md"));
}

/** Resolve the scripts directory */
export function resolveScriptsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.scripts);
}

/** Resolve the studio outputs directory */
export function resolveStudioOutputsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.studioOutputs);
}

/** Resolve the strategy docs directory */
export function resolveStrategyDocsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.strategyDocs);
}
