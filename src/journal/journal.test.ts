import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { openDay, closeDay, setPriorities, insertReceipt, checkboxPriorities } from "./index.js";
import { buildReceipt, describeGap } from "./receipt.js";
import { writeDailyNote, readDailyNote, parseTasks } from "../vault/daily-notes.js";
import { readActiveTargets } from "../vault/targets.js";
import { readSignals } from "../vault/signals.js";
import { resolveGoalsPath } from "../vault/paths.js";
import { createTestConfig } from "../vault/test-helpers.js";
import type { LumisConfig } from "../types/config.js";

let config: LumisConfig;

function writeGoals(content: string): void {
  const path = resolveGoalsPath(config);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Receipt
// ---------------------------------------------------------------------------
describe("describeGap", () => {
  it("uses plain language for recent gaps", () => {
    expect(describeGap(null)).toBe("never");
    expect(describeGap(1)).toBe("yesterday");
    expect(describeGap(4)).toBe("4 days ago");
  });
});

describe("buildReceipt", () => {
  const stats = {
    lastEntryDate: "2026-08-15",
    daysSinceLastEntry: 4,
    currentStreak: 0,
    longestStreak: 3,
    totalEntries: 12,
  };

  it("leads with the gap and the streak", () => {
    const receipt = buildReceipt({ stats, carried: [], targets: [] });
    expect(receipt).toContain("Last entry: 4 days ago");
    expect(receipt).toContain("streak 0");
    expect(receipt).toContain("longest 3");
  });

  it("says so on a first entry rather than showing a zero gap", () => {
    const receipt = buildReceipt({
      stats: { lastEntryDate: null, daysSinceLastEntry: null, currentStreak: 0, longestStreak: 0, totalEntries: 0 },
      carried: [],
      targets: [],
    });
    expect(receipt).toContain("First entry.");
    expect(receipt).not.toContain("Last entry");
  });

  it("lists carried tasks with their age", () => {
    const carried = parseTasks("- [ ] draft the post (moved 6 days)");
    const receipt = buildReceipt({ stats, carried, targets: [] });
    expect(receipt).toContain("**Carried over**");
    expect(receipt).toContain("- [ ] draft the post (moved 6 days)");
  });

  it("lists only overdue targets", () => {
    const targets = [
      { text: "LinkedIn post", cadence: "weekly" as const, times: null, last: "2026-04-21", goalTags: [], done: false, raw: "", daysSince: 118, overdue: true, hits: null },
      { text: "Fine one", cadence: "weekly" as const, times: null, last: "2026-08-18", goalTags: [], done: false, raw: "", daysSince: 1, overdue: false, hits: null },
    ];
    const receipt = buildReceipt({ stats, carried: [], targets });
    expect(receipt).toContain("LinkedIn post — 118 days (weekly)");
    expect(receipt).not.toContain("Fine one");
  });

  it("says plainly when there is nothing outstanding", () => {
    expect(buildReceipt({ stats, carried: [], targets: [] })).toContain("Nothing carried over. Nothing overdue.");
  });
});

// ---------------------------------------------------------------------------
// Note assembly
// ---------------------------------------------------------------------------
describe("insertReceipt", () => {
  it("puts the receipt under the title, above the first section", () => {
    const out = insertReceipt("# Title\n\n## Morning\ncontent", "## Where you are\nfacts");
    expect(out.indexOf("Where you are")).toBeLessThan(out.indexOf("## Morning"));
    expect(out.indexOf("# Title")).toBeLessThan(out.indexOf("Where you are"));
  });

  it("appends when the note has no sections", () => {
    expect(insertReceipt("# Title", "## Where you are")).toContain("## Where you are");
  });
});

describe("checkboxPriorities", () => {
  const template = "### Top 3 Priorities\n1.\n2.\n3.\n\n### Grateful for\n-";

  it("replaces the numbered list with empty checkboxes", () => {
    const out = checkboxPriorities(template);
    expect(out).toContain("- [ ]");
    expect(out).not.toContain("1.");
    expect(out).toContain("### Grateful for");
  });

  it("fills in supplied priorities", () => {
    const out = checkboxPriorities(template, ["ship the post", "call Kevin"]);
    expect(out).toContain("- [ ] ship the post");
    expect(out).toContain("- [ ] call Kevin");
  });

  it("leaves a note without the heading alone", () => {
    expect(checkboxPriorities("# Just a title")).toBe("# Just a title");
  });
});

// ---------------------------------------------------------------------------
// openDay
// ---------------------------------------------------------------------------
describe("openDay", () => {
  it("counts today toward the streak", () => {
    expect(openDay(config, "2026-08-19").stats.currentStreak).toBe(1);
  });

  it("extends a streak from yesterday", () => {
    writeDailyNote(config, "2026-08-17", "# x");
    writeDailyNote(config, "2026-08-18", "# x");
    expect(openDay(config, "2026-08-19").stats.currentStreak).toBe(3);
  });

  it("still reports the true gap after a lapse", () => {
    writeDailyNote(config, "2026-08-15", "# x");
    const result = openDay(config, "2026-08-19");
    expect(result.stats.daysSinceLastEntry).toBe(4);
    expect(result.stats.currentStreak).toBe(1);
  });

  it("creates the note and the folder on a cold vault", () => {
    const result = openDay(config, "2026-08-19");
    expect(result.created).toBe(true);
    expect(result.note.path.endsWith("2026-08-19.md")).toBe(true);
    expect(result.note.content).toContain("## Where you are");
    expect(result.note.content).toContain("First entry.");
  });

  it("is idempotent — a second run does not overwrite", () => {
    openDay(config, "2026-08-19");
    writeDailyNote(config, "2026-08-19", "# edited by hand");

    const result = openDay(config, "2026-08-19");
    expect(result.created).toBe(false);
    expect(result.note.content).toBe("# edited by hand");
  });

  it("carries unfinished tasks forward and ages them by the real gap", () => {
    writeDailyNote(config, "2026-08-16", "- [ ] draft the post\n- [x] already done");

    const result = openDay(config, "2026-08-19");
    expect(result.gapDays).toBe(3);
    expect(result.carried.map((t) => t.text)).toEqual(["draft the post"]);
    expect(result.note.content).toContain("- [ ] draft the post (moved 3 days)");
    expect(result.note.content).not.toContain("already done");
  });

  it("compounds the age across repeated skips", () => {
    writeDailyNote(config, "2026-08-16", "- [ ] draft the post (moved 6 days)");
    const result = openDay(config, "2026-08-19");
    expect(result.note.content).toContain("(moved 9 days)");
  });

  it("surfaces overdue targets from Goals.md", () => {
    writeGoals("# Goals\n\n## Active Targets\n- [ ] LinkedIn post `cadence:weekly` `last:2026-04-21`\n");
    const result = openDay(config, "2026-08-19");
    expect(result.note.content).toContain("**Targets going quiet**");
    expect(result.note.content).toContain("LinkedIn post");
  });

  it("emits a journal_entry signal and a session line", () => {
    writeDailyNote(config, "2026-08-16", "- [ ] carried task");
    openDay(config, "2026-08-19");

    const signals = readSignals(config).filter((s) => s.type === "journal_entry");
    expect(signals).toHaveLength(1);
    expect(signals[0].data).toMatchObject({ date: "2026-08-19", run: "morning", gapDays: 3, tasksCarried: 1 });
  });

  it("uses the vault's Daily Note template when present", () => {
    const path = `${config.vaultPath}/Templates/Daily Note.md`;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "---\ndate: {{date}}\n---\n\n# {{date:dddd, MMMM D, YYYY}}\n\n## Morning\n", "utf-8");

    const result = openDay(config, "2026-08-19");
    expect(result.note.content).toContain("date: 2026-08-19");
    expect(result.note.content).toContain("# Wednesday, August 19, 2026");
  });
});

