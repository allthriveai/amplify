import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Cadence, Target, TargetStatus } from "../types/journal.js";
import { CADENCE_DAYS } from "../types/journal.js";
import { resolveGoalsPath } from "./paths.js";
import { daysBetween, todayKey, GOAL_TAG } from "./daily-notes.js";
import { readSignals, signalDay } from "./signals.js";

/** Heading that holds the machine-readable targets inside Goals.md */
export const TARGETS_HEADING = "## Active Targets";

const TARGET_LINE = /^\s*[-*] \[([ xX])\]\s+(.*)$/;
/** Inline metadata, written as `cadence:weekly` — backticks optional */
const META_TAG = /`?\b(cadence|last):([\w-]+)`?/g;

function isCadence(value: string): value is Cadence {
  return value in CADENCE_DAYS;
}

/** Matches the times-per-period form, e.g. `3x-weekly` */
const TIMES_CADENCE = /^(\d+)x-(\w+)$/;

/**
 * Parse a cadence value into a period and an optional count.
 *
 * `weekly` means at least once a week. `3x-weekly` means three times a week,
 * which is a different question and cannot be answered by a single `last:` date.
 */
function parseCadenceValue(value: string): { cadence: Cadence; times: number | null } | null {
  const timed = value.match(TIMES_CADENCE);
  if (timed) {
    const count = Number(timed[1]);
    const period = timed[2];
    if (count > 0 && isCadence(period)) return { cadence: period, times: count };
    return null;
  }
  return isCadence(value) ? { cadence: value, times: null } : null;
}

/** Parse one `- [ ] ...` line into a Target */
export function parseTargetLine(raw: string): Target | null {
  const match = raw.match(TARGET_LINE);
  if (!match) return null;

  const [, checkbox, body] = match;

  let cadence: Cadence | null = null;
  let times: number | null = null;
  let last: string | null = null;

  for (const [, key, value] of body.matchAll(META_TAG)) {
    if (key === "cadence") {
      const parsed = parseCadenceValue(value);
      if (parsed) {
        cadence = parsed.cadence;
        times = parsed.times;
      }
    }
    if (key === "last") last = value;
  }

  const goalTags = body.match(GOAL_TAG) ?? [];
  const text = body
    .replace(META_TAG, "")
    .replace(GOAL_TAG, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;

  return { text, cadence, times, last, goalTags, done: checkbox.toLowerCase() === "x", raw };
}

/** Render a Target back to a markdown line */
export function formatTarget(target: Target): string {
  const parts = [`- [${target.done ? "x" : " "}]`, target.text];
  if (target.cadence) {
    const value = target.times ? `${target.times}x-${target.cadence}` : target.cadence;
    parts.push(`\`cadence:${value}\``);
  }
  if (target.last) parts.push(`\`last:${target.last}\``);
  parts.push(...target.goalTags);
  return parts.join(" ");
}

/**
 * Extract the body of the `## Active Targets` section, or null when absent.
 *
 * Lines inside HTML comments are dropped. Commenting a target out is the obvious
 * way to park it without deleting it, and counting it anyway means the daily
 * receipt holds you to something you deliberately set aside.
 */
export function extractTargetsSection(goals: string): string | null {
  const lines = goals.split("\n");
  const start = lines.findIndex((l) => l.trim().toLowerCase() === TARGETS_HEADING.toLowerCase());
  if (start === -1) return null;

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  const body = end === -1 ? rest : rest.slice(0, end);

  return stripComments(body.join("\n"));
}

/** Remove HTML comment blocks, including ones spanning several lines */
function stripComments(text: string): string {
  return text.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
}

/** Read the targets declared in Goals.md */
export function readActiveTargets(config: LumisConfig): Target[] {
  const path = resolveGoalsPath(config);
  if (!existsSync(path)) return [];

  const section = extractTargetsSection(readFileSync(path, "utf-8"));
  if (!section) return [];

  return section
    .split("\n")
    .map(parseTargetLine)
    .filter((t): t is Target => t !== null);
}

/**
 * Add freshness to each target. A target with a cadence but no `last:` counts
 * as overdue — never having started is not the same as being on track.
 *
 * `touches` maps lowercased target text to the days it was completed on. It is
 * only needed for `times` targets, where being on track is a count inside the
 * period rather than a gap since the last one. Callers without that history can
 * omit it; those targets then fall back to counting `last:` as a single hit.
 */
export function computeTargetStatus(
  targets: Target[],
  today: string = todayKey(),
  touches?: Map<string, Set<string>>,
): TargetStatus[] {
  return targets.map((target) => {
    const daysSince = target.last ? daysBetween(target.last, today) : null;

    if (!target.cadence) return { ...target, daysSince, overdue: false, hits: null };

    const period = CADENCE_DAYS[target.cadence];

    if (target.times === null) {
      const overdue = daysSince === null || daysSince > period;
      return { ...target, daysSince, overdue, hits: null };
    }

    const dates = touches?.get(target.text.toLowerCase())
      ?? new Set(target.last ? [target.last] : []);
    const hits = [...dates].filter((d) => daysBetween(d, today) < period).length;

    return { ...target, daysSince, overdue: hits < target.times, hits };
  });
}

/**
 * Days each target was stamped on, from the signal log.
 *
 * Days are deduplicated per target: closing the day twice, or two done tasks
 * carrying the same tag, must count as one hit — otherwise a 3x-weekly target
 * is satisfied by working out once and closing the day three times.
 */
function touchesByTarget(config: LumisConfig): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const signal of readSignals(config)) {
    if (signal.type !== "target_touched") continue;
    const data = signal.data as { target?: string };
    if (!data.target) continue;
    const key = data.target.toLowerCase();
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(signalDay(signal));
  }
  return map;
}

