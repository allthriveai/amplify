# Lumis

<img src="lumis.jpg" alt="Lumis" width="200" align="left">

### Your AI confidant. Lumis helps you capture the small moments from your day, synthesize research into lessons, and turn your real life into content worth sharing.
   
Tell Lumis about your life, share research you are interested in, and learn to craft your own stories.  
 
#### Lumis will help you find the connections across what you've lived and what you've learned:

- **Define your voice** `/init` walks you through setting up your vault and voice interactively in Claude
- **Captures moments** and identifies the "5-second moment," the instant something shifted
- **Finds connections** to your past moments, things you might not have linked on your own
- **Saves research** from articles, books, and videos, and distills them into lessons
- **Builds a Pattern Map** in Obsidian that visualizes how your moments relate over time
- **Coaches what to post** by reading your vault, matching content to your strategy, and drafting platform-specific scripts
- **Produces branded video** from your scripts using AI avatars and automated rendering

This repo is the engine. Your [Obsidian](https://obsidian.md) vault is where your moments, stories, and research live. They stay separate so your personal content never ends up in a code repo. Your stories remain private to you.

## How it works

Lumis owns the full content flywheel. Most tools handle one step. Lumis connects all of them because a social media coach that doesn't know your moments is useless, and a video tool that doesn't know your voice is just another template.

```
  live your life          read something          have a story to tell
       │                       │                         │
       ▼                       ▼                         ▼
  ┌─────────┐           ┌─────────┐               ┌───────────┐
  │ /moment │           │/add-    │               │/story-    │
  │         │           │research │               │  craft    │
  └────┬────┘           └────┬────┘               └─────┬─────┘
       │                     │                          │
       │  5-second moment    │  learnings extracted     │  story developed
       │  connections found  │  topics clustered        │  craft practiced
       │  pattern map built  │  TL;DR companion         │  told and refined
       │                     │                          │
       └─────────────────────┼──────────────────────────┘
                             │
                     ┌───────▼───────┐
                     │    Vault      │  moments, learnings, stories,
                     │   (Obsidian)  │  voice, strategy, patterns
                     └───────┬───────┘
                             │
                     ┌───────▼───────┐  /social-coach
                     │    Coach      │  reads your vault, picks platform,
                     │               │  writes the script
                     └───────┬───────┘
                             │
                     ┌───────▼───────┐  /produce
                     │    Studio     │  HeyGen avatar + ElevenLabs voice
                     │               │  + Remotion branded render
                     └───────┬───────┘
                             │
                             ▼
                      finished video
                      ready to post
```

Each step feeds the next. Your moments become the raw material for stories. Your strategy docs define what to post and where. The studio turns scripts into video with your avatar, your voice, and your branding. One command takes you from "something happened today" to a finished video.

## Setup

```bash
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install
npm run build
claude
```

Then run `/init` to get started. It walks you through choosing your vault path, scaffolds the directory structure, and interviews you to populate Voice.md: who you are, your mission, your audience, what you believe, and how you talk. Lumis reads Voice.md at every layer to align moments, coaching, and video with your identity.

## Commands

```
/init            Set up Lumis in your vault with interactive voice interview
/voice           Fill in or redo your Voice.md
/moment          Capture a moment
/add-research    Save and categorize research
/social-coach    Get content recommendations and generate scripts
/story-craft     Develop storytelling skill from your moments
/produce         Turn a script into a branded video
```

## Docs

- **[Vault structure](docs/vault.md)** — how the Obsidian vault is organized, Voice.md
- **[Signals](docs/signals.md)** — event log connecting pipeline stages
- **[Memory](docs/memory.md)** — session history and user preferences
- **[MCP Server](docs/mcp.md)** — all tools and Claude Desktop config
- **[Studio](docs/studio.md)** — video production pipeline and API setup

## Tech stack

- **Node.js + TypeScript** with ES modules
- **Claude API** for moment analysis and content coaching
- **gray-matter** for YAML frontmatter parsing
- **MCP SDK** for Claude Code integration
- **Remotion** for programmatic video rendering
- **HeyGen** for AI avatar video generation
- **ElevenLabs** for text-to-speech

## License

MIT. See [LICENSE](./LICENSE).
