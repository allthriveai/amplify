# Lumis

Lumis is an open-source AI tool that helps you practice "Homework for Life," a concept from Matthew Dicks' book *Storyworthy*. The idea is simple: every day, write down the one moment from your day that would make the best story. Do this long enough and you start seeing patterns in your life you never noticed before.

Lumis automates and deepens that practice. You describe what happened, and Lumis:

- **Identifies the "5-second moment"** in your story, the instant something shifted
- **Finds connections** to your past moments, things you might not have linked on your own
- **Builds a Pattern Map** in Obsidian that visualizes how your moments relate over time

It lives in your [Obsidian](https://obsidian.md) vault. Everything stays local. Your data never leaves your machine.

## The pipeline

Live your life → capture moments → find patterns → tell stories → share them.

Lumis owns the entire arc. A social media coach that doesn't know your moments is useless. Lumis already has the raw material: your real life. The hooks, structures, and storytelling frameworks all exist to amplify *your* stories, not generate generic content.

## Why this exists

Most journaling tools help you write. Lumis helps you notice. The real value of Homework for Life isn't the writing itself. It's training your brain to pay attention to the small moments that actually matter. Lumis handles the analysis so you can focus on the noticing.

## Status

**v0.1.0. This is a scaffold, not a working tool yet.**

What's built:

- TypeScript types for moments, connections, and canvas data
- Vault reader and writer (reads/writes Obsidian markdown with frontmatter)
- Canvas builder (generates Obsidian canvas files with theme-based layout)
- CLI skeleton (commands defined but not wired up)
- MCP server skeleton (tool definitions exist, handlers are stubs)

What's not built yet:

- The actual moment capture pipeline (analyze, connect, write)
- The `lumis init` command
- MCP tool handlers
- Tests
- npm packaging

If you clone this today, you'll get a well-structured TypeScript project with clear types and file I/O, but you can't capture a moment yet. That's the next milestone.

## Tech stack

- Node.js + TypeScript
- Claude API (for moment analysis)
- gray-matter (YAML frontmatter parsing)
- MCP SDK (for Claude Code integration, eventually)

## Contributing

This is early. If you're interested in the Homework for Life practice and want to help build this, open an issue or a PR. The types in `src/types/` and the pipeline outline in `src/pipeline/capture.ts` are good places to start reading.

```bash
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install
npm test
```

## License

MIT. See [LICENSE](./LICENSE).
