---
name: init
description: Interactively sets up Amplify in an Obsidian vault. Asks for the vault path, scaffolds all directories, writes .amplifyrc, then walks through the voice interview to populate Voice.md. Use when the user runs /init, wants to set up Amplify, or is starting fresh.
---

# Initialize Amplify

## Instructions

When the user runs `/init`, optionally followed by a vault path:

### Step 1: Determine Vault Path

If the user provided a path (e.g. `/init ~/my-vault`), use it.

If not, use AskUserQuestion to ask:

"Where's your Obsidian vault? Give me the path."

Options:
- Current directory (`{cwd}`)
- Home folder vault (`~/obsidian-vault`)
- Other (let them type a path)

Resolve the path to an absolute path. Check if it's an existing Obsidian vault (has `.obsidian/` folder) or a new location.

### Step 2: Scaffold Directories

The tree encodes ownership. Four buckets, each answering "may the agent rewrite this?"

Create these with `mkdir -p`:

```
Sources/Clippings          ← raw, immutable. read it, never rewrite it.
Sources/Meetings
Sources/Audio
Sources/assets

Wiki/Summaries             ← agent-owned. rewritten and kept current.
Wiki/Concepts
Wiki/Entities
Wiki/Synthesis

Work/Stories               ← projects and pipeline output
Work/Strategy

Amplify/Hooks        ← system files
Amplify/Structures
Amplify/Signals
Amplify/Memory/sessions
Amplify/Brand
Amplify/Brand/Inspiration
```

Add a `README.md` with `# {folder-name}\n` to each directory that doesn't have one —
**except the `Wiki/` subfolders.** The wiki navigates itself through `index.md`, and a
hand-maintained hub sitting next to a generated index is exactly what goes stale and
starts lying about what the folder holds.

Instead, seed the wiki's two special files:

`Wiki/index.md`:
```markdown
# Index

Every page in the wiki, one line each. Read this first when answering anything.

## Summaries

## Concepts

## Entities

## Synthesis
```

`Wiki/log.md`:
```markdown
# Log

Append-only. Newest entries at the bottom. Never edit an entry already written.
```

### Step 2b: Copy the schema

Copy `templates/vault/CLAUDE.md` from the Amplify repo to `{vaultPath}/CLAUDE.md`.

This is the most important file in the vault. It defines the three layers, the single
frontmatter schema, the page shapes, the ingest and query and lint workflows, and the
orphan rule. Without it an agent with vault access is a chatbot; with it, the wiki
maintains itself.

Don't overwrite an existing `CLAUDE.md` — if one is there, show the user the template
and ask whether to merge.

### Step 3: Write .amplifyrc

If `.amplifyrc` doesn't already exist in the vault root, write it:

```json
{
  "vaultPath": "{absolute vault path}",
  "paths": {
    "sources": "Sources",
    "wiki": "Wiki",
    "meetings": "Sources/Meetings",
    "audio": "Sources/Audio",
    "stories": "Work/Stories",
    "strategyDocs": "Work/Strategy",
    "people": "Wiki/Entities",
    "voice": "Amplify/Voice.md",
    "amplifyHooks": "Amplify/Hooks",
    "amplifyStructures": "Amplify/Structures",
    "amplifyPersuasion": "Amplify",
    "signals": "Amplify/Signals",
    "memory": "Amplify/Memory",
    "brand": "Amplify/Brand"
  },
  "studio": {
    "heygenApiKey": "",
    "heygenAvatarId": "",
    "heygenVoiceId": "",
    "elevenlabsApiKey": "",
    "elevenlabsVoiceId": ""
  }
}
```

Note there are no research categories. Keyword-matching sources into folders sounds
tidy and doesn't survive contact with a real vault — most sources match nothing and
pile up at the root. Tags in frontmatter and `Wiki/index.md` do that job instead.

If `.amplifyrc` already exists, read it and confirm the vault path matches. If it doesn't match, ask the user which to keep.

### Step 4: Write preferences.md

If `Amplify/Memory/preferences.md` doesn't exist, write:

```markdown
# Preferences

## Content Style

## Coaching

## Topics
```

### Step 5: Voice Interview

Now walk through the voice interview. Ask these five questions **one at a time** using AskUserQuestion or natural conversation. Wait for each answer before asking the next.

Introduce it:

"Let's set up your voice. This shapes everything Amplify writes for you. Skip any question by saying 'skip'."

**Question 1: Who I am**
"What's your name, what do you do, and what's your background?"

**Question 2: My mission**
"What are you trying to accomplish? What change do you want to make?"

**Question 3: My audience**
"Who are you talking to? What do they need?"

**Question 4: What I believe**
"What are your core beliefs? What makes your perspective different?"

**Question 5: How I talk**
"How do you talk? Direct? Warm? Technical? Casual? What words do you use or avoid?"

For each question:
- If the user gives a real answer, use it.
- If the user says "skip" or gives no answer, use the placeholder for that section.

**Placeholders for skipped sections:**

| Section | Placeholder |
|---------|-------------|
| Who I am | `[Your name, what you do, your background. Write in first person.]` |
| My mission | `[What you're trying to accomplish. The change you want to make in the world.]` |
| My audience | `[Who you're talking to. What they need. What keeps them up at night.]` |
| What I believe | `[Your core beliefs. The hills you'll die on. What makes your perspective different.]` |
| How I talk | `[Your voice: direct? warm? technical? casual? Funny? Serious? What words do you use? What do you never say?]` |

