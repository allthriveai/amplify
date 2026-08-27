---
name: journal
description: Opens today's journal entry. Alias for the daily loop — shows what you committed to, what's carried over, and which goal targets have gone quiet, then asks you to write. Run it again in the evening to check things off. Use when the user runs /journal, says "let's journal", "journal today", or "write my entry".
---

# Journal

This is an alias. The daily loop lives in the `today` skill — run it and follow it
exactly.

Both names exist because the command is `/today` but the habit is called journaling,
and the word people reach for should work.

## Instructions

Invoke the `today` skill and follow its steps in full: locate the vault from `.lumisrc`,
decide whether this is the morning or evening pass, run the CLI, show the receipt
verbatim without softening it, then ask the writing questions.

Do not reimplement any of that here. If the two ever disagree, `today` is correct.
