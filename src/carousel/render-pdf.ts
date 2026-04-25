import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join, resolve, extname } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import type { CarouselCard } from "../types/director.js";
import type { LumisConfig } from "../types/config.js";
import { renderCarouselHtml } from "./render-html.js";
import type { CarouselBrand } from "./render-html.js";
import { resolveStoryAssetsDir } from "../vault/paths.js";

export interface RenderCarouselPdfOptions {
  cards: CarouselCard[];
  brand?: CarouselBrand;
  /** Width in px. Default: 1080 */
  width?: number;
  /** Height in px. Default: 1350 */
  height?: number;
  /** Story slug, used to resolve relative asset paths */
  slug?: string;
  /** Config, used to resolve relative asset paths */
  config?: LumisConfig;
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Render carousel cards to a multi-page PDF for LinkedIn upload.
 *
 * 1. Resolves any card assets to base64 data URIs
 * 2. Generates styled HTML with one card per page
 * 3. Opens in headless Playwright Chromium
 * 4. Exports to PDF at LinkedIn carousel dimensions (1080x1350)
 */
export async function renderCarouselPdf(
  options: RenderCarouselPdfOptions,
  outputPath: string,
): Promise<string> {
  const { cards, brand, width = 1080, height = 1350, slug, config } = options;

  // 1. Resolve assets to base64 data URIs
  const assets = new Map<number, string>();
  for (const card of cards) {
    if (!card.asset) continue;

    let assetPath = card.asset;

    // Resolve relative paths against story assets dir
    if (!assetPath.startsWith("/") && config && slug) {
      assetPath = join(resolveStoryAssetsDir(config, slug), assetPath);
    }

    if (existsSync(assetPath)) {
      const ext = extname(assetPath).toLowerCase();
      const mime = MIME_TYPES[ext] ?? "application/octet-stream";
      const buf = await readFile(assetPath);
      assets.set(card.id, `data:${mime};base64,${buf.toString("base64")}`);
    }
  }

  // 2. Generate HTML
  const html = renderCarouselHtml({ cards, brand, width, height, assets });

  // 3. Write to temp file
  const tmpDir = await mkdtemp(join(tmpdir(), "lumis-carousel-pdf-"));
  const htmlPath = join(tmpDir, "carousel.html");
  await writeFile(htmlPath, html);

  try {
    // 4. Launch Playwright
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width, height },
    });

    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

    // Wait for fonts to load
    await page.waitForTimeout(2000);

    // 5. Generate PDF
    const resolvedOutput = resolve(outputPath);
    await page.pdf({
      path: resolvedOutput,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      preferCSSPageSize: false,
    });

    await browser.close();

    return resolvedOutput;
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
