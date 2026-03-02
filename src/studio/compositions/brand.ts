// Brand constants for Remotion compositions.
// This file must stay free of Node.js imports (fs, path, dotenv, config)
// because Remotion's webpack bundler runs it in a browser context.
//
// To use custom brand colors from .lumisrc, pass them as props to compositions
// or use Remotion's getInputProps() at render time.

import { fontFamily } from './fonts.js';

export const brand = {
  colors: {
    navy: '#2e4a6e',
    teal: '#389590',
    charcoal: '#1a2538',
    gold: '#e0a53c',
    cream: '#ece6de',
    sand: '#d1c9be',
    white: '#ffffff',
    black: '#000000',
  },
  name: '',
  domain: '',
  fonts: { body: fontFamily },
  timing: {
    fps: 30,
    introSeconds: 3,
    outroSeconds: 5,
    get introFrames() {
      return this.fps * this.introSeconds;
    },
    get outroFrames() {
      return this.fps * this.outroSeconds;
    },
  },
  resolution: {
    width: 1920,
    height: 1080,
  },
  textCard: {
    padding: 80,
    statFontSize: 120,
    statSubFontSize: 36,
    quoteFontSize: 48,
    contrastFontSize: 40,
    listFontSize: 36,
    statementFontSize: 56,
    accentBarWidth: 6,
    accentBarHeight: 120,
  },
};
