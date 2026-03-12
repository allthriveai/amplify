import { loadConfig } from "../../config.js";

const USAGE = `lumis obs — OBS screen/camera capture

Commands:
  lumis obs setup               Connect to OBS, create Lumis scenes + profile
  lumis obs start <slug>        Start recording to stories/{slug}/assets/
  lumis obs stop                Stop recording, show captured file
  lumis obs pause               Pause active recording
  lumis obs resume              Resume paused recording
  lumis obs status              Show recording state and timecode
  lumis obs list <slug>         Show captured assets for a story
  lumis obs scenes              List all OBS scenes and sources
  lumis obs scene <name>        Switch OBS scene (screen+camera, screen, camera)
  lumis obs show <source>       Show a source in the active scene
  lumis obs hide <source>       Hide a source in the active scene
  lumis obs toggle <source>     Toggle a source's visibility
  lumis obs hotkeys             Install keyboard shortcuts into OBS config`;

const SCENE_ALIASES: Record<string, string> = {
  "screen+camera": "Lumis: Screen + Camera",
  "screen": "Lumis: Screen Only",
  "camera": "Lumis: Camera Only",
};

export async function obsCommand(
  subcommand: string,
  args: string[],
): Promise<void> {
  switch (subcommand) {
    case "setup":
      await runSetup();
      break;
    case "start": {
      const slug = args[0];
      if (!slug) {
        console.error("Usage: lumis obs start <slug>");
        process.exit(1);
      }
      await runStart(slug);
      break;
    }
    case "stop":
      await runStop();
      break;
    case "pause":
      await runPause();
      break;
    case "resume":
      await runResume();
      break;
    case "status":
      await runStatus();
      break;
    case "list": {
      const slug = args[0];
      if (!slug) {
        console.error("Usage: lumis obs list <slug>");
        process.exit(1);
      }
      await runList(slug);
      break;
    }
    case "scenes":
      await runScenes();
      break;
    case "scene": {
      const name = args.join(" ");
      if (!name) {
        console.error("Usage: lumis obs scene <name>");
        console.error("  Names: screen+camera, screen, camera");
        process.exit(1);
      }
      await runScene(name);
      break;
    }
    case "show":
    case "hide":
    case "toggle": {
      const sourceName = args.join(" ");
      if (!sourceName) {
        console.error(`Usage: lumis obs ${subcommand} <source-name>`);
        process.exit(1);
      }
      await runSourceVisibility(subcommand, sourceName);
      break;
    }
    case "hotkeys":
      await runHotkeys();
      break;
    default:
      console.log(USAGE);
  }
}

async function runSetup(): Promise<void> {
  const config = loadConfig();
  const { connectOBS, setupScenes, configureOutput } = await import(
    "../../capture/index.js"
  );

  console.log("Connecting to OBS...");
  const obs = await connectOBS(config.capture);

  console.log("Creating Lumis scenes...");
  const created = await setupScenes(obs);

  if (created.length > 0) {
    for (const name of created) {
      console.log(`  + ${name}`);
    }
  } else {
    console.log("  All Lumis scenes already exist.");
  }

  console.log("Configuring output (4K, 60fps, Apple HW encoder, lossless)...");
  await configureOutput(obs);

  await obs.disconnect();

  const { formatHotkeyTable, DEFAULT_HOTKEYS } = await import(
    "../../capture/index.js"
  );
  const bindings = { ...DEFAULT_HOTKEYS, ...config.capture?.hotkeys };
  console.log("\nKeyboard shortcuts (set in OBS Settings > Hotkeys):\n");
  console.log(formatHotkeyTable(bindings));
  console.log("\nRun 'lumis obs hotkeys' to install these automatically.");
  console.log("\nSetup complete. Lumis scenes are ready in OBS.");
}

async function runStart(slug: string): Promise<void> {
  const config = loadConfig();
  const { connectOBS, startRecording, switchScene } = await import(
    "../../capture/index.js"
  );

  const obs = await connectOBS(config.capture);

  const defaultScene =
    config.capture?.defaultScene ?? "Lumis: Screen + Camera";
  try {
    await switchScene(obs, defaultScene);
    console.log(`Scene: ${defaultScene}`);
  } catch {
    // Scene may not exist yet, proceed anyway
  }

  const assetsDir = await startRecording(obs, config, slug);
  console.log(`Recording to: ${assetsDir}`);
  console.log("Run 'lumis obs stop' when finished.");

  await obs.disconnect();
}

