---
name: director-carousel
description: Takes a crafted story and produces a LinkedIn carousel plan. Reads the vault, picks hook + structure from Amplify, builds card-by-card copy with image direction, and saves a carousel.md to the story folder.
---

# Director Carousel

## Instructions

When the user runs `/director-carousel`, optionally followed by a story slug:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This shapes tone and phrasing for the card copy.

Read `{vaultPath}/{paths.brand}/Brand.md` if it exists. Use the brand colors, visual style, and inspiration references when choosing image direction and card styling.

### Step 1: Find the Story

If the user provided a slug (e.g., `/director-carousel why-we-rebuilt-onboarding`), read directly from `{stories}/{slug}/story.md` and `{stories}/{slug}/raw.md`.

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

- **Hook type**: which of the 8 fits this story's opening. Consider the 5-second moment and transformation to pick the right hook.
- **Structure**: which of the 18 frameworks organizes the card flow. Match the story's arc to the framework.
- **Persuasion principles**: 2-3 that fit naturally into this story.

Present the recommendation with one sentence explaining each choice. Ask the user to confirm or pick different ones.

### Step 4: Build the Carousel

Map story elements to cards:
- `openingScene` or hook line from selected hook type -> card 1 (hook). Bold headline, zero subtext.
- `transformation.before` -> card 2 (narrative, setup). The "before" state.
- Key data, turns, or tension points -> cards 3-5 (stat, narrative, contrast). Each card is one idea.
- `fiveSecondMoment` -> card near the middle (narrative). The moment that changed everything.
- `transformation.after` -> contrast or takeaway card. The shift.
- `theQuestion` -> CTA card. A genuine question, not "follow me for more."
- Branded closer -> last card. Name/handle + one-line description. No hard sell.

#### Card Types

- **hook** — Bold headline, minimal subtext. Stops the scroll.
- **narrative** — Headline + subtext telling a story beat. 2-3 sentences max.
- **stat** — Big number/data point + supporting context.
- **quote** — Direct quote with attribution.
- **contrast** — Two columns (left vs right, before vs after).
- **takeaway** — Key insight distilled to one line.
- **cta** — Question or action prompt. Always the second-to-last card.
- **closer** — Branded sign-off. Always the last card.

#### Card Rules

- 5-10 cards total. 7-8 is the sweet spot.
- One idea per card. If you need a comma, you need two cards.
- Headline: max 10 words. Subtext: max 30 words.
- Hook card has zero subtext. The headline IS the hook.
- CTA card asks a genuine question, not "follow me for more."
- Closer card: name/handle + one-line description. No hard sell.
- Image direction tells a designer what to create. Be specific about layout, not about exact assets.
- Carousel reads as a story top to bottom. Each card should make the reader swipe.
- Apply humanizer rules to all copy.

### Step 5: Present and Edit

Show numbered card list:

```
## Carousel: "Story Title" (8 cards, LinkedIn)

1. [HOOK] "Most AI agents have guardrails. Zero have character."
2. [SETUP / narrative] "Six months ago I built an agent" — It passed every safety test...
3. [TENSION / stat] "67%" — of companies have no character evaluation...
4. [5-SEC MOMENT / narrative] "Then a user asked it something it shouldn't answer"
5. [TRANSFORMATION / contrast] Guardrails: "Don't do this" vs Character: "This is who I am"
6. [TAKEAWAY] "Character > Compliance"
7. [CTA] "What character traits would you want in your agent?"
8. [CLOSER] @handle — one-line description
```

Ask: "Does this flow? You can reorder, rewrite, add, remove, or change card types."

Loop until the user approves. They can:
- Reorder cards
- Rewrite headlines or subtext
- Change card types
- Add or remove cards
- Adjust image direction

### Step 6: Save Carousel

Write `{stories}/{slug}/carousel-{hook}-{slug}-{YYYY-MM-DD}.md` (e.g., `carousel-curiosity-gap-why-we-rebuilt-onboarding-2026-03-01.md`) with this format:

```yaml
---
title: "Story Title"
type: carousel
status: draft
source: "[[Lumis/Stories/slug/story.md]]"
hook: curiosity-gap
structure: problem-solution
persuasion: [contrast-principle, social-proof]
platform: linkedin
cardCount: 8
cards:
  - id: 1
    beat: hook
    cardType: hook
    headline: "Most AI agents have guardrails.\nZero have character."
    subtext: ""
    imageDirection: "Dark background, bold white text, no imagery"
  - id: 2
    beat: setup
    cardType: narrative
    headline: "Six months ago I built an agent"
    subtext: "It passed every safety test. It answered every prompt correctly. But something was missing."
    imageDirection: "Split screen: checklist on left (all green), question mark on right"
  - id: 3
    beat: tension
    cardType: stat
    headline: "67%"
    subtext: "of companies have no character evaluation for their AI agents"
    imageDirection: "Large number centered, dark background, accent color on number"
  - id: 4
    beat: five-second-moment
    cardType: narrative
    headline: "Then a user asked it something it shouldn't answer"
    subtext: "It didn't refuse. It didn't deflect. It said: 'I don't think that's who I want to be.'"
    imageDirection: "Chat bubble UI mockup, the agent's response highlighted"
  - id: 5
    beat: transformation
    cardType: contrast
    leftLabel: "Guardrails"
    leftText: "Don't do this"
    rightLabel: "Character"
    rightText: "This is who I am"
    imageDirection: "Two columns, left muted/grey, right vibrant/teal"
  - id: 6
    beat: takeaway
    cardType: takeaway
    headline: "Character > Compliance"
    subtext: "An agent that knows who it is doesn't need a rule for every edge case."
    imageDirection: "Clean, minimal, statement text only"
  - id: 7
    beat: cta
    cardType: cta
    headline: "What character traits would you want in your agent?"
    subtext: "Drop your answer in the comments."
    imageDirection: "Question text centered, branded colors, comment icon"
  - id: 8
    beat: closer
    cardType: closer
    headline: "@handle"
    subtext: "One-line description"
    imageDirection: "Branded colors, clean layout, name and tagline only"
---

## Director's Notes

Hook: curiosity-gap — contrast between guardrails (expected) and character (unexpected).
Structure: problem-solution — setup the gap, show the moment, deliver the reframe.
```

After saving, emit a `carousel_created` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "carousel_created",
  "timestamp": "[ISO timestamp]",
  "data": {
    "slug": "[story-slug]",
    "storySource": "[[Lumis/Stories/slug/story.md]]",
    "hook": "[hook-type]",
    "structure": "[structure-name]",
    "platform": "linkedin",
    "cardCount": 8
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — carousel_created: Built [N]-card carousel for "[title]" (LinkedIn)
```

### Step 7: Hand Off

Report what was saved:

```
Carousel saved: {stories}/{slug}/carousel-{hook}-{slug}-{date}.md
  Cards: {N} ({hookCount} hook, {narrativeCount} narrative, {statCount} stat, {contrastCount} contrast, {ctaCount} CTA, {closerCount} closer)
  Platform: LinkedIn

Next step: Take this to Canva or Figma. The card types, copy, and image direction are all in the file.
```

### Humanizer

Run a humanizer pass on all card headlines and subtext. No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative). No filler phrases. Vary sentence length. Be specific. Preserve the user's voice from Voice.md.

Card copy should sound punchy and conversational. If a headline sounds like a corporate slide deck, rewrite it.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    <- free write + interview (craft-content)
  story.md                                  <- pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             <- video timeline (director-video)
  carousel-{hook}-{slug}-{date}.md          <- carousel cards (director-carousel)
  article-{hook}-{slug}-{date}.md           <- blog post (director-article)
```
