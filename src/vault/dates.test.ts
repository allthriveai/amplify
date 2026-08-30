import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "./frontmatter.js";
import { normalizeDateKey, todayKey, daysBetween, shiftDateKey } from "./dates.js";

// The trap this file exists for: YAML parses an unquoted `updated:` into a Date,
// not the string the type declares. Anything that sorts or compares those values
// as strings throws at runtime, and only once a second page exists to compare
// against — so a one-page vault looks fine and a real vault does not.
describe("frontmatter dates are not strings", () => {
  const page = `---
tags: [retrieval]
sources: [a.md]
created: 2026-08-01
updated: 2026-08-25
aliases: [Chunking Strategy]
---

# Chunking Strategy
`;

  it("yields a Date, not a string, for an unquoted date", () => {
    const { frontmatter } = parseFrontmatter<Record<string, unknown>>(page);
    expect(frontmatter.updated).toBeInstanceOf(Date);
    expect(typeof frontmatter.updated).not.toBe("string");
  });

  it("normalizeDateKey makes it sortable", () => {
    const { frontmatter } = parseFrontmatter<Record<string, unknown>>(page);
    const key = normalizeDateKey(frontmatter.updated);
    expect(key).toBe("2026-08-25");
    expect(() => key!.localeCompare("2026-08-20")).not.toThrow();
  });

  it("sorts two pages by normalized date without throwing", () => {
    const older = normalizeDateKey(new Date("2026-08-20T00:00:00Z"))!;
    const newer = normalizeDateKey(new Date("2026-08-25T00:00:00Z"))!;
    const sorted = [older, newer].sort((a, b) => b.localeCompare(a));
    expect(sorted).toEqual(["2026-08-25", "2026-08-20"]);
  });

  it("returns null for junk rather than throwing", () => {
    expect(normalizeDateKey(undefined)).toBeNull();
    expect(normalizeDateKey(null)).toBeNull();
    expect(normalizeDateKey("not a date")).toBeNull();
    expect(normalizeDateKey(new Date("nope"))).toBeNull();
  });
});

describe("date math stays in local time", () => {
  it("todayKey is a YYYY-MM-DD key", () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("daysBetween counts calendar days", () => {
    expect(daysBetween("2026-08-20", "2026-08-25")).toBe(5);
    expect(daysBetween("2026-08-25", "2026-08-25")).toBe(0);
  });

  it("shiftDateKey crosses a month boundary", () => {
    expect(shiftDateKey("2026-08-30", 3)).toBe("2026-09-02");
    expect(shiftDateKey("2026-09-02", -3)).toBe("2026-08-30");
  });
});
