import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Video } from '@remotion/media';
import { useEntranceExit } from './animations';

interface AvatarClipProps {
  videoSrc: string;
  muted?: boolean;
  /** Skip entrance fade — avatar visible from frame 0 */
  skipEntrance?: boolean;
}

/** Wrap a path in staticFile() unless it's already a URL or absolute path */
const resolveMediaSrc = (src: string) =>
  src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('/')
    ? src
    : staticFile(src);

export { resolveMediaSrc };

export const AvatarClip: React.FC<AvatarClipProps> = ({ videoSrc, muted, skipEntrance }) => {
  const { combinedOpacity } = useEntranceExit(8);

  return (
    <AbsoluteFill style={{ opacity: skipEntrance ? 1 : combinedOpacity }}>
      <Video
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
