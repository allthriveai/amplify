---
name: moment
description: Captures a Homework for Life moment. Use when the user runs /moment followed by a description of something that happened — a sentence, a paragraph, stream of consciousness. Creates a structured moment note, identifies the 5-second moment, finds connections to past moments, and regenerates the Pattern Map canvas.
---

# Capture a Moment (Homework for Life)

## Instructions

When the user runs `/moment` followed by their raw input (a sentence, a ramble, whatever):

### Step 0: Load Configuration

Find the `.lumisrc` config file to resolve the vault path and moments directory. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable
3. `.lumisrc` at the fallback vault path (if configured in CLAUDE.md or known from previous sessions)

Read the config and extract:

```
vaultPath             → absolute path to the Obsidian vault
paths.moments         → moments folder relative to vault root (default: "Lumis/Moments")
paths.canvas          → Pattern Map canvas path relative to vault root (default: "Lumis/Pattern Map.canvas")
paths.dailyNotes      → daily notes folder relative to vault root (default: "Daily Notes")
paths.dailyNoteFormat → date format for daily note filenames (default: "YYYY-MM-DD")
```

All moment files are read from and written to `{vaultPath}/{paths.moments}/`.

### Step 1: Read Existing Moments

Read all files in `{vaultPath}/{paths.moments}/` to understand the user's existing moment bank. Extract from each:
- Filename, date, themes, people, places, moment-type, story-potential
- Any wiki-links to other moments (in the `## Connections` section)

If there are many files, read them in parallel batches.

### Step 1b: Read Existing Learnings

Read all files in `{vaultPath}/{paths.learnings}/` (excluding README.md). Extract from each:
- Filename, title, topic tags, pillar, and the core insight (first paragraph after the `# Title` heading)

These will be used in Step 3 to cross-reference with the moment's themes.

### Step 2: Analyze the Raw Input

