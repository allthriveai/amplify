export type ResearchResourceType =
  | "article"
  | "paper"
  | "guide"
  | "video"
  | "book"
  | "tool"
  | "course"
  | "podcast"
  | "documentation";

export interface ResearchFrontmatter {
  title: string;
  source: string;
  author: string;
  published: string;
  created: string;
  tags: string[];
}

export interface TldrFrontmatter {
  title: string;
  source: string;
  parent: string;
  created: string;
  tags: string[];
}

export interface ResearchNote {
  /** Filename without path */
  filename: string;
  /** Full path relative to vault root */
  path: string;
  /** Parsed frontmatter */
  frontmatter: ResearchFrontmatter;
  /** Raw markdown content (without frontmatter) */
  content: string;
}

export interface ResearchCategory {
  /** Display name for this category */
  name: string;
  /** Subfolder under the research root */
  folder: string;
  /** Keywords used for auto-categorization */
  keywords: string[];
}
