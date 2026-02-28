import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type {
  StructureFrontmatter,
  TriggerFrontmatter,
  HooksFrontmatter,
  Hook,
  PromptsFrontmatter,
  Prompt,
} from "../types/amplify.js";
import {
  resolveAmplifyStructuresDir,
  resolveAmplifyTriggersDir,
  resolveAmplifyHooksPath,
  resolveAmplifyPromptsPath,
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

/** Write a persuasion trigger to the vault */
export function writeTrigger(
  config: LumisConfig,
  filename: string,
  frontmatter: TriggerFrontmatter,
  content: string,
): string {
  const dir = resolveAmplifyTriggersDir(config);
  mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write the hooks collection as a single file */
export function writeHooksCollection(
  config: LumisConfig,
  frontmatter: HooksFrontmatter,
  hooks: Hook[],
): string {
  const filepath = resolveAmplifyHooksPath(config);
  mkdirSync(dirname(filepath), { recursive: true });

  const content = hooks
    .map((h) => `${h.index}. ${h.template}`)
    .join("\n");

  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}

/** Write the prompts collection as a single file */
export function writePromptsCollection(
  config: LumisConfig,
  frontmatter: PromptsFrontmatter,
  prompts: Prompt[],
): string {
  const filepath = resolveAmplifyPromptsPath(config);
  mkdirSync(dirname(filepath), { recursive: true });

  const content = prompts
    .map((p) => `${p.index}. ${p.prompt}`)
    .join("\n");

  const markdown = serializeFrontmatter(frontmatter, content);
  writeFileSync(filepath, markdown, "utf-8");

  return filepath;
}
