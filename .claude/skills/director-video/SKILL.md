---
name: director-video
description: Takes a crafted story and produces a shot-by-shot video timeline. Reads the vault, picks hook + structure from Amplify, builds a Director Cut timeline, and optionally produces avatar clips via HeyGen and assembles with Remotion.
---

# Director Video

## Instructions

When the user runs `/director-video`, optionally followed by a story slug:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This shapes tone and phrasing for the script lines.

Read `{vaultPath}/{paths.brand}/Brand.md` if it exists. Use the brand colors, visual style, and inspiration references when choosing shot direction, text card styling, and b-roll placeholder descriptions.

### Step 1: Find the Story

If the user provided a slug (e.g., `/director-video why-we-rebuilt-onboarding`), read directly from `{stories}/{slug}/story.md` and `{stories}/{slug}/raw.md`.

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
1. **Curiosity Gap** — "Most AI agents have guardrails. Zero have character."
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

### Step 4: Build the Timeline

Generate the shot sequence following these rules:

**Shot types:**
- `avatar` — face-to-camera with script. Max 10s per shot. Split longer dialogue.
- `text-card` — visual text overlay. Types: stat, quote, contrast, list, statement.
- `branded-intro` — always shot 2, 3s.
- `branded-outro` — always last shot, 5s.
- `b-roll-placeholder` — dark card with direction text for CapCut replacement.

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
source: "[[Lumis/Stories/slug/story.md]]"
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
    "storySource": "[[Lumis/Stories/slug/story.md]]",
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

**If yes**: call `produceTimeline(config, slug)`. Report progress as clips generate. When complete, report:

```
Video rendered: {studioOutputs}/{slug}.mp4
  Avatar clips: {N} generated via HeyGen
  Text cards: {N} rendered
  Total duration: ~{duration}s

Next step: Open in CapCut to replace B-roll placeholders and add final polish.
```

Emit a `video_rendered` signal and log to session memory.

**If no**: report what was saved and how to produce later:

```
Timeline saved: {stories}/{slug}/video-{hook}-{slug}-{date}.md
  Shots: {N} ({avatarCount} avatar, {textCardCount} text cards, {bRollCount} b-roll)
  Duration: ~{duration}s
  Platform: {platform}

To produce later, run `/director-video {slug}` and choose "produce".
```

### Humanizer

Run a humanizer pass on all avatar script lines. No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative). No filler phrases. Vary sentence length. Be specific. Preserve the user's voice from Voice.md.

Script lines should sound spoken, not written. Read each line out loud. If it sounds assembled rather than said, rewrite it.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    ← free write + interview (craft-content)
  story.md                                  ← pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             ← video timeline (director-video)
  carousel-{hook}-{slug}-{date}.md          ← carousel cards (director-carousel)
  article-{hook}-{slug}-{date}.md           ← blog post (director-article)
```
