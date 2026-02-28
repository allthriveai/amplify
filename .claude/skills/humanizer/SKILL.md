---
name: humanizer
description: Remove signs of AI-generated writing from text. Use when editing or reviewing text to make it sound more natural and human-written. Based on Wikipedia's comprehensive "Signs of AI writing" guide. Detects and fixes patterns including inflated symbolism, promotional language, superficial -ing analyses, vague attributions, em dash overuse, rule of three, AI vocabulary words, negative parallelisms, and excessive conjunctive phrases.
---

# Humanizer

## Instructions

When the user runs `/humanizer` or asks to humanize text, apply these rules to all prose. Preserve code, data, tables, and structural elements exactly as-is.

### AI Vocabulary

Replace these words with natural alternatives:

| AI word | Use instead |
|---------|-------------|
| delve | dig into, explore, look at |
| landscape | space, field, area |
| crucial / pivotal | important, key, matters because |
| showcase | show, demonstrate |
| leverage | use |
| utilize | use |
| facilitate | help, enable |
| comprehensive | thorough, full, complete |
| robust | solid, strong, reliable |
| innovative | new, novel, clever |
| cutting-edge | latest, modern, new |
| game-changer | big shift, major change |
| paradigm | model, approach |
| synergy | combination, working together |
| empower | let, help, enable |
| streamline | simplify, speed up |
| tapestry | (just cut it) |
| underscore | show, point to |
| foster | build, grow, support |
| enhance | improve, strengthen |
| vibrant | (be specific about what makes it alive) |
| profound | deep, real, serious |
| interplay | relationship, tension, push and pull |
| intricate | detailed, layered, complex |
| multifaceted | (just describe the facets) |
| nuanced | specific, layered |
| realm | area, space, field |
| testament | proof, evidence, sign |

### Significance Inflation

Cut phrases that puff up importance beyond what the content earns:

- "stands as a testament to"
- "marking a key moment in"
- "reflects broader themes of"
- "speaks to the larger"
- "is a powerful reminder that"
- "serves as a beacon of"

Replace with plain statements. If it's important, the content shows that. You don't need to announce it.

### Superficial -ing Phrases

Cut these when they add no information:

- "highlighting the importance of"
- "underscoring the need for"
- "symbolizing the"
- "emphasizing the"
- "showcasing the"
- "demonstrating the power of"
- "illustrating the"

These are padding. Say what the thing actually does instead.

### Filler and Hedging

Remove entirely:

- "It's worth noting that"
- "It's important to note"
- "Interestingly"
- "In today's [X] landscape/world/era"
- "Let's dive in"
- "Without further ado"
- "In order to" (just say "to")
- "At its core"
- "It is important to note that"
- "Essentially" / "Basically" / "Fundamentally"
- Excessive "very", "really", "quite"

### Structural Tells

- **No em dash overuse.** Use commas, colons, or separate sentences. One em dash per page is fine. Five is a tell.
- **Break the rule-of-three.** Don't always list exactly three items. Sometimes two is enough. Sometimes four is what's true.
- **Vary sentence rhythm.** Mix short and long. Don't keep them uniform. A paragraph of five 15-word sentences sounds generated.
- **Don't start consecutive paragraphs the same way.** Especially with "The" or "This".
- **No negative parallelisms.** Avoid "It's not just X; it's Y" and "Not only...but also...". Say what it is. Skip what it isn't.

### Promotional Tone

- No brochure language ("revolutionize your workflow", "unlock the power of")
- No generic positive conclusions ("the future looks bright", "exciting times ahead")
- No sycophantic language ("Great question!", "Absolutely!", "I hope this helps!")
- State facts. Have opinions. Skip the cheerleading.

### What to Preserve

- Code examples, data points, technical details: exactly as-is
- Bullet lists, numbered lists, tables, headings: structural, not AI patterns
- The user's own words and voice: the humanizer is for YOUR writing, not theirs
- Specific details, names, numbers, quotes: keep all of it

### The Test

Read each paragraph out loud. If it sounds like something assembled from parts rather than something said by a person, rewrite it. Good writing has rhythm, specificity, and occasionally surprises you. AI writing is smooth, balanced, and never takes a risk.
