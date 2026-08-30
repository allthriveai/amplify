---
name: craft-content
description: Finds a story through free writing and guided questions, then shapes it into a clean narrative draft. The story is the asset. Video timelines, hooks, and production happen in /draft-video. Never writes without your review.
---

# Craft Content

## Instructions

When the user runs `/craft-content`, optionally followed by a topic or reference:

### Step 0: Load Context

Find the `.amplifyrc` config file. Check these locations in order:

1. `.amplifyrc` in the current working directory
2. `.amplifyrc` at the path specified by `VAULT_PATH` environment variable
3. `.amplifyrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This shapes how you write for the user.

Read `{vaultPath}/Amplify/Brand/Script Standards.md` if it exists. The story you're about to write will be converted into a video script — following Script Standards now prevents rework later.

If the user referenced an existing piece (moment, story, research), read it from the vault.

### Step 0.1: Detect mode flags

- **`--quick`**: skip the full 6-turn interview. Go directly to: one 5-second moment, one transformation, one turn. Used for quick-turn LinkedIn videos that don't need a full story arc. Minimum viable story for `/draft-video` downstream.

- **`--from-wiki {page}`**: instead of free-writing, read a wiki page and use it as the free-write input. Fast path when the material is already distilled — cite the page as `[[Page Title]]` in `story.md` so `suggest_content` can tell it has been drafted.

- No flag: full interview mode (the existing 6-turn process).

### Step 1: Free Write

Start here. Always. No framework, no structure, no pressure.

Say something like:

"Don't worry about structure or getting it right. Just free write what you want to say. What's the idea? What happened? What's on your mind? Dump it all out and I'll help you shape it."

Let the user write as much or as little as they want. If they give you a sentence, that's fine. If they give you five paragraphs, that's fine. Don't interrupt, don't ask clarifying questions yet. Just receive it.

If they've already told you the idea (in the `/craft-content` argument or earlier in conversation), acknowledge what they've said and ask: "What else? Keep going. What's the part you haven't said yet?"

### Step 2: Find the Story

Now use the free write as raw material. Ask these five questions **one at a time**, waiting for each answer. Use AskUserQuestion or natural conversation. Reference specific things from their free write to make the questions concrete, not abstract.

**1. What changed?**
"What's the 5-second moment? When did someone's understanding shift? Not the whole arc, just the single instant where something clicked or broke or turned."

If the user struggles, help them find it in their free write. Point to the part that feels like it matters most and ask: "Is this the moment? Or is the moment something that led to this?"

**2. Who changed?**
"Who's the protagonist? Is it you? Someone else? A character the audience will follow?"

The author doesn't have to be the protagonist. The protagonist is whoever transforms.

**3. What was true before that moment?**
"What's the opposite of that 5-second moment? That's your opening. If the moment is trust, you start with suspicion. If it's clarity, you start confused."

Maximum distance between the opening and the moment = maximum arc.

**4. What's the Elephant?**
"What question or tension will keep people watching in the first 30 seconds? What's the need, the problem, the mystery that makes someone lean in?"

The Elephant must appear early. It can "change colors" — start as one thing and reveal itself to be about something deeper.

**5. What went wrong?**
"Where's the failure, the contradiction, the 'but'? What didn't go as planned?"

Stories connect with "but" and "therefore," never "and." Each beat should contradict or consequence the last. Failure beats success. Vulnerability creates connection.

### Step 2b: Save Raw Interview

Create the story folder at `{vaultPath}/{paths.stories}/{slug}/` where `{slug}` is a short kebab-case name derived from the story title (e.g., "why-we-rebuilt-onboarding", "the-meeting-that-changed-my-mind").

Save the raw interview to `{vaultPath}/{paths.stories}/{slug}/raw.md`:

```markdown
---
title: "[short title] — Raw Interview"
type: craft-raw
created: YYYY-MM-DD
tags: [craft, raw]
---

