import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadConfig } from "../../config.js";
import type { AmplifyManifest } from "../../types/amplify.js";
import {
  writeStructure,
  writeHook,
} from "../../vault/amplify-writer.js";

/** `lumis import-sparks --from <path>` — import sparks from a manifest */
export async function importSparksCommand(fromPath: string): Promise<void> {
  const config = loadConfig();

  if (!config.vaultPath) {
    console.error("No vault path configured. Run `lumis init` first.");
    process.exit(1);
  }

  const sourcePath = resolve(fromPath.replace(/^~/, process.env.HOME ?? ""));
  const manifestPath = join(sourcePath, "sparks.json");

  if (!existsSync(manifestPath)) {
    console.log("No sparks.json manifest found. Scaffolding empty structure...");
    scaffoldEmptyStructure(config.vaultPath);
    console.log(`\nTo import sparks:`);
    console.log(`  1. Create sparks.json in: ${sourcePath}`);
    console.log(`  2. Run: lumis import-sparks --from "${fromPath}"`);
    return;
  }

  const manifest: AmplifyManifest = JSON.parse(
    readFileSync(manifestPath, "utf-8"),
  );

  const today = new Date().toISOString().split("T")[0];
  let count = 0;

  // Import structures
  for (const s of manifest.structures) {
    const slug = slugify(s.title);
    const filename = `${slug}.md`;

    const contentSections: string[] = [];
    if (s.summary) contentSections.push(s.summary);

    if (s.pdfFile) {
      contentSections.push(
        `\n## Source\n\n![[3 - Resources/Creator Blueprints/${s.pdfFile}]]`,
      );
    }

    if (s.insights.length > 0) {
      contentSections.push(`\n## Key Insights\n`);
      contentSections.push(...s.insights.map((i) => `- ${i}`));
    }
    if (s.takeaways.length > 0) {
      contentSections.push(`\n## Takeaways\n`);
      contentSections.push(...s.takeaways.map((t) => `- ${t}`));
    }
    if (s.actions.length > 0) {
      contentSections.push(`\n## Actions\n`);
      contentSections.push(...s.actions.map((a) => `- ${a}`));
    }

    writeStructure(config, filename, {
      title: s.title,
      type: "structure",
      created: today,
      tags: ["amplify", "structure", s.category.toLowerCase()],
      category: s.category,
      source: "Creator Blueprints",
      pdfUrl: s.pdfFile
        ? `[[3 - Resources/Creator Blueprints/${s.pdfFile}]]`
        : undefined,
    }, contentSections.join("\n"));

    count++;
  }
  console.log(`  Structures: ${manifest.structures.length}`);

  // Import hooks
  if (manifest.hooks.length > 0) {
    for (const hookName of manifest.hooks) {
      const slug = slugify(hookName);
      const filename = `${slug}.md`;

      writeHook(config, filename, {
        title: hookName,
        type: "amplify-hook",
        created: today,
      }, "");

      count++;
    }
    console.log(`  Hooks: ${manifest.hooks.length}`);
  }

  console.log(`\nImported ${count} spark files into vault.`);
}

function scaffoldEmptyStructure(vaultPath: string): void {
  const dirs = [
    "Lumis/Amplify/Structures",
    "Lumis/Amplify/Hooks",
  ];

  for (const dir of dirs) {
    const fullPath = join(vaultPath, dir);
    mkdirSync(fullPath, { recursive: true });
    console.log(`  Created: ${dir}`);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