### Step 6: Write Voice.md

Build and write `{vaultPath}/Amplify/Voice.md`:

```markdown
# Voice

## Who I am
{answer or placeholder}

## My mission
{answer or placeholder}

## My audience
{answer or placeholder}

## What I believe
{answer or placeholder}

## How I talk
{answer or placeholder}
```

Preserve the user's words exactly. Clean up grammar only if needed. Don't rewrite their personality. Run a humanizer pass only on any prose *you* added, not their words.

### Step 7: Amplify Toolkit

After Voice.md is written, copy the generic Amplify templates from the Amplify repo into the vault and personalize them using the user's voice.

**7a. Copy templates**

Copy all files from the Amplify source templates into the vault's Amplify directories:

```
Source: {amplifyRepoRoot}/templates/amplify/
Destination: {vaultPath}/Amplify/

Copy:
- Hooks/*.md → {vaultPath}/Amplify/Hooks/
- Structures/*.md → {vaultPath}/Amplify/Structures/
- Persuasion-Glossary.md → {vaultPath}/Amplify/Persuasion-Glossary.md
```

The `amplifyRepoRoot` is the directory where Amplify source code lives (the repo containing this skill file). Resolve it from the skill's own location: `{skillDir}/../../..` which gives the Amplify project root.

Use `cp` to copy each file. Don't overwrite files that already exist in the vault (use `cp -n`).

**7b. Personalize with Voice.md**

Read the Voice.md you just wrote. Extract these values:

| Bracket | Source |
|---------|--------|
| `[target audience]` | "My audience" section: the people they're talking to |
| `[desired result]` / `[achieve specific result]` | "My mission" section: what they're trying to accomplish |
| `[niche]` | "Who I am" section: their field or domain |
| `[old method]` / `[outdated method]` | Infer from beliefs/mission: the thing they're replacing |
| `[negative feeling]` | Common pain point for their audience (infer from context) |
| `[positive feeling]` | The opposite: what success feels like |
| `[method]` | Their named framework or approach, if mentioned |

Do a find-and-replace across all copied Amplify files in the vault:
- All files in `Hooks/`
- All files in `Structures/`
- `Persuasion-Glossary.md`

Replace every `[bracket]` placeholder with the user's real context. This is automatic, not interactive. If a Voice.md section was skipped (contains a placeholder), leave those brackets unfilled.

Only replace brackets that appear in the template files. Don't modify frontmatter, headers, or structural content.

**7c. Count results**

Count the total number of Amplify files copied and personalized. Store this for the Report step.

### Step 8: Brand Setup (optional)

Ask if they want to set up their brand:

"Want to set up your brand? This gives your videos, carousels, and articles a consistent visual identity."

Options:
- Set up now
- Skip for now

If they choose to set up, run the brand interview inline (same as `/brand` Setup Mode Steps 1-4). This writes the `.amplifyrc` brand section and Brand.md.

If they skip, move on. They can run `/brand` later.

### Step 9: Studio Setup (optional)

Ask if they want to set up video production:

"Want to set up video production? This lets Amplify produce branded videos with an AI avatar from your stories. You'll need accounts with HeyGen and ElevenLabs. Skip if you're not ready."

Options:
- Set up now
- Skip for now

If they choose to set up, walk through four values **one at a time**:

**1. HeyGen API key**
"Paste your HeyGen API key. You can find it at https://app.heygen.com/settings under API."

**2. HeyGen Avatar ID**
"Paste your HeyGen Avatar ID. In HeyGen, go to Avatars, click on your avatar, and copy the avatar_id from the URL or API settings."

**3. HeyGen Voice ID**
"Paste your HeyGen Voice ID. In HeyGen, go to Voices to find your voice. If you cloned your voice via ElevenLabs and synced it to HeyGen, it will appear there with a HeyGen-specific voice ID."

If the user doesn't know their HeyGen voice ID, offer to look it up: use the HeyGen API (`GET https://api.heygen.com/v2/voices` with the API key) to list available voices and let them pick.

**5. ElevenLabs API key**
"Paste your ElevenLabs API key. Find it at https://elevenlabs.io/app/settings/api-keys."

**6. ElevenLabs Voice ID**
"Paste your ElevenLabs Voice ID. In ElevenLabs, go to Voices, click on your voice, and copy the Voice ID."

For each value:
- If the user provides a value, save it.
- If the user says "skip", leave it empty.
- Validate that keys look reasonable (non-empty strings, no whitespace).

After collecting, update the `studio` section in the `.amplifyrc` file with the provided values. If a `.amplifyrc` already exists, merge the `studio` key into it without overwriting other config.

If all four values were skipped, don't write the studio section.

### Step 10: Report

Give a summary:

```
Amplify initialized in {vaultPath}

Directories: {count} created
Config: .amplifyrc written
Voice: {filled}/5 sections filled
Amplify: {count} templates installed (8 hook types, 18 structures, persuasion glossary)
Brand: {configured|skipped}
Studio: {configured|skipped}

You're ready. Try /ingest on something you have read — the flywheel needs input before it can turn.
```

If any voice sections were skipped, add: "Run /voice anytime to fill in the rest."
If voice sections were filled, add: "Amplify templates personalized with your voice."
If brand was skipped, add: "Run /brand anytime to set up your visual identity."
If studio was skipped, add: "Run /init again to set up video production later."
