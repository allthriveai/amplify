// Types
export type {
  Moment,
  MomentFrontmatter,
  MomentAnalysis,
  MomentConnection,
  MomentType,
  StoryPotential,
  StoryStatus,
} from "./types/moment.js";

export type {
  CanvasFile,
  CanvasNode,
  GroupNode,
  FileNode,
  CanvasEdge,
  CanvasColor,
} from "./types/canvas.js";

export type { LumisConfig } from "./types/config.js";
export { DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "./types/config.js";
export { THEME_COLORS } from "./types/canvas.js";

export type {
  ResearchResourceType,
  ResearchFrontmatter,
  TldrFrontmatter,
  ResearchNote,
  ResearchCategory,
} from "./types/research.js";

export type {
  AmplifyType,
  StructureFrontmatter,
  Structure,
  TriggerFrontmatter,
  Trigger,
  HooksFrontmatter,
  Hook,
  HooksCollection,
  PromptsFrontmatter,
  Prompt,
  PromptsCollection,
  AmplifyManifest,
  ManifestStructure,
  ManifestTrigger,
} from "./types/amplify.js";

// Modules
export { loadConfig } from "./config.js";
export { analyzeMoment, humanize } from "./ai/index.js";
export {
  readMoments,
  writeMoment,
  readCanvas,
  writeCanvas,
  readResearchNotes,
  writeResearchNote,
  writeTldrNote,
  readStructures,
  readTriggers,
  readHooks,
  readPrompts,
  writeStructure,
  writeTrigger,
  writeHooksCollection,
  writePromptsCollection,
} from "./vault/index.js";
export { generatePatternMap } from "./canvas/index.js";
export { captureMoment } from "./pipeline/capture.js";
export { buildAmplifyContext, serializeAmplifyContext } from "./amplify/index.js";
export type { AmplifyContext } from "./amplify/index.js";
