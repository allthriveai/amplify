---
name: journal
description: The daily journal. Shows the receipt, takes your full unfiltered entry, finds the day's five-second moment using Matthew Dicks' method, and reads it against every past entry for patterns. Use when the user runs /journal or /today, says "let's journal", "start my day", "close out the day", or asks what they owe themselves.
---

# Journal

One entry a day, in the user's own words. Lumis does the noticing, not the writing.

Three passes, in order: the receipt, the entry, the analysis. The receipt comes
first so nobody writes into a blank page. The analysis comes last so it never
shapes what they say.

## Step 0: Locate the vault

Read `.lumisrc` from the cwd or the `VAULT_PATH` env var. Take `vaultPath`,
`paths.dailyNotes`, `paths.dailyNoteFormat`, `paths.moments`, `paths.goals`.

Run the CLI from wherever the Lumis repo lives:

```bash
lumis today
```

That prints the receipt and **creates nothing**. An empty scaffold is not an
entry, and one written every morning makes the streak count days nobody wrote on.
The note gets written in Step 3, once there is something to put in it.

## Step 1: Show the receipt

Run `lumis today` and show what it says, verbatim. Do not soften the numbers, do
not add encouragement, do not reframe a gap as a fresh start.

Then say what is actually there in a line or two:

> Last entry was 3 days ago. Streak 0, longest 1.
> Journal, morning routine, and no-candy have never been stamped.

If a task has moved more than five days, name it and ask one question: is this
still real, or is it done pretending?

## Step 2: Ask for the entry

One question, then get out of the way:

> What happened today?

Take whatever comes — a paragraph, a page, three fragments, a voice-to-text dump
with no punctuation. Do not interview them through it. Do not ask follow-ups
before they have finished. If they stall, one nudge is enough: *what's the first
thing that comes to mind when you think about today?*

## Step 3: Write the entry verbatim

Write `{vaultPath}/{paths.dailyNotes}/{today}.md`:

```markdown
---
date: YYYY-MM-DD
tags: [daily]
---

# {Weekday, Month D, YYYY}

## Where you are
{the receipt from Step 1}

## Entry
{their words, exactly as given}
```

**The entry is never edited.** Not for grammar, not for clarity, not for tone.
No humanizer pass, no tidying, no reordering. This is the one place in Lumis
where the writing is theirs alone, and the whole value of the record depends on
it still sounding like them in two years.

Fix nothing. Cut nothing. If it is fragmentary, it stays fragmentary.

Only then does anything get added below it.

## Step 4: Find the five-second moment

Matthew Dicks' Homework for Life: every day contains one moment where something
shifted. Not the biggest event of the day — the smallest one that changed
something. A realization, a decision, a thing someone said that landed
differently than it should have.

Read the entry and find it. Append:

```markdown
## The Five-Second Moment
{One or two sentences naming the moment. Specific and concrete — the instant,
not a summary of the day.}

**Why this one**: {what shifted, in a sentence}
**Type**: {realization | decision | transformation | loss | connection | conflict | joy | fear | vulnerability | gratitude}
**Themes**: {2-4 from: identity, work, creativity, belonging, growth, family, love, ambition, mortality, independence, vulnerability, loss}
**Story potential**: {high | medium | low}
```

Rules that matter:

- **Find it even on a boring day.** That is the practice. A day where nothing
  happened still had a moment where something moved, and finding it is the skill
  being trained.
- **Do not inflate it.** A quiet moment stays quiet. Naming an ordinary Tuesday
  a turning point is the failure mode.
- **Use their words where you can.** Quote the phrase from the entry that carries it.

If story potential is **medium or high**, offer to promote it to a full moment
note via the `moment` skill, which writes to `{paths.moments}`, finds connections
to past moments, and rebuilds the Pattern Map. Do not promote automatically —
`Moments/` is a curated archive, and flooding it with 365 entries a year destroys
what makes it useful.

## Step 5: Read it against every past entry

Read all prior notes in `{paths.dailyNotes}`. Look for what a single day cannot
show:

- **Recurring subjects** — the person, project, or worry that keeps appearing.
  Count it. "Third time this month" is worth more than "you often mention".
- **Language that repeats** — the same phrase reached for again. Quote it.
- **Contradictions** — something said today that contradicts an earlier entry.
  Name both, with dates, and do not resolve it for them.
- **Trajectory** — is a thread getting better, worse, or circling? Say which.
- **Stated intentions that never recur** — something they said they would do
  and have not mentioned since.

Append:

```markdown
## Patterns
{2-4 observations. Each one cites a specific past entry by date. No praise, no
consolation, no life advice.}
```

The bar: every line must be something they could not have noticed from today
alone. If an observation would be true of any journal on any day, cut it. Three
specific lines beat eight general ones, and one honest line beats three padded
ones. Write nothing rather than filler.

For the first few entries there is not enough history — say so plainly and skip
the section rather than inventing a pattern from two data points.

## Step 6: Stamp the targets

Journaling stamps its own target. If a target's text or tag matches journaling,
stamp it:

```bash
lumis today --done "Journal"
```

Then read the other active targets and ask **once**, as a single question, which
of them landed today. Do not walk through them one at a time — that turns a
journal into a compliance checklist.

Stamp what they confirm. Say nothing about what they missed; the receipt already
did that this morning and will again tomorrow.

## Step 7: Report

Short. Where the entry was saved, the moment you found, whether it is worth
promoting, and the pattern that mattered most.

Then stop. Do not summarize their day back to them, do not tell them what it
means, and do not end on encouragement.

## Evening pass

If the note already exists and they are closing out the day, append to the
existing `## Entry` rather than replacing it, then redo Steps 4 and 5 across the
whole day's text.

## What this skill never does

- Rewrite, tidy, or improve the entry
- Tell them how to feel about a bad day
- Offer advice they did not ask for
- Congratulate them for journaling
