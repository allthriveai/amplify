---
name: director-images
description: Generates AI images for director formats (video, carousel, article) using Google Imagen. Finds image slots, builds brand-aware prompts, generates images, and updates source files so images flow into rendering automatically. Use when the user asks to generate images for a story's video, carousel, or article, or says "make the images", "generate images", or "add images to this".
---

# Director Images

## Instructions

When the user runs `/director-images`, optionally followed by a story slug:

### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Verify `GOOGLE_API_KEY` is available (via `.lumisrc` studio.googleApiKey or `GOOGLE_API_KEY` env var). If missing, tell the user: "Google API key not found. Add `googleApiKey` to the `studio` section of `.lumisrc` or set `GOOGLE_API_KEY` in your environment."

Read `{vaultPath}/{paths.brand}/Brand.md` if it exists. Read the brand config from `.lumisrc` (brand section). Build a brand context string:

```
Brand: {name}. Colors: {primary} (primary), {secondary} (secondary), {accent} (accent), {background} (background). Font feel: {body}. {visual style notes from Brand.md if available}
```

This brand context string gets prepended to every image prompt.

### Step 1: Find the Story

If the user provided a slug (e.g., `/director-images why-we-rebuilt-onboarding`), use it directly.

If no slug, scan `{vaultPath}/{paths.stories}/` for story folders. List stories that have any director output (video-*.md, carousel-*.md, or article-*.md). Present the list and let the user pick.

### Step 2: Detect Format

Scan the story folder `{stories}/{slug}/` for:
- `video-*.md` files (video timelines)
- `carousel-*.md` files (carousel cards)
- `article-*.md` files (blog posts)

If only one format exists, use it. If multiple formats exist, present the list and let the user pick. If none exist, tell the user: "No director cuts found for this story. Run `/director-video`, `/director-carousel`, or `/director-article` first."

Read the selected file and parse its frontmatter.

### Step 3: Extract Image Slots

Based on the format, find slots that need images:

**Video timeline:**
- Shots where `shotType === "b-roll-placeholder"` (these are dark cards waiting for visual content)
- Shots where `shotType === "screen-capture"` and no `asset` field is set
- For each slot, use the shot's `direction` field as the content direction

**Carousel:**
- Cards with an `imageDirection` field and no `asset` field
- For each slot, use the card's `imageDirection` as the content direction

**Article:**
- Articles have no existing image spec. Ask the user: "Which sections need images?" Present the sections list from frontmatter and let them pick.
- For each selected section, ask for a brief image direction or offer to generate one from the section's beat and heading.

If no image slots are found, tell the user: "All slots in this file already have assets. Nothing to generate."

Present the found slots:

```
Found {N} image slots in {format} "{title}":

1. Shot 4 [b-roll-placeholder] — "Overhead shot of laptop with code editor open"
2. Shot 7 [b-roll-placeholder] — "Person looking at phone, notification visible"
3. Shot 9 [screen-capture] — "Dashboard showing metrics graph"
```

### Step 4: Build and Confirm Prompts

For each slot, build an image prompt by combining:

1. **Brand context** (from Step 0) — visual style and color palette
2. **Format framing** — aspect ratio and composition rules for the format:
   - Video: 16:9, cinematic framing, shallow depth of field
   - Carousel: 1:1, bold composition, clean background for text overlay
   - Article: 16:9 for hero images, 4:3 for inline images
3. **Content direction** — the `direction` or `imageDirection` from the source file
4. **Safety suffix** — "No text, watermarks, or logos in the image. Photorealistic style."

Example prompt:
```
Professional photograph with teal (#2e4a6e) and warm gold (#e0a53c) color accents.
Overhead shot of a laptop with a code editor open, soft natural lighting, shallow depth of field.
Modern workspace setting. No text, watermarks, or logos in the image. Photorealistic style.
```

Present all prompts in a numbered list:

```
## Image Prompts

1. **Shot 4** (b-roll-placeholder, 16:9)
   "Professional photograph with teal and warm gold accents. Overhead shot of laptop..."

2. **Shot 7** (b-roll-placeholder, 16:9)
   "Professional photograph with teal and warm gold accents. Person looking at phone..."

3. **Shot 9** (screen-capture, 16:9)
   "Professional photograph with teal and warm gold accents. Dashboard showing metrics..."

Want to refine any prompts before generating? Give me a number to edit, or "go" to generate all.
```

Let the user refine prompts by number. Loop until they say "go" or approve.

### Step 5: Generate Images

Generate images one at a time using the Imagen API. For each slot:

1. Call the Imagen API with the approved prompt and appropriate aspect ratio:
   - Video: `16:9`
   - Carousel: `1:1`
   - Article hero: `16:9`, inline: `4:3`

