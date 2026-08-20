import type { LumisConfig } from "../types/config.js";
import type { DailyNote, Task, JournalStats, TargetStatus, Drift } from "../types/journal.js";
import { emitSignal, signalId } from "../vault/signals.js";
import { appendSessionEntry, formatSessionTime } from "../vault/memory.js";
import { readTargetStatus, updateTargetLastTouched } from "../vault/targets.js";
import {
  carryForwardTasks,
  daysBetween,
  findPreviousDailyNote,
  parseTasks,
  readDailyNote,
  readDailyNoteTemplate,
  readJournalStats,
  listDailyNoteDates,
  computeStreak,
  renderTemplate,
  setTasksDone,
  todayKey,
  writeDailyNote,
  FALLBACK_TEMPLATE,
} from "../vault/daily-notes.js";
import { buildReceipt } from "./receipt.js";
import { detectDrift } from "./drift.js";

export * from "./receipt.js";
export * from "./drift.js";
export * from "./week.js";
export * from "./dashboard.js";

const PRIORITIES_HEADING = "### Top 3 Priorities";

/** Insert the receipt block ahead of the note body */
export function insertReceipt(content: string, receipt: string): string {
  const lines = content.split("\n");
  // Prefer the first H2, which puts the receipt directly under the title
  const anchor = lines.findIndex((l) => /^##\s/.test(l));

  if (anchor === -1) return `${content.trimEnd()}\n\n${receipt}\n`;

  return [...lines.slice(0, anchor), receipt, ...lines.slice(anchor)].join("\n");
}

/**
 * Swap the template's `1. 2. 3.` priority list for checkboxes so priorities
 * carry forward like any other task. Empty boxes are placeholders and are
 * ignored by the parser until they have text.
 */
export function checkboxPriorities(content: string, texts: string[] = []): string {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === PRIORITIES_HEADING);
  if (start === -1) return content;

  let end = start + 1;
  while (end < lines.length && !/^(#{2,3}\s|---)/.test(lines[end])) end++;

  const filled = texts.length > 0 ? texts : ["", "", ""];
  const boxes = filled.map((t) => `- [ ] ${t}`.trimEnd());

  return [...lines.slice(0, start + 1), ...boxes, "", ...lines.slice(end)].join("\n");
}

export interface OpenDayResult {
  /** False when the note already existed and was left untouched */
  created: boolean;
  note: DailyNote;
  stats: JournalStats;
  carried: Task[];
  targets: TargetStatus[];
  gapDays: number | null;
  receipt: string;
  /** Patterns across entries. Kept out of the note; the skill decides what to raise. */
  drift: Drift;
}

/**
 * Morning run. Creates today's note from the vault template, carries unfinished
 * tasks forward, and prepends the receipt. Idempotent: if the note already
 * exists it is read back rather than overwritten.
 */
export function openDay(config: LumisConfig, date: string = todayKey()): OpenDayResult {
  // Today counts toward the streak: opening the day is the act of journaling.
  // `lastEntryDate` still excludes today, so the gap stays honest.
  const stats = computeStreak([...listDailyNoteDates(config), date], date);
  const targets = readTargetStatus(config, date);
  const previous = findPreviousDailyNote(config, date);
  const gapDays = previous ? daysBetween(previous.date, date) : null;
  const carried = previous ? carryForwardTasks(previous.tasks, gapDays ?? 1) : [];

  const drift = detectDrift(config, date);

  const existing = readDailyNote(config, date);
  if (existing) {
    return {
      created: false,
      note: existing,
      stats,
      carried,
      targets,
      gapDays,
      receipt: buildReceipt({ stats, carried, targets }),
      drift,
    };
  }

  const receipt = buildReceipt({ stats, carried, targets });
  const template = readDailyNoteTemplate(config) ?? FALLBACK_TEMPLATE;

  let content = renderTemplate(template, date);
  content = checkboxPriorities(content);
  content = insertReceipt(content, receipt);

  const path = writeDailyNote(config, date, content);
  const note: DailyNote = { date, path, content, tasks: parseTasks(content) };

  emitSignal(config, {
    id: signalId(),
    type: "journal_entry",
    timestamp: new Date().toISOString(),
    data: {
      date,
      path,
      run: "morning",
      gapDays,
      tasksCarried: carried.length,
      tasksCompleted: 0,
      tasksOpen: note.tasks.filter((t) => !t.done).length,
      currentStreak: stats.currentStreak,
    },
  });

  appendSessionEntry(config, {
    time: formatSessionTime(),
    action: "journal opened",
    detail: `${date} — ${carried.length} carried, ${targets.filter((t) => t.overdue).length} targets overdue`,
  });

  return { created: true, note, stats, carried, targets, gapDays, receipt, drift };
}

/** Write the day's priorities into an existing note */
export function setPriorities(config: LumisConfig, date: string, texts: string[]): DailyNote {
  const note = readDailyNote(config, date);
  if (!note) throw new Error(`No daily note for ${date}. Run the morning pass first.`);

  const content = checkboxPriorities(note.content, texts);
  const path = writeDailyNote(config, date, content);
  return { date, path, content, tasks: parseTasks(content) };
}

export interface CloseDayResult {
  note: DailyNote;
  completed: string[];
  /** Completed task texts that matched no checkbox in the note */
  unmatched: string[];
  open: Task[];
  touchedTargets: string[];
  /** Tags that matched more than one target, so nothing was stamped for them */
  ambiguousTags: string[];
}

/**
 * Evening run. Checks off what got done, stamps any targets the completed work
 * served, and logs the day. Does not rewrite the note body — reflection prose is
 * written by the caller.
 */
export function closeDay(
  config: LumisConfig,
  date: string = todayKey(),
  completed: string[] = [],
): CloseDayResult {
  const note = readDailyNote(config, date);
  if (!note) throw new Error(`No daily note for ${date}. Run the morning pass first.`);

  const openBefore = note.tasks.filter((t) => !t.done).map((t) => t.text.toLowerCase());
  const unmatched = completed.filter((t) => !openBefore.includes(t.trim().toLowerCase()));

  const content = setTasksDone(note.content, completed);
  const path = writeDailyNote(config, date, content);
  const updated: DailyNote = { date, path, content, tasks: parseTasks(content) };

  // A finished task tagged #goal/* is evidence a target moved.
  //
  // Only stamp when the tag identifies exactly one target. A tag shared by
  // several targets is ambiguous, and stamping all of them would mark a target
  // fresh that nothing actually moved — the one failure this whole system
  // exists to prevent. Under-stamping just leaves it honestly quiet.
  const targets = readTargetStatus(config, date);
  const touchedTargets: string[] = [];
  const ambiguousTags: string[] = [];

  const doneTags = new Set(updated.tasks.filter((t) => t.done).flatMap((t) => t.goalTags));

  for (const tag of doneTags) {
    const matches = targets.filter((t) => t.goalTags.includes(tag));
    if (matches.length === 0) continue;

    if (matches.length > 1) {
      ambiguousTags.push(tag);
      continue;
    }

    const target = matches[0];
    if (touchedTargets.includes(target.text)) continue;

    if (updateTargetLastTouched(config, target.text, date)) {
      touchedTargets.push(target.text);
      emitSignal(config, {
        id: signalId(),
        type: "target_touched",
        timestamp: new Date().toISOString(),
        data: { target: target.text, cadence: target.cadence, daysSince: target.daysSince },
      });
    }
  }

  const stats = readJournalStats(config, date);
  const doneCount = updated.tasks.filter((t) => t.done).length;
  const openTasks = updated.tasks.filter((t) => !t.done);

  emitSignal(config, {
    id: signalId(),
    type: "journal_entry",
    timestamp: new Date().toISOString(),
    data: {
      date,
      path,
      run: "evening",
      gapDays: stats.daysSinceLastEntry,
      tasksCarried: 0,
      tasksCompleted: doneCount,
      tasksOpen: openTasks.length,
      currentStreak: stats.currentStreak,
    },
  });

  appendSessionEntry(config, {
    time: formatSessionTime(),
    action: "journal closed",
    detail: `${date} — ${doneCount} done, ${openTasks.length} open`,
  });

  return { note: updated, completed, unmatched, open: openTasks, touchedTargets, ambiguousTags };
}
