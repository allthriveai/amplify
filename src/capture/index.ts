export {
  connectOBS,
  setupScenes,
  configureOutput,
  setOutputPath,
  switchScene,
  getLumisSceneNames,
  listScenes,
  setSourceVisibility,
  toggleSourceVisibility,
} from "./setup.js";

export {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  getRecordingStatus,
  listCapturedAssets,
} from "./record.js";

export {
  installHotkeys,
  formatHotkeyTable,
  DEFAULT_HOTKEYS,
} from "./hotkeys.js";
export type { HotkeyBindings } from "./hotkeys.js";
