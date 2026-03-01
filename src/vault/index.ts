export { readMoments, readMoment, readResearchNotes, readStories, readStory } from "./reader.js";
export { writeMoment, writeCanvas, writeResearchNote, writeTldrNote, writeStory, appendPracticeLog } from "./writer.js";
export { parseFrontmatter, serializeFrontmatter } from "./frontmatter.js";
export {
  resolvePath,
  resolveCanvasPath,
  resolveMomentsDir,
  resolveResearchDir,
  resolveTldrDir,
  resolveResearchCategoryDir,
  resolveLearningsDir,
  resolveAmplifyStructuresDir,
  resolveAmplifyHooksDir,
  resolveAmplifyPersuasionPath,
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
  resolvePeopleDir,
  resolveThinkingDir,
  resolveChallengeLogPath,
  resolveStoryDir,
  resolveTimelinePath,
} from "./paths.js";

// Re-export readCanvas for convenience
export { readCanvas } from "./reader.js";

// Amplify reader/writer
export { readStructures, readHooks, readPersuasionGlossary } from "./amplify-reader.js";
export { writeStructure, writeHook } from "./amplify-writer.js";

// Signals
export { readSignals, readRecentSignals, emitSignal, signalId, summarizeSignals } from "./signals.js";
export type { SignalSummary } from "./signals.js";

// Timeline (director)
export { readTimeline, listTimelines } from "./timeline-reader.js";
export { writeTimeline } from "./timeline-writer.js";

// Memory
export { formatSessionTime, appendSessionEntry, readSession, readRecentSessions, readPreferences, addPreference } from "./memory.js";
