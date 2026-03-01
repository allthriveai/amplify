import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BrandedVideo, BrandedVideoProps } from './BrandedVideo';
import { BrandedIntro } from './BrandedIntro';
import { BrandedOutro } from './BrandedOutro';
import { DirectorCut, DirectorCutProps, calculateDirectorCutMetadata } from './DirectorCut';
import { TextCard, TextCardProps } from './TextCard';
import { BRollPlaceholder, BRollPlaceholderProps } from './BRollPlaceholder';
import { brand } from './brand';

const RemotionRoot: React.FC = () => {
  const { width, height } = brand.resolution;
  const { fps } = brand.timing;

  return (
    <>
      {/* Main branded video composition */}
      <Composition<BrandedVideoProps>
        id="BrandedVideo"
        component={BrandedVideo}
        durationInFrames={900}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          videoSrc: 'https://example.com/placeholder.mp4',
          title: 'Untitled Video',
          durationInFrames: 900,
        }}
      />

      {/* Director Cut — multi-shot timeline composition */}
      <Composition<DirectorCutProps>
        id="DirectorCut"
        component={DirectorCut}
        durationInFrames={900}
        fps={fps}
        width={width}
        height={height}
        calculateMetadata={calculateDirectorCutMetadata}
        defaultProps={{
          title: 'Untitled Timeline',
          shots: [],
        }}
      />

      {/* Text card preview */}
      <Composition<TextCardProps>
        id="TextCard"
        component={TextCard}
        durationInFrames={150}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          type: 'stat',
          lines: ['67%', 'of companies have no character evaluation'],
        }}
      />

      {/* B-roll placeholder preview */}
      <Composition<BRollPlaceholderProps>
        id="BRollPlaceholder"
        component={BRollPlaceholder}
        durationInFrames={150}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          direction: 'Screen recording of agent evaluation dashboard',
        }}
      />

      {/* Standalone intro for preview */}
      <Composition
        id="BrandedIntro"
        component={BrandedIntro}
        durationInFrames={brand.timing.introFrames}
        fps={fps}
        width={width}
        height={height}
      />

      {/* Standalone outro for preview */}
      <Composition
        id="BrandedOutro"
        component={BrandedOutro}
        durationInFrames={brand.timing.outroFrames}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};

registerRoot(RemotionRoot);
