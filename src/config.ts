import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { config as loadDotenv } from "dotenv";
import { LumisConfig, DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "./types/config.js";

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
      amplifyStructures: overrides?.paths?.amplifyStructures ?? rcPaths?.amplifyStructures ?? DEFAULT_PATHS.amplifyStructures,
      amplifyTriggers: overrides?.paths?.amplifyTriggers ?? rcPaths?.amplifyTriggers ?? DEFAULT_PATHS.amplifyTriggers,
      amplifyHooks: overrides?.paths?.amplifyHooks ?? rcPaths?.amplifyHooks ?? DEFAULT_PATHS.amplifyHooks,
      amplifyPrompts: overrides?.paths?.amplifyPrompts ?? rcPaths?.amplifyPrompts ?? DEFAULT_PATHS.amplifyPrompts,
    },
    researchCategories: overrides?.researchCategories ?? rc?.researchCategories ?? DEFAULT_RESEARCH_CATEGORIES,
  };
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
