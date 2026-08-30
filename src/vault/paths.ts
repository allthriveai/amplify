import { join } from "node:path";
import type { AmplifyConfig } from "../types/config.js";
import { WIKI_SUBDIRS, type WikiPageKind } from "../types/wiki.js";

/** Resolve an absolute path within the vault */
export function resolvePath(config: AmplifyConfig, relativePath: string): string {
  return join(config.vaultPath, relativePath);
}


/** Resolve the stories directory */
export function resolveStoriesDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.stories);
}



/** Resolve the source layer root. Everything under here is immutable. */
export function resolveSourcesDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.sources);
}

/** Resolve the clippings directory: {sources}/Clippings */
export function resolveClippingsDir(config: AmplifyConfig): string {
  return join(resolveSourcesDir(config), "Clippings");
}

/** Resolve the source-layer assets directory: {sources}/assets */
export function resolveSourceAssetsDir(config: AmplifyConfig): string {
  return join(resolveSourcesDir(config), "assets");
}

/** Resolve the wiki root. Everything under here is agent-owned. */
export function resolveWikiDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.wiki);
}

/** Resolve the wiki subfolder for a page kind: {wiki}/{Summaries|Concepts|Entities|Synthesis} */
export function resolveWikiSubdir(config: AmplifyConfig, kind: WikiPageKind): string {
  return join(resolveWikiDir(config), WIKI_SUBDIRS[kind]);
}

/** Resolve a wiki page path: {wiki}/{subdir}/{filename} */
export function resolveWikiPagePath(config: AmplifyConfig, kind: WikiPageKind, filename: string): string {
  return join(resolveWikiSubdir(config, kind), filename);
}

/** Resolve the wiki catalog: {wiki}/index.md */
export function resolveWikiIndexPath(config: AmplifyConfig): string {
  return join(resolveWikiDir(config), "index.md");
}

/** Resolve the append-only wiki log: {wiki}/log.md */
export function resolveWikiLogPath(config: AmplifyConfig): string {
  return join(resolveWikiDir(config), "log.md");
}

/** Resolve the amplify structures directory */
export function resolveAmplifyStructuresDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.amplifyStructures);
}

/** Resolve the amplify hooks directory */
export function resolveAmplifyHooksDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.amplifyHooks);
}

/** Resolve the persuasion glossary file path */
export function resolveAmplifyPersuasionPath(config: AmplifyConfig): string {
  return resolvePath(config, join(config.paths.amplifyPersuasion, "Persuasion-Glossary.md"));
}

/** Resolve the assets directory within a story folder: {stories}/{slug}/assets/ */
export function resolveStoryAssetsDir(config: AmplifyConfig, slug: string): string {
  return join(resolveStoryDir(config, slug), "assets");
}

/** Resolve the strategy docs directory */
export function resolveStrategyDocsDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.strategyDocs);
}

/** Resolve the voice/identity file */
export function resolveVoicePath(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.voice);
}


/** Resolve the signals directory */
export function resolveSignalsDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.signals);
}

/** Resolve the signals.json file path */
export function resolveSignalsPath(config: AmplifyConfig): string {
  return join(resolvePath(config, config.paths.signals), "signals.json");
}

/** Resolve the memory directory */
export function resolveMemoryDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.memory);
}

/** Resolve a session log file path for a given date */
export function resolveSessionPath(config: AmplifyConfig, date: string): string {
  return join(resolvePath(config, config.paths.memory), "sessions", `${date}.md`);
}

/** Resolve the preferences file path */
export function resolvePreferencesPath(config: AmplifyConfig): string {
  return join(resolvePath(config, config.paths.memory), "preferences.md");
}


/** Resolve the people/inspiration directory */
export function resolvePeopleDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.people);
}



/** Resolve a story folder by slug: {stories}/{slug}/ */
export function resolveStoryDir(config: AmplifyConfig, slug: string): string {
  return join(resolveStoriesDir(config), slug);
}

/** Resolve a director cut file: {stories}/{slug}/{filename} */
export function resolveDirectorCutPath(config: AmplifyConfig, slug: string, filename: string): string {
  return join(resolveStoryDir(config, slug), filename);
}

/** Resolve the audio narrations directory */
export function resolveAudioDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.audio);
}

/** Resolve the brand directory */
export function resolveBrandDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.brand);
}



/** Resolve the meetings directory */
export function resolveMeetingsDir(config: AmplifyConfig): string {
  return resolvePath(config, config.paths.meetings);
}

/** Resolve the Brand.md file */
export function resolveBrandPath(config: AmplifyConfig): string {
  return resolvePath(config, join(config.paths.brand, "Brand.md"));
}

/** Resolve the brand inspiration directory */
export function resolveBrandInspirationDir(config: AmplifyConfig): string {
  return resolvePath(config, join(config.paths.brand, "Inspiration"));
}