async function runStop(): Promise<void> {
  const config = loadConfig();
  const { connectOBS, stopRecording } = await import(
    "../../capture/index.js"
  );

  const obs = await connectOBS(config.capture);
  const { outputPath } = await stopRecording(obs);

  console.log(`Recording saved: ${outputPath}`);
  await obs.disconnect();
}

async function runList(slug: string): Promise<void> {
  const config = loadConfig();
  const { listCapturedAssets } = await import("../../capture/index.js");

  const assets = listCapturedAssets(config, slug);

  if (assets.length === 0) {
    console.log(`No captured assets found for "${slug}".`);
    return;
  }

  console.log(`Assets for "${slug}":\n`);
  console.log(
    `${"File".padEnd(40)} ${"Size".padEnd(12)} Modified`,
  );
  console.log("-".repeat(72));

  for (const asset of assets) {
    const date = asset.modified.toISOString().slice(0, 16).replace("T", " ");
    console.log(
      `${asset.name.padEnd(40)} ${asset.size.padEnd(12)} ${date}`,
    );
  }
}

async function runHotkeys(): Promise<void> {
  const config = loadConfig();
  const { installHotkeys, formatHotkeyTable, DEFAULT_HOTKEYS } = await import(
    "../../capture/index.js"
  );

  const bindings = { ...DEFAULT_HOTKEYS, ...config.capture?.hotkeys };

  console.log("Keyboard shortcuts:\n");
  console.log(formatHotkeyTable(bindings));

  console.log("\nInstalling into OBS config (OBS must not be running)...");
  const result = installHotkeys(bindings);

  if (result.installed) {
    console.log(`Written to: ${result.profilePath}`);
    console.log("Restart OBS to activate the shortcuts.");
  } else {
    console.log(result.message);
    console.log("\nTo set manually: OBS > Settings > Hotkeys");
  }
}

async function runPause(): Promise<void> {
  const config = loadConfig();
  const { connectOBS, pauseRecording } = await import(
    "../../capture/index.js"
  );
  const obs = await connectOBS(config.capture);
  await pauseRecording(obs);
  console.log("Recording paused.");
  await obs.disconnect();
}

async function runResume(): Promise<void> {
  const config = loadConfig();
  const { connectOBS, resumeRecording } = await import(
    "../../capture/index.js"
  );
  const obs = await connectOBS(config.capture);
  await resumeRecording(obs);
  console.log("Recording resumed.");
  await obs.disconnect();
}

async function runStatus(): Promise<void> {
  const config = loadConfig();
  const { connectOBS, getRecordingStatus } = await import(
    "../../capture/index.js"
  );
  const obs = await connectOBS(config.capture);
  const status = await getRecordingStatus(obs);

  if (!status.active) {
    console.log("Not recording.");
  } else if (status.paused) {
    console.log(`Recording paused at ${status.timecode}`);
  } else {
    console.log(`Recording: ${status.timecode}`);
  }

  await obs.disconnect();
}

async function runScenes(): Promise<void> {
  const config = loadConfig();
  const { connectOBS, listScenes } = await import("../../capture/index.js");
  const obs = await connectOBS(config.capture);
  const scenes = await listScenes(obs);

  for (const scene of scenes) {
    const marker = scene.active ? " *" : "";
    console.log(`${scene.name}${marker}`);
    for (const item of scene.items) {
      console.log(`  - ${item}`);
    }
  }

  await obs.disconnect();
}

async function runSourceVisibility(
  action: string,
  sourceName: string,
): Promise<void> {
  const config = loadConfig();
  const { connectOBS, setSourceVisibility, toggleSourceVisibility } =
    await import("../../capture/index.js");
  const obs = await connectOBS(config.capture);

  // Get the active scene
  const { currentProgramSceneName } = await obs.call("GetCurrentProgramScene");

  if (action === "toggle") {
    const newState = await toggleSourceVisibility(
      obs,
      currentProgramSceneName,
      sourceName,
    );
    console.log(
      `${sourceName}: ${newState ? "visible" : "hidden"} in ${currentProgramSceneName}`,
    );
  } else {
    const visible = action === "show";
    await setSourceVisibility(obs, currentProgramSceneName, sourceName, visible);
    console.log(
      `${sourceName}: ${visible ? "visible" : "hidden"} in ${currentProgramSceneName}`,
    );
  }

  await obs.disconnect();
}

async function runScene(name: string): Promise<void> {
  const config = loadConfig();
  const { connectOBS, switchScene } = await import(
    "../../capture/index.js"
  );

  const sceneName = SCENE_ALIASES[name.toLowerCase()] ?? name;
  const obs = await connectOBS(config.capture);
  await switchScene(obs, sceneName);
  console.log(`Switched to: ${sceneName}`);
  await obs.disconnect();
}