From the user's raw input, identify:
- **The core moment** — what actually happened, distilled to its essence
- **The 5-second moment** — the point of shift, realization, decision, or transformation (per Matthew Dicks' framework)
- **People** mentioned or implied
- **Places** mentioned or implied
- **Moment type** — one of: `realization`, `decision`, `transformation`, `loss`, `connection`, `conflict`, `joy`, `fear`, `vulnerability`, `gratitude`
- **Themes** — broad life themes like `identity`, `parenthood`, `mortality`, `ambition`, `love`, `friendship`, `work`, `creativity`, `loss`, `growth`, `vulnerability`, `family`, `independence`, `belonging`
- **Story potential** — `high`, `medium`, or `low` based on: Is there a clear arc? Contrast? A universal truth? Something surprising?
- **A short descriptive title** — evocative, not generic (e.g., "The question I couldn't answer" not "Conversation with daughter")

### Step 3: Find Connections to Past Moments

Compare the new moment against all existing moments. Look for:
- **Shared themes** — moments exploring the same life territory
- **Shared people** — moments involving the same person
- **Emotional echoes** — moments that feel like they rhyme with this one
- **Opposites** — moments that show the other side of a coin (these are great for story structure)
- **Progressions** — moments that show change over time on the same topic

Select the 2-5 most meaningful connections. For each, write a brief note on WHY they connect (not just that they share a tag).

**Cross-reference with learnings:** Also compare the moment's themes against the topic tags from learnings (loaded in Step 1b). If any of the moment's themes overlap with learning topic tags, note these connections for the Step 8 report. Do NOT add learning connections to the moment note's `## Connections` section (that stays moment-to-moment). Learning connections go in the Step 8 report only, as a content signal.

### Step 4: Create the Moment Note

Create a file at `{vaultPath}/{paths.moments}/YYYY-MM-DD - Short description.md` where the date is today and the short description matches the title from Step 2.

Use this format:

```markdown
---
date: YYYY-MM-DD
moment-type: [type from step 2]
people: [list]
places: [list]
story-status: captured
story-potential: [high/medium/low]
themes: [list]
tags: [moment, moment/[type]]
---

# [Evocative title]

[The moment, written clearly but preserving the user's voice. Clean up rambling but keep their language and feeling. 2-5 sentences.]

## The 5-Second Moment
[The specific instant of shift/change/realization. 1-3 sentences. Be precise about what changed internally.]

## Connections
[For each connected past moment:]
- [[YYYY-MM-DD - Title of past moment]] — [why this connects: shared theme, emotional echo, progression, opposite, etc.]

## Story Potential
[Rating]. [1-2 sentences on what makes this storyworthy or how it could be crafted. Include a "start at the opposite" suggestion if story potential is medium or high.]
```

If the date already has a moment file, append a letter: `YYYY-MM-DD-b - Title.md`

### Step 4b: Add Wiki-Links to Key Words

Before saving, scan the prose sections (moment description, 5-second moment, connections, story potential) and wrap important or repeating words/phrases in `[[ ]]` to create Obsidian wiki-links. This builds the graph over time.

**What to wiki-link:**
- **People** — names of anyone mentioned (e.g., `[[Mom]]`, `[[Sarah]]`, `[[Dr. Kim]]`)
- **Places** — specific locations (e.g., `[[Portland]]`, `[[the kitchen]]`, `[[Greenwood Elementary]]`)
- **Recurring concepts** — words or phrases that show up across multiple moments or that the user returns to often. Check existing moments for patterns. (e.g., `[[control]]`, `[[storytelling]]`, `[[walking]]`, `[[ritual]]`)
- **Emotionally charged words** — if a word carries weight in this moment AND has appeared before, link it (e.g., `[[home]]`, `[[silence]]`, `[[permission]]`)

**What NOT to wiki-link:**
- Generic words that don't carry meaning across moments (e.g., "today", "thing", "really")
- Words that only matter in this sentence, not as a recurring concept
- The same word more than once per section — link it on first meaningful use only
- Frontmatter values — those are already structured as metadata

**Taste matters here.** A moment with 2-6 wiki-links feels connected. A moment with 15 feels like a Wikipedia article. Less is more — only link words that would actually be useful to find later or that genuinely connect to other moments.

### Step 5: Humanize the Writing

Before saving, run a humanizer pass on all prose you wrote in the note (the moment description, 5-second moment, connections, and story potential sections). Apply the patterns from the `humanizer` skill — specifically:

- **No AI vocabulary**: Remove words like "pivotal", "tapestry", "delve", "underscore", "landscape", "foster", "enhance", "showcase", "crucial", "vibrant", "profound", "interplay", "intricate"
- **No significance inflation**: Don't puff up importance ("stands as a testament", "marking a key moment", "reflects broader themes")
- **No superficial -ing phrases**: Cut "highlighting", "underscoring", "symbolizing", "emphasizing", "showcasing"
- **No negative parallelisms**: Avoid "It's not just X; it's Y" or "Not only...but..."
- **No rule-of-three**: Don't force ideas into groups of three
- **No em dash overuse**: Use commas or periods instead
- **No promotional tone**: Write plainly, not like a brochure
- **No generic positive conclusions**: Be specific, not "the future looks bright"
- **No sycophantic language**: No "Great question!", "Absolutely!", or "I hope this helps"
- **No filler phrases**: Cut "In order to", "It is important to note that", "At its core"
- **Preserve the user's actual words and voice** — the humanizer pass is for YOUR writing, not theirs
- **Add soul**: Vary sentence length. Have opinions where appropriate. Be specific about feelings rather than vague.

If you catch yourself writing something that sounds assembled rather than said, rewrite it.

### Step 6: Regenerate the Pattern Map Canvas

Read all moment files in `{vaultPath}/{paths.moments}/` (including the one just created).

Build the canvas JSON for `{vaultPath}/{paths.canvas}`:

**Theme color mapping** (use consistently):
| Theme | Color |
|-------|-------|
| identity, growth | `"1"` (red) |
| family, parenthood | `"2"` (orange) |
| love, connection, friendship, belonging | `"3"` (yellow) |
| work, ambition, creativity | `"4"` (green) |
| loss, mortality, vulnerability, fear | `"5"` (purple) |
| joy, gratitude, independence | `"6"` (cyan) |

**Layout approach:**
1. Determine all unique themes across all moments
2. Assign each theme a position in a circle (spread evenly, radius ~800px from center)
3. For each theme, create a **group node** at that position (width 400, height based on moment count)
4. For each moment, determine its **primary theme** (first theme in its frontmatter list)
5. Position the moment as a **file node** within/near its primary theme group
6. Space moments within a theme vertically (each ~120px apart)
7. Create **edges** between moments that wiki-link to each other (check `## Connections` sections for `[[...]]` links)

**Canvas JSON structure:**
```json
{
  "nodes": [
    {
      "id": "group-[theme]",
      "type": "group",
      "x": [calculated],
      "y": [calculated],
      "width": 400,
      "height": [calculated],
      "color": "[1-6]",
      "label": "[Theme Name]"
    },
    {
      "id": "moment-[filename-slug]",
      "type": "file",
      "file": "[paths.moments]/[filename].md",
      "x": [within group],
      "y": [within group],
      "width": 360,
      "height": 80,
      "color": "[same as group]"
    }
  ],
  "edges": [
    {
      "id": "edge-[from]-[to]",
      "fromNode": "moment-[slug]",
      "toNode": "moment-[slug]",
      "fromSide": "right",
      "toSide": "left"
    }
  ]
}
```

Write the canvas file to `{vaultPath}/{paths.canvas}`.

### Step 7: Update Today's Daily Note (if it exists)

Check if today's daily note exists at `{vaultPath}/{paths.dailyNotes}/{today's date in dailyNoteFormat}.md`.

If it exists and has a `### Homework for Life` section, append a one-line summary:
```
- [[{paths.moments}/YYYY-MM-DD - Title]] — [one-sentence summary]
```

