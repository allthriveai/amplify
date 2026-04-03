import React from 'react';

const NAVY = '#2d4059';
const SAGE = '#7a9a6d';
const TEAL = '#5b9ea6';
const CORAL = '#e07a5f';
const MARBLE = '#e2e0db';
const mono = "'Inter', sans-serif";

const flowStyle = `
@keyframes flowDash {
  to { stroke-dashoffset: -20; }
}
.flow-line {
  stroke-dasharray: 8 12;
  animation: flowDash 0.8s linear infinite;
}
`;

function Box({ x, y, w, h, label, fill = '#fff', stroke = MARBLE, textColor = NAVY, fontSize = 14 }: any) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontFamily={mono} fontSize={fontSize} fill={textColor} fontWeight={600}>{label}</text>
    </g>
  );
}

function Markers({ prefix, colors }: { prefix: string; colors: string[] }) {
  return (
    <defs>
      {colors.map((c) => (
        <marker key={c} id={`${prefix}-${c.replace('#', '')}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
        </marker>
      ))}
    </defs>
  );
}

function FlowLine({ x1, y1, x2, y2, stroke, markerEnd }: any) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1.5} markerEnd={markerEnd} className="flow-line" />
  );
}

function FlowPath({ d, stroke, markerEnd, dashed }: any) {
  return (
    <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} markerEnd={markerEnd}
      className="flow-line"
      style={dashed ? { strokeDasharray: '6 4', animation: 'flowDash 1.2s linear infinite' } : undefined}
    />
  );
}

export function WorkflowSVG() {
  const m = `url(#wf-${NAVY.slice(1)})`;
  return (
    <svg viewBox="10 10 590 60" style={{ width: '100%', display: 'block' }}>
      <style>{flowStyle}</style>
      <Markers prefix="wf" colors={[NAVY]} />
      <Box x={20} y={20} w={90} h={36} label="Input" fill={NAVY} stroke={NAVY} textColor="#fff" />
      <FlowLine x1={110} y1={38} x2={140} y2={38} stroke={NAVY} markerEnd={m} />
      <Box x={140} y={20} w={90} h={36} label="Step 1" />
      <FlowLine x1={230} y1={38} x2={260} y2={38} stroke={NAVY} markerEnd={m} />
      <Box x={260} y={20} w={90} h={36} label="Step 2" />
      <FlowLine x1={350} y1={38} x2={380} y2={38} stroke={NAVY} markerEnd={m} />
      <Box x={380} y={20} w={90} h={36} label="Step 3" />
      <FlowLine x1={470} y1={38} x2={500} y2={38} stroke={NAVY} markerEnd={m} />
      <Box x={500} y={20} w={90} h={36} label="Output" fill={NAVY} stroke={NAVY} textColor="#fff" />
    </svg>
  );
}

export function AgenticSVG() {
  const m = `url(#ag-${SAGE.slice(1)})`;
  return (
    <svg viewBox="20 10 590 110" style={{ width: '100%', display: 'block' }}>
      <style>{flowStyle}</style>
      <Markers prefix="ag" colors={[SAGE]} />
      <Box x={30} y={20} w={90} h={36} label="Input" fill={SAGE} stroke={SAGE} textColor="#fff" />
      <FlowLine x1={120} y1={38} x2={150} y2={38} stroke={SAGE} markerEnd={m} />
      <Box x={150} y={20} w={80} h={36} label="Plan" />
      <FlowLine x1={230} y1={38} x2={260} y2={38} stroke={SAGE} markerEnd={m} />
      <Box x={260} y={20} w={100} h={36} label="Execute" />
      <FlowLine x1={360} y1={38} x2={390} y2={38} stroke={SAGE} markerEnd={m} />
      <Box x={390} y={20} w={90} h={36} label="Reflect" />
      <FlowLine x1={480} y1={38} x2={510} y2={38} stroke={SAGE} markerEnd={m} />
      <Box x={510} y={20} w={90} h={36} label="Output" fill={SAGE} stroke={SAGE} textColor="#fff" />
      <FlowPath d="M 435,56 Q 435,90 310,90 Q 190,90 190,60" stroke={SAGE} markerEnd={m} dashed />
      <text x={310} y={106} textAnchor="middle" fontFamily={mono} fontSize={12} fill={SAGE}>retry if needed</text>
    </svg>
  );
}

export function AgentSVG() {
  const m = `url(#at-${TEAL.slice(1)})`;
  return (
    <svg viewBox="20 0 570 145" style={{ width: '100%', display: 'block' }}>
      <style>{flowStyle}</style>
      <Markers prefix="at" colors={[TEAL]} />
      <Box x={30} y={45} w={90} h={36} label="Query" fill={TEAL} stroke={TEAL} textColor="#fff" />
      <FlowLine x1={120} y1={63} x2={160} y2={63} stroke={TEAL} markerEnd={m} />
      <polygon points="210,35 255,63 210,91 165,63" fill="#fff" stroke={TEAL} strokeWidth={1.5} />
      <text x={210} y={68} textAnchor="middle" fontFamily={mono} fontSize={14} fill={TEAL} fontWeight={600}>LLM</text>
      <FlowPath d="M 255,50 Q 280,25 310,25" stroke={TEAL} markerEnd={m} />
      <Box x={310} y={8} w={90} h={32} label="Tool A" />
      <FlowLine x1={255} y1={63} x2={310} y2={63} stroke={TEAL} markerEnd={m} />
      <Box x={310} y={47} w={90} h={32} label="Tool B" />
      <FlowPath d="M 255,76 Q 280,101 310,101" stroke={TEAL} markerEnd={m} />
      <Box x={310} y={86} w={90} h={32} label="Tool C" />
      <FlowLine x1={400} y1={63} x2={470} y2={63} stroke={TEAL} markerEnd={m} />
      <Box x={470} y={45} w={100} h={36} label="Response" fill={TEAL} stroke={TEAL} textColor="#fff" />
      <FlowPath d="M 210,91 Q 210,125 150,125 Q 90,125 90,75 Q 90,63 110,58" stroke={TEAL} markerEnd={m} dashed />
      <text x={135} y={140} fontFamily={mono} fontSize={12} fill={TEAL}>loop</text>
    </svg>
  );
}

export function MultiAgentSVG() {
  const m = `url(#ma-${CORAL.slice(1)})`;
  return (
    <svg viewBox="20 -5 590 115" style={{ width: '100%', display: 'block' }}>
      <style>{flowStyle}</style>
      <Markers prefix="ma" colors={[CORAL]} />
      <Box x={30} y={30} w={90} h={36} label="Task" fill={CORAL} stroke={CORAL} textColor="#fff" />
      <FlowLine x1={120} y1={48} x2={160} y2={48} stroke={CORAL} markerEnd={m} />
      <Box x={160} y={30} w={130} h={36} label="Orchestrator" stroke={CORAL} textColor={CORAL} />
      <FlowPath d="M 290,40 Q 320,15 350,15" stroke={CORAL} markerEnd={m} />
      <Box x={350} y={0} w={100} h={32} label="Agent A" />
      <FlowLine x1={290} y1={48} x2={350} y2={48} stroke={CORAL} markerEnd={m} />
      <Box x={350} y={32} w={100} h={32} label="Agent B" />
      <FlowPath d="M 290,56 Q 320,81 350,81" stroke={CORAL} markerEnd={m} />
      <Box x={350} y={66} w={100} h={32} label="Agent C" />
      <FlowPath d="M 450,16 Q 490,16 510,36" stroke={CORAL} markerEnd={m} />
      <FlowLine x1={450} y1={48} x2={500} y2={48} stroke={CORAL} markerEnd={m} />
      <FlowPath d="M 450,82 Q 490,82 510,60" stroke={CORAL} markerEnd={m} />
      <Box x={500} y={30} w={100} h={36} label="Output" fill={CORAL} stroke={CORAL} textColor="#fff" />
    </svg>
  );
}
