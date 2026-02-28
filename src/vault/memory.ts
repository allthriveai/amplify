import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";
import type { LumisConfig } from "../types/config.js";
import type { SessionEntry } from "../types/memory.js";
import { resolveSessionPath, resolvePreferencesPath } from "./paths.js";

/** Format a Date as HH:MM for session log entries */
export function formatSessionTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Append a session entry to today's session log */
export function appendSessionEntry(config: LumisConfig, entry: SessionEntry): void {
  const today = new Date().toISOString().split("T")[0];
  const path = resolveSessionPath(config, today);
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Create the file with a header if it doesn't exist
  if (!existsSync(path)) {
    writeFileSync(path, `# Session: ${today}\n\n`, "utf-8");
  }

  const line = `- **${entry.time}** — ${entry.action}: ${entry.detail}\n`;
  appendFileSync(path, line, "utf-8");
}

/** Read a session log for a given date (defaults to today) */
export function readSession(config: LumisConfig, date?: string): string | null {
  const d = date ?? new Date().toISOString().split("T")[0];
  const path = resolveSessionPath(config, d);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

/** Read session logs for the last N days */
export function readRecentSessions(config: LumisConfig, days: number): string[] {
  const sessions: string[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const content = readSession(config, dateStr);
    if (content) {
      sessions.push(content);
    }
  }

  return sessions;
}

/** Read the preferences file */
export function readPreferences(config: LumisConfig): string | null {
  const path = resolvePreferencesPath(config);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

/** Add or update a preference under a section heading */
export function addPreference(config: LumisConfig, section: string, key: string, value: string): void {
  const path = resolvePreferencesPath(config);
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let content: string;
  if (!existsSync(path)) {
    content = "# Preferences\n";
  } else {
    content = readFileSync(path, "utf-8");
  }

  const sectionHeader = `## ${section}`;
  const entryLine = `- **${key}**: ${value}`;

  if (content.includes(sectionHeader)) {
    // Check if the key already exists under this section
    const sectionStart = content.indexOf(sectionHeader);
    const nextSection = content.indexOf("\n## ", sectionStart + sectionHeader.length);
    const sectionEnd = nextSection === -1 ? content.length : nextSection;
    const sectionContent = content.slice(sectionStart, sectionEnd);

    const keyPattern = new RegExp(`^- \\*\\*${escapeRegex(key)}\\*\\*:.*$`, "m");
    if (keyPattern.test(sectionContent)) {
      // Replace existing entry
      const updatedSection = sectionContent.replace(keyPattern, entryLine);
      content = content.slice(0, sectionStart) + updatedSection + content.slice(sectionEnd);
    } else {
      // Append to section
      content = content.slice(0, sectionEnd).trimEnd() + "\n" + entryLine + "\n" + content.slice(sectionEnd);
    }
  } else {
    // Add new section
    content = content.trimEnd() + "\n\n" + sectionHeader + "\n" + entryLine + "\n";
  }

  writeFileSync(path, content, "utf-8");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
