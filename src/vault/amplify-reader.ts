import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type {
  Structure,
  StructureFrontmatter,
  Trigger,
  TriggerFrontmatter,
  HooksCollection,
  HooksFrontmatter,
  Hook,
  PromptsCollection,
  PromptsFrontmatter,
  Prompt,
} from "../types/amplify.js";
import {
  resolveAmplifyStructuresDir,
  resolveAmplifyTriggersDir,
  resolveAmplifyHooksPath,
  resolveAmplifyPromptsPath,
} from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read all content structures from the vault */
export function readStructures(config: LumisConfig): Structure[] {
  const dir = resolveAmplifyStructuresDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((filename) => {
      const filepath = join(dir, filename);
      const raw = readFileSync(filepath, "utf-8");
      const { frontmatter, content } = parseFrontmatter<StructureFrontmatter>(raw);

      return {
        filename,
        path: join(config.paths.amplifyStructures, filename),
        frontmatter,
        content,
        insights: extractSection(content, "Key Insights"),
        takeaways: extractSection(content, "Takeaways"),
        actions: extractSection(content, "Actions"),
      };
    });
}

/** Read all persuasion triggers from the vault */
export function readTriggers(config: LumisConfig): Trigger[] {
  const dir = resolveAmplifyTriggersDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((filename) => {
      const filepath = join(dir, filename);
      const raw = readFileSync(filepath, "utf-8");
      const { frontmatter, content } = parseFrontmatter<TriggerFrontmatter>(raw);

      return {
        filename,
        path: join(config.paths.amplifyTriggers, filename),
        frontmatter,
        content,
      };
    });
}

/** Read the hooks collection from a single file */
export function readHooks(config: LumisConfig): HooksCollection | null {
  const filepath = resolveAmplifyHooksPath(config);
  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<HooksFrontmatter>(raw);
  const hooks = parseNumberedList(content).map(
    (template, i): Hook => ({ index: i + 1, template }),
  );

  return {
    filename: "Hooks.md",
    path: join(config.paths.amplifyHooks, "Hooks.md"),
    frontmatter,
    hooks,
  };
}

/** Read the prompts collection from a single file */
export function readPrompts(config: LumisConfig): PromptsCollection | null {
  const filepath = resolveAmplifyPromptsPath(config);
  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<PromptsFrontmatter>(raw);
  const prompts = parseNumberedList(content).map(
    (prompt, i): Prompt => ({ index: i + 1, prompt }),
  );

  return {
    filename: "Prompts.md",
    path: join(config.paths.amplifyPrompts, "Prompts.md"),
    frontmatter,
    prompts,
  };
}

/** Extract bullet points from a ## Section in markdown */
function extractSection(content: string, heading: string): string[] {
  const pattern = new RegExp(`## ${heading}\\n+([\\s\\S]*?)(?=\\n## |$)`);
  const match = content.match(pattern);
  if (!match) return [];

  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

/** Parse a numbered list (1. item, 2. item, ...) into an array of strings */
function parseNumberedList(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean);
}
