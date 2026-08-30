import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { readClippings, readStory, readStories } from "./reader.js";
import { createTestConfig, writeTestFile } from "./test-helpers.js";
import type { AmplifyConfig } from "../types/config.js";

let config: AmplifyConfig;

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

describe("readClippings", () => {
  it("returns empty array when the clippings dir does not exist", () => {
    expect(readClippings(config)).toEqual([]);
  });

  it("reads every clipping from the flat source layer", () => {
    const clippingsDir = join(config.vaultPath, config.paths.sources, "Clippings");

    writeTestFile(clippingsDir, "root-note.md", [
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

    writeTestFile(clippingsDir, "second-note.md", [
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

    const notes = readClippings(config);
    expect(notes).toHaveLength(2);
    expect(notes.map((n) => n.filename).sort()).toEqual(["root-note.md", "second-note.md"]);
  });

  it("skips README.md so folder hubs never read as sources", () => {
    const clippingsDir = join(config.vaultPath, config.paths.sources, "Clippings");
    writeTestFile(clippingsDir, "README.md", "# Clippings\n");
    expect(readClippings(config)).toEqual([]);
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
      "source: Sources/Clippings/test.md",
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
