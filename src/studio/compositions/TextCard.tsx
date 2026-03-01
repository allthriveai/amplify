import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { brand } from './brand';

export interface TextCardProps {
  type: 'stat' | 'quote' | 'contrast' | 'list' | 'statement';
  lines: string[];
}

const StatCard: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 80, mass: 0.8 } });
  const subOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bigNumber = lines[0] ?? '';
  const supporting = lines.slice(1).join(' ');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontFamily: brand.fonts.body,
          fontSize: brand.textCard.statFontSize,
          fontWeight: 800,
          color: brand.colors.canary,
          transform: `scale(${scale})`,
          textAlign: 'center',
        }}
      >
        {bigNumber}
      </div>
      {supporting && (
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: brand.textCard.statSubFontSize,
            fontWeight: 400,
            color: brand.colors.white,
            opacity: subOpacity,
            marginTop: 24,
            textAlign: 'center',
            maxWidth: '70%',
          }}
        >
          {supporting}
        </div>
      )}
    </AbsoluteFill>
  );
};

const QuoteCard: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const text = lines.join('\n');

  const opacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const barHeight = interpolate(frame, [0, 20], [0, brand.textCard.accentBarHeight], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.charcoal,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, maxWidth: '75%' }}>
        <div
          style={{
            width: brand.textCard.accentBarWidth,
            height: barHeight,
            backgroundColor: brand.colors.canary,
            borderRadius: 3,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: brand.textCard.quoteFontSize,
            fontWeight: 400,
            fontStyle: 'italic',
            color: brand.colors.white,
            opacity,
            lineHeight: 1.5,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ContrastCard: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftSlide = spring({ frame, fps, config: { damping: 14, stiffness: 100, mass: 0.6 } });
  const rightSlide = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 100, mass: 0.6 } });

  const left = lines[0] ?? '';
  const right = lines[1] ?? '';

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'row' }}>
      <div
        style={{
          flex: 1,
          backgroundColor: brand.colors.teal,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: brand.textCard.padding,
          transform: `translateX(${interpolate(leftSlide, [0, 1], [-100, 0])}%)`,
        }}
      >
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: brand.textCard.contrastFontSize,
            fontWeight: 600,
            color: brand.colors.white,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {left}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: brand.colors.canary,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: brand.textCard.padding,
          transform: `translateX(${interpolate(rightSlide, [0, 1], [100, 0])}%)`,
        }}
      >
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontSize: brand.textCard.contrastFontSize,
            fontWeight: 600,
            color: brand.colors.charcoal,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {right}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ListCard: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.charcoal,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: brand.textCard.padding * 2,
      }}
    >
      {lines.map((line, i) => {
        const itemOpacity = interpolate(frame, [10 + i * 12, 22 + i * 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const itemSlide = interpolate(frame, [10 + i * 12, 22 + i * 12], [20, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={i}
            style={{
              fontFamily: brand.fonts.body,
              fontSize: brand.textCard.listFontSize,
              fontWeight: 400,
              color: brand.colors.white,
              opacity: itemOpacity,
              transform: `translateY(${itemSlide}px)`,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: brand.colors.canary,
                flexShrink: 0,
              }}
            />
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const StatementCard: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 80, mass: 0.8 } });
  const text = lines.join(' ');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.teal,
        justifyContent: 'center',
        alignItems: 'center',
        padding: brand.textCard.padding * 2,
      }}
    >
      <div
        style={{
          fontFamily: brand.fonts.body,
          fontSize: brand.textCard.statementFontSize,
          fontWeight: 700,
          color: brand.colors.white,
          textAlign: 'center',
          lineHeight: 1.3,
          transform: `scale(${scale})`,
          maxWidth: '80%',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const TextCard: React.FC<TextCardProps> = ({ type, lines }) => {
  switch (type) {
    case 'stat':
      return <StatCard lines={lines} />;
    case 'quote':
      return <QuoteCard lines={lines} />;
    case 'contrast':
      return <ContrastCard lines={lines} />;
    case 'list':
      return <ListCard lines={lines} />;
    case 'statement':
      return <StatementCard lines={lines} />;
  }
};
