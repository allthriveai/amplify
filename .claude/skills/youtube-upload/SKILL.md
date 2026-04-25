---
name: youtube-upload
description: Upload videos to YouTube via the API. Supports single uploads, batch uploads, scheduled publishing, Shorts, thumbnails, and descriptions. Use when the user wants to upload, schedule, or publish videos to YouTube.
---

# YouTube Upload

## Instructions

### Step 0: Load Config

Load `.env` for `YOUTUBE_REFRESH_TOKEN`. Credentials file is at `youtube-credentials.json` in the lumis project root.

If `YOUTUBE_REFRESH_TOKEN` is missing, run: `npx tsx scripts/youtube-auth.ts`

### Step 1: Determine Upload Type

Ask the user or infer from context:

- **Single video**: one file, one upload
- **Batch**: multiple files (e.g., 7 Shorts from a series)
- **Scheduled**: spread uploads over time (e.g., one per day)

### Step 2: Gather Metadata

For each video, collect:
- **File path** (required)
- **Title** (required, under 100 chars)
- **Description** (include article link, hashtags)
- **Tags** (comma-separated)
- **Privacy**: `public`, `unlisted`, or `private` (default: `private`)
- **Is Short?**: Add `#Shorts` to title if yes
- **Thumbnail**: Optional image path
- **Schedule date**: Optional ISO date for scheduled publishing

### Step 3: Upload

Use `createYouTubeClient` from `src/studio/youtube.ts`:

```typescript
import { createYouTubeClient } from "../src/studio/youtube.js";

const client = createYouTubeClient("youtube-credentials.json", process.env.YOUTUBE_REFRESH_TOKEN);

const { videoId, url } = await client.upload({
  filePath: "path/to/video.mp4",
  title: "Video Title",
  description: "Description",
  tags: ["tag1", "tag2"],
  privacy: "private",
  isShort: true,
  thumbnailPath: "path/to/thumb.png",
});
```

For scheduled publishing, use the `googleapis` library directly with `publishAt`:

```typescript
status: {
  privacyStatus: "private",
  publishAt: "2026-04-26T16:00:00Z", // 9am PT
  selfDeclaredMadeForKids: false,
}
```

### Step 4: Report

Show the user:
- Video ID and URL for each upload
- Schedule dates if applicable
- Remind them to check YouTube Studio to verify

### Channel Info

- **Channel**: read from the authorized credentials
- **Channel ID**: `YOUR_CHANNEL_ID`
- **Account**: `user@example.com`
- **OAuth was done with the main account, NOT the a brand account**

### Scheduling Best Practices

- One video per day for Shorts — YouTube algorithm rewards consistency
- Default schedule time: 9am PT (16:00 UTC)
- Upload as private with `publishAt` — lets the user review before it goes live
- Category ID `28` = Science & Technology

### Shorts Requirements

- Resolution: 1080x1920 (9:16)
- Max duration: 60 seconds
- Add `#Shorts` to the title
- YouTube auto-detects Shorts by aspect ratio, but the hashtag helps

### What NOT to do

- Don't upload to the a brand account — it creates a separate channel
- Don't set `madeForKids` to true — this disables comments and notifications
- Don't upload more than 6 videos per day — quota is 10,000 units, each upload costs 1,600
- Don't make videos public without the user reviewing them first — always default to private
