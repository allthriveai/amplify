import type { LumisConfig } from "../types/config.js";
import type { Structure, Hook } from "../types/amplify.js";
import { readStructures, readHooks } from "../vault/amplify-reader.js";

export interface AmplifyContext {
  structures: Structure[];
  hooks: Hook[];
}

/**
 * Build AI-friendly context from vault amplify content.
 * Optionally filters by a content goal to surface relevant items.
 */
export function buildAmplifyContext(
  config: LumisConfig,
  contentGoal?: string,
): AmplifyContext {
  const allStructures = readStructures(config);
  const allHooks = readHooks(config);

  if (!contentGoal) {
    return {
      structures: allStructures,
      hooks: allHooks,
    };
  }

  const goal = contentGoal.toLowerCase();

  const structures = allStructures.filter(
    (s) =>
      s.frontmatter.title.toLowerCase().includes(goal) ||
      s.frontmatter.category.toLowerCase().includes(goal) ||
      s.content.toLowerCase().includes(goal),
  );

  const hooks = allHooks.filter(
    (h) =>
      h.frontmatter.title.toLowerCase().includes(goal) ||
      h.content.toLowerCase().includes(goal),
  );

  return { structures, hooks };
}

/** Format amplify context for inclusion in AI system prompts */
export function serializeAmplifyContext(ctx: AmplifyContext): string {
  const sections: string[] = [];

  if (ctx.structures.length > 0) {
    sections.push("## Content Structures\n");
    for (const s of ctx.structures) {
      sections.push(`### ${s.frontmatter.title}`);
      if (s.frontmatter.category) sections.push(`Category: ${s.frontmatter.category}`);
      if (s.insights.length > 0) {
        sections.push("Key Insights:");
        sections.push(...s.insights.map((i) => `- ${i}`));
      }
      if (s.takeaways.length > 0) {
        sections.push("Takeaways:");
        sections.push(...s.takeaways.map((t) => `- ${t}`));
      }
      if (s.actions.length > 0) {
        sections.push("Actions:");
        sections.push(...s.actions.map((a) => `- ${a}`));
      }
      sections.push("");
    }
  }

  if (ctx.hooks.length > 0) {
    sections.push("## Hook Types\n");
    for (const h of ctx.hooks) {
      sections.push(`### ${h.frontmatter.title}`);
      sections.push(h.content);
      sections.push("");
    }
  }

  return sections.join("\n");
}
