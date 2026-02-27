import Anthropic from "@anthropic-ai/sdk";
import type { Moment, MomentAnalysis } from "../types/moment.js";
import { ANALYZE_SYSTEM_PROMPT } from "./prompts.js";

/**
 * Analyze raw moment input and return structured analysis.
 *
 * TODO: Implement Claude API call with structured output
 */
export async function analyzeMoment(
  rawInput: string,
  existingMoments: Moment[],
  apiKey: string,
): Promise<MomentAnalysis> {
  // TODO: Build prompt with existing moments for connection finding
  // TODO: Call Claude API with ANALYZE_SYSTEM_PROMPT
  // TODO: Parse response into MomentAnalysis
  throw new Error("Not implemented — coming in a future session");
}
