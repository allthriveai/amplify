import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Timeline, TimelineFrontmatter } from "../types/director.js";
import { resolveStoryDir, resolveStoriesDir } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read the most recent video timeline from a story folder by slug */
export function readTimeline(config: LumisConfig, slug: string): Timeline | null {
  const storyDir = resolveStoryDir(config, slug);
  if (!existsSync(storyDir)) return null;

  // Find video timeline files (new convention: video-*.md, legacy: timeline.md)
  const files = readdirSync(storyDir).filter(
    (f) => (f.startsWith("video-") && f.endsWith(".md")) || f === "timeline.md",
  );
  if (files.length === 0) return null;

  // Prefer newest video-*.md, fall back to timeline.md
  const filename = files.filter((f) => f.startsWith("video-")).sort().pop() ?? "timeline.md";
  const filepath = join(storyDir, filename);
  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<TimelineFrontmatter>(raw);

  return {
    filename,
    path: join(config.paths.stories, slug, filename),
    frontmatter,
    content,
  };
}

/** List all story slugs that have a video timeline */
export function listTimelines(config: LumisConfig): string[] {
  const storiesDir = resolveStoriesDir(config);
  if (!existsSync(storiesDir)) return [];

  return readdirSync(storiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => {
      const files = readdirSync(join(storiesDir, d.name));
      return files.some((f) => (f.startsWith("video-") && f.endsWith(".md")) || f === "timeline.md");
    })
    .map((d) => d.name);
}
