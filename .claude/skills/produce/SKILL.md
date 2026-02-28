---
name: produce
description: Takes a script and produces a branded video using HeyGen, ElevenLabs, and Remotion. Use when the user runs /produce followed by a script reference or a direct line to turn into video. Handles the full pipeline from script to finished video.
---

# Produce Video

## Instructions

When the user runs `/produce` followed by either a script file reference or a direct quote:

### Step 0: Load Configuration

Find the `.lumisrc` config file to resolve the vault path and studio settings. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `/Users/you/Sites/your-vault/.lumisrc` as a known fallback

Read the config and extract:

```
vaultPath            → absolute path to the Obsidian vault
paths.scripts        → scripts folder relative to vault root (default: "Lumis/Scripts")
paths.studioOutputs  → video output folder relative to vault root (default: "Lumis/Studio/Output")
paths.strategyDocs   → strategy docs folder relative to vault root (default: "2 - Areas/All Thrive")
paths.amplify        → amplify folder relative to vault root (default: "Lumis/Amplify")
paths.voice          → voice/identity file (default: "Lumis/Voice.md")
studio.heygenApiKey  → HeyGen API key (or HEYGEN_API_KEY env var)
studio.heygenAvatarId → HeyGen avatar ID (or HEYGEN_AVATAR_ID env var)
studio.elevenlabsApiKey → ElevenLabs API key (or ELEVENLABS_API_KEY env var)
studio.elevenlabsVoiceId → ElevenLabs voice ID (or ELEVENLABS_VOICE_ID env var)
```

All paths resolve relative to `vaultPath`.

### Step 0b: Read Voice

Read `{vaultPath}/{paths.voice}` (default: `Lumis/Voice.md`) if it exists. This file defines who the user is, their mission, audience, beliefs, and voice. Use it to inform script generation (Step 1 when creating a new script) and to shape the lower third, outro CTA, and any on-screen text to match the user's identity. If the file doesn't exist, proceed without it.

### Step 1: Find or Create Script

Determine what the user wants to produce:

**If the user referenced an existing script** (e.g., `/produce [[Lumis/Scripts/2025-01-20-linkedin-testing-ai-for-character.md]]` or `/produce testing-ai-for-character`):
- Search `{vaultPath}/{paths.scripts}/` for a matching file
- Read the script file and extract the frontmatter (title, platform, pillar, source, structure, status) and the script body

**If the user gave a direct quote** (e.g., `/produce "We never test AI for character"`):
- Search `{vaultPath}/{paths.scripts}/` for any script containing that text or a similar title
- If a matching script exists, use it
- If no match, generate a new script using the social-coach logic:
  1. Read strategy docs from `{vaultPath}/{paths.strategyDocs}/` (Content Pillars.md, Content Strategy.md, Social Media Plan.md)
  2. Read the amplify toolkit from `{vaultPath}/{paths.amplify}/`
  3. Determine the best platform (default to YouTube Shorts for video production)
  4. Pick the appropriate pillar based on the quote's content
  5. Generate a script with the standard structure: hook -> problem -> insight -> takeaway -> CTA
  6. Save the script to `{vaultPath}/{paths.scripts}/` with proper frontmatter:
     ```yaml
     ---
     title: "Script title"
     type: script
     platform: [youtube]
     pillar: "[matched pillar]"
     source: "direct quote"
     structure: "Hook -> Problem -> Insight -> Takeaway -> CTA"
     status: draft
     created: YYYY-MM-DD
     tags: [script, pillar/[pillar-name]]
     ---
     ```
  7. Report to the user what was generated before proceeding

### Step 2: Check Studio Configuration

Verify that the required API keys and IDs are available:

- `heygenApiKey` — from `studio.heygenApiKey` in config or `HEYGEN_API_KEY` env var
- `heygenAvatarId` — from `studio.heygenAvatarId` in config or `HEYGEN_AVATAR_ID` env var
- `elevenlabsApiKey` — from `studio.elevenlabsApiKey` in config or `ELEVENLABS_API_KEY` env var
- `elevenlabsVoiceId` — from `studio.elevenlabsVoiceId` in config or `ELEVENLABS_VOICE_ID` env var

