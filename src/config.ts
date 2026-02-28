import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { config as loadDotenv } from "dotenv";
import { LumisConfig, DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "./types/config.js";
import type { StudioConfig } from "./types/studio.js";

/**
 * Load Lumis configuration from (in priority order):
 * 1. .lumisrc in the vault root (JSON)
 * 2. .env file in the lumis repo
 * 3. Environment variables (VAULT_PATH, ANTHROPIC_API_KEY)
 */
export function loadConfig(overrides?: Partial<LumisConfig>): LumisConfig {
  loadDotenv();

  const rc = readLumisrc();
  const rcPaths = rc?.paths;

  const vaultPath = overrides?.vaultPath
    ?? rc?.vaultPath
    ?? process.env.VAULT_PATH
    ?? "";

  const anthropicApiKey = overrides?.anthropicApiKey
    ?? rc?.anthropicApiKey
    ?? process.env.ANTHROPIC_API_KEY
    ?? "";

  const studio = loadStudioConfig(overrides?.studio, rc?.studio);

  return {
    vaultPath: resolve(vaultPath.replace(/^~/, process.env.HOME ?? "")),
    anthropicApiKey,
    paths: {
      moments: overrides?.paths?.moments ?? rcPaths?.moments ?? DEFAULT_PATHS.moments,
      stories: overrides?.paths?.stories ?? rcPaths?.stories ?? DEFAULT_PATHS.stories,
      canvas: overrides?.paths?.canvas ?? rcPaths?.canvas ?? DEFAULT_PATHS.canvas,
      dailyNotes: overrides?.paths?.dailyNotes ?? rcPaths?.dailyNotes ?? DEFAULT_PATHS.dailyNotes,
      dailyNoteFormat: overrides?.paths?.dailyNoteFormat ?? rcPaths?.dailyNoteFormat ?? DEFAULT_PATHS.dailyNoteFormat,
      research: overrides?.paths?.research ?? rcPaths?.research ?? DEFAULT_PATHS.research,
      researchTldr: overrides?.paths?.researchTldr ?? rcPaths?.researchTldr ?? DEFAULT_PATHS.researchTldr,
      learnings: overrides?.paths?.learnings ?? rcPaths?.learnings ?? DEFAULT_PATHS.learnings,
      amplifyStructures: overrides?.paths?.amplifyStructures ?? rcPaths?.amplifyStructures ?? DEFAULT_PATHS.amplifyStructures,
      amplifyTriggers: overrides?.paths?.amplifyTriggers ?? rcPaths?.amplifyTriggers ?? DEFAULT_PATHS.amplifyTriggers,
      amplifyHooks: overrides?.paths?.amplifyHooks ?? rcPaths?.amplifyHooks ?? DEFAULT_PATHS.amplifyHooks,
      amplifyPrompts: overrides?.paths?.amplifyPrompts ?? rcPaths?.amplifyPrompts ?? DEFAULT_PATHS.amplifyPrompts,
      scripts: overrides?.paths?.scripts ?? rcPaths?.scripts ?? DEFAULT_PATHS.scripts,
      studioOutputs: overrides?.paths?.studioOutputs ?? rcPaths?.studioOutputs ?? DEFAULT_PATHS.studioOutputs,
      strategyDocs: overrides?.paths?.strategyDocs ?? rcPaths?.strategyDocs ?? DEFAULT_PATHS.strategyDocs,
    },
    researchCategories: overrides?.researchCategories ?? rc?.researchCategories ?? DEFAULT_RESEARCH_CATEGORIES,
    ...(studio ? { studio } : {}),
  };
}

function loadStudioConfig(
  overrides?: StudioConfig,
  rc?: StudioConfig,
): StudioConfig | undefined {
  const studio: StudioConfig = {
    heygenApiKey: overrides?.heygenApiKey ?? rc?.heygenApiKey ?? process.env.HEYGEN_API_KEY,
    heygenAvatarId: overrides?.heygenAvatarId ?? rc?.heygenAvatarId ?? process.env.HEYGEN_AVATAR_ID,
    elevenlabsApiKey: overrides?.elevenlabsApiKey ?? rc?.elevenlabsApiKey ?? process.env.ELEVENLABS_API_KEY,
    elevenlabsVoiceId: overrides?.elevenlabsVoiceId ?? rc?.elevenlabsVoiceId ?? process.env.ELEVENLABS_VOICE_ID,
  };

  // Only return studio config if at least one value is set
  const hasValue = Object.values(studio).some(Boolean);
  return hasValue ? studio : undefined;
}

function readLumisrc(): Partial<LumisConfig> | null {
  // Check current working directory first, then VAULT_PATH
  const candidates = [
    join(process.cwd(), ".lumisrc"),
    process.env.VAULT_PATH ? join(process.env.VAULT_PATH, ".lumisrc") : null,
  ].filter(Boolean) as string[];

  for (const path of candidates) {
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, "utf-8")) as Partial<LumisConfig>;
      } catch {
        // Invalid JSON — skip
      }
    }
  }

  return null;
}
