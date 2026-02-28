import { loadConfig } from "../../config.js";
import { readMoments } from "../../vault/reader.js";
import { resolvePracticeLogPath } from "../../vault/paths.js";
import { existsSync, readFileSync } from "node:fs";

export async function storyCraftCommand(mode: string, args: string[]): Promise<void> {
  const config = loadConfig();
  const moments = readMoments(config);

  if (mode === "develop") {
    const search = args.join(" ").replace(/^["']|["']$/g, "").trim();

    if (search) {
      const lowerSearch = search.toLowerCase();
      const matches = moments.filter(
        (m) =>
          m.filename.toLowerCase().includes(lowerSearch) ||
          m.content.toLowerCase().includes(lowerSearch) ||
          m.frontmatter.themes.some((t) => t.toLowerCase().includes(lowerSearch)),
      );

      if (matches.length === 0) {
        console.log(`No moments found matching "${search}".`);
        return;
      }

      console.log(`Found ${matches.length} moment(s) matching "${search}":\n`);
      for (const m of matches) {
        const titleMatch = m.content.match(/^#\s+(.+)$/m);
        const title = titleMatch?.[1] ?? m.filename.replace(/\.md$/, "");
        console.log(`  ${m.frontmatter.date} — ${title} (${m.frontmatter["story-potential"]} potential)`);
      }
      console.log("\nUse the /story-craft skill in Claude Code for the full guided conversation.");
    } else {
      // Pick highest-potential undeveloped moment
      const candidates = moments
        .filter((m) =>
          (m.frontmatter["story-potential"] === "high" || m.frontmatter["story-potential"] === "medium") &&
          (m.frontmatter["story-status"] === "captured" || m.frontmatter["story-status"] === "exploring"),
        )
        .sort((a, b) => {
          const potentialOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          const potA = potentialOrder[a.frontmatter["story-potential"]] ?? 2;
          const potB = potentialOrder[b.frontmatter["story-potential"]] ?? 2;
          if (potA !== potB) return potA - potB;
          return b.frontmatter.date.localeCompare(a.frontmatter.date);
        });

      if (candidates.length === 0) {
        console.log("No eligible moments to develop. Capture more moments with `lumis moment` first.");
        return;
      }

      const top = candidates.slice(0, 5);
      console.log("Top moments ready for development:\n");
      for (const m of top) {
        const titleMatch = m.content.match(/^#\s+(.+)$/m);
        const title = titleMatch?.[1] ?? m.filename.replace(/\.md$/, "");
        console.log(`  ${m.frontmatter.date} — ${title} (${m.frontmatter["story-potential"]} potential)`);
      }
      console.log("\nUse the /story-craft skill in Claude Code for the full guided conversation.");
    }
    return;
  }

  // Practice mode (default)
  const candidates = moments
    .filter((m) =>
      (m.frontmatter["story-potential"] === "high" || m.frontmatter["story-potential"] === "medium") &&
      (m.frontmatter["story-status"] === "captured" || m.frontmatter["story-status"] === "exploring"),
    )
    .sort((a, b) => {
      const potentialOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const potA = potentialOrder[a.frontmatter["story-potential"]] ?? 2;
      const potB = potentialOrder[b.frontmatter["story-potential"]] ?? 2;
      if (potA !== potB) return potA - potB;
      return b.frontmatter.date.localeCompare(a.frontmatter.date);
    });

  if (candidates.length === 0) {
    console.log("No eligible moments to practice with. Capture more moments first.");
    return;
  }

  const chosen = candidates[0];
  const titleMatch = chosen.content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] ?? chosen.filename.replace(/\.md$/, "");

  // Determine least-practiced element
  const elements = ["Transformation", "5-Second Moment", "The Question", "The Stakes", "The Turns", "Opening Scene"];
  const elementCounts: Record<string, number> = {};
  for (const el of elements) elementCounts[el] = 0;

  const logPath = resolvePracticeLogPath(config);
  if (existsSync(logPath)) {
    const logContent = readFileSync(logPath, "utf-8");
    for (const el of elements) {
      const regex = new RegExp(`## \\d{4}-\\d{2}-\\d{2} — ${el.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
      const matches = logContent.match(regex);
      elementCounts[el] = matches?.length ?? 0;
    }
  }

  const sortedElements = [...elements].sort((a, b) => elementCounts[a] - elementCounts[b]);
  const chosenElement = sortedElements[0];

  console.log(`Story Craft Practice\n`);
  console.log(`Moment: ${title} (${chosen.frontmatter.date})`);
  console.log(`Themes: ${chosen.frontmatter.themes.join(", ")}`);
  if (chosen.fiveSecondMoment) {
    console.log(`5-Second Moment: ${chosen.fiveSecondMoment}`);
  }
  console.log(`\nExercise: ${chosenElement}`);
  console.log(`\nUse the /story-craft skill in Claude Code for the interactive exercise.`);
}