If the daily note doesn't exist or doesn't have the section, skip this step silently.

### Step 8: Report to the User

Give a concise summary:

```
**Moment captured**: [title]
**5-second moment**: [one line]
**Themes**: [list]
**Story potential**: [rating]
**Connections found**: [count] — [brief list of what connected and why]
**Pattern Map**: Updated with [total moment count] moments across [theme count] themes

Saved to: [[{paths.moments}/YYYY-MM-DD - Title]]
```

If this is one of the user's first few moments, add encouragement about the practice. If connections are particularly rich, highlight that. If story potential is high, suggest they might want to develop it into a full story later using the Story template.

**Learning connections:** If any learnings overlapped with this moment's themes (from Step 3), include a section in the report:
```
**Learning connections**: This moment connects to [N] learnings about [topic tag(s)] ([pillar name] pillar). Your lived experience is backing up what you're reading.
```
List the connected learnings by title with a one-line note on how the moment and learning relate. This is a content signal: when personal experience and professional insight align, there's a post or video in the intersection.

### Step 8b: Log to Session Memory

Append an entry to today's session log at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — moment_captured: Captured "[title]" ([storyPotential] potential, themes: [theme list])
```

If the file doesn't exist, create it with a `# Session: YYYY-MM-DD` header first.

### Step 8c: Emit Signal

Write a `moment_captured` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "moment_captured",
  "timestamp": "[ISO timestamp]",
  "data": {
    "filename": "[moment filename]",
    "themes": ["[theme1]", "[theme2]"],
    "storyPotential": "[high/medium/low]",
    "momentType": "[type]",
    "fiveSecondMoment": "[the 5-second moment text]"
  }
}
```

If `signals.json` doesn't exist, create it with `{"version": 1, "signals": []}`. Prune signals older than 90 days on every write.

Note: If using the programmatic pipeline (`captureMoment()` function), Steps 8b and 8c are handled automatically by the pipeline code. Only perform these steps manually when using the skill directly (reading/writing files without the pipeline).
