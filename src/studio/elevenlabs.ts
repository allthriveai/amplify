import { writeFile } from "node:fs/promises";

export interface ElevenLabsClient {
  /** Generate speech audio from text. Returns the output file path. */
  generateSpeech(text: string, outputPath: string): Promise<string>;
  /** List available voices. */
  getVoices(): Promise<Array<{ voice_id: string; name: string }>>;
}

export function createElevenLabsClient(
  apiKey: string,
  voiceId: string,
): ElevenLabsClient {
  const baseHeaders = {
    "xi-api-key": apiKey,
    "Content-Type": "application/json",
  };

  return {
    async generateSpeech(
      text: string,
      outputPath: string,
    ): Promise<string> {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs speech generation failed (${response.status}): ${errorText}`,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(outputPath, buffer);

      return outputPath;
    },

    async getVoices(): Promise<Array<{ voice_id: string; name: string }>> {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        method: "GET",
        headers: { "xi-api-key": apiKey },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs voice list failed (${response.status}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        voices?: Array<{ voice_id: string; name: string }>;
      };

      return (data.voices ?? []).map((v) => ({
        voice_id: v.voice_id,
        name: v.name,
      }));
    },
  };
}
