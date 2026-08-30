import type { StudioConfig } from "./studio.js";
import type { BrandConfig } from "./brand.js";

export interface CaptureHotkeys {
  /** OBS key for Start Recording. Default: OBS_KEY_F9 */
  startRecording?: string;
  /** OBS key for Stop Recording. Default: OBS_KEY_F10 */
  stopRecording?: string;
  /** OBS key for Screen + Camera scene. Default: OBS_KEY_F5 */
  sceneScreenCamera?: string;
  /** OBS key for Screen Only scene. Default: OBS_KEY_F6 */
  sceneScreenOnly?: string;
  /** OBS key for Camera Only scene. Default: OBS_KEY_F7 */
  sceneCameraOnly?: string;
}

export interface CaptureConfig {
  /** OBS WebSocket URL. Default: ws://localhost:4455 */
  obsWebsocketUrl?: string;
  /** OBS WebSocket password (if set in OBS settings) */
  obsWebsocketPassword?: string;
  /** Default scene to switch to on capture start */
  defaultScene?: string;
  /** Keyboard shortcuts for OBS actions */
  hotkeys?: CaptureHotkeys;
}

export interface AmplifyConfig {
  /** Absolute path to the Obsidian vault root */
  vaultPath: string;

  /** Anthropic API key for moment analysis */
  anthropicApiKey: string;

  /** Configurable paths within the vault (relative to vaultPath) */
  paths: {
    /** Where developed stories are stored. Default: "Work/Stories" */
    stories: string;
    /** Raw source layer. Immutable: read, never rewritten. Default: "Sources" */
    sources: string;
    /** LLM-maintained wiki layer. Fully agent-owned. Default: "Wiki" */
    wiki: string;
    /** Where content structures are stored. Default: "Amplify/Structures" */
    amplifyStructures: string;
    /** Where hook type files are stored. Default: "Amplify/Hooks" */
    amplifyHooks: string;
    /** Where the persuasion glossary lives. Default: "Amplify" */
    amplifyPersuasion: string;
    /** Where strategy docs live. Default: "Work/Strategy" */
    strategyDocs: string;
    /** Your voice/identity file. Default: "Amplify/Voice.md" */
    voice: string;
    /** Where signals are stored. Default: "Amplify/Signals" */
    signals: string;
    /** Where memory (sessions + preferences) lives. Default: "Amplify/Memory" */
    memory: string;
    /** Where entity pages (people, orgs, tools) live. Default: "Wiki/Entities" */
    people: string;
    /** Where brand guidelines and inspiration live. Default: "Amplify/Brand" */
    brand: string;
    /** Where audio narrations are stored. Default: "Sources/Audio" */
    audio: string;
    /** Where meeting notes are stored. Default: "Sources/Meetings" */
    meetings: string;
  };

  /** Optional brand config for visual identity (active/default brand) */
  brand?: BrandConfig;

  /** Named brand profiles for multi-brand support (e.g. "work", "personal") */
  brandProfiles?: Record<string, BrandConfig>;

  /** Optional studio config for video production (HeyGen, ElevenLabs) */
  studio?: StudioConfig;

  /** Optional capture config for OBS integration */
  capture?: CaptureConfig;
}

export const DEFAULT_PATHS: AmplifyConfig["paths"] = {
  stories: "Work/Stories",
  sources: "Sources",
  wiki: "Wiki",
  amplifyStructures: "Amplify/Structures",
  amplifyHooks: "Amplify/Hooks",
  amplifyPersuasion: "Amplify",
  strategyDocs: "Work/Strategy",
  voice: "Amplify/Voice.md",
  signals: "Amplify/Signals",
  memory: "Amplify/Memory",
  people: "Wiki/Entities",
  brand: "Amplify/Brand",
  audio: "Sources/Audio",
  meetings: "Sources/Meetings",
};
