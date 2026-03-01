---
name: challenge
description: Challenges an idea or belief through critical thinking prompts. Picks 2-3 prompts matched to the input, runs them one at a time with honest feedback, logs to Challenge Log, and optionally promotes insights to the second brain. Use when the user runs /challenge, optionally followed by an idea.
---

# Challenge

## Overview

Lumis builds storytelling skill through `/craft-storytelling`. `/challenge` builds critical thinking. In an age of sycophantic AI, the ability to examine your own beliefs matters. This skill pressures an idea through targeted prompts, gives honest feedback, and logs the work.

The skill is separate from storytelling on purpose. Storytelling finds what's true in a moment. Challenge questions whether what you believe is actually true.

## Instructions

When the user runs `/challenge`, optionally followed by an idea:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and extract:

```
vaultPath        -> absolute path to the Obsidian vault
paths.thinking   -> thinking folder (default: "2 - Areas/Personal/Thinking")
paths.signals    -> signals folder (default: "Lumis/Signals")
paths.memory     -> memory folder (default: "Lumis/Memory")
paths.voice      -> voice file (default: "Lumis/Voice.md")
```

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This provides context for who the user is, but does not change how you challenge them.

### Step 1: Get the Idea

If the user provided an idea (e.g. `/challenge AI will replace most knowledge work within 5 years`), use it.

If not, ask:

"What idea or frame of thinking do you want to challenge today?"

Accept their answer via conversation. The idea can be a belief, an opinion, a strategy, a hot take, a plan, an assumption. Anything they hold to be true.

### Step 2: Select Prompts

Analyze the user's idea and select **2-3 prompts** from the Critical Thinking Toolkit below. Do not rotate mechanically. Pick the prompts that will put the most useful pressure on this specific idea.

#### Critical Thinking Toolkit

| Prompt | When to use | Question |
|--------|-------------|----------|
| **Assumption Detector** | Any belief or opinion | "What hidden assumptions are you making? What would need to be true for this to hold?" |
| **Perspective Flip** | Strong opinions, takes on people/groups | "If someone you respect disagreed with this, what would they say? Make their case." |
| **Steelman** | Hot takes, dismissals, critiques | "What's the strongest version of the opposing argument?" |
| **Evidence Audit** | Claims presented as fact, intuition-based beliefs | "What evidence supports this? What evidence would change your mind?" |
| **Second-Order Effects** | Plans, strategies, "we should do X" | "If you act on this, what happens next? And after that? What breaks?" |
| **Bias Check** | Emotional convictions, pattern-matching | "What cognitive biases might be at play here? Confirmation bias? Recency? Survivorship?" |

**Selection examples:**

- A belief about AI ethics -> Assumption Detector + Perspective Flip
- A hot take dismissing something -> Steelman + Evidence Audit
- A strategy or plan -> Second-Order Effects + Bias Check
- A strong opinion about a group -> Perspective Flip + Steelman + Bias Check
- An intuition-based conviction -> Evidence Audit + Assumption Detector + Bias Check

After selecting, tell the user which prompts you picked and why. One sentence per prompt. Be direct about why this idea needs these specific pressures.

### Step 3: Run the Prompts

Present each prompt **one at a time**. Wait for the user's response before presenting the next.

For each prompt:

1. Present the prompt question clearly.
2. Wait for the user's response.
3. Give brief, honest feedback. Not cheerleading. Focus on:
   - Did they actually engage or deflect?
   - Did they find something real or stay surface-level?
   - Is their reasoning specific or vague?
   - Did they pass the test or reveal a gap in their thinking?
   - If their answer is strong, say so in one sentence. If it's weak, say why.

**Feedback rules:**
- One or two sentences max per response.
- No "great point!" or "interesting perspective!" or "that's a thoughtful answer."
- Be specific about what worked or didn't.
- If they're dodging, say so: "You're defending the idea instead of questioning it."
- If they found something real: "That's the crack. Pull on that thread."

