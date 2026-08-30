# Amplify

### Turn your second brain into published content.

You already read things. You already take notes. Amplify is the machine that turns that
pile into a wiki, turns the wiki into stories, and turns the stories into a finished
video, carousel, or article with your own voice and your own face on it.

**Amplify stores nothing.** It is a CLI and an MCP server that connects to your Obsidian
vault. Every source, page, story, and script lives in your vault, in plain markdown, on
your disk. Delete this repo tomorrow and you still have everything.

## The flywheel

```
  you read something
         │
         ▼
   ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
   │  Sources  │ ──▶ │   Wiki    │ ──▶ │   Story   │ ──▶ │  Formats  │
   │ immutable │     │ agent-run │     │ the asset │     │  the ask  │
   └───────────┘     └───────────┘     └───────────┘     └───────────┘
     /ingest           /wiki             /craft-content    /draft-video
     /meeting          /lint                               /draft-carousel
                                                           /draft-article
                                                           /draft-diagram
                                                                 │
                                                                 ▼
                                                        ┌────────────────┐
                                                        │  ElevenLabs    │  voice
                                                        │  HeyGen        │  digital twin
                                                        │  Google Imagen │  images
                                                        │  Remotion      │  render
                                                        └────────────────┘
                                                          amplify studio render
                                                                 │
                                                                 ▼
                                                            published
                                                                 │
                              engagement signals ◀───────────────┘
                              feed the next suggestion
```

The loop closes. Ingesting and publishing both emit signals, `suggest_content` returns
those signals alongside its ranking so the agent can see what you already shipped, and
the wiki gets thicker every time you ingest. That is the flywheel: each turn is cheaper
than the last because the synthesis is already done.

Ranking itself is mechanical and does not read signals — undrafted first, then source
count, then most recently updated. A page counts as drafted when some file in a story
folder links to it as `[[Page Title]]`.

## The second brain

Amplify runs [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
Three layers, and the folder tree answers exactly one question: **may the agent rewrite this?**

| Layer | Folder | Ownership |
|---|---|---|
| Raw sources | `Sources/` | Immutable. Read and cited, never rewritten. |
| The wiki | `Wiki/` | Agent-owned. Created, rewritten, kept current. |
| The schema | `CLAUDE.md` | The contract both layers follow. |

`/ingest` saves a source to `Sources/` untouched, distills a page into `Wiki/Summaries/`,
then updates every concept and entity page it touches plus `index.md` and `log.md`. One
source touching 10-15 pages is normal. That bookkeeping is the part people abandon and
the part an agent does without getting bored.

This matters for content because a wiki page is already the hard part of a draft. It has
a claim, sources behind it, and links to everything related. `suggest_content` ranks
pages by how well-sourced and how undrafted they are, which is a better answer to "what
should I post" than staring at a blank editor.

## The digital twin

`amplify studio render` assembles a finished video from a timeline in your vault:

- **ElevenLabs** for voice. Your cloned voice reads the script.
- **HeyGen** for the avatar. A persistent face and voice identity, built once with
  `/heygen-avatar`, reused in every video through the v3 pipeline.
- **Google Imagen** for generated stills, via `/draft-images`.
- **Remotion** for assembly. React components, real compositing, branded `.mp4` out.

`/draft-video` builds the shot-by-shot timeline and opens a storyboard for inline editing
before a single API call is spent. Approval is a gate, not an afterthought.

## Install

```bash
git clone https://github.com/allthriveai/amplify.git
cd amplify
npm install
npm run build
npm link            # puts `amplify` on your PATH
```

Then point it at your vault:

```bash
amplify init ~/path/to/your/obsidian-vault
```

That scaffolds the folders, copies the wiki schema into your vault's `CLAUDE.md`, and
writes an `.amplifyrc` **inside the vault**. Config lives with your notes, not in this
repo. Copy `.amplifyrc.example` if you would rather write it by hand.

API keys go in `.env` (see `.env.example`). Everything except `/ingest`, `/wiki`, and
`/lint` is optional — the second brain works with no keys at all.

## Commands

```bash
amplify init [path]                  Connect Amplify to an Obsidian vault
amplify studio list                  List director cuts across stories
amplify studio render <slug>         Render a story's timeline to video
amplify studio preview               Open the Remotion preview
amplify storyboard <slug>            Visual storyboard editor
amplify listen <note>                Narrate a wiki page with ElevenLabs
amplify obs <cmd>                    Screen capture through OBS
amplify import-sparks --from <path>  Import content from a sparks manifest
```

## Skills

Claude Code skills in `.claude/skills/`. All of them read `.amplifyrc` and write to your
vault.

**Second brain**
- `/ingest` — Save a URL, PDF, or article immutably, distill a wiki page, update every entity and concept it touches.
- `/meeting` — Turn a Plaud transcript or pasted notes into decisions, action items, and attendees. Then offer to ingest it.
- `/wiki` — Answer a question from the wiki, with `[[wikilink]]` citations.
- `/lint` — Orphans, broken links, contradictions, stale claims, index drift.
- `/add-inspiration` — Research someone you admire and link them into the wiki.

**Story**
- `/craft-content` — Find the story in the material and shape it into a clean narrative draft. The story is the asset; everything below remixes it.

**Formats**
- `/draft-video` — Shot-by-shot timeline plus a storyboard for approval, then HeyGen clips and Remotion assembly.
- `/draft-carousel` — LinkedIn carousel, card by card, with image direction.
- `/draft-article` — Long-form post from the narrative arc.
- `/draft-diagram` — Interactive React Flow diagram, standalone HTML plus a PNG.
- `/draft-images` — Google Imagen stills for any of the above, wired back into the source files.

**Publish**
- `/linkedin-post` · `/youtube-description` · `/youtube-short` · `/youtube-upload`
- `/listen` — ElevenLabs narration of a wiki page.
- `/humanizer` — Strip AI vocabulary, filler, em dash overuse, and structural tells.

**Identity**
- `/voice` — Who you are and how you sound. Read by everything that writes.
- `/brand` — Colors, type, visual style. Read by everything that renders.
- `/heygen-avatar` · `/heygen-video` — Build the digital twin, then use it.

## MCP server

```bash
npm run serve
```

Five tools: `ingest_source`, `suggest_content`, `record_signal`, `remember`, `recall`.
Claude Desktop config and per-tool detail are in [docs/mcp.md](docs/mcp.md).

## Your data is yours

This repo holds code and templates. It holds no notes, no sources, no stories, and no
keys.

- The vault path lives in `.amplifyrc`, which is written into your vault and gitignored here.
- `npm run check:personal` scans tracked and untracked files for anything personal, and a
  pre-commit hook in `.githooks/` blocks a commit on a hit.
- Docs and skill examples use invented data. Never paste a real note, name, or vault path
  into one.

## Docs

- [Vault](docs/vault.md) — structure, the three layers, Voice.md
- [Signals](docs/signals.md) — the event log that closes the loop
- [Memory](docs/memory.md) — session history and preferences
- [MCP Server](docs/mcp.md) — tools and Claude Desktop setup
- [Studio](docs/studio.md) — video pipeline, API setup, Remotion
- [OBS Capture](docs/obs.md) — screen and camera recording

## License

MIT
