/**
 * Amplify MCP Server
 *
 * Exposes Amplify tools to Claude Desktop and other MCP clients via stdio transport.
 * Claude Desktop launches this as a subprocess: `node dist/mcp/index.js`
 *
 * Tools:
 *   ingest_source    — Save a raw source into the immutable source layer
 *   suggest_content  — Rank wiki pages by how publishable they are
 *   record_signal    — Record feedback: rejections, posts, engagement
 *   remember         — Save a preference
 *   recall           — Read preferences, sessions, and the signal summary
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadConfig } from "../config.js";
import { readStories } from "../vault/reader.js";
import { writeClipping } from "../vault/writer.js";
import { parseFrontmatter } from "../vault/frontmatter.js";
import { resolveVoicePath, resolveStoriesDir, resolveClippingsDir, resolveWikiDir } from "../vault/paths.js";
import { emitSignal, signalId, summarizeSignals } from "../vault/signals.js";
import { appendSessionEntry, formatSessionTime, readRecentSessions, readPreferences, addPreference } from "../vault/memory.js";
import { slugify } from "../vault/slug.js";
import { todayKey, normalizeDateKey } from "../vault/dates.js";
import type { AmplifyConfig } from "../types/config.js";
import type { ClippingFrontmatter } from "../types/source.js";
import { WIKI_SUBDIRS, type WikiFrontmatter } from "../types/wiki.js";
import type { Signal } from "../types/signal.js";

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "amplify",
  version: "0.1.0",
});

// Load config once at startup. Tool handlers reference this.
let config: AmplifyConfig;
try {
  config = loadConfig();
} catch (err) {
  console.error("Failed to load Amplify config:", err);
  process.exit(1);
}

/** Read the voice file if it exists */
function readVoice(): string | null {
  const voicePath = resolveVoicePath(config);
  if (existsSync(voicePath)) {
    return readFileSync(voicePath, "utf-8");
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tool 4: ingest_source
// ---------------------------------------------------------------------------

server.registerTool("ingest_source", {
  description:
    "Save a raw source (article, paper, transcript) into the immutable source layer. "
    + "Returns the path so the caller can distill it into wiki pages. Writing the "
    + "clipping is all this does — it never touches the wiki.",
  inputSchema: {
    url: z.string().optional().describe("Canonical URL of the source"),
    title: z.string().describe("Title of the source"),
    content: z.string().describe("The full source content (markdown)"),
    author: z.string().optional().describe("Author name(s)"),
    published: z.string().optional().describe("Publish date, YYYY-MM-DD"),
    resourceType: z.string().optional().describe("article, paper, guide, video, book, tool, course, podcast, documentation, meeting"),
    tags: z.array(z.string()).optional().describe("Topic tags in kebab-case"),
  },
}, async ({ url, title, content, author, published, resourceType, tags }) => {
  try {
    const frontmatter: ClippingFrontmatter = {
      title,
      source: url ?? "",
      author: author ?? "",
      published: published ?? "",
      created: todayKey(),
      tags: [
        ...(resourceType ? [`resource/${resourceType}`] : []),
        ...(tags ?? []),
      ],
    };

    // Kebab-case, so a clipping and the wiki page distilled from it share a name.
    const filename = `${slugify(title)}.md`;

    // The source layer is immutable — a slug collision must never silently
    // replace raw material that wiki pages already cite.
    const existing = join(resolveClippingsDir(config), filename);
    if (existsSync(existing)) {
      return {
        content: [{
          type: "text" as const,
          text: `A clipping already exists at ${existing}. The source layer is immutable — `
            + `if this is the same source, cite the existing file instead of re-ingesting; `
            + `if it is a different source that happens to share the title, re-run with a `
            + `more specific title so the slug differs.`,
        }],
        isError: true,
      };
    }

    const filepath = writeClipping(config, filename, frontmatter, content);

    emitSignal(config, {
      id: signalId(),
      type: "source_ingested",
      timestamp: new Date().toISOString(),
      data: {
        filename,
        title,
        // The wiki pages this source touches are written by the agent after this
        // call returns, so they are not known yet. /ingest appends them.
        wikiPages: [],
        tags: frontmatter.tags,
      },
    });

    appendSessionEntry(config, {
      time: formatSessionTime(new Date()),
      action: "source_ingested",
      detail: `Saved "${title}" to the source layer, tags: ${frontmatter.tags.join(", ") || "none"}`,
    });

    const result = {
      filepath,
      filename,
      tags: frontmatter.tags,
      next: "Distill into Wiki/Summaries, update entity and concept pages, then index.md and log.md",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error saving source: ${message}` }],
      isError: true,
    };
  }
});
// ---------------------------------------------------------------------------
// Tool: suggest_content — the flywheel's first turn
// ---------------------------------------------------------------------------

server.registerTool("suggest_content", {
  description:
    "Recommend what to publish next, sourced from the wiki. Returns candidate pages ranked by how well-supported and how fresh they are, suggested platforms, story coverage, and signal history.",
  inputSchema: {
    focus: z.string().optional().describe("Optional: narrow to a topic, tag, or page title"),
  },
}, async ({ focus }) => {
  try {
    const signalSummary = summarizeSignals(config);
    const preferences = readPreferences(config);

    // Candidates come from the wiki. Concepts and synthesis carry an argument,
    // summaries carry a source. All three are publishable raw material, and all
    // three are already distilled — which is the whole point of reading from the
    // wiki instead of from raw sources.
    type Candidate = {
      filename: string;
      kind: string;
      title: string;
      tags: string[];
      sourceCount: number;
      updated: string;
      excerpt: string;
      suggestedPlatforms: string[];
      alreadyDrafted: boolean;
    };

    const storiesDir = resolveStoriesDir(config);
    const stories = readStories(config);
    // A story folder is named after the story's own title, not the wiki page it
    // came from, so slug matching never matches. Read the drafts and look for a
    // real [[wikilink]] back to the page instead.
    const draftedTitles = new Set<string>();
    if (existsSync(storiesDir)) {
      for (const folder of readdirSync(storiesDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const file of readdirSync(join(storiesDir, folder.name)).filter((f) => f.endsWith(".md"))) {
          const text = readFileSync(join(storiesDir, folder.name, file), "utf-8");
          for (const [, target] of text.matchAll(/\[\[([^\]|]+)/g)) {
            draftedTitles.add(target.trim().toLowerCase());
          }
        }
      }
    }

    const candidates: Candidate[] = [];
    for (const [kind, sub] of Object.entries(WIKI_SUBDIRS)) {
      if (kind === "entity") continue; // entities are reference, not an argument
      const dir = join(resolveWikiDir(config), sub);
      if (!existsSync(dir)) continue;

      for (const file of readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md")) {
        const raw = readFileSync(join(dir, file), "utf-8");
        const { frontmatter, content } = parseFrontmatter<Partial<WikiFrontmatter>>(raw);
        const title = content.match(/^#\s+(.+)$/m)?.[1] ?? file.replace(/\.md$/, "");
        const sourceCount = frontmatter.sources?.length ?? 0;

        // A page with no sources is unsupported opinion, not publishable material.
        if (sourceCount === 0) continue;

        const body = content.replace(/^#\s+.+$/m, "").trim();
        const platforms = kind === "synthesis"
          ? ["linkedin", "youtube", "article"]
          : sourceCount >= 3
            ? ["linkedin", "article"]
            : ["linkedin"];

        candidates.push({
          filename: file,
          kind,
          title,
          tags: frontmatter.tags ?? [],
          sourceCount,
          // YAML turns an unquoted `updated:` into a Date, not the string the
          // type claims. Sorting on it raw throws on the second comparison.
          updated: normalizeDateKey(frontmatter.updated) ?? normalizeDateKey(frontmatter.created) ?? "",
          excerpt: body.slice(0, 280),
          suggestedPlatforms: platforms,
          alreadyDrafted: draftedTitles.has(title.toLowerCase()),
        });
      }
    }

    let ranked = candidates;
    if (focus) {
      const needle = focus.toLowerCase();
      const narrowed = ranked.filter(
        (c) =>
          c.title.toLowerCase().includes(needle) ||
          c.filename.toLowerCase().includes(needle) ||
          c.excerpt.toLowerCase().includes(needle) ||
          c.tags.some((t) => t.toLowerCase().includes(needle)),
      );
      if (narrowed.length > 0) ranked = narrowed;
    }

    // Undrafted first, then the best-supported, then the most recently touched.
    ranked.sort((a, b) => {
      if (a.alreadyDrafted !== b.alreadyDrafted) return a.alreadyDrafted ? 1 : -1;
      if (a.sourceCount !== b.sourceCount) return b.sourceCount - a.sourceCount;
      return b.updated.localeCompare(a.updated);
    });

    let directorCutCount = 0;
    if (existsSync(storiesDir)) {
      for (const folder of readdirSync(storiesDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        directorCutCount += readdirSync(join(storiesDir, folder.name))
          .filter((f) => f.endsWith(".md") && !["story.md", "raw.md", "README.md"].includes(f)).length;
      }
    }

    const voice = readVoice();

    appendSessionEntry(config, {
      time: formatSessionTime(new Date()),
      action: "content_suggested",
      detail: `${Math.min(ranked.length, 5)} candidates from ${candidates.length} wiki pages`,
    });

    const result = {
      voice: voice ? voice.slice(0, 500) : null,
      recommendations: ranked.slice(0, 5),
      totalWikiPages: candidates.length,
      undraftedCount: candidates.filter((c) => !c.alreadyDrafted).length,
      existingStoryCount: stories.length,
      directorCutCount,
      signals: {
        rejectedPillars: signalSummary.rejectedTopics.map((s) => s.data.pillar),
        postedPlatforms: signalSummary.postedContent.map((s) => ({
          platform: s.data.platform,
          scriptFilename: s.data.scriptFilename,
        })),
        topEngagement: signalSummary.topEngagement.slice(0, 3).map((s) => ({
          platform: s.data.platform,
          url: s.data.url,
          views: s.data.views,
          likes: s.data.likes,
        })),
      },
      preferences: preferences ? preferences.slice(0, 500) : null,
      nudge: candidates.length === 0
        ? "The wiki has no sourced pages yet. Run /ingest on something you have read — the flywheel needs input before it can turn."
        : null,
    };

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error suggesting content: ${message}` }],
      isError: true,
    };
  }
});


