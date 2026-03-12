---
description: Visual storyboard for pre-production. Opens an editable HTML board from a director timeline so you can see, hear, and rearrange the video before producing anything.
---

# /storyboard

Generate a visual, editable storyboard from a director-video timeline. The storyboard is a self-contained HTML file that lets you see the whole video at a glance, edit scripts and timing inline, drag shots to reorder, preview audio, and export updated YAML when you're happy.

**Purpose:** Lock the creative vision before spending hours on production. Iterate in minutes, not hours.

## When to use

- After `/director-video` creates a timeline and before producing
- When reworking an existing timeline (hook isn't landing, pacing feels off)
- When you want to hear the full script read aloud before recording anything

## Steps

### 1. Find the timeline

If the user provides a story slug or timeline path, use that. Otherwise:

```
Read .lumisrc to get vaultPath and paths.stories
List stories/ subdirectories
Look for video-*.md files
Ask the user which timeline to storyboard
```

### 2. Read the timeline

```
Read the video-*.md file
Parse YAML frontmatter (gray-matter) to get TimelineFrontmatter
Extract the markdown content below frontmatter as director's notes
```

### 3. Generate the storyboard HTML

Use the `generateStoryboardHtml` function from `src/studio/storyboard.ts`:

```typescript
import { generateStoryboardHtml } from "../../src/studio/storyboard.js";

const html = generateStoryboardHtml({
  timeline: frontmatter,       // TimelineFrontmatter with shots array
  directorsNotes: content,     // Markdown below the frontmatter
  timelinePath: timelineFile,  // Path to the .md file
  assetsDir: assetsPath,       // Optional: path to story assets
});
```

### 4. Save and open

Save the HTML file next to the timeline:
```
{stories}/{slug}/storyboard-{slug}.html
```

Open it in the browser:
```bash
open {stories}/{slug}/storyboard-{slug}.html
```

### 5. Tell the user what they can do

Report back with:
- File path
- Number of shots, total duration
- Quick reference:
  - **Edit anything**: click any text (script, beat, duration, direction) to edit inline
  - **Reorder**: drag cards to rearrange shots
  - **Preview audio**: click play on any shot to hear it, or "Play All" to hear the full script
  - **Add/delete**: use + to add shots, X to remove
  - **Export**: click "Copy YAML" or Cmd+S to copy the updated shots to clipboard
  - **Paste back**: paste the YAML into the timeline .md file to update it

## Features

The generated HTML storyboard includes:

- **Card grid**: one card per shot showing beat, type, duration, script/direction, asset reference
- **Timeline bar**: proportional colored bar showing video pacing at a glance
- **Inline editing**: contenteditable on all text fields (script, beat, duration, direction, notes)
- **Drag-and-drop**: reorder shots by dragging cards
- **Audio preview**: browser speech synthesis reads script lines (Play button per shot, Play All for full read-through)
- **Add/delete shots**: add new avatar shots, delete any shot
- **Dirty indicator**: gold dot appears when you've made changes
- **YAML export**: copies updated shots array to clipboard (Cmd+S or button)
- **Director's notes**: editable section below the board
- **Responsive**: works on smaller screens

## Color coding

| Shot type | Color | Icon |
|-----------|-------|------|
| avatar | Teal | 🎙 |
| text-card | Gold | 📝 |
| screen-capture | Blue | 🖥 |
| b-roll-placeholder | Gray | 🎬 |
| branded-intro | Navy | ▶ |
| branded-outro | Navy | ◼ |

## Keyboard shortcuts

- **Cmd+S**: Copy YAML to clipboard
- **Escape**: Stop audio playback
