import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { brand } from './brand';
import { AvatarClip } from './AvatarClip';
import { LowerThird } from './LowerThird';
import { Captions, CaptionEntry } from './Captions';
import { BrandedIntro } from './BrandedIntro';
import { BrandedOutro } from './BrandedOutro';

export interface BrandedVideoProps {
  videoSrc: string;
  title: string;
  captionsSrc?: CaptionEntry[];
  durationInFrames: number;
}

export const BrandedVideo: React.FC<BrandedVideoProps> = ({
  videoSrc,
  title,
  captionsSrc,
  durationInFrames,
}) => {
  const introFrames = brand.timing.introFrames;
  const outroFrames = brand.timing.outroFrames;
  const mainContentStart = introFrames;
  const mainContentDuration = durationInFrames - introFrames - outroFrames;
  const outroStart = durationInFrames - outroFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.charcoal }}>
      {/* Base layer: avatar video spanning the full duration */}
      <Sequence from={mainContentStart} durationInFrames={mainContentDuration}>
        <AvatarClip videoSrc={videoSrc} />
      </Sequence>

      {/* Lower third overlay on the main content */}
      <Sequence from={mainContentStart} durationInFrames={mainContentDuration}>
        <LowerThird />
      </Sequence>

      {/* Captions overlay on the main content */}
      {captionsSrc && captionsSrc.length > 0 && (
        <Sequence
          from={mainContentStart}
          durationInFrames={mainContentDuration}
        >
          <Captions captionsSrc={captionsSrc} />
        </Sequence>
      )}

      {/* Intro at the very start */}
      <Sequence from={0} durationInFrames={introFrames}>
        <BrandedIntro />
      </Sequence>

      {/* Outro at the end */}
      <Sequence from={outroStart} durationInFrames={outroFrames}>
        <BrandedOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
