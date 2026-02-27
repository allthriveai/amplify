import type { LumisConfig } from "../types/config.js";
import type { Moment, MomentAnalysis } from "../types/moment.js";

/**
 * Full moment capture pipeline:
 * 1. Read existing moments
 * 2. Analyze raw input with Claude
 * 3. Find connections to past moments
 * 4. Write moment file with wiki-links
 * 5. Humanize the prose
 * 6. Regenerate the Pattern Map canvas
 * 7. Update daily note (if exists)
 *
 * TODO: Implement the full pipeline
 */
export async function captureMoment(
  rawInput: string,
  config: LumisConfig,
): Promise<{ moment: Moment; analysis: MomentAnalysis }> {
  // TODO: Wire together analyze, write, humanize, canvas, daily note
  throw new Error("Not implemented — coming in a future session");
}
