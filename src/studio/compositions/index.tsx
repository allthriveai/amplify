import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BrandedVideo, BrandedVideoProps } from './BrandedVideo';
import { BrandedIntro } from './BrandedIntro';
import { BrandedOutro } from './BrandedOutro';
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
