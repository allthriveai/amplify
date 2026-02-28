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

### Step 7b: Extract Learnings

After saving the research note and TL;DR, extract professional insights that connect to the content strategy.

1. Read the content pillars from `{vaultPath}/2 - Areas/All Thrive/Content Pillars.md` to understand the 4 pillars: building, strategy, ethics, thriving.
2. Read the `.lumisrc` config to get `paths.learnings` (the folder where learnings live).
3. Identify 1-4 learnings from the research. A learning qualifies if it:
   - Teaches something actionable about building with AI, AI strategy, AI ethics, or thriving with AI
   - Connects to the "force multiplier" thesis (one person amplified by their own AI team)
   - Offers a non-obvious insight that could become content
4. For each learning, create a note in `{vaultPath}/{paths.learnings}/` using this format:

```markdown
---
title: "[Short, opinionated title]"
source: "[[{category.folder}/{research-filename}]]"
pillar: [building, strategy, ethics, thriving]
created: YYYY-MM-DD
tags:
  - learning
  - force-multiplier (when applicable)
  - [topic tags like rag, tool-design, agent-context]
---

# [Title]

[The insight in 2-4 sentences. What you learned, why it matters, how it connects to the force multiplier thesis.]

## Source Context
[1-2 sentences on where this came from and what the original piece was about.]

## Content Angle
[1-2 sentences on how this becomes a post or video. Which pillar? What's the hook?]
```

Key rules:
- Filename: `kebab-case-title.md`
- The `source` field uses a wiki-link to the research note relative to the research root
- `pillar` can be one or multiple from: building, strategy, ethics, thriving
- Apply the `force-multiplier` tag to any learning supporting the "one person amplified by their own AI team" thesis
- Topic tags should be specific enough to cluster (e.g., `rag`, `tool-design`, `agent-context`, `elicitation`)
- Run the humanizer pass on prose sections (same rules as Step 5)

5. Update `{vaultPath}/{paths.learnings}/README.md` — append each new learning to the `## Learnings` list following the existing format: `- [[filename]] — [one-line description]`

If no learnings are worth extracting (purely reference material, no actionable insight), skip this step and note it in the confirmation.

### Step 7c: Cluster Report

After creating learnings, scan all files in `{vaultPath}/{paths.learnings}/` (excluding README.md). For each file, extract the `tags` from frontmatter.

Group learnings by shared topic tags (exclude generic tags like `learning` and `force-multiplier` from grouping). Report any clusters of 4+ learnings sharing a topic tag:

```
**Topic clusters building up:**
- **[tag]** ([N] learnings): [one-line thesis summarizing what these learnings collectively say]
- **[tag]** ([N] learnings): [one-line thesis]
```

If a cluster reaches 4+ for the first time with this addition, highlight it:
> "You now have [N] learnings about [topic]. There might be a video here." followed by a 2-3 bullet summary of the cluster's thesis.

This report runs every time `/add-research` is used, not just when new clusters form, so the user always sees what's building up. If no clusters exist yet, say so briefly and move on.

### Step 7: Confirm to the User

Report:
- Where the files were saved (full note path + TL;DR path)
- The category that was matched and why
- A 2-3 sentence summary of what was captured
- Any related notes already in the vault (check for overlapping tags or titles in existing research notes)
- How many learnings were extracted (with titles and pillars)
- The cluster report from Step 7c
