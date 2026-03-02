// Google font loading for Remotion compositions.
// Browser-safe — uses @remotion/google-fonts for proper font bundling.

import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

export { fontFamily };
