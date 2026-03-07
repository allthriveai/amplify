import { describe, it, expect } from "vitest";
import { computeAnimationOrder } from "./animation-order.js";
import type { DiagramNode, DiagramEdge } from "../types/diagram.js";

function node(id: string, type?: DiagramNode["type"]): DiagramNode {
  return { id, label: id, type };
}

function edge(source: string, target: string): DiagramEdge {
  return { id: `${source}-${target}`, source, target };
}

describe("computeAnimationOrder", () => {
  describe("flow (topological sort)", () => {
    it("returns sources before sinks", () => {
      const nodes = [node("a"), node("b"), node("c")];
      const edges = [edge("a", "b"), edge("b", "c")];
      const order = computeAnimationOrder(nodes, edges, "flow");
      expect(order).toEqual(["a", "b", "c"]);
    });

    it("handles diamond graph", () => {
      const nodes = [node("a"), node("b"), node("c"), node("d")];
      const edges = [edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")];
      const order = computeAnimationOrder(nodes, edges, "flow");
      expect(order[0]).toBe("a");
      expect(order[order.length - 1]).toBe("d");
      expect(order).toHaveLength(4);
    });

    it("handles disconnected nodes", () => {
      const nodes = [node("a"), node("b"), node("lonely")];
      const edges = [edge("a", "b")];
      const order = computeAnimationOrder(nodes, edges, "flow");
      expect(order).toHaveLength(3);
      expect(order).toContain("lonely");
    });

    it("handles empty graph", () => {
      expect(computeAnimationOrder([], [], "flow")).toEqual([]);
    });
  });

  describe("timeline", () => {
    it("preserves array order", () => {
      const nodes = [node("step1"), node("step2"), node("step3")];
      const order = computeAnimationOrder(nodes, [], "timeline");
      expect(order).toEqual(["step1", "step2", "step3"]);
    });
  });

  describe("concept-map (BFS from highest degree)", () => {
    it("starts from highest-degree node", () => {
      const nodes = [node("leaf1"), node("hub"), node("leaf2"), node("leaf3")];
      const edges = [
        edge("hub", "leaf1"),
        edge("hub", "leaf2"),
        edge("hub", "leaf3"),
      ];
      const order = computeAnimationOrder(nodes, edges, "concept-map");
      expect(order[0]).toBe("hub");
    });

    it("includes disconnected nodes", () => {
      const nodes = [node("a"), node("b"), node("isolated")];
      const edges = [edge("a", "b")];
      const order = computeAnimationOrder(nodes, edges, "concept-map");
      expect(order).toHaveLength(3);
      expect(order).toContain("isolated");
    });
  });

  describe("comparison", () => {
    it("puts inputs/sources before outputs/targets", () => {
      const nodes = [
        node("out1", "output"),
        node("in1", "input"),
        node("mid"),
        node("in2", "input"),
      ];
      const edges = [edge("in1", "mid"), edge("in2", "mid"), edge("mid", "out1")];
      const order = computeAnimationOrder(nodes, edges, "comparison");
      const inIdx1 = order.indexOf("in1");
      const inIdx2 = order.indexOf("in2");
      const outIdx = order.indexOf("out1");
      expect(inIdx1).toBeLessThan(outIdx);
      expect(inIdx2).toBeLessThan(outIdx);
    });
  });
});
