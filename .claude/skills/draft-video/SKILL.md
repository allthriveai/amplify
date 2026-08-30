---
name: draft-video
description: Takes a crafted story and drafts a shot-by-shot video timeline, then opens a storyboard for review and approval. Reads the vault, picks hook + structure from Amplify, builds a timeline, opens the storyboard for inline editing and approval, and optionally produces avatar clips via HeyGen and assembles with Remotion. Use when the user asks to make a video from a story, or says "turn this into a video", "create a video", "make a video", or "build the video timeline".
---

# Draft Video

## Instructions

When the user runs `/draft-video`, optionally followed by a story slug:

### Step 0: Load Context

Find the `.amplifyrc` config file. Check these locations in order:

1. `.amplifyrc` in the current working directory
2. `.amplifyrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

**READ ALL FOUR STANDARDS DOCS BEFORE PROCEEDING.** These contain the locked decisions — timeline output must conform to them:

1. `{vaultPath}/Amplify/Video SOP.md` — the master workflow and gates
2. `{vaultPath}/Amplify/Brand/Video Standards.md` — dimensions, colors, fonts, components, layout
3. `{vaultPath}/Amplify/Brand/Voice Standards.md` — ElevenLabs model, speed, SSML, duration formulas
4. `{vaultPath}/Amplify/Brand/Avatar Standards.md` — HeyGen avatar ID, TTS + lipsync pipeline
5. `{vaultPath}/Amplify/Brand/Script Standards.md` — word count formulas, pronunciation landmines, read-aloud gate

Also read:
- `{vaultPath}/{paths.voice}` (Voice.md) — shapes tone and phrasing
- `{vaultPath}/{paths.strategyDocs}` — content pillars and messaging (shapes content direction)
- `{vaultPath}/{paths.brand}/Brand.md` — visual identity source of truth

If any standard is missing, STOP and tell the user to run `/init` or create the standard. Don't produce a timeline that ignores the standards.

### Step 0.1: Detect mode flags

Check the command for mode flags:

- **`--from-article`**: the user wants a video extracted from an already-published article. Skip the full creative brief and instead:
  - Read `stories/{slug}/article.md`
  - Identify the article's most shareable 60-second pitch (hook, one supporting beat, one takeaway, CTA)
  - Build a video timeline that PROMOTES the article (CTA drives traffic to it)
  - The video should tease the article, not re-explain it — leave something for the reader

- **`--sop` / `--fast`**: enforce all SOP gates strictly. Pick defaults from Voice.md + Brand.md + Amplify hooks automatically. Skip the 6-turn creative brief. Output a timeline with reasonable defaults for user review in storyboard.

- No flag: interactive creative brief mode (the existing 6-turn Q&A).

### Step 1: Find the Story

If the user provided a slug (e.g., `/draft-video why-we-rebuilt-onboarding`), read directly from `{stories}/{slug}/story.md` and `{stories}/{slug}/raw.md`.

If no slug, scan `{vaultPath}/{paths.stories}/` for story folders. List stories that have a `story.md` with `craft-status: drafting` or `craft-status: workshopped` or `craft-status: told`. Present the list and let the user pick.

Read the chosen `story.md` and `raw.md`. Extract:
- `transformation` (before/after/change)
- `fiveSecondMoment`
- `openingScene`
- `theStakes`
- `theTurns`
- `theQuestion`
- `theStory`

Validate the story has at minimum: transformation, 5-second moment, and turns. If missing, tell the user: "This story needs more development. Run `/craft-content` first to fill in the missing pieces."

### Step 2: Read Amplify Toolkit

Load the Amplify context from the vault:
- Read all hook files from `{vaultPath}/{paths.amplifyHooks}/`
- Read all structure files from `{vaultPath}/{paths.amplifyStructures}/`
- Read the persuasion glossary from `{vaultPath}/{paths.amplifyPersuasion}/Persuasion-Glossary.md`

Use `buildAmplifyContext(config)` if available, or read the files directly.

### Step 3: Creative Brief

A multi-turn conversation that builds the creative direction before you touch the timeline. Ask one or two questions at a time. Never dump all sub-steps in a single message.

#### Step 3a: Hook Exploration

Present all 8 hooks as a numbered menu. For each hook, write 1-2 example opening lines tailored to THIS story (use its transformation, 5-second moment, protagonist). Include one sentence per hook explaining WHY it works, naming the persuasion principle at play.

Example format:

```
1. **Curiosity Gap** — "Every team tracks velocity. Almost none track whether it mattered."
   Opens a gap the viewer needs closed. (Information-gap theory: withholding the answer creates pull.)

