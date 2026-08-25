# The Vault

Lumis writes to an Obsidian vault configured in `.lumisrc`. The vault is NOT this repo. The vault path is resolved from:
1. `.lumisrc` in cwd
2. `VAULT_PATH` env var
3. If neither is set, Lumis asks rather than guessing

## The three layers

The vault runs the LLM Wiki pattern. The folder tree encodes one question: **may the
agent rewrite this?**

| Layer | Folder | Ownership |
|---|---|---|
| Raw sources | `Sources/` | Immutable. Read and cited, never rewritten. |
| The wiki | `Wiki/` | Agent-owned. Created, rewritten, and kept current without asking. |
| The schema | `CLAUDE.md` | The contract both layers follow. |

Everything else belongs to the person: `Journal/` is first-person and never ingested,
`Work/` holds projects and pipeline output, `Lumis/` holds system files.

The split matters because knowledge gets compiled once and kept current, rather than
re-derived from raw material on every question. The bookkeeping that makes that work —
cross-references, index lines, log entries — is exactly what people abandon and what an
agent does without getting bored.

## Structure

All paths configurable in `.lumisrc`:

```
CLAUDE.md              ← the schema. page shapes, workflows, the orphan rule.
Home.md                ← thin human hub, points at Wiki/index.md

Sources/                ← IMMUTABLE. read, never rewritten.
  Clippings/            ← one file per article, paper, or page saved
  Meetings/             ← transcripts and meeting notes
  Audio/                ← narrations
  assets/               ← images pulled from clippings

Wiki/                   ← AGENT-OWNED. rewritten and kept current.
  index.md              ← catalog: every page, one line, under 120 chars
  log.md                ← append-only: ingests, queries, lint passes
  Summaries/            ← one distilled page per raw source
  Concepts/             ← ideas, frameworks, patterns
  Entities/             ← people, organizations, products, tools
  Synthesis/            ← comparisons and cross-cutting analysis

Journal/                ← YOURS. never ingested into the wiki.
  Moments/              ← daily moment notes
  Daily Notes/
  Reviews/              ← weekly reviews
  Challenges/           ← /challenge logs and promoted notes

Work/                   ← projects and pipeline output
  Stories/              ← developed stories, each in its own folder
    {slug}/
      raw.md            ← free write + interview answers (from /craft-content)
      story.md          ← clean narrative draft (from /craft-content)
      timeline.md       ← shot-by-shot timeline (from /draft-video)
      carousel.md       ← carousel cards (from /draft-carousel)
      article.md        ← long-form post (from /draft-article)
    Practice Log.md     ← storytelling practice history
  Strategy/             ← content pillars, messaging, social plan

Lumis/                  ← system files
  Voice.md              ← who you are and how you sound
  Goals.md              ← what you're building toward
  Pattern Map.canvas    ← visual connections between moments
  Amplify/              ← personalized content toolkit
    Hooks/              ← 8 hook types
    Structures/         ← 18 content frameworks
    Persuasion-Glossary.md
  Brand/                ← visual identity
    Brand.md
    Inspiration/
  Signals/              ← structured event log (signals.json)
  Memory/               ← session history and preferences
    sessions/           ← daily session logs (YYYY-MM-DD.md)
    preferences.md
```

## Wiki page format

Every wiki page carries the same frontmatter regardless of kind. The uniformity is the
point — four incompatible per-folder schemas is what made cross-cutting queries
impossible before.

```yaml
---
tags: [retrieval, evaluation]
sources: [some-clipped-article.md, 2026-01-14-planning-call.md]
created: 2026-01-15
updated: 2026-02-02
---
```

`sources` names filenames in `Sources/`, not paths and not URLs. It is the audit trail
back to raw material, and a page with an empty `sources` list is unsupported opinion.

Note the naming. The raw layer is `Sources/` and the `sources` field points there; a page
*about* a source is a **summary**, filed in `Wiki/Summaries/`. Naming both folders
`Sources` reads fine in a diagram and is genuinely confusing in a file tree.

Filenames are kebab-case, page titles are Title Case, and `[[links]]` use the **title**
rather than the filename.

**The orphan rule: every new page must link to at least one existing page.** A page
nothing points at is a page nobody finds again. Before this rule the vault had 107 of
154 research notes with zero inbound links.

## Why there are no research categories

Sources used to be keyword-matched into category subfolders. It sounds tidy and does not
survive a real vault: most sources matched nothing and piled up at the root, while three
of the five configured categories were never created at all. `Sources/Clippings/` is flat,
and `tags` plus `Wiki/index.md` do the categorizing.

## Config drift

`npm run check:vault` loads the real `.lumisrc` and asserts every resolved path exists.
Drift is otherwise silent — a renamed folder leaves a resolver pointing at nothing, and
the skill that uses it quietly creates an empty directory rather than failing.

## Private Moments

Moments can be marked private by adding `private: true` to their frontmatter (or using `/moment private ...`). Private moments:

- Still get full analysis: 5-second moment, themes, connections, story potential
- Still appear on the Pattern Map canvas and connect to other moments
- Are excluded from all content pipelines: `get_moments`, `get_patterns`, `social_coach`, `story_craft_practice`, `story_craft_develop`, `/craft-content`, and all `/draft-*` skills
- Stay in the vault and can always be found directly in Obsidian

This lets you journal deeply personal things with full pattern recognition without them ever surfacing as content candidates.

## Voice

`Lumis/Voice.md` is the identity file. It captures who you are, what you're trying to accomplish, who you're talking to, what you believe, and how you talk. The coaching and content layers read it:

- **Director video** uses Voice to shape script lines and match your speaking style.
- **Director carousel** uses Voice to match card copy to your tone.
- **Director article** uses Voice to write the full article in your style.
- **Craft content** uses Voice to shape how stories are written.
- **Amplify toolkit** is personalized with Voice during `/init`, replacing generic placeholders with your audience, mission, and niche.
- **Moments are never influenced by Voice.** Moments are pure life reflection, unfiltered by goals or strategy. Voice only matters when you decide to turn a moment into content.

`/init` scaffolds a Voice.md template and interviews you to fill it in. Run `/voice` anytime to redo it.

## Amplify Toolkit

`/init` copies generic templates from `templates/amplify/` in this repo into your vault at `Lumis/Amplify/`, then personalizes them using your Voice.md. The toolkit includes:

- **8 hook types**: contrarian, curiosity-gap, story-entry, credibility, empathy, shock-data, question, pattern-interrupt. Each has a principle, good/bad examples, and anti-patterns.
- **18 content structures**: frameworks with persuasion principles embedded (e.g., "I Used to Believe," "The Great Paradox," "The Vulnerable Admission").
- **Persuasion Glossary**: 10 persuasion principles for reference.

`/draft-video`, `/draft-carousel`, and `/draft-article` read these when building their outputs, selecting the right hook type and structure for each format.

## IP Separation

Code goes in this repo. Content goes in the vault. No purchased content, no personal moment data, no vault files in git. The `.gitignore` blocks `.lumisrc`, `.env`, PDFs, and the `creator-blueprint/` directory.
