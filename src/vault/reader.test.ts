import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { readMoments, readMoment, readResearchNotes, readStory, readStories, readCanvas } from "./reader.js";
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
// readMoments
// ---------------------------------------------------------------------------
describe("readMoments", () => {
  it("returns empty array when moments dir does not exist", () => {
    expect(readMoments(config)).toEqual([]);
  });

  it("reads .md files from the moments directory", () => {
    const momentsDir = join(config.vaultPath, config.paths.moments);

    writeTestFile(momentsDir, "first-moment.md", [
      "---",
      'date: "2024-01-15"',
      "moment-type: realization",
      "people: [Alice]",
      "places: [Coffee shop]",
      "story-status: captured",
      "story-potential: high",
      "themes: [identity]",
      "tags: [morning]",
      "---",
      "",
      "Something happened today.",
    ].join("\n"));

    writeTestFile(momentsDir, "second-moment.md", [
      "---",
      'date: "2024-01-16"',
      "moment-type: joy",
      "people: []",
      "places: []",
      "story-status: captured",
      "story-potential: low",
      "themes: [joy]",
      "tags: []",
      "---",
      "",
      "A happy day.",
    ].join("\n"));

    const moments = readMoments(config);
    expect(moments).toHaveLength(2);
    expect(moments.map((m) => m.filename).sort()).toEqual([
      "first-moment.md",
      "second-moment.md",
    ]);
  });

  it("skips README.md", () => {
    const momentsDir = join(config.vaultPath, config.paths.moments);

    writeTestFile(momentsDir, "README.md", "# Readme");
    writeTestFile(momentsDir, "real-moment.md", [
      "---",
      'date: "2024-01-15"',
      "moment-type: realization",
      "people: []",
      "places: []",
      "story-status: captured",
      "story-potential: low",
      "themes: []",
      "tags: []",
      "---",
      "",
      "Content.",
    ].join("\n"));

    const moments = readMoments(config);
    expect(moments).toHaveLength(1);
    expect(moments[0].filename).toBe("real-moment.md");
  });
});

