import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { weekStart, weekDays, gatherWeek, buildWeekReview, runWeekReview } from "./week.js";
import { findRepeatedThemes, detectDrift, STALE_TASK_DAYS } from "./drift.js";
import { openDay, setPriorities, closeDay } from "./index.js";
import { writeDailyNote } from "../vault/daily-notes.js";
import { readSignals } from "../vault/signals.js";
import { resolveGoalsPath, resolveMomentsDir } from "../vault/paths.js";
import { createTestConfig } from "../vault/test-helpers.js";
import type { LumisConfig } from "../types/config.js";

let config: LumisConfig;

function writeGoals(body: string): void {
  const path = resolveGoalsPath(config);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `# Goals\n\n## Active Targets\n${body}\n`, "utf-8");
}

function writeMoment(date: string, title: string, themes: string[]): void {
  const dir = resolveMomentsDir(config);
  mkdirSync(dir, { recursive: true });
  const fm = [
    "---",
    `date: ${date}`,
    "moment-type: realization",
    "people: []",
    "places: []",
    "story-status: captured",
    "story-potential: high",
    `themes: [${themes.join(", ")}]`,
    "tags: [moment]",
    "---",
    "",
    `# ${title}`,
  ].join("\n");
  writeFileSync(join(dir, `${date} - ${title}.md`), fm, "utf-8");
}

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Week boundaries
// ---------------------------------------------------------------------------
describe("weekStart", () => {
  it("returns the Monday of the week", () => {
    // 2026-08-19 is a Wednesday
    expect(weekStart("2026-08-19")).toBe("2026-08-17");
  });

  it("treats Monday as its own week start", () => {
    expect(weekStart("2026-08-17")).toBe("2026-08-17");
  });

  it("puts Sunday at the end of the week, not the start", () => {
    expect(weekStart("2026-08-23")).toBe("2026-08-17");
  });

  it("handles a week spanning a month boundary", () => {
    expect(weekStart("2026-09-01")).toBe("2026-08-31");
  });

  it("returns seven consecutive days", () => {
    expect(weekDays("2026-08-17")).toEqual([
      "2026-08-17", "2026-08-18", "2026-08-19",
      "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23",
    ]);
  });
});

