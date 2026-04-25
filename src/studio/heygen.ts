import { readFile, writeFile } from "node:fs/promises";

// ---------------------------------------------------------------------------
// v3 API types
// ---------------------------------------------------------------------------

export interface HeyGenVideoOptions {
  /** Text script for HeyGen TTS. Mutually exclusive with audioAssetId/audioUrl. */
  script?: string;
  /** HeyGen asset ID of uploaded audio for lip sync. */
  audioAssetId?: string;
  /** Public URL of audio file for lip sync. */
  audioUrl?: string;
  title?: string;
  aspectRatio?: "16:9" | "9:16";
  resolution?: "4k" | "1080p" | "720p";
  expressiveness?: "high" | "medium" | "low";
  /** Natural-language body motion prompt (e.g. "lean forward", "gesture with hands"). */
  motionPrompt?: string;
  /** Remove avatar background for greenscreen compositing. */
  removeBackground?: boolean;
  background?: { type: "color"; value: string } | { type: "image"; url: string };
}

export interface HeyGenClient {
  /** Generate an avatar video. Returns the video ID. */
  generateVideo(scriptOrOpts: string | HeyGenVideoOptions, title?: string): Promise<string>;
  /** Check the status of a video. */
  checkStatus(videoId: string): Promise<{ status: string; videoUrl?: string }>;
  /** Download a completed video to a local path. Returns the output path. */
  downloadVideo(videoUrl: string, outputPath: string): Promise<string>;
  /** Upload a local audio file as a HeyGen asset. Returns the asset ID. */
  uploadAudio(audioPath: string): Promise<string>;
}

export function createHeyGenClient(
  apiKey: string,
  avatarId: string,
  voiceId?: string,
): HeyGenClient {
  const headers = {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  };

  return {
    async generateVideo(scriptOrOpts: string | HeyGenVideoOptions, title?: string): Promise<string> {
      // Support the old (script, title) signature for backwards compat
      const opts: HeyGenVideoOptions =
        typeof scriptOrOpts === "string"
          ? { script: scriptOrOpts, title }
          : scriptOrOpts;

      const body: Record<string, unknown> = {
        type: "avatar",
        avatar_id: avatarId,
        title: opts.title ?? (opts.script?.slice(0, 80) || "Lumis video"),
        aspect_ratio: opts.aspectRatio ?? "16:9",
      };

      // Audio source: script (TTS), audio_asset_id, or audio_url — pick one
      if (opts.audioAssetId) {
        body.audio_asset_id = opts.audioAssetId;
      } else if (opts.audioUrl) {
        body.audio_url = opts.audioUrl;
      } else if (opts.script) {
        body.script = opts.script;
        if (voiceId) body.voice_id = voiceId;
      }

      body.resolution = opts.resolution ?? "4k";
      if (opts.expressiveness) body.expressiveness = opts.expressiveness;
      if (opts.motionPrompt) body.motion_prompt = opts.motionPrompt;
      if (opts.removeBackground != null) body.remove_background = opts.removeBackground;

      if (opts.background) {
        body.background = opts.background;
      }

      const response = await fetch("https://api.heygen.com/v3/videos", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HeyGen video generation failed (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        data?: { video_id?: string };
      };

      const videoId = data.data?.video_id;
      if (!videoId) {
        throw new Error("HeyGen response missing video_id: " + JSON.stringify(data));
      }

      return videoId;
    },

    async checkStatus(videoId: string): Promise<{ status: string; videoUrl?: string }> {
      const response = await fetch(
        `https://api.heygen.com/v3/videos/${encodeURIComponent(videoId)}`,
        { headers: { "X-Api-Key": apiKey } },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HeyGen status check failed (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        data?: { status?: string; video_url?: string };
      };

      return {
        status: data.data?.status ?? "unknown",
        videoUrl: data.data?.video_url ?? undefined,
      };
    },

    async uploadAudio(audioPath: string): Promise<string> {
      const audioBuffer = await readFile(audioPath);

      const response = await fetch("https://upload.heygen.com/v1/asset", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "audio/mpeg",
        },
        body: audioBuffer,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HeyGen asset upload failed (${response.status}): ${text}`);
      }

      const data = (await response.json()) as {
        data?: { id?: string; asset_id?: string };
      };

      const assetId = data.data?.id ?? data.data?.asset_id;
      if (!assetId) {
        throw new Error("HeyGen upload returned no asset_id: " + JSON.stringify(data));
      }
      return assetId;
    },

    async downloadVideo(videoUrl: string, outputPath: string): Promise<string> {
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error(`Failed to download video (${response.status}): ${videoUrl}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(outputPath, buffer);

      return outputPath;
    },
  };
}
