---
name: draft-carousel
description: Takes a crafted story and drafts a LinkedIn carousel plan. Reads the vault, picks hook + structure from Amplify, builds card-by-card copy with image direction, and saves a carousel.md to the story folder. Use when the user asks to make a carousel, slide deck for LinkedIn, or says "turn this into a carousel", "make carousel slides", or "create a LinkedIn carousel".
---

# Draft Carousel

## Instructions

When the user runs `/draft-carousel`, optionally followed by a story slug:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This shapes tone and phrasing for the card copy.

Read `{vaultPath}/{paths.brand}/Brand.md` if it exists. Use the brand colors, visual style, and inspiration references when choosing image direction and card styling.

### Step 1: Find the Story

If the user provided a slug (e.g., `/draft-carousel why-we-rebuilt-onboarding`), read directly from `{stories}/{slug}/story.md` and `{stories}/{slug}/raw.md`.

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

A multi-turn conversation that builds the creative direction before you touch the cards. Ask one or two questions at a time. Never dump all sub-steps in a single message.

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

Ask: "Do you have screenshots, diagrams, or visual assets for specific cards? Carousels work best with 2-3 visual anchors beyond text."

If yes, ask which cards they belong to.

If no, ask preferred visual style: photography, illustration, or text-only.

#### Step 3c: Call to Action

Ask: "What do you want people to do after seeing this?"

Present 4-5 concrete examples:
- Comment with their take
- Save the post for later
- DM you about the topic
- Follow for more on this subject
- Skip the ask entirely (let the content speak)

Reference the story's natural question from `theQuestion` and ask if they want to use it or something more specific.

#### Step 3d: Structure Recommendation

NOW recommend 2-3 structures. This comes after hook, media, and CTA are decided so reasoning can reference all three. For each structure:

- How it organizes the story beats (reference specific story elements)
- Why it fits the chosen hook (the transition from hook to body)
- Which persuasion principles it activates (by name, one sentence why)
- What it does well and what it sacrifices

Label one as **Recommended**, one as **Alternative**, optionally a third as **Dark horse**. Ask which feels right.

#### Step 3e: Platform Guidance

Give LinkedIn-specific carousel guidance:

**Dimensions & Format:**
- Export as PDF at 1080x1350px (4:5 portrait). This is non-negotiable.
- LinkedIn renders these as "document posts" — each PDF page becomes a swipeable slide.
- Upload via Start a Post → "..." → "Add a document". NOT image upload.
- Max file size 25MB. Keep under 5MB for fast loading.

**Font Sizes (CRITICAL — mobile-first):**
- Over 60% of LinkedIn sessions are on mobile. The carousel renders at ~500px wide on phones.
- **Headlines: minimum 60px.** Anything smaller is unreadable on mobile.
- **Body text: minimum 36px.** Never go below 30px for any text.
- **Labels/metadata: minimum 24px.**
- If you're designing at 1080px and it looks "too big" on your screen, it's probably right for mobile.
- Test: shrink your browser to 500px wide. Can you read everything? If not, make it bigger.

**Content Per Slide:**
- **Maximum 25-30 words per slide.** If you have more, add another slide.
- **6-8 lines of text max per slide.** Fewer is better.
- **One idea per slide.** If you need a comma, you need two slides.
- Visual > text. If you can show it with an image/diagram, don't write it.

**Slide Count:**
- Sweet spot is **5-7 slides**. Fewer than 5 feels thin. More than 7 causes drop-off.
- Card 1 stops the scroll. Bold, zero subtext.
- Card 2 must create momentum. If they don't swipe past card 2, you've lost them.
- CTA card should ask a commentable question, not "follow me for more"
- Closer card is name/handle only. No hard sell.

**Layout & Spacing:**
- Minimum **60px padding** on all sides. Keep text 80px from edges.
- High contrast: dark text on light backgrounds.
- Dense infographic/cheat-sheet tables do NOT work on LinkedIn — text is too small at mobile rendering size. Split into multiple slides instead.

If the user mentions a different platform, adapt guidance accordingly.

#### Creative Brief Tone

