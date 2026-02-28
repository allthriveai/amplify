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
  types/          ← TypeScript interfaces (moment, canvas, config, research, amplify)
  vault/          ← Read/write Obsidian markdown files with gray-matter frontmatter
  cli/            ← CLI commands (moment, init, import-sparks)
  mcp/            ← MCP server (skeleton)
  ai/             ← Claude API integration for moment analysis
  canvas/         ← Obsidian canvas file generation
  pipeline/       ← Moment capture pipeline
  amplify/        ← Content amplification context builder
  studio/         ← Video production (HeyGen, ElevenLabs, Remotion clients)
  config.ts       ← Loads .lumisrc config with fallbacks to env vars
  index.ts        ← Public API re-exports
```

## The vault

Lumis writes to an Obsidian vault configured in `.lumisrc`. The vault is NOT this repo. The vault path is resolved from:
1. `.lumisrc` in cwd
2. `VAULT_PATH` env var
3. Known fallback: `~/Sites/your-vault`

Vault structure (all paths configurable in `.lumisrc`):
```
Lumis/
  Moments/           ← daily moment notes
  Stories/            ← developed stories
  Learnings/          ← insights extracted from research
  Research/           ← full research notes
    TL;DR/            ← companion summaries
    AI & Agents/      ← categorized by topic
  Amplify/            ← content creation tools
    Structures/       ← content frameworks
    Triggers/         ← persuasion patterns
    Hooks.md          ← scroll-stopping openers
    Prompts.md        ← content idea generators
  Pattern Map.canvas  ← visual connections between moments
```

## Conventions

- All vault paths are relative to `vaultPath` and resolved through `src/vault/paths.ts`
- Frontmatter is parsed/serialized with `gray-matter` via `src/vault/frontmatter.ts`
- Readers return typed objects, writers accept typed objects
- New vault content types follow the pattern: types file, path resolver, reader, writer, re-export in `vault/index.ts` and `index.ts`
- Config changes go in three places: `types/config.ts` (interface + DEFAULT_PATHS), `config.ts` (loadConfig merge), `.lumisrc.example`
- CLI commands live in `src/cli/commands/` and register in `src/cli/index.ts`

## IP separation

Code goes in this repo. Content goes in the vault. No purchased content, no personal moment data, no vault files in git. The `.gitignore` blocks `.lumisrc`, `.env`, PDFs, and the `creator-blueprint/` directory.

## Skills

Lumis has Claude Code skills in `.claude/skills/`:

- **`/moment`** — Captures a daily moment. Reads all existing moments, analyzes the input, finds connections, writes the note, regenerates the Pattern Map canvas, and reports back.
- **`/add-research`** — Saves a URL/PDF/article as research. Fetches content, categorizes it, writes a full note + TL;DR companion, extracts learnings, and reports topic clusters.
- **`/social-coach`** — Reads the vault, recommends what to post where, generates platform-specific scripts.
- **`/produce`** — Takes a script and produces a branded video: HeyGen avatar + Remotion rendering.

All skills read `.lumisrc` for vault paths and write directly to the Obsidian vault.

## Writing style

When writing prose for the vault (moments, research notes, learnings), follow the humanizer rules:
- No AI vocabulary (delve, landscape, crucial, leverage, robust, innovative)
- No filler phrases, no significance inflation, no sycophantic language
- No em dash overuse. Use commas, colons, or periods.
- Vary sentence length. Be specific. Have opinions.
- Preserve the user's voice in moments. The humanizer is for Lumis's writing, not theirs.

## Studio

Lumis includes a video production pipeline powered by HeyGen (avatar video), ElevenLabs (voice), and Remotion (branded rendering).

- **Remotion config** lives at repo root: `remotion.config.ts`
- **Compositions** in `src/studio/compositions/` (excluded from tsc, bundled by Remotion)
- **API clients** in `src/studio/` (heygen.ts, elevenlabs.ts, render.ts)
- **Studio config** is optional in `.lumisrc` under `studio` key, or via env vars (HEYGEN_API_KEY, etc.)
- **Public assets**: `public/raw/` (HeyGen downloads), `public/captions/` (SRT files)

Vault additions:
```
Lumis/
  Scripts/              ← platform-specific content drafts
  Studio/
    Outputs/            ← finished branded videos
```

## Commands

```bash
npm run build        # Compile TypeScript
npm run dev          # Run CLI with tsx
npm run lint         # Type check without emit
npm test             # Run vitest
lumis init [path]    # Scaffold vault structure
lumis moment         # Capture a moment
lumis import-sparks  # Import content from sparks.json manifest
lumis studio list        # List scripts and status
lumis studio render      # Render script to branded video
lumis studio preview     # Open Remotion preview
```
