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
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

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

**Amplify toolkit** — read from `{vaultPath}/Lumis/Amplify/`:
- `Hooks/` — 8 hook types (contrarian, curiosity-gap, story-entry, credibility, empathy, shock-data, question, pattern-interrupt). Each has a principle, good/bad examples, and anti-patterns.
- `Structures/` — 18 content structures with persuasion principles embedded
- `Persuasion-Glossary.md` — 10 persuasion principles for reference

If the user pointed at a specific piece of content (e.g., `/social-coach [[Lumis/Moments/2025-01-15 - The question I couldn't answer]]`), load that piece and focus the recommendation on it.

### Step 3: Recommend

Based on the strategy context and content inventory, recommend which moments, stories, or learnings to post. For each recommendation, specify:

- **What to post** — the source content (moment, learning, or story)
- **Which platform** — LinkedIn, X, YouTube, or multiple
- **Which pillar** — building, strategy, ethics, or thriving
- **Which hook type** — one of the 8 hook types (contrarian, curiosity-gap, story-entry, credibility, empathy, shock-data, question, pattern-interrupt) with a specific hook written for this content
- **Which structure** — from the Structures/ collection
- **Why this one** — what makes it timely, relevant, or high-potential right now

**Pillar balance check:** Compare the distribution of existing scripts against the target (building 30%, strategy 30%, ethics 20%, thriving 20%). If any pillar is underrepresented, flag it and bias recommendations toward filling the gap.

If the user pointed at specific content, skip the broad recommendation and focus entirely on that piece: which platform, which pillar, which hook, which structure, and why.

### Step 4: Generate Platform Drafts

