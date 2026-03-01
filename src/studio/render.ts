import { execSync, spawn } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ResolvedShot } from "../types/director.js";

export interface RenderProps {
  videoSrc: string;
  title: string;
  captionsSrc?: Array<{ text: string; startFrame: number; endFrame: number }>;
  durationInFrames: number;
}

/**
 * Render a branded video using Remotion.
 * Writes props to a temp file (avoids shell escaping issues)
 * then shells out to `npx remotion render`.
 * Returns the output path on success.
 */
export async function renderVideo(
  props: RenderProps,
  outputPath: string,
): Promise<string> {
  const propsFile = join(tmpdir(), `lumis-render-props-${Date.now()}.json`);
  writeFileSync(propsFile, JSON.stringify(props), "utf-8");

  try {
    execSync(
      `npx remotion render BrandedVideo --props "${propsFile}" --output "${outputPath}"`,
      { stdio: "inherit" },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Remotion render failed: ${message}`);
  } finally {
    try { unlinkSync(propsFile); } catch {}
  }

  return outputPath;
}

export interface DirectorCutRenderProps {
  shots: ResolvedShot[];
  title: string;
}

/**
 * Render a Director Cut (multi-shot timeline) using Remotion.
 * Writes props to a temp file then shells out to `npx remotion render`.
 * Returns the output path on success.
 */
export async function renderDirectorCut(
  props: DirectorCutRenderProps,
  outputPath: string,
): Promise<string> {
  const propsFile = join(tmpdir(), `lumis-director-props-${Date.now()}.json`);
  writeFileSync(propsFile, JSON.stringify(props), "utf-8");

  try {
    execSync(
      `npx remotion render DirectorCut --props "${propsFile}" --output "${outputPath}"`,
      { stdio: "inherit" },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Remotion DirectorCut render failed: ${message}`);
  } finally {
    try { unlinkSync(propsFile); } catch {}
  }

  return outputPath;
}

/**
 * Open the Remotion studio for previewing compositions.
 * This spawns a long-running process (the dev server).
 */
export async function previewVideo(): Promise<void> {
  const child = spawn("npx", ["remotion", "studio"], {
    stdio: "inherit",
    detached: true,
  });

  // Let the studio run independently
  child.unref();

  child.on("error", (error) => {
    throw new Error(`Failed to start Remotion studio: ${error.message}`);
  });
}
