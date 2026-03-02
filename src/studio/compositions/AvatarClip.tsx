import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { useEntranceExit } from './animations';

interface AvatarClipProps {
  videoSrc: string;
  muted?: boolean;
}

/** Wrap a path in staticFile() unless it's already a URL */
const resolveMediaSrc = (src: string) =>
  src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')
    ? src
    : staticFile(src);

export { resolveMediaSrc };

export const AvatarClip: React.FC<AvatarClipProps> = ({ videoSrc, muted }) => {
  const { combinedOpacity } = useEntranceExit(8);

  return (
    <AbsoluteFill style={{ opacity: combinedOpacity }}>
      <OffthreadVideo
        src={resolveMediaSrc(videoSrc)}
        muted={muted}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};
