import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  CalculateMetadataFunction,
} from 'remotion';
import { Audio } from '@remotion/media';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import type { ResolvedShot, TextCardType, TransitionConfig } from '../../types/director';
import { AvatarClip, resolveMediaSrc } from './AvatarClip';
import { TextCard } from './TextCard';
import { BRollPlaceholder } from './BRollPlaceholder';
import { BrandedIntro } from './BrandedIntro';
import { BrandedOutro } from './BrandedOutro';
import { ScreenCapture } from './ScreenCapture';
import { brand } from './brand';

export interface DirectorCutProps {
  shots: ResolvedShot[];
  title: string;
}

/**
 * Calculate total duration accounting for transition overlaps.
 * Crossfade/slide transitions overlap adjacent shots (shorten timeline).
 * Overlay transitions (light-leak) don't reduce duration.
 */
export const calculateDirectorCutMetadata: CalculateMetadataFunction<DirectorCutProps> = ({
  props,
}) => {
  let totalFrames = 0;
  for (const shot of props.shots) {
    totalFrames += shot.durationInFrames;
  }

  // Subtract overlap from non-overlay transitions
  for (const shot of props.shots) {
    if (shot.transitionIn && shot.transitionIn.type !== 'light-leak' && shot.transitionIn.type !== 'none') {
      totalFrames -= shot.transitionIn.durationInFrames;
    }
  }

  return {
    durationInFrames: totalFrames || 1,
    fps: brand.timing.fps,
    width: brand.resolution.width,
    height: brand.resolution.height,
  };
};

/** Render visuals only — audio is handled in a separate layer */
const renderShot = (shot: ResolvedShot, title: string): React.ReactNode => {
  switch (shot.shotType) {
    case 'avatar':
      return <AvatarClip videoSrc={shot.videoSrc ?? ''} muted />;

    case 'text-card':
      return (
        <TextCard
          type={shot.textCard?.type as TextCardType ?? 'statement'}
          lines={shot.textCard?.lines ?? (shot.script ? shot.script.split('\n') : [])}
        />
      );

    case 'screen-capture':
      return (
        <ScreenCapture
          src={shot.imageSrc ?? shot.videoSrc ?? ''}
          isVideo={shot.isVideo ?? false}
          direction={shot.direction}
        />
      );

    case 'b-roll-placeholder':
      return <BRollPlaceholder direction={shot.direction ?? shot.script ?? ''} />;

    case 'branded-intro':
      return <BrandedIntro title={title} />;

    case 'branded-outro':
      return <BrandedOutro title={title} />;

    default:
      return null;
  }
};

/**
 * Convert a TransitionConfig to a Remotion transition presentation.
 */
function getPresentation(config: TransitionConfig) {
  switch (config.type) {
    case 'slide':
      return slide({ direction: 'from-right' });
    case 'wipe':
      return wipe({ direction: 'from-left' });
    case 'light-leak':
    case 'fade':
    default:
      return fade();
  }
}

interface AudioSpan {
  src: string;
  from: number;
  durationInFrames: number;
}

/**
 * Build continuous audio spans. Avatar audio (from extracted .mp3) extends
 * over subsequent non-audio shots (text cards, screen captures, b-roll) so
 * narration plays over visual cutaways instead of cutting out.
 */
function buildAudioSpans(shots: ResolvedShot[]): AudioSpan[] {
  const spans: AudioSpan[] = [];

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];

    // Avatar shot with extracted audio: extend through following silent shots
    if (shot.shotType === 'avatar' && (shot.audioSrc || shot.videoSrc)) {
      const audioSource = shot.audioSrc ?? shot.videoSrc!;
      let endFrame = shot.startFrame + shot.durationInFrames;

      for (let j = i + 1; j < shots.length; j++) {
        const next = shots[j];
        if (next.shotType === 'avatar' || next.audioSrc) break;
        endFrame = next.startFrame + next.durationInFrames;
      }

      spans.push({
        src: audioSource,
        from: shot.startFrame,
        durationInFrames: endFrame - shot.startFrame,
      });
      continue;
    }

    // ElevenLabs voiceover: plays for its shot duration
    if (shot.audioSrc && shot.shotType !== 'avatar') {
      spans.push({
        src: shot.audioSrc,
        from: shot.startFrame,
        durationInFrames: shot.durationInFrames,
      });
    }
  }

  return spans;
}

/**
 * Build the visual layer elements for TransitionSeries.
 * Interleaves TransitionSeries.Sequence and TransitionSeries.Transition elements.
 */
function buildVisualElements(shots: ResolvedShot[], title: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];

    // Insert transition before this shot (if defined)
    if (shot.transitionIn && shot.transitionIn.type !== 'none') {
      elements.push(
        <TransitionSeries.Transition
          key={`transition-${shot.id}`}
          presentation={getPresentation(shot.transitionIn)}
          timing={linearTiming({ durationInFrames: shot.transitionIn.durationInFrames })}
        />,
      );
    }

    // The shot itself
    elements.push(
      <TransitionSeries.Sequence
        key={`shot-${shot.id}`}
        durationInFrames={shot.durationInFrames}
      >
        {renderShot(shot, title)}
      </TransitionSeries.Sequence>,
    );
  }

  return elements;
}

export const DirectorCut: React.FC<DirectorCutProps> = ({ shots, title }) => {
  const audioSpans = buildAudioSpans(shots);

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.charcoal }}>
      {/* Visual layer with transitions */}
      <TransitionSeries>
        {buildVisualElements(shots, title)}
      </TransitionSeries>

      {/* Audio layer — continuous spans that bridge visual transitions */}
      {audioSpans.map((span, i) => (
        <Sequence
          key={`audio-${i}`}
          from={span.from}
          durationInFrames={span.durationInFrames}
        >
          <Audio src={resolveMediaSrc(span.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
