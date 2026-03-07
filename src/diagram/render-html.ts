import type { DiagramNode, DiagramEdge, DiagramType } from "../types/diagram.js";

export interface RenderDiagramOptions {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  diagramType: DiagramType;
  brand?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    fontFamily?: string;
  };
  /** When true, all nodes/edges start hidden with opacity:0 and can be revealed via .revealed class */
  animated?: boolean;
}

/** Generate a self-contained HTML file with an interactive React Flow diagram */
export function renderDiagramHtml(options: RenderDiagramOptions): string {
  const { title, nodes, edges, diagramType, brand, animated } = options;

  const primary = brand?.primary ?? "#35656e";
  const secondary = brand?.secondary ?? "#394646";
  const accent = brand?.accent ?? "#fee19a";
  const background = brand?.background ?? "#f8f9fa";
  const fontFamily = brand?.fontFamily ?? "Inter, system-ui, sans-serif";

  // Map diagram nodes to React Flow nodes (positions set by dagre)
  const rfNodes = nodes.map((n) => ({
    id: n.id,
    type: n.type === "group" ? "group" : "default",
    data: { label: n.label, description: n.description },
    position: { x: 0, y: 0 },
    parentId: n.group ?? undefined,
    style: {
      background: n.style?.background ?? (n.type === "input" ? accent : n.type === "output" ? primary : "#ffffff"),
      border: n.style?.border ?? `2px solid ${primary}`,
      color: n.style?.color ?? (n.type === "output" ? "#ffffff" : secondary),
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      fontFamily,
      minWidth: "150px",
      textAlign: "center",
    },
  }));

  const rfEdges = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? undefined,
    animated: e.animated ?? false,
    style: { stroke: e.style?.stroke ?? primary, strokeWidth: 2 },
    labelStyle: { fontSize: "12px", fontFamily, fill: secondary },
  }));

  // Dagre layout direction based on diagram type
  const layoutDirection = diagramType === "timeline" || diagramType === "comparison" ? "LR" : "TB";

  const nodesJson = JSON.stringify(rfNodes);
  const edgesJson = JSON.stringify(rfEdges);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${fontFamily}; background: ${background}; }
    #title-bar {
      background: ${primary};
      color: #ffffff;
      padding: 12px 24px;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    #diagram-container { width: 100vw; height: calc(100vh - 48px); }
    .react-flow__node {
      font-family: ${fontFamily};
    }
    .react-flow__attribution { display: none; }${animated ? `
    /* Animation mode: everything starts hidden */
    .react-flow__node { opacity: 0; transition: opacity 0.3s ease; }
    .react-flow__edge { opacity: 0; transition: opacity 0.3s ease; }
    #title-bar { opacity: 0; transition: opacity 0.3s ease; }
    .revealed { opacity: 1 !important; }` : ""}
  </style>
</head>
<body>
  <div id="title-bar" data-element="title">${escapeHtml(title)}</div>
  <div id="diagram-container"></div>

  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1",
      "react-dom": "https://esm.sh/react-dom@18.3.1",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
      "@xyflow/react": "https://esm.sh/@xyflow/react@12.6.0?external=react,react-dom",
      "@dagrejs/dagre": "https://esm.sh/@dagrejs/dagre@1.1.4"
    }
  }
  </script>
  <link rel="stylesheet" href="https://esm.sh/@xyflow/react@12.6.0/dist/style.css" />

  <script type="module">
    import React from "react";
    import { createRoot } from "react-dom/client";
    import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from "@xyflow/react";
    import dagre from "@dagrejs/dagre";

    const initialNodes = ${nodesJson};
    const initialEdges = ${edgesJson};

    const nodeWidth = 180;
    const nodeHeight = 60;

    function layoutNodes(nodes, edges, direction) {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

      nodes.forEach((node) => {
        g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      dagre.layout(g);

      return nodes.map((node) => {
        const pos = g.node(node.id);
        return {
          ...node,
          position: {
            x: pos.x - nodeWidth / 2,
            y: pos.y - nodeHeight / 2,
          },
        };
      });
    }

    function App() {
      const laid = layoutNodes(initialNodes, initialEdges, "${layoutDirection}");
      const [nodes, setNodes, onNodesChange] = useNodesState(laid);
      const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

      return React.createElement(ReactFlow, {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        fitView: true,
        fitViewOptions: { padding: 0.2 },
        minZoom: 0.3,
        maxZoom: 2,
      },
        React.createElement(Controls, null),
        React.createElement(MiniMap, {
          nodeStrokeColor: "${primary}",
          nodeColor: "#ffffff",
          maskColor: "rgba(0,0,0,0.1)",
        }),
        React.createElement(Background, { variant: "dots", gap: 16, size: 1, color: "#ddd" }),
      );
    }

    const root = createRoot(document.getElementById("diagram-container"));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
