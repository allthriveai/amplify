import { Config } from "@remotion/cli/config";
import path from "path";
import { readFileSync } from "fs";

Config.setEntryPoint("src/studio/compositions/index.tsx");
Config.setPublicDir(path.resolve("public"));

// Default render output to the vault's Stories folder
try {
  const rc = JSON.parse(readFileSync(path.resolve(process.env.VAULT_PATH || "/Users/you/Sites/your-vault", ".lumisrc"), "utf-8"));
  const vaultPath = rc.vaultPath || process.env.VAULT_PATH || "/Users/you/Sites/your-vault";
  const storiesDir = path.resolve(vaultPath, rc.paths?.stories || "Stories");
  Config.setOutputLocation(path.join(storiesDir, "renders"));
} catch {
  // Fall back to default if .lumisrc not found
}
