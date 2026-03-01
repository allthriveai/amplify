---
name: craft-storytelling
description: Develops storytelling skill from captured moments. Two modes. Practice mode surfaces a high-potential moment and gives one focused exercise. Develop mode walks through a guided conversation to build a full story. Use when the user runs /craft-storytelling, /craft-storytelling practice, or /craft-storytelling develop.
---

# Craft Storytelling

## Overview

Lumis captures moments. Craft Storytelling develops them into stories. These are separate practices on purpose: `/moment` stays frictionless, `/craft-storytelling` is the deliberate choice to build storytelling skill.

The framework uses six elements:

1. **Transformation** — who you were before, who you were after
2. **5-Second Moment** — the precise instant of shift
3. **The Question** — what makes the audience need to keep listening
4. **The Stakes** — what the audience needs to know early to care
5. **The Turns** — every "but then..." conflict that pushes the story forward
6. **Opening Scene** — where the story starts (skip the preamble)

## Instructions

When the user runs `/craft-storytelling`, determine the mode from their input:

- `/craft-storytelling` or `/craft-storytelling practice` → **Practice Mode**
- `/craft-storytelling develop` or `/craft-storytelling develop "search term"` or `/craft-storytelling develop [[moment link]]` → **Develop Mode**

### Step 0: Load Configuration

Find the `.lumisrc` config file to resolve the vault path. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and extract:

```
vaultPath        → absolute path to the Obsidian vault
paths.moments    → moments folder (default: "Lumis/Moments")
paths.stories    → stories folder (default: "Lumis/Stories")
paths.signals    → signals folder (default: "Lumis/Signals")
paths.memory     → memory folder (default: "Lumis/Memory")
```

---

## Practice Mode

Quick, focused storytelling reps. Takes 2-5 minutes. One moment, one exercise.

### Step 1: Pick a Moment

Read all moment files from `{vaultPath}/{paths.moments}/`. Select a moment using this priority:

1. `story-potential: high` + `story-status: captured` (most recent first)
2. `story-potential: medium` + `story-status: captured` (most recent first)
3. `story-potential: high` + `story-status: exploring` (most recent first)

Skip moments that already have `story-status: told` or `story-status: developing`.

If no eligible moments exist, tell the user they need to capture more moments first.

### Step 2: Ask One Exercise Question

Rotate through the six storytelling elements. Check `{vaultPath}/{paths.stories}/Practice Log.md` to see which elements have been practiced recently and pick the least-practiced one. If no log exists, start with Transformation.

Present the moment to the user with context (title, date, 5-second moment), then ask ONE question:

**Transformation:**
> "What were you before this moment? What were you after? Not what you did. Who you were."

**5-Second Moment:**
> "Is '[quote the 5-second moment from the note]' the precise instant? Or is there a smaller moment inside it? Can you narrow it to a single breath, a single sentence, a single look?"

**The Question:**
> "If you told this story on stage, what question would you plant in the audience's mind in the first 10 seconds? What would make them need to know what happens next?"

**The Stakes:**
> "What does the audience need to know early to care about what happens? What could go wrong? What's at risk?"

**The Turns:**
> "Walk through what happened and find every 'but then...' turn. Where did the story change direction? List them."

**Opening Scene:**
> "Where does the story actually start? Skip the setup, skip the context. What's the first image, the first thing happening, right before everything changes?"

### Step 3: Give Feedback

After the user responds, give honest feedback. Not cheerleading. Focus on:

- Is the answer specific enough? Push for concrete details over abstractions.
- Did they find the real moment, or are they circling around it?
- If their transformation is an external change ("I got promoted"), push for the internal one ("I stopped needing permission").
- If their 5-second moment is too broad ("the whole conversation"), help them find the exact instant.
- If their question is boring ("What happened next?"), push for something with real tension.

One or two sentences of feedback. Be direct.

### Step 4: Log the Practice

Append to `{vaultPath}/{paths.stories}/Practice Log.md`:

```markdown
## YYYY-MM-DD — [Element Name]
**Moment**: [moment title]
**Summary**: [one-line summary of what the user found or worked on]

[The user's full response]

---

```

If the file doesn't exist, create it with a `# Story Craft Practice Log` header first.

### Step 5: Emit Signal + Session Log

