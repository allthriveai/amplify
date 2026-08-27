# Lumis

Your AI confidant. Captures moments, synthesizes research, finds patterns, amplifies stories.

## What this is

Lumis is a CLI tool and MCP server that lives in an Obsidian vault. It helps capture daily moments (Homework for Life), save research, extract learnings, and develop stories into shareable content. Everything stays local in the vault.

## Architecture

- **TypeScript + Node.js**, ES modules (`"type": "module"`)
- **Build**: `npm run build` (tsc). Output goes to `dist/`.
- **Dev**: `tsx` for running without build
- **Tests**: `vitest` (not many yet)
- **No frontend.** This is a CLI (`lumis`) and MCP server.

## Key directories

```
src/
  types/          ← TypeScript interfaces (moment, canvas, config, source, wiki, amplify, signal, memory, story, studio, director, diagram, journal)
  vault/          ← Read/write Obsidian markdown files with gray-matter frontmatter
  cli/            ← CLI commands (moment, init, import-sparks)
  mcp/            ← MCP server (stdio transport, 12 tools)
  ai/             ← Claude API integration for moment analysis
  canvas/         ← Obsidian canvas file generation
  pipeline/       ← Moment capture pipeline
  amplify/        ← Content amplification context builder
  journal/        ← The coach loop: receipt, task carry-forward, drift, weekly review
  studio/         ← Video production (HeyGen, ElevenLabs, Google Imagen, Remotion rendering, asset management)
  diagram/        ← React Flow diagram generation (self-contained HTML output)
  config.ts       ← Loads .lumisrc config with fallbacks to env vars
  index.ts        ← Public API re-exports
```

## Conventions

- All vault paths are relative to `vaultPath` and resolved through `src/vault/paths.ts`
- Frontmatter is parsed/serialized with `gray-matter` via `src/vault/frontmatter.ts`
- Readers return typed objects, writers accept typed objects
- New vault content types follow the pattern: types file, path resolver, reader, writer, re-export in `vault/index.ts` and `index.ts`
- Config changes go in three places: `types/config.ts` (interface + DEFAULT_PATHS), `config.ts` (loadConfig merge), `.lumisrc.example`. Then run `npm run check:vault` — it catches a path that resolves to nothing, which is otherwise silent
- **The vault has three ownership layers.** `Sources/` is immutable: read it, cite it, never rewrite it. `Wiki/` is agent-owned: create and rewrite freely. `Life/` is first-person and never gets ingested into the wiki. Anything writing to the vault has to respect that boundary
- Slugs go through `src/vault/slug.ts`, not a local copy
- **Dates: use `src/vault/dates.ts`, never raw `Date` math.** Two traps it exists to avoid. `new Date("2026-08-19")` parses as UTC midnight and lands on the previous day west of UTC. `new Date().toISOString().split("T")[0]` is the UTC day, which rolls over mid-evening in the Americas and files work under tomorrow. Frontmatter dates are a third trap: YAML parses an unquoted `date:` into a `Date` object, not the `string` the type claims, so read them through `normalizeDateKey()`.
- CLI commands live in `src/cli/commands/` and register in `src/cli/index.ts`

## Skills

Lumis has Claude Code skills in `.claude/skills/`:

