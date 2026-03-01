import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { TimelineFrontmatter } from "../types/director.js";
import { resolveStoryDir } from "./paths.js";
import { serializeFrontmatter } from "./frontmatter.js";

/** Write a timeline.md to a story folder */
export function writeTimeline(
  config: LumisConfig,
  slug: string,
  frontmatter: TimelineFrontmatter,
  content: string,
): string {
  const dir = resolveStoryDir(config, slug);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, "timeline.md");
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}
