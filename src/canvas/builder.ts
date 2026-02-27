import type { Moment } from "../types/moment.js";
import type { CanvasFile, GroupNode, FileNode, CanvasEdge } from "../types/canvas.js";
import {
  colorForTheme,
  themePosition,
  groupHeight,
  momentPosition,
  GROUP_WIDTH,
  MOMENT_WIDTH,
  MOMENT_HEIGHT,
} from "./layout.js";

/** Build a canvas from a list of moments */
export function buildCanvas(moments: Moment[]): CanvasFile {
  // Group moments by primary theme (first theme in frontmatter)
  const themeGroups = new Map<string, Moment[]>();
  for (const m of moments) {
    const primary = m.frontmatter.themes?.[0] ?? "uncategorized";
    const group = themeGroups.get(primary) ?? [];
    group.push(m);
    themeGroups.set(primary, group);
  }

  const themes = [...themeGroups.keys()];
  const nodes: (GroupNode | FileNode)[] = [];
  const edges: CanvasEdge[] = [];
  const momentNodeIds = new Map<string, string>();

  // Create group and file nodes for each theme
  for (const [i, theme] of themes.entries()) {
    const pos = themePosition(i, themes.length);
    const themeMoments = themeGroups.get(theme) ?? [];
    const color = colorForTheme(theme);

    // Group node
    nodes.push({
      id: `group-${slugify(theme)}`,
      type: "group",
      x: pos.x,
      y: pos.y,
      width: GROUP_WIDTH,
      height: groupHeight(themeMoments.length),
      color,
      label: capitalize(theme),
    });

    // File nodes for each moment in the group
    for (const [j, moment] of themeMoments.entries()) {
      const mPos = momentPosition(pos.x, pos.y, j);
      const nodeId = `moment-${slugify(moment.filename)}`;
      momentNodeIds.set(moment.path, nodeId);

      nodes.push({
        id: nodeId,
        type: "file",
        file: moment.path,
        x: mPos.x,
        y: mPos.y,
        width: MOMENT_WIDTH,
        height: MOMENT_HEIGHT,
        color,
      });
    }
  }

  // Create edges from connections
  for (const moment of moments) {
    const fromId = momentNodeIds.get(moment.path);
    if (!fromId) continue;

    for (const conn of moment.connections) {
      const toId = momentNodeIds.get(conn);
      if (!toId) continue;

      edges.push({
        id: `edge-${fromId}-${toId}`,
        fromNode: fromId,
        toNode: toId,
        fromSide: "right",
        toSide: "left",
      });
    }
  }

  return { nodes, edges };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.md$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
