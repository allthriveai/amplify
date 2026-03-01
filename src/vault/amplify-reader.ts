import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type {
  Structure,
  StructureFrontmatter,
  Hook,
  HookFrontmatter,
} from "../types/amplify.js";
import {
  resolveAmplifyStructuresDir,
  resolveAmplifyHooksDir,
  resolveAmplifyPersuasionPath,
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

/** Read all hook type files from the Hooks directory */
export function readHooks(config: LumisConfig): Hook[] {
  const dir = resolveAmplifyHooksDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((filename) => {
      const filepath = join(dir, filename);
      const raw = readFileSync(filepath, "utf-8");
      const { frontmatter, content } = parseFrontmatter<HookFrontmatter>(raw);

      return {
        filename,
        path: join(config.paths.amplifyHooks, filename),
        frontmatter,
        content,
      };
    });
}

/** Read the persuasion glossary file */
export function readPersuasionGlossary(config: LumisConfig): string | null {
  const filepath = resolveAmplifyPersuasionPath(config);
  if (!existsSync(filepath)) return null;
  return readFileSync(filepath, "utf-8");
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
