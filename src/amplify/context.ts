import type { LumisConfig } from "../types/config.js";
import type { Structure, Trigger, Hook, Prompt } from "../types/amplify.js";
import { readStructures, readTriggers, readHooks, readPrompts } from "../vault/amplify-reader.js";

export interface AmplifyContext {
  structures: Structure[];
  triggers: Trigger[];
  hooks: Hook[];
  prompts: Prompt[];
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
  const allTriggers = readTriggers(config);
  const hooksCollection = readHooks(config);
  const promptsCollection = readPrompts(config);

  const allHooks = hooksCollection?.hooks ?? [];
  const allPrompts = promptsCollection?.prompts ?? [];

  if (!contentGoal) {
    return {
      structures: allStructures,
      triggers: allTriggers,
      hooks: allHooks,
      prompts: allPrompts,
    };
  }

  const goal = contentGoal.toLowerCase();

  const structures = allStructures.filter(
    (s) =>
      s.frontmatter.title.toLowerCase().includes(goal) ||
      s.frontmatter.category.toLowerCase().includes(goal) ||
      s.content.toLowerCase().includes(goal),
  );

  const triggers = allTriggers.filter(
    (t) =>
      t.frontmatter.title.toLowerCase().includes(goal) ||
      t.content.toLowerCase().includes(goal),
  );

  const hooks = allHooks
    .filter((h) => h.template.toLowerCase().includes(goal))
    .slice(0, 10);

  const prompts = allPrompts
    .filter((p) => p.prompt.toLowerCase().includes(goal))
    .slice(0, 10);

  return { structures, triggers, hooks, prompts };
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

  if (ctx.triggers.length > 0) {
    sections.push("## Persuasion Triggers\n");
    for (const t of ctx.triggers) {
      sections.push(`### ${t.frontmatter.title}`);
      sections.push(t.content);
      sections.push("");
    }
  }

  if (ctx.hooks.length > 0) {
    sections.push("## Hooks\n");
    for (const h of ctx.hooks) {
      sections.push(`${h.index}. ${h.template}`);
    }
    sections.push("");
  }

  if (ctx.prompts.length > 0) {
    sections.push("## Prompts\n");
    for (const p of ctx.prompts) {
      sections.push(`${p.index}. ${p.prompt}`);
    }
    sections.push("");
  }

  return sections.join("\n");
}
