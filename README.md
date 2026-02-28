# Lumis

<img src="lumis.jpg" alt="Lumis" width="200" align="left">

Your AI confidant. Lumis helps you capture the small moments from your day, synthesize research into lessons, and turn your real life into content worth sharing.

You tell Lumis what happened. Lumis handles the rest:

- **Captures moments** and identifies the "5-second moment," the instant something shifted
- **Finds connections** to your past moments, things you might not have linked on your own
- **Saves research** from articles, books, and videos, and distills them into lessons
- **Builds a Pattern Map** in Obsidian that visualizes how your moments relate over time
- **Coaches what to post** by reading your vault, matching content to your strategy, and drafting platform-specific scripts
- **Produces branded video** from your scripts using AI avatars and automated rendering

Lumis lives in your [Obsidian](https://obsidian.md) vault. Everything stays local.

## How it works

Lumis owns the full content flywheel. Most tools handle one step. Lumis connects all of them because a social media coach that doesn't know your moments is useless, and a video tool that doesn't know your voice is just another template.

```
  live your life
       │
       ▼
  ┌─────────┐    /moment
  │ Capture  │───────────────── "Today I watched my daughter
  │          │                   teach her stuffed animals to code"
  └────┬─────┘
       │
       ▼
  ┌─────────┐
  │ Analyze  │──── 5-second moment: the look on her face
  │          │     when the "program" worked
  └────┬─────┘
       │
       ▼
  ┌─────────┐
  │ Connect  │──── Links to 3 past moments about
  │          │     learning, play, and identity
  └────┬─────┘
       │
       ▼
  ┌─────────┐    Pattern Map.canvas
  │ Pattern  │──── Visual graph in Obsidian showing
  │  Map     │     how your moments cluster by theme
  └────┬─────┘
       │
       ▼
  ┌─────────┐    /social-coach
  │  Coach   │──── Reads your strategy, picks the right
  │          │     platform, writes the script
  └────┬─────┘
       │
       ▼
  ┌─────────┐    /produce
  │ Studio   │──── HeyGen avatar + ElevenLabs voice
  │          │     + Remotion branded render
  └────┬─────┘
       │
       ▼
  finished video
  ready to post
```

Each step feeds the next. Your moments become the raw material for stories. Your strategy docs define what to post and where. The studio turns scripts into video with your avatar, your voice, and your branding. One command takes you from "something happened today" to a finished video.

### The capture layer

Run `/moment` with whatever happened. A sentence, a paragraph, stream of consciousness. Lumis finds the core moment, identifies the 5-second shift, tags themes and people, and connects it to everything you've captured before. The note goes into your Obsidian vault with frontmatter, wiki-links, and a story potential rating.

Run `/add-research` with a URL or article. Lumis reads it, categorizes it, writes a full research note with a TL;DR companion, and extracts learnings. When a learning's topic overlaps with a moment's themes, Lumis flags the connection: your lived experience is backing up what you're reading.

### The coaching layer

Run `/social-coach` and Lumis reads your vault: moments with high story potential, learnings with pillar tags, existing scripts (to avoid duplicates), your content strategy docs, and your amplify toolkit of hooks, structures, and triggers.

It recommends what to post, where, and why. Then it generates platform-specific drafts:

- **LinkedIn**: 3-5 sentences. One idea. Professional but opinionated.
- **X**: Sharp one-liner or thread outline.
- **YouTube**: Timed script: hook (5-10s), problem (15-20s), insight (20-30s), takeaway (10-15s), CTA (5s).

Scripts save to your vault with frontmatter tracking platform, pillar, source content, and status.

### The studio layer

Run `/produce` with a script reference or a direct quote. Lumis sends the script to [HeyGen](https://heygen.com) to generate an avatar video with an [ElevenLabs](https://elevenlabs.io) voice. Then [Remotion](https://remotion.dev) composites the final video:

1. **Branded intro** (3s) with your identity
2. **Avatar clip** with your digital twin speaking the script
3. **Caption overlay** synced to the speech
4. **Lower third** name bar
5. **Branded outro** (5s) with CTA

The output lands in your vault. Lumis updates the script status and gives you cross-posting instructions for each platform.

#### How Remotion works

Remotion treats video as a React app. Each frame is a function of time. You write React components, and Remotion renders them frame-by-frame into an MP4.

The key concepts:

- **Compositions** are named video templates registered in `src/studio/compositions/index.tsx`. Each one specifies dimensions (1920x1080), frame rate (30fps), and a React component to render.
- **`useCurrentFrame()`** returns the current frame number. All animation is a pure function from frame to visual state. Frame 0 shows the intro. Frame 90 starts the avatar. Frame 850 starts the outro.
- **`interpolate(frame, [0, 30], [0, 1])`** maps a frame range to a value range. This is how you do fade-ins: map frames 0-30 to opacity 0-1.
- **`spring({ frame, fps })`** gives you physics-based easing. Text bounces in, elements slide with momentum.
- **`<Sequence from={90}>`** offsets children in time. Inside a Sequence, `useCurrentFrame()` resets to 0. This is how you layer intro, main content, and outro without doing frame math everywhere.
- **`<OffthreadVideo src={path} />`** embeds a video file. Remotion extracts exact frames during rendering using Rust, so the output is frame-accurate.

Remotion has its own webpack bundler. The compositions in `src/studio/compositions/` are excluded from Lumis's TypeScript build and bundled separately when you run `npx remotion render` or `npx remotion studio`.

```
src/studio/compositions/
  brand.ts           ← colors, fonts, timing constants
  BrandedVideo.tsx   ← main composition (layers everything)
  BrandedIntro.tsx   ← 3-sec animated intro
  BrandedOutro.tsx   ← 5-sec outro with CTA
  Captions.tsx       ← subtitle overlay
  LowerThird.tsx     ← name bar ("Your Name | example.com")
  AvatarClip.tsx     ← wraps the HeyGen video
  index.tsx          ← registers compositions with Remotion
```

To preview compositions in your browser: `npx remotion studio`

To render a video: `lumis studio render <script-file>`

## Vault structure

```
Lumis/
  Moments/           ← what happened
  Stories/            ← what it means
  Learnings/          ← what you can take from it
  Research/           ← things you're learning
  Scripts/            ← platform-specific content drafts
  Amplify/            ← hooks, structures, triggers, prompts
  Studio/
    Outputs/          ← finished branded videos
  Voice.md            ← who you are and what you're building toward
  Pattern Map.canvas  ← how moments connect
```

## Setup

```bash
git clone https://github.com/allthriveai/lumis.git
cd lumis
npm install
npm run build
lumis init ~/path/to/your/vault
```

`lumis init` creates the vault structure and scaffolds a `Voice.md` template. Fill in Voice.md first: who you are, your mission, your audience, what you believe, and how you talk. Lumis reads it at every layer to align moments, coaching, and video with your identity.

### Studio setup (optional)

The studio layer needs API keys. Add them to `.lumisrc` or set environment variables:

```json
{
  "studio": {
    "heygenApiKey": "your-key",
    "heygenAvatarId": "your-avatar-id",
    "elevenlabsApiKey": "your-key",
    "elevenlabsVoiceId": "your-voice-id"
  }
}
```

Or: `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`.

Lumis works fine without studio config. The capture, coaching, and script generation layers are fully functional on their own. Studio just adds the video rendering step.

## Commands

```bash
lumis moment "..."                 # Capture a moment
lumis patterns                     # Regenerate the Pattern Map
lumis init [path]                  # Set up Lumis in a vault
lumis import-sparks --from <path>  # Import sparks from manifest
lumis studio list                  # List scripts and their status
lumis studio render <script>       # Render a script to branded video
lumis studio preview               # Open Remotion preview in browser
```

### Claude Code skills

```
/moment          Capture a moment
/add-research    Save and categorize research
/social-coach    Get content recommendations and generate scripts
/produce         Turn a script into a branded video
```

## Tech stack

- **Node.js + TypeScript** with ES modules
- **Claude API** for moment analysis and content coaching
- **gray-matter** for YAML frontmatter parsing
- **MCP SDK** for Claude Code integration
- **Remotion** for programmatic video rendering
- **HeyGen** for AI avatar video generation
- **ElevenLabs** for text-to-speech

## License

MIT. See [LICENSE](./LICENSE).
