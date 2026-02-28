import type { ResearchCategory } from "./research.js";
import type { StudioConfig } from "./studio.js";

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
    /** Where persuasion triggers are stored. Default: "Lumis/Amplify/Triggers" */
    amplifyTriggers: string;
    /** Where the hooks file lives. Default: "Lumis/Amplify" */
    amplifyHooks: string;
    /** Where the prompts file lives. Default: "Lumis/Amplify" */
    amplifyPrompts: string;
    /** Where platform scripts are stored. Default: "Lumis/Scripts" */
    scripts: string;
    /** Where finished studio outputs go. Default: "Lumis/Studio/Outputs" */
    studioOutputs: string;
    /** Where strategy docs live. Default: "2 - Areas/All Thrive" */
    strategyDocs: string;
  };

  /** Categories for auto-classifying research notes */
  researchCategories: ResearchCategory[];

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
  amplifyTriggers: "Lumis/Amplify/Triggers",
  amplifyHooks: "Lumis/Amplify",
  amplifyPrompts: "Lumis/Amplify",
  scripts: "Lumis/Scripts",
  studioOutputs: "Lumis/Studio/Outputs",
  strategyDocs: "2 - Areas/All Thrive",
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
