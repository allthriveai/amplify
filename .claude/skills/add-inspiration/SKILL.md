---
name: add-inspiration
description: Captures a person who inspires you. Researches their bio, work, and quotes on the web, then asks what you admire and what you've learned. Writes a structured note to the vault with back-links to your moments and research.
---

# Add Inspiration

## Instructions

When the user runs `/add-inspiration`, optionally followed by a person's name and/or URL:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and resolve the vault path. The people directory is at `{vaultPath}/{paths.people}` (default: `2 - Areas/Personal/People Who Inspire Me`).

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists.

### Step 1: Parse Input

Extract the person's name from the user's input. They might say:

- `/add-inspiration Matthew Dicks`
- `/add-inspiration swyx https://swyx.io`
- `/add-inspiration` (no name given, ask them)

If no name is given, ask: "Who inspires you? Give me a name."

Check if a note already exists at `{people}/{Person Name}.md`. If it does, tell the user and ask if they want to update it or pick someone else.

### Step 2: Research on the Web

Run 2-3 WebSearch queries to gather background:

1. `"{name}" bio` for background info
2. `"{name}" best work books talks projects` for key work and links
3. `"{name}" quotes` for notable quotes

If the user provided a URL, use WebFetch to pull content from it (personal site, profile, interview, etc).

From the results, compile:

- **Full name** and any common aliases (e.g., "Shawn Wang" / "swyx")
- **Bio**: 3-5 sentences covering who they are, what they do, why they matter
- **Key work**: books, talks, projects, companies, with URLs where available
- **Quotes**: 2-4 notable quotes with attribution
- **Domain tags**: 2-4 topic tags (e.g., `storytelling`, `developer-community`, `ai`)

### Step 3: Interview the User

Ask these three questions **one at a time** using AskUserQuestion or natural conversation. Wait for each answer before asking the next.

**Question 1: What do you admire?**
"What do you admire about {name}? What draws you to their work?"

**Question 2: What have you learned?**
"What have you learned from {name}? How has their thinking changed yours?"

**Question 3: Anything else?**
"Anything else you want to capture about {name}? Skip if you're done."

If the user says "skip" or gives no answer to question 3, move on.

### Step 4: Scan Vault for Back-Links

Search the vault for mentions of this person. Check:

1. **Moments** at `{paths.moments}`: search both `people` frontmatter fields and body content for the person's name (and aliases)
2. **Research** at `{paths.research}`: search note content and titles
3. **Learnings** at `{paths.learnings}`: search note content
4. **Stories** at `{paths.stories}`: search note content

Use Grep with the person's name (and aliases if they have one) across these directories.

Collect any matches as back-links: note title, path, and a short excerpt of the mention.

### Step 5: Write the Note

Write to `{vaultPath}/{paths.people}/{Person Name}.md` using this template:

```markdown
---
date: YYYY-MM-DD
tags: [inspiration, {domain-tag-1}, {domain-tag-2}]
aliases: [{alias if any}]
---

# {Person Name}

## Who they are

{Bio: 3-5 sentences. Factual, specific, no fluff.}

## What I admire

{User's answer to question 1, preserved in their words.}

## What I've learned

{User's answer to question 2, preserved in their words.}

## Their work

{Bulleted list of key work with links where available:}
- [{Title}]({URL}) — one-line description
- [{Title}]({URL}) — one-line description

## Quotes that stick with me

> "{Quote 1}" — {Person Name}

> "{Quote 2}" — {Person Name}
```

If the user gave an answer to question 3, add it as:

```markdown
## Notes

{User's additional notes, preserved in their words.}
```

If back-links were found in Step 4, add:

```markdown
## Connections in my vault

- [[{Moment or Note Title}]] — "{short excerpt of the mention}"
- [[{Another Note Title}]] — "{short excerpt}"
```

**Writing rules:**
- Preserve the user's exact words in "What I admire," "What I've learned," and "Notes." Do not rewrite their answers.
- Apply humanizer rules to the bio and any prose you write (no AI vocabulary, no filler, no em dashes, vary sentence length).
- Keep quotes accurate. Do not fabricate quotes. If you can't verify a quote, don't include it.
- Use Obsidian wiki-links (`[[Note Title]]`) for back-links.

### Step 6: Update README

Check if `{vaultPath}/{paths.people}/README.md` exists.

If it exists, read it and append the new person to the list, maintaining alphabetical order.

If it doesn't exist, create it:

```markdown
# People Who Inspire Me

- [[{Person Name}]] — {one-line summary from bio}
```

### Step 7: Emit Signal

Append to the signals file at `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "{uuid}",
  "type": "inspiration_added",
  "timestamp": "{ISO 8601}",
  "data": {
    "person": "{Person Name}",
    "tags": ["{domain-tags}"],
    "backLinks": {count},
    "path": "{paths.people}/{Person Name}.md"
  }
}
```

### Step 8: Log to Session Memory

Append to today's session log at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — inspiration_added: "{Person Name}", tags: [{tags}], back-links: {count}
```

### Step 9: Report

Tell the user what happened:

```
**Added**: {Person Name}
**Bio**: {one-line summary}
**Tags**: {tags joined with ", "}
**Back-links**: {count} connections found in your vault
**Saved to**: {paths.people}/{Person Name}.md

{If back-links > 0: "This person already shows up in {count} of your notes. Check the Connections section."}
```