2. Save the image to `{stories}/{slug}/assets/` with a descriptive filename:
   - Video: `shot-{id}-{beat}.png` (e.g., `shot-04-tension.png`)
   - Carousel: `card-{id}-{beat}.png` (e.g., `card-03-tension.png`)
   - Article: `section-{id}-{beat}.png` (e.g., `section-02-setup.png`)

3. After each image, report and ask:
   ```
   Generated: assets/shot-04-tension.png

   [Keep] [Regenerate with tweaks] [Skip]
   ```

   - **Keep**: move to next slot
   - **Regenerate with tweaks**: ask what to change, update the prompt, regenerate
   - **Skip**: leave this slot without an image, move to next

### Step 6: Update Source Files

After all images are generated (or skipped), update the source file's frontmatter:

**Video timeline:**
- For each generated image, set `asset` on the corresponding shot to the relative path (e.g., `assets/shot-04-tension.png`)
- Change `shotType` from `b-roll-placeholder` to `screen-capture` (since it now has a real image asset that the ScreenCapture component can render)
- Leave `screen-capture` shots that already had that type unchanged

Write the updated frontmatter back to the file using gray-matter serialization.

**Carousel:**
- For each generated image, set `asset` on the corresponding card to the relative path (e.g., `assets/card-03-tension.png`)

Write the updated frontmatter back to the file.

**Article:**
- Add an `images` array to the frontmatter listing all generated image paths
- Each entry: `{ sectionId: N, path: "assets/section-02-setup.png" }`

Write the updated frontmatter back to the file.

### Step 7: Signal and Report

Emit an `images_generated` signal to `{vaultPath}/{paths.signals}/signals.json`:

```json
{
  "id": "sig-[timestamp]-[random6hex]",
  "type": "images_generated",
  "timestamp": "[ISO timestamp]",
  "data": {
    "slug": "[story-slug]",
    "format": "[video|carousel|article]",
    "sourceFile": "[filename of the director cut]",
    "imageCount": 3,
    "imagePaths": ["assets/shot-04-tension.png", "assets/shot-07-tension.png", "assets/shot-09-transformation.png"]
  }
}
```

Log to session memory at `{vaultPath}/{paths.memory}/sessions/YYYY-MM-DD.md`:

```
- **HH:MM** — images_generated: Generated {N} images for "{title}" ({format})
```

Report what was done:

```
Images generated for "{title}" ({format}):

  Generated: {N} images
  Skipped: {N} slots
  Saved to: {stories}/{slug}/assets/

  Updated: {source-filename}
    - Shot 4: b-roll-placeholder -> screen-capture (assets/shot-04-tension.png)
    - Shot 7: b-roll-placeholder -> screen-capture (assets/shot-07-tension.png)
    - Shot 9: screen-capture (assets/shot-09-transformation.png)

Next steps:
  - Video: run `lumis studio render {slug}` — generated images render via ScreenCapture
  - Carousel: take to Canva/Figma with the asset files
  - Article: embed images at the marked sections when publishing
```

### Prompt Engineering Guidelines

When building image prompts:

- **Lead with style**, not subject. "Professional photograph with warm lighting" before "of a laptop."
- **Reference brand colors by hex**, not just name. The model interprets hex values as color guidance.
- **Specify what you don't want.** Always end with "No text, watermarks, or logos."
- **Match the story's tone.** A vulnerable moment gets soft lighting and close framing. A bold claim gets high contrast and wide composition.
- **Be specific about composition.** "Overhead shot" not "picture of." "Close-up of hands on keyboard" not "person using computer."
- **Avoid abstract concepts.** Imagen handles concrete visuals well. Instead of "innovation," say "lightbulb sketch on whiteboard, natural lighting."

### Aspect Ratios

The Imagen API supports these aspect ratios:
- `1:1` — square (carousel cards, social posts)
- `16:9` — widescreen (video b-roll, article heroes, YouTube thumbnails)
- `9:16` — vertical (stories, reels, shorts)
- `4:3` — standard (article inline images)
- `3:4` — portrait

Default to `16:9` for video, `1:1` for carousel, `16:9` for article hero images.

## Story Folder Structure

```
{stories}/{slug}/
  raw.md                                    <- free write + interview (craft-content)
  story.md                                  <- pure narrative (craft-content)
  video-{hook}-{slug}-{date}.md             <- video timeline (director-video)
  carousel-{hook}-{slug}-{date}.md          <- carousel cards (director-carousel)
  article-{hook}-{slug}-{date}.md           <- blog post (director-article)
  assets/                                   <- generated images (director-images)
    shot-04-tension.png
    card-03-tension.png
    section-02-setup.png
```
