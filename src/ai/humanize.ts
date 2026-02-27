import Anthropic from "@anthropic-ai/sdk";
import { HUMANIZE_SYSTEM_PROMPT } from "./prompts.js";

/**
 * Strip AI vocabulary and patterns from prose.
 *
 * TODO: Implement Claude API call for humanization pass
 */
export async function humanize(
  text: string,
  apiKey: string,
): Promise<string> {
  // TODO: Call Claude API with HUMANIZE_SYSTEM_PROMPT
  // TODO: Return cleaned text
  throw new Error("Not implemented — coming in a future session");
}