2. **Bold Claim** — "Your agent's safety benchmarks are measuring the wrong thing."
   Stakes a position that demands proof. (Commitment bias: a strong claim earns the chance to back it up.)

3. ...
```

End with: "Which pulls you in? You can pick one, combine ideas from two, or give me a direction and I'll draft something new."

#### Step 3b: Media & Visual Assets

Ask: "Are there websites, screens, demos, or other media you want to show? Video lets you cut to screen recordings or product shots."

If yes, ask which story beats should feature them. These become `screen-capture` shots in the timeline.

If no, move on.

#### Step 3c: Call to Action

Ask: "What do you want people to do after seeing this?"

Present 4-5 concrete examples:
- Comment with their answer to a question
- Subscribe / follow for more
- Visit a specific URL
- Share the video
- Just let it sit (no explicit ask)

Reference the story's natural question from `theQuestion` and ask if they want to use it or something more specific.

#### Step 3d: Structure Recommendation

NOW recommend 2-3 structures. This comes after hook, media, and CTA are decided so reasoning can reference all three. For each structure:

- How it organizes the story beats (reference specific story elements)
- Why it fits the chosen hook (the transition from hook to body)
- Which persuasion principles it activates (by name, one sentence why)
- What it does well and what it sacrifices

Label one as **Recommended**, one as **Alternative**, optionally a third as **Dark horse**. Ask which feels right.

#### Step 3e: Platform Guidance

Ask: "Shorts (under 60s) or standard (1-3 min)?"

All video output caps at under 3 minutes.

Then give specific pacing rules for the chosen format:

**Shorts** (under 60s): Hook in first 2s. No branded intro. Avatar shots 3-5s each. Skip branded outro, end on CTA. Total: 8-12 shots.

**Standard** (1-3 min): Full beat sequence. Branded intro at shot 2. Mix avatar, screen-capture, and text cards. Avatar shots 5-10s, vary rhythm. 5-second moment is the longest unbroken avatar shot. Total: 15-25 shots.

If the user already specified a platform in the command (e.g., "YouTube Short"), skip this question and confirm the choice.

#### Step 3f: Production Plan

Before building the timeline, present what production looks like:

- Number of avatar shots to generate via HeyGen (timing estimate)
- Number of text cards rendered via Remotion
- Number of screen-capture or b-roll shots needing manual recording
- Assembly plan and estimated total duration
- What needs manual work after (b-roll replacement, music, color grade)
- HeyGen avatar/voice config status (configured vs needs setup)

Ask: "This look right before I build the timeline?"

#### Creative Brief Tone

- Have opinions. Say which hook you'd pick and why. Let the user override.
- Build on answers. Reference what they said in 3a when asking 3b.
- Ask one or two questions at a time. Never all 6 sub-steps at once.
- Use their words from raw.md and story.md.
- Be direct about trade-offs.
- Skip steps when the user already answered (e.g., if they said "YouTube Short" in the command, don't ask about platform).
- If the user seems eager to see a draft, compress 3b-3e into one turn: "Before I build this: any media to include, what's the CTA, and which platform?"

### Step 6b: Open Storyboard for Review and Approval

After saving the timeline in Step 6, **automatically generate and open the storyboard**. This is the pre-production quality gate. Do not skip it. Do not proceed to production without it.

#### Find the timeline

Use the timeline file just saved in Step 6 (`{stories}/{slug}/video-{hook}-{slug}-{date}.md`).

#### Read the timeline

```
Read the video-*.md file
Parse YAML frontmatter (gray-matter) to get TimelineFrontmatter
Extract the markdown content below frontmatter as director's notes
```

#### Generate the storyboard HTML

Use the `generateStoryboardHtml` function from `src/studio/storyboard.ts`:

```typescript
import { generateStoryboardHtml } from "../../src/studio/storyboard.js";

