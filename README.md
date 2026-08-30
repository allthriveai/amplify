# Lumis

<img src="lumis.jpg" alt="Lumis" width="200" align="left">

### Your AI life coach. Lumis makes you show up every day, holds you to the goals you set, and uses your own life as the evidence.

Most journaling tools are write-only. You pour things in and nothing ever comes back. Lumis is built the other way around: every session opens with what you said you'd do, how long it's been sitting, and which of your goals have gone quiet.

<br clear="left"/>

## The loop

Three commands, three rhythms. Everything else feeds them.

| | | |
|---|---|---|
| **Daily** | `/journal` | Receipt, your unfiltered entry, the five-second moment, patterns across every past entry |
| **Weekly** | `/week` | The reckoning: what moved, what didn't, three commitments |
| **Ongoing** | `/goals` | The targets both of the above hold you to |

## What a morning looks like

```
$ lumis today

Where you are
Last entry: 4 days ago · streak 0 · longest 3 · 12 total

**Carried over**
- [ ] Draft the launch post (moved 6 days)
- [ ] Reply to Sam (moved 2 days)

**Targets going quiet**
- Publish a post — 118 days (weekly)
- Work out — 1 of 3 this week

Drift
  1 task carried a week or more: "Draft the launch post" (6d)
  9 of the last 30 days had no entry
```

No encouragement, no streak-recovery narrative, no reframing four missed days as a fresh start. The numbers do the work.

## Why this works when reminders don't

**Tasks age, and the number is public.** An unfinished task comes back tomorrow as `(moved 6 days)`, aged by the real gap — skip three days and it jumps three. A task that has moved ten days isn't a task anymore, it's a decision you haven't made. Lumis will offer to kill it, and killing it is a legitimate answer.

**Goals are checked, not just stored.** `Goals.md` holds your prose. An `## Active Targets` section holds the machine-readable half:

```markdown
## Active Targets
- [ ] Publish a post `cadence:weekly` `last:2026-04-21` #goal/writing
- [ ] Work out `cadence:3x-weekly` #goal/workout
- [ ] Ship the redesign #goal/product
```

Recurring targets get a cadence and surface the moment they go quiet. Milestones omit cadence so they never nag. Finish a daily task tagged `#goal/writing` and the matching target gets stamped automatically — targets stay current because real work moved them, not because you remembered to update a tracker.

`3x-weekly` means three times a week rather than once. Those are scored on completions inside the period, so the receipt says "1 of 3 this week" instead of a days-since figure — the right question for something you never intended to do daily. Missing one doesn't count as drift; missing all three does.

**Drift is visible across weeks, not inside them.** Any single day looks fine. Lumis counts what only shows up in aggregate: tasks carried past a week, targets abandoned rather than merely slipping, themes you keep circling in your moments, days that went silent. `/week` puts them in front of you and asks what you're going to do.

**It never writes your reflection for you.** Lumis transcribes your words and fixes grammar. It doesn't improve your thinking or tell you how to feel about a bad week.

## Feeding the loop

The coach is only as good as the evidence. These put real material in the vault:

- **`/moment`** — Captures a moment from your day and finds the "5-second moment," the instant something shifted. Connects it to past moments and rebuilds the Pattern Map. Over months this becomes the record of what actually happened to you, which is what `/week` reads when it asks why the same theme keeps coming up.
- **`/challenge`** — Pressure-tests an idea with critical thinking prompts and honest feedback. When a task has been carried for three weeks, the block is usually a belief, not a schedule problem.
- **`/ingest`** — Saves a source immutably, distills a wiki page from it, and updates every entity and concept it touches.
- **`/wiki`** — Answers a question from the wiki, with citations back to the pages.
- **`/lint`** — Health-checks the wiki: orphans, broken links, contradictions, stale claims, index drift.
- **`/add-inspiration`** — Researches someone you admire and links them back into your vault.
- **`/meeting`** — Turns a transcript or pasted notes into decisions, action items, and attendees.
- **`/voice`** and **`/brand`** — Who you are and how you look. Read by everything that writes.

## The visibility arm

For a lot of people, one of the goals is *be seen doing the work*. That's a target like any other, and it's the one that's hardest to fake — you either published or you didn't.

So Lumis also owns the pipeline that turns your captured life into things you can publish:

