export const brand = {
  colors: {
    teal: '#35656e',
    charcoal: '#394646',
    canary: '#fee19a',
    sky: '#d3e9ee',
    taupe: '#ded8ce',
    white: '#ffffff',
    black: '#000000',
  },
  fonts: {
    body: 'Inter',
  },
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
} as const;
