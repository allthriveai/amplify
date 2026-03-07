import { describe, it, expect } from "vitest";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import { DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "../types/config.js";
import {
  resolvePath,
  resolveMomentsDir,
  resolveStoriesDir,
  resolveCanvasPath,
  resolveDailyNotePath,
  resolveResearchDir,
  resolveTldrDir,
  resolveResearchCategoryDir,
  resolveSignalsDir,
  resolveSignalsPath,
  resolveMemoryDir,
  resolveSessionPath,
  resolvePreferencesPath,
  resolveVoicePath,
  resolveStrategyDocsDir,
  resolvePracticeLogPath,
} from "./paths.js";

/** Create a LumisConfig with sensible defaults for testing */
function mockConfig(overrides?: Partial<LumisConfig>): LumisConfig {
  return {
    vaultPath: "/test/vault",
    anthropicApiKey: "test-key",
    paths: { ...DEFAULT_PATHS },
    researchCategories: DEFAULT_RESEARCH_CATEGORIES,
    ...overrides,
  };
}

describe("resolvePath", () => {
  it("joins vaultPath with a relative path", () => {
    const config = mockConfig();
    expect(resolvePath(config, "some/relative/path")).toBe(
      "/test/vault/some/relative/path",
    );
  });

  it("uses the configured vaultPath", () => {
    const config = mockConfig({ vaultPath: "/my/obsidian" });
    expect(resolvePath(config, "Notes")).toBe("/my/obsidian/Notes");
  });
});

describe("resolveMomentsDir", () => {
  it("resolves to the default moments path", () => {
    const config = mockConfig();
    expect(resolveMomentsDir(config)).toBe("/test/vault/Moments");
  });

  it("respects custom moments path", () => {
    const config = mockConfig({
      paths: { ...DEFAULT_PATHS, moments: "Custom/Moments" },
    });
    expect(resolveMomentsDir(config)).toBe("/test/vault/Custom/Moments");
  });
});

describe("resolveStoriesDir", () => {
  it("resolves to the default stories path", () => {
    const config = mockConfig();
    expect(resolveStoriesDir(config)).toBe("/test/vault/Stories");
  });
});

describe("resolveCanvasPath", () => {
  it("resolves to the default canvas path", () => {
    const config = mockConfig();
    expect(resolveCanvasPath(config)).toBe(
      "/test/vault/Lumis/Pattern Map.canvas",
    );
  });
});

describe("resolveDailyNotePath", () => {
  it("resolves with a specific date and default format", () => {
    const config = mockConfig();
    // resolveDailyNotePath parses the date string with new Date(), which
    // interprets "YYYY-MM-DD" as UTC. The formatter then uses local getMonth/getDate,
    // so we construct the expected result the same way the implementation does.
    const result = resolveDailyNotePath(config, "2024-06-15");
    expect(result).toMatch(/^\/test\/vault\/Daily Notes\/2024-06-\d{2}\.md$/);
    // Verify it uses the default dailyNotes directory
    expect(result).toContain("/test/vault/Daily Notes/");
  });

  it("resolves with a custom dailyNotes directory", () => {
    const config = mockConfig({
      paths: { ...DEFAULT_PATHS, dailyNotes: "Journal/Daily" },
    });
    const result = resolveDailyNotePath(config, "2024-01-01");
    expect(result).toContain("/test/vault/Journal/Daily/");
    expect(result).toMatch(/\.md$/);
  });
});

describe("resolveResearchDir", () => {
  it("resolves to the default research path", () => {
    const config = mockConfig();
    expect(resolveResearchDir(config)).toBe("/test/vault/Research");
  });
});

describe("resolveTldrDir", () => {
  it("resolves to the default TL;DR path", () => {
    const config = mockConfig();
    expect(resolveTldrDir(config)).toBe("/test/vault/Research/TL;DR");
  });
});

describe("resolveResearchCategoryDir", () => {
  it("resolves a category subfolder under the research dir", () => {
    const config = mockConfig();
    const category = { name: "AI & Agents", folder: "AI & Agents", keywords: ["ai"] };
    expect(resolveResearchCategoryDir(config, category)).toBe(
      "/test/vault/Research/AI & Agents",
    );
  });
});

describe("resolveSignalsDir", () => {
  it("resolves to the default signals directory", () => {
    const config = mockConfig();
    expect(resolveSignalsDir(config)).toBe("/test/vault/Lumis/Signals");
  });
});

describe("resolveSignalsPath", () => {
  it("resolves to signals.json inside the signals directory", () => {
    const config = mockConfig();
    expect(resolveSignalsPath(config)).toBe(
      "/test/vault/Lumis/Signals/signals.json",
    );
  });
});

describe("resolveMemoryDir", () => {
  it("resolves to the default memory directory", () => {
    const config = mockConfig();
    expect(resolveMemoryDir(config)).toBe("/test/vault/Lumis/Memory");
  });
});

describe("resolveSessionPath", () => {
  it("resolves to sessions subdirectory with date filename", () => {
    const config = mockConfig();
    expect(resolveSessionPath(config, "2024-03-10")).toBe(
      "/test/vault/Lumis/Memory/sessions/2024-03-10.md",
    );
  });
});

describe("resolvePreferencesPath", () => {
  it("resolves to preferences.md inside the memory directory", () => {
    const config = mockConfig();
    expect(resolvePreferencesPath(config)).toBe(
      "/test/vault/Lumis/Memory/preferences.md",
    );
  });
});

describe("resolveVoicePath", () => {
  it("resolves to the default voice file", () => {
    const config = mockConfig();
    expect(resolveVoicePath(config)).toBe("/test/vault/Lumis/Voice.md");
  });
});

describe("resolveStrategyDocsDir", () => {
  it("resolves to the default strategy docs path", () => {
    const config = mockConfig();
    expect(resolveStrategyDocsDir(config)).toBe(
      "/test/vault/Strategy",
    );
  });
});

describe("resolvePracticeLogPath", () => {
  it("resolves to Practice Log.md inside the stories directory", () => {
    const config = mockConfig();
    expect(resolvePracticeLogPath(config)).toBe(
      "/test/vault/Stories/Practice Log.md",
    );
  });
});
