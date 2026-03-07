import { describe, it, expect } from "vitest";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.js";

describe("parseFrontmatter", () => {
  it("extracts frontmatter and content from valid markdown", () => {
    const markdown = `---
title: My Note
tags:
  - test
  - demo
---

This is the body content.

It has multiple paragraphs.`;

    const result = parseFrontmatter(markdown);

    expect(result.frontmatter).toEqual({
      title: "My Note",
      tags: ["test", "demo"],
    });
    expect(result.content).toBe(
      "This is the body content.\n\nIt has multiple paragraphs.",
    );
  });

  it("handles empty frontmatter", () => {
    const markdown = `---
---

Some content here.`;

    const result = parseFrontmatter(markdown);

    expect(result.frontmatter).toEqual({});
    expect(result.content).toBe("Some content here.");
  });

  it("handles empty content", () => {
    const markdown = `---
title: Empty Body
status: draft
---`;

    const result = parseFrontmatter(markdown);

    expect(result.frontmatter).toEqual({
      title: "Empty Body",
      status: "draft",
    });
    expect(result.content).toBe("");
  });

  it("handles markdown with no frontmatter delimiters", () => {
    const markdown = "Just plain markdown with no frontmatter at all.";

    const result = parseFrontmatter(markdown);

    expect(result.frontmatter).toEqual({});
    expect(result.content).toBe("Just plain markdown with no frontmatter at all.");
  });

  it("preserves typed frontmatter via generic parameter", () => {
    interface NoteFrontmatter {
      title: string;
      created: string;
    }

    const markdown = `---
title: Typed Note
created: "2024-01-15"
---

Body text.`;

    const result = parseFrontmatter<NoteFrontmatter>(markdown);

    expect(result.frontmatter.title).toBe("Typed Note");
    expect(result.frontmatter.created).toBe("2024-01-15");
  });
});

describe("serializeFrontmatter", () => {
  it("produces valid frontmatter + content", () => {
    const frontmatter = { title: "Test", tags: ["a", "b"] };
    const content = "Hello world.";

    const result = serializeFrontmatter(frontmatter, content);

    // Should contain YAML delimiters and both frontmatter and content
    expect(result).toContain("---");
    expect(result).toContain("title: Test");
    expect(result).toContain("Hello world.");
  });

  it("handles empty frontmatter object", () => {
    const result = serializeFrontmatter({}, "Some content.");

    expect(result).toContain("Some content.");
  });

  it("handles empty content string", () => {
    const result = serializeFrontmatter({ title: "No Body" }, "");

    expect(result).toContain("title: No Body");
  });
});

describe("round-trip", () => {
  it("parse then serialize then parse produces same data", () => {
    const original = `---
title: Round Trip
tags:
  - alpha
  - beta
status: published
---

The quick brown fox jumps over the lazy dog.

Second paragraph here.`;

    const first = parseFrontmatter(original);
    const serialized = serializeFrontmatter(first.frontmatter, first.content);
    const second = parseFrontmatter(serialized);

    expect(second.frontmatter).toEqual(first.frontmatter);
    expect(second.content).toBe(first.content);
  });

  it("round-trips numeric and boolean frontmatter values", () => {
    const original = `---
count: 42
active: true
---

Content.`;

    const first = parseFrontmatter(original);
    const serialized = serializeFrontmatter(first.frontmatter, first.content);
    const second = parseFrontmatter(serialized);

    expect(second.frontmatter).toEqual({ count: 42, active: true });
    expect(second.content).toBe("Content.");
  });
});
