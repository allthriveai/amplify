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
  };
}

export const DEFAULT_PATHS: LumisConfig["paths"] = {
  moments: "Lumis/Moments",
  stories: "Lumis/Stories",
  canvas: "Lumis/Pattern Map.canvas",
  dailyNotes: "Daily Notes",
  dailyNoteFormat: "YYYY-MM-DD",
};
