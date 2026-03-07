import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { signalId, readSignals, readRecentSignals, emitSignal, summarizeSignals } from "./signals.js";
import { createTestConfig, writeTestFile } from "./test-helpers.js";
import type { LumisConfig } from "../types/config.js";
import type { Signal, MomentCapturedSignal, ContentPostedSignal, EngagementUpdatedSignal } from "../types/signal.js";

let config: LumisConfig;

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// signalId
// ---------------------------------------------------------------------------
describe("signalId", () => {
  it("returns a string starting with 'sig-'", () => {
    const id = signalId();
    expect(id).toMatch(/^sig-/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 50 }, () => signalId()));
    expect(ids.size).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// readSignals
// ---------------------------------------------------------------------------
describe("readSignals", () => {
  it("returns empty array when file does not exist", () => {
    expect(readSignals(config)).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", "this is not json");
    expect(readSignals(config)).toEqual([]);
  });

  it("returns empty array for wrong version", () => {
    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", JSON.stringify({ version: 99, signals: [] }));
    expect(readSignals(config)).toEqual([]);
  });

  it("returns empty array when signals key is missing", () => {
    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", JSON.stringify({ version: 1 }));
    expect(readSignals(config)).toEqual([]);
  });

  it("parses valid signals file", () => {
    const signalsDir = join(config.vaultPath, config.paths.signals);
    const signal: MomentCapturedSignal = {
      id: "sig-123-abc",
      type: "moment_captured",
      timestamp: new Date().toISOString(),
      data: {
        filename: "test.md",
        themes: ["identity"],
        storyPotential: "high",
        momentType: "realization",
        fiveSecondMoment: "The instant I knew.",
      },
    };

    writeTestFile(signalsDir, "signals.json", JSON.stringify({
      version: 1,
      signals: [signal],
    }));

    const result = readSignals(config);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sig-123-abc");
    expect(result[0].type).toBe("moment_captured");
  });
});

// ---------------------------------------------------------------------------
// emitSignal
// ---------------------------------------------------------------------------
describe("emitSignal", () => {
  it("creates signals dir and file if they do not exist", () => {
    const signal: MomentCapturedSignal = {
      id: signalId(),
      type: "moment_captured",
      timestamp: new Date().toISOString(),
      data: {
        filename: "test.md",
        themes: ["identity"],
        storyPotential: "high",
        momentType: "realization",
        fiveSecondMoment: "A moment.",
      },
    };

    emitSignal(config, signal);

    const signalsPath = join(config.vaultPath, config.paths.signals, "signals.json");
    const raw = readFileSync(signalsPath, "utf-8");
    const file = JSON.parse(raw);
    expect(file.version).toBe(1);
    expect(file.signals).toHaveLength(1);
    expect(file.signals[0].type).toBe("moment_captured");
  });

  it("appends to existing signals", () => {
    const signal1: MomentCapturedSignal = {
      id: signalId(),
      type: "moment_captured",
      timestamp: new Date().toISOString(),
      data: {
        filename: "first.md",
        themes: ["identity"],
        storyPotential: "high",
        momentType: "realization",
        fiveSecondMoment: "First moment.",
      },
    };
    emitSignal(config, signal1);

    const signal2: ContentPostedSignal = {
      id: signalId(),
      type: "content_posted",
      timestamp: new Date().toISOString(),
      data: {
        platform: "linkedin",
        url: "https://linkedin.com/post/123",
        scriptFilename: "script.md",
        pillar: "growth",
      },
    };
    emitSignal(config, signal2);

    const signals = readSignals(config);
    expect(signals).toHaveLength(2);
    expect(signals[0].type).toBe("moment_captured");
    expect(signals[1].type).toBe("content_posted");
  });

  it("prunes signals older than 90 days", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);

    const oldSignal: MomentCapturedSignal = {
      id: "sig-old",
      type: "moment_captured",
      timestamp: oldDate.toISOString(),
      data: {
        filename: "old.md",
        themes: [],
        storyPotential: "low",
        momentType: "joy",
        fiveSecondMoment: "Old.",
      },
    };

    // Pre-seed with the old signal
    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", JSON.stringify({
      version: 1,
      signals: [oldSignal],
    }));

    // Emit a new one, which triggers pruning
    const newSignal: MomentCapturedSignal = {
      id: signalId(),
      type: "moment_captured",
      timestamp: new Date().toISOString(),
      data: {
        filename: "new.md",
        themes: [],
        storyPotential: "low",
        momentType: "joy",
        fiveSecondMoment: "New.",
      },
    };
    emitSignal(config, newSignal);

    const signals = readSignals(config);
    expect(signals).toHaveLength(1);
    expect(signals[0].id).not.toBe("sig-old");
  });
});

// ---------------------------------------------------------------------------
// readRecentSignals
// ---------------------------------------------------------------------------
describe("readRecentSignals", () => {
  it("filters by date range", () => {
    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const fifteenDaysAgo = new Date(now);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const recentSignal: MomentCapturedSignal = {
      id: "sig-recent",
      type: "moment_captured",
      timestamp: fiveDaysAgo.toISOString(),
      data: {
        filename: "recent.md",
        themes: [],
        storyPotential: "low",
        momentType: "joy",
        fiveSecondMoment: "Recent.",
      },
    };

    const olderSignal: MomentCapturedSignal = {
      id: "sig-older",
      type: "moment_captured",
      timestamp: fifteenDaysAgo.toISOString(),
      data: {
        filename: "older.md",
        themes: [],
        storyPotential: "low",
        momentType: "joy",
        fiveSecondMoment: "Older.",
      },
    };

    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", JSON.stringify({
      version: 1,
      signals: [olderSignal, recentSignal],
    }));

    // Only last 7 days
    const last7 = readRecentSignals(config, 7);
    expect(last7).toHaveLength(1);
    expect(last7[0].id).toBe("sig-recent");

    // Last 30 days should include both
    const last30 = readRecentSignals(config, 30);
    expect(last30).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// summarizeSignals
// ---------------------------------------------------------------------------
describe("summarizeSignals", () => {
  it("groups signals by type", () => {
    const now = new Date();

    const momentSignal: MomentCapturedSignal = {
      id: signalId(),
      type: "moment_captured",
      timestamp: now.toISOString(),
      data: {
        filename: "moment.md",
        themes: ["identity"],
        storyPotential: "high",
        momentType: "realization",
        fiveSecondMoment: "A moment.",
      },
    };

    const postedSignal: ContentPostedSignal = {
      id: signalId(),
      type: "content_posted",
      timestamp: now.toISOString(),
      data: {
        platform: "linkedin",
        url: "https://linkedin.com/post/1",
        scriptFilename: "script.md",
        pillar: "growth",
      },
    };

    const engagementSignal: EngagementUpdatedSignal = {
      id: signalId(),
      type: "engagement_updated",
      timestamp: now.toISOString(),
      data: {
        platform: "linkedin",
        url: "https://linkedin.com/post/1",
        views: 100,
        likes: 10,
        comments: 3,
        shares: 2,
      },
    };

    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", JSON.stringify({
      version: 1,
      signals: [momentSignal, postedSignal, engagementSignal],
    }));

    const summary = summarizeSignals(config);
    expect(summary.recentMoments).toHaveLength(1);
    expect(summary.postedContent).toHaveLength(1);
    expect(summary.topEngagement).toHaveLength(1);
    expect(summary.rejectedTopics).toHaveLength(0);
  });
});
