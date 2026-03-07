import type { DiagramNode, DiagramEdge, DiagramType } from "../types/diagram.js";

/**
 * Compute the order nodes should be revealed during animation.
 * Returns an ordered list of node IDs.
 */
export function computeAnimationOrder(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  diagramType: DiagramType,
): string[] {
  switch (diagramType) {
    case "flow":
      return topologicalSort(nodes, edges);
    case "timeline":
      // Timeline nodes are laid out left-to-right; use array order (dagre x-position)
      return nodes.map((n) => n.id);
    case "concept-map":
      return bfsFromHighestDegree(nodes, edges);
    case "comparison":
      return comparisonOrder(nodes, edges);
    default:
      return nodes.map((n) => n.id);
  }
}

/** Kahn's algorithm: sources first, sinks last */
function topologicalSort(nodes: DiagramNode[], edges: DiagramEdge[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  }

  for (const e of edges) {
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    adjacency.get(e.source)?.push(e.target);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  // If graph has cycles, append any remaining nodes
  for (const n of nodes) {
    if (!result.includes(n.id)) result.push(n.id);
  }

  return result;
}

/** BFS from the node with the highest degree (most connections) */
function bfsFromHighestDegree(nodes: DiagramNode[], edges: DiagramEdge[]): string[] {
  const degree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  for (const n of nodes) {
    degree.set(n.id, 0);
    adjacency.set(n.id, new Set());
  }

  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    adjacency.get(e.source)?.add(e.target);
    adjacency.get(e.target)?.add(e.source);
  }

  // Find highest-degree node
  let startId = nodes[0]?.id ?? "";
  let maxDeg = 0;
  for (const [id, deg] of degree) {
    if (deg > maxDeg) {
      maxDeg = deg;
      startId = id;
    }
  }

  const visited = new Set<string>();
  const result: string[] = [];
  const queue: string[] = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // Append any disconnected nodes
  for (const n of nodes) {
    if (!visited.has(n.id)) result.push(n.id);
  }

  return result;
}

/** Comparison: left group first (sources/inputs), then right group */
function comparisonOrder(nodes: DiagramNode[], edges: DiagramEdge[]): string[] {
  const targets = new Set(edges.map((e) => e.target));
  const sources = new Set(edges.map((e) => e.source));

  // Left group: nodes that are sources but not targets (or input type)
  const left: string[] = [];
  const right: string[] = [];
  const middle: string[] = [];

  for (const n of nodes) {
    if (n.type === "input" || (sources.has(n.id) && !targets.has(n.id))) {
      left.push(n.id);
    } else if (n.type === "output" || (targets.has(n.id) && !sources.has(n.id))) {
      right.push(n.id);
    } else {
      middle.push(n.id);
    }
  }

  return [...left, ...middle, ...right];
}
