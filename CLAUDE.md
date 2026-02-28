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
  types/          ← TypeScript interfaces (moment, canvas, config, research, amplify, signal, memory)
  vault/          ← Read/write Obsidian markdown files with gray-matter frontmatter
  cli/            ← CLI commands (moment, init, import-sparks)
  mcp/            ← MCP server (stdio transport, 11 tools)
  ai/             ← Claude API integration for moment analysis
  canvas/         ← Obsidian canvas file generation
  pipeline/       ← Moment capture pipeline
  amplify/        ← Content amplification context builder
  studio/         ← Video production (HeyGen, ElevenLabs, Remotion clients)
  config.ts       ← Loads .lumisrc config with fallbacks to env vars
  index.ts        ← Public API re-exports
```

## Conventions

- All vault paths are relative to `vaultPath` and resolved through `src/vault/paths.ts`
- Frontmatter is parsed/serialized with `gray-matter` via `src/vault/frontmatter.ts`
- Readers return typed objects, writers accept typed objects
- New vault content types follow the pattern: types file, path resolver, reader, writer, re-export in `vault/index.ts` and `index.ts`
- Config changes go in three places: `types/config.ts` (interface + DEFAULT_PATHS), `config.ts` (loadConfig merge), `.lumisrc.example`
- CLI commands live in `src/cli/commands/` and register in `src/cli/index.ts`

## Skills

Lumis has Claude Code skills in `.claude/skills/`:

- **`/init`** — Interactive vault setup. Asks for vault path, scaffolds directories, writes `.lumisrc`, walks through voice interview to populate Voice.md.
- **`/voice`** — Standalone voice interview. Fills in or redoes Voice.md through a guided conversation.
- **`/moment`** — Captures a daily moment. Reads all existing moments, analyzes the input, finds connections, writes the note, regenerates the Pattern Map canvas, and reports back.
- **`/add-research`** — Saves a URL/PDF/article as research. Fetches content, categorizes it, writes a full note + TL;DR companion, extracts learnings, and reports topic clusters.
- **`/social-coach`** — Reads the vault, recommends what to post where, generates platform-specific scripts.
- **`/story-craft`** — Develops storytelling skill from captured moments. Practice mode or full story development.
- **`/produce`** — Takes a script and produces a branded video: HeyGen avatar + Remotion rendering.

All skills read `.lumisrc` for vault paths and write directly to the Obsidian vault.

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
lumis init [path]    # Scaffold vault structure
lumis moment         # Capture a moment
lumis import-sparks  # Import content from sparks.json manifest
lumis studio list    # List scripts and status
lumis studio render  # Render script to branded video
lumis studio preview # Open Remotion preview
```

## Docs

Detailed documentation for each subsystem:

- **[Vault](docs/vault.md)** — vault structure, Voice.md, IP separation
- **[Signals](docs/signals.md)** — event log connecting pipeline stages, signal types, social coach integration
- **[Memory](docs/memory.md)** — session history, preferences, boundaries
- **[MCP Server](docs/mcp.md)** — all tools, Claude Desktop config, tool details
- **[Studio](docs/studio.md)** — video production pipeline, API setup, Remotion
