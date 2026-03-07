// ---------------------------------------------------------------------------
// Diagram types — interactive flow diagrams from stories
// ---------------------------------------------------------------------------

export type DiagramType = "flow" | "concept-map" | "timeline" | "comparison";

export type DiagramNodeType = "default" | "input" | "output" | "group";

export interface DiagramNode {
  id: string;
  label: string;
  type?: DiagramNodeType;
  description?: string;
  group?: string;
  style?: {
    background?: string;
    border?: string;
    color?: string;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
  };
}

export interface DiagramFrontmatter {
  title: string;
  type: "diagram";
  diagramType: DiagramType;
  status: string;
  source: string;
  platform: string;
  nodeCount: number;
  edgeCount: number;
  creativeBrief?: {
    purpose: string;
    audience: string;
  };
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface Diagram {
  filename: string;
  path: string;
  frontmatter: DiagramFrontmatter;
  content: string;
}

export interface RenderDiagramVideoOptions {
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
  /** Output format: mp4 or gif. Default: "mp4" */
  format?: "mp4" | "gif";
  /** Viewport width in pixels. Default: 1080 */
  width?: number;
  /** Viewport height in pixels. Default: 1080 */
  height?: number;
  /** Milliseconds to hold each node state. Default: 600 */
  frameDuration?: number;
  /** Milliseconds for CSS fade transition. Default: 300 */
  transitionDuration?: number;
}
