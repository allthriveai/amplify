import { writeFileSync, mkdirSync, existsSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { MomentFrontmatter } from "../types/moment.js";
import type { MeetingFrontmatter } from "../types/meeting.js";
import type { ClippingFrontmatter } from "../types/source.js";
import type { WikiFrontmatter, WikiPageKind } from "../types/wiki.js";
import type { StoryFrontmatter } from "../types/story.js";
import type { CanvasFile } from "../types/canvas.js";
import { resolveMomentsDir, resolveMeetingsDir, resolveCanvasPath, resolveClippingsDir, resolveWikiSubdir, resolveStoriesDir, resolvePracticeLogPath } from "./paths.js";
import { serializeFrontmatter } from "./frontmatter.js";

/** Write a moment file to the vault */
export function writeMoment(
  config: LumisConfig,
  filename: string,
  frontmatter: MomentFrontmatter,
  content: string,
): string {
  const dir = resolveMomentsDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write a meeting note to the vault */
export function writeMeeting(
  config: LumisConfig,
  filename: string,
  frontmatter: MeetingFrontmatter,
  content: string,
): string {
  const dir = resolveMeetingsDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write a raw clipping into the immutable source layer */
export function writeClipping(
  config: LumisConfig,
  filename: string,
  frontmatter: ClippingFrontmatter,
  content: string,
): string {
  const dir = resolveClippingsDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write a wiki page into the subfolder for its kind */
export function writeWikiPage(
  config: LumisConfig,
  kind: WikiPageKind,
  filename: string,
  frontmatter: WikiFrontmatter,
  content: string,
): string {
  const dir = resolveWikiSubdir(config, kind);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write a story file to the vault */
export function writeStory(
  config: LumisConfig,
  filename: string,
  frontmatter: StoryFrontmatter,
  content: string,
): string {
  const dir = resolveStoriesDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Append an entry to the Practice Log */
export function appendPracticeLog(
  config: LumisConfig,
  entry: { date: string; momentTitle: string; element: string; response: string; summary: string },
): string {
  const filepath = resolvePracticeLogPath(config);
  const dir = dirname(filepath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  if (!existsSync(filepath)) {
    writeFileSync(filepath, "# Story Craft Practice Log\n\n", "utf-8");
  }

  const block = `## ${entry.date} — ${entry.element}\n**Moment**: ${entry.momentTitle}\n**Summary**: ${entry.summary}\n\n${entry.response}\n\n---\n\n`;
  appendFileSync(filepath, block, "utf-8");

  return filepath;
}

/** Write the pattern map canvas JSON */
export function writeCanvas(config: LumisConfig, canvas: CanvasFile): string {
  const filepath = resolveCanvasPath(config);
  mkdirSync(dirname(filepath), { recursive: true });

  writeFileSync(filepath, JSON.stringify(canvas, null, 2), "utf-8");
  return filepath;
}
