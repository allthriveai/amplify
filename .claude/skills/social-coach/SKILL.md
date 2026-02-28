---
name: social-coach
description: Reads the vault and recommends what to post where. Analyzes moments, stories, and learnings against content strategy, picks the right platform and structure, generates platform-specific drafts, and saves scripts. Use when the user runs /social-coach optionally pointing at a specific moment/story/learning.
---

# Social Coach

## Instructions

When the user runs `/social-coach`, optionally followed by a reference to a specific moment, story, or learning:

### Step 0: Load Configuration

Find the `.lumisrc` config file to resolve the vault path and all content directories. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `/Users/you/Sites/your-vault/.lumisrc` as a known fallback

Read the config and extract:

```
vaultPath            → absolute path to the Obsidian vault
paths.moments        → moments folder relative to vault root (default: "Lumis/Moments")
paths.stories        → stories folder relative to vault root (default: "Lumis/Stories")
paths.learnings      → learnings folder relative to vault root (default: "Lumis/Learnings")
paths.scripts        → scripts folder relative to vault root (default: "Lumis/Scripts")
paths.strategyDocs   → strategy docs folder relative to vault root (default: "2 - Areas/All Thrive")
paths.amplify        → amplify folder relative to vault root (default: "Lumis/Amplify")
paths.voice          → voice/identity file (default: "Lumis/Voice.md")
```

All paths resolve relative to `vaultPath`.

### Step 0b: Read Voice

Read `{vaultPath}/{paths.voice}` if it exists. This file defines who the user is, their mission, audience, beliefs, and voice. Everything you recommend and write must align with this identity. If the file doesn't exist, proceed without it but note in your report that a Voice file would improve recommendations.

### Step 0c: Read Signals + Memory

Read `{vaultPath}/{paths.signals}/signals.json` if it exists. Parse the signals array and extract:

- **Rejected recommendations** (`recommendation_rejected` signals from last 30 days): topics/pillars the user doesn't want to see again
- **Already-scripted content** (`script_drafted` signals): source content that's already been turned into scripts
- **Posted content** (`content_posted` signals): what's been posted and to which platforms
- **Top engagement** (`engagement_updated` signals): which content performed well
- **Clusters** (`cluster_formed` signals): topic clusters with enough learnings to recommend

Also read `{vaultPath}/{paths.memory}/preferences.md` if it exists. This file contains the user's stated preferences for content style, coaching focus, and topics to avoid. Apply these preferences when making recommendations.

Use this signal context to:
1. Skip moments that already have `script_drafted` signals (already scripted)
2. Avoid topics or pillars with `recommendation_rejected` signals in the last 30 days
3. Don't recommend content already posted to the same platform (`content_posted`)
4. Highlight when `moment_captured` and `learning_extracted` signals converge on the same theme
5. Boost themes with strong `engagement_updated` signals
6. Recommend content from `cluster_formed` topics

### Step 1: Read Strategy Context

Read the following files from `{vaultPath}/{paths.strategyDocs}/`:

- **`Content Pillars.md`** — the 4 content pillars and their target distribution:
  - Building (30%) — building with AI, tools, shipping products
  - Strategy (30%) — AI strategy, how to think about adoption
  - Ethics (20%) — AI ethics, responsible use, character
  - Thriving (20%) — thriving with AI, force multiplier lifestyle
- **`Content Strategy.md`** — the one-idea system, platform formats, no-pitch rule
- **`Social Media Plan.md`** — phased approach, video structure (hook -> problem -> insight -> takeaway -> CTA), cross-posting workflow

These documents define the voice, rules, and structure for all content. Every recommendation must align with them.

### Step 2: Read Content Inventory

Scan the vault for postable content:

**Moments** — read all files in `{vaultPath}/{paths.moments}/`. Focus on moments where:
- `story-potential` is `high`
- `story-status` is `captured` or `developing`
- Extract: title, date, themes, moment-type, 5-second moment, story potential

**Stories** — read all files in `{vaultPath}/{paths.stories}/` (excluding README.md and Practice Log.md). Stories are developed moments with structured storytelling elements. Extract:
- Title, source moment, craft-status (drafting/workshopped/told), themes
- Stories with `craft-status: drafting` or `workshopped` are strong candidates: the storytelling work is already done
- A story with a complete "The Story" section is ready for content adaptation
- Prioritize stories over raw moments when both cover the same theme

**Learnings** — read all files in `{vaultPath}/{paths.learnings}/` (excluding README.md). Extract:
- Title, pillar, topic tags, the core insight (first paragraph after heading)

**Existing scripts** — read all files in `{vaultPath}/{paths.scripts}/` to:
- Avoid recommending content that's already been scripted
- Track pillar balance across existing scripts (count scripts per pillar)

**Amplify toolkit** — read from `{vaultPath}/{paths.amplify}/`:
- `Structures/` — content frameworks and formats
- `Triggers/` — persuasion patterns and psychological hooks
- `Hooks.md` — scroll-stopping opening lines
- `Prompts.md` — content idea generators

If the user pointed at a specific piece of content (e.g., `/social-coach [[Lumis/Moments/2025-01-15 - The question I couldn't answer]]`), load that piece and focus the recommendation on it.

### Step 3: Recommend

Based on the strategy context and content inventory, recommend which moments, stories, or learnings to post. For each recommendation, specify:

- **What to post** — the source content (moment, learning, or story)
- **Which platform** — LinkedIn, X, YouTube, or multiple
- **Which pillar** — building, strategy, ethics, or thriving
- **Which hook style** — from the Hooks.md collection or a custom one
- **Which structure** — from the Structures/ collection
- **Why this one** — what makes it timely, relevant, or high-potential right now

