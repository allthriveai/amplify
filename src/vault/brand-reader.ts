import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import { resolveBrandPath, resolveBrandInspirationDir } from "./paths.js";

/** Read Brand.md content, or null if it doesn't exist */
export function readBrand(config: LumisConfig): string | null {
  const brandPath = resolveBrandPath(config);
  if (!existsSync(brandPath)) return null;
  return readFileSync(brandPath, "utf-8");
}

/** Read all .md files from Brand/Inspiration/, returns array of { filename, content } */
export function readBrandInspirations(config: LumisConfig): { filename: string; content: string }[] {
  const dir = resolveBrandInspirationDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => ({
      filename,
      content: readFileSync(join(dir, filename), "utf-8"),
    }));
}
