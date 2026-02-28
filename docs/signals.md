# Signals

Lumis uses a structured event log (`Lumis/Signals/signals.json`) to connect pipeline stages. When a moment is captured, a learning extracted, a script drafted, or content posted, a signal is emitted. This lets downstream stages (social coach, produce) make informed decisions without re-scanning the vault.

## Signal Types

| Type | Emitted By | Key Data |
|------|-----------|----------|
| `moment_captured` | capture pipeline, /moment | filename, themes, storyPotential, momentType, fiveSecondMoment |
| `learning_extracted` | MCP add_research, /add-research | filename, pillar, topicTags, sourceResearch |
| `script_drafted` | /social-coach | filename, platform[], pillar, sourceContent |
| `recommendation_rejected` | MCP `record_signal` (user feedback) | reason, pillar, sourceContent |
| `content_posted` | MCP `record_signal` (user feedback) | platform, url, scriptFilename, pillar |
| `engagement_updated` | MCP `record_signal` (user feedback) | platform, url, views, likes, comments, shares |
| `cluster_formed` | /add-research | topicTag, learningCount, learningFilenames[] |
| `story_developed` | /story-craft develop | storyFilename, sourceMoment, craftStatus |
| `story_practice` | /story-craft practice | momentTitle, element |

## Behavior

- Signals auto-prune after 90 days on every write
- `summarizeSignals()` returns a typed digest: recent moments, rejections, scripted sources, posted content, top engagement, clusters
- Social coach reads signals to skip already-scripted content, avoid rejected topics, and boost high-engagement themes
- User feedback signals come through the `record_signal` MCP tool

## How Social Coach Uses Signals

1. Skip moments with `script_drafted` signals (already scripted)
2. Avoid topics/pillars with `recommendation_rejected` in last 30 days
3. Don't re-recommend content already posted to the same platform
4. Highlight when `moment_captured` + `learning_extracted` converge on same theme
5. Boost themes with strong `engagement_updated` signals
6. Recommend content from `cluster_formed` topics

## Implementation

Core module: `src/vault/signals.ts`. Types: `src/types/signal.ts`.

Key functions:
- `readSignals(config)` — read all signals, validates JSON structure and version
- `readRecentSignals(config, days)` — filter to last N days
- `emitSignal(config, signal)` — read, append, prune 90d, write
- `signalId()` — generate `"sig-{timestamp}-{random6}"`
- `summarizeSignals(config)` — returns `SignalSummary` with narrowly-typed arrays
