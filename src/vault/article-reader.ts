import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Article, ArticleFrontmatter } from "../types/director.js";
import { resolveStoryDir, resolveStoriesDir } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read the most recent article from a story folder by slug */
export function readArticle(config: LumisConfig, slug: string): Article | null {
  const storyDir = resolveStoryDir(config, slug);
  if (!existsSync(storyDir)) return null;

  const files = readdirSync(storyDir).filter(
    (f) => f.startsWith("article-") && f.endsWith(".md"),
  );
  if (files.length === 0) return null;

  const filename = files.sort().pop()!;
  const filepath = join(storyDir, filename);

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<ArticleFrontmatter>(raw);

  return {
    filename,
    path: join(config.paths.stories, slug, filename),
    frontmatter,
    content,
  };
}

/** List all story slugs that have an article */
export function listArticles(config: LumisConfig): string[] {
  const storiesDir = resolveStoriesDir(config);
  if (!existsSync(storiesDir)) return [];

  return readdirSync(storiesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => {
      const files = readdirSync(join(storiesDir, d.name));
      return files.some((f) => f.startsWith("article-") && f.endsWith(".md"));
    })
    .map((d) => d.name);
}
