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
  const format = config.paths.dailyNoteFormat || "YYYY-MM-DD";
  const d = new Date(date);
  const yyyy = d.getFullYear().toString();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const filename = format.replace("YYYY", yyyy).replace("MM", mm).replace("DD", dd);
  return resolvePath(config, join(config.paths.dailyNotes, `${filename}.md`));
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

/** Resolve the amplify hooks directory */
export function resolveAmplifyHooksDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.amplifyHooks);
}

/** Resolve the persuasion glossary file path */
export function resolveAmplifyPersuasionPath(config: LumisConfig): string {
  return resolvePath(config, join(config.paths.amplifyPersuasion, "Persuasion-Glossary.md"));
}

/** Resolve the studio outputs directory */
export function resolveStudioOutputsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.studioOutputs);
}

/** Resolve the strategy docs directory */
export function resolveStrategyDocsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.strategyDocs);
}

/** Resolve the voice/identity file */
export function resolveVoicePath(config: LumisConfig): string {
  return resolvePath(config, config.paths.voice);
}

/** Resolve the signals directory */
export function resolveSignalsDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.signals);
}

/** Resolve the signals.json file path */
export function resolveSignalsPath(config: LumisConfig): string {
  return join(resolvePath(config, config.paths.signals), "signals.json");
}

/** Resolve the memory directory */
export function resolveMemoryDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.memory);
}

/** Resolve a session log file path for a given date */
export function resolveSessionPath(config: LumisConfig, date: string): string {
  return join(resolvePath(config, config.paths.memory), "sessions", `${date}.md`);
}

/** Resolve the preferences file path */
export function resolvePreferencesPath(config: LumisConfig): string {
  return join(resolvePath(config, config.paths.memory), "preferences.md");
}

/** Resolve the practice log file path */
export function resolvePracticeLogPath(config: LumisConfig): string {
  return join(resolvePath(config, config.paths.stories), "Practice Log.md");
}

/** Resolve the people/inspiration directory */
export function resolvePeopleDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.people);
}

/** Resolve the thinking directory (for promoted challenge notes) */
export function resolveThinkingDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.thinking);
}

/** Resolve the challenge log file path */
export function resolveChallengeLogPath(config: LumisConfig): string {
  return join(resolvePath(config, "Lumis/Thinking"), "Challenge Log.md");
}

/** Resolve a story folder by slug: {stories}/{slug}/ */
export function resolveStoryDir(config: LumisConfig, slug: string): string {
  return join(resolveStoriesDir(config), slug);
}

/** Resolve a director cut file: {stories}/{slug}/{filename} */
export function resolveDirectorCutPath(config: LumisConfig, slug: string, filename: string): string {
  return join(resolveStoryDir(config, slug), filename);
}

/** Resolve the brand directory */
export function resolveBrandDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.brand);
}

/** Resolve the Brand.md file */
export function resolveBrandPath(config: LumisConfig): string {
  return resolvePath(config, join(config.paths.brand, "Brand.md"));
}

/** Resolve the brand inspiration directory */
export function resolveBrandInspirationDir(config: LumisConfig): string {
  return resolvePath(config, join(config.paths.brand, "Inspiration"));
}
