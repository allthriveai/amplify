/**
 * Lumis MCP Server
 *
 * Exposes Lumis tools to Claude Desktop and other MCP clients via stdio transport.
 * Claude Desktop launches this as a subprocess: `node dist/mcp/index.js`
 *
 * Tools:
 *   capture_moment         — Capture a daily moment
 *   get_moments            — Read moments from the vault
 *   get_patterns           — Get the Pattern Map
 *   add_research           — Save research to the vault
 *   social_coach           — Recommend what to post and where
 *   record_signal          — Record user feedback signals
 *   remember               — Save a user preference
 *   recall                 — Read preferences and session history
 *   story_craft_practice   — Practice storytelling with one exercise
 *   story_craft_develop    — Develop a moment into a full story
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadConfig } from "../config.js";
import { captureMoment } from "../pipeline/capture.js";
import { readMoments, readCanvas, readStories } from "../vault/reader.js";
import { writeResearchNote, writeStory, appendPracticeLog } from "../vault/writer.js";
import { parseFrontmatter } from "../vault/frontmatter.js";
import { resolveVoicePath, resolveStoriesDir, resolvePracticeLogPath, resolveMomentsDir } from "../vault/paths.js";
import { emitSignal, signalId, summarizeSignals } from "../vault/signals.js";
import { appendSessionEntry, formatSessionTime, readRecentSessions, readPreferences, addPreference } from "../vault/memory.js";
import type { LumisConfig } from "../types/config.js";
import type { ResearchFrontmatter, ResearchCategory } from "../types/research.js";
import type { CanvasFile, CanvasNode, CanvasEdge } from "../types/canvas.js";
import type { Signal, LearningExtractedSignal, StoryDevelopedSignal, StoryPracticeSignal } from "../types/signal.js";
import type { StoryFrontmatter } from "../types/story.js";

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "lumis",
  version: "0.1.0",
});

// Load config once at startup. Tool handlers reference this.
let config: LumisConfig;
try {
  config = loadConfig();
} catch (err) {
  console.error("Failed to load Lumis config:", err);
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

/** Check how many days since the last story craft practice */
function daysSinceLastPractice(): number | null {
  const logPath = resolvePracticeLogPath(config);
  if (!existsSync(logPath)) return null;

  const content = readFileSync(logPath, "utf-8");
  const dateMatches = [...content.matchAll(/## (\d{4}-\d{2}-\d{2}) —/g)];
  if (dateMatches.length === 0) return null;

  const lastDate = dateMatches.map((m) => m[1]).sort().pop()!;
  const diff = Date.now() - new Date(lastDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Tool 1: capture_moment
// ---------------------------------------------------------------------------

server.registerTool("capture_moment", {
  description:
    "Capture a daily moment. Analyzes the input, finds the 5-second moment, connects to past moments, writes to the vault, and updates the Pattern Map.",
  inputSchema: {
    rawInput: z.string().describe("What happened today — the raw moment to capture"),
  },
}, async ({ rawInput }) => {
  try {
    const { moment, analysis } = await captureMoment(rawInput, config);

    const result = {
      filename: moment.filename,
      path: moment.path,
      title: analysis.title,
      fiveSecondMoment: analysis.fiveSecondMoment,
      momentType: analysis.momentType,
      themes: analysis.themes,
      storyPotential: analysis.storyPotential,
      connections: analysis.connections.map((c) => ({
        momentPath: c.momentPath,
        reason: c.reason,
      })),
      people: analysis.people,
      places: analysis.places,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error capturing moment: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 2: get_moments
// ---------------------------------------------------------------------------

server.registerTool("get_moments", {
  description:
    "Read moments from the vault. Returns all moments or filter by theme. Each moment includes its date, title, themes, story-potential, 5-second moment, and connection count.",
  inputSchema: {
    theme: z.string().optional().describe("Filter moments to those containing this theme"),
    limit: z.number().optional().describe("Maximum number of moments to return"),
  },
}, async ({ theme, limit }) => {
  try {
    let moments = readMoments(config);

    // Filter by theme if provided
    if (theme) {
      const lowerTheme = theme.toLowerCase();
      moments = moments.filter((m) =>
        m.frontmatter.themes.some((t) => t.toLowerCase().includes(lowerTheme)),
      );
    }

    // Sort by date descending (newest first)
    moments.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));

    // Apply limit
    if (limit && limit > 0) {
      moments = moments.slice(0, limit);
    }

    const result = moments.map((m) => {
      // Extract title from first heading
      const titleMatch = m.content.match(/^#\s+(.+)$/m);
      return {
        filename: m.filename,
        date: m.frontmatter.date,
        title: titleMatch?.[1] ?? m.filename.replace(/\.md$/, ""),
        themes: m.frontmatter.themes,
        storyPotential: m.frontmatter["story-potential"],
        storyStatus: m.frontmatter["story-status"],
        momentType: m.frontmatter["moment-type"],
        fiveSecondMoment: m.fiveSecondMoment ?? null,
        connectionCount: m.connections.length,
      };
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error reading moments: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 3: get_patterns
// ---------------------------------------------------------------------------

server.registerTool("get_patterns", {
  description:
    "Get the Pattern Map showing how moments connect by theme. Returns theme clusters, moment count, connection count, and a text summary.",
}, async () => {
  try {
    const canvas = readCanvas(config);
    const moments = readMoments(config);

    // Build theme clusters from moments
    const themeClusters: Record<string, string[]> = {};
    for (const m of moments) {
      for (const theme of m.frontmatter.themes) {
        if (!themeClusters[theme]) {
          themeClusters[theme] = [];
        }
        themeClusters[theme].push(m.filename);
      }
    }

    // Count connections from the canvas
    let connectionCount = 0;
    let nodeCount = 0;
    const themeGroups: string[] = [];

    if (canvas) {
      connectionCount = canvas.edges.length;
      nodeCount = canvas.nodes.length;
      // Extract theme group labels from group nodes
      for (const node of canvas.nodes) {
        if (node.type === "group" && node.label) {
          themeGroups.push(node.label);
        }
      }
    }

    // Build a text summary
    const summaryLines: string[] = [];
    summaryLines.push(`Pattern Map: ${moments.length} moments across ${Object.keys(themeClusters).length} themes`);
    if (canvas) {
      summaryLines.push(`Canvas: ${nodeCount} nodes, ${connectionCount} connections`);
    } else {
      summaryLines.push("Canvas: not yet generated");
    }
    summaryLines.push("");
    summaryLines.push("Theme clusters:");
    for (const [theme, files] of Object.entries(themeClusters).sort((a, b) => b[1].length - a[1].length)) {
      summaryLines.push(`  ${theme} (${files.length}): ${files.slice(0, 3).join(", ")}${files.length > 3 ? ` +${files.length - 3} more` : ""}`);
    }

    const result = {
      themes: Object.keys(themeClusters),
      themeClusters,
      momentCount: moments.length,
      connectionCount,
      canvasNodeCount: nodeCount,
      themeGroups,
      summary: summaryLines.join("\n"),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error reading patterns: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 4: add_research
// ---------------------------------------------------------------------------

server.registerTool("add_research", {
  description:
    "Save research from a URL or text. Categorizes it, writes a full note to the vault, and returns metadata.",
  inputSchema: {
    url: z.string().optional().describe("Source URL of the research"),
    title: z.string().describe("Title of the research note"),
    content: z.string().describe("The research content (markdown)"),
    resourceType: z.string().optional().describe("Type of resource: article, paper, guide, video, book, tool, course, podcast, documentation"),
  },
}, async ({ url, title, content, resourceType }) => {
  try {
    // Auto-categorize based on content keywords
    const lowerContent = (title + " " + content).toLowerCase();
    let matchedCategory: ResearchCategory | undefined;
    let bestScore = 0;

    for (const category of config.researchCategories) {
      const score = category.keywords.reduce((count, keyword) => {
        return count + (lowerContent.includes(keyword) ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        matchedCategory = category;
      }
    }

    // Extract tags from content (simple keyword extraction)
    const tags: string[] = ["research"];
    if (resourceType) {
      tags.push(resourceType);
    }
    if (matchedCategory) {
      tags.push(matchedCategory.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"));
    }

    // Build frontmatter
    const today = new Date().toISOString().split("T")[0];
    const frontmatter: ResearchFrontmatter = {
      title,
      source: url ?? "",
      author: "",
      published: "",
      created: today,
      tags,
    };

    // Build filename
    const safeTitle = title
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    const filename = `${safeTitle}.md`;

    // Write the note
    const filepath = writeResearchNote(config, filename, frontmatter, content, matchedCategory);

    // Emit learning_extracted signal
    const learningSignal: LearningExtractedSignal = {
      id: signalId(),
      type: "learning_extracted",
      timestamp: new Date().toISOString(),
      data: {
        filename,
        pillar: matchedCategory?.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") ?? "uncategorized",
        topicTags: tags,
        sourceResearch: title,
      },
    };
    emitSignal(config, learningSignal);

    // Log to session memory
    const now = new Date();
    const timeStr = formatSessionTime(now);
    appendSessionEntry(config, {
      time: timeStr,
      action: "research_added",
      detail: `Saved "${title}" to ${matchedCategory?.name ?? "Uncategorized"}, tags: ${tags.join(", ")}`,
    });

    const result = {
      filepath,
      filename,
      category: matchedCategory?.name ?? "Uncategorized",
      tags,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error saving research: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 5: social_coach
// ---------------------------------------------------------------------------

server.registerTool("social_coach", {
  description:
    "Recommend what to post and where, based on your moments, learnings, and content strategy. Returns high-potential moments, suggested platforms, and pillar balance status.",
  inputSchema: {
    focus: z.string().optional().describe("Optional: focus on a specific moment or topic (filename or keyword)"),
  },
}, async ({ focus }) => {
  try {
    // Read signals and memory for context
    const signalSummary = summarizeSignals(config);
    const preferences = readPreferences(config);

    const moments = readMoments(config);

    // Filter to high story-potential moments
    let candidates = moments.filter(
      (m) => m.frontmatter["story-potential"] === "high" || m.frontmatter["story-potential"] === "medium",
    );

    // If a focus is provided, narrow further
    if (focus) {
      const lowerFocus = focus.toLowerCase();
      const focused = candidates.filter(
        (m) =>
          m.filename.toLowerCase().includes(lowerFocus) ||
          m.content.toLowerCase().includes(lowerFocus) ||
          m.frontmatter.themes.some((t) => t.toLowerCase().includes(lowerFocus)),
      );
      if (focused.length > 0) {
        candidates = focused;
      }
    }

    // Sort: high potential first, then by date descending
    candidates.sort((a, b) => {
      const potentialOrder = { high: 0, medium: 1, low: 2 };
      const potA = potentialOrder[a.frontmatter["story-potential"]] ?? 2;
      const potB = potentialOrder[b.frontmatter["story-potential"]] ?? 2;
      if (potA !== potB) return potA - potB;
      return b.frontmatter.date.localeCompare(a.frontmatter.date);
    });

    // Read existing stories for content balance
    const storiesDir = resolveStoriesDir(config);
    const stories = readStories(config);

    // Count director cuts across story folders
    let directorCutCount = 0;
    if (existsSync(storiesDir)) {
      const storyFolders = readdirSync(storiesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory());
      for (const folder of storyFolders) {
        const storyFolder = join(storiesDir, folder.name);
        const files = readdirSync(storyFolder).filter((f) => f.endsWith(".md") && f !== "story.md" && f !== "raw.md" && f !== "README.md");
        directorCutCount += files.length;
      }
    }

    // Build recommendations (top 5 candidates)
    const recommendations = candidates.slice(0, 5).map((m) => {
      const titleMatch = m.content.match(/^#\s+(.+)$/m);
      // Suggest platform based on moment type and themes
      const platforms: string[] = [];
      if (m.frontmatter["story-potential"] === "high") {
        platforms.push("youtube", "linkedin", "x");
      } else {
        platforms.push("linkedin", "x");
      }

      return {
        filename: m.filename,
        title: titleMatch?.[1] ?? m.filename.replace(/\.md$/, ""),
        date: m.frontmatter.date,
        themes: m.frontmatter.themes,
        storyPotential: m.frontmatter["story-potential"],
        fiveSecondMoment: m.fiveSecondMoment ?? null,
        suggestedPlatforms: platforms,
        hasDirectorCuts: (() => {
          // Check if any story folder has director cuts related to this moment
          const momentSlug = m.filename.toLowerCase().replace(/\.md$/, "").slice(11); // remove date prefix
          const storyFolder = join(storiesDir, momentSlug);
          return existsSync(storyFolder) && readdirSync(storyFolder).some((f) =>
            f.endsWith(".md") && f !== "story.md" && f !== "raw.md" && f !== "README.md"
          );
        })(),
      };
    });

    // Include voice context so Claude can align recommendations with the mission
    const voice = readVoice();

    // Build signal context for the response
    const rejectedPillars = signalSummary.rejectedTopics.map((s) => s.data.pillar);

    const postedPlatforms = signalSummary.postedContent.map((s) => ({
      platform: s.data.platform,
      scriptFilename: s.data.scriptFilename,
    }));

    const topEngagementData = signalSummary.topEngagement.slice(0, 3).map((s) => ({
      platform: s.data.platform,
      url: s.data.url,
      views: s.data.views,
      likes: s.data.likes,
    }));

    const clusterTopics = signalSummary.recentClusters.map((s) => ({
      topicTag: s.data.topicTag,
      learningCount: s.data.learningCount,
    }));

    // Log to session memory
    const now = new Date();
    const timeStr = formatSessionTime(now);
    appendSessionEntry(config, {
      time: timeStr,
      action: "coaching_done",
      detail: `Created ${recommendations.length} recommendations for ${[...new Set(recommendations.flatMap((r) => r.suggestedPlatforms))].join(", ")}`,
    });

    const result = {
      voice: voice ? voice.slice(0, 500) : null,
      recommendations,
      totalMoments: moments.length,
      highPotentialCount: moments.filter((m) => m.frontmatter["story-potential"] === "high").length,
      existingStoryCount: stories.length,
      directorCutCount,
      signals: {
        rejectedPillars,
        postedPlatforms,
        topEngagement: topEngagementData,
        clusters: clusterTopics,
      },
      preferences: preferences ? preferences.slice(0, 500) : null,
      storyCraftNudge: (() => {
        const days = daysSinceLastPractice();
        if (days === null) return "You haven't tried /story-craft yet. Developing moments into stories makes them stronger content.";
        if (days >= 7) return `It's been ${days} days since your last story craft practice. Developing your high-potential moments with /story-craft makes them ready for content.`;
        return null;
      })(),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error running social coach: ${message}` }],
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
    signalType: z.enum(["recommendation_rejected", "content_posted", "engagement_updated", "cluster_formed"])
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
    filename: z.string().optional().describe("Script or learning filename"),
    topicTag: z.string().optional().describe("Topic tag for cluster_formed signal"),
    learningCount: z.number().optional().describe("Number of learnings in cluster"),
    learningFilenames: z.array(z.string()).optional().describe("Learning filenames in cluster"),
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

      case "cluster_formed":
        signal = {
          id: signalId(),
          type: "cluster_formed",
          timestamp,
          data: {
            topicTag: args.topicTag ?? "",
            learningCount: args.learningCount ?? 0,
            learningFilenames: args.learningFilenames ?? [],
          },
        };
        sessionDetail = `Cluster formed: ${args.topicTag} (${args.learningCount ?? 0} learnings)`;
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
    "Recall preferences, recent session history, and signal summary. Use when the user asks what Lumis remembers or what their preferences are.",
}, async () => {
  try {
    const preferences = readPreferences(config);
    const sessions = readRecentSessions(config, 3);
    const signals = summarizeSignals(config);

    const result = {
      preferences: preferences ?? "No preferences saved yet.",
      recentSessions: sessions.length > 0 ? sessions : ["No session history yet."],
      signalSummary: {
        recentMomentCount: signals.recentMoments.length,
        recentMoments: signals.recentMoments.map((s) => ({
          filename: s.data.filename,
          themes: s.data.themes,
          storyPotential: s.data.storyPotential,
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
        clusterCount: signals.recentClusters.length,
        clusters: signals.recentClusters.map((s) => ({
          topicTag: s.data.topicTag,
          learningCount: s.data.learningCount,
          timestamp: s.timestamp,
        })),
      },
      storyCraft: (() => {
        const days = daysSinceLastPractice();
        if (days === null) return { lastPractice: null, suggestion: "You haven't tried /story-craft yet. It's a quick way to develop storytelling skill from your moments." };
        if (days >= 7) return { lastPractice: `${days} days ago`, suggestion: `It's been ${days} days since your last story craft practice. A quick /story-craft session keeps the skill sharp.` };
        return { lastPractice: `${days} days ago`, suggestion: null };
      })(),
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
// Tool 10: story_craft_practice
// ---------------------------------------------------------------------------

server.registerTool("story_craft_practice", {
  description:
    "Practice storytelling craft. Surfaces a high-potential undeveloped moment and gives one focused exercise from the six storytelling elements (Transformation, 5-Second Moment, The Question, The Stakes, The Turns, Opening Scene).",
}, async () => {
  try {
    const moments = readMoments(config);

    // Pick a moment: high potential + captured first, then medium, most recent first
    const candidates = moments
      .filter((m) =>
        (m.frontmatter["story-potential"] === "high" || m.frontmatter["story-potential"] === "medium") &&
        (m.frontmatter["story-status"] === "captured" || m.frontmatter["story-status"] === "exploring"),
      )
      .sort((a, b) => {
        const potentialOrder = { high: 0, medium: 1, low: 2 };
        const potA = potentialOrder[a.frontmatter["story-potential"]] ?? 2;
        const potB = potentialOrder[b.frontmatter["story-potential"]] ?? 2;
        if (potA !== potB) return potA - potB;
        return b.frontmatter.date.localeCompare(a.frontmatter.date);
      });

    if (candidates.length === 0) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "No eligible moments found. Capture more moments with /moment first." }, null, 2) }],
      };
    }

    const chosen = candidates[0];
    const titleMatch = chosen.content.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1] ?? chosen.filename.replace(/\.md$/, "");

    // Determine which element to practice (check practice log for least-practiced)
    const elements = ["Transformation", "5-Second Moment", "The Question", "The Stakes", "The Turns", "Opening Scene"];
    const elementCounts: Record<string, number> = {};
    for (const el of elements) elementCounts[el] = 0;

    const logPath = resolvePracticeLogPath(config);
    if (existsSync(logPath)) {
      const logContent = readFileSync(logPath, "utf-8");
      for (const el of elements) {
        const regex = new RegExp(`## \\d{4}-\\d{2}-\\d{2} — ${el.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
        const matches = logContent.match(regex);
        elementCounts[el] = matches?.length ?? 0;
      }
    }

    // Pick least-practiced element
    const sortedElements = elements.sort((a, b) => elementCounts[a] - elementCounts[b]);
    const chosenElement = sortedElements[0];

    // Build the exercise prompt
    const exercisePrompts: Record<string, string> = {
      "Transformation": "What were you before this moment? What were you after? Not what you did. Who you were.",
      "5-Second Moment": `Is "${chosen.fiveSecondMoment ?? "[the 5-second moment]"}" the precise instant? Or is there a smaller moment inside it? Can you narrow it to a single breath, a single sentence, a single look?`,
      "The Question": "If you told this story on stage, what question would you plant in the audience's mind in the first 10 seconds? What would make them need to know what happens next?",
      "The Stakes": "What does the audience need to know early to care about what happens? What could go wrong? What's at risk?",
      "The Turns": "Walk through what happened and find every 'but then...' turn. Where did the story change direction? List them.",
      "Opening Scene": "Where does this story actually start? Skip the setup, skip the context. What's the first thing happening right before everything changes?",
    };

    const result = {
      moment: {
        filename: chosen.filename,
        path: chosen.path,
        title,
        date: chosen.frontmatter.date,
        themes: chosen.frontmatter.themes,
        storyPotential: chosen.frontmatter["story-potential"],
        fiveSecondMoment: chosen.fiveSecondMoment ?? null,
        content: chosen.content,
      },
      exercise: {
        element: chosenElement,
        prompt: exercisePrompts[chosenElement],
        practiceCount: elementCounts[chosenElement],
      },
      elementHistory: elementCounts,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error in story craft practice: ${message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Tool 11: story_craft_develop
// ---------------------------------------------------------------------------

server.registerTool("story_craft_develop", {
  description:
    "Develop a moment into a full story. Returns the moment context for a guided multi-turn conversation through the six storytelling elements. Optionally search for a specific moment by keyword.",
  inputSchema: {
    search: z.string().optional().describe("Search term to find a specific moment (filename or content keyword)"),
    momentFilename: z.string().optional().describe("Exact filename of the moment to develop"),
    title: z.string().optional().describe("Story title (used when saving the final story)"),
    transformation: z.object({
      before: z.string(),
      after: z.string(),
      change: z.string(),
    }).optional().describe("Transformation element: before, after, change"),
    fiveSecondMoment: z.string().optional().describe("The refined 5-second moment"),
    theQuestion: z.string().optional().describe("The question that hooks the audience"),
    openingScene: z.string().optional().describe("Where the story starts"),
    theStakes: z.string().optional().describe("What the audience needs to know to care"),
    theTurns: z.array(z.string()).optional().describe("List of story turns"),
    theStory: z.string().optional().describe("Full narrative draft"),
    save: z.boolean().optional().describe("Set to true to save the story file with all provided elements"),
  },
}, async (args) => {
  try {
    const moments = readMoments(config);

    // Find the moment
    let chosen = null;

    if (args.momentFilename) {
      chosen = moments.find((m) => m.filename === args.momentFilename) ?? null;
    } else if (args.search) {
      const lowerSearch = args.search.toLowerCase();
      const matches = moments.filter(
        (m) =>
          m.filename.toLowerCase().includes(lowerSearch) ||
          m.content.toLowerCase().includes(lowerSearch) ||
          m.frontmatter.themes.some((t) => t.toLowerCase().includes(lowerSearch)),
      );

      if (matches.length === 0) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: `No moments found matching "${args.search}"`, availableMoments: moments.slice(0, 10).map((m) => m.filename) }, null, 2) }],
        };
      }

      if (matches.length === 1) {
        chosen = matches[0];
      } else {
        // Return candidates for the user to choose
        return {
          content: [{ type: "text" as const, text: JSON.stringify({
            multipleMatches: true,
            matches: matches.map((m) => {
              const t = m.content.match(/^#\s+(.+)$/m);
              return {
                filename: m.filename,
                title: t?.[1] ?? m.filename.replace(/\.md$/, ""),
                date: m.frontmatter.date,
                storyPotential: m.frontmatter["story-potential"],
                themes: m.frontmatter.themes,
              };
            }),
          }, null, 2) }],
        };
      }
    } else {
      // Pick highest-potential undeveloped moment
      const candidates = moments
        .filter((m) =>
          (m.frontmatter["story-potential"] === "high" || m.frontmatter["story-potential"] === "medium") &&
          (m.frontmatter["story-status"] === "captured" || m.frontmatter["story-status"] === "exploring"),
        )
        .sort((a, b) => {
          const potentialOrder = { high: 0, medium: 1, low: 2 };
          const potA = potentialOrder[a.frontmatter["story-potential"]] ?? 2;
          const potB = potentialOrder[b.frontmatter["story-potential"]] ?? 2;
          if (potA !== potB) return potA - potB;
          return b.frontmatter.date.localeCompare(a.frontmatter.date);
        });

      if (candidates.length === 0) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "No eligible moments found. Capture more moments with /moment first." }, null, 2) }],
        };
      }
      chosen = candidates[0];
    }

    if (!chosen) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "Moment not found" }, null, 2) }],
      };
    }

    const titleMatch = chosen.content.match(/^#\s+(.+)$/m);
    const momentTitle = titleMatch?.[1] ?? chosen.filename.replace(/\.md$/, "");

    // If save is true, write the story file
    if (args.save) {
      const today = new Date().toISOString().split("T")[0];
      const storyTitle = args.title ?? momentTitle;
      const safeTitle = storyTitle
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      const storyFilename = `${today} - ${safeTitle}.md`;

      const frontmatter: StoryFrontmatter = {
        title: storyTitle,
        type: "story",
        source: `[[${chosen.path}]]`,
        created: today,
        "craft-status": "drafting",
        themes: chosen.frontmatter.themes,
        tags: ["story", "craft/drafting"],
      };

      // Build content sections
      const sections: string[] = [`# ${storyTitle}`];

      if (args.transformation) {
        sections.push(`\n## Transformation\n**Before**: ${args.transformation.before}\n**After**: ${args.transformation.after}\n**The change**: ${args.transformation.change}`);
      }

      if (args.fiveSecondMoment) {
        sections.push(`\n## The 5-Second Moment\n${args.fiveSecondMoment}`);
      }

      if (args.theQuestion) {
        sections.push(`\n## The Question\n${args.theQuestion}`);
      }

      if (args.openingScene) {
        sections.push(`\n## Opening Scene\n${args.openingScene}`);
      }

      if (args.theStakes) {
        sections.push(`\n## The Stakes\n${args.theStakes}`);
      }

      if (args.theTurns && args.theTurns.length > 0) {
        sections.push(`\n## The Turns\n${args.theTurns.map((t) => `- ${t}`).join("\n")}`);
      }

      if (args.theStory) {
        sections.push(`\n## The Story\n${args.theStory}`);
      }

      const content = sections.join("\n");
      const filepath = writeStory(config, storyFilename, frontmatter, content);

      // Update source moment's story-status to developing
      const momentPath = join(resolveMomentsDir(config), chosen.filename);
      if (existsSync(momentPath)) {
        const momentRaw = readFileSync(momentPath, "utf-8");
        const updated = momentRaw.replace(/story-status:\s*captured/, "story-status: developing")
          .replace(/story-status:\s*exploring/, "story-status: developing");
        if (updated !== momentRaw) {
          writeFileSync(momentPath, updated, "utf-8");
        }
      }

      // Emit story_developed signal
      const storySignal: StoryDevelopedSignal = {
        id: signalId(),
        type: "story_developed",
        timestamp: new Date().toISOString(),
        data: {
          storyFilename,
          sourceMoment: `[[${chosen.path}]]`,
          craftStatus: "drafting",
        },
      };
      emitSignal(config, storySignal);

      // Log to session memory
      const now = new Date();
      const timeStr = formatSessionTime(now);
      appendSessionEntry(config, {
        time: timeStr,
        action: "story_developed",
        detail: `Developed "${storyTitle}" from [[${chosen.path}]] (craft-status: drafting)`,
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify({
          saved: true,
          filepath,
          storyFilename,
          title: storyTitle,
          source: chosen.path,
          craftStatus: "drafting",
          themes: chosen.frontmatter.themes,
        }, null, 2) }],
      };
    }

    // Return moment context for the guided conversation
    const result = {
      moment: {
        filename: chosen.filename,
        path: chosen.path,
        title: momentTitle,
        date: chosen.frontmatter.date,
        themes: chosen.frontmatter.themes,
        storyPotential: chosen.frontmatter["story-potential"],
        storyStatus: chosen.frontmatter["story-status"],
        momentType: chosen.frontmatter["moment-type"],
        fiveSecondMoment: chosen.fiveSecondMoment ?? null,
        content: chosen.content,
        connections: chosen.connections,
      },
      elements: ["Transformation", "5-Second Moment", "The Question", "Opening Scene", "The Stakes", "The Turns"],
      existingStories: readStories(config)
        .filter((s) => s.frontmatter.source.includes(chosen!.filename.replace(/\.md$/, "")))
        .map((s) => ({ filename: s.filename, craftStatus: s.frontmatter["craft-status"] })),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error in story craft develop: ${message}` }],
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
  console.error("Lumis MCP server running on stdio");
}

main().catch((err) => {
  console.error("Lumis MCP server failed to start:", err);
  process.exit(1);
});
