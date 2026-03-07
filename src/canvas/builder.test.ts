import { describe, it, expect } from "vitest";
import { buildCanvas } from "./builder.js";
import type { Moment } from "../types/moment.js";

function mockMoment(overrides: Partial<Moment> = {}): Moment {
  return {
    filename: overrides.filename ?? "test-moment.md",
    path: overrides.path ?? "Moments/test-moment.md",
    frontmatter: {
      date: "2024-01-01",
      "moment-type": "realization",
      people: [],
      places: [],
      "story-status": "captured",
      "story-potential": "medium",
      themes: ["identity"],
      tags: [],
      ...overrides.frontmatter,
    },
    content: overrides.content ?? "A test moment.",
    connections: overrides.connections ?? [],
    ...(overrides.fiveSecondMoment !== undefined
      ? { fiveSecondMoment: overrides.fiveSecondMoment }
      : {}),
  };
}

describe("buildCanvas", () => {
  it("returns empty nodes and edges for an empty array", () => {
    const canvas = buildCanvas([]);
    expect(canvas.nodes).toEqual([]);
    expect(canvas.edges).toEqual([]);
  });

  it("creates 1 group node + 1 file node for a single moment", () => {
    const moment = mockMoment();
    const canvas = buildCanvas([moment]);

    expect(canvas.nodes).toHaveLength(2);

    const groupNode = canvas.nodes.find((n) => n.type === "group");
    const fileNode = canvas.nodes.find((n) => n.type === "file");

    expect(groupNode).toBeDefined();
    expect(fileNode).toBeDefined();
  });

  it("groups moments by their first theme", () => {
    const m1 = mockMoment({
      filename: "m1.md",
      path: "Moments/m1.md",
      frontmatter: {
        date: "2024-01-01",
        "moment-type": "realization",
        people: [],
        places: [],
        "story-status": "captured",
        "story-potential": "medium",
        themes: ["work"],
        tags: [],
      },
    });
    const m2 = mockMoment({
      filename: "m2.md",
      path: "Moments/m2.md",
      frontmatter: {
        date: "2024-01-02",
        "moment-type": "joy",
        people: [],
        places: [],
        "story-status": "captured",
        "story-potential": "medium",
        themes: ["work", "joy"],
        tags: [],
      },
    });
    const m3 = mockMoment({
      filename: "m3.md",
      path: "Moments/m3.md",
      frontmatter: {
        date: "2024-01-03",
        "moment-type": "connection",
        people: [],
        places: [],
        "story-status": "captured",
        "story-potential": "high",
        themes: ["family"],
        tags: [],
      },
    });

    const canvas = buildCanvas([m1, m2, m3]);

    // 2 theme groups (work, family) -> 2 group nodes + 3 file nodes = 5
    const groupNodes = canvas.nodes.filter((n) => n.type === "group");
    const fileNodes = canvas.nodes.filter((n) => n.type === "file");

    expect(groupNodes).toHaveLength(2);
    expect(fileNodes).toHaveLength(3);
  });

  it("creates edges from connections between moments in the list", () => {
    const m1 = mockMoment({
      filename: "m1.md",
      path: "Moments/m1.md",
      connections: ["Moments/m2.md"],
    });
    const m2 = mockMoment({
      filename: "m2.md",
      path: "Moments/m2.md",
      connections: [],
    });

    const canvas = buildCanvas([m1, m2]);

    expect(canvas.edges).toHaveLength(1);
    expect(canvas.edges[0].fromNode).toContain("m1");
    expect(canvas.edges[0].toNode).toContain("m2");
    expect(canvas.edges[0].fromSide).toBe("right");
    expect(canvas.edges[0].toSide).toBe("left");
  });

  it("ignores connections to moments not in the list", () => {
    const m1 = mockMoment({
      filename: "m1.md",
      path: "Moments/m1.md",
      connections: ["Moments/nonexistent.md"],
    });

    const canvas = buildCanvas([m1]);

    expect(canvas.edges).toHaveLength(0);
  });

  it("handles moments with no themes by defaulting to uncategorized", () => {
    const m = mockMoment({
      filename: "no-theme.md",
      path: "Moments/no-theme.md",
      frontmatter: {
        date: "2024-01-01",
        "moment-type": "realization",
        people: [],
        places: [],
        "story-status": "captured",
        "story-potential": "low",
        themes: [],
        tags: [],
      },
    });

    const canvas = buildCanvas([m]);
    const groupNode = canvas.nodes.find((n) => n.type === "group");

    expect(groupNode).toBeDefined();
    expect((groupNode as any).label).toBe("Uncategorized");
  });

  it("capitalizes the group label", () => {
    const m = mockMoment({
      frontmatter: {
        date: "2024-01-01",
        "moment-type": "realization",
        people: [],
        places: [],
        "story-status": "captured",
        "story-potential": "medium",
        themes: ["identity"],
        tags: [],
      },
    });

    const canvas = buildCanvas([m]);
    const groupNode = canvas.nodes.find((n) => n.type === "group");

    expect((groupNode as any).label).toBe("Identity");
  });

  it("sets the correct file path on file nodes", () => {
    const m = mockMoment({
      path: "Moments/my-special-moment.md",
    });

    const canvas = buildCanvas([m]);
    const fileNode = canvas.nodes.find((n) => n.type === "file");

    expect(fileNode).toBeDefined();
    expect((fileNode as any).file).toBe("Moments/my-special-moment.md");
  });

  it("creates multiple groups for multiple themes", () => {
    const moments = [
      mockMoment({
        filename: "a.md",
        path: "Moments/a.md",
        frontmatter: {
          date: "2024-01-01",
          "moment-type": "joy",
          people: [],
          places: [],
          "story-status": "captured",
          "story-potential": "medium",
          themes: ["joy"],
          tags: [],
        },
      }),
      mockMoment({
        filename: "b.md",
        path: "Moments/b.md",
        frontmatter: {
          date: "2024-01-02",
          "moment-type": "loss",
          people: [],
          places: [],
          "story-status": "captured",
          "story-potential": "high",
          themes: ["loss"],
          tags: [],
        },
      }),
      mockMoment({
        filename: "c.md",
        path: "Moments/c.md",
        frontmatter: {
          date: "2024-01-03",
          "moment-type": "realization",
          people: [],
          places: [],
          "story-status": "captured",
          "story-potential": "medium",
          themes: ["work"],
          tags: [],
        },
      }),
    ];

    const canvas = buildCanvas(moments);
    const groupNodes = canvas.nodes.filter((n) => n.type === "group");

    expect(groupNodes).toHaveLength(3);

    const labels = groupNodes.map((n) => (n as any).label).sort();
    expect(labels).toEqual(["Joy", "Loss", "Work"]);
  });

  it("assigns correct colors to group and file nodes", () => {
    const m = mockMoment({
      frontmatter: {
        date: "2024-01-01",
        "moment-type": "realization",
        people: [],
        places: [],
        "story-status": "captured",
        "story-potential": "medium",
        themes: ["work"],
        tags: [],
      },
    });

    const canvas = buildCanvas([m]);
    const groupNode = canvas.nodes.find((n) => n.type === "group");
    const fileNode = canvas.nodes.find((n) => n.type === "file");

    // work maps to color "4"
    expect((groupNode as any).color).toBe("4");
    expect((fileNode as any).color).toBe("4");
  });

  it("generates unique edge ids", () => {
    const m1 = mockMoment({
      filename: "m1.md",
      path: "Moments/m1.md",
      connections: ["Moments/m2.md", "Moments/m3.md"],
    });
    const m2 = mockMoment({
      filename: "m2.md",
      path: "Moments/m2.md",
      connections: [],
    });
    const m3 = mockMoment({
      filename: "m3.md",
      path: "Moments/m3.md",
      connections: [],
    });

    const canvas = buildCanvas([m1, m2, m3]);

    expect(canvas.edges).toHaveLength(2);
    expect(canvas.edges[0].id).not.toBe(canvas.edges[1].id);
  });
});
