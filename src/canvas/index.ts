import type { LumisConfig } from "../types/config.js";
import type { CanvasFile } from "../types/canvas.js";
import type { Moment } from "../types/moment.js";
import { buildCanvas } from "./builder.js";
import { readMoments } from "../vault/reader.js";
import { writeCanvas } from "../vault/writer.js";

/**
 * Regenerate the Pattern Map canvas from all moments in the vault.
 *
 * Reads all moments, groups by theme, lays out in a circle,
 * and writes the canvas JSON.
 */
export function generatePatternMap(config: LumisConfig): CanvasFile {
  const moments = readMoments(config);
  const canvas = buildCanvas(moments);
  writeCanvas(config, canvas);
  return canvas;
}
