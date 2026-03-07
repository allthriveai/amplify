import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { formatSessionTime, appendSessionEntry, readSession, readPreferences, addPreference } from "./memory.js";
import { createTestConfig, writeTestFile } from "./test-helpers.js";
import type { LumisConfig } from "../types/config.js";

let config: LumisConfig;

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// formatSessionTime
// ---------------------------------------------------------------------------
describe("formatSessionTime", () => {
  it("returns HH:MM format", () => {
    const result = formatSessionTime();
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("uses provided date", () => {
    // Create a date at 14:30 UTC. We use toLocaleTimeString with hour12: false,
    // so the result depends on locale. We verify the format is correct.
    const date = new Date("2024-06-15T14:30:00");
    const result = formatSessionTime(date);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    // Should contain "30" for the minutes portion
    expect(result).toContain("30");
  });
});

// ---------------------------------------------------------------------------
// appendSessionEntry
// ---------------------------------------------------------------------------
describe("appendSessionEntry", () => {
  it("creates session file with header if new", () => {
    const entry = { time: "14:30", action: "moment", detail: "Captured a realization" };
    appendSessionEntry(config, entry);

    const today = new Date().toISOString().split("T")[0];
    const sessionPath = join(config.vaultPath, config.paths.memory, "sessions", `${today}.md`);
    expect(existsSync(sessionPath)).toBe(true);

    const content = readFileSync(sessionPath, "utf-8");
    expect(content).toContain(`# Session: ${today}`);
    expect(content).toContain("**14:30** — moment: Captured a realization");
  });

  it("appends entries to existing file", () => {
    const entry1 = { time: "09:00", action: "research", detail: "Saved an article" };
    const entry2 = { time: "10:15", action: "moment", detail: "Morning reflection" };

    appendSessionEntry(config, entry1);
    appendSessionEntry(config, entry2);

    const today = new Date().toISOString().split("T")[0];
    const sessionPath = join(config.vaultPath, config.paths.memory, "sessions", `${today}.md`);
    const content = readFileSync(sessionPath, "utf-8");

    expect(content).toContain("**09:00** — research: Saved an article");
    expect(content).toContain("**10:15** — moment: Morning reflection");
    // Header should appear only once
    const headerCount = (content.match(/# Session:/g) || []).length;
    expect(headerCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// readSession
// ---------------------------------------------------------------------------
describe("readSession", () => {
  it("returns null when file does not exist", () => {
    expect(readSession(config, "2024-01-01")).toBeNull();
  });

  it("returns content when file exists", () => {
    const sessionsDir = join(config.vaultPath, config.paths.memory, "sessions");
    writeTestFile(sessionsDir, "2024-06-15.md", "# Session: 2024-06-15\n\n- **09:00** — moment: Test\n");

    const content = readSession(config, "2024-06-15");
    expect(content).not.toBeNull();
    expect(content).toContain("# Session: 2024-06-15");
    expect(content).toContain("moment: Test");
  });
});

// ---------------------------------------------------------------------------
// readPreferences
// ---------------------------------------------------------------------------
describe("readPreferences", () => {
  it("returns null when file does not exist", () => {
    expect(readPreferences(config)).toBeNull();
  });

  it("returns content when file exists", () => {
    const memoryDir = join(config.vaultPath, config.paths.memory);
    writeTestFile(memoryDir, "preferences.md", "# Preferences\n\n## Writing\n- **tone**: casual\n");

    const content = readPreferences(config);
    expect(content).not.toBeNull();
    expect(content).toContain("# Preferences");
    expect(content).toContain("**tone**: casual");
  });
});

// ---------------------------------------------------------------------------
// addPreference
// ---------------------------------------------------------------------------
describe("addPreference", () => {
  it("creates file and section if new", () => {
    addPreference(config, "Writing", "tone", "casual");

    const prefsPath = join(config.vaultPath, config.paths.memory, "preferences.md");
    expect(existsSync(prefsPath)).toBe(true);

    const content = readFileSync(prefsPath, "utf-8");
    expect(content).toContain("# Preferences");
    expect(content).toContain("## Writing");
    expect(content).toContain("- **tone**: casual");
  });

  it("adds entry to existing section", () => {
    addPreference(config, "Writing", "tone", "casual");
    addPreference(config, "Writing", "length", "short");

    const prefsPath = join(config.vaultPath, config.paths.memory, "preferences.md");
    const content = readFileSync(prefsPath, "utf-8");

    expect(content).toContain("- **tone**: casual");
    expect(content).toContain("- **length**: short");
    // Should still have only one Writing section header
    const sectionCount = (content.match(/## Writing/g) || []).length;
    expect(sectionCount).toBe(1);
  });

  it("updates existing key in section", () => {
    addPreference(config, "Writing", "tone", "casual");
    addPreference(config, "Writing", "tone", "formal");

    const prefsPath = join(config.vaultPath, config.paths.memory, "preferences.md");
    const content = readFileSync(prefsPath, "utf-8");

    expect(content).toContain("- **tone**: formal");
    expect(content).not.toContain("- **tone**: casual");
  });

  it("adds new section alongside existing ones", () => {
    addPreference(config, "Writing", "tone", "casual");
    addPreference(config, "Research", "format", "detailed");

    const prefsPath = join(config.vaultPath, config.paths.memory, "preferences.md");
    const content = readFileSync(prefsPath, "utf-8");

    expect(content).toContain("## Writing");
    expect(content).toContain("## Research");
    expect(content).toContain("- **tone**: casual");
    expect(content).toContain("- **format**: detailed");
  });
});
