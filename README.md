# Lumis

**Your AI confidant.** Capture a moment each day, and Lumis finds the meaning in it: the 5-second shift, the connections to your past, the patterns you didn't see. Over time, it weaves your moments into a tapestry that's uniquely yours.

Lumis lives in your [Obsidian](https://obsidian.md) vault. Everything stays local. Your moments are yours.

## What it does

- **Captures moments** — Tell Lumis what happened today. It distills the raw experience into a structured note with the 5-second moment of shift or realization at its core.
- **Finds connections** — Each new moment is compared against your entire history. Lumis spots shared themes, emotional echoes, progressions, and opposites you might have missed.
- **Builds a Pattern Map** — An Obsidian canvas that visualizes your moments grouped by theme, with edges showing how they connect. You can see your life patterns at a glance.
- **Grows your voice** — The more moments you capture, the richer the material for storytelling, reflection, and self-knowledge.

## The loom

Think of each moment as a thread. Lumis is the loom.

Individual threads are interesting on their own. But when you lay them side by side, patterns emerge: recurring themes, people who keep showing up, fears that echo across years, joys that rhyme.

**Threads** become **patterns**. Patterns become a **tapestry**. The tapestry is your story.

## Quick start

```bash
# Clone and install
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install

# Point Lumis at your vault
cp .env.example .env
# Edit .env: set VAULT_PATH and ANTHROPIC_API_KEY

# Set up Lumis folders in your vault
npx tsx src/cli/index.ts init ~/path/to/your/vault

# Capture your first moment
npx tsx src/cli/index.ts moment "Today my daughter asked me why the sky is blue and I realized I didn't know."
```

## How it works

When you capture a moment, Lumis runs a pipeline:

1. **Read** — Loads all your existing moments from the vault
2. **Analyze** — Sends your raw input to Claude, which identifies the 5-second moment, themes, people, places, and story potential
3. **Connect** — Compares the new moment against your history to find meaningful connections
4. **Write** — Creates a structured markdown note with frontmatter, the moment, the 5-second shift, and connections as wiki-links
5. **Humanize** — Runs a pass to strip AI vocabulary and keep the writing natural
6. **Map** — Regenerates the Pattern Map canvas with the new moment placed in its theme cluster
7. **Link** — Adds a reference to today's daily note (if it exists)

The output is plain markdown and JSON. No lock-in, no proprietary format. Your vault, your data.

## Using with Claude Code

Lumis includes an MCP server so you can use it directly from Claude Code:

```json
// In your Claude Code MCP settings
{
  "lumis": {
    "command": "npx",
    "args": ["tsx", "/path/to/lumis/src/mcp/index.ts"],
    "env": {
      "VAULT_PATH": "~/my-vault",
      "ANTHROPIC_API_KEY": "sk-ant-..."
    }
  }
}
```

This exposes three tools:
- `capture-moment` — Capture a moment from Claude Code
- `get-moments` — Read your existing moments
- `get-patterns` — Get the pattern map data

## Configuration

Lumis loads config from three places (in priority order):

1. **`.lumisrc`** in your vault root (JSON)
2. **`.env`** in the lumis directory
3. **Environment variables**

### `.lumisrc` example

```json
{
  "vaultPath": "/Users/you/my-vault",
  "paths": {
    "moments": "Lumis/Moments",
    "stories": "Lumis/Stories",
    "canvas": "Lumis/Pattern Map.canvas",
    "dailyNotes": "Daily Notes",
    "dailyNoteFormat": "YYYY-MM-DD"
  }
}
```

### Default paths

| Setting | Default | What it is |
|---------|---------|------------|
| `moments` | `Lumis/Moments` | Where moment notes are stored |
| `stories` | `Lumis/Stories` | Where developed stories go |
| `canvas` | `Lumis/Pattern Map.canvas` | The visual pattern map |
| `dailyNotes` | `Daily Notes` | Daily notes folder |
| `dailyNoteFormat` | `YYYY-MM-DD` | Filename format for daily notes |

These defaults work for a fresh vault. If you use PARA, Zettelkasten, or any other structure, just update the paths in `.lumisrc`.

## Architecture

Lumis is a read/write companion to your Obsidian vault. The vault is always the source of truth.

```
You  -->  Lumis  -->  Your Vault
          (analyze,    (moments,
           connect,     stories,
           map)         canvas)
```

Lumis never modifies files it didn't create. It writes to its own directories (`Lumis/Moments`, `Lumis/Stories`) and the Pattern Map canvas. Everything else in your vault is read-only to Lumis.

### Tech stack

- **Node.js + TypeScript** — Core runtime
- **Claude API** — Moment analysis and humanization
- **gray-matter** — YAML frontmatter parsing
- **MCP SDK** — Claude Code integration

## Feeding the Digital Twin

If you're building a [Digital Twin](https://github.com/allthriveai/digital-twin) video pipeline, Lumis gives it soul.

The Digital Twin reads from your vault to generate scripts in your voice. But scripts need more than knowledge: they need stories, opinions, emotional texture. That's what Lumis provides.

```
Lumis (moments, stories, voice)  -->  Vault  <--  Digital Twin (scripts, video)
```

Your moments become the raw material for authentic content. The Pattern Map helps the script generator find thematic connections. Your stories give the Digital Twin something real to say.

## Roadmap

### Built
- [x] Project scaffold and types
- [x] Vault reader/writer with configurable paths
- [x] Canvas builder with theme-based circular layout
- [x] CLI skeleton (`moment`, `patterns`, `init`)
- [x] MCP server skeleton

### Coming
- [ ] Full moment capture pipeline (analyze, connect, write, humanize)
- [ ] `lumis init` implementation
- [ ] MCP server with tool handlers
- [ ] Tests with fixture moments
- [ ] npm publish
- [ ] Story development pipeline (captured > exploring > developing > told)
- [ ] Weekly/monthly reflection summaries
- [ ] Voice fingerprinting (learn your writing style over time)

## All Thrive ecosystem

| Project | What it does | Repo |
|---------|-------------|------|
| **Lumis** | AI confidant. Captures moments, finds patterns, grows your voice. | [allthriveai/lumis](https://github.com/allthriveai/lumis) |
| **Digital Twin** | Video pipeline. Turns your vault into content that sounds like you. | [allthriveai/digital-twin](https://github.com/allthriveai/digital-twin) |
| **Example Co** | Character evaluation. Scores AI agents on virtue, reasoning, and compassion. | [ethos.academy](https://ethos.academy) |

Lumis captures who you are. Digital Twin broadcasts it. Ethos keeps it honest.

## License

MIT
