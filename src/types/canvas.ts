export interface CanvasFile {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export type CanvasNode = GroupNode | FileNode;

export interface GroupNode {
  id: string;
  type: "group";
  x: number;
  y: number;
  width: number;
  height: number;
  color: CanvasColor;
  label: string;
}

export interface FileNode {
  id: string;
  type: "file";
  file: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: CanvasColor;
}

export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide: "top" | "right" | "bottom" | "left";
  toSide: "top" | "right" | "bottom" | "left";
}

/**
 * Obsidian canvas color codes:
 * "1" = red, "2" = orange, "3" = yellow,
 * "4" = green, "5" = purple, "6" = cyan
 */
export type CanvasColor = "1" | "2" | "3" | "4" | "5" | "6";

/** Theme to canvas color mapping */
export const THEME_COLORS: Record<string, CanvasColor> = {
  identity: "1",
  growth: "1",
  family: "2",
  parenthood: "2",
  love: "3",
  connection: "3",
  friendship: "3",
  belonging: "3",
  work: "4",
  ambition: "4",
  creativity: "4",
  loss: "5",
  mortality: "5",
  vulnerability: "5",
  fear: "5",
  joy: "6",
  gratitude: "6",
  independence: "6",
};
