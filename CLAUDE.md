# Amplify

Turns an Obsidian second brain into published content. Wiki in, video out.

## What this is

Amplify is a CLI (`amplify`) and an MCP server that lives outside the vault and reads
into it. It saves sources immutably, maintains an LLM wiki over them, shapes wiki
material into stories, and renders those stories into video, carousels, articles, and
diagrams.

**This repo stores no user data.** Every note, source, story, timeline, and rendered
asset lives in the user's Obsidian vault. The repo holds code, templates, and skills.

## Architecture

- **TypeScript + Node.js**, ES modules (`"type": "module"`)
- **Build**: `npm run build` (tsc). Output goes to `dist/`.
- **Dev**: `tsx` for running without build
- **Tests**: `vitest` — 117 tests across config, vault, dates, signals, memory, and diagram
- **No frontend.** CLI plus MCP server. Remotion compositions are React, rendered headless.

## Key directories

```
src/
  types/          ← TypeScript interfaces (config, source, wiki, amplify, signal, memory,
                    story, studio, director, diagram, brand, meeting)
  vault/          ← Read/write Obsidian markdown with gray-matter frontmatter
  cli/            ← CLI commands (init, studio, storyboard, listen, obs, import-sparks)
  mcp/            ← MCP server (stdio transport, 5 tools)
  ai/             ← Humanizer pass over generated prose
  amplify/        ← Content amplification context builder (hooks, structures, persuasion)
  carousel/       ← LinkedIn carousel HTML and PDF rendering
  diagram/        ← React Flow diagram generation (self-contained HTML output)
  studio/         ← Video production (HeyGen, ElevenLabs, Google Imagen, Remotion, assets)
  capture/        ← OBS screen and camera recording
  config.ts       ← Loads .amplifyrc with fallbacks to env vars
  index.ts        ← Public API re-exports
```

## Conventions

- All vault paths are relative to `vaultPath` and resolved through `src/vault/paths.ts`
- Frontmatter is parsed/serialized with `gray-matter` via `src/vault/frontmatter.ts`
- Readers return typed objects, writers accept typed objects
- New vault content types follow the pattern: types file, path resolver, reader, writer,
  re-export in `vault/index.ts` and `index.ts`
- Config changes go in three places: `types/config.ts` (interface + DEFAULT_PATHS),
  `config.ts` (loadConfig merge), `.amplifyrc.example`. Then run `npm run check:vault` —
  it catches a path that resolves to nothing, which is otherwise silent
- **The vault has two ownership layers Amplify must respect.** `Sources/` is immutable:
  read it, cite it, never rewrite it. `Wiki/` is agent-owned: create and rewrite freely.
  Anything the user keeps outside those two is theirs; do not ingest it and do not write
  into it unless asked directly
- Slugs go through `src/vault/slug.ts`, not a local copy
- **Dates: use `src/vault/dates.ts`, never raw `Date` math.** Two traps it exists to
  avoid. `new Date("2026-08-19")` parses as UTC midnight and lands on the previous day
  west of UTC. `new Date().toISOString().split("T")[0]` is the UTC day, which rolls over
  mid-evening in the Americas. Frontmatter dates are a third trap: YAML parses an
  unquoted `date:` into a `Date` object, not the `string` the type claims, so read them
  through `normalizeDateKey()`
- CLI commands live in `src/cli/commands/` and register in `src/cli/index.ts`

## The flywheel

Every skill sits at one stage. Know which stage you are working on.

```
Sources/  →  Wiki/  →  Work/Stories/  →  formats  →  published  →  signals
 /ingest     /wiki      /craft-content    /draft-*   studio render   record_signal
 /meeting    /lint                                                        │
                                                                          ▼
                                                              suggest_content reads
                                                              signals + wiki to rank
                                                              what to publish next
```

The wiki is the input to content, not a side archive. A page with sources behind it is
most of a draft already. That is why `suggest_content` ranks wiki pages by source count
and whether a story folder for them exists yet.

## Skills

Claude Code skills in `.claude/skills/`. Each reads `.amplifyrc` for vault paths.

**Second brain** — `/ingest`, `/meeting`, `/wiki`, `/lint`, `/add-inspiration`
**Story** — `/craft-content`
**Formats** — `/draft-video`, `/draft-carousel`, `/draft-article`, `/draft-diagram`, `/draft-images`
**Publish** — `/linkedin-post`, `/youtube-description`, `/youtube-short`, `/youtube-upload`, `/listen`, `/humanizer`
**Identity** — `/voice`, `/brand`, `/heygen-avatar`, `/heygen-video`
**Setup** — `/init`

### The wiki schema

`{vaultPath}/CLAUDE.md` is the vault's own schema, the contract that turns an agent with
file access into a disciplined wiki maintainer. It defines the layers, the single
frontmatter schema, the page shapes, the ingest/query/lint workflows, and the orphan rule
("every new page must link to at least one existing page"). The template lives at
`templates/vault/CLAUDE.md` and is copied on `/init`.

### Identity files

Skills read two identity files that shape all output:
- **Voice.md** (`paths.voice`) — Who the user is and how they sound
- **Brand.md** (`paths.brand/Brand.md`) — How their work looks

## Keeping personal data out

This repo is public and stores none of the user's content.

- `npm run check:personal` scans tracked and untracked-but-not-ignored files.
- A pre-commit hook in `.githooks/` runs it on staged changes and blocks the commit on a
  hit. `npm install` wires it up via the `prepare` script.
- Generic patterns (home paths, emails, API keys, vault paths) live in
  `tools/check-personal.mjs`. Real names live in `.personal-patterns`, which is
  gitignored — the names themselves must not enter the repo.
- `package.json`, `README.md`, and `LICENSE` are exempt from the name rules only, since a
  public repo needs its own URL and attribution. The hard rules still apply to them.
- Docs and skill examples must use invented data. Never paste a real source, colleague,
  story slug, or vault path into an example.
- If a match is genuinely fine, add a `personal-ok` comment on that line.

## Writing style

When writing prose that lands in the vault (wiki pages, stories, drafts), follow the
humanizer rules:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases, no significance inflation, no sycophantic language
- No em dash overuse. Use commas, colons, or periods.
- Vary sentence length. Be specific. Have opinions.
- Preserve the user's voice. The humanizer is for Amplify's writing, not theirs.

## Commands

```bash
npm run build        # Compile TypeScript
npm run dev          # Run CLI with tsx
npm run serve        # Start the MCP server
npm run lint         # Type check without emit
npm test             # Run vitest
npm run check:vault  # Assert every configured vault path exists
npm run lint:wiki    # Wiki structure: broken links, orphans, index drift, aliases
amplify init [path]  # Connect Amplify to a vault
amplify studio list  # List director cuts across stories
amplify studio render# Render a story's timeline to video
amplify studio preview
amplify storyboard <slug>
amplify listen <note>
```

## Docs

- **[Vault](docs/vault.md)** — vault structure, the layers, Voice.md
- **[Signals](docs/signals.md)** — event log connecting pipeline stages
- **[Memory](docs/memory.md)** — session history, preferences
- **[MCP Server](docs/mcp.md)** — all tools, Claude Desktop config
- **[Studio](docs/studio.md)** — video production pipeline, API setup, Remotion
- **[OBS Capture](docs/obs.md)** — OBS integration, screen/camera recording
