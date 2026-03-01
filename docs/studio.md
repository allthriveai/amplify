# Studio

Lumis includes a video production pipeline powered by HeyGen (avatar video), ElevenLabs (voice), and Remotion (branded rendering).

## Architecture

- **Remotion config** lives at repo root: `remotion.config.ts`
- **Compositions** in `src/studio/compositions/` (excluded from tsc, bundled by Remotion)
- **API clients** in `src/studio/` (heygen.ts, elevenlabs.ts, render.ts)
- **Production pipeline** in `src/studio/produce-timeline.ts` (multi-shot orchestration)
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

Lumis works fine without studio config. The capture, storytelling, and content creation layers are fully functional on their own.

## Commands

```bash
lumis studio list        # List director cuts across stories
lumis studio render      # Render a story's timeline to video
lumis studio preview     # Open Remotion preview
```

## Director Cut Pipeline

The Director Cut pipeline turns a crafted story into a multi-shot video:

```
/craft-content (story) → /director-video (timeline) → HeyGen (avatar clips) → Remotion (assemble) → CapCut (final polish)
```

### Compositions

| Composition | Purpose |
|-------------|---------|
| `BrandedVideo` | Single avatar clip with intro/outro and lower third |
| `DirectorCut` | Multi-shot timeline: sequences avatar clips, text cards, branded segments |
| `TextCard` | Five visual treatments: stat, quote, contrast, list, statement |
| `BRollPlaceholder` | Dark card with direction text for CapCut replacement |
| `BrandedIntro` | 3s branded opening |
| `BrandedOutro` | 5s branded closing |

### Production flow (`produceTimeline`)

1. Read `timeline.md` from story folder
2. Avatar shots → HeyGen in parallel (max 3 concurrent)
3. Poll until all clips complete
4. Download to `public/raw/{slug}/shot-{id}.mp4`
5. Build `ResolvedShot[]` with cumulative `startFrame` offsets
6. Temp JSON props → `npx remotion render DirectorCut`
7. Output to `{studioOutputs}/{slug}.mp4`

### Timeline format

Lives at `{stories}/{slug}/timeline.md`. Shots are stored in YAML frontmatter:

```yaml
---
title: "Story Title"
type: timeline
status: draft
source: "[[Lumis/Stories/slug/story.md]]"
hook: curiosity-gap
structure: point-of-high-drama
persuasion: [contrast-principle, sensory-specificity]
platform: youtube
targetDuration: 45
shots:
  - id: 1
    beat: hook
    shotType: avatar
    duration: 3
    script: "What's the one question no one asks about AI agents?"
    direction: "Tight framing, direct eye contact"
  - id: 2
    beat: intro
    shotType: branded-intro
    duration: 3
---

## Director's Notes

Hook: curiosity-gap — the question IS the hook.
```

### Shot types

- **avatar**: face-to-camera with script (max 10s per shot)
- **text-card**: visual text overlay (stat, quote, contrast, list, statement)
- **branded-intro**: 3s branded opening
- **branded-outro**: 5s branded closing
- **b-roll-placeholder**: dark card with direction text for CapCut

### Story beats

hook → intro → setup → tension → five-second-moment → transformation → takeaway → cta → outro
