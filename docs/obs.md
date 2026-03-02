# OBS Capture

Lumis integrates with OBS Studio to record screen captures and presenter footage directly into story asset folders. Recordings flow into the Studio pipeline as `screen-capture` shots without manual file management.

## Prerequisites

- **OBS Studio 28+** (has obs-websocket built in)
- macOS: `brew install --cask obs`
- Or download from https://obsproject.com
- **WebSocket server enabled** in OBS: Settings > WebSocket Server Settings > Enable WebSocket Server

If you set a password in OBS's WebSocket settings, add it to your `.lumisrc` (see Configuration below).

## Quick start

```bash
# 1. Open OBS
# 2. Run setup (creates scenes, sets resolution)
lumis capture setup

# 3. Install keyboard shortcuts into OBS config (OBS must be closed)
lumis capture hotkeys

# 4. Reopen OBS, start recording for a story
lumis capture start my-story

# 5. Record your screen/camera, then stop
lumis capture stop

# 6. Check what was captured
lumis capture list my-story
```

## Architecture

```
src/capture/
  setup.ts     ← OBS connection, scene creation, output config
  record.ts    ← Start/stop recording, asset listing
  hotkeys.ts   ← OBS hotkey config file management
  index.ts     ← Public API re-exports
```

Lumis talks to OBS over WebSocket (`obs-websocket-js`). OBS runs as a separate app. Lumis controls it programmatically: creating scenes, setting output paths, starting/stopping recording.

## Commands

```bash
lumis capture setup          # Connect to OBS, create Lumis scenes, configure output
lumis capture start <slug>   # Set output to stories/{slug}/assets/, start recording
lumis capture stop           # Stop recording, print the saved file path
lumis capture list <slug>    # Show captured assets for a story
lumis capture scene <name>   # Switch OBS scene
lumis capture hotkeys        # Install keyboard shortcuts into OBS config
```

### `capture setup`

Connects to OBS via WebSocket and does three things:

1. **Creates three Lumis scenes** (skips any that already exist):

| Scene | Sources | Use case |
|-------|---------|----------|
| Lumis: Screen + Camera | Display capture + webcam (corner PIP) | Demo walkthroughs with your face |
| Lumis: Screen Only | Display capture | Clean screen recordings |
| Lumis: Camera Only | Webcam (full frame) | Presenter footage (alternative to HeyGen avatars) |

2. **Configures output** to match Studio specs: 1920x1080, 30fps, H.264 (MP4).

3. **Prints recommended keyboard shortcuts** with a pointer to `lumis capture hotkeys`.

### `capture start <slug>`

Sets OBS's recording output path to `{stories}/{slug}/assets/`, switches to the default scene, and starts recording. The assets directory is created if it doesn't exist.

The default scene is `Lumis: Screen + Camera`. Change it in `.lumisrc`:

```json
{
  "capture": {
    "defaultScene": "Lumis: Screen Only"
  }
}
```

### `capture stop`

Stops the active recording and prints the path to the saved file. The file lands in the story's `assets/` folder with OBS's default timestamp naming.

### `capture list <slug>`

Lists all media files in `{stories}/{slug}/assets/` with file size and modification date. Shows video files (.mp4, .mov, .webm, .mkv) and images (.png, .jpg, .gif, .webp).

### `capture scene <name>`

Switches the active OBS scene. Accepts short aliases:

| Alias | Scene |
|-------|-------|
| `screen+camera` | Lumis: Screen + Camera |
| `screen` | Lumis: Screen Only |
| `camera` | Lumis: Camera Only |

Or pass the full scene name: `lumis capture scene "Lumis: Camera Only"`.

### `capture hotkeys`

Writes keyboard shortcut bindings into OBS's profile config file on macOS (`~/Library/Application Support/obs-studio/basic/profiles/`). **Close OBS before running this.** OBS overwrites its config on exit, so changes made while OBS is running get lost.

After running, reopen OBS. The shortcuts work globally (any app focused).

If OBS isn't installed or the config directory isn't found, prints manual setup instructions instead.

## Keyboard shortcuts

Default bindings (customizable in `.lumisrc`):

| Key | Action |
|-----|--------|
| F5 | Switch to Screen + Camera |
| F6 | Switch to Screen Only |
| F7 | Switch to Camera Only |
| F9 | Start Recording |
| F10 | Stop Recording |

These are OBS global hotkeys. They work from any app, no terminal needed.

### Customizing shortcuts

Override any binding in `.lumisrc` using OBS key identifiers:

