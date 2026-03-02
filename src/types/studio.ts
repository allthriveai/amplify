export type Platform = "linkedin" | "x" | "youtube";

export interface StudioConfig {
  heygenApiKey?: string;
  heygenAvatarId?: string;
  /** Voice ID within HeyGen's system (use /v2/voices to list). */
  heygenVoiceId?: string;
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
  googleApiKey?: string;
}
