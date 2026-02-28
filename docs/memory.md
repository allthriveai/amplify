# Memory

Lumis maintains session history and user preferences in `Lumis/Memory/`.

## Session Logs

`Lumis/Memory/sessions/YYYY-MM-DD.md`: timestamped entries for each action taken during a session. Every pipeline stage appends an entry.

```markdown
# Session: 2026-02-28

- **15:00** — moment_captured: Captured "The question I couldn't answer" (high potential, themes: parenthood, identity)
- **15:05** — research_added: Saved "Building Agents with MCP" to AI & Agents, extracted 2 learnings
- **16:00** — coaching_done: Created 3 scripts for linkedin, x, youtube (pillars: building, thriving)
```

## Preferences

`Lumis/Memory/preferences.md`: markdown file with section headings. Browsable in Obsidian. Updated via the `remember` MCP tool.

```markdown
# Preferences

## Content Style
- **LinkedIn tone**: More conversational, less corporate

## Coaching
- **Pillar focus**: Wants more ethics content

## Topics
- **Avoid**: Enterprise sales, marketing buzzwords
```

## Boundaries

- Moments stay pure. Memory and preferences never influence moment analysis.
- Memory only feeds into coaching and production.
- The `recall` MCP tool returns preferences + recent sessions + signal summary.

## Implementation

Config uses a single `memory` path (default: `Lumis/Memory`). The module derives `sessions/` and `preferences.md` internally.

Core module: `src/vault/memory.ts`. Types: `src/types/memory.ts`.

Key functions:
- `appendSessionEntry(config, entry)` — append to today's session file
- `formatSessionTime(date?)` — format a Date as HH:MM
- `readSession(config, date?)` — read a specific day's log
- `readRecentSessions(config, days)` — read last N days
- `readPreferences(config)` — read preferences.md
- `addPreference(config, section, key, value)` — add/update a preference under a section heading
