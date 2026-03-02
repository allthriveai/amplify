// ---------------------------------------------------------------------------
// Director types — shot-by-shot video production from stories
// ---------------------------------------------------------------------------

export type StoryBeat = string;

export type ShotType =
  | "avatar"
  | "text-card"
  | "screen-capture"
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
  text?: string;
  asset?: string;
  voiceover?: string;
  voiceoverSource?: string;
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
  creativeBrief?: {
    hookExplored: boolean;
    mediaAssets: string[];
    cta: string;
    platformTarget: string;
    productionPlan?: boolean;
  };
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

export type TransitionType = 'fade' | 'slide' | 'wipe' | 'light-leak' | 'none';

export interface TransitionConfig {
  type: TransitionType;
  durationInFrames: number;
}

export interface ResolvedShot extends Shot {
  durationInFrames: number;
  startFrame: number;
  videoSrc?: string;
  audioSrc?: string;
  imageSrc?: string;
  isVideo?: boolean;
  textCard?: { type: TextCardType; lines: string[] };
  transitionIn?: TransitionConfig;
}
