export type Platform = "linkedin" | "x" | "youtube";
export type ScriptStatus = "draft" | "ready" | "rendering" | "published";

export interface ScriptFrontmatter {
  title: string;
  type: "script";
  platform: Platform[];
  pillar: string;
  /** Wiki-link to source moment/story/learning */
  source: string;
  structure: string;
  status: ScriptStatus;
  created: string;
  tags: string[];
}

export interface Script {
  filename: string;
  path: string;
  frontmatter: ScriptFrontmatter;
  content: string;
}

export interface StudioConfig {
  heygenApiKey?: string;
  heygenAvatarId?: string;
  /** Voice ID within HeyGen's system (use /v2/voices to list). */
  heygenVoiceId?: string;
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
}
