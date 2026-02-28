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
Lumis/Amplify/Structures
Lumis/Amplify/Triggers
Lumis/Scripts
Lumis/Studio/Outputs
Lumis/Signals
Lumis/Memory/sessions
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
    "amplifyStructures": "Lumis/Amplify/Structures",
    "amplifyTriggers": "Lumis/Amplify/Triggers",
    "amplifyHooks": "Lumis/Amplify",
    "amplifyPrompts": "Lumis/Amplify",
    "scripts": "Lumis/Scripts",
    "studioOutputs": "Lumis/Studio/Outputs",
    "strategyDocs": "2 - Areas/All Thrive",
    "voice": "Lumis/Voice.md",
    "signals": "Lumis/Signals",
    "memory": "Lumis/Memory"
  },
  "researchCategories": [
    {"name": "AI & Agents", "folder": "AI & Agents", "keywords": ["ai", "agent", "llm", "mcp", "ml", "machine learning", "prompt engineering", "rag", "embedding", "transformer", "gpt", "claude", "neural"]},
    {"name": "Tools & Software", "folder": "Tools & Software", "keywords": ["tool", "software", "platform", "app", "framework", "library", "sdk", "api", "saas", "devops", "cli"]},
    {"name": "Books", "folder": "Books", "keywords": ["book", "book summary", "book review", "author", "chapter", "reading"]},
    {"name": "Articles", "folder": "Articles", "keywords": ["article", "blog", "opinion", "essay", "post", "newsletter"]},
    {"name": "Courses & Learning", "folder": "Courses & Learning", "keywords": ["course", "tutorial", "workshop", "training", "certification", "lesson", "curriculum", "mooc"]}
  ]
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

### Step 7: Report

Give a summary:

```
Lumis initialized in {vaultPath}

Directories: {count} created
Config: .lumisrc written
Voice: {filled}/5 sections filled

You're ready. Try /moment to capture your first moment.
```

If any voice sections were skipped, add: "Run /voice anytime to fill in the rest."
