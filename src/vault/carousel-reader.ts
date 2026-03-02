import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Carousel, CarouselFrontmatter } from "../types/director.js";
import { resolveStoryDir, resolveStoriesDir } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read the most recent carousel from a story folder by slug */
export function readCarousel(config: LumisConfig, slug: string): Carousel | null {
  const storyDir = resolveStoryDir(config, slug);
  if (!existsSync(storyDir)) return null;

  const files = readdirSync(storyDir).filter(
    (f) => f.startsWith("carousel-") && f.endsWith(".md"),
  );
  if (files.length === 0) return null;

  const filename = files.sort().pop()!;
  const filepath = join(storyDir, filename);

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<CarouselFrontmatter>(raw);

  return {
    filename,
    path: join(config.paths.stories, slug, filename),
    frontmatter,
    content,
  };
}

/** List all story slugs that have a carousel */
export function listCarousels(config: LumisConfig): string[] {
  const storiesDir = resolveStoriesDir(config);
  if (!existsSync(storiesDir)) return [];

  return readdirSync(storiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => {
      const files = readdirSync(join(storiesDir, d.name));
      return files.some((f) => f.startsWith("carousel-") && f.endsWith(".md"));
    })
    .map((d) => d.name);
}
