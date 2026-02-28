import matter from "gray-matter";

/** Parse YAML frontmatter and content from a markdown string */
export function parseFrontmatter<T = Record<string, unknown>>(markdown: string): {
  frontmatter: T;
  content: string;
} {
  const { data, content } = matter(markdown);
  return {
    frontmatter: data as T,
    content: content.trim(),
  };
}

/** Serialize frontmatter and content back to a markdown string */
export function serializeFrontmatter<T extends object>(
  frontmatter: T,
  content: string,
): string {
  return matter.stringify(content, frontmatter as Record<string, unknown>);
}
