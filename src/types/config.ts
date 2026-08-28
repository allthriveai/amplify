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

export interface LumisConfig {
  /** Absolute path to the Obsidian vault root */
  vaultPath: string;

  /** Anthropic API key for moment analysis */
  anthropicApiKey: string;

  /** Configurable paths within the vault (relative to vaultPath) */
  paths: {
    /** Where moment notes are stored. Default: "Life/Moments" */
    moments: string;
    /** Where developed stories are stored. Default: "Work/Stories" */
    stories: string;
    /** Path to the pattern map canvas. Default: "Lumis/Pattern Map.canvas" */
    canvas: string;
    /** Where daily notes live. Default: "Life/Journal" */
    dailyNotes: string;
    /** Date format for daily notes. Default: "YYYY-MM-DD" */
    dailyNoteFormat: string;
    /** Raw source layer. Immutable: read, never rewritten. Default: "Sources" */
    sources: string;
    /** LLM-maintained wiki layer. Fully agent-owned. Default: "Wiki" */
    wiki: string;
    /** Where content structures are stored. Default: "Lumis/Amplify/Structures" */
    amplifyStructures: string;
    /** Where hook type files are stored. Default: "Lumis/Amplify/Hooks" */
    amplifyHooks: string;
    /** Where the persuasion glossary lives. Default: "Lumis/Amplify" */
    amplifyPersuasion: string;
    /** Where strategy docs live. Default: "Work/Strategy" */
    strategyDocs: string;
    /** Your voice/identity file. Default: "Lumis/Voice.md" */
    voice: string;
    /** Where signals are stored. Default: "Lumis/Signals" */
    signals: string;
    /** Where memory (sessions + preferences) lives. Default: "Lumis/Memory" */
    memory: string;
    /** Where entity pages (people, orgs, tools) live. Default: "Wiki/Entities" */
    people: string;
    /** Where challenge logs and promoted challenge notes are stored. Default: "Life/Challenges" */
    challenges: string;
    /** Where brand guidelines and inspiration live. Default: "Lumis/Brand" */
    brand: string;
    /** Where audio narrations are stored. Default: "Sources/Audio" */
    audio: string;
    /** Your goals/north star file. Default: "Lumis/Goals.md" */
    goals: string;
    /** Where meeting notes are stored. Default: "Sources/Meetings" */
    meetings: string;
    /** Where weekly reviews are stored. Default: "Life/Reviews" */
    reviews: string;
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

export const DEFAULT_PATHS: LumisConfig["paths"] = {
  moments: "Life/Moments",
  stories: "Work/Stories",
  canvas: "Lumis/Pattern Map.canvas",
  dailyNotes: "Life/Journal",
  dailyNoteFormat: "YYYY-MM-DD",
  sources: "Sources",
  wiki: "Wiki",
  amplifyStructures: "Lumis/Amplify/Structures",
  amplifyHooks: "Lumis/Amplify/Hooks",
  amplifyPersuasion: "Lumis/Amplify",
  strategyDocs: "Work/Strategy",
  voice: "Lumis/Voice.md",
  signals: "Lumis/Signals",
  memory: "Lumis/Memory",
  people: "Wiki/Entities",
  challenges: "Life/Challenges",
  brand: "Lumis/Brand",
  audio: "Sources/Audio",
  goals: "Lumis/Goals.md",
  meetings: "Sources/Meetings",
  reviews: "Life/Reviews",
};
