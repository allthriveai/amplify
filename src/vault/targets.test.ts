import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  parseTargetLine,
  formatTarget,
  extractTargetsSection,
  replaceTargetsSection,
  readActiveTargets,
  computeTargetStatus,
  writeActiveTargets,
  updateTargetLastTouched,
} from "./targets.js";
import { resolveGoalsPath } from "./paths.js";
import { createTestConfig } from "./test-helpers.js";
import type { LumisConfig } from "../types/config.js";

let config: LumisConfig;

function writeGoals(content: string): void {
  const path = resolveGoalsPath(config);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

beforeEach(() => {
  config = createTestConfig();
});

afterEach(() => {
  rmSync(config.vaultPath, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// parseTargetLine
// ---------------------------------------------------------------------------
describe("parseTargetLine", () => {
  it("parses text, cadence, last, and goal tags", () => {
    const target = parseTargetLine("- [ ] LinkedIn post `cadence:weekly` `last:2026-04-21` #goal/visibility");
    expect(target).toMatchObject({
      text: "LinkedIn post",
      cadence: "weekly",
      last: "2026-04-21",
      goalTags: ["#goal/visibility"],
      done: false,
    });
  });

  it("accepts metadata without backticks", () => {
    expect(parseTargetLine("- [ ] Ship it cadence:monthly")).toMatchObject({
      text: "Ship it",
      cadence: "monthly",
    });
  });

  it("leaves cadence null when absent or unrecognized", () => {
    expect(parseTargetLine("- [ ] No cadence here")?.cadence).toBeNull();
    expect(parseTargetLine("- [ ] Bad `cadence:fortnightly`")?.cadence).toBeNull();
  });

  it("returns null for non-target lines", () => {
    expect(parseTargetLine("## Active Targets")).toBeNull();
    expect(parseTargetLine("- a plain bullet")).toBeNull();
  });

  it("returns null when only metadata remains", () => {
    expect(parseTargetLine("- [ ] `cadence:weekly`")).toBeNull();
  });

  it("round-trips through formatTarget", () => {
    const line = "- [ ] LinkedIn post `cadence:weekly` `last:2026-04-21` #goal/visibility";
    expect(formatTarget(parseTargetLine(line)!)).toBe(line);
  });
});

// ---------------------------------------------------------------------------
// Section extraction
// ---------------------------------------------------------------------------
describe("extractTargetsSection", () => {
  it("returns null when the section is missing", () => {
    expect(extractTargetsSection("# Goals\n\n## Something else\ntext")).toBeNull();
  });

  it("stops at the next H2", () => {
    const goals = "## Active Targets\n- [ ] one\n\n## How I'll know\nprose";
    const section = extractTargetsSection(goals);
    expect(section).toContain("- [ ] one");
    expect(section).not.toContain("prose");
  });
});

describe("extractTargetsSection comments", () => {
  it("ignores targets inside an HTML comment", () => {
    const goals = [
      "## Active Targets",
      "- [ ] Journal `cadence:daily` #goal/journal",
      "<!-- parked until the first one sticks:",
      "- [ ] Practice Spanish `cadence:daily` #goal/spanish",
      "-->",
    ].join("\n");

    const section = extractTargetsSection(goals);
    expect(section).toContain("#goal/journal");
    expect(section).not.toContain("#goal/spanish");
  });

  it("ignores a single-line commented target", () => {
    const goals = [
      "## Active Targets",
      "- [ ] Journal `cadence:daily` #goal/journal",
      "<!-- - [ ] Work out `cadence:weekly` #goal/workout -->",
    ].join("\n");

    expect(extractTargetsSection(goals)).not.toContain("#goal/workout");
  });

  it("drops an unterminated comment rather than reopening the section", () => {
    const goals = [
      "## Active Targets",
      "- [ ] Journal `cadence:daily` #goal/journal",
      "<!-- forgot to close this",
      "- [ ] Work out `cadence:weekly` #goal/workout",
    ].join("\n");

    const section = extractTargetsSection(goals);
    expect(section).toContain("#goal/journal");
    expect(section).not.toContain("#goal/workout");
  });
});

describe("replaceTargetsSection", () => {
  it("appends the section when it does not exist", () => {
    const out = replaceTargetsSection("# Goals\n\n## Targets\nprose", "- [ ] new");
    expect(out).toContain("## Active Targets");
    expect(out).toContain("- [ ] new");
  });

  it("replaces the body while preserving what follows", () => {
    const goals = "## Active Targets\n- [ ] old\n\n## How I'll know\nprose here";
    const out = replaceTargetsSection(goals, "- [ ] fresh");
    expect(out).toContain("- [ ] fresh");
    expect(out).not.toContain("- [ ] old");
    expect(out).toContain("prose here");
  });
});

// ---------------------------------------------------------------------------
// readActiveTargets
// ---------------------------------------------------------------------------
describe("readActiveTargets", () => {
  it("returns empty when Goals.md is missing", () => {
    expect(readActiveTargets(config)).toEqual([]);
  });

  it("returns empty when the section is missing", () => {
    writeGoals("# Goals\n\n## The job I want\nprose");
    expect(readActiveTargets(config)).toEqual([]);
  });

  it("reads only the targets section", () => {
    writeGoals(`# Goals

## The job I want
- [ ] this is prose, not a target

## Active Targets
- [ ] LinkedIn post \`cadence:weekly\`
- [ ] Long-form piece \`cadence:monthly\`

## How I'll know
done`);
    const targets = readActiveTargets(config);
    expect(targets.map((t) => t.text)).toEqual(["LinkedIn post", "Long-form piece"]);
  });
});

// ---------------------------------------------------------------------------
// computeTargetStatus
// ---------------------------------------------------------------------------
describe("computeTargetStatus", () => {
  it("marks a weekly target overdue after seven days", () => {
    const targets = [parseTargetLine("- [ ] Post `cadence:weekly` `last:2026-08-01`")!];
    const [status] = computeTargetStatus(targets, "2026-08-19");
    expect(status.daysSince).toBe(18);
    expect(status.overdue).toBe(true);
  });

  it("leaves a target inside its window alone", () => {
    const targets = [parseTargetLine("- [ ] Post `cadence:weekly` `last:2026-08-15`")!];
    expect(computeTargetStatus(targets, "2026-08-19")[0].overdue).toBe(false);
  });

  it("treats a never-touched target with a cadence as overdue", () => {
    const targets = [parseTargetLine("- [ ] Post `cadence:weekly`")!];
    const [status] = computeTargetStatus(targets, "2026-08-19");
    expect(status.daysSince).toBeNull();
    expect(status.overdue).toBe(true);
  });

  it("cannot judge a target with no cadence", () => {
    const targets = [parseTargetLine("- [ ] Someday thing")!];
    expect(computeTargetStatus(targets, "2026-08-19")[0].overdue).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------
describe("writeActiveTargets", () => {
  it("preserves the prose around the section", () => {
    writeGoals("# Goals\n\n## The job I want\nApplied AI.\n\n## Active Targets\n- [ ] old\n\n## How I'll know\nprose");
    writeActiveTargets(config, [parseTargetLine("- [ ] LinkedIn post `cadence:weekly`")!]);

    const out = readFileSync(resolveGoalsPath(config), "utf-8");
    expect(out).toContain("Applied AI.");
    expect(out).toContain("prose");
    expect(out).toContain("- [ ] LinkedIn post `cadence:weekly`");
    expect(out).not.toContain("- [ ] old");
  });
});

describe("updateTargetLastTouched", () => {
  beforeEach(() => {
    writeGoals("# Goals\n\n## Active Targets\n- [ ] LinkedIn post `cadence:weekly` `last:2026-04-21`\n");
  });

  it("stamps the matching target", () => {
    expect(updateTargetLastTouched(config, "LinkedIn post", "2026-08-19")).toBe(true);
    expect(readActiveTargets(config)[0].last).toBe("2026-08-19");
  });

  it("matches case-insensitively", () => {
    expect(updateTargetLastTouched(config, "linkedin POST", "2026-08-19")).toBe(true);
  });

  it("reports a miss instead of writing", () => {
    expect(updateTargetLastTouched(config, "nonexistent", "2026-08-19")).toBe(false);
    expect(readActiveTargets(config)[0].last).toBe("2026-04-21");
  });
});
