import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/** OBS key identifiers for hotkey bindings */
export interface HotkeyBindings {
  startRecording: string;
  stopRecording: string;
  sceneScreenCamera: string;
  sceneScreenOnly: string;
  sceneCameraOnly: string;
}

export const DEFAULT_HOTKEYS: HotkeyBindings = {
  startRecording: "OBS_KEY_F9",
  stopRecording: "OBS_KEY_F10",
  sceneScreenCamera: "OBS_KEY_F5",
  sceneScreenOnly: "OBS_KEY_F6",
  sceneCameraOnly: "OBS_KEY_F7",
};

/** Human-readable labels for printing */
const KEY_LABELS: Record<string, string> = {
  OBS_KEY_F1: "F1", OBS_KEY_F2: "F2", OBS_KEY_F3: "F3",
  OBS_KEY_F4: "F4", OBS_KEY_F5: "F5", OBS_KEY_F6: "F6",
  OBS_KEY_F7: "F7", OBS_KEY_F8: "F8", OBS_KEY_F9: "F9",
  OBS_KEY_F10: "F10", OBS_KEY_F11: "F11", OBS_KEY_F12: "F12",
};

function keyLabel(obsKey: string): string {
  return KEY_LABELS[obsKey] ?? obsKey.replace("OBS_KEY_", "");
}

/** macOS OBS config directory */
function getOBSConfigDir(): string {
  return join(homedir(), "Library", "Application Support", "obs-studio");
}

/** Find the active OBS profile directory */
function findProfileDir(): string | null {
  const profilesDir = join(getOBSConfigDir(), "basic", "profiles");
  if (!existsSync(profilesDir)) return null;

  const profiles = readdirSync(profilesDir).filter((f) => {
    const iniPath = join(profilesDir, f, "basic.ini");
    return existsSync(iniPath);
  });

  // Prefer "Untitled" (OBS default), otherwise take the first one
  const target = profiles.includes("Untitled") ? "Untitled" : profiles[0];
  return target ? join(profilesDir, target) : null;
}

/** Format a single hotkey binding as OBS expects in basic.ini */
function formatBinding(obsKey: string): string {
  return JSON.stringify({ bindings: [{ key: obsKey }] });
}

/**
 * Install hotkey bindings into the OBS profile config.
 * OBS must NOT be running when this is called (OBS overwrites config on exit).
 * Returns true if hotkeys were written, false if OBS config was not found.
 */
export function installHotkeys(
  bindings: HotkeyBindings = DEFAULT_HOTKEYS,
): { installed: boolean; profilePath: string | null; message: string } {
  const profileDir = findProfileDir();
  if (!profileDir) {
    return {
      installed: false,
      profilePath: null,
      message: "OBS config directory not found. Set hotkeys manually in OBS Settings > Hotkeys.",
    };
  }

  const iniPath = join(profileDir, "basic.ini");
  let content = existsSync(iniPath) ? readFileSync(iniPath, "utf-8") : "";

  // Build hotkey entries
  const hotkeyEntries: Record<string, string> = {
    "OBSBasic.StartRecording": formatBinding(bindings.startRecording),
    "OBSBasic.StopRecording": formatBinding(bindings.stopRecording),
    'OBSBasic.SelectScene.Lumis\\: Screen + Camera': formatBinding(bindings.sceneScreenCamera),
    'OBSBasic.SelectScene.Lumis\\: Screen Only': formatBinding(bindings.sceneScreenOnly),
    'OBSBasic.SelectScene.Lumis\\: Camera Only': formatBinding(bindings.sceneCameraOnly),
  };

  // Check if [Hotkeys] section exists
  const hotkeysIdx = content.indexOf("[Hotkeys]");
  if (hotkeysIdx === -1) {
    // Append a new [Hotkeys] section
    const section = "\n[Hotkeys]\n" +
      Object.entries(hotkeyEntries)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n") + "\n";
    content += section;
  } else {
    // Find the end of the [Hotkeys] section (next [...] or EOF)
    const afterHotkeys = content.slice(hotkeysIdx + "[Hotkeys]".length);
    const nextSectionMatch = afterHotkeys.match(/\n\[/);
    const insertPos = nextSectionMatch
      ? hotkeysIdx + "[Hotkeys]".length + (nextSectionMatch.index ?? afterHotkeys.length)
      : content.length;

    // Remove existing Lumis hotkey lines to avoid duplicates
    const before = content.slice(0, insertPos);
    const after = content.slice(insertPos);
    const cleanedBefore = before
      .split("\n")
      .filter((line) => {
        for (const key of Object.keys(hotkeyEntries)) {
          if (line.startsWith(key + "=")) return false;
        }
        return true;
      })
      .join("\n");

    const newLines = Object.entries(hotkeyEntries)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    content = cleanedBefore + "\n" + newLines + "\n" + after;
  }

  writeFileSync(iniPath, content, "utf-8");

  return {
    installed: true,
    profilePath: iniPath,
    message: `Hotkeys written to ${iniPath}. Restart OBS to activate.`,
  };
}

/** Print a formatted table of hotkey bindings */
export function formatHotkeyTable(bindings: HotkeyBindings = DEFAULT_HOTKEYS): string {
  const rows = [
    ["Action", "Key"],
    ["Start Recording", keyLabel(bindings.startRecording)],
    ["Stop Recording", keyLabel(bindings.stopRecording)],
    ["Scene: Screen + Camera", keyLabel(bindings.sceneScreenCamera)],
    ["Scene: Screen Only", keyLabel(bindings.sceneScreenOnly)],
    ["Scene: Camera Only", keyLabel(bindings.sceneCameraOnly)],
  ];

  const col1Width = Math.max(...rows.map((r) => r[0].length));
  const lines = rows.map((r, i) => {
    const line = `  ${r[0].padEnd(col1Width)}   ${r[1]}`;
    return i === 0 ? line + "\n  " + "-".repeat(col1Width + 3 + r[1].length) : line;
  });

  return lines.join("\n");
}
