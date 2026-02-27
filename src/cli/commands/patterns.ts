import { loadConfig } from "../../config.js";
import { generatePatternMap } from "../../canvas/index.js";

/** `lumis patterns` — regenerate the Pattern Map canvas */
export async function patternsCommand(): Promise<void> {
  const config = loadConfig();
  const canvas = generatePatternMap(config);
  const momentCount = canvas.nodes.filter((n) => n.type === "file").length;
  const themeCount = canvas.nodes.filter((n) => n.type === "group").length;
  console.log(`Pattern Map updated: ${momentCount} moments across ${themeCount} themes`);
}
