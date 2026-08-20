import { loadConfig } from "../../config.js";
import { runWeekReview } from "../../journal/index.js";
import { todayKey, formatTask } from "../../vault/daily-notes.js";

/**
 * `lumis week` — write this week's review.
 *
 *   lumis week                 review the current week
 *   lumis week 2026-08-10      review the week containing that date
 */
export async function weekCommand(args: string[]): Promise<void> {
  const config = loadConfig();
  const date = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? todayKey();

  const { path, created, data } = runWeekReview(config, date);

  console.log(created ? `Created ${path}` : `${path} already exists`);
  console.log(`\nWeek of ${data.weekOf}`);
  console.log(`  Journaled ${data.daysJournaled} of ${data.daysElapsed} days`);
  console.log(`  ${data.completed.length} done, ${data.stillOpen.length} open`);
  console.log(`  ${data.moments.length} moments captured`);
  console.log(`  ${data.targetsTouched.length} of ${data.targets.length} targets moved`);

  if (data.oldestOpen) {
    console.log(`\n  Longest carried: ${formatTask(data.oldestOpen)}`);
  }
  if (data.drift.repeatedThemes.length > 0) {
    console.log(`  Recurring themes: ${data.drift.repeatedThemes.map((t) => `${t.theme} (${t.count})`).join(", ")}`);
  }
}
