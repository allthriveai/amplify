import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";
import type { LumisConfig } from "../types/config.js";
import type {
  Signal,
  SignalsFile,
  MomentCapturedSignal,
  RecommendationRejectedSignal,
  ScriptDraftedSignal,
  ContentPostedSignal,
  EngagementUpdatedSignal,
  ClusterFormedSignal,
} from "../types/signal.js";
import { resolveSignalsPath } from "./paths.js";

const PRUNE_DAYS = 90;

/** Generate a unique signal ID */
export function signalId(): string {
  const ts = Date.now();
  const rand = randomBytes(3).toString("hex");
  return `sig-${ts}-${rand}`;
}

/** Read all signals from signals.json */
export function readSignals(config: LumisConfig): Signal[] {
  const path = resolveSignalsPath(config);
  if (!existsSync(path)) return [];

  try {
    const raw = readFileSync(path, "utf-8");
    const file = JSON.parse(raw) as unknown;
    if (
      typeof file !== "object" || file === null ||
      !("version" in file) || (file as SignalsFile).version !== 1 ||
      !("signals" in file) || !Array.isArray((file as SignalsFile).signals)
    ) {
      return [];
    }
    return (file as SignalsFile).signals;
  } catch {
    return [];
  }
}

/** Read signals from the last N days */
export function readRecentSignals(config: LumisConfig, days: number): Signal[] {
  const all = readSignals(config);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString();
  return all.filter((s) => s.timestamp >= cutoffIso);
}

/** Emit a signal: read, append, prune older than 90 days, write */
export function emitSignal(config: LumisConfig, signal: Signal): void {
  const path = resolveSignalsPath(config);
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const existing = readSignals(config);
  existing.push(signal);

  // Prune signals older than 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PRUNE_DAYS);
  const cutoffIso = cutoff.toISOString();
  const pruned = existing.filter((s) => s.timestamp >= cutoffIso);

  const file: SignalsFile = { version: 1, signals: pruned };
  writeFileSync(path, JSON.stringify(file, null, 2), "utf-8");
}

export interface SignalSummary {
  recentMoments: MomentCapturedSignal[];
  rejectedTopics: RecommendationRejectedSignal[];
  scriptedSources: ScriptDraftedSignal[];
  postedContent: ContentPostedSignal[];
  topEngagement: EngagementUpdatedSignal[];
  recentClusters: ClusterFormedSignal[];
}

/** Summarize signals for the social coach */
export function summarizeSignals(config: LumisConfig): SignalSummary {
  const recent = readRecentSignals(config, 30);

  const recentMoments = recent.filter((s): s is MomentCapturedSignal => s.type === "moment_captured");
  const rejectedTopics = recent.filter((s): s is RecommendationRejectedSignal => s.type === "recommendation_rejected");
  const scriptedSources = recent.filter((s): s is ScriptDraftedSignal => s.type === "script_drafted");
  const postedContent = recent.filter((s): s is ContentPostedSignal => s.type === "content_posted");
  const recentClusters = recent.filter((s): s is ClusterFormedSignal => s.type === "cluster_formed");

  // Top engagement: sort by total engagement descending
  const engagementSignals = recent.filter((s): s is EngagementUpdatedSignal => s.type === "engagement_updated");
  const topEngagement = [...engagementSignals].sort((a, b) => {
    const totalA = (a.data.views ?? 0) + (a.data.likes ?? 0) + (a.data.comments ?? 0) + (a.data.shares ?? 0);
    const totalB = (b.data.views ?? 0) + (b.data.likes ?? 0) + (b.data.comments ?? 0) + (b.data.shares ?? 0);
    return totalB - totalA;
  });

  return {
    recentMoments,
    rejectedTopics,
    scriptedSources,
    postedContent,
    topEngagement,
    recentClusters,
  };
}
