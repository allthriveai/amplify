import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Timeline, TimelineFrontmatter } from "../types/director.js";
import { resolveTimelinePath, resolveStoriesDir } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read a timeline from a story folder by slug */
export function readTimeline(config: LumisConfig, slug: string): Timeline | null {
  const filepath = resolveTimelinePath(config, slug);
  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<TimelineFrontmatter>(raw);

  return {
    filename: "timeline.md",
    path: join(config.paths.stories, slug, "timeline.md"),
    frontmatter,
    content,
  };
}

/** List all story slugs that have a timeline.md */
export function listTimelines(config: LumisConfig): string[] {
  const storiesDir = resolveStoriesDir(config);
  if (!existsSync(storiesDir)) return [];

  return readdirSync(storiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => existsSync(join(storiesDir, d.name, "timeline.md")))
    .map((d) => d.name);
}
