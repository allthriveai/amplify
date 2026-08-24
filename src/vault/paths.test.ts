import { describe, it, expect } from "vitest";
import { join } from "node:path";
import type { LumisConfig } from "../types/config.js";
import { DEFAULT_PATHS } from "../types/config.js";
import {
  resolvePath,
  resolveMomentsDir,
  resolveStoriesDir,
  resolveCanvasPath,
  resolveDailyNotePath,
  resolveSourcesDir,
  resolveClippingsDir,
  resolveSourceAssetsDir,
  resolveWikiDir,
  resolveWikiSubdir,
  resolveWikiPagePath,
  resolveWikiIndexPath,
  resolveWikiLogPath,
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
    expect(resolvePath(config, "Notes")).toBe("/my/obsidian/Notes");  // personal-ok: generic test fixture
  });
});

describe("resolveMomentsDir", () => {
  it("resolves to the default moments path", () => {
    const config = mockConfig();
    expect(resolveMomentsDir(config)).toBe("/test/vault/Journal/Moments");
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
    expect(resolveStoriesDir(config)).toBe("/test/vault/Work/Stories");
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
    // The key is split on "-" rather than passed to new Date(), which would parse
    // "YYYY-MM-DD" as UTC midnight and land on the previous day west of UTC. So the
    // day in the filename is exactly the day asked for, in every timezone.
    const result = resolveDailyNotePath(config, "2024-06-15");
    expect(result).toBe("/test/vault/Journal/Daily Notes/2024-06-15.md");
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

describe("source layer", () => {
  it("resolves the sources root", () => {
    expect(resolveSourcesDir(mockConfig())).toBe("/test/vault/Sources");
  });

  it("resolves clippings under the sources root", () => {
    expect(resolveClippingsDir(mockConfig())).toBe("/test/vault/Sources/Clippings");
  });

  it("resolves source assets under the sources root", () => {
    expect(resolveSourceAssetsDir(mockConfig())).toBe("/test/vault/Sources/assets");
  });

  it("follows a relocated sources root", () => {
    const config = mockConfig({ paths: { ...DEFAULT_PATHS, sources: "Raw" } });
    expect(resolveClippingsDir(config)).toBe("/test/vault/Raw/Clippings");
  });
});

describe("wiki layer", () => {
  it("resolves the wiki root", () => {
    expect(resolveWikiDir(mockConfig())).toBe("/test/vault/Wiki");
  });

  it("maps each page kind to its subfolder", () => {
    const config = mockConfig();
    expect(resolveWikiSubdir(config, "source")).toBe("/test/vault/Wiki/Sources");
    expect(resolveWikiSubdir(config, "concept")).toBe("/test/vault/Wiki/Concepts");
    expect(resolveWikiSubdir(config, "entity")).toBe("/test/vault/Wiki/Entities");
    expect(resolveWikiSubdir(config, "synthesis")).toBe("/test/vault/Wiki/Synthesis");
  });

  it("resolves a page path inside its kind's subfolder", () => {
    expect(resolveWikiPagePath(mockConfig(), "concept", "vector-search.md")).toBe(
      "/test/vault/Wiki/Concepts/vector-search.md",
    );
  });

  it("resolves the index and the log at the wiki root", () => {
    const config = mockConfig();
    expect(resolveWikiIndexPath(config)).toBe("/test/vault/Wiki/index.md");
    expect(resolveWikiLogPath(config)).toBe("/test/vault/Wiki/log.md");
  });

  it("follows a relocated wiki root", () => {
    const config = mockConfig({ paths: { ...DEFAULT_PATHS, wiki: "KB" } });
    expect(resolveWikiIndexPath(config)).toBe("/test/vault/KB/index.md");
    expect(resolveWikiSubdir(config, "entity")).toBe("/test/vault/KB/Entities");
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
      "/test/vault/Work/Strategy",
    );
  });
});

describe("resolvePracticeLogPath", () => {
  it("resolves to Practice Log.md inside the stories directory", () => {
    const config = mockConfig();
    expect(resolvePracticeLogPath(config)).toBe(
      "/test/vault/Work/Stories/Practice Log.md",
    );
  });
});
