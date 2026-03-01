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
  SignalType,
  Signal,
  SignalsFile,
  MomentCapturedSignal,
  LearningExtractedSignal,
  ScriptDraftedSignal,
  RecommendationRejectedSignal,
  ContentPostedSignal,
  EngagementUpdatedSignal,
  ClusterFormedSignal,
  StoryDevelopedSignal,
  StoryPracticeSignal,
  TimelineCreatedSignal,
  VideoRenderedSignal,
} from "./types/signal.js";

export type { SessionEntry } from "./types/memory.js";

export type {
  CraftStatus,
  StoryElement,
  StoryElements,
  StoryFrontmatter,
  Story,
} from "./types/story.js";

export type {
  Platform,
  ScriptStatus,
  ScriptFrontmatter,
  Script,
  StudioConfig,
} from "./types/studio.js";

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
  HookFrontmatter,
  Hook,
  AmplifyManifest,
  ManifestStructure,
} from "./types/amplify.js";

export type {
  StoryBeat,
  ShotType,
  TextCardType,
  TimelineStatus,
  Shot,
  TimelineFrontmatter,
  Timeline,
  ResolvedShot,
} from "./types/director.js";

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
  readHooks,
  readPersuasionGlossary,
  writeStructure,
  writeHook,
  readStories,
  readStory,
  writeStory,
  appendPracticeLog,
  readTimeline,
  listTimelines,
  writeTimeline,
} from "./vault/index.js";
export { generatePatternMap } from "./canvas/index.js";
export { captureMoment } from "./pipeline/capture.js";
export { buildAmplifyContext, serializeAmplifyContext } from "./amplify/index.js";
export type { AmplifyContext } from "./amplify/index.js";

// Studio
export {
  createHeyGenClient,
  createElevenLabsClient,
  renderVideo,
  renderDirectorCut,
  previewVideo,
  produceVideo,
  produceTimeline,
} from "./studio/index.js";
export type { HeyGenClient } from "./studio/index.js";
export type { ElevenLabsClient } from "./studio/index.js";
export type { RenderProps, DirectorCutRenderProps } from "./studio/index.js";
export {
  resolveScriptsDir,
  resolveStudioOutputsDir,
  resolveStrategyDocsDir,
  resolveVoicePath,
  resolveSignalsDir,
  resolveSignalsPath,
  resolveMemoryDir,
  resolveSessionPath,
  resolvePreferencesPath,
  resolveStoriesDir,
  resolvePracticeLogPath,
  resolveStoryDir,
  resolveTimelinePath,
} from "./vault/index.js";

// Signals
export { readSignals, readRecentSignals, emitSignal, signalId, summarizeSignals } from "./vault/index.js";

// Memory
export { formatSessionTime, appendSessionEntry, readSession, readRecentSessions, readPreferences, addPreference } from "./vault/index.js";
