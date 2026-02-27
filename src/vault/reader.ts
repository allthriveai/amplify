import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Moment } from "../types/moment.js";
import type { CanvasFile } from "../types/canvas.js";
import { resolveMomentsDir, resolveCanvasPath } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read all moment files from the configured moments directory */
export function readMoments(config: LumisConfig): Moment[] {
  const dir = resolveMomentsDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((filename) => readMoment(config, filename))
    .filter((m): m is Moment => m !== null);
}

/** Read a single moment file by filename */
export function readMoment(config: LumisConfig, filename: string): Moment | null {
  const dir = resolveMomentsDir(config);
  const filepath = join(dir, filename);

  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter(raw);

  // Extract 5-second moment from ## The 5-Second Moment section
  const fiveSecMatch = content.match(
    /## The 5-Second Moment\n+([\s\S]*?)(?=\n## |$)/,
  );

  // Extract connections from wiki-links in ## Connections section
  const connectionsMatch = content.match(
    /## Connections\n+([\s\S]*?)(?=\n## |$)/,
  );
  const connections = connectionsMatch
    ? [...connectionsMatch[1].matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1])
    : [];

  return {
    filename,
    path: join(config.paths.moments, filename),
    frontmatter,
    content,
    fiveSecondMoment: fiveSecMatch?.[1]?.trim(),
    connections,
  };
}

/** Read the pattern map canvas file */
export function readCanvas(config: LumisConfig): CanvasFile | null {
  const path = resolveCanvasPath(config);
  if (!existsSync(path)) return null;

  try {
    return JSON.parse(readFileSync(path, "utf-8")) as CanvasFile;
  } catch {
    return null;
  }
}
