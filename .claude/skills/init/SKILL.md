---
name: init
description: Interactively sets up Lumis in an Obsidian vault. Asks for the vault path, scaffolds all directories, writes .lumisrc, then walks through the voice interview to populate Voice.md. Use when the user runs /init, wants to set up Lumis, or is starting fresh.
---

# Initialize Lumis

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

Create all Lumis directories inside the vault. Use `mkdir -p` for each:

```
Lumis/Moments
Lumis/Stories
Lumis/Research
Lumis/Research/TL;DR
Lumis/Research/AI & Agents
Lumis/Research/Tools & Software
Lumis/Research/Books
Lumis/Research/Articles
Lumis/Research/Courses & Learning
Lumis/Learnings
Lumis/Amplify/Hooks
Lumis/Amplify/Structures
Lumis/Signals
Lumis/Memory/sessions
Lumis/Thinking
2 - Areas/Personal/People Who Inspire Me
2 - Areas/Personal/Thinking
```

Add a `README.md` with `# {folder-name}\n` in each directory that doesn't already have one.

### Step 3: Write .lumisrc

If `.lumisrc` doesn't already exist in the vault root, write it:

```json
{
  "vaultPath": "{absolute vault path}",
  "paths": {
    "moments": "Lumis/Moments",
    "stories": "Lumis/Stories",
    "canvas": "Lumis/Pattern Map.canvas",
    "dailyNotes": "Daily Notes",
    "dailyNoteFormat": "YYYY-MM-DD",
    "research": "Lumis/Research",
    "researchTldr": "Lumis/Research/TL;DR",
    "learnings": "Lumis/Learnings",
    "amplifyHooks": "Lumis/Amplify/Hooks",
    "amplifyStructures": "Lumis/Amplify/Structures",
    "amplifyPersuasion": "Lumis/Amplify",
    "strategyDocs": "2 - Areas/All Thrive",
    "voice": "Lumis/Voice.md",
    "signals": "Lumis/Signals",
    "memory": "Lumis/Memory",
    "people": "2 - Areas/Personal/People Who Inspire Me",
    "thinking": "2 - Areas/Personal/Thinking"
  },
  "researchCategories": [
    {"name": "AI & Agents", "folder": "AI & Agents", "keywords": ["ai", "agent", "llm", "mcp", "ml", "machine learning", "prompt engineering", "rag", "embedding", "transformer", "gpt", "claude", "neural"]},
    {"name": "Tools & Software", "folder": "Tools & Software", "keywords": ["tool", "software", "platform", "app", "framework", "library", "sdk", "api", "saas", "devops", "cli"]},
    {"name": "Books", "folder": "Books", "keywords": ["book", "book summary", "book review", "author", "chapter", "reading"]},
    {"name": "Articles", "folder": "Articles", "keywords": ["article", "blog", "opinion", "essay", "post", "newsletter"]},
    {"name": "Courses & Learning", "folder": "Courses & Learning", "keywords": ["course", "tutorial", "workshop", "training", "certification", "lesson", "curriculum", "mooc"]}
  ],
  "studio": {
    "heygenApiKey": "",
    "heygenAvatarId": "",
    "heygenVoiceId": "",
    "elevenlabsApiKey": "",
    "elevenlabsVoiceId": ""
  }
}
```

If `.lumisrc` already exists, read it and confirm the vault path matches. If it doesn't match, ask the user which to keep.

### Step 4: Write preferences.md

If `Lumis/Memory/preferences.md` doesn't exist, write:

```markdown
# Preferences

## Content Style

## Coaching

## Topics
```

### Step 5: Voice Interview

Now walk through the voice interview. Ask these five questions **one at a time** using AskUserQuestion or natural conversation. Wait for each answer before asking the next.

Introduce it:

"Let's set up your voice. This shapes everything Lumis writes for you. Skip any question by saying 'skip'."

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

Build and write `{vaultPath}/Lumis/Voice.md`:

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

After Voice.md is written, copy the generic Amplify templates from the Lumis repo into the vault and personalize them using the user's voice.

**7a. Copy templates**

Copy all files from the Lumis source templates into the vault's Amplify directories:

```
Source: {lumisRepoRoot}/templates/amplify/
Destination: {vaultPath}/Lumis/Amplify/

Copy:
- Hooks/*.md → {vaultPath}/Lumis/Amplify/Hooks/
- Structures/*.md → {vaultPath}/Lumis/Amplify/Structures/
- Persuasion-Glossary.md → {vaultPath}/Lumis/Amplify/Persuasion-Glossary.md
```

The `lumisRepoRoot` is the directory where Lumis source code lives (the repo containing this skill file). Resolve it from the skill's own location: `{skillDir}/../../..` which gives the Lumis project root.

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

If they choose to set up, run the brand interview inline (same as `/brand` Setup Mode Steps 1-4). This writes the `.lumisrc` brand section and Brand.md.

If they skip, move on. They can run `/brand` later.

### Step 9: Studio Setup (optional)

Ask if they want to set up video production:

"Want to set up video production? This lets Lumis produce branded videos with an AI avatar from your stories. You'll need accounts with HeyGen and ElevenLabs. Skip if you're not ready."

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

After collecting, update the `studio` section in the `.lumisrc` file with the provided values. If a `.lumisrc` already exists, merge the `studio` key into it without overwriting other config.

If all four values were skipped, don't write the studio section.

### Step 10: Report

Give a summary:

```
Lumis initialized in {vaultPath}

Directories: {count} created
Config: .lumisrc written
Voice: {filled}/5 sections filled
Amplify: {count} templates installed (8 hook types, 18 structures, persuasion glossary)
Brand: {configured|skipped}
Studio: {configured|skipped}

You're ready. Try /moment to capture your first moment.
```

If any voice sections were skipped, add: "Run /voice anytime to fill in the rest."
If voice sections were filled, add: "Amplify templates personalized with your voice."
If brand was skipped, add: "Run /brand anytime to set up your visual identity."
If studio was skipped, add: "Run /init again to set up video production later."
