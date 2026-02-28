# Lumis

<img src="lumis.jpg" alt="Lumis" width="200" align="left">

Your AI confidant. Lumis helps you capture the small moments from your day, synthesize research into lessons, and turn your real life into content worth sharing.

You tell Lumis what happened. Lumis handles the rest:

- **Captures moments** and identifies the "5-second moment," the instant something shifted
- **Finds connections** to your past moments, things you might not have linked on your own
- **Saves research** from articles, books, and videos, and distills them into lessons
- **Builds a Pattern Map** in Obsidian that visualizes how your moments relate over time
- **Coaches what to post** by reading your vault, matching content to your strategy, and drafting platform-specific scripts
- **Produces branded video** from your scripts using AI avatars and automated rendering

Lumis lives in your [Obsidian](https://obsidian.md) vault. Everything stays local.

## How it works

Lumis owns the full content flywheel. Most tools handle one step. Lumis connects all of them because a social media coach that doesn't know your moments is useless, and a video tool that doesn't know your voice is just another template.

```
  live your life
       │
       ▼
  ┌─────────┐    /moment
  │ Capture  │───────────────── "Today I watched my daughter
  │          │                   teach her stuffed animals to code"
  └────┬─────┘
       │
       ▼
  ┌─────────┐
  │ Analyze  │──── 5-second moment: the look on her face
  │          │     when the "program" worked
  └────┬─────┘
       │
       ▼
  ┌─────────┐
  │ Connect  │──── Links to 3 past moments about
  │          │     learning, play, and identity
  └────┬─────┘
       │
       ▼
  ┌─────────┐    Pattern Map.canvas
  │ Pattern  │──── Visual graph in Obsidian showing
  │  Map     │     how your moments cluster by theme
  └────┬─────┘
       │
       ▼
  ┌─────────┐    /social-coach
  │  Coach   │──── Reads your strategy, picks the right
  │          │     platform, writes the script
  └────┬─────┘
       │
       ▼
  ┌─────────┐    /produce
  │ Studio   │──── HeyGen avatar + ElevenLabs voice
  │          │     + Remotion branded render
  └────┬─────┘
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
lumis init ~/path/to/your/vault
```

`lumis init` creates the vault structure and scaffolds a `Voice.md` template. Fill in Voice.md first: who you are, your mission, your audience, what you believe, and how you talk. Lumis reads it at every layer to align moments, coaching, and video with your identity.

## Commands

```
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
