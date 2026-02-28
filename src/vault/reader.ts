import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Moment, MomentFrontmatter } from "../types/moment.js";
import type { ResearchNote, ResearchFrontmatter } from "../types/research.js";
import type { Story, StoryFrontmatter, StoryElements } from "../types/story.js";
import type { CanvasFile } from "../types/canvas.js";
import { resolveMomentsDir, resolveCanvasPath, resolveResearchDir, resolveResearchCategoryDir, resolveStoriesDir } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

/** Read all moment files from the configured moments directory */
export function readMoments(config: LumisConfig): Moment[] {
  const dir = resolveMomentsDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((filename) => readMoment(config, filename))
    .filter((m): m is Moment => m !== null);
}

/** Read a single moment file by filename */
export function readMoment(config: LumisConfig, filename: string): Moment | null {
  const dir = resolveMomentsDir(config);
  const filepath = join(dir, filename);

  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<MomentFrontmatter>(raw);

  // Extract 5-second moment from ## The 5-Second Moment section
  const fiveSecMatch = content.match(
    /## The 5-Second Moment\n+([\s\S]*?)(?=\n## |$)/,
  );

  // Extract connections from wiki-links in ## Connections section
  const connectionsMatch = content.match(
    /## Connections\n+([\s\S]*?)(?=\n## |$)/,
  );
  const connections = connectionsMatch
    ? [...connectionsMatch[1].matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1])
    : [];

  return {
    filename,
    path: join(config.paths.moments, filename),
    frontmatter,
    content,
    fiveSecondMoment: fiveSecMatch?.[1]?.trim(),
    connections,
  };
}

/** Read all research notes across all category folders and the research root */
export function readResearchNotes(config: LumisConfig): ResearchNote[] {
  const notes: ResearchNote[] = [];

  // Read from research root
  const rootDir = resolveResearchDir(config);
  if (existsSync(rootDir)) {
    notes.push(...readResearchNotesFromDir(rootDir, config.paths.research));
  }

  // Read from each category subfolder
  for (const category of config.researchCategories) {
    const categoryDir = resolveResearchCategoryDir(config, category);
    if (existsSync(categoryDir)) {
      const relativePath = join(config.paths.research, category.folder);
      notes.push(...readResearchNotesFromDir(categoryDir, relativePath));
    }
  }

  return notes;
}

function readResearchNotesFromDir(
  dir: string,
  relativePath: string,
): ResearchNote[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((filename) => {
      const filepath = join(dir, filename);
      const raw = readFileSync(filepath, "utf-8");
      const { frontmatter, content } = parseFrontmatter<ResearchFrontmatter>(raw);
      return {
        filename,
        path: join(relativePath, filename),
        frontmatter,
        content,
      };
    });
}

/** Read all story files from the configured stories directory */
export function readStories(config: LumisConfig): Story[] {
  const dir = resolveStoriesDir(config);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md" && f !== "Practice Log.md")
    .map((filename) => readStory(config, filename))
    .filter((s): s is Story => s !== null);
}

/** Read a single story file by filename */
export function readStory(config: LumisConfig, filename: string): Story | null {
  const dir = resolveStoriesDir(config);
  const filepath = join(dir, filename);

  if (!existsSync(filepath)) return null;

  const raw = readFileSync(filepath, "utf-8");
  const { frontmatter, content } = parseFrontmatter<StoryFrontmatter>(raw);

  const elements: StoryElements = {};

  // Extract Transformation section
  const transMatch = content.match(/## Transformation\n+([\s\S]*?)(?=\n## |$)/);
  if (transMatch) {
    const section = transMatch[1];
    const beforeMatch = section.match(/\*\*Before\*\*:\s*(.*)/);
    const afterMatch = section.match(/\*\*After\*\*:\s*(.*)/);
    const changeMatch = section.match(/\*\*The change\*\*:\s*(.*)/);
    elements.transformation = {
      before: beforeMatch?.[1]?.trim() ?? "",
      after: afterMatch?.[1]?.trim() ?? "",
      change: changeMatch?.[1]?.trim() ?? "",
    };
  }

  // Extract 5-Second Moment section
  const fiveSecMatch = content.match(/## The 5-Second Moment\n+([\s\S]*?)(?=\n## |$)/);
  if (fiveSecMatch) {
    elements.fiveSecondMoment = fiveSecMatch[1].trim();
  }

  // Extract The Question section
  const questionMatch = content.match(/## The Question\n+([\s\S]*?)(?=\n## |$)/);
  if (questionMatch) {
    elements.theQuestion = questionMatch[1].trim();
  }

  // Extract Opening Scene section
  const sceneMatch = content.match(/## Opening Scene\n+([\s\S]*?)(?=\n## |$)/);
  if (sceneMatch) {
    elements.openingScene = sceneMatch[1].trim();
  }

  // Extract The Stakes section
  const stakesMatch = content.match(/## The Stakes\n+([\s\S]*?)(?=\n## |$)/);
  if (stakesMatch) {
    elements.theStakes = stakesMatch[1].trim();
  }

  // Extract The Turns section
  const turnsMatch = content.match(/## The Turns\n+([\s\S]*?)(?=\n## |$)/);
  if (turnsMatch) {
    const turnLines = turnsMatch[1]
      .split("\n")
      .filter((l) => l.startsWith("- "))
      .map((l) => l.replace(/^- /, "").trim());
    if (turnLines.length > 0) {
      elements.theTurns = turnLines;
    }
  }

  // Extract The Story section
  const storyMatch = content.match(/## The Story\n+([\s\S]*?)(?=\n## |$)/);
  if (storyMatch) {
    elements.theStory = storyMatch[1].trim();
  }

  return {
    filename,
    path: join(config.paths.stories, filename),
    frontmatter,
    content,
    elements,
  };
}

/** Read the pattern map canvas file */
export function readCanvas(config: LumisConfig): CanvasFile | null {
  const path = resolveCanvasPath(config);
  if (!existsSync(path)) return null;

  try {
    return JSON.parse(readFileSync(path, "utf-8")) as CanvasFile;
  } catch {
    return null;
  }
}
