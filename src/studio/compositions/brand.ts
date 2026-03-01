import { loadConfig } from '../../config.js';

const DEFAULT_COLORS = {
  navy: '#2e4a6e',
  teal: '#389590',
  charcoal: '#1a2538',
  gold: '#e0a53c',
  cream: '#ece6de',
  sand: '#d1c9be',
  white: '#ffffff',
  black: '#000000',
};

const DEFAULT_TIMING = {
  fps: 30,
  introSeconds: 3,
  outroSeconds: 5,
  get introFrames() {
    return this.fps * this.introSeconds;
  },
  get outroFrames() {
    return this.fps * this.outroSeconds;
  },
};

const DEFAULT_RESOLUTION = {
  width: 1920,
  height: 1080,
};

const DEFAULT_TEXT_CARD = {
  padding: 80,
  statFontSize: 120,
  statSubFontSize: 36,
  quoteFontSize: 48,
  contrastFontSize: 40,
  listFontSize: 36,
  statementFontSize: 56,
  accentBarWidth: 6,
  accentBarHeight: 120,
};

const DEFAULT_BRAND = {
  colors: DEFAULT_COLORS,
  name: '',
  domain: '',
  fonts: { body: 'Inter' },
  timing: DEFAULT_TIMING,
  resolution: DEFAULT_RESOLUTION,
  textCard: DEFAULT_TEXT_CARD,
};

function resolveBrand() {
  try {
    const config = loadConfig();
    if (!config.brand) return DEFAULT_BRAND;
    return {
      colors: {
        navy: config.brand.colors.primary,
        teal: config.brand.colors.secondary,
        charcoal: config.brand.colors.text,
        gold: config.brand.colors.accent,
        cream: config.brand.colors.background,
        sand: config.brand.colors.neutral,
        white: '#ffffff',
        black: '#000000',
      },
      name: config.brand.name,
      domain: config.brand.domain ?? '',
      fonts: { body: config.brand.fonts.body ?? 'Inter' },
      timing: DEFAULT_TIMING,
      resolution: DEFAULT_RESOLUTION,
      textCard: DEFAULT_TEXT_CARD,
    };
  } catch {
    return DEFAULT_BRAND;
  }
}

export const brand = resolveBrand();
