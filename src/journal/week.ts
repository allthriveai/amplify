import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { DailyNote, Task, WeekData, WeekMoment } from "../types/journal.js";
import { readMoments } from "../vault/reader.js";
import { readTargetStatus } from "../vault/targets.js";
import { readSignals, signalDay, emitSignal, signalId } from "../vault/signals.js";
import { appendSessionEntry, formatSessionTime } from "../vault/memory.js";
import { resolveReviewPath } from "../vault/paths.js";
import {
  readDailyNote,
  parseDateKey,
  toDateKey,
  daysBetween,
  shiftDateKey,
  todayKey,
  formatDate,
  formatTask,
  normalizeDateKey,
} from "../vault/daily-notes.js";
import { detectDrift } from "./drift.js";

export * from "./drift.js";

/** The Monday that starts the week containing `date` */
export function weekStart(date: string): string {
  const d = parseDateKey(date);
  // getDay(): 0 = Sunday. Shift so Monday is 0.
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toDateKey(d);
}

/** The seven date keys of the week starting at `weekOf` */
export function weekDays(weekOf: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDateKey(weekOf, i));
}

/** Gather everything the weekly reckoning draws on */
export function gatherWeek(config: LumisConfig, date: string = todayKey()): WeekData {
  const weekOf = weekStart(date);
  const days = weekDays(weekOf);
  const weekEnd = days[6];

  // A week in progress is judged on the days that have actually happened
  const daysElapsed = Math.min(7, Math.max(1, daysBetween(weekOf, date) + 1));
  const elapsed = days.slice(0, daysElapsed);

  const entries = elapsed
    .map((d) => readDailyNote(config, d))
    .filter((n): n is DailyNote => n !== null);

  const allTasks = entries.flatMap((n) => n.tasks);
  const completed = allTasks.filter((t) => t.done);

  // The same unfinished task appears in several notes; keep the latest instance
  const openByText = new Map<string, Task>();
  for (const task of allTasks.filter((t) => !t.done)) {
    const key = task.text.toLowerCase();
    const existing = openByText.get(key);
    if (!existing || task.age > existing.age) openByText.set(key, task);
  }
  const stillOpen = [...openByText.values()].sort((a, b) => b.age - a.age);

  const moments: WeekMoment[] = readMoments(config)
    .flatMap((m) => {
      // Frontmatter dates arrive as Date objects from YAML, not strings
      const date = normalizeDateKey(m.frontmatter.date);
      if (date === null || date < weekOf || date > weekEnd) return [];
      return [{
        filename: m.filename,
        date,
        themes: m.frontmatter.themes ?? [],
        momentType: m.frontmatter["moment-type"] ?? "unknown",
        storyPotential: m.frontmatter["story-potential"] ?? "unknown",
      }];
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const targetsTouched = [
    ...new Set(
      readSignals(config)
        .filter((s) => s.type === "target_touched")
        .filter((s) => {
          // Group on the journal day the target was stamped against, not on when
          // the signal happened to be written — closing out Monday on Friday still
          // belongs to Monday. Signals written before `date` existed fall back to
          // the timestamp.
          const day = signalDay(s);
          return day >= weekOf && day <= weekEnd;
        })
        .map((s) => (s.data as { target: string }).target),
    ),
  ];

  return {
    weekOf,
    weekEnd,
    daysElapsed,
    daysJournaled: entries.length,
    entries,
    completed,
    stillOpen,
    oldestOpen: stillOpen[0] ?? null,
    moments,
    targets: readTargetStatus(config, date),
    targetsTouched,
    drift: detectDrift(config, date),
  };
}

/**
 * The review document. Numbers first, no narrative — the conversation that
 * follows is where meaning gets made, and it belongs to the user, not to Lumis.
 */
export function buildWeekReview(data: WeekData): string {
  const start = formatDate(parseDateKey(data.weekOf), "MMMM D");
  const end = formatDate(parseDateKey(data.weekEnd), "MMMM D, YYYY");
  const lines: string[] = [];

  lines.push(
    "---",
    `date: ${data.weekEnd}`,
    `week: ${data.weekOf}`,
    "tags: [review, weekly]",
    "---",
    "",
    `# Week of ${start} – ${end}`,
    "",
    "## The numbers",
    `- Journaled ${data.daysJournaled} of ${data.daysElapsed} days`,
    `- ${data.completed.length} tasks done, ${data.stillOpen.length} still open`,
    `- ${data.moments.length} moment${data.moments.length === 1 ? "" : "s"} captured`,
    `- ${data.targetsTouched.length} of ${data.targets.length} targets moved`,
    "",
  );

  lines.push("## What you finished");
  if (data.completed.length === 0) {
    lines.push("Nothing was checked off this week.");
  } else {
    for (const task of data.completed) lines.push(`- ${task.text}`);
  }
  lines.push("");

  lines.push("## What you didn't");
  if (data.stillOpen.length === 0) {
    lines.push("Nothing left open.");
  } else {
    for (const task of data.stillOpen) lines.push(formatTask(task));
  }
  lines.push("");

  lines.push("## Targets");
  if (data.targets.length === 0) {
    lines.push("No active targets. Run `/goals` to set them.");
  } else {
    for (const target of data.targets) {
      const moved = data.targetsTouched.includes(target.text);
      const state = moved
        ? "moved this week"
        : target.daysSince === null
          ? "never touched"
          : `${target.daysSince} days quiet`;
      lines.push(`- ${target.text} — ${state}`);
    }
  }
  lines.push("");

  if (data.moments.length > 0) {
    lines.push("## Moments");
    for (const moment of data.moments) {
      const themes = moment.themes.length > 0 ? ` — ${moment.themes.join(", ")}` : "";
      lines.push(`- [[${moment.filename.replace(/\.md$/, "")}]]${themes}`);
    }
    lines.push("");
  }

  const { drift } = data;
  const driftLines: string[] = [];
  if (drift.staleTasks.length > 0) {
    driftLines.push(
      `- ${drift.staleTasks.length} task${drift.staleTasks.length === 1 ? " has" : "s have"} been carried a week or more: ` +
        drift.staleTasks.map((t) => `"${t.text}" (${t.age} days)`).join(", "),
    );
  }
  if (drift.quietTargets.length > 0) {
    driftLines.push(
      `- Abandoned, not slipping: ${drift.quietTargets.map((t) => t.text).join(", ")}`,
    );
  }
  if (drift.repeatedThemes.length > 0) {
    driftLines.push(
      `- Themes you keep returning to: ` +
        drift.repeatedThemes.map((t) => `${t.theme} (${t.count})`).join(", "),
    );
  }
  if (drift.silentDays > 0) {
    driftLines.push(`- ${drift.silentDays} of the last ${drift.windowDays} days had no entry`);
  }

  if (driftLines.length > 0) {
    lines.push("## Drift", ...driftLines, "");
  }

  lines.push(
    "## What actually happened",
    "_Your words, not Lumis's._",
    "",
    "",
    "## Next week",
    "_Three commitments. Fewer if three is a lie._",
    "- [ ] ",
    "- [ ] ",
    "- [ ] ",
    "",
  );

  return lines.join("\n");
}

export interface WeekReviewResult {
  path: string;
  created: boolean;
  data: WeekData;
  content: string;
}

/**
 * Write the week's review. Idempotent: an existing review is read back rather
 * than overwritten, so notes written into it are never lost.
 */
export function runWeekReview(config: LumisConfig, date: string = todayKey()): WeekReviewResult {
  const data = gatherWeek(config, date);
  const path = resolveReviewPath(config, data.weekOf);

  if (existsSync(path)) {
    return { path, created: false, data, content: readFileSync(path, "utf-8") };
  }

  const content = buildWeekReview(data);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, "utf-8");

  emitSignal(config, {
    id: signalId(),
    type: "week_reviewed",
    timestamp: new Date().toISOString(),
    data: {
      weekOf: data.weekOf,
      path,
      daysJournaled: data.daysJournaled,
      tasksCompleted: data.completed.length,
      tasksOpen: data.stillOpen.length,
      momentsCaptured: data.moments.length,
      targetsMoved: data.targetsTouched.length,
    },
  });

  appendSessionEntry(config, {
    time: formatSessionTime(),
    action: "week reviewed",
    detail: `${data.weekOf} — ${data.daysJournaled}/${data.daysElapsed} days journaled, ${data.completed.length} done`,
  });

  return { path, created: true, data, content };
}
