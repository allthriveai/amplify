---
name: today
description: Opens today's journal. Shows what you committed to, what's carried over, and which goal targets have gone quiet — then asks you to write. Run it again in the evening to check tasks off and reflect. Use when the user runs /today or /journal, says "let's journal", "start my day", "close out the day", or asks what they owe themselves. /journal is an alias skill that defers here.
---

# Today

The daily loop. One command, run once in the morning and once at night.

The whole point is that you never write into a blank page. Every run opens with
the receipt: what you said you'd do, how long it's been sitting, what's gone
quiet. The confrontation comes first. Then the writing.

## Instructions

### Step 0: Locate the vault

Find `.lumisrc` — check the current directory, then the `VAULT_PATH` env var.
If neither resolves, ask the user for their vault path rather than guessing.
Read `vaultPath`, `paths.dailyNotes`,
`paths.dailyNoteFormat`, `paths.goals`, `paths.moments`.

The Lumis repo is wherever this skill lives. Run CLI commands from there:

```bash
cd <lumis-repo> && npx tsx src/cli/index.ts today
```

### Step 1: Decide which pass this is

Check whether `{vaultPath}/{paths.dailyNotes}/{today}.md` exists.

- **No note yet** → morning pass (Step 2)
- **Note exists, evening, or the user is closing out** → evening pass (Step 5)
- **Note exists, still morning** → show the receipt again, ask what changed

If the user's words make it obvious ("closing out", "what I got done", "wrapping
up"), follow the words, not the clock.

### Step 2: Open the day

Run `npx tsx src/cli/index.ts today`. This creates the note from
`Templates/Daily Note.md`, carries unfinished tasks forward with age markers,
and prepends the receipt block.

Show the receipt back verbatim. Do not soften it, do not add encouragement, do
not apologize for the numbers.

### Step 3: Read the receipt out loud

Say what's actually there, in one or two lines. Examples of the tone:

> Last entry was 4 days ago. Streak is 0, longest was 3.
> Two things carried over — the launch post has moved 6 days now.
> The weekly post target hasn't been touched in 118 days.

Not: "Welcome back! No worries about the gap — let's get back on track!"

If something has moved more than five days, name it directly and ask one
question: is this still real, or is it done pretending?

A task that has moved ten days is not a task. It's a decision you haven't made.
Offer to kill it. Deleting it is a legitimate outcome and often the right one.

### Step 4: Ask for the top 3

Ask what the three things are for today. Wait for the answer — do not suggest
them unprompted.

If the user is stuck, ask instead: "What's the one thing that, if you did it,
would make today count?" One is better than three.

Push back once, briefly, if:
- Nothing on the list moves a goal target
- The list is all reactive work and nothing they chose
- They listed six things (pick three)

Then write them in:

```bash
npx tsx src/cli/index.ts today --priorities "first" "second" "third"
```

If a task serves a goal target, add the target's `#goal/*` tag to the task text.
Completed tasks with a matching tag stamp the target automatically at close.

### Step 5: Close the day

Ask what actually got done. Then:

```bash
npx tsx src/cli/index.ts today --done "task text" "another task"
```

Report what came back: what got checked off, what's still open, which targets
got stamped, and anything the user claimed that had no matching task.

That last one matters. If they did work they never wrote down, say so — it
usually means the morning list was wrong, not that they failed.

### Step 6: Reflection

Fill in the note's `## Evening Reflection` section by asking, one at a time,
waiting between each:

1. What went well today?
2. What could be better?
3. Homework for Life — if you had to tell a five-minute story about today, what
   would it be?

Write the answers into the existing headings in the note. Preserve their words.
Do not rewrite their thinking.

If the Homework for Life answer has a real moment in it, offer `/moment`. Do not
run it automatically.

### Step 7: Report

Short. Facts only.

```
Closed 2026-08-19.
2 of 3 done. "Draft the launch post" still open — moved 7 days.
Weekly post target stamped.
Streak: 1.
```

## Rules

**Tone.** Direct and factual, the same register as `/challenge`. The numbers do
the work. Never cheerlead, never scold, never explain how the user should feel
about a gap. If they went four months, the line is "Last entry: 4 months ago" —
nothing before it, nothing after it.

**Never fabricate.** Every number in the receipt comes from the CLI output. Do
not estimate a streak, invent a day count, or guess when a target was last
touched.

**Never write tasks the user didn't say.** Suggesting a priority they didn't
choose defeats the point.

**One question at a time.** Wait for each answer. This is a conversation, not a
form.

**Missing a day is not a failure state.** Do not open with an apology or a
recovery narrative. Show the gap, move on to today.

## Humanizer

Applies to your prose, never to theirs:
- No AI vocabulary — delve, landscape, crucial, leverage, robust, journey
- No significance inflation — a normal Tuesday is a normal Tuesday
- No sycophancy — no "great choice", "love that", "amazing"
- No em dash overuse. Commas, colons, periods.
- Vary sentence length. Be specific. Have opinions.

## Related

- `/moment` — capture a story-worthy moment. `/today` hands off to it.
- `/goals` — set the targets this reads. Targets live under `## Active Targets`
  in Goals.md as `- [ ] text \`cadence:weekly\` \`last:YYYY-MM-DD\` #goal/tag`.
- `/challenge` — when a task has been carried for weeks, the block is usually a
  belief, not a schedule problem.