// ---------------------------------------------------------------------------
// readMoment
// ---------------------------------------------------------------------------
describe("readMoment", () => {
  it("parses frontmatter correctly", () => {
    const momentsDir = join(config.vaultPath, config.paths.moments);
    writeTestFile(momentsDir, "test.md", [
      "---",
      'date: "2024-01-15"',
      "moment-type: realization",
      "people: [Alice, Bob]",
      "places: [Coffee shop]",
      "story-status: captured",
      "story-potential: high",
      "themes: [identity, growth]",
      "tags: [morning]",
      "---",
      "",
      "Body text.",
    ].join("\n"));

    const moment = readMoment(config, "test.md");
    expect(moment).not.toBeNull();
    expect(moment!.frontmatter.date).toBe("2024-01-15");
    expect(moment!.frontmatter["moment-type"]).toBe("realization");
    expect(moment!.frontmatter.people).toEqual(["Alice", "Bob"]);
    expect(moment!.frontmatter.places).toEqual(["Coffee shop"]);
    expect(moment!.frontmatter["story-status"]).toBe("captured");
    expect(moment!.frontmatter["story-potential"]).toBe("high");
    expect(moment!.frontmatter.themes).toEqual(["identity", "growth"]);
    expect(moment!.frontmatter.tags).toEqual(["morning"]);
  });

  it("extracts fiveSecondMoment from the 5-Second Moment section", () => {
    const momentsDir = join(config.vaultPath, config.paths.moments);
    writeTestFile(momentsDir, "test.md", [
      "---",
      'date: "2024-01-15"',
      "moment-type: realization",
      "people: []",
      "places: []",
      "story-status: captured",
      "story-potential: high",
      "themes: []",
      "tags: []",
      "---",
      "",
      "Something happened today.",
      "",
      "## The 5-Second Moment",
      "",
      "I realized everything changed.",
      "",
      "## Connections",
      "",
      "- None yet.",
    ].join("\n"));

    const moment = readMoment(config, "test.md");
    expect(moment).not.toBeNull();
    expect(moment!.fiveSecondMoment).toBe("I realized everything changed.");
  });

  it("extracts connections from wiki-links in the Connections section", () => {
    const momentsDir = join(config.vaultPath, config.paths.moments);
    writeTestFile(momentsDir, "test.md", [
      "---",
      'date: "2024-01-15"',
      "moment-type: realization",
      "people: []",
      "places: []",
      "story-status: captured",
      "story-potential: high",
      "themes: []",
      "tags: []",
      "---",
      "",
      "Body content.",
      "",
      "## Connections",
      "",
      "- [[Lumis/Moments/other-moment.md|Other Moment]]",
      "- [[Lumis/Moments/another.md|Another One]]",
    ].join("\n"));

    const moment = readMoment(config, "test.md");
    expect(moment).not.toBeNull();
    expect(moment!.connections).toEqual([
      "Lumis/Moments/other-moment.md|Other Moment",
      "Lumis/Moments/another.md|Another One",
    ]);
  });

  it("returns null for non-existent file", () => {
    expect(readMoment(config, "does-not-exist.md")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// readResearchNotes
// ---------------------------------------------------------------------------
describe("readResearchNotes", () => {
  it("returns empty array when research dir does not exist", () => {
    expect(readResearchNotes(config)).toEqual([]);
  });

  it("reads from root research directory", () => {
    const researchDir = join(config.vaultPath, config.paths.research);

    // Write a note in the root research dir
    writeTestFile(researchDir, "root-note.md", [
      "---",
      "title: Root Note",
      "source: https://example.com",
      "author: Author",
      "published: '2024-01-01'",
      "created: '2024-01-01'",
      "tags: [test]",
      "---",
      "",
      "Root content.",
    ].join("\n"));

    writeTestFile(researchDir, "second-note.md", [
      "---",
      "title: Second Note",
      "source: https://example.com/2",
      "author: Author",
      "published: '2024-02-01'",
      "created: '2024-02-01'",
      "tags: [ai]",
      "---",
      "",
      "Second content.",
    ].join("\n"));

    const notes = readResearchNotes(config);
    expect(notes).toHaveLength(2);
    const filenames = notes.map((n) => n.filename).sort();
    expect(filenames).toEqual(["root-note.md", "second-note.md"]);
  });
});

// ---------------------------------------------------------------------------
// readStory
// ---------------------------------------------------------------------------
describe("readStory", () => {
  it("parses story elements: transformation, 5-second moment, turns", () => {
    const storiesDir = join(config.vaultPath, config.paths.stories);
    writeTestFile(storiesDir, "my-story.md", [
      "---",
      "title: My Story",
      "type: story",
      "source: Lumis/Moments/test.md",
      "created: '2024-03-01'",
      "craft-status: drafting",
      "themes: [identity]",
      "tags: [personal]",
      "---",
      "",
      "## Transformation",
      "",
      "**Before**: I was unsure.",
      "**After**: I found clarity.",
      "**The change**: A shift in perspective.",
      "",
      "## The 5-Second Moment",
      "",
      "The instant I knew.",
      "",
      "## The Question",
      "",
      "What if everything changed?",
      "",
      "## Opening Scene",
      "",
      "It was raining that Tuesday.",
      "",
      "## The Stakes",
      "",
      "If I didn't act, nothing would change.",
      "",
      "## The Turns",
      "",
      "- First I hesitated.",
      "- Then I spoke up.",
      "- Finally I walked away.",
      "",
      "## The Story",
      "",
      "The full narrative goes here.",
    ].join("\n"));

    const story = readStory(config, "my-story.md");
    expect(story).not.toBeNull();
    expect(story!.frontmatter.title).toBe("My Story");
    expect(story!.frontmatter["craft-status"]).toBe("drafting");
    expect(story!.elements.transformation).toEqual({
      before: "I was unsure.",
      after: "I found clarity.",
      change: "A shift in perspective.",
    });
    expect(story!.elements.fiveSecondMoment).toBe("The instant I knew.");
    expect(story!.elements.theQuestion).toBe("What if everything changed?");
    expect(story!.elements.openingScene).toBe("It was raining that Tuesday.");
    expect(story!.elements.theStakes).toBe("If I didn't act, nothing would change.");
    expect(story!.elements.theTurns).toEqual([
      "First I hesitated.",
      "Then I spoke up.",
      "Finally I walked away.",
    ]);
    expect(story!.elements.theStory).toBe("The full narrative goes here.");
  });

  it("returns null for non-existent file", () => {
    expect(readStory(config, "nope.md")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// readStories
// ---------------------------------------------------------------------------
describe("readStories", () => {
  it("returns empty array when stories dir does not exist", () => {
    expect(readStories(config)).toEqual([]);
  });

  it("skips README.md and Practice Log.md", () => {
    const storiesDir = join(config.vaultPath, config.paths.stories);
    writeTestFile(storiesDir, "README.md", "# Readme");
    writeTestFile(storiesDir, "Practice Log.md", "# Practice Log");
    writeTestFile(storiesDir, "real-story.md", [
      "---",
      "title: Real Story",
      "type: story",
      "source: test",
      "created: '2024-01-01'",
      "craft-status: drafting",
      "themes: []",
      "tags: []",
      "---",
      "",
      "Content.",
    ].join("\n"));

    const stories = readStories(config);
    expect(stories).toHaveLength(1);
    expect(stories[0].filename).toBe("real-story.md");
  });
});

// ---------------------------------------------------------------------------
// readCanvas
// ---------------------------------------------------------------------------
describe("readCanvas", () => {
  it("returns null when canvas file does not exist", () => {
    expect(readCanvas(config)).toBeNull();
  });

  it("parses valid JSON canvas", () => {
    const canvasPath = join(config.vaultPath, config.paths.canvas);
    const canvasDir = join(canvasPath, "..");
    const filename = config.paths.canvas.split("/").pop()!;

    const canvasData = {
      nodes: [
        { id: "n1", type: "group", x: 0, y: 0, width: 200, height: 100, color: "1", label: "Identity" },
      ],
      edges: [
        { id: "e1", fromNode: "n1", toNode: "n2", fromSide: "right", toSide: "left" },
      ],
    };

    writeTestFile(canvasDir, filename, JSON.stringify(canvasData));

    const canvas = readCanvas(config);
    expect(canvas).not.toBeNull();
    expect(canvas!.nodes).toHaveLength(1);
    expect(canvas!.nodes[0].id).toBe("n1");
    expect(canvas!.edges).toHaveLength(1);
    expect(canvas!.edges[0].fromNode).toBe("n1");
  });

  it("returns null for invalid JSON", () => {
    const canvasPath = join(config.vaultPath, config.paths.canvas);
    const canvasDir = join(canvasPath, "..");
    const filename = config.paths.canvas.split("/").pop()!;

    writeTestFile(canvasDir, filename, "not valid json {{");

    expect(readCanvas(config)).toBeNull();
  });
});
