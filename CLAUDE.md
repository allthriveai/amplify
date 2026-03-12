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
  types/          ← TypeScript interfaces (moment, canvas, config, research, amplify, signal, memory, story, studio, director, diagram)
  vault/          ← Read/write Obsidian markdown files with gray-matter frontmatter
  cli/            ← CLI commands (moment, init, import-sparks)
  mcp/            ← MCP server (stdio transport, 11 tools)
  ai/             ← Claude API integration for moment analysis
  canvas/         ← Obsidian canvas file generation
  pipeline/       ← Moment capture pipeline
  amplify/        ← Content amplification context builder
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
- Config changes go in three places: `types/config.ts` (interface + DEFAULT_PATHS), `config.ts` (loadConfig merge), `.lumisrc.example`
- CLI commands live in `src/cli/commands/` and register in `src/cli/index.ts`

## Skills

Lumis has Claude Code skills in `.claude/skills/`:

- **`/init`** — Interactive vault setup. Asks for vault path, scaffolds directories, writes `.lumisrc`, walks through voice interview to populate Voice.md, then copies and personalizes the Amplify toolkit (8 hook types, 18 structures, persuasion glossary).
- **`/voice`** — Standalone voice interview. Fills in or redoes Voice.md through a guided conversation.
- **`/moment`** — Captures a daily moment. Reads all existing moments, analyzes the input, finds connections, writes the note, regenerates the Pattern Map canvas, and reports back. Use `/moment private` to mark a moment as private: it still gets full pattern analysis and connections but is excluded from all content pipelines (`/craft-content`, `/director-*`, `social_coach`, `story_craft`).
- **`/add-research`** — Saves a URL/PDF/article as research. Fetches content, categorizes it, writes a full note + TL;DR companion, extracts learnings, and reports topic clusters.
- **`/craft-storytelling`** — Develops storytelling skill from captured moments. Practice mode or full story development.
- **`/craft-content`** — Finds a story and shapes it into a clean narrative draft. Free write, find the 5-second moment, build the arc, write, review. The story is the asset; director skills remix it into formats.
- **`/director-video`** — Takes a crafted story and produces a shot-by-shot video timeline. Picks hook + structure from Amplify, builds a Director Cut timeline, optionally produces avatar clips via HeyGen and assembles with Remotion.
- **`/director-carousel`** — LinkedIn carousel from a crafted story. Builds card-by-card plan with copy and image direction.
- **`/director-article`** — Long-form blog post from a crafted story. Writes the full article using the narrative arc.
- **`/director-images`** — Generates AI images for any director format (video, carousel, article) using Google Imagen. Finds image slots, builds brand-aware prompts, generates images, and updates source files so images flow into rendering automatically.
- **`/director-diagram`** — Creates interactive React Flow diagrams from crafted stories. Picks diagram type (flow, concept map, timeline, comparison), extracts nodes and edges from the story, renders a standalone HTML file with React Flow and a PNG screenshot.
- **`/add-inspiration`** — Captures a person who inspires you. Researches their bio, work, and quotes on the web, then asks what you admire and what you've learned from them.
- **`/challenge`** — Challenges an idea or belief through critical thinking prompts. Picks 2-3 prompts matched to the input, runs them one at a time, logs to Challenge Log, optionally promotes insights to the second brain.
- **`/brand`** — Sets up your visual brand identity. Interview mode writes brand colors, fonts, and visual style to `.lumisrc` and Brand.md. Add mode (`/brand add [url]`) saves visual inspiration references.
- **`/humanizer`** — Removes signs of AI-generated writing. Detects and fixes AI vocabulary, significance inflation, em dash overuse, filler phrases, and structural tells.
- **`/youtube-description`** — Writes YouTube video descriptions. Hook-first structure optimized for search and click-through. Keyword placement, timestamps, CTA strategy, humanizer rules baked in.
- **`/linkedin-post`** — Writes LinkedIn posts optimized for saves and dwell time. Hook under 110 chars, multiple post structures (story, listicle, contrarian, before/after), links in first comment, humanizer rules baked in.

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
