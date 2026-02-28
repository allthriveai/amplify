// ---------------------------------------------------------------------------
// Story types — structured storytelling development from moments
// ---------------------------------------------------------------------------

export type CraftStatus = "drafting" | "workshopped" | "told";

export type StoryElement =
  | "transformation"
  | "five-second-moment"
  | "the-question"
  | "the-stakes"
  | "the-turns"
  | "opening-scene";

export interface StoryElements {
  transformation?: {
    before: string;
    after: string;
    change: string;
  };
  fiveSecondMoment?: string;
  theQuestion?: string;
  openingScene?: string;
  theStakes?: string;
  theTurns?: string[];
  theStory?: string;
}

export interface StoryFrontmatter {
  title: string;
  type: "story";
  source: string;
  created: string;
  "craft-status": CraftStatus;
  themes: string[];
  tags: string[];
}

export interface Story {
  /** Filename without path */
  filename: string;
  /** Full path relative to vault root */
  path: string;
  /** Parsed frontmatter */
  frontmatter: StoryFrontmatter;
  /** Raw markdown content (without frontmatter) */
  content: string;
  /** Parsed story elements */
  elements: StoryElements;
}
