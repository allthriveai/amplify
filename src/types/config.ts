import type { ResearchCategory } from "./research.js";
import type { StudioConfig } from "./studio.js";
import type { BrandConfig } from "./brand.js";

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
    /** Where lessons learned are stored. Default: "Lumis/Learnings" */
    learnings: string;
    /** Where content structures are stored. Default: "Lumis/Amplify/Structures" */
    amplifyStructures: string;
    /** Where hook type files are stored. Default: "Lumis/Amplify/Hooks" */
    amplifyHooks: string;
    /** Where the persuasion glossary lives. Default: "Lumis/Amplify" */
    amplifyPersuasion: string;
    /** Where finished studio outputs go. Default: "Lumis/Studio/Outputs" */
    studioOutputs: string;
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
    /** Where promoted challenge/thinking notes are stored. Default: "2 - Areas/Personal/Thinking" */
    thinking: string;
    /** Where brand guidelines and inspiration live. Default: "Brand" */
    brand: string;
  };

  /** Categories for auto-classifying research notes */
  researchCategories: ResearchCategory[];

  /** Optional brand config for visual identity */
  brand?: BrandConfig;

  /** Optional studio config for video production (HeyGen, ElevenLabs) */
  studio?: StudioConfig;
}

export const DEFAULT_PATHS: LumisConfig["paths"] = {
  moments: "Lumis/Moments",
  stories: "Lumis/Stories",
  canvas: "Lumis/Pattern Map.canvas",
  dailyNotes: "Daily Notes",
  dailyNoteFormat: "YYYY-MM-DD",
  research: "Lumis/Research",
  researchTldr: "Lumis/Research/TL;DR",
  learnings: "Lumis/Learnings",
  amplifyStructures: "Lumis/Amplify/Structures",
  amplifyHooks: "Lumis/Amplify/Hooks",
  amplifyPersuasion: "Lumis/Amplify",
  studioOutputs: "Lumis/Studio/Outputs",
  strategyDocs: "2 - Areas/All Thrive",
  voice: "Lumis/Voice.md",
  signals: "Lumis/Signals",
  memory: "Lumis/Memory",
  people: "2 - Areas/Personal/People Who Inspire Me",
  thinking: "2 - Areas/Personal/Thinking",
  brand: "Brand",
};

export const DEFAULT_RESEARCH_CATEGORIES: ResearchCategory[] = [
  {
    name: "AI & Agents",
    folder: "AI & Agents",
    keywords: ["ai", "agent", "llm", "mcp", "ml", "machine learning", "prompt engineering", "rag", "embedding", "transformer", "gpt", "claude", "neural"],
  },
  {
    name: "Tools & Software",
    folder: "Tools & Software",
    keywords: ["tool", "software", "platform", "app", "framework", "library", "sdk", "api", "saas", "devops", "cli"],
  },
  {
    name: "Books",
    folder: "Books",
    keywords: ["book", "book summary", "book review", "author", "chapter", "reading"],
  },
  {
    name: "Articles",
    folder: "Articles",
    keywords: ["article", "blog", "opinion", "essay", "post", "newsletter"],
  },
  {
    name: "Courses & Learning",
    folder: "Courses & Learning",
    keywords: ["course", "tutorial", "workshop", "training", "certification", "lesson", "curriculum", "mooc"],
  },
];
