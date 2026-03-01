import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { brand } from './brand';

export const BrandedIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleScale = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    },
  });

  const subtitleOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.navy,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: 96,
            fontWeight: 700,
            color: brand.colors.white,
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          {brand.name}
        </div>
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: 28,
            fontWeight: 400,
            color: brand.colors.gold,
            opacity: subtitleOpacity,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          {brand.domain}
        </div>
      </div>
    </AbsoluteFill>
  );
};
