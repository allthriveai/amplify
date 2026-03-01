# Studio

Lumis includes a video production pipeline powered by HeyGen (avatar video), ElevenLabs (voice), and Remotion (branded rendering).

## Architecture

- **Remotion config** lives at repo root: `remotion.config.ts`
- **Compositions** in `src/studio/compositions/` (excluded from tsc, bundled by Remotion)
- **API clients** in `src/studio/` (heygen.ts, elevenlabs.ts, render.ts)
- **Studio config** is optional in `.lumisrc` under `studio` key, or via env vars
- **Public assets**: `public/raw/` (HeyGen downloads), `public/captions/` (SRT files)

## Setup

Studio is configured during `/init` (optional step) or by editing `.lumisrc` directly.

Add API keys to `.lumisrc` or set environment variables:

```json
{
  "studio": {
    "heygenApiKey": "your-key",
    "heygenAvatarId": "your-avatar-id",
    "heygenVoiceId": "your-heygen-voice-id",
    "elevenlabsApiKey": "your-key",
    "elevenlabsVoiceId": "your-voice-id"
  }
}
```

Or: `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`.

Lumis works fine without studio config. The capture, coaching, and content creation layers are fully functional on their own.

## Commands

```bash
lumis studio list        # List scripts and status
lumis studio render      # Render script to branded video
lumis studio preview     # Open Remotion preview
```
