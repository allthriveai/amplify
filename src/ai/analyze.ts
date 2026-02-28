import Anthropic from "@anthropic-ai/sdk";
import type { Moment, MomentAnalysis } from "../types/moment.js";
import { ANALYZE_SYSTEM_PROMPT } from "./prompts.js";

/**
 * Build a compact summary of existing moments for connection-finding context.
 * Limits to the most recent 50 moments to avoid token bloat.
 */
function buildMomentContext(existingMoments: Moment[]): string {
  if (existingMoments.length === 0) {
    return "No existing moments yet.";
  }

  const recent = existingMoments.slice(-50);

  const summaries = recent.map((m) => {
    const parts: string[] = [`- ${m.path}`];
    if (m.frontmatter.themes?.length) {
      parts.push(`themes: ${m.frontmatter.themes.join(", ")}`);
    }
    if (m.frontmatter.people?.length) {
      parts.push(`people: ${m.frontmatter.people.join(", ")}`);
    }
    if (m.fiveSecondMoment) {
      parts.push(`5s: ${m.fiveSecondMoment}`);
    }
    return parts.join(" | ");
  });

  return summaries.join("\n");
}

/**
 * Analyze raw moment input and return structured analysis.
 */
export async function analyzeMoment(
  rawInput: string,
  existingMoments: Moment[],
  apiKey: string,
): Promise<MomentAnalysis> {
  const client = new Anthropic({ apiKey });

  const momentContext = buildMomentContext(existingMoments);

  const userPrompt = `Analyze this moment and respond with a JSON object matching the MomentAnalysis schema below.

## Raw moment
${rawInput}

## Existing moments (find connections to these)
${momentContext}

## Required JSON schema
{
  "title": "string — short, evocative title",
  "description": "string — the moment distilled to its essence",
  "fiveSecondMoment": "string — the instant of shift, realization, or transformation",
  "momentType": "one of: realization, decision, transformation, loss, connection, conflict, joy, fear, vulnerability, gratitude",
  "people": ["string array of people mentioned"],
  "places": ["string array of places mentioned"],
  "themes": ["string array of themes"],
  "storyPotential": "one of: high, medium, low",
  "storyPotentialReason": "string — why this has story potential",
  "connections": [
    {
      "momentPath": "string — vault path of the connected moment from the existing moments list above",
      "reason": "string — why this connection matters"
    }
  ]
}

Set connections[].momentPath to the vault path from the existing moments list. Only include genuine connections — don't force them. If no moments connect, return an empty array.

Respond with only the JSON object, no markdown fences or extra text.`;

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: ANALYZE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Anthropic API call failed: ${message}`);
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Anthropic API");
  }

  const rawText = textBlock.text.trim();

  let parsed: unknown;
  try {
    // Strip markdown fences if the model wraps the JSON anyway
    const cleaned = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Failed to parse analysis response as JSON. Raw response:\n${rawText}`,
    );
  }

  const analysis = parsed as Record<string, unknown>;

  // Loose validation — check required fields exist
  const required = [
    "title",
    "description",
    "fiveSecondMoment",
    "momentType",
    "people",
    "places",
    "themes",
    "storyPotential",
    "storyPotentialReason",
    "connections",
  ];
  const missing = required.filter((key) => !(key in analysis));
  if (missing.length > 0) {
    throw new Error(
      `Analysis response missing required fields: ${missing.join(", ")}. Raw response:\n${rawText}`,
    );
  }

  return analysis as unknown as MomentAnalysis;
}
