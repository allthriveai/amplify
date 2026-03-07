import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { writeMoment, writeResearchNote, writeStory, appendPracticeLog, writeCanvas } from "./writer.js";
import { parseFrontmatter } from "./frontmatter.js";
import { createTestConfig, writeTestFile } from "./test-helpers.js";
import type { LumisConfig } from "../types/config.js";
import type { MomentFrontmatter } from "../types/moment.js";
import type { ResearchFrontmatter } from "../types/research.js";
import type { StoryFrontmatter } from "../types/story.js";
import type { CanvasFile } from "../types/canvas.js";

let config: LumisConfig;

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// writeMoment
// ---------------------------------------------------------------------------
describe("writeMoment", () => {
  const sampleFrontmatter: MomentFrontmatter = {
    date: "2024-01-15",
    "moment-type": "realization",
    people: ["Alice"],
    places: ["Coffee shop"],
    "story-status": "captured",
    "story-potential": "high",
    themes: ["identity", "growth"],
    tags: ["morning"],
  };

  it("creates file in moments dir with serialized frontmatter", () => {
    const filepath = writeMoment(config, "test-moment.md", sampleFrontmatter, "Body text.");
    expect(existsSync(filepath)).toBe(true);

    const raw = readFileSync(filepath, "utf-8");
    expect(raw).toContain("date: '2024-01-15'");
    expect(raw).toContain("Body text.");
  });

  it("creates moments directory if it does not exist", () => {
    const momentsDir = join(config.vaultPath, config.paths.moments);
    expect(existsSync(momentsDir)).toBe(false);

    writeMoment(config, "test.md", sampleFrontmatter, "Content.");
    expect(existsSync(momentsDir)).toBe(true);
  });

  it("content can be read back with parseFrontmatter", () => {
    const filepath = writeMoment(config, "roundtrip.md", sampleFrontmatter, "Round trip content.");
    const raw = readFileSync(filepath, "utf-8");
    const parsed = parseFrontmatter<MomentFrontmatter>(raw);

    expect(parsed.frontmatter.date).toBe("2024-01-15");
    expect(parsed.frontmatter["moment-type"]).toBe("realization");
    expect(parsed.frontmatter.people).toEqual(["Alice"]);
    expect(parsed.frontmatter.themes).toEqual(["identity", "growth"]);
    expect(parsed.content).toBe("Round trip content.");
  });
});

// ---------------------------------------------------------------------------
// writeResearchNote
// ---------------------------------------------------------------------------
describe("writeResearchNote", () => {
  const sampleFrontmatter: ResearchFrontmatter = {
    title: "Test Research",
    source: "https://example.com",
    author: "Author Name",
    published: "2024-01-01",
    created: "2024-01-01",
    tags: ["test"],
  };

  it("writes to root research dir without category", () => {
    const filepath = writeResearchNote(config, "note.md", sampleFrontmatter, "Research content.");
    expect(existsSync(filepath)).toBe(true);

    const researchDir = join(config.vaultPath, config.paths.research);
    expect(filepath).toBe(join(researchDir, "note.md"));
  });

  it("writes to root research dir even when no categories configured", () => {
    const filepath = writeResearchNote(config, "ai-note.md", sampleFrontmatter, "AI research.");
    expect(existsSync(filepath)).toBe(true);

    const researchDir = join(config.vaultPath, config.paths.research);
    expect(filepath).toBe(join(researchDir, "ai-note.md"));
  });
});

// ---------------------------------------------------------------------------
// writeStory
// ---------------------------------------------------------------------------
describe("writeStory", () => {
  it("creates story file with correct frontmatter", () => {
    const frontmatter: StoryFrontmatter = {
      title: "My Story",
      type: "story",
      source: "Lumis/Moments/test.md",
      created: "2024-03-01",
      "craft-status": "drafting",
      themes: ["identity"],
      tags: ["personal"],
    };

    const filepath = writeStory(config, "my-story.md", frontmatter, "The full story.");
    expect(existsSync(filepath)).toBe(true);

    const raw = readFileSync(filepath, "utf-8");
    const parsed = parseFrontmatter<StoryFrontmatter>(raw);
    expect(parsed.frontmatter.title).toBe("My Story");
    expect(parsed.frontmatter.type).toBe("story");
    expect(parsed.frontmatter["craft-status"]).toBe("drafting");
    expect(parsed.content).toBe("The full story.");
  });
});

// ---------------------------------------------------------------------------
// appendPracticeLog
// ---------------------------------------------------------------------------
describe("appendPracticeLog", () => {
  const entry = {
    date: "2024-03-15",
    momentTitle: "Coffee Realization",
    element: "five-second-moment",
    response: "I looked up and saw her face change.",
    summary: "Practiced finding the precise moment.",
  };

  it("creates new file with header if it does not exist", () => {
    const filepath = appendPracticeLog(config, entry);
    expect(existsSync(filepath)).toBe(true);

    const content = readFileSync(filepath, "utf-8");
    expect(content).toContain("# Story Craft Practice Log");
    expect(content).toContain("## 2024-03-15 — five-second-moment");
    expect(content).toContain("**Moment**: Coffee Realization");
  });

  it("appends to existing file", () => {
    // Write first entry
    appendPracticeLog(config, entry);

    // Write second entry
    const secondEntry = {
      date: "2024-03-16",
      momentTitle: "Walk in the Park",
      element: "opening-scene",
      response: "The leaves were falling.",
      summary: "Practiced scene setting.",
    };
    const filepath = appendPracticeLog(config, secondEntry);

    const content = readFileSync(filepath, "utf-8");
    // Both entries should be present
    expect(content).toContain("## 2024-03-15 — five-second-moment");
    expect(content).toContain("## 2024-03-16 — opening-scene");
    expect(content).toContain("**Moment**: Coffee Realization");
    expect(content).toContain("**Moment**: Walk in the Park");
  });
});

// ---------------------------------------------------------------------------
// writeCanvas
// ---------------------------------------------------------------------------
describe("writeCanvas", () => {
  it("writes valid JSON that can be parsed back", () => {
    const canvas: CanvasFile = {
      nodes: [
        { id: "g1", type: "group", x: 0, y: 0, width: 400, height: 300, color: "1", label: "Identity" },
        { id: "f1", type: "file", file: "Lumis/Moments/test.md", x: 10, y: 10, width: 200, height: 100, color: "1" },
      ],
      edges: [
        { id: "e1", fromNode: "f1", toNode: "g1", fromSide: "right", toSide: "left" },
      ],
    };

    const filepath = writeCanvas(config, canvas);
    expect(existsSync(filepath)).toBe(true);

    const raw = readFileSync(filepath, "utf-8");
    const parsed = JSON.parse(raw) as CanvasFile;
    expect(parsed.nodes).toHaveLength(2);
    expect(parsed.edges).toHaveLength(1);
    expect(parsed.nodes[0].id).toBe("g1");
  });
});
