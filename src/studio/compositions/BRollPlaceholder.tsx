import React from 'react';
import {
  AbsoluteFill,
} from 'remotion';
import { brand } from './brand';
import { useEntranceExit } from './animations';

export interface BRollPlaceholderProps {
  direction: string;
}

export const BRollPlaceholder: React.FC<BRollPlaceholderProps> = ({ direction }) => {
  const { combinedOpacity } = useEntranceExit();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: combinedOpacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 20,
            fontWeight: 700,
            color: brand.colors.gold,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          B-ROLL
        </div>
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: 32,
            fontWeight: 400,
            color: brand.colors.sand,
            textAlign: 'center',
            maxWidth: '70%',
            lineHeight: 1.4,
          }}
        >
          {direction}
        </div>
      </div>
    </AbsoluteFill>
  );
};