### Step 4: Log to Challenge Log

After all prompts are done, generate a one-line takeaway that captures the core tension or insight from the session. This is your summary, not the user's words.

Append to `{vaultPath}/Lumis/Thinking/Challenge Log.md`:

```markdown
## YYYY-MM-DD - [Short version of the idea]

**Original idea**: [The user's idea, preserved in their words]

**Prompts used**: [Prompt 1], [Prompt 2], [Prompt 3 if used]

### [Prompt 1 Name]
**Q**: [The question asked]
**A**: [User's response, preserved in their words]

### [Prompt 2 Name]
**Q**: [The question asked]
**A**: [User's response, preserved in their words]

### [Prompt 3 Name] (if used)
**Q**: [The question asked]
**A**: [User's response, preserved in their words]

**Takeaway**: [One-line takeaway]

---

```

If the file doesn't exist, create it with a `# Challenge Log` header first.

### Step 5: Ask About Promoting to Second Brain

Use AskUserQuestion:

"Did this shift your thinking? Want to save it as a note in your second brain?"

Options:
- **Yes, save it** — "This challenge changed something. Save it."
- **No, just the log** — "Good exercise, but no lasting shift. Keep it in the log."

### Step 6: Promote to Second Brain (if yes)

If the user chose yes, write a note to `{vaultPath}/{paths.thinking}/{Topic}.md` where `{Topic}` is a clean title derived from the idea (e.g., "AI Replacing Knowledge Work" or "Remote Work Productivity").

```markdown
---
date: YYYY-MM-DD
tags: [thinking, challenge]
source: "[[Lumis/Thinking/Challenge Log]]"
---

# {Topic}

## What I believed

{The user's original idea, in their words.}

## What changed

{Summary of what the challenge revealed. What assumptions were exposed, what perspectives shifted, what gaps appeared. Write this from the user's responses, not your own analysis. 2-4 sentences.}

## Takeaways

{Bulleted list of concrete insights from the session. Pull from the user's actual responses. 2-4 bullets.}
```

**Writing rules:**
- Preserve the user's words in "What I believed."
- Write "What changed" and "Takeaways" from their responses, not your opinions.
- Apply humanizer rules to any prose you write (no AI vocabulary, no filler, no em dashes).
- Keep it short. This is a reference note, not an essay.

### Step 7: Emit Signal + Session Log

Emit a `challenge_completed` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "challenge_completed",
  "timestamp": "[ISO timestamp]",
  "data": {
    "idea": "[short version of the idea]",
    "prompts": ["[prompt 1 name]", "[prompt 2 name]"],
    "promoted": true/false,
    "path": "[path to promoted note or challenge log]"
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — challenge_completed: Challenged "[short idea]", prompts: [prompt names], promoted: yes/no
```

### Step 8: Report

```
**Challenged**: [The original idea, short form]
**Prompts used**: [Prompt 1], [Prompt 2], [Prompt 3 if used]
**Takeaway**: [One-line takeaway]
**Logged to**: Lumis/Thinking/Challenge Log.md
**Saved to second brain**: [yes -> path | no]
```

---

## Coaching Principles

These guide all feedback during the challenge:

- **Honest over kind.** This is not a safe space for ideas. It's a pressure test. Say what's true.
- **No sycophancy.** Never praise effort. Respond to substance. If the answer is weak, say so.
- **Push past deflection.** If the user restates their belief instead of questioning it, call it out.
- **Specific over general.** "Your reasoning has a gap" is useless. "You're assuming X without evidence" is useful.
- **One rep at a time.** Each prompt gets full attention. Don't rush through to the next one.
- **The user's words matter.** Preserve them in the log and any promoted notes. Don't rewrite their thinking.

## Humanizer Rules

Apply to all prose you write in challenge logs, promoted notes, and feedback:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases or significance inflation
- No em dash overuse: use commas, colons, or periods
- Vary sentence length. Be specific. Have opinions.
- Preserve the user's voice and words when quoting their responses
