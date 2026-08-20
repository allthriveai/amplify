import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync } from "node:fs";
import {
  parseTasks,
  formatTask,
  carryForwardTasks,
  setTasksDone,
  computeStreak,
  daysBetween,
  toDateKey,
  parseDateKey,
  formatDate,
  renderTemplate,
  normalizeDateKey,
  listDailyNoteDates,
  findPreviousDailyNote,
  writeDailyNote,
  readDailyNote,
} from "./daily-notes.js";
import { createTestConfig } from "./test-helpers.js";
import type { LumisConfig } from "../types/config.js";

let config: LumisConfig;

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
describe("date helpers", () => {
  it("parses a date key as local midnight, not UTC", () => {
    const d = parseDateKey("2026-08-19");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(19);
  });

  it("round-trips through toDateKey regardless of timezone", () => {
    expect(toDateKey(parseDateKey("2026-01-01"))).toBe("2026-01-01");
    expect(toDateKey(parseDateKey("2026-12-31"))).toBe("2026-12-31");
  });

  it("counts whole days between keys", () => {
    expect(daysBetween("2026-08-19", "2026-08-20")).toBe(1);
    expect(daysBetween("2026-08-19", "2026-08-19")).toBe(0);
    expect(daysBetween("2026-08-20", "2026-08-19")).toBe(-1);
  });

  it("counts across a month boundary", () => {
    expect(daysBetween("2026-01-28", "2026-02-03")).toBe(6);
  });

  it("counts across a DST transition", () => {
    // US DST begins 2026-03-08; a naive ms/86400000 would give 0.958 days
    expect(daysBetween("2026-03-07", "2026-03-08")).toBe(1);
    expect(daysBetween("2026-03-01", "2026-03-31")).toBe(30);
  });

  it("formats moment-style tokens", () => {
    const d = parseDateKey("2026-08-19");
    expect(formatDate(d, "dddd, MMMM D, YYYY")).toBe("Wednesday, August 19, 2026");
    expect(formatDate(d, "YYYY-MM-DD")).toBe("2026-08-19");
  });

  it("normalizes a YAML Date to the day the file actually says", () => {
    // gray-matter parses `date: 2026-02-23` into a Date at UTC midnight.
    // Local getters would report Feb 22 west of UTC.
    expect(normalizeDateKey(new Date("2026-02-23"))).toBe("2026-02-23");
    expect(normalizeDateKey(new Date("2026-01-01"))).toBe("2026-01-01");
    expect(normalizeDateKey(new Date("2026-12-31"))).toBe("2026-12-31");
  });

  it("normalizes date strings and full timestamps", () => {
    expect(normalizeDateKey("2026-08-19")).toBe("2026-08-19");
    expect(normalizeDateKey("2026-08-19T14:00:00Z")).toBe("2026-08-19");
    expect(normalizeDateKey("  2026-08-19  ")).toBe("2026-08-19");
  });

  it("returns null for unusable values", () => {
    expect(normalizeDateKey(undefined)).toBeNull();
    expect(normalizeDateKey(null)).toBeNull();
    expect(normalizeDateKey("not a date")).toBeNull();
    expect(normalizeDateKey(new Date("nonsense"))).toBeNull();
    expect(normalizeDateKey(42)).toBeNull();
  });

  it("renders Obsidian template placeholders", () => {
    const out = renderTemplate("---\ndate: {{date}}\n---\n# {{date:dddd, MMMM D, YYYY}}", "2026-08-19");
    expect(out).toContain("date: 2026-08-19");
    expect(out).toContain("# Wednesday, August 19, 2026");
  });
});