- **`/init`** — Interactive vault setup. Asks for vault path, scaffolds directories, writes `.lumisrc`, walks through voice interview to populate Voice.md, then copies and personalizes the Amplify toolkit (8 hook types, 18 structures, persuasion glossary).
- **`/voice`** — Standalone voice interview. Fills in or redoes Voice.md through a guided conversation.
- **`/goals`** — Sets up Goals.md through a guided conversation. Asks about the job you want, what you're building, what's in the way, concrete targets, and how you'll know it's working. Goals.md is your north star — every content skill reads it alongside Voice.md to keep output aligned with what you're building toward.
- **`/journal`** (alias **`/today`**) — The daily loop. Shows the receipt, takes the full unfiltered entry (never edited — no humanizer, no tidying), finds the day's five-second moment with Matthew Dicks' method, then reads the entry against every past entry for patterns. Offers to promote a medium/high-potential moment to `/moment` rather than flooding `Moments/`. Creates no note until there is an entry to put in it.
- **`/week`** — The weekly reckoning. Reads the week's daily notes, tasks kept and missed, moments, and target movement, then writes `Life/Reviews/Week of {Monday}.md`. Surfaces drift that is only visible across weeks: tasks carried past a week, targets abandoned rather than slipping, recurring moment themes, silent days. Walks through three questions and sets next week's commitments. Idempotent — never overwrites a review you have written into.
- **`/moment`** — Captures a daily moment. Reads all existing moments, analyzes the input, finds connections, writes the note, regenerates the Pattern Map canvas, and reports back. Use `/moment private` to mark a moment as private: it still gets full pattern analysis and connections but is excluded from all content pipelines (`/craft-content`, `/draft-*`, `social_coach`, `story_craft`).
- **`/ingest`** — Saves a URL/PDF/article into the source layer immutably, distills a wiki source page from it, then updates every entity and concept page it touches, the index, and the log. One source touching 10-15 pages is normal.
- **`/wiki`** — Answers a question from the wiki. Reads `Wiki/index.md` first, drills into the pages it names, answers with `[[wikilink]]` citations, and offers to file anything worth keeping into `Wiki/Synthesis/`.
- **`/lint`** — Health-checks the wiki: orphans, broken links, index drift, dangling sources, frontmatter and naming violations, plus the judgment checks (contradictions, stale claims, missing pages). Run every 10 ingests, monthly minimum.
- **`/craft-storytelling`** — Develops storytelling skill from captured moments. Practice mode or full story development.
- **`/craft-content`** — Finds a story and shapes it into a clean narrative draft. Free write, find the 5-second moment, build the arc, write, review. The story is the asset; draft skills remix it into formats.
- **`/draft-video`** — Takes a crafted story and drafts a shot-by-shot video timeline, then opens the storyboard for review and approval. Picks hook + structure from Amplify, builds the timeline, generates and opens the storyboard HTML for inline editing, and optionally produces avatar clips via HeyGen and assembles with Remotion. Storyboard approval is built in as the pre-production gate.
- **`/draft-carousel`** — LinkedIn carousel from a crafted story. Builds card-by-card plan with copy and image direction.
- **`/draft-article`** — Long-form blog post from a crafted story. Writes the full article using the narrative arc.
- **`/draft-images`** — Generates AI images for any draft format (video, carousel, article) using Google Imagen. Finds image slots, builds brand-aware prompts, generates images, and updates source files so images flow into rendering automatically.
- **`/draft-diagram`** — Creates interactive React Flow diagrams from crafted stories. Picks diagram type (flow, concept map, timeline, comparison), extracts nodes and edges from the story, renders a standalone HTML file with React Flow and a PNG screenshot.
- **`/add-inspiration`** — Captures a person who inspires you. Researches their bio, work, and quotes on the web, then asks what you admire and what you've learned from them.
- **`/challenge`** — Challenges an idea or belief through critical thinking prompts. Picks 2-3 prompts matched to the input, runs them one at a time, logs to Challenge Log, optionally promotes insights to the second brain.
- **`/brand`** — Sets up your visual brand identity. Interview mode writes brand colors, fonts, and visual style to `.lumisrc` and Brand.md. Add mode (`/brand add [url]`) saves visual inspiration references.
- **`/humanizer`** — Removes signs of AI-generated writing. Detects and fixes AI vocabulary, significance inflation, em dash overuse, filler phrases, and structural tells.
- **`/youtube-description`** — Writes YouTube video descriptions. Hook-first structure optimized for search and click-through. Keyword placement, timestamps, CTA strategy, humanizer rules baked in.
- **`/linkedin-post`** — Writes LinkedIn posts optimized for saves and dwell time. Hook under 110 chars, multiple post structures (story, listicle, contrarian, before/after), links in first comment, humanizer rules baked in.
- **`/meeting`** — Processes a Plaud-synced transcript or pasted meeting notes into a structured meeting note. Extracts decisions, action items with owners, discussion topics, and attendees. Reads from the Plaud sync folder (populated by the plaud-sync-for-obsidian Obsidian plugin) or accepts pasted text. Writes to `Sources/Meetings/`, then offers to ingest it into the wiki.

