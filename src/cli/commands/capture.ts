import { loadConfig } from "../../config.js";

const USAGE = `lumis capture — OBS screen/camera capture

Commands:
  lumis capture setup          Connect to OBS, create Lumis scenes + profile
  lumis capture start <slug>   Start recording to stories/{slug}/assets/
  lumis capture stop           Stop recording, show captured file
  lumis capture list <slug>    Show captured assets for a story
  lumis capture scene <name>   Switch OBS scene (screen+camera, screen, camera)
  lumis capture hotkeys        Install keyboard shortcuts into OBS config`;

const SCENE_ALIASES: Record<string, string> = {
  "screen+camera": "Lumis: Screen + Camera",
  "screen": "Lumis: Screen Only",
  "camera": "Lumis: Camera Only",
};

export async function captureCommand(
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
        console.error("Usage: lumis capture start <slug>");
        process.exit(1);
      }
      await runStart(slug);
      break;
    }
    case "stop":
      await runStop();
      break;
    case "list": {
      const slug = args[0];
      if (!slug) {
        console.error("Usage: lumis capture list <slug>");
        process.exit(1);
      }
      await runList(slug);
      break;
    }
    case "scene": {
      const name = args.join(" ");
      if (!name) {
        console.error("Usage: lumis capture scene <name>");
        console.error("  Names: screen+camera, screen, camera");
        process.exit(1);
      }
      await runScene(name);
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

  console.log("Configuring output (1920x1080, 30fps, H.264)...");
  await configureOutput(obs);

  await obs.disconnect();

  const { formatHotkeyTable, DEFAULT_HOTKEYS } = await import(
    "../../capture/index.js"
  );
  const bindings = { ...DEFAULT_HOTKEYS, ...config.capture?.hotkeys };
  console.log("\nKeyboard shortcuts (set in OBS Settings > Hotkeys):\n");
  console.log(formatHotkeyTable(bindings));
  console.log("\nRun 'lumis capture hotkeys' to install these automatically.");
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
  console.log("Run 'lumis capture stop' when finished.");

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
