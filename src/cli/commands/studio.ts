import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "../../config.js";
import { resolveScriptsDir, resolveStudioOutputsDir } from "../../vault/paths.js";
import { parseFrontmatter } from "../../vault/frontmatter.js";
import type { ScriptFrontmatter } from "../../types/studio.js";

const USAGE = `lumis studio — video production

Commands:
  lumis studio list                    List scripts and their status
  lumis studio render <script-file>    Render a script to branded video
  lumis studio preview <script-file>   Preview in Remotion Studio`;

/** `lumis studio <subcommand> [args]` — video production */
export async function studioCommand(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case "list": {
      await listScripts();
      break;
    }
    case "render": {
      const scriptFile = args[0];
      if (!scriptFile) {
        console.error("Usage: lumis studio render <script-file>");
        process.exit(1);
      }
      await renderScript(scriptFile);
      break;
    }
    case "preview": {
      const scriptFile = args[0];
      if (!scriptFile) {
        console.error("Usage: lumis studio preview <script-file>");
        process.exit(1);
      }
      await previewScript();
      break;
    }
    default:
      console.log(USAGE);
  }
}

async function listScripts(): Promise<void> {
  const config = await loadConfig();
  const scriptsDir = resolveScriptsDir(config);

  let files: string[];
  try {
    files = readdirSync(scriptsDir).filter((f) => f.endsWith(".md"));
  } catch {
    files = [];
  }

  if (files.length === 0) {
    console.log("No scripts found. Run /social-coach to generate some.");
    return;
  }

  // Print header
  console.log(
    `${"Filename".padEnd(40)} ${"Platform".padEnd(20)} ${"Pillar".padEnd(20)} ${"Status".padEnd(12)}`,
  );
  console.log("-".repeat(94));

  for (const file of files) {
    const raw = readFileSync(join(scriptsDir, file), "utf-8");
    const { frontmatter } = parseFrontmatter<ScriptFrontmatter>(raw);

    const platform = Array.isArray(frontmatter.platform)
      ? frontmatter.platform.join(", ")
      : String(frontmatter.platform ?? "");
    const pillar = String(frontmatter.pillar ?? "");
    const status = String(frontmatter.status ?? "draft");

    console.log(
      `${file.padEnd(40)} ${platform.padEnd(20)} ${pillar.padEnd(20)} ${status.padEnd(12)}`,
    );
  }
}

async function renderScript(scriptFile: string): Promise<void> {
  const config = await loadConfig();
  const scriptsDir = resolveScriptsDir(config);
  const filePath = join(scriptsDir, scriptFile);

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Script not found: ${filePath}`);
    process.exit(1);
  }

  const { frontmatter, content } = parseFrontmatter<ScriptFrontmatter>(raw);
  const script = {
    filename: scriptFile.replace(/\.md$/, ""),
    path: filePath,
    frontmatter,
    content,
  };

  console.log(`Rendering ${scriptFile}...`);

  const { produceVideo } = await import("../../studio/index.js");
  const outputPath = await produceVideo(config, script);

  console.log(`Done! Output: ${outputPath}`);
}

async function previewScript(): Promise<void> {
  const { previewVideo } = await import("../../studio/index.js");
  console.log("Opening Remotion Studio...");
  await previewVideo();
}
