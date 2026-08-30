import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { DEFAULT_PATHS, type AmplifyConfig } from "../types/config.js";

export function createTestConfig(vaultPath?: string): AmplifyConfig {
  const vault = vaultPath ?? mkdtempSync(join(tmpdir(), "amplify-test-"));
  return {
    vaultPath: vault,
    anthropicApiKey: "test-key",
    paths: { ...DEFAULT_PATHS },
  };
}

export function writeTestFile(dir: string, filename: string, content: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), content, "utf-8");
}
