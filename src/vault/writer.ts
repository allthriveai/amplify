import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { MomentFrontmatter } from "../types/moment.js";
import type { CanvasFile } from "../types/canvas.js";
import { resolveMomentsDir, resolveCanvasPath } from "./paths.js";
import { serializeFrontmatter } from "./frontmatter.js";

/** Write a moment file to the vault */
export function writeMoment(
  config: LumisConfig,
  filename: string,
  frontmatter: MomentFrontmatter,
  content: string,
): string {
  const dir = resolveMomentsDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write the pattern map canvas JSON */
export function writeCanvas(config: LumisConfig, canvas: CanvasFile): string {
  const filepath = resolveCanvasPath(config);
  mkdirSync(dirname(filepath), { recursive: true });

  writeFileSync(filepath, JSON.stringify(canvas, null, 2), "utf-8");
  return filepath;
}