// ---------------------------------------------------------------------------
// setPriorities / closeDay
// ---------------------------------------------------------------------------
describe("setPriorities", () => {
  it("writes priorities as parseable tasks", () => {
    openDay(config, "2026-08-19");
    const note = setPriorities(config, "2026-08-19", ["ship the post", "call Kevin"]);
    expect(note.tasks.map((t) => t.text)).toContain("ship the post");
  });

  it("refuses when the day was never opened", () => {
    expect(() => setPriorities(config, "2026-08-19", ["x"])).toThrow(/morning pass/);
  });
});

describe("closeDay", () => {
  beforeEach(() => {
    openDay(config, "2026-08-19");
    setPriorities(config, "2026-08-19", ["ship the post", "call Kevin"]);
  });

  it("checks off completed tasks and leaves the rest open", () => {
    const result = closeDay(config, "2026-08-19", ["ship the post"]);
    expect(result.open.map((t) => t.text)).toEqual(["call Kevin"]);
    expect(readDailyNote(config, "2026-08-19")?.content).toContain("- [x] ship the post");
  });

  it("reports completions that matched no task", () => {
    const result = closeDay(config, "2026-08-19", ["something I never wrote down"]);
    expect(result.unmatched).toEqual(["something I never wrote down"]);
  });

  it("emits an evening signal", () => {
    closeDay(config, "2026-08-19", ["ship the post"]);
    const evening = readSignals(config).filter((s) => s.type === "journal_entry" && s.data.run === "evening");
    expect(evening).toHaveLength(1);
    expect(evening[0].data).toMatchObject({ tasksCompleted: 1, tasksOpen: 1 });
  });

  it("refuses when the day was never opened", () => {
    expect(() => closeDay(config, "2026-08-20", [])).toThrow(/morning pass/);
  });

  it("stamps a target when a tagged task is completed", () => {
    writeGoals("# Goals\n\n## Active Targets\n- [ ] LinkedIn post `cadence:weekly` `last:2026-04-21` #goal/visibility\n");
    setPriorities(config, "2026-08-19", ["publish the essay #goal/visibility"]);

    const result = closeDay(config, "2026-08-19", ["publish the essay #goal/visibility"]);
    expect(result.touchedTargets).toEqual(["LinkedIn post"]);
    expect(readActiveTargets(config)[0].last).toBe("2026-08-19");
    expect(readSignals(config).some((s) => s.type === "target_touched")).toBe(true);
  });

  it("refuses to stamp when one tag matches several targets", () => {
    // Over-stamping would mark a target fresh that nothing actually moved
    writeGoals(
      "# Goals\n\n## Active Targets\n" +
      "- [ ] Publish on LinkedIn `cadence:weekly` `last:2026-04-21` #goal/visibility\n" +
      "- [ ] Write a long-form piece `cadence:monthly` `last:2026-07-16` #goal/visibility\n",
    );
    setPriorities(config, "2026-08-19", ["ship the post #goal/visibility"]);

    const result = closeDay(config, "2026-08-19", ["ship the post #goal/visibility"]);
    expect(result.touchedTargets).toEqual([]);
    expect(result.ambiguousTags).toEqual(["#goal/visibility"]);

    const targets = readActiveTargets(config);
    expect(targets[0].last).toBe("2026-04-21");
    expect(targets[1].last).toBe("2026-07-16");
  });

  it("stamps when each target has its own tag", () => {
    writeGoals(
      "# Goals\n\n## Active Targets\n" +
      "- [ ] Publish on LinkedIn `cadence:weekly` `last:2026-04-21` #goal/linkedin\n" +
      "- [ ] Write a long-form piece `cadence:monthly` `last:2026-07-16` #goal/longform\n",
    );
    setPriorities(config, "2026-08-19", ["ship the post #goal/linkedin"]);

    const result = closeDay(config, "2026-08-19", ["ship the post #goal/linkedin"]);
    expect(result.touchedTargets).toEqual(["Publish on LinkedIn"]);
    expect(result.ambiguousTags).toEqual([]);
    expect(readActiveTargets(config)[1].last).toBe("2026-07-16");
  });

  it("leaves untagged targets alone", () => {
    writeGoals("# Goals\n\n## Active Targets\n- [ ] LinkedIn post `cadence:weekly` `last:2026-04-21` #goal/visibility\n");
    const result = closeDay(config, "2026-08-19", ["ship the post"]);
    expect(result.touchedTargets).toEqual([]);
    expect(readActiveTargets(config)[0].last).toBe("2026-04-21");
  });
});
