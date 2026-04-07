import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  staticFile,
  Video,
} from 'remotion';
import { Audio } from '@remotion/media';
import { fontFamily } from './fonts';

const NAVY = '#2d4059';
const SAGE = '#7a9a6d';
const TEAL = '#5b9ea6';
const CORAL = '#e07a5f';
const BG = '#fafaf7';
const INK = '#1a1915';
const INK_MUTED = '#8a867a';
const MARBLE = '#e2e0db';

const decisions = [
  {
    question: 'Can I map the steps?',
    answer: 'Workflow',
    color: NAVY,
    description: 'Write the control flow yourself.',
  },
  {
    question: 'Does the workflow need to branch or adapt?',
    answer: 'Agentic Workflow',
    color: SAGE,
    description: 'You keep the structure. The model adapts within it.',
  },
  {
    question: 'Is the task open-ended for the user?',
    answer: 'Agent',
    color: TEAL,
    description: 'The model picks its own tools and path.',
  },
  {
    question: 'Is one agent\'s context getting in the way?',
    answer: 'Multi-Agent (MAS)',
    color: CORAL,
    description: 'Split them up. Try one agent first.',
  },
];

export type DecisionFrameworkProps = {
  avatarVideo?: string;
  voiceovers?: string[]; // one per card
  introVoiceover?: string;
  layout?: 'landscape' | 'vertical';
};

function DecisionCard({
  question,
  answer,
  color,
  description,
  index,
  startFrame,
}: {
  question: string;
  answer: string;
  color: string;
  description: string;
  index: number;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const slideIn = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Cards stack from bottom, each one above the last
  const yOffset = interpolate(slideIn, [0, 1], [80, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 60 + index * 140,
        opacity,
        transform: `translateY(${yOffset}px)`,
        background: 'rgba(250,250,247,0.95)',
        borderRadius: 16,
        borderLeft: `5px solid ${color}`,
        padding: '24px 32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 700,
            color: INK,
            lineHeight: 1.3,
          }}
        >
          {question}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 16,
            fontWeight: 700,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flexShrink: 0,
            marginLeft: 24,
          }}
        >
          → {answer}
        </div>
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 18,
          fontWeight: 400,
          color: INK_MUTED,
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

export const DecisionFramework: React.FC<DecisionFrameworkProps> = ({
  avatarVideo,
  voiceovers = [],
  introVoiceover,
  layout = 'landscape',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing: intro (2s) + 4 cards (5s each) + hold (2s)
  const introFrames = fps * 2;
  const cardDuration = fps * 5;

  // Title animation
  const titleOpacity = interpolate(frame, [0, fps * 0.5, introFrames - 10, introFrames], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Avatar video background */}
      {avatarVideo ? (
        <Video
          src={staticFile(avatarVideo)}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${NAVY} 0%, #1a2538 100%)`,
          }}
        />
      )}

      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: avatarVideo
            ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)'
            : 'none',
        }}
      />

      {/* Intro title */}
      {frame < introFrames && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 56,
              fontWeight: 800,
              color: '#ffffff',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            How to Decide
          </div>
          <div
            style={{
              fontFamily,
              fontSize: 24,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 12,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            The questions I ask every time
          </div>
        </div>
      )}

      {/* Voiceover audio */}
      {introVoiceover && (
        <Sequence from={0}>
          <Audio src={staticFile(introVoiceover)} />
        </Sequence>
      )}

      {/* Decision cards — appear one at a time */}
      {decisions.map((d, i) => {
        const cardStart = introFrames + i * cardDuration;
        return (
          <React.Fragment key={d.answer}>
            <DecisionCard
              question={d.question}
              answer={d.answer}
              color={d.color}
              description={d.description}
              index={3 - i}
              startFrame={cardStart}
            />
            {voiceovers[i] && (
              <Sequence from={cardStart}>
                <Audio src={staticFile(voiceovers[i])} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
