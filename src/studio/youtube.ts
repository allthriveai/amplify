import { readFileSync, createReadStream } from "node:fs";
import { google, youtube_v3 } from "googleapis";

export interface YouTubeUploadOptions {
  filePath: string;
  title: string;
  description?: string;
  tags?: string[];
  /** "public" | "unlisted" | "private" */
  privacy?: string;
  /** Set to true for Shorts (vertical, under 60s) */
  isShort?: boolean;
  thumbnailPath?: string;
}

export interface YouTubeClient {
  upload(options: YouTubeUploadOptions): Promise<{ videoId: string; url: string }>;
}

export function createYouTubeClient(
  credentialsPath: string,
  refreshToken: string,
): YouTubeClient {
  const creds = JSON.parse(readFileSync(credentialsPath, "utf-8"));
  const { client_id, client_secret } = creds.installed;

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3333");
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  return {
    async upload(options: YouTubeUploadOptions): Promise<{ videoId: string; url: string }> {
      const {
        filePath,
        title,
        description = "",
        tags = [],
        privacy = "private",
        isShort = false,
        thumbnailPath,
      } = options;

      // Add #Shorts to title if it's a Short
      const finalTitle = isShort && !title.includes("#Shorts")
        ? `${title} #Shorts`
        : title;

      const res = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: finalTitle,
            description,
            tags,
            categoryId: "28", // Science & Technology
          },
          status: {
            privacyStatus: privacy,
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: createReadStream(filePath),
        },
      });

      const videoId = res.data.id!;
      const url = `https://youtu.be/${videoId}`;

      // Upload thumbnail if provided
      if (thumbnailPath) {
        try {
          await youtube.thumbnails.set({
            videoId,
            media: {
              body: createReadStream(thumbnailPath),
            },
          });
        } catch (err: any) {
          console.warn(`Warning: thumbnail upload failed: ${err.message}`);
        }
      }

      return { videoId, url };
    },
  };
}
