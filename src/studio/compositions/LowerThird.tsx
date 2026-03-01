import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { brand } from './brand';

export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 80,
      mass: 1,
    },
  });

  const translateX = interpolate(slideIn, [0, 1], [-400, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: 40,
        paddingLeft: 40,
      }}
    >
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            width: 6,
            backgroundColor: brand.colors.gold,
            borderRadius: '3px 0 0 3px',
          }}
        />
        <div
          style={{
            backgroundColor: brand.colors.navy,
            padding: '14px 28px',
            borderRadius: '0 6px 6px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: brand.fonts.body,
              fontSize: 28,
              fontWeight: 600,
              color: brand.colors.white,
            }}
          >
            {brand.name}
          </div>
          <div
            style={{
              fontFamily: brand.fonts.body,
              fontSize: 18,
              fontWeight: 400,
              color: brand.colors.gold,
            }}
          >
            {brand.domain}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
