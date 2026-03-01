---
name: brand
description: Sets up your visual brand identity. Writes brand colors, fonts, and visual style to .lumisrc and Brand.md. Also saves visual inspiration references. Use when the user runs /brand or /brand add.
---

# Brand

## Instructions

When the user runs `/brand`, optionally followed by `add [url or description]`:

If the argument starts with `add`, go to **Add Mode**. Otherwise, go to **Setup Mode**.

---

### Setup Mode

#### Step 0: Load Context

Find the `.lumisrc` config file. Check these locations in order:

1. `.lumisrc` in the current working directory
2. `.lumisrc` at the path specified by `VAULT_PATH` environment variable

Read the config and resolve the vault path.

Read `{vaultPath}/{paths.voice}` (Voice.md) if it exists. This helps connect visual style to written voice.

#### Step 1: Interview

Ask these questions **one at a time** using AskUserQuestion or natural conversation. Wait for each answer before asking the next.

Introduce it:

"Let's set up your brand. This gives your videos, carousels, and articles a consistent visual identity."

**Question 1: Brand name**
"What's your brand name? This appears in video intros and closers."

**Question 2: Tagline** (optional)
"Got a tagline? One line that captures what you do. Skip if you don't have one."

**Question 3: Domain** (optional)
"What's your domain? (e.g., example.com) This shows in video outros. Skip if you don't have one."

**Question 4: Primary color**
"What's your primary brand color? Give me a hex code, a color name, or describe it (e.g., 'deep teal', '#35656e', 'forest green')."

If they give a name or description, pick a specific hex. Confirm: "I'll use {hex} for that. Good?"

**Question 5: Accent color**
"What's your accent color? This is for highlights, CTAs, buttons. Something that pops against your primary."

Same hex resolution as above.

**Question 6: Text color** (offer default)
"What color for body text? Most brands use a dark charcoal. I'll default to #394646 unless you have something specific."

**Question 7: Background color** (offer default)
"Light background color? Used for card backgrounds, section fills. I'll default to a light tint of your primary unless you prefer something else."

If they accept the default, derive it: lighten the primary color to ~90% lightness.

**Question 8: Neutral color** (offer default)
"Neutral/muted color? Used for borders, dividers, secondary elements. I'll default to a warm grey unless you prefer something."

**Question 9: Font**
"What font do you use? (e.g., Inter, Poppins, DM Sans) If you're not sure, Inter works well for most brands."

Options:
- Inter (Recommended)
- Poppins
- DM Sans
- Other

**Question 10: Visual style**
"How would you describe your visual style?"

Options:
- Minimal and clean
- Bold and high-contrast
- Warm and approachable
- Dark and moody
- Playful and colorful
- Other

**Question 11: Visual inspiration** (optional)
"Any brands, designers, or creators whose visual style you admire? This helps inform design direction. Skip if nothing comes to mind."

#### Step 2: Write .lumisrc brand section

Read the existing `.lumisrc` file. Add or update the `brand` section:

```json
{
  "brand": {
    "name": "Brand Name",
    "tagline": "Your tagline",
    "domain": "example.com",
    "colors": {
      "primary": "#35656e",
      "text": "#394646",
      "accent": "#fee19a",
      "background": "#d3e9ee",
      "neutral": "#ded8ce"
    },
    "fonts": {
      "body": "Inter"
    }
  }
}
```

Merge into the existing config without overwriting other sections. Write the updated JSON back.

Also add `"brand": "Brand"` to the `paths` section if not already present.

#### Step 3: Create Brand directory

Create `{vaultPath}/Brand/` and `{vaultPath}/Brand/Inspiration/` if they don't exist. Use `mkdir -p`.

If `paths.brand` is set to something other than "Brand", use that path instead.

#### Step 4: Write Brand.md

Copy the template from `{lumisRepoRoot}/templates/brand/Brand.md` and personalize it with the user's answers.

Replace all `{bracket}` placeholders:

| Placeholder | Source |
|-------------|--------|
| `{primary_name}` | Color name from user (e.g., "Deep teal") |
| `{primary_hex}` | Hex code |
| `{text_name}` | Color name |
| `{text_hex}` | Hex code |
| `{accent_name}` | Color name |
| `{accent_hex}` | Hex code |
| `{background_name}` | Color name |
| `{background_hex}` | Hex code |
| `{neutral_name}` | Color name |
| `{neutral_hex}` | Hex code |
| `{body_font}` | Font name |
| `{heading_font}` | Same as body unless they specified a heading font |
| `{visual_style_description}` | 2-3 sentences describing their visual style based on Q10 answer |
| `{voice_to_visuals}` | Connect Voice.md tone to visual choices. E.g., "Direct voice = clean layouts, bold type, no clutter." |
| `{inspiration_notes}` | Q11 answer, or "None added yet. Run `/brand add` to save visual references." |

Write to `{vaultPath}/{paths.brand}/Brand.md`.

#### Step 5: Report

```
Brand set up.

  Name: {name}
  Colors: {primary_hex} (primary), {accent_hex} (accent)
  Font: {font}
  Style: {visual_style}

  Config: .lumisrc brand section written
  Brand doc: {paths.brand}/Brand.md

Director skills (/director-video, /director-carousel, /director-article) will use this for visual decisions.
Video intros/outros will show "{name}" and "{domain}".
```

---

### Add Mode

When the user runs `/brand add [url or description]`:

#### Step 0: Load Context

Same as Setup Mode Step 0. Also read `{vaultPath}/{paths.brand}/Brand.md` if it exists.

#### Step 1: Determine Input Type

Parse what follows `add`:

- **URL** (starts with `http://` or `https://`): go to Step 2a.
- **Text description**: go to Step 2b.

#### Step 2a: Save URL Inspiration

Fetch the URL content using WebFetch. Summarize the visual elements:

- Color palette
- Typography choices
- Layout style
- Photography/illustration style
- Overall mood

Generate a slug from the page title or URL.

Write to `{vaultPath}/{paths.brand}/Inspiration/{slug}.md`:

```markdown
---
type: brand-inspiration
source: "{url}"
saved: {YYYY-MM-DD}
---

# {Page Title or Description}

**Source:** {url}

## Visual Elements

{summary of visual choices: colors, typography, layout, imagery, mood}

## What to Take From This

{2-3 bullet points on what's worth borrowing for the user's brand}
```

#### Step 2b: Save Description Inspiration

Take the user's text description and save it directly.

Generate a slug from the first few words.

Write to `{vaultPath}/{paths.brand}/Inspiration/{slug}.md`:

```markdown
---
type: brand-inspiration
source: "manual"
saved: {YYYY-MM-DD}
---

# {First few words as title}

{user's description}
```

#### Step 3: Report

```
Inspiration saved: {paths.brand}/Inspiration/{slug}.md

{one-line summary of what was captured}
```
