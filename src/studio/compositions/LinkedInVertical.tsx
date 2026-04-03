import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Series,
  staticFile,
  Img,
} from 'remotion';
import { Audio, Video } from '@remotion/media';
import { fontFamily } from './fonts';
import { WorkflowSVG, AgenticSVG, AgentSVG, MultiAgentSVG } from './PatternSVGs';

/* ── Brand colors ── */
const NAVY = '#2d4059';
const SAGE = '#7a9a6d';
const TEAL = '#5b9ea6';
const CORAL = '#e07a5f';
const BG = '#fafaf7';
const INK_MUTED = '#8a867a';

/* ── Types ── */
export type LinkedInVerticalProps = {
  scenes: Array<{
    id: string;
    text: string;
    subtext?: string;
    color: string;
    audioFile?: string;
    imageFile?: string;
    videoFile?: string;
    diagram?: 'workflow' | 'agentic' | 'agent' | 'multi' | 'all';
    overlayDiagrams?: ['workflow' | 'agentic' | 'agent' | 'multi', 'workflow' | 'agentic' | 'agent' | 'multi'];
    card?: {
      control: string;
      cost: number;
      complexity: number;
      benefits: string[];
      limitations: string[];
    };
    durationInFrames: number;
  }>;
};

/* ── Scene component ── */
const DIAGRAM_MAP: Record<string, React.FC> = {
  workflow: WorkflowSVG,
  agentic: AgenticSVG,
  agent: AgentSVG,
  multi: MultiAgentSVG,
};