- **`/craft-content`** — Free write, find the story, shape the narrative. The story is the asset.
- **`/draft-video`** · **`/draft-carousel`** · **`/draft-article`** · **`/draft-images`** · **`/draft-diagram`** — Remix one story into platform-ready formats.
- **`/linkedin-post`** · **`/youtube-description`** · **`/youtube-short`** — Platform-native writing with hook rules baked in.
- **`/humanizer`** — Strips AI vocabulary, filler, em dash overuse, and structural tells from any prose.
- **`lumis studio render`** — HeyGen avatar clips, ElevenLabs voiceover, Remotion assembly, branded `.mp4`.

> **Heads up:** this half is being split into its own repo. Lumis is becoming the coach; the content flywheel becomes a separate tool that reads the same vault. Nothing is going away — the seam is the vault, not the code. The tag `v0.1.0-pre-split` marks the last version with both halves together.

## The vault has three layers

The coach needs evidence, and evidence accumulates. Lumis borrows [Andrej Karpathy's LLM Wiki
pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) for the half of the
vault that holds what you know, so the folder tree answers one question: **may the agent rewrite
this?**

| Layer | Folder | Ownership |
|---|---|---|
| Raw sources | `Sources/` | Immutable. Read and cited, never rewritten. |
| The wiki | `Wiki/` | Agent-owned. Created, rewritten, kept current. |
| The schema | `CLAUDE.md` | The contract both layers follow. |

`/ingest` saves a source to `Sources/` untouched, distills a page into `Wiki/Summaries/`, then
updates every concept and entity page it touches plus `index.md` and `log.md`. One source
touching 10-15 pages is normal — that bookkeeping is the part people abandon and the part an
agent does without getting bored. `/wiki` answers questions from it with citations; `/lint`
catches orphans, broken links, and contradictions.

**`Life/` is never ingested.** Your moments, daily notes, and reviews stay out of the wiki
entirely, so the content pipeline can read everything it has access to without touching anything
personal.

## How it works

```
                     ┌──────────────────┐
                     │     Goals.md     │
                     │                  │
                     │  the job you     │◀────── edit when a target
                     │  want, targets   │        keeps getting missed
                     │  with a cadence  │
                     └────────┬─────────┘
                              │ holds you to it
                              ▼
   ┌──────────────────────────────────────────────────────┐
   │                      THE LOOP                        │
   │                                                      │
   │   every morning     ┌────────────────────┐           │
   │   every evening ───▶│  /today   /journal │           │
   │                     └─────────┬──────────┘           │
   │                               │  receipt · carried   │
   │                               │  quiet targets       │
   │                               ▼                      │
   │   every sunday   ────▶┌──────────┐                   │
   │                       │  /week   │                   │
   │                       └────┬─────┘                   │
   │                            │  what moved, what didn't│
   │                            │  three commitments      │
   └────────────────────────────┼─────────────────────────┘
                                │
        ┌───────────────────────┴────────────────────────┐
        │                Vault (Obsidian)                │
        │                                                │
        │  Sources/   raw, immutable — never rewritten   │
        │  Wiki/      agent-maintained knowledge         │
        │  Life/       your days — never ingested         │
        │  Work/      projects, stories, strategy        │
        └───────┬────────────────────────────────┬───────┘
                │                                │
      evidence in                        visibility out
                │                                │
   ┌────────────┴─────────────┐    ┌─────────────┴──────────────┐
   │ /moment    /challenge    │    │ /craft-content             │
   │ /ingest /meeting /wiki   │    │ /draft-video /draft-article│
   │ /add-inspiration         │    │ /draft-carousel  /draft-*  │
   └──────────────────────────┘    └─────────────┬──────────────┘
                                                 │
                                                 ▼
                                      HeyGen · ElevenLabs
                                      Remotion → branded .mp4
```