If any key is missing, stop and warn:

> "Studio API keys not configured. Add them to .lumisrc under 'studio' or set HEYGEN_API_KEY, HEYGEN_AVATAR_ID, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID environment variables."

List which keys are present and which are missing so the user knows exactly what to add. Do not proceed to video generation without all four values.

If all keys are present, proceed.

### Step 3: Generate Avatar Video

Use the studio pipeline to generate the avatar video:

1. Run `lumis studio render <script-file>` CLI command, or call the studio module directly if available
2. The pipeline sends the script text to HeyGen with the configured avatar and ElevenLabs voice
3. HeyGen returns a video generation job ID
4. Poll the HeyGen API for job completion (check every 10-15 seconds)
5. Once complete, download the raw avatar video to `public/raw/` in the project directory

If the HeyGen API returns an error, report it clearly:
- Authentication errors: "HeyGen API key is invalid or expired. Check your HEYGEN_API_KEY."
- Avatar errors: "Avatar ID not found. Check your HEYGEN_AVATAR_ID."
- Rate limits: "HeyGen rate limit hit. Wait a few minutes and try again."

### Step 4: Generate Captions

From the script content, generate timestamped captions:

1. Break the script into natural phrases (5-8 words per caption line)
2. Estimate timing based on typical speech rate (~150 words per minute)
3. Align caption breaks with sentence boundaries and punctuation pauses
4. Save the caption data alongside the video for the Remotion render step

Caption style:
- Short lines that fit on screen without wrapping
- Break at natural speech pauses
- Bold or highlight key words when the platform supports it

### Step 5: Render Branded Video

Use Remotion to composite the final branded video:

1. **Branded intro** (3 seconds) — logo/name card animation
2. **Avatar clip** — the HeyGen-generated video from Step 3
3. **Captions overlay** — the timestamped captions from Step 4, displayed as the avatar speaks
4. **Lower third** — persistent name bar: "Your Name | example.com"
5. **Branded outro** (5 seconds) — closing card with follow/subscribe CTA

Output the rendered video to `{vaultPath}/{paths.studioOutputs}/` with the filename matching the script: `YYYY-MM-DD-platform-short-title.mp4`

If Remotion is not installed or the render fails, save the raw avatar video to the output folder instead and note that branding was skipped.

### Step 6: Update Script Status

Open the original script file in `{vaultPath}/{paths.scripts}/` and update the frontmatter:

- Change `status` from `draft` to `produced`
- Add `produced: YYYY-MM-DD` with today's date
- Add `video: "[[Lumis/Studio/Output/YYYY-MM-DD-platform-short-title.mp4]]"` linking to the output

Use the Edit tool to modify only the frontmatter, leaving the script body unchanged.

### Step 7: Report

Give a concise summary of what was produced:

```
**Video produced**: [title]
**Output**: [full path to the rendered video]
**Platform(s)**: [from script frontmatter]
**Duration**: [estimated length]
**Script status**: Updated to "produced"
```

**Cross-posting instructions:**

Upload natively to each platform. Do not share links between platforms — native uploads get better reach on every platform.

Posting order:
1. **LinkedIn first** — Tuesday through Thursday morning, 8-10am. Upload the video directly. Use the LinkedIn draft from the script as the post text.
2. **X** — adapt the caption for X's voice (shorter, punchier). Add captions to the video if not burned in. Post same day or next day.
3. **YouTube Shorts** — use a searchable title (not the LinkedIn headline). Add description with keywords. Post within the same week.

**Platform-specific reminders:**
- LinkedIn: native video only, no YouTube links. First line of the post is the hook.
- X: captions required (most scroll muted). Keep the post text under 280 characters.
- YouTube: title should match what someone would search for. Description matters for discovery.

Apply humanizer rules to all prose in the report:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases or significance inflation
- No em dash overuse. Use commas, colons, or periods.
- Be direct. Say what happened and what to do next.

### Step 7b: Log to Session Memory

Append an entry to today's session log at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — video_produced: Rendered "[title]" for [platform list], output: [output path]
```
