# The Vault

Lumis writes to an Obsidian vault configured in `.lumisrc`. The vault is NOT this repo. The vault path is resolved from:
1. `.lumisrc` in cwd
2. `VAULT_PATH` env var
3. Known fallback: `~/Sites/your-vault`

## Structure

All paths configurable in `.lumisrc`:

```
Lumis/
  Moments/           ← daily moment notes
  Stories/            ← developed stories (each in its own folder)
    {slug}/
      raw.md          ← free write + interview answers (from /craft-content)
      story.md        ← clean narrative draft (from /craft-content)
      timeline.md     ← Draft timeline (from /draft-video)
      carousel.md     ← carousel cards with copy and image direction (from /draft-carousel)
      article.md      ← long-form blog post (from /draft-article)
    Practice Log.md   ← storytelling practice history
  Research/           ← full research notes
    TL;DR/            ← companion summaries
    AI & Agents/      ← categorized by topic
    Tools & Software/
    Books/
    Articles/
    Courses & Learning/
  Amplify/            ← personalized content creation toolkit
    Hooks/            ← 8 hook types (contrarian, curiosity-gap, story-entry, etc.)
    Structures/       ← 18 content frameworks
    Persuasion-Glossary.md ← 10 persuasion principles
  Thinking/           ← challenge logs and promoted thinking notes
    Challenge Log.md  ← history of /challenge sessions
  Voice.md            ← who you are, your mission, audience, beliefs, and voice
  Pattern Map.canvas  ← visual connections between moments
  Signals/            ← structured event log (signals.json)
  Memory/             ← session history and preferences
    sessions/         ← daily session logs (YYYY-MM-DD.md)
    preferences.md    ← user preferences (markdown)
  Studio/
    Outputs/          ← finished branded videos
2 - Areas/
  Personal/
    People Who Inspire Me/ ← notes on people who inspire you (from /add-inspiration)
    Thinking/              ← promoted challenge notes (from /challenge)
  All Thrive/              ← strategy docs (content pillars, strategy, social plan)
```

## Private Moments

Moments can be marked private by adding `private: true` to their frontmatter (or using `/moment private ...`). Private moments:

- Still get full analysis: 5-second moment, themes, connections, story potential
- Still appear on the Pattern Map canvas and connect to other moments
- Are excluded from all content pipelines: `get_moments`, `get_patterns`, `social_coach`, `story_craft_practice`, `story_craft_develop`, `/craft-content`, and all `/draft-*` skills
- Stay in the vault and can always be found directly in Obsidian

This lets you journal deeply personal things with full pattern recognition without them ever surfacing as content candidates.

## Voice

`Lumis/Voice.md` is the identity file. It captures who you are, what you're trying to accomplish, who you're talking to, what you believe, and how you talk. The coaching and content layers read it:

- **Director video** uses Voice to shape script lines and match your speaking style.
- **Director carousel** uses Voice to match card copy to your tone.
- **Director article** uses Voice to write the full article in your style.
- **Craft content** uses Voice to shape how stories are written.
- **Amplify toolkit** is personalized with Voice during `/init`, replacing generic placeholders with your audience, mission, and niche.
- **Moments are never influenced by Voice.** Moments are pure life reflection, unfiltered by goals or strategy. Voice only matters when you decide to turn a moment into content.

`/init` scaffolds a Voice.md template and interviews you to fill it in. Run `/voice` anytime to redo it.

## Amplify Toolkit

`/init` copies generic templates from `templates/amplify/` in this repo into your vault at `Lumis/Amplify/`, then personalizes them using your Voice.md. The toolkit includes:

- **8 hook types**: contrarian, curiosity-gap, story-entry, credibility, empathy, shock-data, question, pattern-interrupt. Each has a principle, good/bad examples, and anti-patterns.
- **18 content structures**: frameworks with persuasion principles embedded (e.g., "I Used to Believe," "The Great Paradox," "The Vulnerable Admission").
- **Persuasion Glossary**: 10 persuasion principles for reference.

`/draft-video`, `/draft-carousel`, and `/draft-article` read these when building their outputs, selecting the right hook type and structure for each format.

## IP Separation

Code goes in this repo. Content goes in the vault. No purchased content, no personal moment data, no vault files in git. The `.gitignore` blocks `.lumisrc`, `.env`, PDFs, and the `creator-blueprint/` directory.
