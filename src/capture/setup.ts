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

/** Configure OBS output settings for 4K YouTube-quality capture */
export async function configureOutput(obs: OBSWebSocket): Promise<void> {
  // 4K @ 60fps: 1080p looked soft on YouTube, especially with text and scrolling
  await obs.call("SetVideoSettings", {
    baseWidth: 3840,
    baseHeight: 2160,
    outputWidth: 3840,
    outputHeight: 2160,
    fpsNumerator: 60,
    fpsDenominator: 1,
  });

  // Apple hardware encoder: handles 4K with no CPU hit on Mac
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "RecEncoder",
    parameterValue: "apple_vt_h264_hw",
  });

  // Lossless capture quality: disk is cheap, re-encoding later is painful
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "RecQuality",
    parameterValue: "Lossless",
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

/** List all scenes in OBS with their sources */
export async function listScenes(
  obs: OBSWebSocket,
): Promise<{ name: string; active: boolean; items: string[] }[]> {
  const { currentProgramSceneName, scenes } = await obs.call("GetSceneList");
  const result: { name: string; active: boolean; items: string[] }[] = [];

  for (const scene of scenes) {
    const name = scene.sceneName as string;
    const { sceneItems } = await obs.call("GetSceneItemList", {
      sceneName: name,
    });
    result.push({
      name,
      active: name === currentProgramSceneName,
      items: sceneItems.map(
        (item: Record<string, unknown>) => item.sourceName as string,
      ),
    });
  }

  return result;
}

/** Show or hide a source within a scene */
export async function setSourceVisibility(
  obs: OBSWebSocket,
  sceneName: string,
  sourceName: string,
  visible: boolean,
): Promise<void> {
  const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });
  const item = sceneItems.find(
    (i: Record<string, unknown>) =>
      (i.sourceName as string).toLowerCase() === sourceName.toLowerCase(),
  );
  if (!item) {
    const available = sceneItems
      .map((i: Record<string, unknown>) => i.sourceName as string)
      .join(", ");
    throw new Error(
      `Source "${sourceName}" not found in "${sceneName}". Available: ${available}`,
    );
  }
  await obs.call("SetSceneItemEnabled", {
    sceneName,
    sceneItemId: item.sceneItemId as number,
    sceneItemEnabled: visible,
  });
}

/** Toggle a source's visibility and return the new state */
export async function toggleSourceVisibility(
  obs: OBSWebSocket,
  sceneName: string,
  sourceName: string,
): Promise<boolean> {
  const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });
  const item = sceneItems.find(
    (i: Record<string, unknown>) =>
      (i.sourceName as string).toLowerCase() === sourceName.toLowerCase(),
  );
  if (!item) {
    const available = sceneItems
      .map((i: Record<string, unknown>) => i.sourceName as string)
      .join(", ");
    throw new Error(
      `Source "${sourceName}" not found in "${sceneName}". Available: ${available}`,
    );
  }
  const { sceneItemEnabled } = await obs.call("GetSceneItemEnabled", {
    sceneName,
    sceneItemId: item.sceneItemId as number,
  });
  const newState = !sceneItemEnabled;
  await obs.call("SetSceneItemEnabled", {
    sceneName,
    sceneItemId: item.sceneItemId as number,
    sceneItemEnabled: newState,
  });
  return newState;
}
