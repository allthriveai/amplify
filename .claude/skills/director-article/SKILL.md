---
name: director-article
description: Takes a crafted story and writes a long-form blog post. Reads the vault, picks hook + structure from Amplify, writes the full article using the narrative arc, and saves an article.md to the story folder.
---

# Director Article

## Instructions

When the user runs `/director-article`, optionally followed by a story slug:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This shapes tone, phrasing, and the article's voice.

Read `{vaultPath}/{paths.brand}/Brand.md` if it exists. Use the brand visual style when suggesting header images, pull quotes, or visual callouts.

### Step 1: Find the Story

If the user provided a slug (e.g., `/director-article why-we-rebuilt-onboarding`), read directly from `{stories}/{slug}/story.md` and `{stories}/{slug}/raw.md`.

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

### Step 3: Recommend Hook + Structure

Based on the story elements, recommend:

- **Hook type**: which of the 8 fits this article's opening. Consider the 5-second moment and transformation to pick the right hook.
- **Structure**: which of the 18 frameworks organizes the article. Match the story's arc (number of turns, type of transformation) to the framework.
- **Persuasion principles**: 2-3 that fit naturally into this story.

Present the recommendation with one sentence explaining each choice. Ask the user to confirm or pick different ones.

### Step 4: Build the Article

Map story elements to sections:
- Hook line from selected hook type -> section 1 (no heading, cold open). First line grabs.
- `transformation.before` + `openingScene` -> section 2 (setup). The "before" world.
- Turns from story -> sections 3-4 (tension, building). Each turn earns its own section.
- `fiveSecondMoment` -> section near the climax (no heading, let the moment land without introduction).
- `transformation.after` -> section on the shift. What changed and why.
- Key insight -> takeaway section. What this means beyond the story.
- `theQuestion` -> CTA (closing question, no heading). End with a genuine question.

Write the full article prose, not just an outline. Use Voice.md to match the user's style. Pull language from `raw.md` and `story.md`.

#### Section Rules

- **Hook opens cold.** No heading. First line grabs. The hook type determines the opening move.
- **Headings are optional.** Some beats land harder without a heading (hook, 5-second moment, CTA). Use `heading: ""` to indicate no heading.
- **Word targets guide pacing.** Setup needs room (150-250 words). The 5-second moment should be short and sharp (80-150 words). CTA is brief (50-100 words).
- **Total word count:** 800-2000 words depending on story complexity. Default ~1200.
- **The article IS the story.** Not a summary, not a listicle. It uses the narrative arc from craft-content, adapted to long-form.
- **Use the user's words.** Pull language from `raw.md` and `story.md`. The article should sound like them, not like a content mill.
- **Subheadings create breathing room.** But don't over-section. 4-6 headings for a 1200-word piece.
- **No thesis statement up front.** The reader discovers the point through the story.
- **Apply humanizer rules** to all prose.

### Step 5: Present and Edit

Show the full article with frontmatter. Then ask: "Read through it. What do you want to change?"

Options the user can request:
- Edit specific sections
- Rewrite a section from scratch
- Rethink the structure
- Change the hook
- Tighten or expand word count
- Approve as-is

Loop until the user approves.

### Step 6: Save Article

Write `{stories}/{slug}/article-{hook}-{slug}-{YYYY-MM-DD}.md` (e.g., `article-curiosity-gap-why-we-rebuilt-onboarding-2026-03-01.md`) with this format:

```yaml
---
title: "Why Your AI Agent Needs Character, Not Just Guardrails"
type: article
status: draft
source: "[[Lumis/Stories/slug/story.md]]"
hook: curiosity-gap
structure: i-used-to-believe
persuasion: [contrast-principle, narrative-transportation]
platform: blog
wordCount: 1200
sections:
  - id: 1
    beat: hook
    heading: ""
    wordTarget: 80
  - id: 2
    beat: setup
    heading: "The Agent That Passed Every Test"
    wordTarget: 200
  - id: 3
    beat: tension
    heading: "Then Someone Asked the Wrong Question"
    wordTarget: 250
  - id: 4
    beat: five-second-moment
    heading: ""
    wordTarget: 150
  - id: 5
    beat: transformation
    heading: "Character vs Compliance"
    wordTarget: 200
  - id: 6
    beat: takeaway
    heading: "What This Means for Anyone Building Agents"
    wordTarget: 200
  - id: 7
    beat: cta
    heading: ""
    wordTarget: 100
---

Most AI agents have guardrails. Zero have character. That distinction cost me six months to understand.

## The Agent That Passed Every Test

Six months ago I built an agent that aced every safety benchmark...

## Then Someone Asked the Wrong Question

...

It didn't refuse. It didn't deflect. It said: "I don't think that's who I want to be."

...

## Character vs Compliance

...

## What This Means for Anyone Building Agents

...

What character traits would you want in your agent? I'm genuinely asking.
```

After saving, emit an `article_created` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "article_created",
  "timestamp": "[ISO timestamp]",
  "data": {
    "slug": "[story-slug]",
    "storySource": "[[Lumis/Stories/slug/story.md]]",
    "hook": "[hook-type]",
    "structure": "[structure-name]",
    "platform": "blog",
    "wordCount": 1200
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — article_created: Wrote [N]-word article for "[title]" (blog)
```

### Step 7: Hand Off

Report what was saved:

```
Article saved: {stories}/{slug}/article-{hook}-{slug}-{date}.md
  Sections: {N} ({headingCount} with headings, {noHeadingCount} cold)
  Word count: ~{wordCount}
  Platform: blog

Where to publish:
- Medium: paste as-is, add a cover image
- Substack: paste as-is, the headings translate well
- LinkedIn article: paste the body, use the title as headline
- Personal blog: drop the markdown file directly
```

### Humanizer

Run a humanizer pass on all article prose. No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative). No filler phrases. Vary sentence length. Be specific. Preserve the user's voice from Voice.md.

The article should sound written by a person with opinions, not assembled by a system. Read each paragraph. If it sounds like a blog post template, rewrite it.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    <- free write + interview (craft-content)
  story.md                                  <- pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             <- video timeline (director-video)
  carousel-{hook}-{slug}-{date}.md          <- carousel cards (director-carousel)
  article-{hook}-{slug}-{date}.md           <- blog post (director-article)
```
