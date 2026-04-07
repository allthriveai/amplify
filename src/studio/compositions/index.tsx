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
import { DecisionFramework, DecisionFrameworkProps } from './DecisionFramework';
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

      {/* LinkedIn carousel GIFs — one per pattern */}
      {[
        { id: 'CarouselWorkflow', text: 'Workflow', color: NAVY, diagram: 'workflow' as const, card: { definition: 'You define the path. The LLM is one step in it.', control: 'You', cost: 1, complexity: 1, benefits: ['Same cost every time you run it', 'You can trace exactly what happened', 'Full control over every step'], limitations: ['Struggles with ambiguous tasks', 'You have to map every path upfront'] } },
        { id: 'CarouselAgentic', text: 'Agentic Workflow', color: SAGE, diagram: 'agentic' as const, card: { definition: 'You define the structure. The LLM decides when to retry.', control: 'You + LLM', cost: 2, complexity: 2, benefits: ['AI makes decisions inside guardrails', 'Can retry and self-correct', 'Structure with room to adapt'], limitations: ['Loops need careful bounds', 'Harder to reason about'] } },
        { id: 'CarouselAgent', text: 'Agent', color: TEAL, diagram: 'agent' as const, card: { definition: 'You give it tools and a system prompt. The LLM decides which tool to use.', control: 'Model', cost: 3, complexity: 3, benefits: ['Figures out the path on its own', 'Adapts when things change', 'Quick to build a first version'], limitations: ['More steps means more room for error', 'Token costs are hard to predict'] } },
        { id: 'CarouselMulti', text: 'Multi-Agent (MAS)', color: CORAL, diagram: 'multi' as const, card: { definition: 'Multiple agents, each with their own prompt and tools.', control: 'Models', cost: 4, complexity: 4, benefits: ['Conflicting roles get their own agent', 'Parallel deep work across domains', 'Scales like a team'], limitations: ['Token costs multiply fast', 'Hardest to debug when something breaks'] } },
      ].map((p) => (
        <Composition<LinkedInVerticalProps>
          key={p.id}
          id={p.id}
          component={LinkedInVertical}
          durationInFrames={60}
          fps={fps}
          width={1080}
          height={1350}
          defaultProps={{
            scenes: [{ id: p.id, text: p.text, color: p.color, diagram: p.diagram, card: p.card, durationInFrames: 60 }],
          }}
        />
      ))}

      {/* LinkedIn vertical video */}
      <Composition<LinkedInVerticalProps>
        id="LinkedInVertical"
        component={LinkedInVertical}
        durationInFrames={2577}
        fps={fps}
        width={1080}
        height={1350}
        defaultProps={{
          bgMusic: 'linkedin/bg-music.mp3',
          scenes: [
            { id: 'thumb', text: 'Agents vs Workflows', subtext: 'How to pick the right pattern.', color: NAVY, diagram: 'all' as const, durationInFrames: 15 },
            { id: 'intro', text: 'Agents vs Workflows', color: NAVY, videoFile: 'linkedin/intro-hook-avatar.mp4', diagram: 'agent' as const, caption: "Most teams jump straight to agents. Here's what I learned after building them in production.", durationInFrames: 150 },
            { id: 'hook', text: 'How to pick the right\npattern for your agent.', subtext: 'From fully controlled to fully autonomous.', color: NAVY, audioFile: 'linkedin/audio/hook.mp3', diagram: 'all' as const, durationInFrames: 252 },
            { id: 'workflow', text: 'Workflow', subtext: 'You define the path. The LLM is one step in it.', color: NAVY, audioFile: 'linkedin/audio/workflow.mp3', diagram: 'workflow' as const, durationInFrames: 330 },
            { id: 'agentic', text: 'Agentic Workflow', subtext: 'You define the structure. The LLM decides when to retry.', color: SAGE, audioFile: 'linkedin/audio/agentic.mp3', diagram: 'agentic' as const, durationInFrames: 306 },
            { id: 'agent', text: 'Agent', subtext: 'You give it tools and a system prompt. The LLM decides which tool to use.', color: TEAL, audioFile: 'linkedin/audio/agent.mp3', diagram: 'agent' as const, durationInFrames: 331 },
            { id: 'multi', text: 'Multi-Agent (MAS)', subtext: 'Multiple agents, each with their own prompt and tools.', color: CORAL, audioFile: 'linkedin/audio/multi.mp3', diagram: 'multi' as const, durationInFrames: 301 },
            { id: 'decide', text: 'How to Decide', subtext: 'Always start with the simplest pattern that meets your needs.', color: NAVY, videoFile: 'linkedin/decide-avatar.mp4', decisions: [
              { question: 'Can I map the steps?', answer: 'Workflow', color: NAVY, description: '' },
              { question: 'Does the workflow need to branch or adapt?', answer: 'Agentic Workflow', color: SAGE, description: '' },
              { question: 'Is the task open-ended for the user?', answer: 'Agent', color: TEAL, description: '' },
              { question: "Is one agent's context getting in the way?", answer: 'Multi-Agent (MAS)', color: CORAL, description: '' },
            ], durationInFrames: 703 },
            { id: 'closing', text: 'Start simple.', subtext: 'Full breakdown on example.com', color: NAVY, videoFile: 'linkedin/closing-avatar.mp4', overlayDiagrams: ['agentic', 'agent'] as const, durationInFrames: 189 },
          ],
        }}
      />

      {/* YouTube landscape video — same scenes, landscape layout */}
      <Composition<LinkedInVerticalProps>
        id="YouTubeLandscape"
        component={LinkedInVertical}
        durationInFrames={2562}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{
          layout: 'landscape',
          bgMusic: 'linkedin/bg-music.mp3',
          scenes: [
            { id: 'intro', text: 'Agents vs Workflows', color: NAVY, videoFile: 'linkedin/intro-hook-hd.mp4', diagram: 'agent' as const, caption: "Most teams jump straight to agents. Here's what I learned after building them in production.", durationInFrames: 150 },
            { id: 'hook', text: 'How to pick the right\npattern for your agent.', subtext: 'From fully controlled to fully autonomous.', color: NAVY, audioFile: 'linkedin/audio/hook.mp3', diagram: 'all' as const, durationInFrames: 252 },
            { id: 'workflow', text: 'Workflow', subtext: 'You define the path. The LLM is one step in it.', color: NAVY, audioFile: 'linkedin/audio/workflow.mp3', diagram: 'workflow' as const, durationInFrames: 330 },
            { id: 'agentic', text: 'Agentic Workflow', subtext: 'You define the structure. The LLM decides when to retry.', color: SAGE, audioFile: 'linkedin/audio/agentic.mp3', diagram: 'agentic' as const, durationInFrames: 306 },
            { id: 'agent', text: 'Agent', subtext: 'You give it tools and a system prompt. The LLM decides which tool to use.', color: TEAL, audioFile: 'linkedin/audio/agent.mp3', diagram: 'agent' as const, durationInFrames: 331 },
            { id: 'multi', text: 'Multi-Agent (MAS)', subtext: 'Multiple agents, each with their own prompt and tools.', color: CORAL, audioFile: 'linkedin/audio/multi.mp3', diagram: 'multi' as const, durationInFrames: 301 },
            { id: 'decide', text: 'How to Decide', subtext: 'Always start with the simplest pattern that meets your needs.', color: NAVY, videoFile: 'linkedin/decide-avatar.mp4', decisions: [
              { question: 'Can I map the steps?', answer: 'Workflow', color: NAVY, description: '' },
              { question: 'Does the workflow need to branch or adapt?', answer: 'Agentic Workflow', color: SAGE, description: '' },
              { question: 'Is the task open-ended for the user?', answer: 'Agent', color: TEAL, description: '' },
              { question: "Is one agent's context getting in the way?", answer: 'Multi-Agent (MAS)', color: CORAL, description: '' },
            ], durationInFrames: 703 },
            { id: 'closing', text: 'Start simple.', subtext: 'Full breakdown on example.com', color: NAVY, videoFile: 'linkedin/closing-avatar.mp4', overlayDiagrams: ['agentic', 'agent'] as const, durationInFrames: 189 },
          ],
        }}
      />

      {/* Decision Framework — avatar + stacking cards */}
      <Composition<DecisionFrameworkProps>
        id="DecisionFramework"
        component={DecisionFramework}
        durationInFrames={fps * 24}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{}}
      />

      {/* Vertical version for LinkedIn */}
      <Composition<DecisionFrameworkProps>
        id="DecisionFrameworkVertical"
        component={DecisionFramework}
        durationInFrames={fps * 24}
        fps={fps}
        width={1080}
        height={1350}
        defaultProps={{ layout: 'vertical' }}
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
