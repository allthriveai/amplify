# Lumis

<img src="lumis.jpg" alt="Lumis" width="200" align="left">

### Your AI confidant. Lumis helps you capture the small moments from your day, synthesize research into lessons, and turn your real life into content worth sharing.

Tell Lumis about your life, share research you are interested in, and learn to craft your own stories.

#### Lumis will help you find the connections across what you've lived and what you've learned:

- **Define your voice** `/init` walks you through setting up your vault, voice, and personalized content toolkit
- **Captures moments** and identifies the "5-second moment," the instant something shifted
- **Finds connections** to your past moments, things you might not have linked on your own
- **Saves research** from articles, books, and videos, and distills them into lessons
- **Builds a Pattern Map** in Obsidian that visualizes how your moments relate over time
- **Develops stories** through free writing and guided questions, then shapes them into clean narratives
- **Directs video production** by turning your story into a shot-by-shot timeline, generating avatar clips, and assembling branded video
- **Challenges your thinking** through targeted critical thinking prompts with honest feedback
- **Captures inspiration** by researching people you admire and connecting them to your vault

This repo is the engine. Your [Obsidian](https://obsidian.md) vault is where your moments, stories, and research live. They stay separate so your personal content never ends up in a code repo. Your stories remain private to you.

## How it works

Lumis owns the full content flywheel. Most tools handle one step. Lumis connects all of them because a video director that doesn't know your moments is useless, and a content tool that doesn't know your voice is just another template.

```
  live your life          read something          someone inspires you
       │                       │                         │
       ▼                       ▼                         ▼
  ┌─────────┐           ┌─────────┐               ┌───────────┐
  │ /moment │           │/add-    │               │/add-      │
  │         │           │research │               │inspiration│
  └────┬────┘           └────┬────┘               └─────┬─────┘
       │                     │                          │
       │  5-second moment    │  learnings extracted     │  bio researched
       │  connections found  │  topics clustered        │  vault back-links
       │  pattern map built  │  TL;DR companion         │  found
       │                     │                          │
       └─────────────────────┼──────────────────────────┘
                             │
                     ┌───────▼───────┐
                     │    Vault      │  moments, learnings, stories,
                     │   (Obsidian)  │  voice, inspiration, patterns
                     └───────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼───────┐ ┌───▼──────┐ ┌─────▼─────────┐
      │/craft-content │ │ /craft-  │ │  /challenge   │
      │               │ │ story-   │ │               │
      │ free write    │ │ telling  │ │ pressure-test │
      │ find the story│ │          │ │ your ideas    │
      │ shape the arc │ │ practice │ │ honest feedback│
      └───────┬───────┘ │ & develop│ └───────────────┘
              │         └──────────┘
              │
      ┌───────▼─────────┐
      │ /director-video │  shot-by-shot timeline
      │                 │  HeyGen → Remotion →
      │  Director Cut   │  CapCut polish
      └───────┬─────────┘
              │
              ▼
       branded video output
       (YouTube Shorts, Long-form)
```

Each step feeds the next. Your moments become the raw material for stories. `/craft-content` finds the story through free writing and guided questions. `/director-video` turns the story into a shot-by-shot timeline, generates avatar clips via HeyGen, and assembles branded video with Remotion.

## Setup

```bash
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install
npm run build
claude
/init
```

`/init` walks you through choosing your vault path, scaffolds the directory structure, interviews you to populate Voice.md, then copies and personalizes the Amplify toolkit (8 hook types, 18 content structures, persuasion glossary) using your voice. Lumis reads Voice.md at every layer to align moments, stories, and video with your identity.

## Commands

```
/init               Set up vault, voice, and Amplify toolkit
/voice              Fill in or redo your Voice.md
/moment             Capture a moment
/add-research       Save and categorize research
/add-inspiration    Capture a person who inspires you
/craft-content      Free write, find the story, shape the narrative
/craft-storytelling Practice or develop storytelling from moments
/director-video     Build a shot-by-shot timeline and produce video
/challenge          Pressure-test an idea with critical thinking prompts
```

## Docs

- **[Vault structure](docs/vault.md)** — how the Obsidian vault is organized, Voice.md, Amplify toolkit
- **[Signals](docs/signals.md)** — event log connecting pipeline stages
- **[Memory](docs/memory.md)** — session history and user preferences
- **[MCP Server](docs/mcp.md)** — all tools and Claude Desktop config
- **[Studio](docs/studio.md)** — video production pipeline and API setup

## Tech stack

- **Node.js + TypeScript** with ES modules
- **Claude API** for moment analysis and story development
- **gray-matter** for YAML frontmatter parsing
- **MCP SDK** for Claude Code integration
- **Remotion** for programmatic video rendering
- **HeyGen** for AI avatar video generation
- **ElevenLabs** for text-to-speech

## License

MIT. See [LICENSE](./LICENSE).
