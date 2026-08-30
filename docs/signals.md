# Signals

Amplify uses a structured event log (`Amplify/Signals/signals.json`) to connect pipeline stages. When a source is ingested, a timeline created, or a video rendered, a signal is emitted. This is what closes the flywheel: downstream stages read signals instead of re-scanning the vault, and `suggest_content` uses them to avoid recommending what you just published.

## Signal Types

| Type | Emitted By | Key Data |
|------|-----------|----------|
| `source_ingested` | /ingest, MCP `ingest_source` | filename, title, wikiPages, tags |
| `recommendation_rejected` | MCP `record_signal` (user feedback) | reason, pillar, sourceContent |
| `content_posted` | MCP `record_signal` (user feedback) | platform, url, scriptFilename, pillar |
| `engagement_updated` | MCP `record_signal` (user feedback) | platform, url, views, likes, comments, shares |
| `story_developed` | /craft-content | storyFilename, sourceMoment, craftStatus |
| `inspiration_added` | /add-inspiration | person, tags, backLinks, path |
| `timeline_created` | /draft-video | slug, storySource, hook, structure, platform, shotCount, targetDuration |
| `video_rendered` | /draft-video produce | slug, outputPath, platform, duration |
| `carousel_created` | /draft-carousel | slug, storySource, hook, structure, platform, cardCount |
| `article_created` | /draft-article | slug, storySource, hook, structure, platform, wordCount |

## Behavior

- Signals auto-prune after 90 days on every write
- `summarizeSignals()` returns a typed digest: recent ingests, rejections, posted content, top engagement
- User feedback signals come through the `record_signal` MCP tool

## How Director Skills Use Signals

1. `/draft-video` emits `timeline_created` when a shot-by-shot timeline is saved
2. `/draft-video` emits `video_rendered` when production completes (HeyGen + Remotion assembly)
3. `/draft-carousel` emits `carousel_created` when a card plan is saved
4. `/draft-article` emits `article_created` when a blog post is saved
5. Each director can check the others' signals to see what formats a story already has

## Implementation

Core module: `src/vault/signals.ts`. Types: `src/types/signal.ts`.

Key functions:
- `readSignals(config)` — read all signals, validates JSON structure and version
- `readRecentSignals(config, days)` — filter to last N days
- `emitSignal(config, signal)` — read, append, prune 90d, write
- `signalId()` — generate `"sig-{timestamp}-{random6}"`
- `summarizeSignals(config)` — returns `SignalSummary` with narrowly-typed arrays
