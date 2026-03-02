export {
  connectOBS,
  setupScenes,
  configureOutput,
  setOutputPath,
  switchScene,
  getLumisSceneNames,
} from "./setup.js";

export {
  startRecording,
  stopRecording,
  listCapturedAssets,
} from "./record.js";

export {
  installHotkeys,
  formatHotkeyTable,
  DEFAULT_HOTKEYS,
} from "./hotkeys.js";
export type { HotkeyBindings } from "./hotkeys.js";
