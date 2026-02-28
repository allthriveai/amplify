# Lumis

Lumis is your AI-powered life coach, second brain orchestrator, and storytelling engine. It helps you capture the small moments from your day, find the hidden patterns between them, and turn those patterns into stories worth sharing.

Inspired by the daily practice of noticing what matters, Lumis takes it further. You describe what happened, and Lumis:

- **Identifies the "5-second moment"** in your story, the instant something shifted
- **Finds connections** to your past moments, things you might not have linked on your own
- **Builds a Pattern Map** in Obsidian that visualizes how your moments relate over time
- **Amplifies your stories** into content using hooks, structures, triggers, and prompts

It lives in your [Obsidian](https://obsidian.md) vault. Everything stays local. Your data never leaves your machine.

## The pipeline

Live your life → capture moments → find patterns → tell stories → share them.

Lumis owns the entire arc. A social media coach that doesn't know your moments is useless. Lumis already has the raw material: your real life. The hooks, structures, and storytelling frameworks all exist to amplify *your* stories, not generate generic content.

## Why this exists

Most journaling tools help you write. Lumis helps you notice. The real value isn't the writing itself. It's training your brain to pay attention to the small moments that actually matter. Lumis handles the analysis so you can focus on the noticing.

## Vault structure

```
Lumis/
  Moments/           ← what happened
  Stories/            ← what it means
  Learnings/          ← what you took from it
  Research/           ← things you're learning
  Amplify/            ← how you share it with the world
    Structures/       ← content frameworks
    Triggers/         ← persuasion patterns
    Hooks.md          ← scroll-stopping openers
    Prompts.md        ← content idea generators
  Pattern Map.canvas  ← how moments connect
```

## Status

**v0.1.0. Early scaffold.**

What's built:

- TypeScript types for moments, connections, canvas, research, and amplify
- Vault reader/writer (reads/writes Obsidian markdown with frontmatter)
- Canvas builder (generates Obsidian canvas files with theme-based layout)
- Amplify system (structures, triggers, hooks, prompts)
- CLI: `lumis moment`, `lumis init`, `lumis import-sparks`
- MCP server skeleton

What's next:

- Moment capture pipeline (analyze, connect, write)
- MCP tool handlers
- Tests
- npm packaging

## Tech stack

- Node.js + TypeScript
- Claude API (for moment analysis)
- gray-matter (YAML frontmatter parsing)
- MCP SDK (for Claude Code integration)

## Contributing

This is early. If you're interested in building tools that help people notice what matters and share it, open an issue or a PR.

```bash
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install
npm run build
```

## License

MIT. See [LICENSE](./LICENSE).
