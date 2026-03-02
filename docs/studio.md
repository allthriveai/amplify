# Studio

Lumis includes a video production pipeline powered by HeyGen (avatar video), ElevenLabs (voice), Google Imagen (AI image generation), and Remotion (branded rendering).

## Architecture

- **Remotion config** lives at repo root: `remotion.config.ts`
- **Compositions** in `src/studio/compositions/` (excluded from tsc, bundled by Remotion)
- **API clients** in `src/studio/` (heygen.ts, elevenlabs.ts, imagen.ts, render.ts)
- **Production pipeline** in `src/studio/produce-timeline.ts` (multi-shot orchestration)
- **Asset management** in `src/studio/assets.ts` (validate, resolve, copy screen-capture media)
- **Animations** in `src/studio/compositions/animations.ts` (springs, entrance/exit, transition constants)
- **Brand constants** in `src/studio/compositions/brand.ts` (colors, timing, resolution, text card sizing)
- **Studio config** is optional in `.lumisrc` under `studio` key, or via env vars
- **Public assets**: `public/raw/` (HeyGen downloads, voiceover mp3s), `public/captions/` (SRT files)
- **Story assets**: `{stories}/{slug}/assets/` (screen captures, images for screen-capture shots)

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
    "elevenlabsVoiceId": "your-voice-id",
    "googleApiKey": "your-key"
  }
}
```

Or: `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `GOOGLE_API_KEY`.

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
/craft-content (story) → /director-video (timeline) → /director-images (AI images) → HeyGen (avatar clips) → Remotion (assemble) → CapCut (final polish)
                        → /director-carousel (cards) → /director-images (AI images) → Canva/Figma (design)
                        → /director-article (post)   → /director-images (AI images) → publish
```

### Compositions

| Composition | Purpose |
|-------------|---------|
| `BrandedVideo` | Single avatar clip with intro/outro and lower third |
| `DirectorCut` | Multi-shot timeline: sequences avatar clips, text cards, screen captures, branded segments with transitions |
| `TextCard` | Five visual treatments: stat, quote, contrast, list, statement |
| `ScreenCapture` | Video or image with Ken Burns zoom; falls back to BRollPlaceholder if no asset |
| `BRollPlaceholder` | Dark card with direction text for CapCut replacement |
| `BrandedIntro` | 3s branded opening |
| `BrandedOutro` | 5s branded closing |

### Production flow (`produceTimeline`)

1. Read `timeline.md` from story folder, set status to `producing`
2. Avatar shots → HeyGen in parallel (max 3 concurrent), cached clips skipped
3. Poll until all clips complete, download to `public/raw/{slug}/shot-{id}.mp4`
4. Extract audio from avatar clips to `.mp3` for cleaner playback
5. Voiceover shots → ElevenLabs TTS, saved to `public/raw/{slug}/voiceover-{id}.mp3`
6. Screen-capture shots → resolve from `{stories}/{slug}/assets/`, copy to `public/raw/`
7. Build `ResolvedShot[]` with cumulative `startFrame` offsets
8. Auto-assign transitions between shots (fade, slide, light-leak, wipe)
9. Recalculate frame offsets accounting for transition overlaps
10. Temp JSON props → `npx remotion render DirectorCut`
11. Output to `{stories}/{slug}/{slug}.mp4`, set timeline status to `rendered`

### Timeline format

Lives at `{stories}/{slug}/timeline.md`. Shots are stored in YAML frontmatter:

```yaml
---
title: "Story Title"
type: timeline
status: draft                        # draft | approved | producing | rendered
source: "[[Lumis/Stories/slug/story.md]]"
hook: curiosity-gap
structure: point-of-high-drama
persuasion: [contrast-principle, sensory-specificity]
platform: youtube
targetDuration: 45
creativeBrief:
  hookExplored: true
  mediaAssets: ["dashboard-demo.mp4"]
  cta: "Link in bio for the full guide"
  platformTarget: youtube-standard
  productionPlan: true
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

- **avatar**: face-to-camera with script (max 10s per shot). Audio extracted to `.mp3` and extended over following non-audio shots.
- **text-card**: visual text overlay (stat, quote, contrast, list, statement)
- **screen-capture**: video or image from `assets/` folder. Videos play inline, images get a Ken Burns zoom. Falls back to placeholder if asset is missing.
- **branded-intro**: 3s branded opening
- **branded-outro**: 5s branded closing
- **b-roll-placeholder**: dark card with direction text for CapCut

### Shot fields

```yaml
- id: 5
  beat: setup
  shotType: screen-capture
  duration: 4
  asset: "dashboard-demo.mp4"      # filename in {stories}/{slug}/assets/
  direction: "Screen recording of the evaluation dashboard"
  voiceover: "Here's what the dashboard looks like in practice."
  voiceoverSource: elevenlabs       # generates TTS audio via ElevenLabs
```

- `asset` — filename resolved from `{stories}/{slug}/assets/`. Used by `screen-capture` shots.
- `voiceover` — text for ElevenLabs TTS narration. Works on any shot type.
- `voiceoverSource` — set to `elevenlabs` to generate audio. Without this, `voiceover` is just a note.

### Transitions

Transitions are auto-assigned between shots during production:

| Context | Transition | Duration |
|---------|-----------|----------|
| After branded-intro or hook beat | light-leak (overlay) | 30 frames (1s) |
| Avatar to/from text-card or screen-capture | slide | 20 frames (0.67s) |
| Default | fade | 15 frames (0.5s) |

Crossfade and slide transitions overlap adjacent shots, shortening the total timeline. Light-leak overlays don't shift timing.

### Audio bridging

Avatar audio (extracted `.mp3`) extends over subsequent non-audio shots (text cards, screen captures, b-roll). This keeps narration playing over visual cutaways instead of cutting out at shot boundaries.

### Story beats

hook → intro → setup → tension → five-second-moment → transformation → takeaway → cta → outro

## Image Generation

The `/director-images` skill generates AI images for any director format using Google Imagen 4.0.

### How it works

1. Pick a story and detect which director formats exist (video, carousel, article)
2. Extract image slots: b-roll placeholders and unassigned screen-capture shots in timelines, cards with `imageDirection` but no `asset` in carousels, user-selected sections in articles
3. Build brand-aware prompts combining brand colors/style from `.lumisrc` + content direction from the source file
4. Generate images one at a time via Imagen API, with keep/regenerate/skip for each
5. Save to `{stories}/{slug}/assets/` and update the source file's frontmatter

### Integration with rendering

For video timelines, `/director-images` sets the `asset` field on shots and changes `b-roll-placeholder` to `screen-capture`. The `ScreenCapture` composition already renders images with Ken Burns zoom, so generated images flow into `lumis studio render` with no extra steps.

### API client

`src/studio/imagen.ts` exports `createImagenClient(apiKey)` with two methods:

- `generate({ prompt, aspectRatio, sampleCount })` — POST to Imagen 4.0, returns `{ bytesBase64Encoded, mimeType }[]`
- `generateAndSave(options, outputPath)` — generate one image, write PNG to disk

Auth uses the `x-goog-api-key` header. Aspect ratios: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`.

### Vault readers

Carousel and article readers follow the same pattern as `timeline-reader.ts`:

- `readCarousel(config, slug)` / `listCarousels(config)` — find `carousel-*.md` files
- `readArticle(config, slug)` / `listArticles(config)` — find `article-*.md` files