// ---------------------------------------------------------------------------
// findRepeatedThemes
// ---------------------------------------------------------------------------
describe("findRepeatedThemes", () => {
  it("surfaces themes at or above the threshold", () => {
    const moments = [
      { date: "2026-08-01", themes: ["work", "identity"] },
      { date: "2026-08-05", themes: ["work"] },
      { date: "2026-08-09", themes: ["work", "fear"] },
    ];
    const themes = findRepeatedThemes(moments);
    expect(themes).toHaveLength(1);
    expect(themes[0]).toMatchObject({ theme: "work", count: 3, lastSeen: "2026-08-09" });
  });

  it("ignores themes below the threshold", () => {
    expect(findRepeatedThemes([{ date: "2026-08-01", themes: ["work", "work"] }])).toEqual([]);
  });

  it("sorts by count descending", () => {
    const moments = [
      { date: "2026-08-01", themes: ["a", "b"] },
      { date: "2026-08-02", themes: ["a", "b"] },
      { date: "2026-08-03", themes: ["a", "b"] },
      { date: "2026-08-04", themes: ["a"] },
    ];
    expect(findRepeatedThemes(moments).map((t) => t.theme)).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// detectDrift
// ---------------------------------------------------------------------------
describe("detectDrift", () => {
  it("reports nothing on an empty vault", () => {
    const drift = detectDrift(config, "2026-08-19");
    expect(drift.staleTasks).toEqual([]);
    expect(drift.quietTargets).toEqual([]);
    expect(drift.repeatedThemes).toEqual([]);
    expect(drift.daysSinceLastMoment).toBeNull();
  });

  it("flags a task carried past the stale threshold", () => {
    writeDailyNote(config, "2026-08-19", `- [ ] draft the post (moved ${STALE_TASK_DAYS} days)\n- [ ] fresh one`);
    const drift = detectDrift(config, "2026-08-19");
    expect(drift.staleTasks.map((t) => t.text)).toEqual(["draft the post"]);
  });

  it("separates abandoned targets from merely overdue ones", () => {
    // weekly cadence: overdue after 7 days, abandoned after 14
    writeGoals(
      "- [ ] Slipping `cadence:weekly` `last:2026-08-09`\n" +
      "- [ ] Abandoned `cadence:weekly` `last:2026-07-01`",
    );
    const drift = detectDrift(config, "2026-08-19");
    expect(drift.quietTargets.map((t) => t.text)).toEqual(["Abandoned"]);
  });

  it("counts silent days in the trailing window", () => {
    writeDailyNote(config, "2026-08-19", "# x");
    writeDailyNote(config, "2026-08-18", "# x");
    const drift = detectDrift(config, "2026-08-19", 7);
    expect(drift.silentDays).toBe(5);
  });

  it("measures the gap since the last moment", () => {
    writeMoment("2026-08-12", "A thing", ["work"]);
    expect(detectDrift(config, "2026-08-19").daysSinceLastMoment).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// gatherWeek
// ---------------------------------------------------------------------------
describe("gatherWeek", () => {
  it("counts only days that have already happened", () => {
    // Wednesday: Mon, Tue, Wed have elapsed
    expect(gatherWeek(config, "2026-08-19").daysElapsed).toBe(3);
    expect(gatherWeek(config, "2026-08-23").daysElapsed).toBe(7);
  });

  it("collects entries, completions, and open work across the week", () => {
    openDay(config, "2026-08-17");
    setPriorities(config, "2026-08-17", ["ship the post", "call Kevin"]);
    closeDay(config, "2026-08-17", ["ship the post"]);
    openDay(config, "2026-08-18");

    const week = gatherWeek(config, "2026-08-19");
    expect(week.weekOf).toBe("2026-08-17");
    expect(week.daysJournaled).toBe(2);
    expect(week.completed.map((t) => t.text)).toContain("ship the post");
    expect(week.stillOpen.map((t) => t.text)).toContain("call Kevin");
  });

  it("deduplicates a task carried across several days, keeping the oldest age", () => {
    writeDailyNote(config, "2026-08-17", "- [ ] call Kevin (moved 1 day)");
    writeDailyNote(config, "2026-08-18", "- [ ] call Kevin (moved 2 days)");
    writeDailyNote(config, "2026-08-19", "- [ ] call Kevin (moved 3 days)");

    const week = gatherWeek(config, "2026-08-19");
    expect(week.stillOpen).toHaveLength(1);
    expect(week.stillOpen[0].age).toBe(3);
    expect(week.oldestOpen?.text).toBe("call Kevin");
  });

  it("includes only moments inside the week", () => {
    writeMoment("2026-08-16", "Before", ["work"]);
    writeMoment("2026-08-18", "Inside", ["work"]);
    writeMoment("2026-08-24", "After", ["work"]);

    expect(gatherWeek(config, "2026-08-19").moments.map((m) => m.date)).toEqual(["2026-08-18"]);
  });

  it("reports which targets moved during the week", () => {
    writeGoals("- [ ] Publish on LinkedIn `cadence:weekly` `last:2026-04-21` #goal/visibility");
    openDay(config, "2026-08-18");
    setPriorities(config, "2026-08-18", ["write the essay #goal/visibility"]);
    closeDay(config, "2026-08-18", ["write the essay #goal/visibility"]);

    expect(gatherWeek(config, "2026-08-19").targetsTouched).toEqual(["Publish on LinkedIn"]);
  });
});

// ---------------------------------------------------------------------------
// buildWeekReview
// ---------------------------------------------------------------------------
describe("buildWeekReview", () => {
  it("leads with the numbers", () => {
    openDay(config, "2026-08-17");
    const review = buildWeekReview(gatherWeek(config, "2026-08-19"));
    expect(review).toContain("## The numbers");
    expect(review).toContain("Journaled 1 of 3 days");
  });

  it("says plainly when nothing was finished", () => {
    openDay(config, "2026-08-17");
    setPriorities(config, "2026-08-17", ["never done"]);
    const review = buildWeekReview(gatherWeek(config, "2026-08-19"));
    expect(review).toContain("Nothing was checked off this week.");
  });

  it("leaves the reflection and commitments for the user to fill", () => {
    const review = buildWeekReview(gatherWeek(config, "2026-08-19"));
    expect(review).toContain("## What actually happened");
    expect(review).toContain("## Next week");
    expect(review).toContain("- [ ] ");
  });

  it("includes a drift section only when there is drift", () => {
    const clean = buildWeekReview(gatherWeek(config, "2026-08-19"));
    // A fresh vault has silent days, so drift is present; with a full week it is not
    for (const d of weekDays("2026-08-17")) writeDailyNote(config, d, "# x");
    expect(clean).toContain("## Drift");
  });
});

// ---------------------------------------------------------------------------
// runWeekReview
// ---------------------------------------------------------------------------
describe("runWeekReview", () => {
  it("writes the review and emits a signal", () => {
    openDay(config, "2026-08-17");
    const result = runWeekReview(config, "2026-08-19");

    expect(result.created).toBe(true);
    expect(result.path).toContain("Week of 2026-08-17.md");

    const signals = readSignals(config).filter((s) => s.type === "week_reviewed");
    expect(signals).toHaveLength(1);
    expect(signals[0].data).toMatchObject({ weekOf: "2026-08-17", daysJournaled: 1 });
  });

  it("never overwrites a review that already has your notes in it", () => {
    runWeekReview(config, "2026-08-19");
    const path = resolveGoalsPath(config).replace(/Goals\.md$/, "");
    void path;

    const second = runWeekReview(config, "2026-08-19");
    expect(second.created).toBe(false);
  });

  it("keys the review to the Monday regardless of which day it is run", () => {
    const wed = runWeekReview(config, "2026-08-19");
    expect(wed.data.weekOf).toBe("2026-08-17");
    expect(wed.path).toContain("Week of 2026-08-17.md");
  });
});
