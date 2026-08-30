---
name: draft-diagram
description: Creates interactive React Flow diagrams from crafted stories. Outputs a standalone HTML file (interactive) and a PNG export for embedding in articles, carousels, or sharing. Use when the user asks to make a diagram, flowchart, concept map, or visual from a story, or says "turn this into a diagram", "make a flowchart", "visualize this", or "create a concept map".
---

# Draft Diagram

## Instructions

When the user runs `/draft-diagram`, optionally followed by a story slug and/or a brand flag:

**Brand flag**: If the user passes `--{profile}` (e.g., `--work`), use that brand profile from `.amplifyrc` `brandProfiles.{profile}` instead of the default `brand` section. Example: `/draft-diagram --work my-story-slug`

### Step 0: Load Context

Find the `.amplifyrc` config file. Check these locations in order:

1. `.amplifyrc` in the current working directory
2. `.amplifyrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Resolve the brand:
- If the user passed a `--{profile}` flag, look up `brandProfiles.{profile}` in `.amplifyrc`. If it exists, use that profile. Also read `{vaultPath}/{paths.brand}/{profile}-Brand.md` if it exists (e.g., `Work-Brand.md`).
- Otherwise, fall back to the default `brand` section in `.amplifyrc` and read `{vaultPath}/{paths.brand}/Brand.md`.

Build a brand context from the resolved profile:

```
primary: {brand.primary or #35656e}
secondary: {brand.secondary or brand.charcoal or #394646}
accent: {brand.accent or brand.lemon or #fee19a}
background: {brand.background or brand.ivory or #f8f9fa}
fontFamily: {brand.fontBody or "Inter, system-ui, sans-serif"}
```

The brand profile may include extended color tokens beyond primary/secondary/accent (e.g., `teal`, `sky`, `evergreen`, `marigold`). Use these for richer diagrams when appropriate — data viz nodes, category colors, status indicators.

Read `{vaultPath}/Voice.md` if it exists for tone context.

### Step 1: Find the Story

If the user provided a slug (e.g., `/draft-diagram why-we-rebuilt-onboarding`), use it directly.

If no slug, scan `{vaultPath}/{paths.stories}/` for story folders that have a `story.md`. List them and let the user pick.

Read the story's `story.md` and `raw.md` (if it exists) to understand the narrative.

### Step 2: Pick Diagram Type

Present the four diagram types with examples. Use AskUserQuestion:

- **Flow**: process steps, decision trees, system architecture (e.g., "How our AI pipeline works")
- **Concept map**: ideas connected by relationships (e.g., "How these 3 principles connect")
- **Timeline**: events in sequence with branching (e.g., "My transformation from X to Y")
- **Comparison**: side-by-side contrasts (e.g., "Old way vs new way")

### Step 3: Extract Diagram Content

Analyze the story content and identify the key concepts, relationships, and flow that should be diagrammed. Consider:

- For **flow**: What are the steps? Where are the decision points? What's the start and end?
- For **concept map**: What are the core ideas? How do they relate to each other?
- For **timeline**: What events happened? In what order? Any branches or parallel paths?
- For **comparison**: What two things are being contrasted? What dimensions differ?

Present a text outline of proposed nodes and edges:

```
## Proposed Diagram: "{title}"

### Nodes
1. [input] Start: "You have a story"
2. [default] Free Write: "Stream of consciousness"
3. [default] Find the Moment: "Identify the 5-second shift"
4. [output] Narrative: "Clean, shaped story"

### Connections
- Start -> Free Write: "begin here"
- Free Write -> Find the Moment: "dig deeper"
- Find the Moment -> Narrative: "shape it"

Want to add, remove, or change anything?
```

Let the user refine the outline. Loop until they approve.

### Step 4: Build the Diagram Structure

Convert the approved outline into typed nodes and edges. Apply brand colors from Step 0.

Layout rules per diagram type:
- **Flow**: top-to-bottom direction. Input nodes get accent color background. Output nodes get primary color background with white text. Default nodes get white background with primary border.
- **Concept map**: top-to-bottom direction (dagre handles radial-like spacing). Central concept gets primary background. Related concepts get white with primary border.
- **Timeline**: left-to-right direction. First event gets accent background. Last event gets primary background. Middle events get white with primary border.
- **Comparison**: left-to-right direction. Group headers get primary background. Items under each group get white with primary border.

Build the `DiagramNode[]` and `DiagramEdge[]` arrays. Each node gets:
- `id`: kebab-case slug (e.g., `"free-write"`)
- `label`: display text
- `type`: `"input"` for entry points, `"output"` for endpoints, `"default"` otherwise
- `style`: brand-appropriate colors per the rules above

Each edge gets:
- `id`: `"e-{source}-{target}"`
- `source` and `target`: matching node ids
- `label`: relationship description (optional, keep short)
- `animated`: true for the primary/happy path

### Step 5: Save Diagram File

Write the diagram as a markdown file with YAML frontmatter to the story folder:

**Filename**: `diagram-{diagramType}-{slug}-{YYYY-MM-DD}.md`

**Location**: `{vaultPath}/{paths.stories}/{slug}/`

**Frontmatter** (DiagramFrontmatter):
```yaml
title: "{diagram title}"
type: diagram
diagramType: flow
status: draft
source: "[[story]]"
platform: web
nodeCount: 4
edgeCount: 3
creativeBrief:
  purpose: "Show the content creation process"
  audience: "LinkedIn audience"
nodes:
  - id: start
    label: "You have a story"
    type: input
    style:
      background: "#fee19a"
      border: "2px solid #35656e"
      color: "#394646"
  # ... all nodes
edges:
  - id: e-start-free-write
    source: start
    target: free-write
    label: "begin here"
    animated: true
  # ... all edges
```

**Content** (below frontmatter): Director's notes about the diagram, what it communicates, and how it fits the story.

### Step 6: Render Outputs

Import and call `renderDiagramHtml` from `src/diagram/render-html.ts`:

```typescript
import { renderDiagramHtml } from "../../../src/diagram/render-html.js";
```

Actually, since this is a skill (not compiled code), generate the HTML directly:

1. Read the saved diagram file's frontmatter to get nodes and edges.
2. Call the render function by reading `src/diagram/render-html.ts` to understand the HTML template structure, then generate equivalent HTML output.

Or more practically: use the node/edge data from Step 4 and build the HTML file using this approach:

1. Read `src/diagram/render-html.ts` to get the HTML template.
2. Construct the HTML by substituting the title, nodes JSON, edges JSON, brand colors, and layout direction into the template.
3. Write the HTML to `{vaultPath}/{paths.stories}/{slug}/assets/diagram-{diagramType}.html`.

To generate the PNG:
1. Use the Playwright MCP tool to open the generated HTML file with `browser_navigate` using a `file://` URL.
2. Wait for the diagram to render (wait for the title text to appear).
3. Take a screenshot with `browser_take_screenshot` and save to `{vaultPath}/{paths.stories}/{slug}/assets/diagram-{diagramType}.png`.
4. Close the page.

Ensure the `assets/` directory exists before writing.

### Step 7: Signal and Report

Emit a `diagram_created` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "diagram_created",
  "timestamp": "[ISO timestamp]",
  "data": {
    "slug": "[story-slug]",
    "diagramType": "[flow|concept-map|timeline|comparison]",
    "storySource": "[[story]]",
    "nodeCount": 4,
    "edgeCount": 3,
    "htmlPath": "assets/diagram-flow.html",
    "pngPath": "assets/diagram-flow.png"
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — diagram_created: Created {diagramType} diagram for "{title}" ({nodeCount} nodes, {edgeCount} edges)
```

Report what was done:

```
Diagram created for "{story title}":

  Type: {diagramType}
  Nodes: {nodeCount}
  Edges: {edgeCount}

  Files:
    {stories}/{slug}/diagram-{type}-{slug}-{date}.md  (source)
    {stories}/{slug}/assets/diagram-{type}.html        (interactive)
    {stories}/{slug}/assets/diagram-{type}.png         (static image)

Next steps:
  - Open the HTML file in a browser for the interactive version
  - Use the PNG in /draft-carousel or /draft-article
  - Edit the .md file to refine nodes and edges, then re-run to regenerate
```

## Diagram Design Guidelines

When building diagrams from stories:

- **Keep it simple.** 5-12 nodes is the sweet spot. More than 15 and it becomes hard to read.
- **Label edges sparingly.** Only add edge labels when the relationship isn't obvious from context.
- **Use the story's language.** Node labels should use the same words the story uses, not abstract jargon.
- **Animate the main path.** Set `animated: true` on edges that form the primary flow so users can follow it.
- **Group related nodes.** Use the `group` field to cluster nodes that belong together conceptually.
- **Match the story's tone.** A personal transformation gets warm colors and gentle flow. A technical process gets clean lines and neutral tones.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    <- free write + interview (craft-content)
  story.md                                  <- pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             <- video timeline (draft-video)
  carousel-{hook}-{slug}-{date}.md          <- carousel cards (draft-carousel)
  article-{hook}-{slug}-{date}.md           <- blog post (draft-article)
  diagram-{type}-{slug}-{date}.md           <- diagram source (draft-diagram)
  assets/                                   <- generated assets
    diagram-{type}.html                     <- interactive React Flow diagram
    diagram-{type}.png                      <- static screenshot
```
