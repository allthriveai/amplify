import type { ResearchCategory } from "./research.js";
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
    /** Where moment notes are stored. Default: "Lumis/Moments" */
    moments: string;
    /** Where developed stories are stored. Default: "Lumis/Stories" */
    stories: string;
    /** Path to the pattern map canvas. Default: "Lumis/Pattern Map.canvas" */
    canvas: string;
    /** Where daily notes live. Default: "Daily Notes" */
    dailyNotes: string;
    /** Date format for daily notes. Default: "YYYY-MM-DD" */
    dailyNoteFormat: string;
    /** Where research notes are stored. Default: "Lumis/Research" */
    research: string;
    /** Where TL;DR companion notes are stored. Default: "Lumis/Research/TL;DR" */
    researchTldr: string;
    /** Where content structures are stored. Default: "Lumis/Amplify/Structures" */
    amplifyStructures: string;
    /** Where hook type files are stored. Default: "Lumis/Amplify/Hooks" */
    amplifyHooks: string;
    /** Where the persuasion glossary lives. Default: "Lumis/Amplify" */
    amplifyPersuasion: string;
    /** Where strategy docs live. Default: "2 - Areas/All Thrive" */
    strategyDocs: string;
    /** Your voice/identity file. Default: "Lumis/Voice.md" */
    voice: string;
    /** Where signals are stored. Default: "Lumis/Signals" */
    signals: string;
    /** Where memory (sessions + preferences) lives. Default: "Lumis/Memory" */
    memory: string;
    /** Where people/inspiration notes are stored. Default: "Lumis/People Who Inspire Me" */
    people: string;
    /** Where challenge logs and promoted challenge notes are stored. Default: "Lumis/Challenges" */
    challenges: string;
    /** Where brand guidelines and inspiration live. Default: "Brand" */
    brand: string;
    /** Where audio narrations are stored. Default: "3 - Resources/Research/Audio" */
    audio: string;
  };

  /** Categories for auto-classifying research notes */
  researchCategories: ResearchCategory[];

  /** Optional brand config for visual identity */
  brand?: BrandConfig;

  /** Optional studio config for video production (HeyGen, ElevenLabs) */
  studio?: StudioConfig;

  /** Optional capture config for OBS integration */
  capture?: CaptureConfig;
}

export const DEFAULT_PATHS: LumisConfig["paths"] = {
  moments: "Moments",
  stories: "Stories",
  canvas: "Lumis/Pattern Map.canvas",
  dailyNotes: "Daily Notes",
  dailyNoteFormat: "YYYY-MM-DD",
  research: "Research",
  researchTldr: "Research/TL;DR",
  amplifyStructures: "Lumis/Amplify/Structures",
  amplifyHooks: "Lumis/Amplify/Hooks",
  amplifyPersuasion: "Lumis/Amplify",
  strategyDocs: "Strategy",
  voice: "Lumis/Voice.md",
  signals: "Lumis/Signals",
  memory: "Lumis/Memory",
  people: "People",
  challenges: "Challenges",
  brand: "Lumis/Brand",
  audio: "Research/Audio",
};

export const DEFAULT_RESEARCH_CATEGORIES: ResearchCategory[] = [];