// ---------------------------------------------------------------------------
// Tool 6: record_signal
// ---------------------------------------------------------------------------

server.registerTool("record_signal", {
  description:
    "Record user feedback as a signal: rejected recommendations, posted content, or engagement metrics. Writes to signals.json and session memory.",
  inputSchema: {
    signalType: z.enum(["recommendation_rejected", "content_posted", "engagement_updated"])
      .describe("Type of signal to record"),
    reason: z.string().optional().describe("Why a recommendation was rejected"),
    pillar: z.enum(["building", "strategy", "ethics", "thriving"]).optional().describe("Content pillar"),
    sourceContent: z.string().optional().describe("Source content reference (filename or wiki-link)"),
    platform: z.enum(["linkedin", "x", "youtube"]).optional().describe("Platform"),
    url: z.string().optional().describe("URL of the posted content"),
    scriptFilename: z.string().optional().describe("Script filename that was posted"),
    views: z.number().optional().describe("View count"),
    likes: z.number().optional().describe("Like count"),
    comments: z.number().optional().describe("Comment count"),
    shares: z.number().optional().describe("Share count"),
    filename: z.string().optional().describe("Script filename"),
  },
}, async (args) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString();
    const timeStr = formatSessionTime(now);
    let signal: Signal;
    let sessionDetail: string;

    switch (args.signalType) {
      case "recommendation_rejected":
        signal = {
          id: signalId(),
          type: "recommendation_rejected",
          timestamp,
          data: {
            reason: args.reason ?? "",
            pillar: args.pillar ?? "",
            sourceContent: args.sourceContent ?? "",
          },
        };
        sessionDetail = `Rejected recommendation: ${args.reason ?? "no reason given"} (${args.sourceContent ?? "unknown source"})`;
        break;

      case "content_posted":
        signal = {
          id: signalId(),
          type: "content_posted",
          timestamp,
          data: {
            platform: args.platform ?? "",
            url: args.url ?? "",
            scriptFilename: args.scriptFilename ?? "",
            pillar: args.pillar ?? "",
          },
        };
        sessionDetail = `Posted to ${args.platform}: ${args.scriptFilename ?? args.url ?? "unknown"}`;
        break;

      case "engagement_updated":
        signal = {
          id: signalId(),
          type: "engagement_updated",
          timestamp,
          data: {
            platform: args.platform ?? "",
            url: args.url ?? "",
            views: args.views,
            likes: args.likes,
            comments: args.comments,
            shares: args.shares,
          },
        };
        const metrics = [
          args.views != null ? `${args.views} views` : null,
          args.likes != null ? `${args.likes} likes` : null,
          args.comments != null ? `${args.comments} comments` : null,
          args.shares != null ? `${args.shares} shares` : null,
        ].filter(Boolean).join(", ");
        sessionDetail = `Engagement update on ${args.platform}: ${metrics}`;
        break;

      default:
        return {
          content: [{ type: "text" as const, text: `Unknown signal type: ${args.signalType}` }],
          isError: true,
        };
    }

    emitSignal(config, signal);
    appendSessionEntry(config, { time: timeStr, action: args.signalType, detail: sessionDetail });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ recorded: true, signalId: signal.id }, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error recording signal: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 8: remember