```json
{
  "capture": {
    "hotkeys": {
      "startRecording": "OBS_KEY_F9",
      "stopRecording": "OBS_KEY_F10",
      "sceneScreenCamera": "OBS_KEY_F5",
      "sceneScreenOnly": "OBS_KEY_F6",
      "sceneCameraOnly": "OBS_KEY_F7"
    }
  }
}
```

OBS key identifiers follow the pattern `OBS_KEY_<keyname>`. Common ones: `OBS_KEY_F1` through `OBS_KEY_F12`, `OBS_KEY_A` through `OBS_KEY_Z`, `OBS_KEY_0` through `OBS_KEY_9`.

### Manual setup (alternative)

If `lumis capture hotkeys` can't find the OBS config, set shortcuts manually:

1. Open OBS > Settings > Hotkeys
2. Find "Start Recording" and assign F9
3. Find "Stop Recording" and assign F10
4. Find each "Lumis:" scene under "Switch to Scene" and assign F5/F6/F7
5. Click OK

## Configuration

Add a `capture` section to `.lumisrc`:

```json
{
  "capture": {
    "obsWebsocketUrl": "ws://localhost:4455",
    "obsWebsocketPassword": "",
    "defaultScene": "Lumis: Screen + Camera",
    "hotkeys": {
      "startRecording": "OBS_KEY_F9",
      "stopRecording": "OBS_KEY_F10",
      "sceneScreenCamera": "OBS_KEY_F5",
      "sceneScreenOnly": "OBS_KEY_F6",
      "sceneCameraOnly": "OBS_KEY_F7"
    }
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `obsWebsocketUrl` | `ws://localhost:4455` | OBS WebSocket server address. Change if using a non-default port. |
| `obsWebsocketPassword` | `""` (none) | Must match the password set in OBS WebSocket Server Settings. |
| `defaultScene` | `Lumis: Screen + Camera` | Scene to activate when `capture start` runs. |
| `hotkeys` | See table above | OBS key identifiers for each action. |

Environment variables `OBS_WEBSOCKET_URL` and `OBS_WEBSOCKET_PASSWORD` also work as fallbacks.

## Integration with Studio

Captured files go to `{stories}/{slug}/assets/`. This is the same folder the Studio render pipeline reads from. No manual file moving needed.

### Using captures in a timeline

In a director cut timeline (`video-*.md`), reference captured files with `screen-capture` shots:

```yaml
shots:
  - id: 3
    beat: setup
    shotType: screen-capture
    duration: 6
    asset: "2026-03-01 14-30-22.mp4"
    direction: "Dashboard walkthrough showing the metrics panel"
    voiceover: "Here's what the dashboard looks like in practice."
    voiceoverSource: elevenlabs
```

- `asset` is the filename from `lumis capture list <slug>`
- Video files play inline in the rendered output
- Image files get a Ken Burns zoom effect
- Add `voiceover` + `voiceoverSource: elevenlabs` to narrate over the clip

### Asset validation

`lumis studio render <slug>` validates all `screen-capture` assets exist before starting. Missing files are reported up front so you can capture them before rendering.

### Typical workflow

```
/craft-content         → write your story
/director-video        → build the timeline (mark screen-capture shots)
lumis capture setup    → one-time OBS setup
lumis capture start <slug>  → record the screen demo
lumis capture stop     → stop recording
lumis studio render <slug>  → assemble everything into final video
```

## Troubleshooting

**"Could not connect to OBS"**
- Is OBS running?
- Is the WebSocket server enabled? (Settings > WebSocket Server Settings > Enable)
- Check the port. Default is 4455. If you changed it, update `obsWebsocketUrl` in `.lumisrc`.
- If you set a password in OBS, add it to `obsWebsocketPassword` in `.lumisrc`.

**"OBS is already recording"**
- A recording is in progress. Run `lumis capture stop` first, or stop it from OBS directly.

**"OBS is not currently recording"**
- No active recording to stop. You may have already stopped it, or it was stopped from OBS.

**Hotkeys not working after `lumis capture hotkeys`**
- Did you close OBS before running the command? OBS overwrites config on exit.
- Reopen OBS after running the command.
- Check for conflicts: OBS > Settings > Hotkeys. Look for duplicate bindings.

**Recordings not appearing in `lumis capture list`**
- Did you run `lumis capture start <slug>` before recording? Without it, OBS saves to its default output folder, not the story assets folder.
- Check OBS Settings > Output > Recording Path to see where files went.

**Source not available on this platform**
- Setup may skip some sources if your macOS version doesn't support them. Display capture requires screen recording permission in System Settings > Privacy & Security > Screen Recording. Add OBS there.
