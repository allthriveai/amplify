// ---------------------------------------------------------------------------
// Director types — shot-by-shot video production from stories
// ---------------------------------------------------------------------------

export type StoryBeat =
  | "hook"
  | "intro"
  | "setup"
  | "tension"
  | "five-second-moment"
  | "transformation"
  | "takeaway"
  | "cta"
  | "b-roll"
  | "outro";

export type ShotType =
  | "avatar"
  | "text-card"
  | "b-roll-placeholder"
  | "branded-intro"
  | "branded-outro";

export type TextCardType = "stat" | "quote" | "contrast" | "list" | "statement";

export type TimelineStatus = "draft" | "approved" | "producing" | "rendered";

export interface Shot {
  id: number;
  beat: StoryBeat;
  shotType: ShotType;
  duration: number;
  script?: string;
  direction?: string;
  textCardType?: TextCardType;
}

export interface TimelineFrontmatter {
  title: string;
  type: "timeline";
  status: TimelineStatus;
  source: string;
  hook: string;
  structure: string;
  persuasion: string[];
  platform: string;
  targetDuration: number;
  shots: Shot[];
}

export interface Timeline {
  /** Filename (timeline.md) */
  filename: string;
  /** Path relative to vault root */
  path: string;
  /** Parsed frontmatter including shots */
  frontmatter: TimelineFrontmatter;
  /** Markdown content below frontmatter (director's notes) */
  content: string;
}

export interface ResolvedShot extends Shot {
  durationInFrames: number;
  startFrame: number;
  videoSrc?: string;
  textCard?: { type: TextCardType; lines: string[] };
}
