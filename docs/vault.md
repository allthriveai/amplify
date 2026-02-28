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
  Stories/            ← developed stories
  Learnings/          ← insights extracted from research
  Research/           ← full research notes
    TL;DR/            ← companion summaries
    AI & Agents/      ← categorized by topic
  Amplify/            ← content creation tools
    Structures/       ← content frameworks
    Triggers/         ← persuasion patterns
    Hooks.md          ← scroll-stopping openers
    Prompts.md        ← content idea generators
  Voice.md            ← who you are, your mission, audience, beliefs, and voice
  Pattern Map.canvas  ← visual connections between moments
  Signals/            ← structured event log (signals.json)
  Memory/             ← session history and preferences
    sessions/         ← daily session logs (YYYY-MM-DD.md)
    preferences.md    ← user preferences (markdown)
  Scripts/            ← platform-specific content drafts
  Studio/
    Outputs/          ← finished branded videos
```

## Voice

`Lumis/Voice.md` is the identity file. It captures who you are, what you're trying to accomplish, who you're talking to, what you believe, and how you talk. The coaching and production layers read it:

- **Social coach** uses Voice to align recommendations with your identity and audience.
- **Produce** uses Voice to shape on-screen text and branding.
- **Moments are never influenced by Voice.** Moments are pure life reflection, unfiltered by goals or strategy. Voice only matters when you decide to turn a moment into content.

`lumis init` scaffolds a Voice.md template. Fill it in. It shapes everything Lumis does after capture.

## IP Separation

Code goes in this repo. Content goes in the vault. No purchased content, no personal moment data, no vault files in git. The `.gitignore` blocks `.lumisrc`, `.env`, PDFs, and the `creator-blueprint/` directory.
