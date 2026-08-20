import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { Cadence, Target, TargetStatus } from "../types/journal.js";
import { CADENCE_DAYS } from "../types/journal.js";
import { resolveGoalsPath } from "./paths.js";
import { daysBetween, todayKey } from "./daily-notes.js";

/** Heading that holds the machine-readable targets inside Goals.md */
export const TARGETS_HEADING = "## Active Targets";

const TARGET_LINE = /^\s*[-*] \[([ xX])\]\s+(.*)$/;
/** Inline metadata, written as `cadence:weekly` — backticks optional */
const META_TAG = /`?\b(cadence|last):([\w-]+)`?/g;
const GOAL_TAG = /#goal\/[\w-]+/g;

function isCadence(value: string): value is Cadence {
  return value in CADENCE_DAYS;
}

/** Parse one `- [ ] ...` line into a Target */
export function parseTargetLine(raw: string): Target | null {
  const match = raw.match(TARGET_LINE);
  if (!match) return null;

  const [, checkbox, body] = match;

  let cadence: Cadence | null = null;
  let last: string | null = null;

  for (const [, key, value] of body.matchAll(META_TAG)) {
    if (key === "cadence" && isCadence(value)) cadence = value;
    if (key === "last") last = value;
  }

  const goalTags = body.match(GOAL_TAG) ?? [];
  const text = body
    .replace(META_TAG, "")
    .replace(GOAL_TAG, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;

  return { text, cadence, last, goalTags, done: checkbox.toLowerCase() === "x", raw };
}

/** Render a Target back to a markdown line */
export function formatTarget(target: Target): string {
  const parts = [`- [${target.done ? "x" : " "}]`, target.text];
  if (target.cadence) parts.push(`\`cadence:${target.cadence}\``);
  if (target.last) parts.push(`\`last:${target.last}\``);
  parts.push(...target.goalTags);
  return parts.join(" ");
}

/** Extract the body of the `## Active Targets` section, or null when absent */
export function extractTargetsSection(goals: string): string | null {
  const lines = goals.split("\n");
  const start = lines.findIndex((l) => l.trim().toLowerCase() === TARGETS_HEADING.toLowerCase());
  if (start === -1) return null;

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
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
 */
export function computeTargetStatus(targets: Target[], today: string = todayKey()): TargetStatus[] {
  return targets.map((target) => {
    const daysSince = target.last ? daysBetween(target.last, today) : null;
    const overdue = target.cadence
      ? daysSince === null || daysSince > CADENCE_DAYS[target.cadence]
      : false;
    return { ...target, daysSince, overdue };
  });
}

/** Read targets from Goals.md with freshness computed */
export function readTargetStatus(config: LumisConfig, today: string = todayKey()): TargetStatus[] {
  return computeTargetStatus(readActiveTargets(config), today);
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