/** Read targets from Goals.md with freshness computed */
export function readTargetStatus(config: LumisConfig, today: string = todayKey()): TargetStatus[] {
  return computeTargetStatus(readActiveTargets(config), today, touchesByTarget(config));
}

/** Replace the `## Active Targets` section body, appending the section if missing */
export function replaceTargetsSection(goals: string, body: string): string {
  const lines = goals.split("\n");
  const start = lines.findIndex((l) => l.trim().toLowerCase() === TARGETS_HEADING.toLowerCase());

  if (start === -1) {
    return `${goals.trimEnd()}\n\n${TARGETS_HEADING}\n${body.trim()}\n`;
  }

  const rest = lines.slice(start + 1);
  const offset = rest.findIndex((l) => /^##\s/.test(l));
  const tail = offset === -1 ? [] : rest.slice(offset);

  return [...lines.slice(0, start + 1), "", body.trim(), "", ...tail].join("\n").replace(/\n{3,}/g, "\n\n");
}

/** Write the full target list back into Goals.md */
export function writeActiveTargets(config: LumisConfig, targets: Target[]): void {
  const path = resolveGoalsPath(config);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const goals = existsSync(path) ? readFileSync(path, "utf-8") : "# Goals\n";
  const body = targets.map(formatTarget).join("\n");
  writeFileSync(path, replaceTargetsSection(goals, body), "utf-8");
}

/**
 * Stamp a target as touched today. Matches on target text, case-insensitively.
 * Returns false when no target matched, so callers can report the miss.
 */
export function updateTargetLastTouched(
  config: LumisConfig,
  targetText: string,
  date: string = todayKey(),
): boolean {
  const targets = readActiveTargets(config);
  const wanted = targetText.trim().toLowerCase();

  const index = targets.findIndex((t) => t.text.toLowerCase() === wanted);
  if (index === -1) return false;

  targets[index] = { ...targets[index], last: date };
  writeActiveTargets(config, targets);
  return true;
}
