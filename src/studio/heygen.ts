import { writeFile } from "node:fs/promises";

export interface HeyGenClient {
  /** Generate an avatar video from a script. Returns the task/video ID. */
  generateVideo(script: string): Promise<string>;
  /** Check the status of a video generation task. */
  checkStatus(taskId: string): Promise<{ status: string; videoUrl?: string }>;
  /** Download a completed video to a local path. Returns the output path. */
  downloadVideo(videoUrl: string, outputPath: string): Promise<string>;
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
    async generateVideo(script: string): Promise<string> {
      const body: Record<string, unknown> = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId,
              avatar_style: "normal",
            },
            voice: voiceId
              ? { type: "audio", audio_type: "elevenlabs", voice_id: voiceId }
              : { type: "text", input_text: script },
            background: {
              type: "color",
              value: "#FFFFFF",
            },
          },
        ],
        dimension: { width: 1920, height: 1080 },
      };

      // When using the built-in TTS, the script goes in the voice input
      if (!voiceId) {
        body.video_inputs = [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId,
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: script,
            },
            background: {
              type: "color",
              value: "#FFFFFF",
            },
          },
        ];
      }

      const response = await fetch(
        "https://api.heygen.com/v2/video/generate",
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HeyGen video generation failed (${response.status}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        data?: { video_id?: string };
      };

      const videoId = data.data?.video_id;
      if (!videoId) {
        throw new Error(
          "HeyGen response missing video_id: " + JSON.stringify(data),
        );
      }

      return videoId;
    },

    async checkStatus(
      taskId: string,
    ): Promise<{ status: string; videoUrl?: string }> {
      const url = `https://api.heygen.com/v1/video_status.get?video_id=${encodeURIComponent(taskId)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "X-Api-Key": apiKey },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HeyGen status check failed (${response.status}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        data?: { status?: string; video_url?: string };
      };

      return {
        status: data.data?.status ?? "unknown",
        videoUrl: data.data?.video_url ?? undefined,
      };
    },

    async downloadVideo(
      videoUrl: string,
      outputPath: string,
    ): Promise<string> {
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download video (${response.status}): ${videoUrl}`,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(outputPath, buffer);

      return outputPath;
    },
  };
}
