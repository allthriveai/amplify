import { Config } from "@remotion/cli/config";
import path from "path";
import { readFileSync } from "fs";

Config.setEntryPoint("src/studio/compositions/index.tsx");
Config.setPublicDir(path.resolve("public"));

// Default render output to the vault's Stories folder
// Renders belong in the vault, never in this repo. Without a configured vault
// Remotion keeps its own default; nothing personal is written here either way.
try {
  const vaultRoot = process.env.VAULT_PATH ?? process.cwd();
  const rc = JSON.parse(readFileSync(path.resolve(vaultRoot, ".amplifyrc"), "utf-8"));
  const vaultPath = rc.vaultPath ?? vaultRoot;
  const storiesDir = path.resolve(vaultPath, rc.paths?.stories ?? "Stories");
  Config.setOutputLocation(path.join(storiesDir, "renders"));
} catch {
  // No .amplifyrc reachable — leave Remotion's default output location alone
}