// ---------------------------------------------------------------------------

server.registerTool("remember", {
  description:
    "Save a user preference. Writes to preferences.md under the given section and logs to session memory.",
  inputSchema: {
    section: z.string().describe("Section heading (e.g., Content Style, Coaching, Topics)"),
    key: z.string().describe("Preference key (e.g., LinkedIn tone, Pillar focus, Avoid)"),
    value: z.string().describe("Preference value"),
  },
}, async ({ section, key, value }) => {
  try {
    addPreference(config, section, key, value);

    const now = new Date();
    const timeStr = formatSessionTime(now);
    appendSessionEntry(config, {
      time: timeStr,
      action: "preference_saved",
      detail: `Saved preference: ${section} > ${key} = ${value}`,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ saved: true, section, key, value }, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error saving preference: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 9: recall
// ---------------------------------------------------------------------------

server.registerTool("recall", {
  description:
    "Recall preferences, recent session history, and signal summary. Use when the user asks what Amplify remembers or what their preferences are.",
}, async () => {
  try {
    const preferences = readPreferences(config);
    const sessions = readRecentSessions(config, 3);
    const signals = summarizeSignals(config);

    const result = {
      preferences: preferences ?? "No preferences saved yet.",
      recentSessions: sessions.length > 0 ? sessions : ["No session history yet."],
      signalSummary: {
        recentIngestCount: signals.recentIngests.length,
        recentIngests: signals.recentIngests.map((s) => ({
          filename: s.data.filename,
          title: s.data.title,
          wikiPages: s.data.wikiPages,
          tags: s.data.tags,
          timestamp: s.timestamp,
        })),
        rejectedCount: signals.rejectedTopics.length,
        rejectedTopics: signals.rejectedTopics.map((s) => ({
          reason: s.data.reason,
          pillar: s.data.pillar,
          timestamp: s.timestamp,
        })),
        postedCount: signals.postedContent.length,
        postedContent: signals.postedContent.map((s) => ({
          platform: s.data.platform,
          scriptFilename: s.data.scriptFilename,
          timestamp: s.timestamp,
        })),
        topEngagement: signals.topEngagement.slice(0, 3).map((s) => ({
          platform: s.data.platform,
          url: s.data.url,
          views: s.data.views,
          likes: s.data.likes,
          timestamp: s.timestamp,
        })),
      },
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error recalling memory: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so it doesn't interfere with the MCP protocol on stdout
  console.error("Amplify MCP server running on stdio");
}

main().catch((err) => {
  console.error("Amplify MCP server failed to start:", err);
  process.exit(1);
});
