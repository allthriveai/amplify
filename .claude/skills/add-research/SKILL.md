---
name: add-research
description: Adds a research resource to the user's Obsidian vault. Use when the user shares a URL, PDF, article, or document and wants to save it as research. Triggers on "add research", "save this", "add this to my vault", "clip this", sharing a URL or PDF for research purposes.
---

# Add Research to Vault

## Instructions

When the user shares a URL, PDF, article, or any resource to add as research:

### Step 0: Load Configuration

Read `.lumisrc` from the current working directory or the vault root to discover paths and categories.

```
paths.research      → root folder for research notes (default: "Lumis/Research")
paths.researchTldr  → TL;DR companion folder (default: "Lumis/Research/TL;DR")
researchCategories  → array of { name, folder, keywords[] }
```

If `.lumisrc` is missing, use these defaults:
- Research root: `Lumis/Research`
- TL;DR folder: `Lumis/Research/TL;DR`
- Categories: AI & Agents, Tools & Software, Books, Articles, Courses & Learning

Resolve all paths relative to `vaultPath` from the config.

### Step 1: Fetch and Read the Content

- If it's a URL: use WebFetch to retrieve the content
- If it's a PDF: use the Read tool with page ranges for large PDFs
- If it's pasted text: work with what's provided
- Extract: title, author, source URL, publish date, and the full content

### Step 2: Categorize

Match the content against the `researchCategories` from config. For each category, check if the content's title, tags, or body text contains any of its `keywords` (case-insensitive).

Pick the category with the most keyword matches. If no category matches, place the note directly in the research root folder and suggest the user create a new category in `.lumisrc` if they expect more content on that topic.

### Step 3: Write the Full Research Note

Write the file to `{research}/{category.folder}/{filename}.md` (or `{research}/{filename}.md` if uncategorized).

Use this structure:

```markdown
---
title: "[Title of the resource]"
source: "[URL or source reference]"
author: "[Author name(s)]"
published: "[Date if known]"
created: "[Today's date YYYY-MM-DD]"
tags:
  - resource/[type: article, paper, guide, video, book, tool, course, podcast, documentation]
  - [topic tags in kebab-case]
---

# [Title]

[Comprehensive notes on the content organized by the source's own structure. Preserve key details, code examples, frameworks, data points, and quotes. Use the source's headings as section structure. This should be thorough enough that the user never needs to go back to the original.]

---

**Source**: [Title](URL)
```

Rules for the full note:
- Use the source's own section headings and structure
- Preserve code examples exactly
- Include tables, lists, and frameworks faithfully
- Don't summarize away useful detail — this is the reference copy
- Generate a filename from the title in kebab-case (e.g., `building-agents-with-mcp.md`)

### Step 4: Write the TL;DR Companion

Create a companion file in the TL;DR folder (`paths.researchTldr`) named `{title} - TLDR.md`:

```markdown
---
title: "[Title] - TL;DR"
source: "[URL or source reference]"
parent: "[[{category.folder}/{filename}]]"
created: "[Today's date YYYY-MM-DD]"
tags:
  - tldr
  - [same topic tags as the parent note]
---

# TL;DR: [Title]

## What is it?
[1-2 sentences]

## Key Points
- [Bulleted list of the 3-7 most important takeaways]

## Why it matters
[1-2 sentences on relevance or how it connects to existing knowledge]

---

Full notes: [[{category.folder}/{filename}]]
```

The `parent` field and the bottom link should use Obsidian wiki-link syntax pointing to the full note's path relative to the research root. If the note is uncategorized (no category matched), use just `[[{filename}]]` without a folder prefix.

### Step 5: Humanize the Notes

Run a humanizer pass on both files before finishing. Apply these rules to all prose (not code, data, or structure):

**Remove AI vocabulary** — replace these words with natural alternatives:
- delve → dig into, explore, look at
- landscape → space, field, area
- crucial/pivotal → important, key, matters because
- showcase → show, demonstrate
- leverage → use
- utilize → use
- facilitate → help, enable
- comprehensive → thorough, full, complete
- robust → solid, strong, reliable
- innovative → new, novel, clever
- cutting-edge → latest, modern, new
- game-changer → big shift, major change
- paradigm → model, approach
- synergy → combination, working together
- empower → let, help, enable
- streamline → simplify, speed up

**Cut filler and hedging:**
- Remove "It's worth noting that", "It's important to note", "Interestingly"
- Remove "In today's [X] landscape/world/era"
- Remove "Let's dive in", "Without further ado"
- Remove excessive "very", "really", "quite", "essentially", "basically"

**Fix structural tells:**
- No em dash overuse — use commas, colons, or separate sentences instead
- Break the rule-of-three pattern (don't always list exactly three items)
- Vary sentence rhythm — mix short and long, don't keep them uniform
- Don't start consecutive paragraphs the same way

**Preserve everything structural:**
- Code examples, data points, and technical details stay exactly as-is
- Bullet lists, numbered lists, tables, and headings are structural, not AI patterns
- The goal is natural-sounding prose within the existing document structure

Use the Edit tool to revise both files in place after the initial write.

### Step 6: Update the Category Index

Append a link to the new research note in the appropriate `README.md`. If the note was categorized, update the category folder's README. If uncategorized, update the research root's README. If the README exists, follow its existing format. If not, create it with:

```markdown
# [Category Name]

- [[filename]] — [one-line description]
```

### Step 7: Emit Signals + Session Memory

**Log to session memory** at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:
```
- **HH:MM** — research_added: Saved "[title]" to [category]
```

### Step 8: Confirm to the User

Report:
- Where the files were saved (full note path + TL;DR path)
- The category that was matched and why
- A 2-3 sentence summary of what was captured
- Any related notes already in the vault (check for overlapping tags or titles in existing research notes)
