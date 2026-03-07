import { join } from "node:path";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { ElevenLabsClient } from "./elevenlabs.js";

const execFileAsync = promisify(execFile);

/** Maximum characters per ElevenLabs API request */
const MAX_CHARS_PER_CHUNK = 5000;

/**
 * Clean markdown content for audio narration.
 * Strips formatting that doesn't make sense when spoken aloud.
 */
export function cleanMarkdownForNarration(markdown: string): string {
  let text = markdown;

  // Strip YAML frontmatter (in case raw markdown is passed)
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, "");

  // Remove code blocks entirely
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]+`/g, "");

  // Convert tables to sentence form: "header: value" per row
  text = text.replace(
    /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g,
    (_match, headerRow: string, bodyRows: string) => {
      const headers = headerRow
        .split("|")
        .map((h: string) => h.trim())
        .filter(Boolean);
      const rows = bodyRows
        .trim()
        .split("\n")
        .filter(Boolean);
      const sentences = rows.map((row: string) => {
        const cells = row
          .split("|")
          .map((c: string) => c.trim())
          .filter(Boolean);
        return headers
          .map((h: string, i: number) => `${h}: ${cells[i] ?? ""}`)
          .join(". ");
      });
      return sentences.join(".\n") + "\n";
    },
  );

  // Convert wiki-links [[display|link]] or [[link]] → keep display text
  text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$1");
  text = text.replace(/\[\[([^\]]+)\]\]/g, "$1");

  // Convert markdown links [text](url) → keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Strip images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // Strip heading markers but keep text, add a pause
  text = text.replace(/^#{1,6}\s+(.+)$/gm, "\n$1.\n");

  // Strip bold/italic markers
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "$1");
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/___(.+?)___/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");

  // Strip strikethrough
  text = text.replace(/~~(.+?)~~/g, "$1");

  // Convert horizontal rules to pause
  text = text.replace(/^-{3,}$/gm, "\n");
  text = text.replace(/^\*{3,}$/gm, "\n");

  // Strip blockquote markers but keep text
  text = text.replace(/^>\s?/gm, "");

  // Remove source/URL lines at the bottom (common in research notes)
  text = text.replace(/^(Source|URL|Link|Reference):\s*https?:\/\/.*$/gim, "");
  text = text.replace(/^https?:\/\/\S+$/gm, "");

  // Clean up excessive whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

/**
 * Split text at paragraph boundaries, respecting a max character limit.
 */
export function chunkText(text: string, maxChars: number = MAX_CHARS_PER_CHUNK): string[] {
  if (text.length <= maxChars) return [text];

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current.length + paragraph.length + 2 > maxChars) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      // If a single paragraph exceeds maxChars, split at sentence boundaries
      if (paragraph.length > maxChars) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) ?? [paragraph];
        for (const sentence of sentences) {
          if (current.length + sentence.length > maxChars) {
            if (current) chunks.push(current.trim());
            current = sentence;
          } else {
            current += sentence;
          }
        }
      } else {
        current = paragraph;
      }
    } else {
      current += (current ? "\n\n" : "") + paragraph;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Concatenate multiple MP3 files using ffmpeg.
 */
async function concatenateMp3(inputPaths: string[], outputPath: string): Promise<void> {
  const listPath = join(tmpdir(), `lumis-concat-${randomUUID()}.txt`);
  const listContent = inputPaths.map((p) => `file '${p}'`).join("\n");
  await writeFile(listPath, listContent);

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      outputPath,
    ]);
  } finally {
    await unlink(listPath).catch(() => {});
  }
}

/**
 * Convert text to audio narration via ElevenLabs.
 * Handles chunking for long text and concatenation of chunks.
 * Returns the output file path.
 */
export async function narrateToAudio(
  text: string,
  outputPath: string,
  client: ElevenLabsClient,
): Promise<string> {
  const cleaned = cleanMarkdownForNarration(text);
  const chunks = chunkText(cleaned);

  // Ensure output directory exists
  const outputDir = outputPath.substring(0, outputPath.lastIndexOf("/"));
  await mkdir(outputDir, { recursive: true });

  if (chunks.length === 1) {
    await client.generateSpeech(chunks[0], outputPath);
    return outputPath;
  }

  // Generate each chunk to a temp file
  const tempDir = join(tmpdir(), `lumis-narrate-${randomUUID()}`);
  await mkdir(tempDir, { recursive: true });

  const chunkPaths: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkPath = join(tempDir, `chunk-${i}.mp3`);
    await client.generateSpeech(chunks[i], chunkPath);
    chunkPaths.push(chunkPath);
    console.log(`  Generated chunk ${i + 1}/${chunks.length}`);
  }

  // Concatenate all chunks
  await concatenateMp3(chunkPaths, outputPath);

  // Clean up temp files
  for (const p of chunkPaths) {
    await unlink(p).catch(() => {});
  }

  return outputPath;
}

/**
 * Estimate audio duration from character count.
 * Average speaking rate is ~150 words per minute, ~5 chars per word.
 */
export function estimateDuration(text: string): string {
  const chars = cleanMarkdownForNarration(text).length;
  const words = chars / 5;
  const minutes = Math.round(words / 150);
  if (minutes < 1) return "< 1 min";
  return `${minutes} min`;
}
