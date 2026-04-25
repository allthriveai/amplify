import type { CarouselCard } from "../types/director.js";

export interface CarouselBrand {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  ink?: string;
  inkLight?: string;
  inkMuted?: string;
  displayFont?: string;
  bodyFont?: string;
  fontsUrl?: string;
  borderRadius?: string;
  authorName?: string;
  authorHandle?: string;
  tagline?: string;
}

export interface RenderCarouselHtmlOptions {
  cards: CarouselCard[];
  brand?: CarouselBrand;
  /** Width in px. Default: 1080 */
  width?: number;
  /** Height in px. Default: 1350 */
  height?: number;
  /** Pre-resolved assets: card id → base64 data URI */
  assets?: Map<number, string>;
}

const DEFAULT_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,300;1,8..60,400&family=JetBrains+Mono:wght@400;500;600&display=swap";

/** Generate a self-contained HTML document with styled carousel cards for PDF rendering */
export function renderCarouselHtml(options: RenderCarouselHtmlOptions): string {
  const { cards, brand, width = 1080, height = 1350, assets } = options;

  const primary = brand?.primary ?? "#1e2a4a";
  const secondary = brand?.secondary ?? "#b8960c";
  const accent = brand?.accent ?? "#d4b44a";
  const background = brand?.background ?? "#fafaf7";
  const ink = brand?.ink ?? "#1a1915";
  const inkLight = brand?.inkLight ?? "#3d3b35";
  const inkMuted = brand?.inkMuted ?? "#8a867a";
  const displayFont = brand?.displayFont ?? "'Cormorant Garamond', Georgia, serif";
  const bodyFont = brand?.bodyFont ?? "'Source Serif 4', Georgia, serif";
  const fontsUrl = brand?.fontsUrl ?? DEFAULT_FONTS_URL;
  const borderRadius = brand?.borderRadius ?? "8px";
  const authorName = brand?.authorName ?? "";
  const authorHandle = brand?.authorHandle ?? "";
  const tagline = brand?.tagline ?? "";

  const totalCards = cards.length;

  const cardSections = cards
    .map((card, index) => {
      const isLast = index === totalCards - 1;
      const dots = renderDots(index, totalCards, card.cardType, primary, accent, inkMuted);
      const assetUri = assets?.get(card.id);
      const pageBreak = isLast ? "" : "page-break-after: always;";

      return `<section class="card card-${card.cardType}" style="${pageBreak}" data-card-type="${card.cardType}">
      ${assetUri ? `<div class="card-asset"><img src="${assetUri}" alt="" /></div>` : ""}
      <div class="card-content">${renderCardContent(card, { primary, secondary, accent, background, ink, inkLight, inkMuted, displayFont, bodyFont, borderRadius, authorName, authorHandle, tagline })}</div>
      <div class="card-dots">${dots}</div>
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${width}, initial-scale=1.0">
  <link rel="stylesheet" href="${escapeHtml(fontsUrl)}" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: ${width}px ${height}px;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .card {
      width: ${width}px;
      height: ${height}px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 100px 80px;
      position: relative;
      z-index: 1;
    }

    .card-asset {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .card-asset img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-dots {
      position: absolute;
      bottom: 40px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 10px;
      z-index: 2;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* Hook card */
    .card-hook {
      background: ${primary};
      color: #ffffff;
    }
    .card-hook .headline {
      font-family: ${displayFont};
      font-size: 72px;
      font-weight: 600;
      line-height: 1.1;
      text-align: center;
      letter-spacing: -0.02em;
    }

    /* Narrative card */
    .card-narrative {
      background: ${background};
      color: ${ink};
    }
    .card-narrative .card-content {
      align-items: flex-start;
      padding-left: 100px;
      border-left: 5px solid ${accent} ;
      margin-left: 80px;
      padding-right: 80px;
    }
    .card-narrative .headline {
      font-family: ${displayFont};
      font-size: 48px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.01em;
      margin-bottom: 24px;
    }
    .card-narrative .subtext {
      font-family: ${bodyFont};
      font-size: 28px;
      font-weight: 300;
      line-height: 1.5;
      color: ${inkLight};
    }

    /* Stat card */
    .card-stat {
      background: ${background};
      color: ${primary};
    }
    .card-stat .headline {
      font-family: ${displayFont};
      font-size: 120px;
      font-weight: 700;
      line-height: 1;
      text-align: center;
      letter-spacing: -0.03em;
      margin-bottom: 24px;
    }
    .card-stat .subtext {
      font-family: ${bodyFont};
      font-size: 24px;
      font-weight: 400;
      line-height: 1.5;
      color: ${inkMuted};
      text-align: center;
      max-width: 700px;
    }

    /* Quote card */
    .card-quote {
      background: ${background};
      color: ${ink};
    }
    .card-quote .card-content {
      align-items: flex-start;
      padding: 100px 100px;
    }
    .card-quote .quote-mark {
      font-family: ${displayFont};
      font-size: 200px;
      line-height: 0.6;
      color: ${accent};
      opacity: 0.6;
      margin-bottom: 20px;
      user-select: none;
    }
    .card-quote .headline {
      font-family: ${displayFont};
      font-size: 40px;
      font-weight: 400;
      font-style: italic;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }
    .card-quote .subtext {
      font-family: ${bodyFont};
      font-size: 22px;
      font-weight: 400;
      color: ${inkMuted};
      text-align: right;
      width: 100%;
      margin-top: 32px;
    }

    /* Contrast card */
    .card-contrast {
      background: ${background};
      color: ${ink};
    }
    .card-contrast .card-content {
      flex-direction: row;
      padding: 80px 60px;
      gap: 0;
    }
    .card-contrast .contrast-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px 40px;
      border-radius: ${borderRadius};
    }
    .card-contrast .contrast-left {
      background: ${inkMuted}1a;
      margin-right: 16px;
    }
    .card-contrast .contrast-right {
      background: ${accent}1a;
      margin-left: 16px;
    }
    .card-contrast .contrast-label {
      font-family: ${bodyFont};
      font-size: 18px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${inkMuted};
      margin-bottom: 20px;
    }
    .card-contrast .contrast-text {
      font-family: ${displayFont};
      font-size: 32px;
      font-weight: 500;
      line-height: 1.3;
    }
    .card-contrast .headline {
      font-family: ${displayFont};
      font-size: 36px;
      font-weight: 500;
      text-align: center;
      margin-bottom: 40px;
      width: 100%;
    }

    /* Takeaway card */
    .card-takeaway {
      background: ${primary};
      color: #ffffff;
    }
    .card-takeaway .headline {
      font-family: ${displayFont};
      font-size: 52px;
      font-weight: 500;
      line-height: 1.2;
      text-align: center;
      letter-spacing: -0.01em;
    }
    .card-takeaway .subtext {
      font-family: ${bodyFont};
      font-size: 24px;
      font-weight: 300;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.75);
      text-align: center;
      max-width: 700px;
      margin-top: 28px;
    }

    /* CTA card */
    .card-cta {
      background: ${background};
      color: ${ink};
    }
    .card-cta .headline {
      font-family: ${displayFont};
      font-size: 44px;
      font-weight: 500;
      line-height: 1.2;
      text-align: center;
      letter-spacing: -0.01em;
      padding-bottom: 12px;
      border-bottom: 4px solid ${accent};
    }
    .card-cta .subtext {
      font-family: ${bodyFont};
      font-size: 22px;
      font-weight: 400;
      color: ${inkMuted};
      text-align: center;
      margin-top: 28px;
    }

    /* Closer card */
    .card-closer {
      background: ${primary};
      color: #ffffff;
    }
    .card-closer .closer-rule {
      width: 60px;
      height: 2px;
      background: ${accent};
      margin-bottom: 36px;
    }
    .card-closer .author-name {
      font-family: ${displayFont};
      font-size: 36px;
      font-weight: 500;
      letter-spacing: -0.01em;
    }
    .card-closer .author-handle {
      font-family: ${bodyFont};
      font-size: 24px;
      font-weight: 400;
      color: ${accent};
      margin-top: 12px;
    }
    .card-closer .author-tagline {
      font-family: ${bodyFont};
      font-size: 20px;
      font-weight: 300;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 16px;
      max-width: 600px;
      text-align: center;
    }
  </style>
</head>
<body>
${cardSections}
</body>
</html>`;
}

interface CardColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  ink: string;
  inkLight: string;
  inkMuted: string;
  displayFont: string;
  bodyFont: string;
  borderRadius: string;
  authorName: string;
  authorHandle: string;
  tagline: string;
}

function renderCardContent(card: CarouselCard, colors: CardColors): string {
  const headline = formatHeadline(card.headline);

  switch (card.cardType) {
    case "hook":
      return `<div class="headline">${headline}</div>`;

    case "narrative":
      return `<div class="headline">${headline}</div>${card.subtext ? `<div class="subtext">${escapeHtml(card.subtext)}</div>` : ""}`;

    case "stat":
      return `<div class="headline">${headline}</div>${card.subtext ? `<div class="subtext">${escapeHtml(card.subtext)}</div>` : ""}`;

    case "quote":
      return `<div class="quote-mark">\u201C</div><div class="headline">${headline}</div>${card.subtext ? `<div class="subtext">\u2014 ${escapeHtml(card.subtext)}</div>` : ""}`;

    case "contrast":
      return `${card.headline ? `<div class="headline">${headline}</div>` : ""}<div style="display:flex;gap:32px;width:100%"><div class="contrast-col contrast-left">${card.leftLabel ? `<div class="contrast-label">${escapeHtml(card.leftLabel)}</div>` : ""}<div class="contrast-text">${escapeHtml(card.leftText ?? "")}</div></div><div class="contrast-col contrast-right">${card.rightLabel ? `<div class="contrast-label">${escapeHtml(card.rightLabel)}</div>` : ""}<div class="contrast-text">${escapeHtml(card.rightText ?? "")}</div></div></div>`;

    case "takeaway":
      return `<div class="headline">${headline}</div>${card.subtext ? `<div class="subtext">${escapeHtml(card.subtext)}</div>` : ""}`;

    case "cta":
      return `<div class="headline">${headline}</div>${card.subtext ? `<div class="subtext">${escapeHtml(card.subtext)}</div>` : ""}`;

    case "closer":
      return `<div class="closer-rule"></div><div class="author-name">${escapeHtml(colors.authorName || card.headline)}</div>${colors.authorHandle ? `<div class="author-handle">${escapeHtml(colors.authorHandle)}</div>` : card.subtext ? `<div class="author-handle">${escapeHtml(card.subtext)}</div>` : ""}<div class="author-tagline">${escapeHtml(colors.tagline || "")}</div>`;

    default:
      return `<div class="headline">${headline}</div>`;
  }
}

function renderDots(
  currentIndex: number,
  total: number,
  cardType: string,
  primary: string,
  accent: string,
  inkMuted: string,
): string {
  const isDark = cardType === "hook" || cardType === "takeaway" || cardType === "closer";
  const activeDot = isDark ? accent : primary;
  const inactiveDot = isDark ? "rgba(255,255,255,0.3)" : `${inkMuted}66`;

  return Array.from({ length: total })
    .map(
      (_, i) =>
        `<span class="dot" style="background:${i === currentIndex ? activeDot : inactiveDot}"></span>`,
    )
    .join("");
}

function formatHeadline(text: string): string {
  return escapeHtml(text)
    .split("\\n")
    .join("<br>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
