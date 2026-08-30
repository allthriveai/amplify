# MCP Server

Amplify exposes tools via MCP (Model Context Protocol) for use in Claude Desktop, Cursor, and other MCP clients.

Entry point: `src/mcp/index.ts` (compiles to `dist/mcp/index.js`). Runs on stdio transport.

## Tools

| Tool | Description |
|------|-------------|
| `ingest_source` | Save a raw source into the immutable source layer, emit a `source_ingested` signal |
| `suggest_content` | Rank wiki pages by how well-sourced and how undrafted they are, with suggested platforms |
| `record_signal` | Record feedback: rejected recommendations, posted content, engagement metrics |
| `remember` | Save a preference to `preferences.md` |
| `recall` | Read preferences, recent sessions, and the signal summary |

## Claude Desktop Config

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "amplify": {
      "command": "node",
      "args": ["/path/to/amplify/dist/mcp/index.js"]
    }
  }
}
```

## Tool Details

### record_signal

For user feedback: rejected recommendations, posted content, engagement metrics.

Accepts `signalType` (enum: `recommendation_rejected`, `content_posted`, `engagement_updated`, `cluster_formed`) plus type-specific fields. Validates `pillar` against `building | strategy | ethics | thriving` and `platform` against `linkedin | x | youtube`. Writes to signals.json and session memory.

### remember

Explicit preference capture. Input: `section`, `key`, `value`. Writes to preferences.md under the given section heading and logs to session memory.

### suggest_content

Reads `Wiki/Concepts/`, `Wiki/Synthesis/`, and `Wiki/Summaries/`. Entities are skipped —
they are reference material, not an argument worth publishing.

A page with an empty `sources` list is skipped too. Unsupported opinion is not
publishable material, and the frontmatter is the only reliable way to tell.

Ranking is undrafted first, then source count descending, then most recently updated. A
page counts as drafted when a story folder matching its slugified title already exists.

### recall

Read-only. Returns current preferences, recent session entries (last 3 days), and signal summary with timestamps (rejections, top engagement, clusters). Use when the user asks "what do you remember?" or "what are my preferences?"
