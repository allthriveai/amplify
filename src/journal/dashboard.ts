import type { Task, TargetStatus, Drift, WeekData } from "../types/journal.js";
import { parseDateKey, formatDate } from "../vault/dates.js";
import type { OpenDayResult } from "./index.js";

/**
 * Pre-rendered views for chat clients.
 *
 * Tools normally hand back JSON and let the model narrate it, which makes the
 * same information look different every morning. These render the view once so
 * the daily picture is identical each time and can be shown verbatim.
 */

/** A task carried this long gets a visual marker */
const WARN_AGE = 5;
/** Column where the age/duration column starts */
const COL = 30;

function row(label: string, right: string, mark = ""): string {
  const text = label.length > COL - 2 ? `${label.slice(0, COL - 3)}…` : label;
  return ` • ${text.padEnd(COL)}${right}${mark}`;
}

function taskRow(task: Task): string {
  if (task.age === 0) return ` • ${task.text}`;
  const age = `${task.age} day${task.age === 1 ? "" : "s"}`;
  return row(task.text, age, task.age >= WARN_AGE ? " ⚠" : "");
}

function targetRow(target: TargetStatus): string {
  return row(target.text, target.daysSince === null ? "never" : `${target.daysSince}d`);
}

function driftRows(drift: Drift): string[] {
  const rows: string[] = [];
  if (drift.silentDays > 0) {
    rows.push(` • ${drift.silentDays} of the last ${drift.windowDays} days had no entry`);
  }
  if (drift.daysSinceLastMoment !== null && drift.daysSinceLastMoment >= 14) {
    rows.push(` • ${drift.daysSinceLastMoment} days since your last moment`);
  }
  if (drift.repeatedThemes.length > 0) {
    const themes = drift.repeatedThemes.slice(0, 4).map((t) => `${t.theme} (${t.count})`).join(", ");
    rows.push(` • keeps coming up: ${themes}`);
  }
  return rows;
}

/** The daily picture, in one block */
export function renderDay(result: OpenDayResult): string {
  const { stats, carried, targets, drift, note } = result;
  const heading = formatDate(parseDateKey(note.date), "ddd MMM D");

  const lines: string[] = [
    `${heading} · streak ${stats.currentStreak} · best ${stats.longestStreak}`,
  ];

  if (stats.lastEntryDate === null) {
    lines.push("First entry.");
  } else if (stats.daysSinceLastEntry !== null && stats.daysSinceLastEntry > 1) {
    lines.push(`Last entry: ${stats.daysSinceLastEntry} days ago`);
  }

  const open = note.tasks.filter((t) => !t.done);
  const done = note.tasks.filter((t) => t.done);

  if (carried.length > 0) {
    lines.push("", "Carried over", ...carried.map(taskRow));
  }

  // On a reopened note, show what today already holds
  if (!result.created && (open.length > 0 || done.length > 0)) {
    if (done.length > 0) lines.push("", "Done today", ...done.map((t) => ` • ${t.text}`));
    const fresh = open.filter((t) => t.age === 0);
    if (fresh.length > 0) lines.push("", "Today", ...fresh.map(taskRow));
  }

  const quiet = targets.filter((t) => t.overdue);
  if (quiet.length > 0) {
    lines.push("", "Quiet targets", ...quiet.map(targetRow));
  }

  const drifts = driftRows(drift);
  if (drifts.length > 0) lines.push("", "Drift", ...drifts);

  if (carried.length === 0 && quiet.length === 0 && drifts.length === 0) {
    lines.push("", "Nothing carried over. Nothing overdue.");
  }

  return lines.join("\n");
}

/** The weekly picture, in one block */
export function renderWeek(data: WeekData): string {
  const start = formatDate(parseDateKey(data.weekOf), "MMM D");
  const end = formatDate(parseDateKey(data.weekEnd), "MMM D");

  const lines: string[] = [
    `Week of ${start} – ${end}`,
    ` • journaled ${data.daysJournaled} of ${data.daysElapsed} days`,
    ` • ${data.completed.length} done, ${data.stillOpen.length} open`,
    ` • ${data.moments.length} moment${data.moments.length === 1 ? "" : "s"} captured`,
    ` • ${data.targetsTouched.length} of ${data.targets.length} targets moved`,
  ];

  if (data.completed.length > 0) {
    lines.push("", "Finished", ...data.completed.map((t) => ` • ${t.text}`));
  }
  if (data.stillOpen.length > 0) {
    lines.push("", "Still open", ...data.stillOpen.map(taskRow));
  }

  if (data.targets.length > 0) {
    lines.push("", "Targets");
    for (const target of data.targets) {
      const moved = data.targetsTouched.includes(target.text);
      lines.push(moved ? row(target.text, "moved ✓") : targetRow(target));
    }
  }

  const drifts = driftRows(data.drift);
  const stale = data.drift.staleTasks;
  if (stale.length > 0) {
    drifts.unshift(` • carried over a week: ${stale.map((t) => `"${t.text}" (${t.age}d)`).join(", ")}`);
  }
  if (data.drift.quietTargets.length > 0) {
    drifts.unshift(` • abandoned, not slipping: ${data.drift.quietTargets.map((t) => t.text).join(", ")}`);
  }
  if (drifts.length > 0) lines.push("", "Drift", ...drifts);

  return lines.join("\n");
}