- Have opinions. Say which hook you'd pick and why. Let the user override.
- Build on answers. Reference what they said in 3a when asking 3b.
- Ask one or two questions at a time. Never all 5 sub-steps at once.
- Use their words from raw.md and story.md.
- Be direct about trade-offs.
- Skip steps when the user already answered.
- If the user seems eager to see a draft, compress 3b-3e into one turn: "Before I build this: any visual assets to include, what's the CTA, and anything specific about card count?"

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

- **5-7 cards total.** 5-6 is the sweet spot for engagement before drop-off.
- **One idea per card.** If you need a comma, you need two cards.
- **Max 25-30 words per card.** This is a hard limit, not a suggestion.
- **Headline: 3-8 words, minimum 60px font.** Billboard at 60mph energy.
- **Subtext: max 20 words, minimum 36px font.** Supporting, not competing.
- **No text smaller than 24px.** Labels, metadata, captions — all 24px+.
- Hook card has zero subtext. The headline IS the hook.
- CTA card asks a genuine question, not "follow me for more."
- Closer card: name/handle + one-line description. No hard sell.
- **Visual-first.** Each card should have a visual element (SVG, icon, diagram) that communicates the idea faster than text. The visual does the heavy lifting; text supports it.
- Image direction tells a designer what to create. Be specific about layout, not about exact assets.
- Carousel reads as a story top to bottom. Each card should make the reader swipe.
- **Avoid dense tables, comparison charts, or cheat sheets** — they look great at full size but are unreadable when LinkedIn renders them at 500px on mobile. Break into one comparison per slide instead.
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
creativeBrief:
  hookExplored: true
  mediaAssets: []
  cta: "What character traits would you want in your agent?"
  platformTarget: "linkedin"
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

### Step 6b: Render PDF

After saving the carousel markdown, render a PDF for LinkedIn upload.

1. Read the brand config from `.lumisrc` (the `brand` object).
2. Map brand tokens to `CarouselBrand`:
   - `brand.primary` → `primary`
   - `brand.secondary` → `secondary`
   - `brand.accent` → `accent`
   - `brand.background` → `background`
   - `brand.ink` → `ink`
   - `brand.inkLight` → `inkLight`
   - `brand.inkMuted` → `inkMuted`
   - `brand.fontDisplay` → `displayFont`
   - `brand.fontBody` → `bodyFont`
   - `brand.fontsUrl` → `fontsUrl`
   - `brand.borderRadius` → `borderRadius`
3. Call `renderCarouselPdf({ cards: frontmatter.cards, brand, slug, config }, outputPath)` where `outputPath` is `{stories}/{slug}/carousel-{hook}-{slug}-{date}.pdf` (same name as the markdown but with `.pdf` extension).
4. The PDF renders at 1080x1350px (LinkedIn portrait 4:5 ratio), one card per page, with brand fonts and colors.

If the render fails (e.g., Playwright not installed), report the error but don't block. The markdown file is still the source of truth.

### Step 7: Hand Off

Report what was saved:

```
Carousel saved: {stories}/{slug}/carousel-{hook}-{slug}-{date}.md
PDF rendered:   {stories}/{slug}/carousel-{hook}-{slug}-{date}.pdf
  Cards: {N} ({hookCount} hook, {narrativeCount} narrative, {statCount} stat, {contrastCount} contrast, {ctaCount} CTA, {closerCount} closer)
  Platform: LinkedIn
  Dimensions: 1080x1350px (4:5 portrait)

Next step: Upload the PDF to LinkedIn as a document post. Go to linkedin.com/feed → Start a post → Document icon → upload the PDF.
```

### Humanizer

Run a humanizer pass on all card headlines and subtext. No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative). No filler phrases. Vary sentence length. Be specific. Preserve the user's voice from Voice.md.

Card copy should sound punchy and conversational. If a headline sounds like a corporate slide deck, rewrite it.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    <- free write + interview (craft-content)
  story.md                                  <- pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             <- video timeline (draft-video)
  carousel-{hook}-{slug}-{date}.md          <- carousel cards (draft-carousel)
  carousel-{hook}-{slug}-{date}.pdf         <- rendered PDF for LinkedIn upload
  article-{hook}-{slug}-{date}.md           <- blog post (draft-article)
```
