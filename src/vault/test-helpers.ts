import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { DEFAULT_PATHS, type LumisConfig } from "../types/config.js";
import { DEFAULT_RESEARCH_CATEGORIES } from "../types/config.js";

export function createTestConfig(vaultPath?: string): LumisConfig {
  const vault = vaultPath ?? mkdtempSync(join(tmpdir(), "lumis-test-"));
  return {
    vaultPath: vault,
    anthropicApiKey: "test-key",
    paths: { ...DEFAULT_PATHS },
    researchCategories: DEFAULT_RESEARCH_CATEGORIES,
  };
}

export function writeTestFile(dir: string, filename: string, content: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), content, "utf-8");
}
