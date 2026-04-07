---
name: goals
description: Sets up your Goals.md through a guided conversation. Asks about your north star, what you're building toward, concrete targets, and how you'll know you've made it. Use when the user runs /goals or wants to update their goals.
---

# Goals Interview

## Instructions

When the user runs `/goals`:

### Step 0: Load Configuration

Find the `.lumisrc` config file to resolve the vault path and goals file location. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and extract:

```
vaultPath    → absolute path to the Obsidian vault
paths.goals  → goals file relative to vault root (default: "Lumis/Goals.md")
```

### Step 1: Check for Existing Goals.md

Read the existing Goals.md at `{vaultPath}/{paths.goals}`.

- If it exists and has real content (not just placeholder brackets), ask: "You already have a Goals.md. Want to start fresh or update specific sections?"
- If it exists but is the blank template (has placeholder text), proceed to the interview.
- If it doesn't exist, proceed to the interview.

### Step 2: Ask the Five Questions

Use AskUserQuestion or natural conversation to ask these five questions **one at a time**. Wait for each answer before asking the next.

**Question 1: The job you want**
"What's the role you're working toward? Be specific — company, title, team, whatever you know."

**Question 2: What you're building to get there**
"What are you building right now that proves you belong in that role? Projects, skills, public work — what's the evidence?"

**Question 3: What's in your way**
"What's between you and that role today? Be honest — missing skills, missing title, missing visibility, whatever it is."

**Question 4: Concrete targets**
"What are 3-5 specific, measurable things you want to accomplish in the next 3-6 months? Not vibes — things you can check off."

**Question 5: How you'll know it's working**
"If this is working, what does your life look like in 6 months? Not just the job — what changes?"

For each question:
- If the user gives a real answer, use it for that section.
- If the user says "skip", presses enter with no input, or says they'll do it later, use the placeholder text for that section.

### Step 3: Build Goals.md

Construct the Goals.md content using the user's answers. Write in first person, preserving their words. Clean up grammar if needed but don't rewrite their thinking.

**Placeholder text for skipped sections:**

| Section | Placeholder |
|---------|-------------|
| The job I want | `[The specific role, company, team you're targeting.]` |
| What I'm building | `[Projects, skills, and public work that prove you belong.]` |
| What's in my way | `[Gaps between where you are and where you want to be.]` |
| Targets | `[3-5 specific, measurable goals for the next 3-6 months.]` |
| How I'll know | `[What your life looks like when it's working.]` |

Format:

```markdown
# Goals

## The job I want
{answer or placeholder}

## What I'm building to get there
{answer or placeholder}

## What's in my way
{answer or placeholder}

## Targets (next 3-6 months)
{answer or placeholder}

## How I'll know it's working
{answer or placeholder}
```

### Step 4: Write and Report

Write the file to `{vaultPath}/{paths.goals}`.

Report back:

```
Goals.md written to {paths.goals}

Sections filled: {count}/5
{if any skipped: "Run /goals again anytime to fill in the rest."}
```

### Humanizer Pass

Before writing, run a humanizer pass on any prose you wrote (not the user's own words). No AI vocabulary, no filler, no significance inflation.

## How Other Skills Use Goals.md

Every content-creating skill should read Goals.md alongside Voice.md. Goals.md answers "why am I making this?" while Voice.md answers "how do I sound?"

When Goals.md exists, skills should:
- **`/craft-content`** — Surface story angles that serve the goals, not just what's interesting
- **`/linkedin-post`** — Frame posts to build visibility with the target audience (hiring managers, team leads at target companies)
- **`/director-*`** — Prioritize content that demonstrates the skills and thinking the target role requires
- **`/challenge`** — Challenge ideas through the lens of career goals, not just abstract thinking
- **`/moment`** — When analyzing moments, note connections to professional goals and career trajectory
