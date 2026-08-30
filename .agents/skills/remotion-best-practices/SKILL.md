---
name: remotion-best-practices
description: Best practices for Remotion - Video creation in React
metadata:
  tags: remotion, video, react, animation, composition
---

## When to use

Use this skill whenever you are dealing with Remotion code to obtain the domain-specific knowledge.

## Hard Rules

These rules are non-negotiable. Every composition must follow them. They exist because we've hit these problems in production.

1. **Use `<Series>` for sequential shots.** Never compute frame offsets manually with `<Sequence>`. `<Series>` handles sequencing correctly and avoids React strict mode issues.

2. **Use `<Video>` from `@remotion/media` for video playback.** Never use plain HTML `<video>` tags (they don't sync with Remotion's timeline). Never use `<OffthreadVideo>` — it works for CLI rendering but fails silently in Studio preview.

3. **Import JSON data at build time.** Never use `useDelayRender()` + `fetch()` for data the composition needs. If the fetch hangs, the Studio white-screens with no error. Import JSON files directly: `import data from './data.json'`.

4. **Spread empty props on Remotion components.** Remotion 4.0.431 has a bug where `React.createElement(Component, null)` crashes the Studio. Add `{...{}}` to `<Series>`, `<TransitionSeries>`, and any Remotion component that would otherwise have no explicit props.

5. **Always test in the Studio preview, not just CLI render.** `npx remotion render` and `npx remotion still` use different code paths than the Studio. A composition can render fine via CLI but white-screen in the Studio.

6. **Caption timing must come from transcription, not estimation.** Never divide duration evenly across words. Always transcribe audio with Whisper (`@remotion/install-whisper-cpp`) for word-level timestamps, then use `@remotion/captions` with `createTikTokStyleCaptions()` to display them.

## Whisper Transcription Workflow

After generating or regenerating audio (ElevenLabs, HeyGen, etc.), transcribe it for word-level caption timing. Never estimate timing manually.

```bash
# Transcribe any technique audio (pass number as arg, defaults to 4):
node tools/transcribe.mjs <clip-name>

# For HeyGen talking head clips, extract audio first:
ffmpeg -i public/<slug>/<clip>.mp4 -vn -ar 16000 -ac 1 /tmp/clip.wav
# Then run the transcribe script pointed at the wav
```

The script uses `@remotion/install-whisper-cpp` with the `medium.en` model, extracts word-level tokens, merges punctuation with previous words, and outputs a caption JSON array. Caption format:
```json
{ "text": "word ", "startMs": 100, "endMs": 300, "timestampMs": 100, "confidence": 1 }
```

**After transcription, always check for:**
- Split words (e.g. `"hol "` + `"istically."`) — merge them manually
- Punctuation-only tokens that didn't get merged
- Timestamps that look wrong (first word should start near 0-200ms, not at 0ms exactly)

## Captions

When dealing with captions or subtitles, load the [./rules/subtitles.md](./rules/subtitles.md) file for more information.

## Using FFmpeg

For some video operations, such as trimming videos or detecting silence, FFmpeg should be used. Load the [./rules/ffmpeg.md](./rules/ffmpeg.md) file for more information.

## Audio visualization

When needing to visualize audio (spectrum bars, waveforms, bass-reactive effects), load the [./rules/audio-visualization.md](./rules/audio-visualization.md) file for more information.

## Sound effects

When needing to use sound effects, load the [./rules/sound-effects.md](./rules/sound-effects.md) file for more information.

## Render Quality

These rules prevent blurry video output. They exist because we spent hours debugging quality loss.

1. **Always render with `--image-format png --video-bitrate 20M`.** Default JPEG screenshots at 80% quality add visible compression. PNG is lossless. 20Mbps prevents h264 from softening the output.

2. **Never embed videos at a resolution lower than the composition.** Chromium's CSS upscaling (bilinear interpolation) produces noticeably soft/blurry video compared to the source. A 720p video in a 1080p composition will always look bad.

3. **Pre-upscale source videos with FFmpeg lanczos when needed.** If source video is lower resolution than the composition, upscale it before Remotion sees it:
   ```bash
   ffmpeg -i input.mp4 -vf "scale=1080:-2:flags=lanczos" -c:v libx264 -crf 12 -preset slow -c:a copy output.mp4
   ```
   Lanczos produces significantly sharper upscales than Chromium's bilinear.

