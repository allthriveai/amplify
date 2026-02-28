import { join } from "node:path";
import { existsSync } from "node:fs";
import type { LumisConfig } from "../types/config.js";
import type { Moment, MomentAnalysis, MomentFrontmatter } from "../types/moment.js";
import { readMoments } from "../vault/reader.js";
import { analyzeMoment } from "../ai/analyze.js";
import { humanize } from "../ai/humanize.js";
import { writeMoment } from "../vault/writer.js";
import { generatePatternMap } from "../canvas/index.js";
import { resolveMomentsDir } from "../vault/paths.js";
import { emitSignal, signalId } from "../vault/signals.js";
import { appendSessionEntry, formatSessionTime } from "../vault/memory.js";
import type { MomentCapturedSignal } from "../types/signal.js";

/**
 * Full moment capture pipeline:
 * 1. Read existing moments
 * 2. Analyze raw input with Claude
 * 3. Build moment content as markdown
 * 4. Humanize the prose
 * 5. Build frontmatter and filename
 * 6. Write moment file to vault
 * 7. Regenerate the Pattern Map canvas
 */
export async function captureMoment(
  rawInput: string,
  config: LumisConfig,
): Promise<{ moment: Moment; analysis: MomentAnalysis }> {
  // 1. Read existing moments
  const existingMoments = readMoments(config);

  // 2. Analyze the raw input (no Voice context — moments are pure life reflection)
  const analysis = await analyzeMoment(
    rawInput,
    existingMoments,
    config.anthropicApiKey,
  );

  // 3. Build moment content as markdown
  const connectionsMarkdown = analysis.connections
    .map((c) => `- [[${c.momentPath}]] — ${c.reason}`)
    .join("\n");

  const content = [
    `# ${analysis.title}`,
    "",
    analysis.description,
    "",
    "## The 5-Second Moment",
    analysis.fiveSecondMoment,
    "",
    "## Connections",
    connectionsMarkdown,
    "",
    "## Story Potential",
    `${analysis.storyPotential}. ${analysis.storyPotentialReason}`,
  ].join("\n");

  // 4. Humanize the content
  const humanizedContent = await humanize(content, config.anthropicApiKey);

  // 5. Build frontmatter
  const today = new Date().toISOString().split("T")[0];
  const frontmatter: MomentFrontmatter = {
    date: today,
    "moment-type": analysis.momentType,
    people: analysis.people,
    places: analysis.places,
    "story-status": "captured",
    "story-potential": analysis.storyPotential,
    themes: analysis.themes,
    tags: ["moment", `moment/${analysis.momentType}`],
  };

  // 6. Build filename with collision handling
  const filename = buildFilename(config, today, analysis.title);

  // 7. Write the moment to the vault
  writeMoment(config, filename, frontmatter, humanizedContent);

  // 8. Regenerate the pattern map canvas
  generatePatternMap(config);

  // 9. Emit moment_captured signal
  const signal: MomentCapturedSignal = {
    id: signalId(),
    type: "moment_captured",
    timestamp: new Date().toISOString(),
    data: {
      filename,
      themes: analysis.themes,
      storyPotential: analysis.storyPotential,
      momentType: analysis.momentType,
      fiveSecondMoment: analysis.fiveSecondMoment,
    },
  };
  emitSignal(config, signal);

  // 10. Log to session memory
  appendSessionEntry(config, {
    time: formatSessionTime(),
    action: "moment_captured",
    detail: `Captured "${analysis.title}" (${analysis.storyPotential} potential, themes: ${analysis.themes.join(", ")})`,
  });

  // 11. Return the moment and analysis
  const moment: Moment = {
    filename,
    path: join(config.paths.moments, filename),
    frontmatter,
    content: humanizedContent,
    fiveSecondMoment: analysis.fiveSecondMoment,
    connections: analysis.connections.map((c) => c.momentPath),
  };

  return { moment, analysis };
}

/** Build a filename like "2024-01-15 - Title.md", appending -b, -c, etc. on collision */
function buildFilename(
  config: LumisConfig,
  date: string,
  title: string,
): string {
  const momentsDir = resolveMomentsDir(config);
  const base = `${date} - ${title}.md`;

  if (!existsSync(join(momentsDir, base))) {
    return base;
  }

  // Collision: append letter suffixes -b, -c, ...
  const letters = "bcdefghijklmnopqrstuvwxyz";
  for (const letter of letters) {
    const suffixed = `${date}-${letter} - ${title}.md`;
    if (!existsSync(join(momentsDir, suffixed))) {
      return suffixed;
    }
  }

  // Extremely unlikely fallback
  return `${date}-z${Date.now()} - ${title}.md`;
}
