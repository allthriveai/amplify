# MCP Server

Lumis exposes tools via MCP (Model Context Protocol) for use in Claude Desktop, Cursor, and other MCP clients.

Entry point: `src/mcp/index.ts` (compiles to `dist/mcp/index.js`). Runs on stdio transport.

## Tools

| Tool | Description |
|------|-------------|
| `capture_moment` | Full pipeline: analyze, connect, write, humanize, regenerate canvas, emit signal |
| `get_moments` | Read moments with optional theme filter and limit |
| `get_patterns` | Pattern map theme clusters and connection summary |
| `add_research` | Auto-categorize and save research to vault, emit signal |
| `social_coach` | Recommend content with pillar balance analysis, reads signals + memory |
| `get_scripts` | List scripts with status filter |
| `record_signal` | Record user feedback: rejected recommendations, posted content, engagement metrics |
| `remember` | Save a user preference to preferences.md |
| `recall` | Read preferences, recent sessions, and signal summary |
| `story_craft_practice` | Surface a high-potential moment with a focused storytelling exercise |
| `story_craft_develop` | Develop a moment into a full story through guided conversation |

## Claude Desktop Config

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lumis": {
      "command": "node",
      "args": ["/path/to/lumis/dist/mcp/index.js"]
    }
  }
}
```

## Tool Details

### record_signal

For user feedback: rejected recommendations, posted content, engagement metrics.

Accepts `signalType` (enum: `recommendation_rejected`, `content_posted`, `engagement_updated`, `script_drafted`, `cluster_formed`) plus type-specific fields. Validates `pillar` against `building | strategy | ethics | thriving` and `platform` against `linkedin | x | youtube`. Writes to signals.json and session memory.

### remember

Explicit preference capture. Input: `section`, `key`, `value`. Writes to preferences.md under the given section heading and logs to session memory.

### recall

Read-only. Returns current preferences, recent session entries (last 3 days), and signal summary with timestamps (rejections, top engagement, clusters). Use when the user asks "what do you remember?" or "what are my preferences?"