const html = generateStoryboardHtml({
  timeline: frontmatter,       // TimelineFrontmatter with shots array
  directorsNotes: content,     // Markdown below the frontmatter
  timelinePath: timelineFile,  // Path to the .md file
  assetsDir: assetsPath,       // Optional: path to story assets
});
```

#### Save and open

Save the HTML file next to the timeline:
```
{stories}/{slug}/storyboard-{slug}.html
```

Open it in the browser:
```bash
open {stories}/{slug}/storyboard-{slug}.html
```

#### Tell the user what they can do

Report back with:
- File path
- Number of shots, total duration
- Quick reference:
  - **Edit anything**: click any text (script, beat, duration, direction) to edit inline
  - **Reorder**: drag cards to rearrange shots
  - **Preview audio**: click play on any shot to hear it, or "Play All" to hear the full script
  - **Add/delete**: use + to add shots, X to remove
  - **Export**: click "Copy YAML" or Cmd+S to copy the updated shots to clipboard
  - **Paste back**: paste the YAML into the timeline .md file to update it

#### Storyboard features

The generated HTML storyboard includes:

- **Transition table**: one row per beat with columns for words, images, music, and effects
- **Beat column**: shows beat name, shot type badge, and duration (all editable)
- **Words column**: the script or voiceover text (what you say)
- **Images column**: direction, visual description, or asset reference (what viewers see)
- **Music column**: music cues and transitions (what viewers hear)
- **Effects column**: titles, text card types, visual effects (what appears on screen)
- **Inline editing**: every cell is contenteditable, click to change anything
- **Drag-and-drop**: grab the handle to reorder rows
- **Audio preview**: play button per row reads the words column, Play All for full read-through
- **Add/delete rows**: add new rows, delete any row
- **Dirty indicator**: gold dot appears when you've made changes
- **YAML export**: copies updated shots array to clipboard (Cmd+S or button)
- **Director's notes**: editable section below the table

Keyboard shortcuts:
- **Cmd+S**: Copy YAML to clipboard
- **Escape**: Stop audio playback

#### Approval gate

The timeline's frontmatter includes `storyboard-approved: false` by default. `amplify studio render` will refuse to run until that flag is `true`.

When the user clicks "Approve" in the storyboard, the generated YAML export includes:

```yaml
storyboard-approved: true
storyboard-approved-at: 2026-04-16T14:23:00Z
```

Paste this YAML back into the timeline .md file frontmatter.

`amplify studio render {slug}` checks for this flag and REFUSES to run if:
- `storyboard-approved` is missing or `false`
- `storyboard-approved-at` is older than the timeline file's last modification time (indicates the timeline was edited AFTER approval, so approval is stale)

If the user tries to render without approval, they get: **"Storyboard not approved. Run `/draft-video {slug}` and approve the storyboard before rendering."**

#### Why this gate

Script iteration in the storyboard is free (just editing HTML). Script iteration after generation is expensive (new HeyGen credits, new ElevenLabs calls, new Remotion renders). The gate forces creative decisions upstream where they're cheap.

### Visual Design System

This section summarizes what's in [[Brand/Video Standards]]. If a rule here conflicts with the standards doc, the standards doc wins — update this section to match.

Every Remotion composition must follow these rules. They come from Brand.md and the LinkedInVertical composition (the reference implementation). **Never use dark charcoal backgrounds or white-on-blue placeholder cards.**

#### Page-Level

| Element | Value | Source |
|---------|-------|--------|
| Page background | `#fafaf7` (warm cream) | `.amplifyrc` → `brand.background` |
| Card background | `#ffffff` | `brand.card` |
| Card border | `1px solid #e8e5dd` | `brand.marble` |
| Card border radius | `16px` for video, `8px` for print | Brand.md |
| Card accent | 4px colored bar at top of card | Brand.md → Cards |

