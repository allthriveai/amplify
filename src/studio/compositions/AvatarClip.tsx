import React from 'react';
import { AbsoluteFill, OffthreadVideo } from 'remotion';

interface AvatarClipProps {
  videoSrc: string;
}

export const AvatarClip: React.FC<AvatarClipProps> = ({ videoSrc }) => {
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={videoSrc}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};
