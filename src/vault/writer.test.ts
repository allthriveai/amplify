import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { writeClipping, writeWikiPage, writeStory } from "./writer.js";
import { parseFrontmatter } from "./frontmatter.js";
import { createTestConfig, writeTestFile } from "./test-helpers.js";
import type { AmplifyConfig } from "../types/config.js";
import type { ClippingFrontmatter } from "../types/source.js";
import type { WikiFrontmatter } from "../types/wiki.js";
import type { StoryFrontmatter } from "../types/story.js";

let config: AmplifyConfig;

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// writeMoment
// ---------------------------------------------------------------------------
describe("writeClipping", () => {
  const sampleFrontmatter: ClippingFrontmatter = {
    title: "Test Source",
    source: "https://example.com",
    author: "Author Name",
    published: "2024-01-01",
    created: "2024-01-01",
    tags: ["test"],
  };

  it("writes into the flat clippings dir", () => {
    const filepath = writeClipping(config, "note.md", sampleFrontmatter, "Source content.");
    expect(existsSync(filepath)).toBe(true);
    expect(filepath).toBe(join(config.vaultPath, config.paths.sources, "Clippings", "note.md"));
  });
});

// ---------------------------------------------------------------------------
// writeWikiPage
// ---------------------------------------------------------------------------
describe("writeWikiPage", () => {
  const sampleFrontmatter: WikiFrontmatter = {
    tags: ["retrieval"],
    sources: ["note.md"],
    created: "2024-01-01",
    updated: "2024-01-02",
    aliases: ["Round Trip"],
  };

  it("files each kind under its own subfolder", () => {
    const wiki = join(config.vaultPath, config.paths.wiki);

    expect(writeWikiPage(config, "concept", "vector-search.md", sampleFrontmatter, "Body."))
      .toBe(join(wiki, "Concepts", "vector-search.md"));
    expect(writeWikiPage(config, "entity", "some-org.md", sampleFrontmatter, "Body."))
      .toBe(join(wiki, "Entities", "some-org.md"));
    expect(writeWikiPage(config, "summary", "note.md", sampleFrontmatter, "Body."))
      .toBe(join(wiki, "Summaries", "note.md"));
    expect(writeWikiPage(config, "synthesis", "a-vs-b.md", sampleFrontmatter, "Body."))
      .toBe(join(wiki, "Synthesis", "a-vs-b.md"));
  });

  it("round-trips the frontmatter it was given", () => {
    const filepath = writeWikiPage(config, "concept", "rt.md", sampleFrontmatter, "Body text.");
    const raw = readFileSync(filepath, "utf-8");
    expect(raw).toContain("sources:");
    expect(raw).toContain("note.md");
    expect(raw).toContain("updated: '2024-01-02'");
    expect(raw).toContain("Body text.");
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
      source: "Sources/Clippings/test.md",
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
