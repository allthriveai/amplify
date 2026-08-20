import type { LumisConfig } from "../types/config.js";
import type { Drift, DriftTheme, Task } from "../types/journal.js";
import { CADENCE_DAYS } from "../types/journal.js";
import { readMoments } from "../vault/reader.js";
import { readTargetStatus } from "../vault/targets.js";
import {
  listDailyNoteDates,
  readDailyNote,
  daysBetween,
  todayKey,
  shiftDateKey,
  normalizeDateKey,
} from "../vault/daily-notes.js";

/** A task carried this long has stopped being a task */
export const STALE_TASK_DAYS = 7;
/** A target this far past its cadence is not slipping, it is abandoned */
export const VERY_QUIET_MULTIPLIER = 2;
/** A theme needs this many moments before it counts as recurring */
export const RECURRING_THEME_MIN = 3;
/** How far back to look for silent days and recurring themes */
export const DEFAULT_WINDOW_DAYS = 30;

/** Themes appearing in at least RECURRING_THEME_MIN moments in the window */
export function findRepeatedThemes(
  moments: { date: string; themes: string[] }[],
  minCount: number = RECURRING_THEME_MIN,
): DriftTheme[] {
  const seen = new Map<string, { count: number; lastSeen: string }>();

  for (const moment of moments) {
    for (const theme of moment.themes) {
      const entry = seen.get(theme);
      if (!entry) {
        seen.set(theme, { count: 1, lastSeen: moment.date });
      } else {
        entry.count++;
        if (moment.date > entry.lastSeen) entry.lastSeen = moment.date;
      }
    }
  }

  return [...seen.entries()]
    .filter(([, v]) => v.count >= minCount)
    .map(([theme, v]) => ({ theme, count: v.count, lastSeen: v.lastSeen }))
    .sort((a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen));
}

/** Open tasks in the most recent daily note, oldest first */
function currentOpenTasks(config: LumisConfig, today: string): Task[] {
  const latest = listDailyNoteDates(config).filter((d) => d <= today).pop();
  if (!latest) return [];
  const note = readDailyNote(config, latest);
  return (note?.tasks ?? []).filter((t) => !t.done).sort((a, b) => b.age - a.age);
}

/**
 * What the coach can see across entries but not inside any one of them.
 * Everything here is a count. Interpretation belongs to the skill.
 */
export function detectDrift(
  config: LumisConfig,
  today: string = todayKey(),
  windowDays: number = DEFAULT_WINDOW_DAYS,
): Drift {
  const windowStart = shiftDateKey(today, -windowDays);

  const staleTasks = currentOpenTasks(config, today).filter((t) => t.age >= STALE_TASK_DAYS);

  const quietTargets = readTargetStatus(config, today).filter((t) => {
    if (!t.cadence || !t.overdue) return false;
    if (t.daysSince === null) return true;
    return t.daysSince > CADENCE_DAYS[t.cadence] * VERY_QUIET_MULTIPLIER;
  });

  // Frontmatter dates arrive as Date objects from YAML, not strings
  const allMoments = readMoments(config)
    .map((m) => ({ date: normalizeDateKey(m.frontmatter.date), themes: m.frontmatter.themes ?? [] }))
    .filter((m): m is { date: string; themes: string[] } => m.date !== null);

  const lastMomentDate = allMoments.map((m) => m.date).sort().pop() ?? null;

  const journaled = new Set(listDailyNoteDates(config));
  let silentDays = 0;
  for (let i = 0; i < windowDays; i++) {
    if (!journaled.has(shiftDateKey(today, -i))) silentDays++;
  }

  return {
    staleTasks,
    quietTargets,
    repeatedThemes: findRepeatedThemes(allMoments.filter((m) => m.date >= windowStart)),
    daysSinceLastMoment: lastMomentDate ? daysBetween(lastMomentDate, today) : null,
    silentDays,
    windowDays,
  };
}
