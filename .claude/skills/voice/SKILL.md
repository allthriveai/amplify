---
name: voice
description: Sets up your Voice.md through a guided conversation. Asks five questions about who you are, your mission, audience, beliefs, and communication style, then writes a populated Voice.md to the vault. Use when the user runs /voice or after running lumis init.
---

# Voice Interview

## Instructions

When the user runs `/voice`:

### Step 0: Load Configuration

Find the `.lumisrc` config file to resolve the vault path and voice file location. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and extract:

```
vaultPath    → absolute path to the Obsidian vault
paths.voice  → voice file relative to vault root (default: "Lumis/Voice.md")
```

### Step 1: Check for Existing Voice.md

Read the existing Voice.md at `{vaultPath}/{paths.voice}`.

- If it exists and has real content (not just placeholder brackets), ask: "You already have a Voice.md. Want to start fresh or update specific sections?"
- If it exists but is the blank template (has `[Your name` or `[What you` placeholder text), proceed to the interview.
- If it doesn't exist, proceed to the interview.

### Step 2: Ask the Five Questions

Use AskUserQuestion or natural conversation to ask these five questions **one at a time**. Wait for each answer before asking the next.

**Question 1: Who I am**
"What's your name, what do you do, and what's your background? Tell me whatever feels relevant."

**Question 2: My mission**
"What are you trying to accomplish? What change do you want to make?"

**Question 3: My audience**
"Who are you talking to? What do they need? What keeps them up at night?"

**Question 4: What I believe**
"What are your core beliefs? What hills will you die on? What makes your perspective different?"

**Question 5: How I talk**
"How do you talk? Direct? Warm? Technical? Casual? What words do you use or avoid?"

For each question:
- If the user gives a real answer, use it for that section.
- If the user says "skip", presses enter with no input, or says they'll do it later, use the placeholder text for that section.

### Step 3: Build Voice.md

Construct the Voice.md content using the user's answers. Write in first person, preserving their words and voice. Clean up grammar if needed but don't rewrite their personality.

**Placeholder text for skipped sections:**

| Section | Placeholder |
|---------|-------------|
| Who I am | `[Your name, what you do, your background. Write in first person.]` |
| My mission | `[What you're trying to accomplish. The change you want to make in the world.]` |
| My audience | `[Who you're talking to. What they need. What keeps them up at night.]` |
| What I believe | `[Your core beliefs. The hills you'll die on. What makes your perspective different.]` |
| How I talk | `[Your voice: direct? warm? technical? casual? Funny? Serious? What words do you use? What do you never say?]` |

Format:

```markdown
# Voice

## Who I am
{answer or placeholder}

## My mission
{answer or placeholder}

## My audience
{answer or placeholder}

## What I believe
{answer or placeholder}

## How I talk
{answer or placeholder}
```

### Step 4: Write and Report

Write the file to `{vaultPath}/{paths.voice}`.

Report back:

```
Voice.md written to {paths.voice}

Sections filled: {count}/5
{if any skipped: "Run /voice again anytime to fill in the rest."}
```

### Humanizer Pass

Before writing, run a humanizer pass on any prose you wrote (not the user's own words). No AI vocabulary, no filler, no significance inflation. The user's voice should come through, not yours.
