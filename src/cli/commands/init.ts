import { existsSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PATHS } from "../../types/config.js";
import { WIKI_SUBDIRS } from "../../types/wiki.js";

// Headings derive from WIKI_SUBDIRS so the index and the folders cannot disagree —
// a hand-written list here once said "## Sources" while everything else said Summaries.
const WIKI_INDEX_TEMPLATE = `# Index

Every page in the wiki, one line each. Read this first when answering anything.

${Object.values(WIKI_SUBDIRS).map((sub) => `## ${sub}\n`).join("\n")}`;

const WIKI_LOG_TEMPLATE = `# Log

Append-only. Newest entries at the bottom. Never edit an entry already written.
`;

/** The amplify repo root, resolved from this module rather than the cwd */
function packageRoot(): string {
  // src/cli/commands/init.ts and dist/cli/commands/init.js are both three levels down
  return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
}

const PREFERENCES_TEMPLATE = `# Preferences

## Content Style

## Coaching

## Topics
`;


/** `amplify init [path]` — set up Amplify in a vault */
export async function initCommand(targetPath?: string): Promise<void> {
  const vaultPath = resolve(targetPath ?? process.cwd());
  const isExistingVault = existsSync(join(vaultPath, ".obsidian"));

  console.log(
    isExistingVault
      ? `Found existing vault at ${vaultPath}`
      : `Creating new vault at ${vaultPath}`,
  );

  // The wiki owns its own navigation through index.md, so its folders get no
  // README. A hand-maintained hub next to a generated index is the exact pattern
  // that goes stale and starts lying about what the folder holds.
  const wikiDirs = Object.values(WIKI_SUBDIRS).map((sub) => join(DEFAULT_PATHS.wiki, sub));

  const dirs = [
    join(DEFAULT_PATHS.sources, "Clippings"),
    join(DEFAULT_PATHS.sources, "assets"),
    DEFAULT_PATHS.meetings,
    DEFAULT_PATHS.audio,
    DEFAULT_PATHS.stories,
    DEFAULT_PATHS.strategyDocs,
    DEFAULT_PATHS.amplifyStructures,
    DEFAULT_PATHS.amplifyHooks,
    DEFAULT_PATHS.signals,
    join(DEFAULT_PATHS.memory, "sessions"),
    DEFAULT_PATHS.brand,
    join(DEFAULT_PATHS.brand, "Inspiration"),
  ];

  for (const dir of [...wikiDirs, ...dirs]) {
    mkdirSync(join(vaultPath, dir), { recursive: true });
  }

  for (const dir of dirs) {
    const readmePath = join(vaultPath, dir, "README.md");
    if (!existsSync(readmePath)) {
      const folderName = dir.split("/").pop() ?? dir;
      writeFileSync(readmePath, `# ${folderName}\n`, "utf-8");
    }
  }

  // Seed the wiki's two special files
  const indexPath = join(vaultPath, DEFAULT_PATHS.wiki, "index.md");
  if (!existsSync(indexPath)) writeFileSync(indexPath, WIKI_INDEX_TEMPLATE, "utf-8");

  const logPath = join(vaultPath, DEFAULT_PATHS.wiki, "log.md");
  if (!existsSync(logPath)) writeFileSync(logPath, WIKI_LOG_TEMPLATE, "utf-8");

  // Copy the schema. This is what turns a generic agent into a wiki maintainer,
  // so it matters more than any folder created above.
  const schemaPath = join(vaultPath, "CLAUDE.md");
  if (!existsSync(schemaPath)) {
    copyFileSync(join(packageRoot(), "templates", "vault", "CLAUDE.md"), schemaPath);
    console.log(`Created CLAUDE.md (the wiki schema)`);
  }

  // Write .amplifyrc
  const amplifyrcPath = join(vaultPath, ".amplifyrc");
  if (!existsSync(amplifyrcPath)) {
    const config = {
      vaultPath,
      paths: {
        stories: DEFAULT_PATHS.stories,
        sources: DEFAULT_PATHS.sources,
        wiki: DEFAULT_PATHS.wiki,
        amplifyStructures: DEFAULT_PATHS.amplifyStructures,
        amplifyHooks: DEFAULT_PATHS.amplifyHooks,
        amplifyPersuasion: DEFAULT_PATHS.amplifyPersuasion,
        strategyDocs: DEFAULT_PATHS.strategyDocs,
        voice: DEFAULT_PATHS.voice,
        signals: DEFAULT_PATHS.signals,
        memory: DEFAULT_PATHS.memory,
        brand: DEFAULT_PATHS.brand,
        people: DEFAULT_PATHS.people,
        audio: DEFAULT_PATHS.audio,
        meetings: DEFAULT_PATHS.meetings,
      },
    };
    writeFileSync(amplifyrcPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`Created .amplifyrc`);
  }

  console.log(`Scaffolded Amplify in ${vaultPath}`);
  console.log(`  Sources: ${DEFAULT_PATHS.sources}  (raw, immutable)`);
  console.log(`    Clippings: ${join(DEFAULT_PATHS.sources, "Clippings")}`);
  console.log(`    Meetings:  ${DEFAULT_PATHS.meetings}`);
  console.log(`  Wiki:    ${DEFAULT_PATHS.wiki}  (agent-maintained)`);
  for (const sub of Object.values(WIKI_SUBDIRS)) {
    console.log(`    ${sub}`);
  }
  console.log(`  Work:    ${DEFAULT_PATHS.stories}, ${DEFAULT_PATHS.strategyDocs}`);
  console.log(`  Amplify:`);
  console.log(`    Structures: ${DEFAULT_PATHS.amplifyStructures}`);
  console.log(`    Hooks:      ${DEFAULT_PATHS.amplifyHooks}`);

  // Write Voice.md template
  const voicePath = join(vaultPath, DEFAULT_PATHS.voice);
  if (!existsSync(voicePath)) {
    const voiceTemplate = `# Voice

## Who I am
[Your name, what you do, your background. Write in first person.]

## My mission
[What you're trying to accomplish. The change you want to make in the world.]

## My audience
[Who you're talking to. What they need. What keeps them up at night.]

## What I believe
[Your core beliefs. The hills you'll die on. What makes your perspective different.]

## How I talk
[Your voice: direct? warm? technical? casual? Funny? Serious? What words do you use? What do you never say?]
`;
    writeFileSync(voicePath, voiceTemplate, "utf-8");
    console.log(`  Voice:   ${DEFAULT_PATHS.voice} (fill this in — it shapes everything Amplify does)`);
  }

  // Write preferences.md template
  const preferencesPath = join(vaultPath, DEFAULT_PATHS.memory, "preferences.md");
  if (!existsSync(preferencesPath)) {
    writeFileSync(preferencesPath, PREFERENCES_TEMPLATE, "utf-8");
    console.log(`  Preferences: ${DEFAULT_PATHS.memory}/preferences.md`);
  }

  console.log(`  Signals: ${DEFAULT_PATHS.signals}`);
  console.log(`  Memory:  ${DEFAULT_PATHS.memory}`);
  console.log(`  Brand:   ${DEFAULT_PATHS.brand}`);
}