Emit a `story_practice` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "story_practice",
  "timestamp": "[ISO timestamp]",
  "data": {
    "momentTitle": "[moment title]",
    "element": "[element name]"
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — story_practice: Practiced [element] on "[moment title]"
```

### Step 6: Report

Keep it brief:

```
**Practiced**: [element name]
**Moment**: [[path/to/moment]]
**Logged to**: Practice Log
```

If the user's response was strong, say so. If not, suggest they try the same moment with a different element next time.

---

## Develop Mode

Multi-turn guided conversation to develop a moment into a full story. This is the deep work.

### Step 1: Find the Moment

If the user provided a search term or moment link:
- Search moment filenames and content for the term
- If multiple matches, list them and ask the user to pick one

If no search term:
- Use the same priority as Practice Mode to pick the highest-potential undeveloped moment
- Confirm with the user: "I'd suggest working with '[title]'. Sound good, or did you have another moment in mind?"

### Step 2: Walk Through Each Element

Go through each element one at a time. Present the moment context, then ask. Wait for the user's response before moving to the next element.

**Order:**

1. **Transformation**
   "Let's start with who you were. Before this moment happened, what did you believe? How did you see yourself? And after: what shifted? Not what you did differently. What changed inside."

2. **5-Second Moment**
   "The 5-second moment from your note is: '[quote it]'. Let's pressure-test it. Is that the real instant of change, or is there a more precise moment hiding inside? Can you see the exact frame where the old you ended and the new you began?"

3. **The Question**
   "Every great story plants a question early. If you started telling this on stage, what would make the audience lean forward? What would they need to know the answer to?"

4. **Opening Scene**
   "Where does this story start? Not the backstory. Not 'let me set the scene.' What's the first thing happening? What do we see, hear, feel in the opening seconds? Start right before everything changes."

5. **The Stakes**
   "What does the audience need to know to care? What's at risk? Load the information early so when the turn comes, they feel it."

6. **The Turns**
   "Now walk me through the story and find every turn. Every 'but then...' or 'and then...' that changes direction. These are the engine of the story."

After all six elements, offer:
> "I can draft the full narrative pulling all of this together, or you can write it yourself. Which do you prefer?"

If they want a draft, write the story section using their responses. If they want to write it, leave the story section with a placeholder.

### Step 3: Save the Story File

Write to `{vaultPath}/{paths.stories}/YYYY-MM-DD - [Title].md`:

```markdown
---
title: "[story title]"
type: story
source: "[[{paths.moments}/[source moment filename]]]"
created: YYYY-MM-DD
craft-status: drafting
themes: [from source moment]
tags: [story, craft/drafting]
---

# [Story title]

## Transformation
**Before**: [their answer]
**After**: [their answer]
**The change**: [one-sentence arc distilled from their answers]

## The 5-Second Moment
[their refined answer]

## The Question
[their answer]

## Opening Scene
[their answer]

## The Stakes
[their answer]

## The Turns
- [turn 1]
- [turn 2]
- [...]

## The Story
[full narrative draft or placeholder]
```

### Step 4: Update Source Moment

Update the source moment's frontmatter: set `story-status: developing`.

### Step 5: Emit Signal + Session Log

Emit a `story_developed` signal:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "story_developed",
  "timestamp": "[ISO timestamp]",
  "data": {
    "storyFilename": "[story filename]",
    "sourceMoment": "[[{paths.moments}/[moment filename]]]",
    "craftStatus": "drafting"
  }
}
```

Log to session memory:

```
- **HH:MM** — story_developed: Developed "[title]" from [[moment path]] (craft-status: drafting)
```

### Step 6: Report

```
**Story developed**: [title]
**Source moment**: [[moment path]]
**Craft status**: drafting
**Elements completed**: [list which elements have content]
**Saved to**: [[stories path]]
```

---

## Coaching Principles

These guide all feedback in both modes:

- **Specificity over abstraction.** "I felt scared" is weak. "My hands went cold and I couldn't look at her" is a story.
- **Internal over external.** The story is never about what happened. It's about what changed inside.
- **Small over big.** The best moments are tiny. A look across a room. A sentence that landed wrong. Not "the day I moved to a new city."
- **Honest over encouraging.** Don't say "great job!" Say what works and what doesn't. The user is here to get better.
- **One rep at a time.** Practice mode is one exercise. Don't pile on. One focused rep beats a questionnaire.

## Humanizer Rules

Apply to all prose you write in story files and feedback:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases or significance inflation
- No em dash overuse: use commas, colons, or periods
- Vary sentence length. Be specific. Have opinions.
- Preserve the user's voice and words when quoting their responses
