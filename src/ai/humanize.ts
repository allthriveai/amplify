import Anthropic from "@anthropic-ai/sdk";
import { HUMANIZE_SYSTEM_PROMPT } from "./prompts.js";

/**
 * Strip AI vocabulary and patterns from prose.
 * Returns the text unchanged if it's too short to be worth humanizing.
 */
export async function humanize(
  text: string,
  apiKey: string,
): Promise<string> {
  // No point humanizing a few words
  if (text.length < 10) {
    return text;
  }

  const client = new Anthropic({ apiKey });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: HUMANIZE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Anthropic API call failed during humanization: ${message}`);
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Anthropic API during humanization");
  }

  return textBlock.text.trim();
}
