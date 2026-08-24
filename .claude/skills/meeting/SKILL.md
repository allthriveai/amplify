---
name: meeting
description: Processes a Plaud-synced transcript or pasted meeting notes into a structured meeting note with decisions, action items, and attendees. Use when the user runs /meeting or wants to process a meeting recording.
---

# Meeting

## Instructions

When the user runs `/meeting`, optionally followed by a filename, Plaud note title, or pasted transcript:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists — shapes how you write summaries.
Read `{vaultPath}/{paths.goals}` (Goals.md) if it exists — helps flag action items relevant to goals.

### Step 1: Find the Source

Three input modes:

**A. Plaud note reference** — The user names a specific Plaud-synced note. Look in the Plaud sync folder (typically `Plaud/` in the vault root — check for a folder matching this or similar names like `plaud`, `Plaud Notes`). Read the file, extract `file_id` from its frontmatter if present.

**B. Unprocessed Plaud notes** — If the user runs `/meeting` with no argument, scan the Plaud sync folder for notes that haven't been processed yet. List them and ask which one to process. If there's only one unprocessed note, confirm and proceed.

**C. Pasted transcript** — The user pastes transcript text directly. Use this as the source content. Set `source: "manual"`.

### Step 2: Read Existing Meetings

Read all existing meeting notes from `{vaultPath}/{paths.meetings}` (default: `Sources/Meetings/`). This helps:
- Avoid duplicates (check `plaud_file_id` in frontmatter)
- Maintain consistent formatting
- Link to related meetings

If a meeting with the same `plaud_file_id` already exists and is already processed, tell the user and ask if they want to re-process it.

### Step 3: Extract and Structure

From the raw transcript/summary, extract and organize into these sections:

**Summary** — 3-5 bullet points capturing what the meeting was about. Lead with outcomes, not process. "Decided to ship X by Friday" not "Discussed the timeline for X."

**Key Decisions** — Bulleted list of decisions made. Each decision should be a clear statement. If no explicit decisions were made, say so — don't fabricate them.

**Action Items** — Checkbox list with owners and due dates where mentioned:
```markdown
- [ ] @PersonName: Do the thing (by Friday)
- [ ] @PersonName: Follow up on X
```
Extract these from commitments made during the meeting. If someone said "I'll do X" that's an action item.

**Discussion Topics** — Organized by topic, brief notes on what was discussed. Include dissenting views and unresolved questions.

**Attendees** — Extract from speaker labels in the transcript if available. If the Plaud note has speaker labels like "Speaker 1:", "Speaker 2:", list them. If you can infer names from context, use them.

**Raw Transcript** — Include the full transcript in a collapsible section:
```markdown
<details>
<summary>Full Transcript</summary>

[transcript here]

</details>
```

### Step 4: Build the Meeting Note

Create the filename: `{date}-{slug}.md` where `{slug}` is a short kebab-case title derived from the meeting topic (e.g., `2026-04-23-weekly-standup.md`).

Build frontmatter:
```yaml
---
title: "Meeting Title"
date: YYYY-MM-DD
duration: "Xm"
attendees:
  - Person 1
  - Person 2
source: plaud        # or "manual"
plaud_file_id: "abc" # only if from Plaud
tags:
  - meeting
processed: true
---
```

### Step 5: Humanize

Apply humanizer rules to your written sections (Summary, Key Decisions, Discussion Topics). Do NOT modify the raw transcript or action items — those should reflect what was actually said.

No AI vocabulary. No filler. No significance inflation. Be direct.

### Step 6: Write to Vault

Write the meeting note to `{vaultPath}/{paths.meetings}/{filename}`.

Use the `writeMeeting()` function from `src/vault/writer.ts` if running programmatically, or write the file directly.

### Step 7: Emit Signal

Emit a `meeting_synced` signal:
```json
{
  "type": "meeting_synced",
  "data": {
    "title": "Meeting Title",
    "date": "2026-04-23",
    "source": "plaud",
    "plaudFileId": "abc123",
    "path": "Meetings/2026-04-23-weekly-standup.md"
  }
}
```

### Step 8: Offer the wiki handoff

The meeting note is a **raw source**. It lands in `{paths.meetings}` under the source
layer, immutable from here on. On its own it is inert — a meeting nobody links to is a
meeting nobody finds again.

Offer to ingest it: run the `ingest` skill against the note so the people mentioned
become entity pages, recurring topics become concept pages, and the decisions get
cross-referenced against what is already in the wiki.

Worth pushing on when the meeting named a decision, a person not yet in
`Wiki/Entities`, or a topic that has come up in earlier meetings. Skip it for routine
status calls — not every meeting is knowledge, and a wiki full of standups is a wiki
nobody reads.

### Step 9: Report

Tell the user:
- Meeting title and date
- Number of decisions and action items extracted
- Path to the meeting note
- Any connections to goals or existing meetings
- Whether it was ingested into the wiki, and which pages it touched

Keep it brief. Don't repeat the full content — they can read the note.
