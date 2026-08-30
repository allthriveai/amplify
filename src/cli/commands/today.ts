import { loadConfig } from "../../config.js";
import { openDay, previewDay, closeDay, setPriorities, touchTarget, unanalyzedEntries } from "../../journal/index.js";
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
  const touchIndex = args.indexOf("--touch");

  if (touchIndex !== -1) {
    const names = args.slice(touchIndex + 1).filter((a) => !a.startsWith("--"));
    if (names.length === 0) {
      console.error('Usage: lumis today --touch "target name or #goal/tag" [--date YYYY-MM-DD]');
      process.exit(1);
    }
    // An entry captured on a phone is analyzed at the desk the next day, so the
    // stamp usually belongs to a past date. Defaulting to today silently credits
    // the wrong day and inflates Nx-cadence counts.
    const dateIndex = args.indexOf("--date");
    const stampDate = dateIndex !== -1 ? args[dateIndex + 1] : date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(stampDate)) {
      console.error(`--date must be YYYY-MM-DD, got "${stampDate}"`);
      process.exit(1);
    }
    for (const name of names) {
      const result = touchTarget(config, name, stampDate);
      if (result.stamped) console.log(`Stamped: ${result.target} (${stampDate})`);
      else console.log(`Not stamped — ${name}: ${result.reason}`);
    }
    return;
  }

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

  // Look, don't write. An empty scaffold is not a journal entry, and creating one
  // makes the streak lie about days nobody wrote on.
  const result = previewDay(config, date);

  if (prioIndex !== -1) {
    const texts = args.slice(prioIndex + 1).filter((a) => !a.startsWith("--"));
    if (texts.length > 0) {
      // Setting priorities is content, so this is the point the note earns its file.
      if (!result.exists) openDay(config, date);
      setPriorities(config, date, texts);
      console.log(`Priorities set for ${date}:`);
      for (const t of texts) console.log(`  - ${t}`);
      return;
    }
  }

  console.log(result.exists ? result.note!.path : `No entry yet for ${date}.`);
  printReceipt(result.receipt);

  // Entries written elsewhere — typically typed on the phone — that still need
  // the five-second moment and the pattern pass.
  const pending = unanalyzedEntries(config);
  if (pending.length > 0) {
    const label = pending.length === 1 ? "entry" : "entries";
    console.log(`${pending.length} ${label} awaiting analysis: ${pending.join(", ")}`);
    console.log("  Run /journal to analyze.");
  }

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
