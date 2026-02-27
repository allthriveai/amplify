export type MomentType =
  | "realization"
  | "decision"
  | "transformation"
  | "loss"
  | "connection"
  | "conflict"
  | "joy"
  | "fear"
  | "vulnerability"
  | "gratitude";

export type StoryPotential = "high" | "medium" | "low";

export type StoryStatus = "captured" | "exploring" | "developing" | "told";

export interface MomentFrontmatter {
  date: string;
  "moment-type": MomentType;
  people: string[];
  places: string[];
  "story-status": StoryStatus;
  "story-potential": StoryPotential;
  themes: string[];
  tags: string[];
}

export interface Moment {
  /** Filename without path */
  filename: string;
  /** Full path relative to vault root */
  path: string;
  /** Parsed frontmatter */
  frontmatter: MomentFrontmatter;
  /** Raw markdown content (without frontmatter) */
  content: string;
  /** The 5-second moment text, if found */
  fiveSecondMoment?: string;
  /** Connected moment paths extracted from the Connections section */
  connections: string[];
}

export interface MomentAnalysis {
  title: string;
  description: string;
  fiveSecondMoment: string;
  momentType: MomentType;
  people: string[];
  places: string[];
  themes: string[];
  storyPotential: StoryPotential;
  storyPotentialReason: string;
  connections: MomentConnection[];
}

export interface MomentConnection {
  /** Path to the connected moment */
  momentPath: string;
  /** Why this connection matters */
  reason: string;
}
