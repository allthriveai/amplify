import matter from "gray-matter";
import type { MomentFrontmatter } from "../types/moment.js";

/** Parse YAML frontmatter and content from a markdown string */
export function parseFrontmatter(markdown: string): {
  frontmatter: MomentFrontmatter;
  content: string;
} {
  const { data, content } = matter(markdown);
  return {
    frontmatter: data as MomentFrontmatter,
    content: content.trim(),
  };
}

/** Serialize frontmatter and content back to a markdown string */
export function serializeFrontmatter(
  frontmatter: MomentFrontmatter,
  content: string,
): string {
  return matter.stringify(content, frontmatter);
}
