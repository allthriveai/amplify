import type { Task, JournalStats, TargetStatus } from "../types/journal.js";
import { formatTask } from "../vault/daily-notes.js";

/** Heading for the block that opens every daily note */
export const RECEIPT_HEADING = "## Where you are";

/** "yesterday", "3 days ago" — plain and factual, no softening */
export function describeGap(days: number | null): string {
  if (days === null) return "never";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** "118 days", "1 day" */
function describeDuration(days: number | null): string {
  if (days === null) return "never touched";
  if (days <= 0) return "today";
  return `${days} day${days === 1 ? "" : "s"}`;
}

export interface ReceiptInput {
  stats: JournalStats;
  carried: Task[];
  targets: TargetStatus[];
}

/**
 * The block that opens every daily note. It states where things stand before
 * asking for anything — the point is that you never write into a blank page.
 * Facts only. No encouragement, no scolding.
 */
export function buildReceipt({ stats, carried, targets }: ReceiptInput): string {
  const lines: string[] = [RECEIPT_HEADING];

  const summary =
    stats.lastEntryDate === null
      ? ["First entry."]
      : [
          `Last entry: ${describeGap(stats.daysSinceLastEntry)}`,
          `streak ${stats.currentStreak}`,
          `longest ${stats.longestStreak}`,
          `${stats.totalEntries} total`,
        ];
  lines.push(summary.join(" · "), "");

  if (carried.length > 0) {
    lines.push("**Carried over**");
    for (const task of carried) lines.push(formatTask(task));
    lines.push("");
  }

  const quiet = targets.filter((t) => t.overdue);
  if (quiet.length > 0) {
    lines.push("**Targets going quiet**");
    for (const target of quiet) lines.push(`- ${target.text} — ${describeTarget(target)}`);
    lines.push("");
  }

  if (carried.length === 0 && quiet.length === 0) {
    lines.push("Nothing carried over. Nothing overdue.", "");
  }

  return lines.join("\n");
}

/**
 * How far behind a target is, in its own terms.
 *
 * "Days since" is the wrong unit for a times-per-period target — three workouts
 * a week is not answered by when the last one was, so those report the count
 * inside the period instead.
 */
function describeTarget(target: TargetStatus): string {
  if (target.times !== null) {
    const period = target.cadence === "weekly" ? "this week" : `this ${target.cadence}`;
    return `${target.hits ?? 0} of ${target.times} ${period}`;
  }
  const cadence = target.cadence ? ` (${target.cadence})` : "";
  return `${describeDuration(target.daysSince)}${cadence}`;
}
