import type { CanvasColor } from "../types/canvas.js";
import { THEME_COLORS } from "../types/canvas.js";

const RADIUS = 800;
const GROUP_WIDTH = 400;
const MOMENT_HEIGHT = 80;
const MOMENT_SPACING = 120;
const MOMENT_WIDTH = 360;

/** Get the canvas color for a theme, defaulting to cyan */
export function colorForTheme(theme: string): CanvasColor {
  return THEME_COLORS[theme.toLowerCase()] ?? "6";
}

/** Calculate position for a theme group on the circle */
export function themePosition(
  index: number,
  total: number,
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: Math.round(Math.cos(angle) * RADIUS),
    y: Math.round(Math.sin(angle) * RADIUS),
  };
}

/** Calculate group height based on number of moments */
export function groupHeight(momentCount: number): number {
  return Math.max(200, momentCount * MOMENT_SPACING + 60);
}

/** Calculate moment position within a group */
export function momentPosition(
  groupX: number,
  groupY: number,
  index: number,
): { x: number; y: number } {
  return {
    x: groupX + (GROUP_WIDTH - MOMENT_WIDTH) / 2,
    y: groupY + 40 + index * MOMENT_SPACING,
  };
}

export { GROUP_WIDTH, MOMENT_WIDTH, MOMENT_HEIGHT };
