import { describe, it, expect } from "vitest";
import {
  colorForTheme,
  themePosition,
  groupHeight,
  momentPosition,
  GROUP_WIDTH,
  MOMENT_WIDTH,
  MOMENT_HEIGHT,
} from "./layout.js";

describe("colorForTheme", () => {
  it("returns '1' for identity theme", () => {
    expect(colorForTheme("identity")).toBe("1");
  });

  it("returns '2' for family theme", () => {
    expect(colorForTheme("family")).toBe("2");
  });

  it("returns '3' for love theme", () => {
    expect(colorForTheme("love")).toBe("3");
  });

  it("returns '4' for work theme", () => {
    expect(colorForTheme("work")).toBe("4");
  });

  it("returns '5' for loss theme", () => {
    expect(colorForTheme("loss")).toBe("5");
  });

  it("returns '6' for joy theme", () => {
    expect(colorForTheme("joy")).toBe("6");
  });

  it("is case-insensitive", () => {
    expect(colorForTheme("Identity")).toBe("1");
    expect(colorForTheme("FAMILY")).toBe("2");
    expect(colorForTheme("Love")).toBe("3");
    expect(colorForTheme("WORK")).toBe("4");
  });

  it("defaults to '6' for unknown themes", () => {
    expect(colorForTheme("unknown")).toBe("6");
    expect(colorForTheme("pizza")).toBe("6");
    expect(colorForTheme("")).toBe("6");
  });
});

describe("themePosition", () => {
  it("places a single theme at the top of the circle (y = -800, x ~ 0)", () => {
    const pos = themePosition(0, 1);
    // angle = -PI/2, cos(-PI/2) ~ 0, sin(-PI/2) = -1
    expect(pos.x).toBe(0); // Math.round(cos(-PI/2) * 800) = 0
    expect(pos.y).toBe(-800); // Math.round(sin(-PI/2) * 800) = -800
  });

  it("creates 4 distinct positions for 4 themes", () => {
    const positions = [0, 1, 2, 3].map((i) => themePosition(i, 4));
    const uniquePositions = new Set(positions.map((p) => `${p.x},${p.y}`));
    expect(uniquePositions.size).toBe(4);
  });

  it("distributes positions evenly around the circle for 4 themes", () => {
    // 4 themes: angles at -PI/2, 0, PI/2, PI (top, right, bottom, left)
    const top = themePosition(0, 4);
    const right = themePosition(1, 4);
    const bottom = themePosition(2, 4);
    const left = themePosition(3, 4);

    // Top: (0, -800)
    expect(top.x).toBe(0);
    expect(top.y).toBe(-800);

    // Right: (800, 0)
    expect(right.x).toBe(800);
    expect(right.y).toBe(0);

    // Bottom: (0, 800)
    expect(bottom.x).toBe(0);
    expect(bottom.y).toBe(800);

    // Left: (-800, 0)
    expect(left.x).toBe(-800);
    expect(left.y).toBe(0);
  });

  it("all positions are roughly 800 units from origin", () => {
    for (let i = 0; i < 6; i++) {
      const pos = themePosition(i, 6);
      const distance = Math.sqrt(pos.x ** 2 + pos.y ** 2);
      // Rounding may cause slight deviation from exactly 800
      expect(distance).toBeCloseTo(800, 0);
    }
  });
});

describe("groupHeight", () => {
  it("returns minimum 200 for 0 moments", () => {
    expect(groupHeight(0)).toBe(200);
  });

  it("returns minimum 200 for 1 moment", () => {
    // 1 * 120 + 60 = 180, which is less than 200
    expect(groupHeight(1)).toBe(200);
  });

  it("scales with moment count for larger groups", () => {
    // 5 * 120 + 60 = 660
    expect(groupHeight(5)).toBe(660);
  });

  it("returns 300 for 2 moments", () => {
    // 2 * 120 + 60 = 300
    expect(groupHeight(2)).toBe(300);
  });

  it("grows linearly beyond the minimum", () => {
    const h3 = groupHeight(3); // 3*120+60 = 420
    const h4 = groupHeight(4); // 4*120+60 = 540
    expect(h4 - h3).toBe(120);
  });
});

describe("momentPosition", () => {
  it("offsets x by (GROUP_WIDTH - MOMENT_WIDTH) / 2 from group position", () => {
    const pos = momentPosition(100, 200, 0);
    const expectedXOffset = (GROUP_WIDTH - MOMENT_WIDTH) / 2; // (400 - 360) / 2 = 20
    expect(pos.x).toBe(100 + expectedXOffset);
  });

  it("offsets y by 40 from group position for the first item", () => {
    const pos = momentPosition(100, 200, 0);
    expect(pos.y).toBe(200 + 40);
  });

  it("spaces items vertically by 120 (MOMENT_SPACING)", () => {
    const pos0 = momentPosition(0, 0, 0);
    const pos1 = momentPosition(0, 0, 1);
    const pos2 = momentPosition(0, 0, 2);

    expect(pos1.y - pos0.y).toBe(120);
    expect(pos2.y - pos1.y).toBe(120);
  });

  it("keeps x the same for all items in a group", () => {
    const pos0 = momentPosition(50, 100, 0);
    const pos1 = momentPosition(50, 100, 1);
    const pos2 = momentPosition(50, 100, 2);

    expect(pos0.x).toBe(pos1.x);
    expect(pos1.x).toBe(pos2.x);
  });
});

describe("exported constants", () => {
  it("GROUP_WIDTH is 400", () => {
    expect(GROUP_WIDTH).toBe(400);
  });

  it("MOMENT_WIDTH is 360", () => {
    expect(MOMENT_WIDTH).toBe(360);
  });

  it("MOMENT_HEIGHT is 80", () => {
    expect(MOMENT_HEIGHT).toBe(80);
  });
});
