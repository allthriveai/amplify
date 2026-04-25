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
  layout?: 'vertical' | 'landscape';
  bgMusic?: string;
  scenes: Array<{
    id: string;
    text: string;
    subtext?: string;
    color: string;
    audioFile?: string;
    imageFile?: string;
    videoFile?: string;
    caption?: string;
    diagram?: 'workflow' | 'agentic' | 'agent' | 'multi' | 'all';
    overlayDiagrams?: ['workflow' | 'agentic' | 'agent' | 'multi', 'workflow' | 'agentic' | 'agent' | 'multi'];
    card?: {
      definition?: string;
      control: string;
      cost: number;
      complexity: number;
      benefits: string[];
      limitations: string[];
      example?: string;
    };
    decisions?: Array<{
      question: string;
      answer: string;
      color: string;
      description: string;
    }>;
    durationInFrames: number;
  }>;
};

/* ── Word-by-word captions ── */
function CaptionWords({ frame, fps, text }: { frame: number; fps: number; text: string }) {
  const allText = text.replace(/\n/g, ' ');
  const words = allText.split(' ').filter(Boolean);
  const startFrame = 12; // delay for HeyGen silence at start
  const speechFrames = 120; // ~4 seconds of actual speech
  const framesPerWord = speechFrames / words.length;
  const adjustedFrame = Math.max(0, frame - startFrame);

  return (
    <div style={{
      background: 'rgba(250,250,247,0.85)',
      borderRadius: 12,
      padding: '16px 24px',
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '6px 8px',
      maxWidth: '90%',
    }}>
      {words.map((word, i) => {
        const wordStart = i * framesPerWord;
        const isVisible = adjustedFrame >= wordStart;
        const isCurrent = adjustedFrame >= wordStart && adjustedFrame < wordStart + framesPerWord;
        return (
          <span key={i} style={{
            fontFamily,
            fontSize: 36,
            fontWeight: isCurrent ? 800 : 600,
            color: isVisible ? (isCurrent ? NAVY : '#4a4a4a') : 'transparent',
            lineHeight: 1.4,
            transition: 'color 0.1s',
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
}

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
  caption,
  diagram,
  decisions,
  overlayDiagrams,
  card,
  layout = 'vertical',
}: {
  text: string;
  subtext?: string;
  color: string;
  imageFile?: string;
  videoFile?: string;
  audioFile?: string;
  caption?: string;
  diagram?: string;
  overlayDiagrams?: [string, string];
  card?: { definition?: string; control: string; cost: number; complexity: number; benefits: string[]; limitations: string[]; example?: string };
  decisions?: Array<{ question: string; answer: string; color: string; description: string }>;
  layout?: 'vertical' | 'landscape';
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isStatic = !audioFile && !videoFile && !caption;

  const textProgress = isStatic ? 1 : spring({ frame, fps, config: { damping: 200 } });
  const textY = isStatic ? 0 : interpolate(textProgress, [0, 1], [40, 0]);
  const textOpacity = isStatic ? 1 : interpolate(textProgress, [0, 1], [0, 1]);

  const subtextDelay = Math.max(0, frame - 8);
  const subtextProgress = isStatic ? 1 : spring({ frame: subtextDelay, fps, config: { damping: 200 } });
  const subtextY = isStatic ? 0 : interpolate(subtextProgress, [0, 1], [30, 0]);
  const subtextOpacity = isStatic ? 1 : interpolate(subtextProgress, [0, 1], [0, 1]);

  const imageDelay = Math.max(0, frame - 4);
  const imageProgress = isStatic ? 1 : spring({ frame: imageDelay, fps, config: { damping: 200 } });
  const imageScale = isStatic ? 1 : interpolate(imageProgress, [0, 1], [0.95, 1]);
  const imageOpacity = isStatic ? 1 : interpolate(imageProgress, [0, 1], [0, 1]);

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

      {/* Caption scene — landscape: presenter layout */}
      {caption && videoFile && layout === 'landscape' && (
        <>
          {/* Left: your face, full height */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '35%',
            bottom: 70,
            opacity: imageOpacity,
            overflow: 'hidden',
            zIndex: 3,
          }}>
            <Video
              src={staticFile(videoFile)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Right: title + diagram + captions */}
          <div style={{
            position: 'absolute',
            top: 50,
            left: '38%',
            right: 60,
            bottom: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 24,
            zIndex: 2,
          }}>
            <div style={{
              fontFamily,
              fontSize: 52,
              fontWeight: 700,
              color,
              lineHeight: 1.2,
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
            }}>
              {text}
            </div>
            {diagram && DIAGRAM_MAP[diagram] && (
              <div style={{
                opacity: interpolate(
                  spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 200 } }),
                  [0, 1], [0, 0.85],
                ),
                transform: `translateY(${interpolate(
                  spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 200 } }),
                  [0, 1], [20, 0],
                )}px)`,
              }}>
                {React.createElement(DIAGRAM_MAP[diagram])}
              </div>
            )}
            <CaptionWords frame={frame} fps={fps} text={caption} />
          </div>
        </>
      )}

      {/* Caption scene — vertical: stacked */}
      {caption && videoFile && layout !== 'landscape' && (
        <>
          <div style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily,
            fontSize: 84,
            fontWeight: 700,
            color,
            lineHeight: 1.2,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            zIndex: 2,
          }}>
            {text}
          </div>
          {diagram && DIAGRAM_MAP[diagram] && (
            <div style={{
              position: 'absolute',
              top: 160,
              left: 40,
              right: 40,
              zIndex: 2,
              opacity: interpolate(
                spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 200 } }),
                [0, 1], [0, 0.85],
              ),
              transform: `translateY(${interpolate(
                spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 200 } }),
                [0, 1], [20, 0],
              )}px)`,
            }}>
              {React.createElement(DIAGRAM_MAP[diagram])}
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: diagram ? 300 : 180,
            left: 40,
            right: 40,
            bottom: 80,
            borderRadius: 16,
            transform: `scale(${imageScale})`,
            opacity: imageOpacity,
            transformOrigin: 'center center',
            overflow: 'hidden',
            zIndex: 1,
          }}>
            <Video
              src={staticFile(videoFile)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{
            position: 'absolute',
            bottom: 100,
            left: 60,
            right: 60,
            textAlign: 'center',
            zIndex: 4,
          }}>
            <CaptionWords frame={frame} fps={fps} text={caption} />
          </div>
        </>
      )}

      {/* Decision framework scene — avatar fills background, cards overlay */}
      {decisions && decisions.length > 0 && videoFile && (
        <>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Video
              src={staticFile(videoFile)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 100%)',
            zIndex: 1,
          }} />
          {/* Title */}
          <div style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}>
            <div style={{ fontFamily, fontSize: 72, fontWeight: 700, color: NAVY, textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}>
              {text}
            </div>
            {subtext && (
              <div style={{ fontFamily, fontSize: 28, fontWeight: 400, color: NAVY, marginTop: 8 }}>
                {subtext}
              </div>
            )}
          </div>
        </>
      )}

      {/* Content — normal scenes (no caption) */}
      {!caption && !decisions && <div
        style={{
          display: 'flex',
          flexDirection: layout === 'landscape' && card ? 'row' : 'column',
          justifyContent: videoFile ? 'flex-start' : 'center',
          alignItems: 'center',
          height: '100%',
          padding: videoFile ? '30px 40px 80px' : (layout === 'landscape' ? '40px 60px' : (isStatic ? '50px 40px 90px' : '50px 40px')),
          gap: layout === 'landscape' ? 50 : (isStatic ? 30 : 16),
        }}
      >
        {/* Left side in landscape (title + diagram), or full width in vertical */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: caption ? 'flex-start' : 'center',
          alignItems: 'center',
          gap: caption ? 16 : (layout === 'landscape' ? 24 : (isStatic ? 40 : 30)),
          flex: layout === 'landscape' && card ? 1 : undefined,
          width: '100%',
          height: layout === 'landscape' && !card ? '100%' : undefined,
        }}>
          {/* Title */}
          {text && (
            <div
              style={{
                fontFamily,
                fontSize: layout === 'landscape' ? 72 : 84,
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
          )}

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
                margin: isStatic ? '20px 0' : 0,
              }}
            >
              {React.createElement(DIAGRAM_MAP[diagram])}
            </div>
          )}

          {/* All four diagrams — staggered fade in */}
          {diagram === 'all' && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: layout === 'landscape' ? 'row' : 'column',
                flexWrap: layout === 'landscape' ? 'wrap' : undefined,
                gap: 10,
              }}
            >
              {[
                { Comp: WorkflowSVG, delay: 8 },
                { Comp: AgenticSVG, delay: 30 },
                { Comp: AgentSVG, delay: 52 },
                { Comp: MultiAgentSVG, delay: 74 },
              ].map(({ Comp, delay }, i) => {
                const p = isStatic ? 1 : spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 200 } });
                return (
                  <div key={i} style={{
                    flex: layout === 'landscape' ? '1 1 45%' : undefined,
                    opacity: isStatic ? 1 : interpolate(p, [0, 1], [0, 1]),
                    transform: isStatic ? 'none' : `translateY(${interpolate(p, [0, 1], [15, 0])}px)`,
                  }}>
                    <Comp />
                  </div>
                );
              })}
            </div>
          )}

          {/* Avatar video — landscape with overlays: side by side */}
          {videoFile && layout === 'landscape' && overlayDiagrams && (
            <div style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              gap: 40,
              opacity: imageOpacity,
              transform: `scale(${imageScale})`,
              transformOrigin: 'center center',
              minHeight: 0,
            }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
                {DIAGRAM_MAP[overlayDiagrams[0]] && React.createElement(DIAGRAM_MAP[overlayDiagrams[0]])}
                {DIAGRAM_MAP[overlayDiagrams[1]] && React.createElement(DIAGRAM_MAP[overlayDiagrams[1]])}
              </div>
              <div style={{ flex: 1, overflow: 'hidden', borderRadius: 16 }}>
                <Video
                  src={staticFile(videoFile)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          {/* Avatar video with word-by-word captions */}
          {videoFile && caption && !(layout === 'landscape' && overlayDiagrams) && (
            <div
              style={{
                width: '100%',
                flex: 1,
                position: 'relative',
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
              <div style={{
                position: 'absolute',
                bottom: 30,
                left: 20,
                right: 20,
                textAlign: 'center',
                zIndex: 2,
              }}>
                <CaptionWords frame={frame} fps={fps} text={caption} />
              </div>
            </div>
          )}

          {/* Avatar video — plain (no caption, like closing) */}
          {videoFile && !caption && !(layout === 'landscape' && overlayDiagrams) && (
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

          {subtext && !card && !caption && (
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
        </div>

        {/* Card */}
        {card && (
          <div
            style={{
              width: layout === 'landscape' ? '100%' : '85%',
              flex: layout === 'landscape' ? 1 : undefined,
              background: '#ffffff',
              border: `1px solid #e2e0db`,
              borderRadius: 16,
              overflow: 'hidden',
              opacity: subtextOpacity,
              transform: `translateY(${subtextY}px)`,
            }}
          >
            <div style={{ height: 4, background: color }} />
            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily, fontSize: 26, color: INK_MUTED, fontWeight: 500 }}>Control</span>
                <span style={{ fontFamily, fontSize: 26, color, fontWeight: 700 }}>{card.control}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily, fontSize: 26, color: INK_MUTED, fontWeight: 500 }}>Cost</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4].map((i) => (
                    <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i <= card.cost ? color : '#e2e0db', display: 'inline-block' }} />
                  ))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <span style={{ fontFamily, fontSize: 26, color: INK_MUTED, fontWeight: 500 }}>Complexity</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4].map((i) => (
                    <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i <= card.complexity ? color : '#e2e0db', display: 'inline-block' }} />
                  ))}
                </span>
              </div>
              {card.definition && (
                <>
                  <div style={{ height: 1, background: '#e2e0db', marginTop: 14, marginBottom: 14 }} />
                  <div style={{ fontFamily, fontSize: 20, color: INK_MUTED, fontWeight: 600, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' as const }}>Definition</div>
                  <div style={{ fontFamily, fontSize: 26, color: '#1a1915', lineHeight: 1.5, marginBottom: 14 }}>
                    {card.definition}
                  </div>
                </>
              )}
              <div style={{ height: 1, background: '#e2e0db', marginBottom: 18 }} />
              <div style={{ fontFamily, fontSize: 20, color: INK_MUTED, fontWeight: 600, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' as const }}>Benefits</div>
              {card.benefits.map((b) => (
                <div key={b} style={{ fontFamily, fontSize: 26, color: '#1a1915', lineHeight: 1.8, paddingLeft: 4 }}>
                  <span style={{ color, marginRight: 10 }}>✓</span>{b}
                </div>
              ))}
              <div style={{ fontFamily, fontSize: 20, color: INK_MUTED, fontWeight: 600, letterSpacing: 2, marginTop: 18, marginBottom: 12, textTransform: 'uppercase' as const }}>Limitations</div>
              {card.limitations.map((l) => (
                <div key={l} style={{ fontFamily, fontSize: 26, color: '#1a1915', lineHeight: 1.8, paddingLeft: 4 }}>
                  <span style={{ color: INK_MUTED, marginRight: 10 }}>–</span>{l}
                </div>
              ))}
              {card.example && (
                <>
                  <div style={{ height: 1, background: '#e2e0db', marginTop: 18, marginBottom: 14 }} />
                  <div style={{ fontFamily, fontSize: 20, color: INK_MUTED, fontWeight: 600, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Example</div>
                  <div style={{ fontFamily, fontSize: 26, color: '#1a1915', lineHeight: 1.6 }}>{card.example}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>}

      {/* Diagram overlays on video scene (vertical only) */}
      {overlayDiagrams && layout !== 'landscape' && (
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

      {/* Decision framework cards — 2 top, avatar middle, 2 bottom */}
      {decisions && decisions.length >= 4 && (() => {
        const topCards = decisions.slice(0, 2);
        const bottomCards = decisions.slice(2, 4);

        const renderCard = (d: typeof decisions[0], i: number) => {
          // Timed from silence detection in decide.mp3
          const cardDelays = [195, 324, 504, 639];
          const cardDelay = cardDelays[i] ?? 30;
          const localFrame = Math.max(0, frame - cardDelay);
          const slideIn = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 120 } });
          const cardOpacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
          const yOffset = interpolate(slideIn, [0, 1], [40, 0]);

          if (frame < cardDelay) return null;

          return (
            <div
              key={d.answer}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${yOffset}px)`,
                background: 'rgba(250,250,247,0.95)',
                borderRadius: 14,
                borderLeft: `5px solid ${d.color}`,
                padding: '18px 24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontFamily, fontSize: 24, fontWeight: 700, color: '#1a1915', lineHeight: 1.3 }}>
                  {d.question}
                </div>
                <div style={{ fontFamily, fontSize: 16, fontWeight: 700, color: d.color, textTransform: 'uppercase' as const, letterSpacing: 1, flexShrink: 0, marginLeft: 16 }}>
                  → {d.answer}
                </div>
              </div>
              <div style={{ fontFamily, fontSize: 16, fontWeight: 400, color: INK_MUTED, lineHeight: 1.4 }}>
                {d.description}
              </div>
            </div>
          );
        };

        return (
          <>
            {/* Top 2 cards */}
            <div style={{
              position: 'absolute',
              top: 200,
              left: 40,
              right: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              zIndex: 10,
            }}>
              {topCards.map((d, i) => renderCard(d, i))}
            </div>

            {/* Bottom 2 cards */}
            <div style={{
              position: 'absolute',
              bottom: 130,
              left: 40,
              right: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              zIndex: 10,
            }}>
              {bottomCards.map((d, i) => renderCard(d, i + 2))}
            </div>
          </>
        );
      })()}

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
          opacity: decisions ? 0.8 : 0.4,
          zIndex: 11,
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
          color: decisions ? '#ffffff' : INK_MUTED,
          fontWeight: 500,
          textShadow: decisions ? '0 1px 4px rgba(0,0,0,0.6)' : 'none',
          zIndex: 11,
        }}
      >
        <span>Follow for more on LinkedIn</span>
        <span style={{ fontWeight: 700, color: decisions ? '#ffffff' : NAVY }}>@yourhandle</span>
        <span>·</span>
        <span style={{ fontWeight: 700, color: decisions ? '#ffffff' : NAVY }}>example.com</span>
      </div>
    </AbsoluteFill>
  );
}

/* ── Main composition ── */
export const LinkedInVertical: React.FC<LinkedInVerticalProps> = ({ scenes, layout = 'vertical', bgMusic }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {bgMusic && <Audio src={staticFile(bgMusic)} volume={0.06} loop />}
      <Series {...{}}>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <Scene
              text={scene.text}
              subtext={scene.subtext}
              color={scene.color}
              imageFile={scene.imageFile}
              videoFile={scene.videoFile}
              caption={scene.caption}
              audioFile={scene.audioFile}
              diagram={scene.diagram}
              overlayDiagrams={scene.overlayDiagrams}
              card={scene.card}
              decisions={scene.decisions}
              layout={layout}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