4. **Generate HeyGen videos at 4k (2160x3840) for 1080p compositions.** Downscaling is free quality. Use `dimension: { width: 2160, height: 3840 }` in the v2 API. The v3 API accepts `resolution: "4k"`.

5. **`<OffthreadVideo>` does NOT improve quality.** It extracts frames via FFmpeg as images, which actually upscale worse than the browser's native `<Video>` element. Stick with `<Video>` from `@remotion/media`.

6. **Audio `playbackRate` raises pitch — voices sound tinny and unnatural.** Remotion's `<Audio playbackRate={1.1}>` speeds up playback but boosts high frequencies, making voices sound thin and high-pitched. There is no pitch-correction in Remotion. FFmpeg `atempo` preserves pitch but breaks HeyGen lip sync. To get tighter pacing without ruining voice quality, use a playback rate constant (e.g. `TECHNIQUE_PLAYBACK_RATE = 1.1`) to shorten shot `durationInFrames` only: `Math.round((seconds * FPS) / TECHNIQUE_PLAYBACK_RATE)`. Keep `<Audio>` and `<SyncedCaptions>` at 1x so audio plays at natural pitch and captions stay in sync. Align visual animations (terminal line reveals, agent spawn delays) to 1x audio timestamps: `frame = audioMs * FPS / 1000`.

## Render Pipeline

Always follow this pipeline when producing a final video:

1. **Render at 2x scale** for sharp output: `npx remotion render CompositionId --image-format png --video-bitrate 20M --scale 2`
2. **Two-pass loudness normalization** to -14 LUFS (LinkedIn/YouTube standard):
   ```bash
   # Pass 1: measure
   ffmpeg -i raw.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
   # Pass 2: apply (use measured values from pass 1)
   ffmpeg -y -i raw.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:measured_I=X:measured_TP=Y:measured_LRA=Z:measured_thresh=W:offset=O:linear=true -c:v copy output.mp4
   ```
3. **Save to vault**, not amplify repo. Output to `Stories/{slug}/assets/`.

## ElevenLabs Audio Speed

- **Without HeyGen** (terminal visuals, no lip sync): Speed audio to 1.1x with `ffmpeg -filter:a "atempo=1.1"` after generation. Adjust caption timestamps by dividing all `startMs`/`endMs`/`timestampMs` by 1.1. Cut scene durations by 0.5s to match.
- **With HeyGen** (avatar lip sync): Keep audio at 1x. HeyGen lip sync breaks at non-1x speeds.

## HeyGen Drift Check

After every HeyGen video generation, compare audio and video durations. If drift > 0.1s, regenerate (up to 3 attempts). Only the v3 API (`/v3/videos`) should be used — never v2.

```typescript
const drift = Math.abs(audioDuration - videoDuration);
if (drift > 0.1) { /* regenerate */ }
```

## Caption Sync

1. **Whisper splits words unpredictably.** Check caption JSON for split tokens like `"hol "` + `"istically."` or `"Sc "` + `"reenshot "`. Merge them manually — each token renders as a separate word in captions.

2. **Synthetic/estimated caption timing drifts.** Evenly-spaced timestamps (e.g. 334ms per word) don't match natural speech cadence. Later sentences accumulate error and captions appear before the voice. Always use real Whisper transcription.

3. **When passing `playbackRate` to `SyncedCaptions`, it must match the `<Audio>` playbackRate.** If audio plays at 1x, captions must track at 1x. Mismatched rates cause progressive drift.

4. **Visual animations must be timed to audio, not to fixed frame numbers.** Convert audio timestamps to frames: `frame = audioMs * FPS / 1000`. When audio plays at 1x in a shortened shot, use actual audio timestamps for animation delays.

## HeyGen Integration

When generating avatar clips with HeyGen for use in Remotion:

1. **Always use the v3 API** via `createHeyGenClient()` from `src/studio/heygen.ts`. Never use v2 endpoints (`/v2/video/generate`) — they produce lower quality avatars. Never use `v3/video-agents` — that adds its own editing, captions, and cuts that conflict with Remotion.