// ---------------------------------------------------------------------------
// parseTasks
// ---------------------------------------------------------------------------
describe("parseTasks", () => {
  it("parses open and done checkboxes", () => {
    const tasks = parseTasks("- [ ] write the post\n- [x] reply to Kevin");
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({ text: "write the post", done: false, age: 0 });
    expect(tasks[1]).toMatchObject({ text: "reply to Kevin", done: true });
  });

  it("reads the age marker and strips it from the text", () => {
    const [task] = parseTasks("- [ ] draft the post (moved 6 days)");
    expect(task.text).toBe("draft the post");
    expect(task.age).toBe(6);
  });

  it("handles a singular day marker", () => {
    expect(parseTasks("- [ ] ship it (moved 1 day)")[0].age).toBe(1);
  });

  it("skips empty template placeholders", () => {
    expect(parseTasks("- [ ] \n- [ ]\n- [ ] real task")).toHaveLength(1);
  });

  it("collects #goal tags", () => {
    const [task] = parseTasks("- [ ] publish essay #goal/visibility");
    expect(task.goalTags).toEqual(["#goal/visibility"]);
  });

  it("ignores non-task lines", () => {
    expect(parseTasks("# Heading\nsome prose\n- a bullet")).toEqual([]);
  });

  it("accepts asterisk bullets and indentation", () => {
    expect(parseTasks("  * [ ] nested task")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// formatTask / carryForwardTasks
// ---------------------------------------------------------------------------
describe("formatTask", () => {
  it("round-trips a task with an age marker", () => {
    const [task] = parseTasks("- [ ] draft the post (moved 6 days)");
    expect(formatTask(task)).toBe("- [ ] draft the post (moved 6 days)");
  });

  it("omits the marker for a fresh task", () => {
    const [task] = parseTasks("- [ ] brand new");
    expect(formatTask(task)).toBe("- [ ] brand new");
  });
});

describe("carryForwardTasks", () => {
  it("drops completed tasks", () => {
    const tasks = parseTasks("- [x] done\n- [ ] not done");
    expect(carryForwardTasks(tasks, 1).map((t) => t.text)).toEqual(["not done"]);
  });

  it("ages tasks by the actual gap, not by one", () => {
    const tasks = parseTasks("- [ ] draft the post (moved 6 days)");
    expect(carryForwardTasks(tasks, 3)[0].age).toBe(9);
  });

  it("treats a zero or negative gap as one day", () => {
    const tasks = parseTasks("- [ ] task");
    expect(carryForwardTasks(tasks, 0)[0].age).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// setTasksDone
// ---------------------------------------------------------------------------
describe("setTasksDone", () => {
  it("checks a matching task off", () => {
    const out = setTasksDone("- [ ] write the post\n- [ ] other", ["write the post"]);
    expect(out).toContain("- [x] write the post");
    expect(out).toContain("- [ ] other");
  });

  it("matches case-insensitively and ignores the age marker", () => {
    const out = setTasksDone("- [ ] Draft The Post (moved 6 days)", ["draft the post"]);
    expect(out).toBe("- [x] Draft The Post (moved 6 days)");
  });

  it("leaves the note untouched when nothing matches", () => {
    const input = "- [ ] write the post";
    expect(setTasksDone(input, ["something else"])).toBe(input);
  });

  it("preserves indentation", () => {
    expect(setTasksDone("  - [ ] nested", ["nested"])).toBe("  - [x] nested");
  });
});

// ---------------------------------------------------------------------------
// computeStreak
// ---------------------------------------------------------------------------
describe("computeStreak", () => {
  it("reports no history for an empty vault", () => {
    expect(computeStreak([], "2026-08-19")).toMatchObject({
      lastEntryDate: null,
      daysSinceLastEntry: null,
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
    });
  });

  it("counts a run ending today", () => {
    const stats = computeStreak(["2026-08-17", "2026-08-18", "2026-08-19"], "2026-08-19");
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  it("keeps the streak alive when the last entry was yesterday", () => {
    expect(computeStreak(["2026-08-17", "2026-08-18"], "2026-08-19").currentStreak).toBe(2);
  });

  it("breaks the streak after a full missed day", () => {
    expect(computeStreak(["2026-08-16", "2026-08-17"], "2026-08-19").currentStreak).toBe(0);
  });

  it("remembers the longest run even after a lapse", () => {
    const dates = ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-19"];
    const stats = computeStreak(dates, "2026-08-19");
    expect(stats.longestStreak).toBe(4);
    expect(stats.currentStreak).toBe(1);
  });

  it("excludes today when reporting the previous entry", () => {
    const stats = computeStreak(["2026-08-15", "2026-08-19"], "2026-08-19");
    expect(stats.lastEntryDate).toBe("2026-08-15");
    expect(stats.daysSinceLastEntry).toBe(4);
  });

  it("ignores duplicates and future dates", () => {
    const stats = computeStreak(["2026-08-19", "2026-08-19", "2026-09-01"], "2026-08-19");
    expect(stats.currentStreak).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Daily note discovery
// ---------------------------------------------------------------------------
describe("daily note discovery", () => {
  it("returns nothing when the folder has never existed", () => {
    expect(listDailyNoteDates(config)).toEqual([]);
    expect(findPreviousDailyNote(config, "2026-08-19")).toBeNull();
  });

  it("creates the daily notes folder on first write", () => {
    writeDailyNote(config, "2026-08-19", "# hi");
    expect(listDailyNoteDates(config)).toEqual(["2026-08-19"]);
  });

  it("writes to the requested calendar day", () => {
    const path = writeDailyNote(config, "2026-08-19", "# hi");
    expect(path.endsWith("2026-08-19.md")).toBe(true);
  });

  it("finds the most recent prior note, skipping today", () => {
    writeDailyNote(config, "2026-08-10", "- [ ] old");
    writeDailyNote(config, "2026-08-17", "- [ ] recent");
    writeDailyNote(config, "2026-08-19", "- [ ] today");

    const previous = findPreviousDailyNote(config, "2026-08-19");
    expect(previous?.date).toBe("2026-08-17");
    expect(previous?.tasks[0].text).toBe("recent");
  });

  it("ignores non-daily files in the folder", () => {
    writeDailyNote(config, "2026-08-19", "# hi");
    writeDailyNote(config, "2026-08-18", "# hi");
    expect(readDailyNote(config, "2026-08-18")?.date).toBe("2026-08-18");
    expect(readDailyNote(config, "2026-01-01")).toBeNull();
  });
});