#### Colors

Read colors from `.amplifyrc` → `brand` object. The primary palette:

| Token | Hex | Use in video |
|-------|-----|-------------|
| `brand.primary` (navy) | `#1e2a4a` | Headings, title text, dark emphasis |
| `brand.secondary` (gold) | `#b8960c` | Accent highlights, active states |
| `brand.ink` | `#1a1915` | Primary body text on light backgrounds |
| `brand.inkMuted` | `#8a867a` | Labels, metadata, subtitles |
| `brand.background` | `#fafaf7` | Scene backgrounds — ALL scenes |
| `brand.marble` | `#e8e5dd` | Borders, dividers |

Content accent colors (for technique numbering, category coding):

| Name | Hex | Use |
|------|-----|-----|
| Navy | `#2d4059` | Primary accent, default headings |
| Teal | `#5b9ea6` | Technical content, tools |
| Coral | `#e07a5f` | Warnings, errors, "before" states |
| Sage | `#7a9a6d` | Success, solutions, "after" states |

#### Typography

Use `@remotion/google-fonts` to load Inter for video (matches existing compositions). For brand-accurate rendering in HTML/diagrams, use the fonts from `brand.fontDisplay`, `brand.fontBody`, `brand.fontMono`.

#### Scene Layout (matches LinkedInVertical)

Every scene gets these elements:

1. **Top accent bar** — 4px, colored, centered, animates width from 0 → 200px via spring
2. **Content area** — centered, padded `60px 80px 100px`, flex column
3. **Spectrum bar** — 4 stripes (Navy, Sage, Teal, Coral) at bottom, 4px tall, 0.4 opacity
4. **Footer** — `Follow for more {handle} · {domain}` from Brand.md, in `inkMuted`, primary for handles

#### Animations

Use Remotion springs with `{ damping: 200 }` for entrances (matches LinkedInVertical). Text slides up from 40px. Subtitles delay 8 frames. Images scale from 0.95.

#### Text & Captions — Word-by-Word Reveal

All script text and captions use **word-by-word reveal**, not full sentences appearing at once. Words appear one at a time, timed to the speech duration. The current word is bold/highlighted, previous words are visible but dimmer. This matches the `CaptionWords` component in LinkedInVertical.

Implementation: split text into words, calculate `framesPerWord = speechFrames / words.length`, render each word visible only after `wordIndex * framesPerWord`. Current word gets `fontWeight: 800` and the accent color; past words get `fontWeight: 600` and `#4a4a4a`; future words are `transparent`.

Use a frosted card container (`rgba(250,250,247,0.85)`, `borderRadius: 12`, `padding: 16px 24px`) for captions overlaying visuals.

#### Terminal Scenes

Terminal windows (Claude Code UI) stay dark (`#1a1b26`) but **float on the cream background**, not on dark charcoal. The dark terminal is the content; the page is always cream.

#### Avatar Placeholders

When no HeyGen video is available, show the script text on cream background with:
- Colored title text (use accent color for the technique)
- Technique number badge (colored square, white number)
- Spring entrance animation
- Shot label in `inkMuted` at bottom

#### Branded Outro

Cream background, the brand domain in navy, subtitle in `inkMuted`. No dark backgrounds.

### Step 4: Build the Timeline

Generate the shot sequence following these rules:

**Shot types:**
- `avatar` — face-to-camera with script. Max 10s per shot. Split longer dialogue.
- `text-card` — visual text overlay. Types: stat, quote, contrast, list, statement.
- `branded-intro` — always shot 2, 3s.
- `branded-outro` — always last shot, 5s.
- `b-roll-placeholder` — dark card with direction text for CapCut replacement.
- `animated-svg` — animated terminal/diagram scene. Used for technique visuals, code demos, agent visualizations. Terminal windows on cream background.

