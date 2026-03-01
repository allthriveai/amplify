import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { brand } from './brand';

export const BrandedOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const urlScale = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 14,
      stiffness: 100,
      mass: 0.6,
    },
  });

  const ctaOpacity = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const accentWidth = interpolate(frame, [20, 50], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.navy,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: 72,
            fontWeight: 700,
            color: brand.colors.white,
            transform: `scale(${urlScale})`,
          }}
        >
          {brand.domain}
        </div>

        <div
          style={{
            width: accentWidth,
            height: 4,
            backgroundColor: brand.colors.gold,
            borderRadius: 2,
          }}
        />

        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: 32,
            fontWeight: 500,
            color: brand.colors.gold,
            opacity: ctaOpacity,
            letterSpacing: 2,
          }}
        >
          Follow for more
        </div>
      </div>
    </AbsoluteFill>
  );
};
