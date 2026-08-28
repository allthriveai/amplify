/**
 * The source layer: raw, immutable captures. The agent reads these and never
 * rewrites them. Everything in the wiki is distilled from here.
 */

export type SourceResourceType =
  | "article"
  | "paper"
  | "guide"
  | "video"
  | "book"
  | "tool"
  | "course"
  | "podcast"
  | "documentation"
  | "meeting";

/**
 * Frontmatter on a raw clipping. Unchanged from the shape the previous research
 * notes used, so the 90 existing clippings stay valid without a rewrite.
 */
export interface ClippingFrontmatter {
  title: string;
  source: string;
  author: string;
  published: string;
  created: string;
  tags: string[];
}

export interface Clipping {
  /** Filename without path */
  filename: string;
  /** Full path relative to vault root */
  path: string;
  frontmatter: ClippingFrontmatter;
  /** Raw markdown content (without frontmatter) */
  content: string;
}