## Free Write
[the user's free write, exactly as they wrote it]

## 1. What changed? (5-second moment)
[their answer]

## 2. Who changed? (protagonist)
[their answer]

## 3. What was true before? (the opposite)
[their answer]

## 4. What's the Elephant?
[their answer]

## 5. What went wrong? (the "but")
[their answer]
```

Preserve their exact words. Do not clean up, edit, or summarize.

If the user provides additional context during the interview (clarifications, follow-ups, "oh and also..."), append those under the relevant question with a `### Additional context` sub-section.

### Step 3: Write the Story Draft

Using the free write, the five answers, and Voice.md, write the story.

The story is the asset. It has no hooks, no CTAs, no platform formatting. It's a clean narrative that the director skills remix into video, carousel, or article.

**Rules:**
- Use the user's words from the free write and interview wherever possible. Don't replace their language with yours.
- Start at the opposite. End at the 5-second moment.
- Connect beats with "but" and "therefore," not "and."
- The Elephant appears early in the story.
- No thesis statements. Don't tell the audience the point before you show it.
- No lecturing. If you stop the narrative to explain something, you've stopped telling a story.
- No feature lists, no pitch structure, no "here's what we built."
- Apply the Dinner Test: would you say this to a friend at dinner? If not, rewrite it.
- Active voice only. Never passive. "Agents enroll" not "agents are enrolled." "The academy evaluates" not "agents get evaluated."
- **Run a humanizer pass on everything you write.** Read the full humanizer skill at `.claude/skills/humanizer/SKILL.md` and apply every rule: AI vocabulary replacements, significance inflation cuts, superficial -ing phrase removal, filler/hedging removal, structural tells (em dashes, rule-of-three, sentence rhythm, paragraph starts, negative parallelisms), and promotional tone checks. Then read each paragraph out loud. If it sounds assembled rather than said, rewrite it.
- Do NOT invent claims, stats, stories, or details the user didn't provide.
- No hooks, CTAs, or platform-specific structure. The director skills add those later.

Save to `{vaultPath}/{paths.stories}/{slug}/story.md` with frontmatter:

```yaml
---
title: "Title"
type: story
craft-status: drafting
created: YYYY-MM-DD
tags: [craft]
---
```

### Step 4: Review and Approve

**This step is mandatory. Never skip it.**

Open the story file so the user can read it. Then ask:

"Read through it. What do you want to change?"

Options:
- Edit specific parts — make the changes, show again
- Rewrite — go back to Step 3 with new direction
- Rethink the story — go back to Step 2
- Approve

Loop on edits until the user explicitly approves. Do not interpret "looks good" as final approval.

### Step 5: Report and Hand Off

Update the story frontmatter: change `craft-status` to `told`.

Report what happened:

```
**Story**: {title}
**Status**: told
**Saved to**: {stories}/{slug}/

Contents:
  raw.md   — your free write and interview answers
  story.md — the narrative draft

Ready to turn this into content? Pick a format:
  /draft-video {slug}     — shot-by-shot video timeline
  /draft-carousel {slug}  — LinkedIn carousel with card copy
  /draft-article {slug}   — long-form blog post
```

### Step 5b: Log to Session Memory

Append to today's session log at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — craft_content: "{title}", status: {status}
```

## Story Folder Structure

Each story lives in its own folder under `{paths.stories}/`:

```
{paths.stories}/{slug}/
  raw.md                                    ← free write + 5 interview answers (craft-content)
  story.md                                  ← pure narrative draft (craft-content)
  video-{hook}-{slug}-{date}.md             ← video timeline (draft-video)
  carousel-{hook}-{slug}-{date}.md          ← carousel cards (draft-carousel)
  article-{hook}-{slug}-{date}.md           ← blog post (draft-article)
```

**`/craft-content` creates:** `raw.md` and `story.md`
**Director skills create:** `video-*.md`, `carousel-*.md`, `article-*.md`

The story is the reusable asset. Director skills remix it into different formats. Try a video and a carousel from the same story. Come back in 6 months and write an article from the same source.
