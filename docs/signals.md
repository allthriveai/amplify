# Signals

Lumis uses a structured event log (`Lumis/Signals/signals.json`) to connect pipeline stages. When a moment is captured, a learning extracted, a timeline created, or a video rendered, a signal is emitted. This lets downstream stages make informed decisions without re-scanning the vault.

## Signal Types

| Type | Emitted By | Key Data |
|------|-----------|----------|
| `moment_captured` | capture pipeline, /moment | filename, themes, storyPotential, momentType, fiveSecondMoment |
| `learning_extracted` | MCP add_research, /add-research | filename, pillar, topicTags, sourceResearch |
| `script_drafted` | legacy (scripts) | filename, platform[], pillar, sourceContent |
| `recommendation_rejected` | MCP `record_signal` (user feedback) | reason, pillar, sourceContent |
| `content_posted` | MCP `record_signal` (user feedback) | platform, url, scriptFilename, pillar |
| `engagement_updated` | MCP `record_signal` (user feedback) | platform, url, views, likes, comments, shares |
| `cluster_formed` | /add-research | topicTag, learningCount, learningFilenames[] |
| `story_developed` | /craft-storytelling develop | storyFilename, sourceMoment, craftStatus |
| `story_practice` | /craft-storytelling practice | momentTitle, element |
| `inspiration_added` | /add-inspiration | person, tags, backLinks, path |
| `challenge_completed` | /challenge | idea, prompts, promoted, path |
| `timeline_created` | /director-video | slug, storySource, hook, structure, platform, shotCount, targetDuration |
| `video_rendered` | /director-video produce | slug, outputPath, platform, duration |
| `carousel_created` | /director-carousel | slug, storySource, hook, structure, platform, cardCount |
| `article_created` | /director-article | slug, storySource, hook, structure, platform, wordCount |

## Behavior

- Signals auto-prune after 90 days on every write
- `summarizeSignals()` returns a typed digest: recent moments, rejections, scripted sources, posted content, top engagement, clusters
- User feedback signals come through the `record_signal` MCP tool

## How Director Skills Use Signals

1. `/director-video` emits `timeline_created` when a shot-by-shot timeline is saved
2. `/director-video` emits `video_rendered` when production completes (HeyGen + Remotion assembly)
3. `/director-carousel` emits `carousel_created` when a card plan is saved
4. `/director-article` emits `article_created` when a blog post is saved
5. Each director can check the others' signals to see what formats a story already has

## Implementation

Core module: `src/vault/signals.ts`. Types: `src/types/signal.ts`.

Key functions:
- `readSignals(config)` — read all signals, validates JSON structure and version
- `readRecentSignals(config, days)` — filter to last N days
- `emitSignal(config, signal)` — read, append, prune 90d, write
- `signalId()` — generate `"sig-{timestamp}-{random6}"`
- `summarizeSignals(config)` — returns `SignalSummary` with narrowly-typed arrays
