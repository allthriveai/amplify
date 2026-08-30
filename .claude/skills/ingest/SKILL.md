---
name: ingest
description: Ingests a source into the second brain. Saves the raw material immutably, distills a wiki page from it, updates every entity and concept it touches, then updates the index and log. Triggers on "ingest", "add research", "save this", "add this to my vault", "clip this", or sharing a URL, PDF, or article.
---

# Ingest a Source

One source becomes many pages. The raw material is saved once and never touched
again; everything downstream is a distillation the wiki owns and keeps current.

A single ingest touching 10-15 wiki pages is normal. That is the pattern working.

## Step 0: Load configuration

Read `.amplifyrc` from the cwd or vault root:

```
paths.sources   → raw layer root (default: "Sources")
paths.wiki      → wiki root (default: "Wiki")
```

Clippings go in `{sources}/Clippings`. Wiki pages go in `{wiki}/{Summaries,Concepts,Entities,Synthesis}` — never a `Wiki/Sources/`.

Read `{vaultPath}/CLAUDE.md` — the vault schema. It is the authority on page shape,
frontmatter, and naming. This skill is the workflow; that file is the contract.

## Step 1: Read the source

- URL → WebFetch
- PDF → Read with page ranges for large files
- Pasted text → work with what you have

Extract title, author, source URL, publish date, and the full content.

## Step 2: Talk before writing

Say what the source actually argues and what is worth keeping, in a few sentences.
Ask whether to go ahead. This is the one point where the user's judgment shapes what
gets filed, and it is cheap here and expensive later.

## Step 3: Save the raw clipping

Write to `{sources}/Clippings/{slug}.md`, kebab-case from the title.

```markdown
---
title: "[Title]"
source: "[URL or reference]"
author: "[Author]"
published: "[YYYY-MM-DD if known]"
created: "[today YYYY-MM-DD]"
tags:
  - resource/[article|paper|guide|video|book|tool|course|podcast|documentation]
  - [topic tags in kebab-case]
---

[Full content, faithful to the source. Use its own headings. Preserve code, tables,
figures, and data exactly. Do not summarize — this is the reference copy, and the
whole point is never needing the original again.]

---

**Source**: [Title](URL)
```

**This file is written once and never edited again.** Corrections and second thoughts
belong on wiki pages, which cite it.

Use the `ingest_source` MCP tool if available — it handles the frontmatter, the date,
and the slug.

## Step 4: Write the wiki source page

`{wiki}/Summaries/{same-slug}.md`. Same filename as the clipping, so the pair is obvious.

```markdown
---
tags: [topic tags in kebab-case]
sources: [{same-slug}.md]
created: [today]
updated: [today]
aliases: ["[Title Case Title]"]
---

# [Title Case Title]

[One paragraph: what this source is and why it is in the vault.]

## Claims

- [What the source actually asserts, one per line. Attribute rather than assert:
  "argues that X" beats stating X as settled.]

## Worth keeping

[The two or three things you would want back in a year. Be specific.]

## Limits

[What it does not show. Sample size, scope, conflicts of interest, what the author
assumes. Skip this section only when there is genuinely nothing to say.]

## Connects to

- [[Concept Page]] — how
- [[Entity Page]] — how
```

Keep this page factual. Interpretation belongs on concept and synthesis pages, so a
source page stays valid even after you change your mind about what it means.

## Step 5: Touch every entity and concept

This is the step that makes the wiki compound, and the step people skip.

List every concept, person, organization, product, and tool the source discusses.
For each one:

- **Page exists** → update it with what this source adds. Cite the source in the body
  and append the clipping filename to its `sources` frontmatter. Bump `updated`.
- **No page** → create it, following the page shapes in `CLAUDE.md`.
- **Contradicts what a page says** → do not overwrite. Write that the sources
  disagree, cite both, and say which is more recent.

Every page needs `aliases: ["Its Title Case Title"]`. Filenames are kebab-case and
links are written from the title, so without it `[[Vector Search]]` will not resolve
to `vector-search.md` and every link to that page dangles.

Then link in both directions. A link that only points one way is half a link: if the
source page links `[[Vector Search]]`, the vector search page names this source too.

**The orphan rule: every new page must link to at least one existing page.** If a new
page connects to nothing, the wiki is missing a concept in between. Create that one too.

## Step 6: Humanize

Run the `humanizer` skill's rules over every page written. Wiki pages are reference
material, so plain beats impressive.

Cut AI vocabulary (delve, landscape, crucial, leverage, robust, showcase, comprehensive,
innovative), filler ("it's worth noting", "in today's world"), significance inflation,
and em dash pileups. Vary sentence length. Preserve code, tables, and data exactly.

## Step 7: Update the index

Add one line per new page to `{wiki}/index.md`, under its category header, under 120
characters:

```markdown
- [[Page Title]] — one-line summary
```

Pages that only got updated do not need a new line, but fix their summary if it no
longer describes the page.

## Step 8: Append to the log

`{wiki}/log.md`, append-only. Never edit an entry already written.

```markdown
## [YYYY-MM-DD] ingest | [Source Title]
Added source page. Created [[New Page]], [[Other New Page]]. Updated
[[Existing Page]] and [[Another]].
```

## Step 9: Report

- The clipping path and the wiki source page path
- Pages created and pages updated, with counts
- Anything the source contradicted
- Concepts mentioned that do not have a page yet, if you chose not to create them
- If more than ten ingests have happened since the last lint entry in `log.md`,
  say so and offer to run `/lint`
