import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { AmplifyConfig } from "../types/config.js";
import type { MeetingFrontmatter } from "../types/meeting.js";
import type { ClippingFrontmatter } from "../types/source.js";
import type { WikiFrontmatter, WikiPageKind } from "../types/wiki.js";
import type { StoryFrontmatter } from "../types/story.js";
import { resolveMeetingsDir, resolveClippingsDir, resolveWikiSubdir, resolveStoriesDir } from "./paths.js";
import { serializeFrontmatter } from "./frontmatter.js";

/** Serialize frontmatter + content and write into dir, creating it if needed */
function writeNote(dir: string, filename: string, frontmatter: object, content: string): string {
  mkdirSync(dir, { recursive: true });
  const filepath = join(dir, filename);
  writeFileSync(filepath, serializeFrontmatter(frontmatter, content), "utf-8");
  return filepath;
}

/** Write a meeting note to the vault */
export function writeMeeting(
  config: AmplifyConfig,
  filename: string,
  frontmatter: MeetingFrontmatter,
  content: string,
): string {
  return writeNote(resolveMeetingsDir(config), filename, frontmatter, content);
}

/** Write a raw clipping into the immutable source layer */
export function writeClipping(
  config: AmplifyConfig,
  filename: string,
  frontmatter: ClippingFrontmatter,
  content: string,
): string {
  return writeNote(resolveClippingsDir(config), filename, frontmatter, content);
}

/** Write a wiki page into the subfolder for its kind */
export function writeWikiPage(
  config: AmplifyConfig,
  kind: WikiPageKind,
  filename: string,
  frontmatter: WikiFrontmatter,
  content: string,
): string {
  return writeNote(resolveWikiSubdir(config, kind), filename, frontmatter, content);
}

/** Write a story file to the vault */
export function writeStory(
  config: AmplifyConfig,
  filename: string,
  frontmatter: StoryFrontmatter,
  content: string,
): string {
  return writeNote(resolveStoriesDir(config), filename, frontmatter, content);
}
