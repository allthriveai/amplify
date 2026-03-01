export type AmplifyType = "structure" | "hook";

// --- Structures (content frameworks with embedded triggers) ---

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

// --- Hooks (scroll-stopping openers, individual files by type) ---

export interface HookFrontmatter {
  title: string;
  type: "amplify-hook";
  created: string;
}

export interface Hook {
  filename: string;
  path: string;
  frontmatter: HookFrontmatter;
  content: string;
}

// --- Manifest (lives in vault, not repo) ---

export interface AmplifyManifest {
  structures: ManifestStructure[];
  hooks: string[];
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