2. **Always generate at 4k** (`dimension: { width: 2160, height: 3840 }` for vertical). Downscaling to 1080p in Remotion preserves sharpness. Generating at 720p and upscaling produces blurry output.

3. **Use ElevenLabs for voice, not HeyGen TTS.** Generate audio with ElevenLabs (your cloned voice), upload to HeyGen as an audio asset, then generate the avatar video with lip sync. This gives better voice quality and your actual voice.

4. **Do not speed up audio before HeyGen lip sync.** HeyGen lip sync fails at non-1x speeds (e.g. 1.1x via FFmpeg atempo). Keep audio at natural speed for HeyGen, and use `TECHNIQUE_PLAYBACK_RATE` on shot duration only for pacing.

5. **Add SSML `<break>` at the end of scripts** to prevent abrupt cutoffs: `"Your script text. <break time=\"1.5s\"/>"`

6. **After generating, always:** extract audio → transcribe with Whisper → import captions JSON at build time → merge any split tokens → display with synced captions.

## How to use

Read individual rule files for detailed explanations and code examples:

- [rules/3d.md](rules/3d.md) - 3D content in Remotion using Three.js and React Three Fiber
- [rules/animations.md](rules/animations.md) - Fundamental animation skills for Remotion
- [rules/assets.md](rules/assets.md) - Importing images, videos, audio, and fonts into Remotion
- [rules/audio.md](rules/audio.md) - Using audio and sound in Remotion - importing, trimming, volume, speed, pitch
- [rules/calculate-metadata.md](rules/calculate-metadata.md) - Dynamically set composition duration, dimensions, and props
- [rules/can-decode.md](rules/can-decode.md) - Check if a video can be decoded by the browser using Mediabunny
- [rules/charts.md](rules/charts.md) - Chart and data visualization patterns for Remotion (bar, pie, line, stock charts)
- [rules/compositions.md](rules/compositions.md) - Defining compositions, stills, folders, default props and dynamic metadata
- [rules/extract-frames.md](rules/extract-frames.md) - Extract frames from videos at specific timestamps using Mediabunny
- [rules/fonts.md](rules/fonts.md) - Loading Google Fonts and local fonts in Remotion
- [rules/get-audio-duration.md](rules/get-audio-duration.md) - Getting the duration of an audio file in seconds with Mediabunny
- [rules/get-video-dimensions.md](rules/get-video-dimensions.md) - Getting the width and height of a video file with Mediabunny
- [rules/get-video-duration.md](rules/get-video-duration.md) - Getting the duration of a video file in seconds with Mediabunny
- [rules/gifs.md](rules/gifs.md) - Displaying GIFs synchronized with Remotion's timeline
- [rules/images.md](rules/images.md) - Embedding images in Remotion using the Img component
- [rules/light-leaks.md](rules/light-leaks.md) - Light leak overlay effects using @remotion/light-leaks
- [rules/lottie.md](rules/lottie.md) - Embedding Lottie animations in Remotion
- [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) - Measuring DOM element dimensions in Remotion
- [rules/measuring-text.md](rules/measuring-text.md) - Measuring text dimensions, fitting text to containers, and checking overflow
- [rules/sequencing.md](rules/sequencing.md) - Sequencing patterns for Remotion - delay, trim, limit duration of items
- [rules/tailwind.md](rules/tailwind.md) - Using TailwindCSS in Remotion
- [rules/text-animations.md](rules/text-animations.md) - Typography and text animation patterns for Remotion
- [rules/timing.md](rules/timing.md) - Interpolation curves in Remotion - linear, easing, spring animations
- [rules/transitions.md](rules/transitions.md) - Scene transition patterns for Remotion
- [rules/transparent-videos.md](rules/transparent-videos.md) - Rendering out a video with transparency
- [rules/trimming.md](rules/trimming.md) - Trimming patterns for Remotion - cut the beginning or end of animations
- [rules/videos.md](rules/videos.md) - Embedding videos in Remotion - trimming, volume, speed, looping, pitch
- [rules/parameters.md](rules/parameters.md) - Make a video parametrizable by adding a Zod schema
- [rules/maps.md](rules/maps.md) - Add a map using Mapbox and animate it
- [rules/voiceover.md](rules/voiceover.md) - Adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS
