import OBSWebSocket from "obs-websocket-js";
import type { CaptureConfig } from "../types/config.js";

const DEFAULT_URL = "ws://localhost:4455";

const SCENES = [
  {
    name: "Lumis: Screen + Camera",
    sources: [
      { name: "Display Capture", kind: "screen_capture" },
      { name: "Webcam PIP", kind: "av_capture_v2" },
    ],
  },
  {
    name: "Lumis: Screen Only",
    sources: [{ name: "Display Capture", kind: "screen_capture" }],
  },
  {
    name: "Lumis: Camera Only",
    sources: [{ name: "Webcam", kind: "av_capture_v2" }],
  },
] as const;

/** Connect to OBS via websocket */
export async function connectOBS(
  captureConfig?: CaptureConfig,
): Promise<OBSWebSocket> {
  const obs = new OBSWebSocket();
  const url = captureConfig?.obsWebsocketUrl ?? DEFAULT_URL;
  const password = captureConfig?.obsWebsocketPassword || undefined;

  try {
    await obs.connect(url, password);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not connect to OBS at ${url}. Is OBS running with WebSocket server enabled?\n${msg}`,
    );
  }

  return obs;
}

/** Create Lumis scenes and sources in OBS */
export async function setupScenes(obs: OBSWebSocket): Promise<string[]> {
  const { scenes: existing } = await obs.call("GetSceneList");
  const existingNames = new Set(
    existing.map((s) => s.sceneName as string),
  );
  const created: string[] = [];

  for (const scene of SCENES) {
    if (existingNames.has(scene.name)) {
      continue;
    }

    await obs.call("CreateScene", { sceneName: scene.name });
    created.push(scene.name);

    for (const source of scene.sources) {
      try {
        await obs.call("CreateInput", {
          sceneName: scene.name,
          inputName: `${scene.name} - ${source.name}`,
          inputKind: source.kind,
          inputSettings: {},
        });
      } catch {
        // Source kind may not be available on this platform; skip
      }
    }
  }

  return created;
}

/** Configure OBS output settings to match Studio specs */
export async function configureOutput(obs: OBSWebSocket): Promise<void> {
  await obs.call("SetVideoSettings", {
    baseWidth: 1920,
    baseHeight: 1080,
    outputWidth: 1920,
    outputHeight: 1080,
    fpsNumerator: 30,
    fpsDenominator: 1,
  });
}

/** Set the recording output path */
export async function setOutputPath(
  obs: OBSWebSocket,
  outputDir: string,
): Promise<void> {
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "FilePath",
    parameterValue: outputDir,
  });
}

/** Switch to a specific Lumis scene */
export async function switchScene(
  obs: OBSWebSocket,
  sceneName: string,
): Promise<void> {
  await obs.call("SetCurrentProgramScene", { sceneName });
}

/** Get the list of available Lumis scene names */
export function getLumisSceneNames(): string[] {
  return SCENES.map((s) => s.name);
}
