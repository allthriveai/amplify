import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { signalId, readSignals, readRecentSignals, emitSignal, summarizeSignals } from "./signals.js";
import { createTestConfig, writeTestFile } from "./test-helpers.js";
import type { AmplifyConfig } from "../types/config.js";
import type { Signal, SourceIngestedSignal, ContentPostedSignal, EngagementUpdatedSignal } from "../types/signal.js";

let config: AmplifyConfig;

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
    const signal: SourceIngestedSignal = {
      id: "sig-123-abc",
      type: "source_ingested",
      timestamp: new Date().toISOString(),
      data: {
        filename: "test.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
      },
    };

    writeTestFile(signalsDir, "signals.json", JSON.stringify({
      version: 1,
      signals: [signal],
    }));

    const result = readSignals(config);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sig-123-abc");
    expect(result[0].type).toBe("source_ingested");
  });
});

// ---------------------------------------------------------------------------
// emitSignal
// ---------------------------------------------------------------------------
describe("emitSignal", () => {
  it("creates signals dir and file if they do not exist", () => {
    const signal: SourceIngestedSignal = {
      id: signalId(),
      type: "source_ingested",
      timestamp: new Date().toISOString(),
      data: {
        filename: "test.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
      },
    };

    emitSignal(config, signal);

    const signalsPath = join(config.vaultPath, config.paths.signals, "signals.json");
    const raw = readFileSync(signalsPath, "utf-8");
    const file = JSON.parse(raw);
    expect(file.version).toBe(1);
    expect(file.signals).toHaveLength(1);
    expect(file.signals[0].type).toBe("source_ingested");
  });

  it("appends to existing signals", () => {
    const signal1: SourceIngestedSignal = {
      id: signalId(),
      type: "source_ingested",
      timestamp: new Date().toISOString(),
      data: {
        filename: "first.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
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
    expect(signals[0].type).toBe("source_ingested");
    expect(signals[1].type).toBe("content_posted");
  });

  it("prunes signals older than 90 days", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);

    const oldSignal: SourceIngestedSignal = {
      id: "sig-old",
      type: "source_ingested",
      timestamp: oldDate.toISOString(),
      data: {
        filename: "old.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
      },
    };

    // Pre-seed with the old signal
    const signalsDir = join(config.vaultPath, config.paths.signals);
    writeTestFile(signalsDir, "signals.json", JSON.stringify({
      version: 1,
      signals: [oldSignal],
    }));

    // Emit a new one, which triggers pruning
    const newSignal: SourceIngestedSignal = {
      id: signalId(),
      type: "source_ingested",
      timestamp: new Date().toISOString(),
      data: {
        filename: "new.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
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

    const recentSignal: SourceIngestedSignal = {
      id: "sig-recent",
      type: "source_ingested",
      timestamp: fiveDaysAgo.toISOString(),
      data: {
        filename: "recent.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
      },
    };

    const olderSignal: SourceIngestedSignal = {
      id: "sig-older",
      type: "source_ingested",
      timestamp: fifteenDaysAgo.toISOString(),
      data: {
        filename: "older.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
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

    const ingestSignal: SourceIngestedSignal = {
      id: signalId(),
      type: "source_ingested",
      timestamp: now.toISOString(),
      data: {
        filename: "moment.md",
        title: "Test Source",
        wikiPages: ["Retrieval Augmented Generation"],
        tags: ["retrieval"],
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
      signals: [ingestSignal, postedSignal, engagementSignal],
    }));

    const summary = summarizeSignals(config);
    expect(summary.recentIngests).toHaveLength(1);
    expect(summary.postedContent).toHaveLength(1);
    expect(summary.topEngagement).toHaveLength(1);
    expect(summary.rejectedTopics).toHaveLength(0);
  });
});