**Beat sequence:**
1. **Hook** (2-3s avatar): opening line from selected hook type. Grabs attention immediately.
2. **Branded intro** (3s): always shot 2.
3. **Setup** (5-10s avatar): before state from `transformation.before` and `openingScene`.
4. **Tension** (multiple shots): each turn gets an avatar shot (3-10s). Insert text cards at key data points or contrasts.
5. **5-second moment** (5-8s avatar): climax from `fiveSecondMoment`. This is the peak.
6. **Transformation** (5-8s avatar): after state from `transformation.after`.
7. **Takeaway** (3-5s): text card or avatar summarizing what changed.
8. **CTA** (3-5s avatar): genuine question from `theQuestion`.
9. **Branded outro** (5s): always last.

**B-roll placeholders**: insert where the story references something visual (a screen, a product, a place). These become CapCut edit points.

**Duration targets:**
- YouTube Shorts: 15-60s
- YouTube Standard: 1-3min (hard cap at 3 minutes)

Follow the platform guidance from Step 3e. The user already chose Shorts or Standard in the Creative Brief.

### Step 5: Present and Edit

Show the numbered shot list in this format:

```
## Timeline: "Story Title" (~60s)

1. [HOOK / avatar / 3s] "What's the one question..."
2. [INTRO / branded / 3s]
3. [SETUP / avatar / 8s] "Six months ago..."
4. [TENSION / text-card:stat / 4s] "67% of companies..."
5. [5-SEC MOMENT / avatar / 6s] "Then a user asked..."
6. [TAKEAWAY / text-card:contrast / 5s] "Guardrails vs Character"
7. [CTA / avatar / 5s] "What character traits..."
8. [OUTRO / branded / 5s]

Avatar: 5 shots | Text cards: 2 | B-roll: 0 | Total: ~39s
```

Ask: "Does this flow? You can reorder, split, add, remove, or rewrite any shot."

Loop until the user approves. They can:
- Reorder shots
- Split a long shot into two
- Add or remove shots
- Rewrite any script line
- Change shot types (avatar to text-card, etc.)
- Adjust durations

### Step 6: Save Timeline

Write `{stories}/{slug}/video-{hook}-{slug}-{YYYY-MM-DD}.md` (e.g., `video-curiosity-gap-why-we-rebuilt-onboarding-2026-03-01.md`) with this format:

```yaml
---
title: "Story Title"
type: timeline
status: draft
source: "[[Amplify/Stories/slug/story.md]]"
hook: curiosity-gap
structure: point-of-high-drama
persuasion: [contrast-principle, sensory-specificity]
platform: youtube
targetDuration: 45
creativeBrief:
  hookExplored: true
  mediaAssets: []
  cta: "What's the one question..."
  platformTarget: "youtube-shorts"
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
  # ... remaining shots
---

## Director's Notes

Hook: curiosity-gap — the question IS the hook.
Structure: point-of-high-drama — open near climax, pull back, deliver transformation.
```

