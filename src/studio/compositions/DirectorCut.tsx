import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  CalculateMetadataFunction,
} from 'remotion';
import type { ResolvedShot, TextCardType } from '../../types/director';
import { AvatarClip } from './AvatarClip';
import { TextCard } from './TextCard';
import { BRollPlaceholder } from './BRollPlaceholder';
import { BrandedIntro } from './BrandedIntro';
import { BrandedOutro } from './BrandedOutro';
import { brand } from './brand';

export interface DirectorCutProps {
  shots: ResolvedShot[];
  title: string;
}

export const calculateDirectorCutMetadata: CalculateMetadataFunction<DirectorCutProps> = ({
  props,
}) => {
  const totalFrames = props.shots.reduce((sum, s) => sum + s.durationInFrames, 0);
  return {
    durationInFrames: totalFrames || 1,
    fps: brand.timing.fps,
    width: brand.resolution.width,
    height: brand.resolution.height,
  };
};

const renderShot = (shot: ResolvedShot): React.ReactNode => {
  switch (shot.shotType) {
    case 'avatar':
      return <AvatarClip videoSrc={shot.videoSrc ?? ''} />;

    case 'text-card':
      return (
        <TextCard
          type={shot.textCard?.type as TextCardType ?? 'statement'}
          lines={shot.textCard?.lines ?? (shot.script ? shot.script.split('\n') : [])}
        />
      );

    case 'b-roll-placeholder':
      return <BRollPlaceholder direction={shot.direction ?? shot.script ?? ''} />;

    case 'branded-intro':
      return <BrandedIntro />;

    case 'branded-outro':
      return <BrandedOutro />;

    default:
      return null;
  }
};

export const DirectorCut: React.FC<DirectorCutProps> = ({ shots }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.charcoal }}>
      {shots.map((shot) => (
        <Sequence
          key={shot.id}
          from={shot.startFrame}
          durationInFrames={shot.durationInFrames}
        >
          {renderShot(shot)}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