**Pillar balance check:** Compare the distribution of existing scripts against the target (building 30%, strategy 30%, ethics 20%, thriving 20%). If any pillar is underrepresented, flag it and bias recommendations toward filling the gap.

If the user pointed at specific content, skip the broad recommendation and focus entirely on that piece: which platform, which pillar, which hook, which structure, and why.

### Step 4: Generate Platform Drafts

For each recommended piece (or the user's specified content), generate platform-specific drafts:

**LinkedIn:**
- 3-5 sentences. One idea per post.
- Professional but opinionated. Write like a person with a take, not a brand.
- Strong opening line that stops the scroll. No "I'm excited to share" or "Here's what I learned."
- End with a question or a clear takeaway, not a call to like/share.
- 3-5 hashtags maximum, placed at the end. No hashtag spam.

**X (Twitter):**
- Sharp one-liner version of the same idea. Punchy, direct, quotable.
- If the content is technical or complex, outline a thread: tweet 1 (hook), tweets 2-4 (the insight broken into pieces), tweet 5 (takeaway or question).
- Captions on any video content.

**YouTube (Shorts):**
- Script with timed sections:
  - **Hook** (5-10s) — grab attention, state the tension or question
  - **Problem** (15-20s) — what's going wrong, what people get wrong, or what they don't know
  - **Insight** (20-30s) — the answer, the reframe, the thing you learned
  - **Takeaway** (10-15s) — what to do with this information
  - **CTA** (5s) — follow for more, comment what you think, etc.
- Total script should target under 60 seconds when spoken.
- Searchable title that someone would actually type into YouTube.
- Hook must land in the first 3 seconds.

### Step 5: Save Scripts

For each generated draft, write a script file to `{vaultPath}/{paths.scripts}/` with the following format:

Filename: `YYYY-MM-DD-platform-short-title.md` (e.g., `2025-01-20-linkedin-testing-ai-for-character.md`)

```markdown
---
title: "Script title"
type: script
platform: [linkedin, x, youtube]
pillar: "building"
source: "[[Lumis/Moments/2025-01-15 - The question I couldn't answer]]"
structure: "Hook -> Problem -> Insight -> Takeaway"
status: draft
created: YYYY-MM-DD
tags: [script, pillar/building]
---

# [Title]

[The platform-specific script content]
```

Rules for saving:
- `platform` is an array — a script may target multiple platforms
- `source` uses a wiki-link to the original moment, learning, or story
- `pillar` matches one of: building, strategy, ethics, thriving
- `structure` names the framework used from the Amplify toolkit
- `status` starts as `draft`
- `created` is today's date
- `tags` always include `script` and `pillar/[pillar-name]`

If generating drafts for multiple platforms from the same source, create one script file per platform so each can be tracked and updated independently.

### Step 5b: Emit Signals + Session Memory

After saving scripts, emit signals and log to session memory:

**For each script saved**, emit a `script_drafted` signal to `{vaultPath}/{paths.signals}/signals.json`:
```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "script_drafted",
  "timestamp": "[ISO timestamp]",
  "data": {
    "filename": "[script filename]",
    "platform": ["linkedin", "x"],
    "pillar": "[pillar]",
    "sourceContent": "[[Lumis/Moments/source-filename]]"
  }
}
```

**Log to session memory** at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:
```
- **HH:MM** — coaching_done: Created [N] scripts for [platform list] (pillars: [pillar list])
```

### Step 6: Report

Give a concise summary of what was generated:

```
**Scripts created**: [count]
**Platforms**: [list of platforms covered]
**Pillars**: [which pillars these scripts serve]
**Pillar balance**: [current distribution vs. target, flag any gaps]

**Why these recommendations:**
- [1-2 sentences per script on why this content, this platform, this structure]

**Saved to**: [list of script file paths]
```

If pillar imbalances exist, note them:
> "You're heavy on [pillar] and light on [pillar]. Next time, look for content that fits [underrepresented pillar]."

**Story craft nudge:** Check `{vaultPath}/{paths.stories}/Practice Log.md` for the date of the last practice entry. If it's been 7+ days (or the file doesn't exist), include a one-line nudge at the end of the report:
> "It's been [N] days since your last story craft practice. A quick `/story-craft` session turns raw moments into stronger content."

Don't nag. One line, end of report, only when it's been a week or more.

Apply humanizer rules to all prose in the report and in the generated scripts:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases or significance inflation
- No em dash overuse — use commas, colons, or periods
- Vary sentence length. Be specific. Have opinions.
- Preserve the user's voice in any quoted material

## Baked-In Platform Knowledge

Reference these guidelines when making recommendations:

**LinkedIn:**
- Native video outperforms link posts by a wide margin. Upload video directly, never link to YouTube.
- Best posting times: Tuesday through Thursday, 8-10am in the audience's timezone.
- The 9/10 rule: 9 out of 10 posts should be pure value with no mention of product or service. 1 in 10 can include a soft mention.
- Document posts (carousels) perform well for frameworks and step-by-step content.
- First line is everything. If it doesn't stop the scroll, nothing else matters.

**X (Twitter):**
- Punchy and direct. Cut every word that doesn't earn its place.
- Threads work well for technical breakdowns. Tweet 1 is the hook, everything flows from there.
- Always add captions to video. Most people scroll with sound off.
- Adapt from LinkedIn, don't copy-paste. The voice is different: more casual, sharper, fewer words.
- Quote tweets with a take outperform plain retweets.

**YouTube (Shorts):**
- Under 60 seconds. Tighter is better.
- Searchable titles that match what people actually type (not clever wordplay).
- Hook must land in the first 3 seconds or viewers swipe away.
- Face-to-camera with captions performs best.
- Post consistently. Algorithm rewards frequency.