This repo is the engine. Your [Obsidian](https://obsidian.md) vault is where your days, goals, moments, and stories live. They stay separate so your personal writing never ends up in a code repo.

## Setup

```bash
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install
npm run build
npm link          # puts the `lumis` command on your PATH
claude
/init
```

`/init` scaffolds your vault, writes `.lumisrc`, and interviews you to populate Voice.md. Then:

```
/goals      set the targets the coach will hold you to
/today      start the loop
```

Run `/today` tomorrow morning and it will already know how you did.

## Commands

**The loop**

```
/journal            Receipt, entry, five-second moment, patterns
/today              Alias for /journal
/today (evening)    Check tasks off, reflect, close the day
/week               The weekly reckoning and next week's commitments
/goals              Set your north star and active targets
```

Goals are tracked through tagged tasks, not by editing `Goals.md`. Write a priority as
`- [ ] gym before work #goal/workout`, then close the day with
`lumis today --done "gym before work"`. That checks the box and stamps the target. You never
update the tracker by hand.

**Evidence**

```
/moment             Capture a moment and find the 5-second shift
/challenge          Pressure-test an idea with honest feedback
/ingest             Save a source and distill it into the wiki
/wiki               Ask the wiki a question, with citations
/lint               Health-check the wiki
/add-inspiration    Capture a person who inspires you
/meeting            Turn a transcript into decisions and action items
/voice              Fill in or redo your Voice.md
/brand              Set up your visual brand identity
/init               Set up vault, voice, and Amplify toolkit
```

**Visibility**

```
/craft-content      Free write, find the story, shape the narrative
/craft-storytelling Practice or develop storytelling from moments
/draft-video        Shot-by-shot timeline, storyboard, produce video
/draft-carousel     LinkedIn carousel from a story
/draft-article      Long-form article from a story
/draft-images       AI images for any draft format
/draft-diagram      Interactive React Flow diagram from a story
/linkedin-post      LinkedIn post optimized for saves and dwell time
/youtube-description  YouTube description optimized for search
/youtube-short      Build a Short from existing video
/youtube-upload     Upload, schedule, and publish to YouTube
/humanizer          Strip AI-writing tells from any prose
/listen             Convert a source note to narrated audio
```

**CLI**

```
lumis today                 Open today's journal
lumis today --done "task"   Check tasks off and close the day
lumis week [YYYY-MM-DD]     Write a weekly review
lumis moment "..."          Capture a moment
lumis patterns              Regenerate the Pattern Map
lumis init [path]           Set up Lumis in a vault
lumis studio list           List all draft cuts with status
lumis studio render <slug>  Render a draft cut to branded video
lumis studio preview        Open Remotion Studio
lumis storyboard <slug>     Visual storyboard for pre-production
lumis listen <note>         Convert a source note to audio
lumis story-craft [develop] Practice or develop storytelling from a moment
lumis import-sparks --from <path>  Import Amplify content from a manifest
lumis obs <cmd>             OBS capture (setup, start, stop, scenes)
```

## Docs

- **[Vault structure](docs/vault.md)** — how the vault is organized, Voice.md, Amplify toolkit
- **[Signals](docs/signals.md)** — event log connecting every stage
- **[Memory](docs/memory.md)** — session history and preferences
- **[MCP Server](docs/mcp.md)** — all tools and Claude Desktop config
- **[Studio](docs/studio.md)** — video pipeline, image generation, API setup
- **[OBS Capture](docs/obs.md)** — screen and camera recording

## Contributing

This repo is public and must stay free of personal data. Your vault holds the
personal half; the repo holds only the tool.

```bash
npm install          # also installs the pre-commit hook
npm run check:personal
npm run lint && npm test
npm run check:vault  # asserts every configured vault path exists
npm run lint:wiki    # wiki structure: broken links, orphans, index drift
```

The pre-commit hook blocks home paths, emails, API keys, and hardcoded vault
locations. Add real names you want caught to `.personal-patterns` (gitignored).
Examples in docs and skills must use invented data.

`check:vault` catches the other silent failure: a renamed folder leaves a resolver pointing at
nothing, and the skill using it quietly creates an empty directory instead of erroring. Run it
after any change to `paths` in `.lumisrc` or `DEFAULT_PATHS`.

## Tech stack

- **Node.js + TypeScript** with ES modules
- **Claude API** for moment analysis and story development
- **MCP SDK** — 12 tools, works in Claude Code and Claude Desktop
- **gray-matter** for YAML frontmatter
- **Remotion** for programmatic video rendering
- **HeyGen** for AI avatar video
- **ElevenLabs** for text-to-speech
- **Google Imagen** for image generation
- **React Flow** for interactive diagrams (CDN, no npm dependency)

## License

MIT. See [LICENSE](./LICENSE).
