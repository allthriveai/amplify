import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "../../types/config.js";

/** `lumis init [path]` — set up Lumis in a vault */
export async function initCommand(targetPath?: string): Promise<void> {
  const vaultPath = resolve(targetPath ?? process.cwd());
  const isExistingVault = existsSync(join(vaultPath, ".obsidian"));

  console.log(
    isExistingVault
      ? `Found existing vault at ${vaultPath}`
      : `Creating new vault at ${vaultPath}`,
  );

  // Create core directories
  const dirs = [
    DEFAULT_PATHS.moments,
    DEFAULT_PATHS.stories,
    DEFAULT_PATHS.research,
    DEFAULT_PATHS.researchTldr,
    DEFAULT_PATHS.amplifyStructures,
    DEFAULT_PATHS.amplifyTriggers,
  ];

  // Add research category subfolders
  for (const category of DEFAULT_RESEARCH_CATEGORIES) {
    dirs.push(join(DEFAULT_PATHS.research, category.folder));
  }

  for (const dir of dirs) {
    const fullPath = join(vaultPath, dir);
    mkdirSync(fullPath, { recursive: true });

    const readmePath = join(fullPath, "README.md");
    if (!existsSync(readmePath)) {
      const folderName = dir.split("/").pop() ?? dir;
      writeFileSync(readmePath, `# ${folderName}\n`, "utf-8");
    }
  }

  // Write .lumisrc
  const lumisrcPath = join(vaultPath, ".lumisrc");
  if (!existsSync(lumisrcPath)) {
    const config = {
      vaultPath,
      paths: {
        moments: DEFAULT_PATHS.moments,
        stories: DEFAULT_PATHS.stories,
        canvas: DEFAULT_PATHS.canvas,
        dailyNotes: DEFAULT_PATHS.dailyNotes,
        dailyNoteFormat: DEFAULT_PATHS.dailyNoteFormat,
        research: DEFAULT_PATHS.research,
        researchTldr: DEFAULT_PATHS.researchTldr,
        amplifyStructures: DEFAULT_PATHS.amplifyStructures,
        amplifyTriggers: DEFAULT_PATHS.amplifyTriggers,
        amplifyHooks: DEFAULT_PATHS.amplifyHooks,
        amplifyPrompts: DEFAULT_PATHS.amplifyPrompts,
      },
      researchCategories: DEFAULT_RESEARCH_CATEGORIES,
    };
    writeFileSync(lumisrcPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`Created .lumisrc`);
  }

  console.log(`Scaffolded Lumis in ${vaultPath}`);
  console.log(`  Moments:  ${DEFAULT_PATHS.moments}`);
  console.log(`  Stories:  ${DEFAULT_PATHS.stories}`);
  console.log(`  Research: ${DEFAULT_PATHS.research}`);
  for (const cat of DEFAULT_RESEARCH_CATEGORIES) {
    console.log(`    - ${cat.name}: ${join(DEFAULT_PATHS.research, cat.folder)}`);
  }
  console.log(`  TL;DR:    ${DEFAULT_PATHS.researchTldr}`);
  console.log(`  Amplify:`);
  console.log(`    Structures: ${DEFAULT_PATHS.amplifyStructures}`);
  console.log(`    Triggers:   ${DEFAULT_PATHS.amplifyTriggers}`);
  console.log(`    Hooks:      ${DEFAULT_PATHS.amplifyHooks}/Hooks.md`);
  console.log(`    Prompts:    ${DEFAULT_PATHS.amplifyPrompts}/Prompts.md`);
}
