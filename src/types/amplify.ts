export type AmplifyType = "structure" | "trigger" | "hook" | "prompt";

// --- Structures (content frameworks) ---

export interface StructureFrontmatter {
  title: string;
  type: "structure";
  created: string;
  tags: string[];
  category: string;
  source: string;
  pdfUrl?: string;
  videoUrl?: string;
  docUrl?: string;
}

export interface Structure {
  filename: string;
  path: string;
  frontmatter: StructureFrontmatter;
  content: string;
  insights: string[];
  takeaways: string[];
  actions: string[];
}

// --- Triggers (persuasion patterns) ---

export interface TriggerFrontmatter {
  title: string;
  type: "trigger";
  created: string;
  tags: string[];
  source: string;
}

export interface Trigger {
  filename: string;
  path: string;
  frontmatter: TriggerFrontmatter;
  content: string;
}

// --- Hooks (scroll-stopping openers) ---

export interface HooksFrontmatter {
  title: string;
  type: "hook";
  created: string;
  tags: string[];
  source: string;
  count: number;
}

export interface Hook {
  index: number;
  template: string;
}

export interface HooksCollection {
  filename: string;
  path: string;
  frontmatter: HooksFrontmatter;
  hooks: Hook[];
}

// --- Prompts (content idea generators) ---

export interface PromptsFrontmatter {
  title: string;
  type: "prompt";
  created: string;
  tags: string[];
  source: string;
  count: number;
}

export interface Prompt {
  index: number;
  prompt: string;
}

export interface PromptsCollection {
  filename: string;
  path: string;
  frontmatter: PromptsFrontmatter;
  prompts: Prompt[];
}

// --- Manifest (lives in vault, not repo) ---

export interface AmplifyManifest {
  structures: ManifestStructure[];
  triggers: ManifestTrigger[];
  hooks: string[];
  prompts: string[];
}

export interface ManifestStructure {
  title: string;
  category: string;
  summary: string;
  insights: string[];
  takeaways: string[];
  actions: string[];
  pdfFile?: string;
}

export interface ManifestTrigger {
  name: string;
  description: string;
}
