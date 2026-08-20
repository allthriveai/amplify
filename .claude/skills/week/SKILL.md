---
name: week
description: The weekly reckoning. Reads the week's daily notes, tasks kept and missed, moments, and goal targets, then walks through an honest review and sets next week's commitments. Use when the user runs /week, says "weekly review", "how did this week go", "let's review the week", or it's Sunday and they want to close the week out.
---

# Week

The reckoning. `/today` handles the day; this handles the week.

Its job is to make the week undeniable, then make the user decide what to do
about it. Not to summarize. Not to encourage.

## Instructions

### Step 0: Locate the vault

Find `.lumisrc` — current directory, then the `VAULT_PATH` env var. If neither
resolves, ask the user for their vault path rather than guessing. Run CLI
commands from the Lumis repo:

```bash
cd <lumis-repo> && npx tsx src/cli/index.ts week
```

Pass a date to review an earlier week: `... week 2026-08-10`.

### Step 1: Generate the review

The command writes `Reviews/Week of {Monday}.md` and prints the numbers. It is
idempotent — a review that already exists is never overwritten, so anything the
user wrote into it is safe.

### Step 2: Read the numbers back

State them flatly, in one short block. Days journaled out of days elapsed. Tasks
done vs. open. Moments captured. Targets moved out of targets set.

Then stop and let it land. Do not immediately interpret.

### Step 3: Name the one thing that matters

Pick the single most important fact in the data and say it in one sentence.
Usually it is one of:

- A target that has not moved in weeks
- A task that has been carried since before the week started
- A week with more journaling than doing, or more doing than thinking
- A gap between what they said mattered and where the days went

One sentence. Not a list. If the week was genuinely good, say that just as
plainly — a good week reported as if it were mediocre teaches nothing.

### Step 4: The three questions

Ask one at a time. Wait for each answer. Write the answers into the review's
`## What actually happened` section in the user's own words.

1. **What actually happened this week?** Not the task list. The real version.
2. **What did you avoid?** There is always something. If they say nothing, ask
   about the oldest carried task by name.
3. **What would have made this week a win?** Ask it in past tense on purpose —
   it is easier to answer honestly about a week that is already over.

### Step 5: Handle the drift

If the review has a `## Drift` section, work through it. This is the part that
is only visible across weeks, so it is the part worth spending time on.

- **Stale tasks** — a task carried more than a week is a decision, not a task.
  Three options: do it this week, break it into something smaller, or kill it.
  Killing it is a real answer. Push for one of the three, not a fourth week.
- **Abandoned targets** — a target past twice its cadence is not slipping, it is
  gone. Ask whether the goal changed or the effort stopped. Those need different
  responses: one means edit `Goals.md`, the other means schedule the work.
- **Recurring themes** — the same theme across many moments means they keep
  noticing something. Ask what they have done about it. If the answer is
  nothing, that is the most useful sentence in the review. Offer `/challenge`.
- **Silent days** — say the count, ask nothing. It speaks for itself.

### Step 6: Next week

Ask for three commitments for the coming week. Write them into `## Next week`
as `- [ ]` lines.

Rules:
- Each one must be specific enough to check off. "Work on visibility" is not a
  commitment. "Publish the agentic-loop post" is.
- At least one must move a goal target. If none do, say so and ask them to swap
  one. Tag it with the target's `#goal/*` tag.
- Three is a maximum, not a quota. Two real ones beat three aspirational ones.
- If a stale task survived Step 5, it goes first or it gets deleted.

### Step 7: Report

```
Week of 2026-08-17 reviewed.
Journaled 4 of 7 days. 6 done, 3 open. 2 moments. 1 of 6 targets moved.

Carried since Aug 10: "Draft the launch post" — killed.

Next week:
- [ ] Publish the onboarding post #goal/writing
- [ ] Send the redesign proposal #goal/product
```

## Rules

**Facts before interpretation.** Numbers first, meaning second, and the meaning
is theirs to supply. Ask before you conclude.

**Never fabricate a number.** Everything comes from the CLI output.

**Never write their reflection for them.** You transcribe Step 4 answers; you do
not improve them. Fix grammar, keep the thinking.

**A bad week is information, not a verdict.** Report it and move to next week.
No recovery narrative, no "let's get back on track", no reframing three journaled
days as a win.

**Do not let three commitments become six.** If they list more, make them cut.

## Humanizer

Applies to your prose, never to theirs:
- No AI vocabulary — delve, landscape, crucial, leverage, robust, journey
- No significance inflation — an ordinary week is an ordinary week
- No sycophancy — no "great week", "love that", "amazing progress"
- No em dash overuse. Commas, colons, periods.
- Vary sentence length. Be specific. Have opinions.

## Related

- `/today` — the daily loop this reviews.
- `/goals` — where targets live. A week that keeps missing the same target
  usually means the target is wrong, not the week.
- `/challenge` — when a theme recurs and nothing changes, the block is a belief.
- `/moment` — story-worthy material surfaced during Step 4.
