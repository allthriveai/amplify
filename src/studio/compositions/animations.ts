// Reusable animation helpers for Remotion compositions.
// Browser-safe — no Node.js imports.

import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { SpringConfig } from 'remotion';

export const SPRING_SMOOTH: Partial<SpringConfig> = { damping: 200 };
export const SPRING_SNAPPY: Partial<SpringConfig> = { damping: 20, stiffness: 200, mass: 0.5 };
export const SPRING_BOUNCY: Partial<SpringConfig> = { damping: 10, stiffness: 100, mass: 0.6 };

export const TRANSITION_FADE_FRAMES = 15;
export const TRANSITION_SLIDE_FRAMES = 20;
export const TRANSITION_OVERLAY_FRAMES = 30;

/**
 * Entrance/exit opacity for any shot component.
 * Fades in over the first `fadeFrames` and out over the last `fadeFrames`.
 */
export function useEntranceExit(fadeFrames = 10) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - fadeFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const combinedOpacity = Math.min(enterOpacity, exitOpacity);

  return { enterOpacity, exitOpacity, combinedOpacity };
}

/**
 * Spring-animated scale for entrances. Starts at 0.9, settles at 1.
 */
export function useEntranceScale(config: Partial<SpringConfig> = SPRING_SMOOTH) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config });
  const scale = interpolate(progress, [0, 1], [0.9, 1]);

  return scale;
}

/**
 * Spring-animated translateY for slide-up entrance.
 * Starts offset by `distance` pixels, settles at 0.
 */
export function useSlideUp(distance = 40, config: Partial<SpringConfig> = SPRING_SMOOTH) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config });
  const translateY = interpolate(progress, [0, 1], [distance, 0]);

  return translateY;
}
