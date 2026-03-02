import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface ImagenClient {
  /** Generate images from a prompt. Returns base64-encoded image data. */
  generate(options: {
    prompt: string;
    aspectRatio?: string;
    sampleCount?: number;
  }): Promise<Array<{ bytesBase64Encoded: string; mimeType: string }>>;

  /** Generate a single image and save it to disk. Returns the output path. */
  generateAndSave(
    options: { prompt: string; aspectRatio?: string },
    outputPath: string,
  ): Promise<string>;
}

export function createImagenClient(apiKey: string): ImagenClient {
  const baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict";

  return {
    async generate(options) {
      const { prompt, aspectRatio = "16:9", sampleCount = 1 } = options;

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            aspectRatio,
            sampleCount,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Imagen generation failed (${response.status}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        predictions?: Array<{
          bytesBase64Encoded: string;
          mimeType: string;
        }>;
      };

      if (!data.predictions || data.predictions.length === 0) {
        throw new Error("Imagen returned no predictions: " + JSON.stringify(data));
      }

      return data.predictions;
    },

    async generateAndSave(options, outputPath) {
      const predictions = await this.generate({ ...options, sampleCount: 1 });
      const image = predictions[0];

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, Buffer.from(image.bytesBase64Encoded, "base64"));

      return outputPath;
    },
  };
}