function Scene({
  text,
  subtext,
  color,
  imageFile,
  videoFile,
  audioFile,
  diagram,
  overlayDiagrams,
  card,
}: {
  text: string;
  subtext?: string;
  color: string;
  imageFile?: string;
  videoFile?: string;
  audioFile?: string;
  diagram?: string;
  overlayDiagrams?: [string, string];
  card?: { control: string; cost: number; complexity: number; benefits: string[]; limitations: string[] };
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({ frame, fps, config: { damping: 200 } });
  const textY = interpolate(textProgress, [0, 1], [40, 0]);
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);

  const subtextDelay = Math.max(0, frame - 8);
  const subtextProgress = spring({ frame: subtextDelay, fps, config: { damping: 200 } });
  const subtextY = interpolate(subtextProgress, [0, 1], [30, 0]);
  const subtextOpacity = interpolate(subtextProgress, [0, 1], [0, 1]);

  const imageDelay = Math.max(0, frame - 4);
  const imageProgress = spring({ frame: imageDelay, fps, config: { damping: 200 } });
  const imageScale = interpolate(imageProgress, [0, 1], [0.95, 1]);
  const imageOpacity = interpolate(imageProgress, [0, 1], [0, 1]);

  const barWidth = interpolate(
    spring({ frame, fps, config: { damping: 100, stiffness: 80 } }),
    [0, 1],
    [0, 200],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Audio */}
      {audioFile && <Audio src={staticFile(audioFile)} />}

      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: barWidth,
          height: 4,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '60px 40px',
          gap: 30,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 84,
            fontWeight: 700,
            color,
            textAlign: 'center',
            lineHeight: 1.2,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            whiteSpace: 'pre-line',
          }}
        >
          {text}
        </div>

        {/* Single diagram */}
        {diagram && diagram !== 'all' && DIAGRAM_MAP[diagram] && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              opacity: imageOpacity,
              transform: `scale(${imageScale})`,
              transformOrigin: 'center center',
            }}
          >
            {React.createElement(DIAGRAM_MAP[diagram])}
          </div>
        )}

        {/* All four diagrams stacked */}
        {diagram === 'all' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: imageOpacity,
              transform: `scale(${imageScale})`,
              transformOrigin: 'center center',
            }}
          >
            <WorkflowSVG />
            <AgenticSVG />
            <AgentSVG />
            <MultiAgentSVG />
          </div>
        )}

        {/* Avatar video */}
        {videoFile && (
          <div
            style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: imageOpacity,
              transform: `scale(${imageScale})`,
              transformOrigin: 'center center',
              overflow: 'hidden',
              borderRadius: 16,
            }}
          >
            <Video
              src={staticFile(videoFile)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {subtext && !card && (
          <div
            style={{
              fontFamily,
              fontSize: 34,
              fontWeight: 400,
              color: INK_MUTED,
              textAlign: 'center',
              lineHeight: 1.5,
              opacity: subtextOpacity,
              transform: `translateY(${subtextY}px)`,
              maxWidth: 900,
            }}
          >
            {subtext}
          </div>
        )}

        {/* Card */}
        {card && (
          <div
            style={{
              width: '85%',
              background: '#ffffff',
              border: `1px solid #e2e0db`,
              borderRadius: 16,
              overflow: 'hidden',
              opacity: subtextOpacity,
              transform: `translateY(${subtextY}px)`,
            }}
          >
            <div style={{ height: 4, background: color }} />
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily, fontSize: 22, color: INK_MUTED, fontWeight: 500 }}>Control</span>
                <span style={{ fontFamily, fontSize: 22, color, fontWeight: 700 }}>{card.control}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily, fontSize: 22, color: INK_MUTED, fontWeight: 500 }}>Cost</span>
                <span style={{ display: 'flex', gap: 5 }}>
                  {[1,2,3,4].map((i) => (
                    <span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: i <= card.cost ? color : '#e2e0db', display: 'inline-block' }} />
                  ))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily, fontSize: 22, color: INK_MUTED, fontWeight: 500 }}>Complexity</span>
                <span style={{ display: 'flex', gap: 5 }}>
                  {[1,2,3,4].map((i) => (
                    <span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: i <= card.complexity ? color : '#e2e0db', display: 'inline-block' }} />
                  ))}
                </span>
              </div>
              <div style={{ height: 1, background: '#e2e0db', marginBottom: 16 }} />
              <div style={{ fontFamily, fontSize: 18, color: INK_MUTED, fontWeight: 600, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Benefits</div>
              {card.benefits.map((b) => (
                <div key={b} style={{ fontFamily, fontSize: 24, color: '#1a1915', lineHeight: 1.8, paddingLeft: 4 }}>
                  <span style={{ color, marginRight: 8 }}>✓</span>{b}
                </div>
              ))}
              <div style={{ fontFamily, fontSize: 18, color: INK_MUTED, fontWeight: 600, letterSpacing: 2, marginTop: 16, marginBottom: 10, textTransform: 'uppercase' as const }}>Limitations</div>
              {card.limitations.map((l) => (
                <div key={l} style={{ fontFamily, fontSize: 24, color: '#1a1915', lineHeight: 1.8, paddingLeft: 4 }}>
                  <span style={{ color: INK_MUTED, marginRight: 8 }}>–</span>{l}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Diagram overlays on video scene */}
      {overlayDiagrams && (
        <>
          <div style={{
            position: 'absolute',
            top: 220,
            left: 30,
            right: 30,
            zIndex: 10,
            opacity: interpolate(
              spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 200 } }),
              [0, 1], [0, 0.9],
            ),
            transform: `translateY(${interpolate(
              spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 200 } }),
              [0, 1], [-20, 0],
            )}px)`,
          }}>
            {DIAGRAM_MAP[overlayDiagrams[0]] && React.createElement(DIAGRAM_MAP[overlayDiagrams[0]])}
          </div>
          <div style={{
            position: 'absolute',
            bottom: 100,
            left: 30,
            right: 30,
            zIndex: 10,
            opacity: interpolate(
              spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 200 } }),
              [0, 1], [0, 0.9],
            ),
            transform: `translateY(${interpolate(
              spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 200 } }),
              [0, 1], [20, 0],
            )}px)`,
          }}>
            {DIAGRAM_MAP[overlayDiagrams[1]] && React.createElement(DIAGRAM_MAP[overlayDiagrams[1]])}
          </div>
        </>
      )}

      {/* Bottom spectrum bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 60,
          right: 60,
          display: 'flex',
          height: 4,
          borderRadius: 2,
          overflow: 'hidden',
          opacity: 0.4,
        }}
      >
        <div style={{ flex: 1, background: NAVY }} />
        <div style={{ flex: 1, background: SAGE }} />
        <div style={{ flex: 1, background: TEAL }} />
        <div style={{ flex: 1, background: CORAL }} />
      </div>

      {/* Footer: follow + site */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          fontFamily,
          fontSize: 22,
          color: INK_MUTED,
          fontWeight: 500,
        }}
      >
        <span>Follow for more</span>
        <span style={{ fontWeight: 700, color: NAVY }}>@yourhandle</span>
        <span>·</span>
        <span style={{ fontWeight: 700, color: NAVY }}>example.com</span>
      </div>
    </AbsoluteFill>
  );
}

/* ── Main composition ── */
export const LinkedInVertical: React.FC<LinkedInVerticalProps> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <Scene
              text={scene.text}
              subtext={scene.subtext}
              color={scene.color}
              imageFile={scene.imageFile}
              videoFile={scene.videoFile}
              audioFile={scene.audioFile}
              diagram={scene.diagram}
              overlayDiagrams={scene.overlayDiagrams}
              card={scene.card}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
