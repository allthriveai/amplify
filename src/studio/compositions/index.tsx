import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BrandedVideo, BrandedVideoProps } from './BrandedVideo';
import { BrandedIntro } from './BrandedIntro';
import { BrandedOutro } from './BrandedOutro';
import { DirectorCut, DirectorCutProps, calculateDirectorCutMetadata } from './DirectorCut';
import { TextCard, TextCardProps } from './TextCard';
import { BRollPlaceholder, BRollPlaceholderProps } from './BRollPlaceholder';
import { ScreenCapture, ScreenCaptureProps } from './ScreenCapture';
import { LinkedInVertical, LinkedInVerticalProps } from './LinkedInVertical';
import { brand } from './brand';

const NAVY = '#2d4059';
const SAGE = '#7a9a6d';
const TEAL = '#5b9ea6';
const CORAL = '#e07a5f';

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

      {/* Screen capture preview */}
      <Composition<ScreenCaptureProps>
        id="ScreenCapture"
        component={ScreenCapture}
        durationInFrames={150}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          src: '',
          isVideo: false,
          direction: 'Screen recording placeholder',
        }}
      />

      {/* LinkedIn vertical video */}
      <Composition<LinkedInVerticalProps>
        id="LinkedInVertical"
        component={LinkedInVertical}
        durationInFrames={1629}
        fps={fps}
        width={1080}
        height={1350}
        defaultProps={{
          scenes: [
            { id: 'hook', text: 'From fully controlled\nto fully autonomous.', subtext: 'How to pick the right pattern for your agent.', color: NAVY, audioFile: 'linkedin/audio/hook.mp3', diagram: 'all' as const, durationInFrames: 172 },
            { id: 'workflow', text: 'Workflow', color: NAVY, audioFile: 'linkedin/audio/workflow.mp3', diagram: 'workflow' as const, card: { control: 'You', cost: 1, complexity: 1, benefits: ['Same cost every time you run it', 'You can trace exactly what happened', 'Full control over every step'], limitations: ['Struggles with ambiguous tasks', 'You have to map every path upfront'] }, durationInFrames: 330 },
            { id: 'agentic', text: 'Agentic Workflow', color: SAGE, audioFile: 'linkedin/audio/agentic.mp3', diagram: 'agentic' as const, card: { control: 'Shared', cost: 2, complexity: 2, benefits: ['AI makes decisions inside guardrails', 'Can retry and self-correct', 'Structure with room to adapt'], limitations: ['Loops need careful bounds', 'Harder to reason about'] }, durationInFrames: 306 },
            { id: 'agent', text: 'Agent', color: TEAL, audioFile: 'linkedin/audio/agent.mp3', diagram: 'agent' as const, card: { control: 'Model', cost: 3, complexity: 3, benefits: ['Figures out the path on its own', 'Adapts when things change', 'Quick to build a first version'], limitations: ['More steps means more room for error', 'Token costs are hard to predict'] }, durationInFrames: 331 },
            { id: 'multi', text: 'Multi-Agent', color: CORAL, audioFile: 'linkedin/audio/multi.mp3', diagram: 'multi' as const, card: { control: 'Models', cost: 4, complexity: 4, benefits: ['Conflicting roles get their own agent', 'Parallel deep work across domains', 'Scales like a team'], limitations: ['Every handoff loses context', 'Hardest to debug when something breaks'] }, durationInFrames: 301 },
            { id: 'closing', text: 'Start simple.', subtext: 'Full breakdown on example.com', color: NAVY, videoFile: 'linkedin/closing-avatar.mp4', overlayDiagrams: ['agentic', 'agent'] as const, durationInFrames: 189 },
          ],
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
