import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { DailyNote, Task, JournalStats } from "../types/journal.js";
import { resolveDailyNotePath, resolvePath } from "./paths.js";
import { parseDateKey, daysBetween, todayKey, formatDate } from "./dates.js";

// Date helpers live in ./dates.ts; re-exported so callers have one import
export * from "./dates.js";

/** Render Obsidian template placeholders: {{date}} and {{date:FORMAT}} */
export function renderTemplate(template: string, dateKey: string): string {
  const date = parseDateKey(dateKey);
  return template
    .replace(/\{\{date:([^}]+)\}\}/g, (_, fmt: string) => formatDate(date, fmt))
    .replace(/\{\{(date|title)\}\}/g, (_, name: string) =>
      name === "date" ? dateKey : formatDate(date, "dddd, MMMM D, YYYY"),
    );
}

// ---------------------------------------------------------------------------
// Task parsing
// ---------------------------------------------------------------------------

const TASK_LINE = /^(\s*)[-*] \[([ xX])\]\s+(.*)$/;
const AGE_MARKER = /\s*\(moved (\d+) days?\)\s*$/;
/** Matches #goal/* tags. Shared with targets.ts so the two parsers cannot drift. */
export const GOAL_TAG = /#goal\/[\w-]+/g;

/** Extract every markdown checkbox from a note */
export function parseTasks(content: string): Task[] {
  const tasks: Task[] = [];

  for (const raw of content.split("\n")) {
    const match = raw.match(TASK_LINE);
    if (!match) continue;

    const [, , checkbox, body] = match;
    const ageMatch = body.match(AGE_MARKER);
    const text = body.replace(AGE_MARKER, "").trim();

    // An empty checkbox is a template placeholder, not a task
    if (!text) continue;

    tasks.push({
      text,
      done: checkbox.toLowerCase() === "x",
      age: ageMatch ? Number(ageMatch[1]) : 0,
      goalTags: text.match(GOAL_TAG) ?? [],
      raw,
    });
  }

  return tasks;
}

/** Render a task back to a markdown checkbox line */
export function formatTask(task: Task): string {
  const box = task.done ? "x" : " ";
  const marker = task.age > 0 ? ` (moved ${task.age} day${task.age === 1 ? "" : "s"})` : "";
  return `- [${box}] ${task.text}${marker}`;
}

/**
 * Carry unfinished tasks into a new day, aging each one by the number of days
 * that actually passed. A task that sat through a three-day gap reads as three
 * days older, not one — the count is the whole point.
 */
export function carryForwardTasks(tasks: Task[], gapDays: number): Task[] {
  const gap = Math.max(1, gapDays);
  return tasks
    .filter((t) => !t.done)
    .map((t) => ({ ...t, age: t.age + gap }));
}

