import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from './brand';

export interface CaptionEntry {
  text: string;
  startFrame: number;
  endFrame: number;
}

interface CaptionsProps {
  captionsSrc: CaptionEntry[];
}

export const Captions: React.FC<CaptionsProps> = ({ captionsSrc }) => {
  const frame = useCurrentFrame();

  const currentCaption = captionsSrc.find(
    (caption) => frame >= caption.startFrame && frame <= caption.endFrame,
  );

  if (!currentCaption) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 100,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '16px 32px',
          borderRadius: 8,
          maxWidth: '80%',
        }}
      >
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: 36,
            fontWeight: 500,
            color: brand.colors.white,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {currentCaption.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
