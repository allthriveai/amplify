import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { BRollPlaceholder } from './BRollPlaceholder';
import { resolveMediaSrc } from './AvatarClip';
import { useEntranceExit } from './animations';

export interface ScreenCaptureProps {
  src: string;
  isVideo: boolean;
  direction?: string;
}

export const ScreenCapture: React.FC<ScreenCaptureProps> = ({
  src,
  isVideo,
  direction,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { combinedOpacity } = useEntranceExit(8);

  if (!src) {
    return <BRollPlaceholder direction={direction ?? 'Screen capture placeholder'} />;
  }

  if (isVideo) {
    return (
      <AbsoluteFill style={{ opacity: combinedOpacity }}>
        <OffthreadVideo
          src={resolveMediaSrc(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>
    );
  }

  // Ken Burns: slow zoom from 1.0 to 1.05 over the duration
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: combinedOpacity }}>
      <Img
        src={resolveMediaSrc(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
