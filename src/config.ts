import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { config as loadDotenv } from "dotenv";
import { LumisConfig, DEFAULT_PATHS } from "./types/config.js";

/**
 * Load Lumis configuration from (in priority order):
 * 1. .lumisrc in the vault root (JSON)
 * 2. .env file in the lumis repo
 * 3. Environment variables (VAULT_PATH, ANTHROPIC_API_KEY)
 */
export function loadConfig(overrides?: Partial<LumisConfig>): LumisConfig {
  loadDotenv();

  const vaultPath = overrides?.vaultPath
    ?? readLumisrc()?.vaultPath
    ?? process.env.VAULT_PATH
    ?? "";

  const anthropicApiKey = overrides?.anthropicApiKey
    ?? readLumisrc()?.anthropicApiKey
    ?? process.env.ANTHROPIC_API_KEY
    ?? "";

  const rcPaths = readLumisrc()?.paths;

  return {
    vaultPath: resolve(vaultPath.replace(/^~/, process.env.HOME ?? "")),
    anthropicApiKey,
    paths: {
      moments: overrides?.paths?.moments ?? rcPaths?.moments ?? DEFAULT_PATHS.moments,
      stories: overrides?.paths?.stories ?? rcPaths?.stories ?? DEFAULT_PATHS.stories,
      canvas: overrides?.paths?.canvas ?? rcPaths?.canvas ?? DEFAULT_PATHS.canvas,
      dailyNotes: overrides?.paths?.dailyNotes ?? rcPaths?.dailyNotes ?? DEFAULT_PATHS.dailyNotes,
      dailyNoteFormat: overrides?.paths?.dailyNoteFormat ?? rcPaths?.dailyNoteFormat ?? DEFAULT_PATHS.dailyNoteFormat,
    },
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
