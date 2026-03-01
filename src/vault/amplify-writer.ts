import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type {
  StructureFrontmatter,
  HookFrontmatter,
} from "../types/amplify.js";
import {
  resolveAmplifyStructuresDir,
  resolveAmplifyHooksDir,
} from "./paths.js";
import { serializeFrontmatter } from "./frontmatter.js";

/** Write a content structure to the vault */
export function writeStructure(
  config: LumisConfig,
  filename: string,
  frontmatter: StructureFrontmatter,
  content: string,
): string {
  const dir = resolveAmplifyStructuresDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write a hook type file to the Hooks directory */
export function writeHook(
  config: LumisConfig,
  filename: string,
  frontmatter: HookFrontmatter,
  content: string,
): string {
  const dir = resolveAmplifyHooksDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}
