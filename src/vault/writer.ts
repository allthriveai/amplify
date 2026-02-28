import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { MomentFrontmatter } from "../types/moment.js";
import type { ResearchFrontmatter, TldrFrontmatter, ResearchCategory } from "../types/research.js";
import type { CanvasFile } from "../types/canvas.js";
import { resolveMomentsDir, resolveCanvasPath, resolveResearchDir, resolveTldrDir, resolveResearchCategoryDir } from "./paths.js";
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

/** Write a research note to the vault, optionally into a category subfolder */
export function writeResearchNote(
  config: LumisConfig,
  filename: string,
  frontmatter: ResearchFrontmatter,
  content: string,
  category?: ResearchCategory,
): string {
  const dir = category
    ? resolveResearchCategoryDir(config, category)
    : resolveResearchDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write a TL;DR companion note to the central TL;DR folder */
export function writeTldrNote(
  config: LumisConfig,
  filename: string,
  frontmatter: TldrFrontmatter,
  content: string,
): string {
  const dir = resolveTldrDir(config);
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