All skills read `.lumisrc` for vault paths and write directly to the Obsidian vault.

### The wiki schema

`{vaultPath}/CLAUDE.md` is the vault's own schema — the contract that turns an agent
with file access into a disciplined wiki maintainer. It defines the three layers, the
single frontmatter schema, the page shapes, the ingest/query/lint workflows, and the
orphan rule ("every new page must link to at least one existing page"). The template
lives at `templates/vault/CLAUDE.md` and is copied on `/init`.

### Identity files

Skills read three identity files that shape all output:
- **Voice.md** (`paths.voice`) — Who you are and how you sound
- **Goals.md** (`paths.goals`) — What you're building toward and why. Every content-creating skill should read Goals.md to keep output aligned with career goals, target audience, and professional trajectory.
  - A `## Active Targets` section holds the machine-readable half, read by `/today`:

    ```markdown
    ## Active Targets
    - [ ] Publish a post `cadence:weekly` `last:2026-04-21` #goal/writing
    - [ ] Work out `cadence:3x-weekly` #goal/workout
    - [ ] Ship the redesign #goal/product
    ```

    Cadence is one of daily/weekly/monthly/quarterly. A target with a cadence and no recent `last:` shows up as going quiet. Milestones omit cadence so they never nag.

    `Nx-` prefixes a count: `3x-weekly` is three times a week. Those are scored on completions inside the period rather than the gap since the last one, counted from `target_touched` signals, and the receipt reports them as "2 of 3 this week". Lines inside HTML comments are skipped, so a target can be parked without deleting it.
- **Brand.md** (`paths.brand/Brand.md`) — How you look visually

## Keeping personal data out

This repo is public. Everything personal — moments, goals, journal entries,
names, vault paths, brand identity — lives in the user's Obsidian vault and must
never be committed here.

- `npm run check:personal` scans tracked and untracked-but-not-ignored files.
- A pre-commit hook in `.githooks/` runs it on staged changes and blocks the
  commit on a hit. `npm install` wires it up via the `prepare` script.
- Generic patterns (home paths, emails, API keys, vault paths) live in
  `tools/check-personal.mjs`. Real names live in `.personal-patterns`, which is
  gitignored — the names themselves must not enter the repo.
- `package.json`, `README.md`, and `LICENSE` are exempt from the name rules
  only, since a public repo needs its own URL and attribution. The hard rules
  still apply to them.
- Docs and skill examples must use invented data. Never paste a real goal,
  colleague, story slug, or vault path into an example.
- If a match is genuinely fine, add a `personal-ok` comment on that line.

## Writing style

When writing prose for the vault (moments, research notes, learnings), follow the humanizer rules:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases, no significance inflation, no sycophantic language
- No em dash overuse. Use commas, colons, or periods.
- Vary sentence length. Be specific. Have opinions.
- Preserve the user's voice in moments. The humanizer is for Lumis's writing, not theirs.

## Commands

```bash
npm run build        # Compile TypeScript
npm run dev          # Run CLI with tsx
npm run lint         # Type check without emit
npm test             # Run vitest
npm run check:vault  # Assert every configured vault path exists
lumis init [path]    # Scaffold vault structure
lumis today          # Open today's journal (receipt + carried tasks)
lumis today --done "task"   # Check tasks off and close the day
lumis week           # Write this week's review
lumis moment         # Capture a moment
lumis import-sparks  # Import content from sparks.json manifest
lumis studio list    # List director cuts across stories
lumis studio render  # Render a story's timeline to video
lumis studio preview # Open Remotion preview
```

## Docs

Detailed documentation for each subsystem:

- **[Vault](docs/vault.md)** — vault structure, Voice.md, IP separation
- **[Signals](docs/signals.md)** — event log connecting pipeline stages, signal types, director integration
- **[Memory](docs/memory.md)** — session history, preferences, boundaries
- **[MCP Server](docs/mcp.md)** — all tools, Claude Desktop config, tool details
- **[Studio](docs/studio.md)** — video production pipeline, API setup, Remotion
- **[OBS Capture](docs/obs.md)** — OBS integration, screen/camera recording, keyboard shortcuts