For each recommended piece (or the user's specified content), generate platform-specific drafts:

**LinkedIn:**
- 1,300-1,900 characters. One idea per post.
- Professional but opinionated. Write like a person with a take, not a brand.
- Hook must land in the first 210 characters (the "See more" cutoff).
- Line breaks every 1-2 sentences (mobile-first reading).
- End with a genuine question that invites perspective, not "Agree?" or a call to like/share.
- 1-3 niche-relevant hashtags at the end. Never more than 3.
- For high-potential stories: consider a PDF carousel (8-10 slides) alternative.
- No engagement bait. No "I'm excited to share." No "Comment YES."

**X (Twitter):**
- Default to text posts (text outperforms video by 30% on X).
- Sharp, punchy, quotable. 70-100 characters for singles. Full 280 for Premium.
- Threads: 5-7 tweets. Tweet 1 is the hook and must stand alone. Label "Thread" or "1/".
- Link goes in the first reply, never the main post (30-50% reach penalty).
- Quote tweets with original commentary, never naked retweets.
- Adapt voice: more casual, sharper, fewer words than LinkedIn.
- Always caption video. Upload natively, never link externally.

**YouTube (Shorts):**
- Script with timed sections:
  - **Hook** (2-2.5s) — grab attention immediately. 50-60% of drop-offs happen in first 3 seconds.
  - **Problem** (5-10s) — what's going wrong, what people get wrong, or what they don't know
  - **Insight** (10-15s) — the answer, the reframe, the thing you learned
  - **Takeaway** (5-10s) — what to do with this information
- Optimal length: 15-30 seconds (highest completion rates). Max 3 minutes, but short wins.
- Design the ending to loop into the beginning (loop rate is a ranking signal).
- Burn in captions (embedded, not auto-generated). 80% watch on mute.
- Searchable title with keyword in first 5 words.
- Each Short should tease or connect to a long-form piece (funnel strategy).

**YouTube Long-Form (5-10 min):**
- Script with timed sections:
  - **Cold open** (0-15s) — start mid-action or with a provocative statement. Never "Hey guys, welcome back."
  - **Context** (15-60s) — orient the viewer, why this matters to them.
  - **Main content** (1-6 min) — micro-loop structure, each section ends with curiosity that pulls into the next.
  - **Recap/CTA** (final 30s) — summarize takeaways, point to the next video.
- Open face-to-camera for trust, cut to B-roll/graphics to illustrate, return to face for emphasis.
- Searchable title with keyword in first 5 words. Numbers increase CTR 20-30%.

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

**Run a humanizer pass on all prose in the report and generated scripts.** Read the full humanizer skill at `.claude/skills/humanizer/SKILL.md` and apply every rule: AI vocabulary replacements, significance inflation cuts, superficial -ing phrase removal, filler/hedging removal, structural tells (em dashes, rule-of-three, sentence rhythm, paragraph starts, negative parallelisms), and promotional tone checks. Preserve the user's voice in any quoted material. Then read each paragraph out loud. If it sounds assembled rather than said, rewrite it.

## Baked-In Platform Knowledge

Reference these guidelines when making recommendations:

**LinkedIn:**
- Algorithm: interest-graph over social-graph. Dwell time is the primary signal. Depth Score (dwell time + saves + sends + comment quality) determines reach.
- Top formats: PDF carousels (6.6% engagement), document posts (6.1%), native video (5.6%). Single-image posts now underperform text-only.
- Native video gets 5x more engagement than link posts. Vertical (9:16) gets 58% more mobile engagement. Under 60 seconds.
- Posting: 2-3x/week, Tuesday-Thursday, 9 AM-noon. Never twice in one day.
- 1,300-1,900 characters per text post. Hook in first 210 characters.
- 1-3 niche hashtags max. More than 5 triggers spam detection.
- Reply to every comment within 2 hours (extends post lifespan).
- LinkedIn detects and downranks AI-generated text (45% engagement penalty). Personal voice matters.
- Engagement pods detected with 97% accuracy. Engagement bait suppressed.
- LinkedIn Live: 7x reactions, 24x comments vs regular posts. Consider for community building.
- Company page organic reach down 60-66%. Personal profiles are where the reach lives.

**X (Twitter):**
- Algorithm: reply-from-author is weighted +75 (150x a like). Conversation depth dominates. Average engagement rate: 0.12%.
- Text outperforms video by 30% (the only major platform where this is true). Text is the backbone.
- Threads: 3-5x more engagement than singles. 5-7 tweets per thread. Hook in tweet 1.
- Premium is essential: 4x in-network visibility, 30-40% higher reply priority. Free accounts see near-zero link post engagement.
- External links: 30-50% reach penalty. Put links in the first reply.
- Post 3-5x/day, spaced 2-3 hours apart. Tuesday-Wednesday 9 AM-2 PM is peak.
- 70-100 characters for highest engagement on singles.
- Video: upload natively, vertical (9:16), under 45 seconds, always caption.
- Grok AI now powers ranking (replaced heuristics Oct 2025). Algorithm optimizes for "unregretted user-seconds."
- Spend 70% of X time replying to others (growth engine), 30% creating content.
- Communities: posts now visible to everyone on the platform (Feb 2026 change). Worth creating for niche topics.
- TweepCred hidden score based on account age, follower ratio, engagement quality.

**YouTube Shorts:**
- Separate algorithm from long-form (fully decoupled late 2025). Safe to experiment.
- 74% of Shorts views come from non-subscribers. Best subscriber acquisition tool.
- Hook must land in 2-2.5 seconds. 50-60% of drop-offs happen in first 3 seconds. Target: above 70% intro retention.
- Optimal length: 15-30 seconds. Max is now 3 minutes, but short performs better unless retention is exceptional.
- Captions: embedded/burned-in, not auto-generated. 40% engagement boost. 80% watch on mute.
- Retention target: 80-90% completion for top performers. Below 50% = algorithm treats as skippable.
- Face-to-camera to open (trust), then mix with B-roll/graphics (28% higher retention with 3+ visual changes).
- Post 3-7 Shorts/week. Each gets a 48-hour freshness boost.
- Searchable titles: keyword in first 5 words, under 60 characters. Numbers increase CTR 20-30%.
- Custom vertical thumbnails (1080x1920). Avoid text at bottom/right edge (UI overlay).
- Design endings to loop into beginnings (loop rate is a ranking signal).
- Each Short should funnel viewers to long-form content on the same channel.
- No TikTok watermarks (suppression signal).
- AI disclosure required for AI voice clones, deepfake face swaps, synthetic performances. Not required for AI-assisted scripting/editing.

**YouTube Long-Form:**
- 1-2 videos/week. 5-10 minutes for educational/thought leadership.
- Algorithm now prioritizes satisfaction over raw watch time. Shorter videos that satisfy outperform longer videos that get abandoned.
- CTR + retention together matter. High CTR with low retention = clickbait penalty.
- Thumbnails: expressive faces increase CTR 20-30%. High-contrast colors. A/B test with YouTube's tool.
- Chapters (timestamps from 0:00, keyword-rich titles, minimum 3, each 10+ seconds) help SEO and viewer navigation.
- Open face-to-camera, cut to visuals, return for emphasis. 3+ camera angle changes = 28% higher retention.
- Shorts are the discovery funnel. Long-form is where you build loyalty and monetize.
