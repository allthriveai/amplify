import { loadConfig } from "../../config.js";
import { openDay, closeDay, setPriorities } from "../../journal/index.js";
import { todayKey, formatTask } from "../../vault/daily-notes.js";

function printReceipt(receipt: string): void {
  console.log(`\n${receipt.replace(/^## /m, "")}`);
}

/**
 * `lumis today` — open the day, or close it with `--done`.
 *
 *   lumis today                          create/show today's note + receipt
 *   lumis today --priorities "a" "b"     write the day's top priorities
 *   lumis today --done "task" "task"     check tasks off and log the evening
 */
export async function todayCommand(args: string[]): Promise<void> {
  const config = loadConfig();
  const date = todayKey();

  const doneIndex = args.indexOf("--done");
  const prioIndex = args.indexOf("--priorities");

  if (doneIndex !== -1) {
    const completed = args.slice(doneIndex + 1).filter((a) => !a.startsWith("--"));
    const result = closeDay(config, date, completed);

    console.log(`Closed ${date}.`);
    console.log(`  ${result.note.tasks.filter((t) => t.done).length} done, ${result.open.length} open`);

    if (result.unmatched.length > 0) {
      console.log(`  No matching task for: ${result.unmatched.join(", ")}`);
    }
    if (result.touchedTargets.length > 0) {
      console.log(`  Targets stamped: ${result.touchedTargets.join(", ")}`);
    }
    if (result.ambiguousTags.length > 0) {
      console.log(`  Not stamped — ${result.ambiguousTags.join(", ")} matches more than one target. Give each target its own tag.`);
    }
    for (const task of result.open) {
      console.log(`  still open — ${formatTask(task)}`);
    }
    return;
  }

  const result = openDay(config, date);

  if (prioIndex !== -1) {
    const texts = args.slice(prioIndex + 1).filter((a) => !a.startsWith("--"));
    if (texts.length > 0) {
      setPriorities(config, date, texts);
      console.log(`Priorities set for ${date}:`);
      for (const t of texts) console.log(`  - ${t}`);
      return;
    }
  }

  console.log(result.created ? `Created ${result.note.path}` : `${result.note.path} already exists`);
  printReceipt(result.receipt);

  const { drift } = result;
  const notes: string[] = [];
  if (drift.staleTasks.length > 0) {
    notes.push(`${drift.staleTasks.length} task(s) carried a week or more: ${drift.staleTasks.map((t) => `"${t.text}" (${t.age}d)`).join(", ")}`);
  }
  if (drift.quietTargets.length > 0) {
    notes.push(`abandoned targets: ${drift.quietTargets.map((t) => t.text).join(", ")}`);
  }
  if (drift.silentDays > 0) {
    notes.push(`${drift.silentDays} of the last ${drift.windowDays} days had no entry`);
  }
  if (drift.repeatedThemes.length > 0) {
    notes.push(`recurring themes: ${drift.repeatedThemes.map((t) => `${t.theme} (${t.count})`).join(", ")}`);
  }
  if (notes.length > 0) {
    console.log("Drift");
    for (const n of notes) console.log(`  ${n}`);
  }
}
