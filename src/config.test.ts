import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolve } from "node:path";
import { DEFAULT_PATHS, DEFAULT_RESEARCH_CATEGORIES } from "./types/config.js";

// Mock dotenv before importing config
vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

// Mock fs to prevent readLumisrc from reading real files
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(() => false),
}));

// Import after mocks are set up
const { loadConfig } = await import("./config.js");

beforeEach(() => {
  vi.clearAllMocks();
  // Clear relevant env vars so they don't leak between tests
  delete process.env.VAULT_PATH;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.HEYGEN_API_KEY;
  delete process.env.HEYGEN_AVATAR_ID;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_ID;
});

describe("loadConfig", () => {
  it("applies defaults when no overrides, no rc, and no env vars", () => {
    const config = loadConfig();

    expect(config.vaultPath).toBe(resolve(""));
    expect(config.anthropicApiKey).toBe("");
    expect(config.paths).toEqual(DEFAULT_PATHS);
    expect(config.researchCategories).toEqual(DEFAULT_RESEARCH_CATEGORIES);
  });

  it("uses explicit overrides", () => {
    const config = loadConfig({
      vaultPath: "/my/vault",
      anthropicApiKey: "sk-override",
      paths: {
        ...DEFAULT_PATHS,
        moments: "Custom/Moments",
      },
    });

    expect(config.vaultPath).toBe("/my/vault");
    expect(config.anthropicApiKey).toBe("sk-override");
    expect(config.paths.moments).toBe("Custom/Moments");
    // Non-overridden paths stay at defaults
    expect(config.paths.stories).toBe(DEFAULT_PATHS.stories);
  });

  it("falls back to env vars when no overrides and no rc", () => {
    process.env.VAULT_PATH = "/env/vault";
    process.env.ANTHROPIC_API_KEY = "sk-env";

    const config = loadConfig();

    expect(config.vaultPath).toBe("/env/vault");
    expect(config.anthropicApiKey).toBe("sk-env");
  });

  it("prefers overrides over env vars", () => {
    process.env.VAULT_PATH = "/env/vault";
    process.env.ANTHROPIC_API_KEY = "sk-env";

    const config = loadConfig({
      vaultPath: "/override/vault",
      anthropicApiKey: "sk-override",
    });

    expect(config.vaultPath).toBe("/override/vault");
    expect(config.anthropicApiKey).toBe("sk-override");
  });

  it("resolves tilde in vaultPath to HOME", () => {
    const home = process.env.HOME ?? "";
    const config = loadConfig({ vaultPath: "~/my-vault" });

    expect(config.vaultPath).toBe(resolve(`${home}/my-vault`));
  });

  it("returns no studio config when no studio keys are set", () => {
    const config = loadConfig();

    expect(config.studio).toBeUndefined();
  });

  it("returns studio config when at least one key is set via overrides", () => {
    const config = loadConfig({
      studio: {
        heygenApiKey: "hg-key",
      },
    });

    expect(config.studio).toBeDefined();
    expect(config.studio?.heygenApiKey).toBe("hg-key");
  });

  it("returns studio config when at least one key is set via env", () => {
    process.env.HEYGEN_API_KEY = "hg-env-key";

    const config = loadConfig();

    expect(config.studio).toBeDefined();
    expect(config.studio?.heygenApiKey).toBe("hg-env-key");
  });

  it("returns undefined studio when all studio env vars are empty", () => {
    // No studio env vars set, no overrides
    const config = loadConfig();

    expect(config.studio).toBeUndefined();
  });

  it("merges individual path overrides while keeping other defaults", () => {
    const config = loadConfig({
      paths: {
        ...DEFAULT_PATHS,
        research: "My Research",
        signals: "My Signals",
      },
    });

    expect(config.paths.research).toBe("My Research");
    expect(config.paths.signals).toBe("My Signals");
    expect(config.paths.moments).toBe(DEFAULT_PATHS.moments);
    expect(config.paths.voice).toBe(DEFAULT_PATHS.voice);
  });
});
