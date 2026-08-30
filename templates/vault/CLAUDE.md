# Vault Schema

This vault runs the LLM Wiki pattern. Three layers, one rule each.

| Layer | Folder | Who owns it |
|---|---|---|
| **Raw sources** | `Sources/` | Immutable. Read it, cite it, never rewrite it. |
| **The wiki** | `Wiki/` | Yours. Create, rewrite, and keep current without asking. |
| **The schema** | this file | The conventions below. Follow them exactly. |

Everything else in the vault belongs to the person who owns it:

- `Work/` — projects, stories, strategy. Read freely. Write when asked. May be
  ingested into the wiki.
- `Amplify/` — system files: `Voice.md`, `Brand/`, `Structures/`, `Hooks/`, `Signals/`,
  `Memory/`. Read freely. Write only through the skill that owns each one.

**Any other folder in this vault is private by default.** Journals, personal notes,
anything first-person: do not read it into the wiki, do not draft content from it, and
do not write into it. If a folder's purpose is unclear, ask before touching it rather
than assuming it is fair game.

## Wiki layout

```
Wiki/
├── index.md       catalog of every page
├── log.md         append-only history
├── Summaries/     one page per ingested source
├── Concepts/      ideas, frameworks, patterns
├── Entities/      people, organizations, products, tools
└── Synthesis/     comparisons and cross-cutting analysis
```

## Page format

Every wiki page carries this frontmatter. No exceptions, no extra fields, no
per-folder variants — uniformity is what makes cross-cutting queries possible.

```yaml
---
tags: [retrieval, evaluation]
sources: [some-clipped-article.md, 2026-01-14-planning-call.md]
created: 2026-01-15
updated: 2026-02-02
aliases: [Retrieval Augmented Generation]
---
```

- `tags` — kebab-case topics. No `type/` or `resource/` prefixes.
- `sources` — filenames in `Sources/`, not paths, not URLs. This is the audit trail
  back to raw material. A page with an empty `sources` list is unsupported opinion.
- `created` / `updated` — `YYYY-MM-DD`. Bump `updated` on every rewrite.
- `aliases` — the page's Title Case title. **Required.** Filenames are kebab-case and
  links are written from the title, so without the alias every `[[Link]]` in the vault
  dangles. This one field is what makes the naming convention work in Obsidian.

Below the frontmatter: a single `# Title Case Heading` matching the page title, then
the body.

### What belongs on each kind of page

**Concept** — definition in one paragraph, where it applies, where it fails or is
misused, and links to related concepts. The failure modes are the part people skip
and the part that turns out to be worth the most later.

**Entity** — what this person, org, product, or tool is, the relationship to it, and
when it last came up. Keep judgments attributed to a source rather than stated flat.

**Summary** — one page per source in `Sources/`. Canonical URL or file reference, the
claims the source actually makes, and links to every concept and entity it touches. Stay
factual here. Interpretation belongs on concept and synthesis pages, so a summary stays
valid even after you change your mind about what the source means.

Note the naming: the raw layer is `Sources/` and the `sources` frontmatter field points
there. A page *about* a source is a summary. Do not create a `Wiki/Sources/`.

**Synthesis** — the comparison or question being resolved, what each side holds, and
where the evidence lands. Cite the pages, not the raw sources.

## Naming and linking

- Filenames: kebab-case. `retrieval-augmented-generation.md`
- Page titles: Title Case. `# Retrieval Augmented Generation`
- Links: `[[Retrieval Augmented Generation]]` — the **title**, never the filename.
  This resolves because every page carries its title in `aliases`. A page without
  that alias cannot be linked to.
- Link on first mention of anything that has its own page.
- **Never let a `[[link]]` wrap across a line break.** A link split over two lines does
  not resolve, and it looks correct in the source. Rewrite the sentence instead.

**The orphan rule: every new page must link to at least one existing page.** A page
nothing points at is a page nobody will ever find again. If a new page genuinely
connects to nothing, that is a signal the wiki is missing a concept page in between —
create that one too.

## Operations

### Ingest

1. Read the source completely.
2. Talk through the takeaways before writing anything.
3. Write the raw material to `Sources/` if it is not already there. Never edit it after.
4. Write a summary page in `Wiki/Summaries/`.
5. For every entity and concept the source touches: update the page if it exists,
   create it if it does not.
6. Add `[[links]]` in both directions. A link that only points one way is half a link.
7. Add a line to `index.md`.
8. Append an entry to `log.md`.

One source touching 10-15 pages is normal. That is the pattern working, not a problem.

### Query

Read `index.md` first, then open only the pages it points at. Answer with `[[links]]`
as citations. Go to `Sources/` only when the wiki cannot answer — if that keeps
happening, the wiki has a gap worth filling.

If the answer produced something worth keeping, offer to file it in `Wiki/Synthesis/`,
then update the index and log.

### Lint

Check, report, offer to fix, then log the pass:

- Pages that contradict each other
- Claims a newer source has superseded
- Orphans — pages with no inbound links
- Concepts mentioned across several pages that have no page of their own
- Missing cross-references between pages that clearly relate
- Index entries pointing at pages that no longer exist, and pages missing from the index
- `sources` entries naming a file that is not in `Sources/`

Run it every ten ingests, monthly at minimum, and before leaning on the wiki for
anything large.

## Index format

One line per page, grouped under `## Summaries`, `## Concepts`, `## Entities`,
`## Synthesis`. Keep each line under 120 characters.

```markdown
- [[Retrieval Augmented Generation]] — grounding model output in retrieved documents
```

## Log format

Append-only. Never edit an entry that is already there.

```markdown
## [2026-01-15] ingest | Retrieval Augmented Generation at Scale
Added source page. Created [[Chunking Strategy]], updated [[Vector Database]] and
[[Evaluation Harness]].
```

Operations are `ingest`, `query`, `lint`, `restructure`.

## Writing

Wiki pages are reference material. Write them plainly.

- No AI vocabulary: delve, landscape, crucial, leverage, robust, innovative, showcase.
- No filler: "it's worth noting", "in today's world", "let's dive in".
- No significance inflation. If something matters, the reason it matters is the content.
- Vary sentence length. Be specific. State the limits of what a source actually shows.
- Attribute contested claims. "X argues" beats stating it as settled.

When a new source contradicts a page, do not quietly overwrite. Update the page and
say that the sources disagree, citing both.
