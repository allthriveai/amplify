import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadConfig } from "../../config.js";
import type { AmplifyManifest } from "../../types/amplify.js";
import {
  writeStructure,
  writeHook,
} from "../../vault/amplify-writer.js";
import { slugify } from "../../vault/slug.js";
import { todayKey } from "../../vault/dates.js";

/** `amplify import-sparks --from <path>` — import sparks from a manifest */
export async function importSparksCommand(fromPath: string): Promise<void> {
  const config = loadConfig();

  if (!config.vaultPath) {
    console.error("No vault path configured. Run `amplify init` first.");
    process.exit(1);
  }

  const sourcePath = resolve(fromPath.replace(/^~/, process.env.HOME ?? ""));
  const manifestPath = join(sourcePath, "sparks.json");

  if (!existsSync(manifestPath)) {
    console.log("No sparks.json manifest found. Scaffolding empty structure...");
    scaffoldEmptyStructure(config.vaultPath);
    console.log(`\nTo import sparks:`);
    console.log(`  1. Create sparks.json in: ${sourcePath}`);
    console.log(`  2. Run: amplify import-sparks --from "${fromPath}"`);
    return;
  }

  const manifest: AmplifyManifest = JSON.parse(
    readFileSync(manifestPath, "utf-8"),
  );

  // Source PDFs are raw material, so they live under the source layer. This used
  // to point at a hardcoded "3 - Resources/..." path that no longer exists, which
  // meant every imported structure carried a dead embed.
  const pdfDir = join(config.paths.sources, "Blueprints");
  const today = todayKey();
  let count = 0;

  // Import structures
  for (const s of manifest.structures) {
    const slug = slugify(s.title);
    const filename = `${slug}.md`;

    const contentSections: string[] = [];
    if (s.summary) contentSections.push(s.summary);

    if (s.pdfFile) {
      contentSections.push(
        `\n## Source\n\n![[${pdfDir}/${s.pdfFile}]]`,
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
      pdfUrl: s.pdfFile ? `[[${pdfDir}/${s.pdfFile}]]` : undefined,
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
    "Amplify/Structures",
    "Amplify/Hooks",
  ];

  for (const dir of dirs) {
    const fullPath = join(vaultPath, dir);
    mkdirSync(fullPath, { recursive: true });
    console.log(`  Created: ${dir}`);
  }
}

