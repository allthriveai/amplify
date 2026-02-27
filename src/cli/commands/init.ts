import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { DEFAULT_PATHS } from "../../types/config.js";

/** `lumis init [path]` — set up Lumis in a vault */
export async function initCommand(targetPath?: string): Promise<void> {
  const vaultPath = resolve(targetPath ?? process.cwd());
  const isExistingVault = existsSync(join(vaultPath, ".obsidian"));

  console.log(
    isExistingVault
      ? `Found existing vault at ${vaultPath}`
      : `Creating new vault at ${vaultPath}`,
  );

  // TODO: Create directories, write .lumisrc, scaffold README files
  // TODO: Create empty Pattern Map canvas
  // TODO: If new vault, create .obsidian/ directory
  console.log("Init not yet implemented — coming in a future session.");
}