/** Mark tasks done by matching their text (case-insensitive, whitespace-tolerant) */
export function setTasksDone(content: string, texts: string[]): string {
  const wanted = new Set(texts.map((t) => t.trim().toLowerCase()));

  return content
    .split("\n")
    .map((line) => {
      const match = line.match(TASK_LINE);
      if (!match) return line;

      const [, indent, checkbox, body] = match;
      if (checkbox.toLowerCase() === "x") return line;

      const text = body.replace(AGE_MARKER, "").trim();
      if (!wanted.has(text.toLowerCase())) return line;

      return `${indent}- [x] ${body}`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Daily note read/write
// ---------------------------------------------------------------------------

/** Resolve the daily notes directory */
export function resolveDailyNotesDir(config: LumisConfig): string {
  return resolvePath(config, config.paths.dailyNotes);
}

/** Build a regex that matches daily note filenames for the configured format */
function filenamePattern(config: LumisConfig): RegExp {
  const format = config.paths.dailyNoteFormat || "YYYY-MM-DD";
  const escaped = format.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped
    .replace("YYYY", "(?<y>\\d{4})")
    .replace("MM", "(?<m>\\d{2})")
    .replace("DD", "(?<d>\\d{2})");
  return new RegExp(`^${pattern}$`);
}

/** List every date key that has a daily note, sorted oldest first */
export function listDailyNoteDates(config: LumisConfig): string[] {
  const dir = resolveDailyNotesDir(config);
  if (!existsSync(dir)) return [];

  const pattern = filenamePattern(config);
  const dates: string[] = [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const match = basename(file, ".md").match(pattern);
    if (!match?.groups) continue;
    const { y, m, d } = match.groups;
    if (y && m && d) dates.push(`${y}-${m}-${d}`);
  }

  return dates.sort();
}

/** Read the daily note for a date, or null when it does not exist */
export function readDailyNote(config: LumisConfig, date: string): DailyNote | null {
  const path = resolveDailyNotePath(config, date);
  if (!existsSync(path)) return null;

  const content = readFileSync(path, "utf-8");
  return { date, path, content, tasks: parseTasks(content) };
}

/** Read the most recent daily note strictly before `date` */
export function findPreviousDailyNote(config: LumisConfig, date: string): DailyNote | null {
  const previous = listDailyNoteDates(config).filter((d) => d < date).pop();
  return previous ? readDailyNote(config, previous) : null;
}

/** Write a daily note, creating the daily notes folder if it has never existed */
export function writeDailyNote(config: LumisConfig, date: string, content: string): string {
  const path = resolveDailyNotePath(config, date);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, "utf-8");
  return path;
}

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

/**
 * Journaling history as of `today`. The current streak counts consecutive days
 * ending today or yesterday — one missed day does not erase the streak until
 * the day after, which keeps a late entry from feeling pointless.
 */
export function computeStreak(dates: string[], today: string = todayKey()): JournalStats {
  const sorted = [...new Set(dates)].sort();
  const past = sorted.filter((d) => d <= today);
  const lastEntryDate = past.filter((d) => d < today).pop() ?? null;

  let longestStreak = 0;
  let run = 0;
  let previous: string | null = null;

  for (const date of sorted) {
    run = previous && daysBetween(previous, date) === 1 ? run + 1 : 1;
    if (run > longestStreak) longestStreak = run;
    previous = date;
  }

  let currentStreak = 0;
  const mostRecent = past[past.length - 1];
  if (mostRecent && daysBetween(mostRecent, today) <= 1) {
    currentStreak = 1;
    for (let i = past.length - 2; i >= 0; i--) {
      if (daysBetween(past[i], past[i + 1]) !== 1) break;
      currentStreak++;
    }
  }

  return {
    lastEntryDate,
    daysSinceLastEntry: lastEntryDate ? daysBetween(lastEntryDate, today) : null,
    currentStreak,
    longestStreak,
    totalEntries: sorted.length,
  };
}

/** Journaling history for the vault */
export function readJournalStats(config: LumisConfig, today: string = todayKey()): JournalStats {
  return computeStreak(listDailyNoteDates(config), today);
}

/** Load the daily note template from the vault, or null when there isn't one */
export function readDailyNoteTemplate(config: LumisConfig): string | null {
  for (const candidate of ["Templates/Daily Note.md", "Templates/Daily.md"]) {
    const path = resolvePath(config, candidate);
    if (existsSync(path)) return readFileSync(path, "utf-8");
  }
  return null;
}

/** Fallback template, used when the vault has no Daily Note template */
/**
 * Used when the vault has no Templates/Daily Note.md.
 *
 * Deliberately bare. A template full of headings to fill in reads as a form, and
 * a form invites compliance rather than writing — the two notes that predate this
 * were created from a scaffolded template and contain zero words. The receipt,
 * the five-second moment, and the patterns are all appended by the journal flow,
 * so none of them belong here.
 */
export const FALLBACK_TEMPLATE = `---
date: {{date}}
tags: [daily]
---

# {{date:dddd, MMMM D, YYYY}}

## Entry

`;

/** The heading the day's own words live under */
export const ENTRY_HEADING = "## Entry";
/** Written by the journal flow once an entry has been analyzed */
export const MOMENT_HEADING = "## The Five-Second Moment";

/** True when the note has an Entry section with actual words in it */
export function hasEntry(content: string): boolean {
  const start = content.indexOf(ENTRY_HEADING);
  if (start === -1) return false;
  const rest = content.slice(start + ENTRY_HEADING.length);
  const body = rest.split(/^## /m)[0];
  return body.trim().length > 0;
}

/** True when the five-second moment has already been written for this note */
export function hasMoment(content: string): boolean {
  return content.includes(MOMENT_HEADING);
}

/**
 * Append text to the note's Entry section, creating the note if absent.
 *
 * writeDailyNote is a blind overwrite, which was safe while the desktop was the
 * only writer. With a phone in the loop two devices can touch the same day, so
 * anything that adds to an existing note has to merge rather than replace —
 * everything already below Entry (moment, patterns) must survive.
 */
export function appendToEntry(config: LumisConfig, date: string, text: string): string {
  const existing = readDailyNote(config, date);

  if (!existing) {
    const template = readDailyNoteTemplate(config) ?? FALLBACK_TEMPLATE;
    const seeded = renderTemplate(template, date);
    const withEntry = seeded.includes(ENTRY_HEADING)
      ? seeded
      : `${seeded.trimEnd()}\n\n${ENTRY_HEADING}\n`;
    return writeDailyNote(config, date, insertIntoEntry(withEntry, text));
  }

  return writeDailyNote(config, date, insertIntoEntry(existing.content, text));
}

/** Place text at the end of the Entry section, leaving later sections untouched */
function insertIntoEntry(content: string, text: string): string {
  const start = content.indexOf(ENTRY_HEADING);
  if (start === -1) return `${content.trimEnd()}\n\n${ENTRY_HEADING}\n${text}\n`;

  const after = start + ENTRY_HEADING.length;
  const rest = content.slice(after);
  const nextHeading = rest.search(/^## /m);

  const body = (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trimEnd();
  const tail = nextHeading === -1 ? "" : rest.slice(nextHeading);
  const joined = body ? `${body}\n\n${text}` : `\n${text}`;

  return `${content.slice(0, after)}${joined}\n\n${tail}`.trimEnd() + "\n";
}
