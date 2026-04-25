---
name: youtube-short
description: Creates YouTube Shorts (1080x1920, under 60s) from existing video content. Handles safe zones, title cards, CTA with voiceover, background music, and rendering. Use when the user wants to create Shorts, TikToks, or Reels from existing techniques, stories, or video segments.
---

# YouTube Short

## Instructions

### Format Rules

- **Resolution**: 1080x1920 (9:16 vertical)
- **Max duration**: 60 seconds
- **Safe zones**: Content must stay in the middle 60% of the screen
  - Top 15% clear — YouTube overlays title and channel name
  - Bottom 25% clear — YouTube overlays comments, like button, share
- **No text or important visuals in the safe zone margins**

### Structure

Every Short follows this structure:

1. **Title card** (~0.3s / 10 frames) — Just a flash for the cover/thumbnail frame. Shows technique number, title, and Claude Code logo. Must look good as a static image since this is what viewers see before pressing play.

2. **Content** — The technique scene with terminal visuals, voiceover audio, and synced captions. Reuses the same shot rendering as the main video.

3. **CTA** (~2.5s / 75 frames) — "example.com" with ElevenLabs voiceover saying "Full breakdown at example.com" at natural 1x speed (not 1.1x — CTA should feel unhurried).

### Audio

- **Voiceover**: ElevenLabs at 1.1x speed for technique content (no HeyGen in Shorts). Captions must be re-timed by dividing timestamps by 1.1.
- **Background music**: `bg-music-short.mp3` plays throughout at volume 0.05
- **Music ramp at CTA**: Background music ramps from 0.05 to 0.2 during the CTA for a natural ending feel
- **CTA voiceover**: Separate ElevenLabs clip at 1x speed, plays over the ramping music

### Rendering

Render each Short individually:
```bash
npx remotion render DebuggingShort1 --image-format png --video-bitrate 30M --output out/short-1-raw.mp4
```

Then two-pass loudness normalize to -14 LUFS:
```bash
# Pass 1: measure
ffmpeg -i short-1-raw.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
# Pass 2: apply
ffmpeg -y -i short-1-raw.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:measured_I=X:measured_TP=Y:measured_LRA=Z:measured_thresh=W:offset=O:linear=true -c:v copy short-1.mp4
```

Save to vault: `Stories/{slug}/assets/short-{n}.mp4`

### What NOT to do

- Don't put text in the top 15% or bottom 25% — YouTube UI covers it
- Don't make the title card longer than 0.5s — viewers skip if the first frame is static too long
- Don't speed up CTA voiceover — it should feel natural and unhurried
- Don't use HeyGen avatar clips in Shorts unless they're already generated — terminal visuals work fine
- Don't forget the bg music ramp at the end — silence on the CTA feels abrupt
- Don't forget to normalize loudness — Shorts from different renders should sound consistent