After saving, emit a `timeline_created` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "timeline_created",
  "timestamp": "[ISO timestamp]",
  "data": {
    "slug": "[story-slug]",
    "storySource": "[[Amplify/Stories/slug/story.md]]",
    "hook": "[hook-type]",
    "structure": "[structure-name]",
    "platform": "[platform]",
    "shotCount": 8,
    "targetDuration": 45
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — timeline_created: Built [N]-shot timeline for "[title]" (~[duration]s, [platform])
```

### Step 7: Optionally Produce

Ask: "Timeline saved. Want to produce now? This generates {N} avatar clips via HeyGen and assembles with Remotion."

**If no**: report what was saved and how to produce later.

**If yes**, follow this exact pipeline:

#### 7a: Generate HeyGen Avatar Clips

Use the **HeyGen v3/videos API** (NOT v3/video-agents). The v3/videos endpoint gives raw talking head clips. The v3/video-agents endpoint adds its own editing and captions which we don't want — Remotion handles all editing.

```js
fetch('https://api.heygen.com/v3/videos', {
  method: 'POST',
  headers: { 'x-api-key': HEYGEN_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'avatar',
    avatar_id: AVATAR_ID,
    script: 'Your script text. <break time="1.5s"/>',
    voice_id: VOICE_ID,
    aspect_ratio: '9:16',  // or '16:9' for landscape
    background: { type: 'color', value: '#fafaf7' },
  }),
});
```

Key rules:
- **Set `aspect_ratio`** to match the composition. `"9:16"` for vertical, `"16:9"` for landscape.
- **Add `<break time="1.5s"/>` SSML** at the end of every script to prevent abrupt voice cutoffs.
- **The avatar's source recording determines framing.** If the avatar was recorded in landscape, a 9:16 output will have padding. The user may need to record a vertical avatar.
- **Give the user the scripts** and let them generate in HeyGen directly if the API results aren't right. Don't loop re-generating automatically.
- Poll `GET /v1/video_status.get?video_id={id}` until `status: "completed"`, then download from `video_url`.
- Save clips to `public/{slug}/` (for Remotion) and `{stories}/{slug}/assets/` (for the vault).

#### 7b: Transcribe for Caption Sync

**Never estimate caption timing.** Always transcribe with Whisper for word-level timestamps.

```bash
# Extract 16KHz mono audio
ffmpeg -i clip.mp4 -ar 16000 -ac 1 clip.wav -y
```

```js
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from '@remotion/install-whisper-cpp';

const output = await transcribe({
  model: 'medium.en',
  whisperPath,
  whisperCppVersion: '1.5.5',
  inputPath: 'clip.wav',
  tokenLevelTimestamps: true,
});
const { captions } = toCaptions({ whisperCppOutput: output });
```

Clean up the captions: merge split tokens (Whisper splits "Claude" into "cl"+"od"), remove `[BLANK_AUDIO]` artifacts, fix text while preserving timestamps.

Save captions JSON to `src/studio/compositions/` (next to the composition) so they can be imported at build time.

#### 7c: Wire into Remotion

**Import captions at build time** — never fetch at runtime:

```tsx
import captionsData from './clip-captions.json';
```

Use `@remotion/captions` for display:

```tsx
import { createTikTokStyleCaptions } from '@remotion/captions';
import type { Caption } from '@remotion/captions';

const { pages } = createTikTokStyleCaptions({
  captions: captionsData as Caption[],
  combineTokensWithinMilliseconds: 800,
});
```

**Match shot durations to actual video durations** using ffprobe:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 clip.mp4
```

**Use `<Series>` for sequential shots** — never manual `<Sequence>` offset math.

**Use `<Video>` from `@remotion/media`** — never `<OffthreadVideo>` (breaks Studio preview) or plain `<video>` tags (don't sync with timeline).

**Always verify the composition loads in Remotion Studio** before considering it done.

#### 7d: Report

```
Video assembled: {stories}/{slug}/{slug}.mp4
  Avatar clips: {N} generated via HeyGen v3/videos API
  Captions: Whisper-transcribed, word-level sync
  Total duration: ~{duration}s

Next step: Open in CapCut to replace B-roll placeholders and add final polish.
```

Emit a `video_rendered` signal and log to session memory.

### Humanizer

Run a humanizer pass on all avatar script lines. No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative). No filler phrases. Vary sentence length. Be specific. Preserve the user's voice from Voice.md.

Script lines should sound spoken, not written. Read each line out loud. If it sounds assembled rather than said, rewrite it.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    ← free write + interview (craft-content)
  story.md                                  ← pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             ← video timeline (draft-video)
  carousel-{hook}-{slug}-{date}.md          ← carousel cards (draft-carousel)
  article-{hook}-{slug}-{date}.md           ← blog post (draft-article)
```
