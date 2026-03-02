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

export type { LumisConfig, CaptureConfig, CaptureHotkeys } from "./types/config.js";
export { DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "./types/config.js";

export type { BrandConfig, BrandColors, BrandFonts } from "./types/brand.js";
export { THEME_COLORS } from "./types/canvas.js";

export type {
  SignalType,
  Signal,
  SignalsFile,
  MomentCapturedSignal,
  LearningExtractedSignal,
  RecommendationRejectedSignal,
  ContentPostedSignal,
  EngagementUpdatedSignal,
  ClusterFormedSignal,
  StoryDevelopedSignal,
  StoryPracticeSignal,
  TimelineCreatedSignal,
  VideoRenderedSignal,
  CarouselCreatedSignal,
  ArticleCreatedSignal,
  InspirationAddedSignal,
  ChallengeCompletedSignal,
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
  CarouselCardType,
  CarouselCard,
  CarouselFrontmatter,
  Carousel,
  ArticleSection,
  ArticleFrontmatter,
  Article,
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
  readCarousel,
  listCarousels,
  readArticle,
  listArticles,
} from "./vault/index.js";
export { generatePatternMap } from "./canvas/index.js";
export { captureMoment } from "./pipeline/capture.js";
export { buildAmplifyContext, serializeAmplifyContext } from "./amplify/index.js";
export type { AmplifyContext } from "./amplify/index.js";

// Studio
export {
  createHeyGenClient,
  createElevenLabsClient,
  createImagenClient,
  renderVideo,
  renderDirectorCut,
  previewVideo,
  produceVideo,
  produceTimeline,
  validateAssets,
  resolveAssetPath,
} from "./studio/index.js";
export type { HeyGenClient } from "./studio/index.js";
export type { ElevenLabsClient } from "./studio/index.js";
export type { ImagenClient } from "./studio/index.js";
export type { RenderProps, DirectorCutRenderProps } from "./studio/index.js";
export {
  resolveStoryAssetsDir,
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
  resolveDirectorCutPath,
} from "./vault/index.js";

// Signals
export { readSignals, readRecentSignals, emitSignal, signalId, summarizeSignals } from "./vault/index.js";

// Memory
export { formatSessionTime, appendSessionEntry, readSession, readRecentSessions, readPreferences, addPreference } from "./vault/index.js";

// Brand
export { readBrand, readBrandInspirations, resolveBrandDir, resolveBrandPath, resolveBrandInspirationDir } from "./vault/index.js";

// Capture
export {
  connectOBS,
  setupScenes,
  configureOutput,
  startRecording,
  stopRecording,
  listCapturedAssets,
  installHotkeys,
  formatHotkeyTable,
  DEFAULT_HOTKEYS,
} from "./capture/index.js";
export type { HotkeyBindings } from "./capture/index.js";
