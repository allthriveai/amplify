import { describe, it, expect } from "vitest";
import { renderDiagramHtml } from "./render-html.js";
import type { DiagramNode, DiagramEdge, DiagramType } from "../types/diagram.js";

function makeOptions(overrides: {
  title?: string;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  diagramType?: DiagramType;
  brand?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    fontFamily?: string;
  };
} = {}) {
  return {
    title: overrides.title ?? "Test Diagram",
    nodes: overrides.nodes ?? [
      { id: "1", label: "Node A" },
      { id: "2", label: "Node B" },
    ],
    edges: overrides.edges ?? [
      { id: "e1", source: "1", target: "2" },
    ],
    diagramType: overrides.diagramType ?? ("flow" as DiagramType),
    ...(overrides.brand !== undefined ? { brand: overrides.brand } : {}),
  };
}

describe("renderDiagramHtml", () => {
  // ---------------------------------------------------------------
  // HTML structure
  // ---------------------------------------------------------------
  describe("HTML structure", () => {
    it("returns string starting with <!DOCTYPE html>", () => {
      const html = renderDiagramHtml(makeOptions());
      expect(html).toMatch(/^<!DOCTYPE html>/);
    });

    it("contains the title in <title> tag", () => {
      const html = renderDiagramHtml(makeOptions({ title: "My Diagram" }));
      expect(html).toContain("<title>My Diagram</title>");
    });

    it("contains the title in title-bar div", () => {
      const html = renderDiagramHtml(makeOptions({ title: "My Diagram" }));
      expect(html).toContain('<div id="title-bar" data-element="title">My Diagram</div>');
    });

    it("contains diagram-container div", () => {
      const html = renderDiagramHtml(makeOptions());
      expect(html).toContain('<div id="diagram-container">');
    });
  });

  // ---------------------------------------------------------------
  // Title escaping
  // ---------------------------------------------------------------
  describe("title escaping", () => {
    it("escapes & to &amp;", () => {
      const html = renderDiagramHtml(makeOptions({ title: "A & B" }));
      expect(html).toContain("<title>A &amp; B</title>");
      expect(html).toContain('id="title-bar" data-element="title">A &amp; B</div>');
    });

    it("escapes < > to &lt; &gt;", () => {
      const html = renderDiagramHtml(makeOptions({ title: "A <b> C" }));
      expect(html).toContain("<title>A &lt;b&gt; C</title>");
      expect(html).toContain('id="title-bar" data-element="title">A &lt;b&gt; C</div>');
    });

    it('escapes " to &quot;', () => {
      const html = renderDiagramHtml(makeOptions({ title: 'Say "hello"' }));
      expect(html).toContain("<title>Say &quot;hello&quot;</title>");
      expect(html).toContain('id="title-bar" data-element="title">Say &quot;hello&quot;</div>');
    });
  });

  // ---------------------------------------------------------------
  // Brand colors
  // ---------------------------------------------------------------
  describe("brand colors", () => {
    it("uses default colors when no brand provided", () => {
      const html = renderDiagramHtml(makeOptions());
      expect(html).toContain("#35656e"); // primary
      expect(html).toContain("#394646"); // secondary
      expect(html).toContain("#f8f9fa"); // background
      expect(html).toContain("Inter, system-ui, sans-serif"); // fontFamily
    });

    it("uses custom brand colors when provided", () => {
      const html = renderDiagramHtml(
        makeOptions({
          nodes: [
            { id: "1", label: "A", type: "input" },
            { id: "2", label: "B", type: "output" },
          ],
          edges: [{ id: "e1", source: "1", target: "2" }],
          brand: {
            primary: "#ff0000",
            secondary: "#00ff00",
            accent: "#0000ff",
            background: "#111111",
          },
        })
      );
      // primary appears in CSS (#title-bar background) and node borders/output bg
      expect(html).toContain("#ff0000");
      // secondary appears in node text color and label fill
      expect(html).toContain("#00ff00");
      // accent appears as input node background
      expect(html).toContain("#0000ff");
      // background appears in body style
      expect(html).toContain("#111111");
    });

    it("uses custom fontFamily in CSS", () => {
      const html = renderDiagramHtml(
        makeOptions({
          brand: { fontFamily: "Roboto, Arial, sans-serif" },
        })
      );
      expect(html).toContain("Roboto, Arial, sans-serif");
    });
  });

  // ---------------------------------------------------------------
  // Node serialization
  // ---------------------------------------------------------------
  describe("node serialization", () => {
    it("nodes appear as JSON in the script", () => {
      const nodes: DiagramNode[] = [
        { id: "n1", label: "First" },
        { id: "n2", label: "Second" },
      ];
      const html = renderDiagramHtml(makeOptions({ nodes }));
      // The node ids should appear in the serialized JSON
      expect(html).toContain('"id":"n1"');
      expect(html).toContain('"id":"n2"');
    });

    it("node labels are preserved in serialized data", () => {
      const nodes: DiagramNode[] = [
        { id: "n1", label: "Hello World" },
      ];
      const html = renderDiagramHtml(makeOptions({ nodes }));
      expect(html).toContain('"label":"Hello World"');
    });

    it("input node type gets accent background color", () => {
      const nodes: DiagramNode[] = [
        { id: "n1", label: "Input Node", type: "input" },
      ];
      const html = renderDiagramHtml(makeOptions({ nodes }));
      // Default accent is #fee19a
      expect(html).toContain('"background":"#fee19a"');
    });

    it("output node type gets primary background color", () => {
      const nodes: DiagramNode[] = [
        { id: "n1", label: "Output Node", type: "output" },
      ];
      const html = renderDiagramHtml(makeOptions({ nodes }));
      // Default primary is #35656e
      // The background for output nodes should be the primary color
      expect(html).toContain('"background":"#35656e"');
    });

    it("default node type gets white background", () => {
      const nodes: DiagramNode[] = [
        { id: "n1", label: "Default Node" },
      ];
      const html = renderDiagramHtml(makeOptions({ nodes }));
      expect(html).toContain('"background":"#ffffff"');
    });
  });

  // ---------------------------------------------------------------
  // Edge serialization
  // ---------------------------------------------------------------
  describe("edge serialization", () => {
    it("edges appear as JSON in the script", () => {
      const edges: DiagramEdge[] = [
        { id: "e1", source: "a", target: "b" },
      ];
      const html = renderDiagramHtml(
        makeOptions({
          nodes: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          edges,
        })
      );
      expect(html).toContain('"id":"e1"');
      expect(html).toContain('"source":"a"');
      expect(html).toContain('"target":"b"');
    });

    it("edge labels are preserved", () => {
      const edges: DiagramEdge[] = [
        { id: "e1", source: "a", target: "b", label: "connects to" },
      ];
      const html = renderDiagramHtml(
        makeOptions({
          nodes: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          edges,
        })
      );
      expect(html).toContain('"label":"connects to"');
    });

    it("animated edges have animated: true", () => {
      const edges: DiagramEdge[] = [
        { id: "e1", source: "a", target: "b", animated: true },
      ];
      const html = renderDiagramHtml(
        makeOptions({
          nodes: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          edges,
        })
      );
      expect(html).toContain('"animated":true');
    });
  });

  // ---------------------------------------------------------------
  // Layout direction
  // ---------------------------------------------------------------
  describe("layout direction", () => {
    it('"flow" diagram type uses TB direction', () => {
      const html = renderDiagramHtml(makeOptions({ diagramType: "flow" }));
      expect(html).toContain('"TB"');
    });

    it('"concept-map" uses TB direction', () => {
      const html = renderDiagramHtml(makeOptions({ diagramType: "concept-map" }));
      expect(html).toContain('"TB"');
    });

    it('"timeline" uses LR direction', () => {
      const html = renderDiagramHtml(makeOptions({ diagramType: "timeline" }));
      expect(html).toContain('"LR"');
    });

    it('"comparison" uses LR direction', () => {
      const html = renderDiagramHtml(makeOptions({ diagramType: "comparison" }));
      expect(html).toContain('"LR"');
    });
  });

  // ---------------------------------------------------------------
  // Import map
  // ---------------------------------------------------------------
  describe("import map", () => {
    it("includes React import map", () => {
      const html = renderDiagramHtml(makeOptions());
      expect(html).toContain('"react"');
      expect(html).toContain("importmap");
    });

    it("includes @xyflow/react in import map", () => {
      const html = renderDiagramHtml(makeOptions());
      expect(html).toContain('"@xyflow/react"');
    });

    it("includes dagre in import map", () => {
      const html = renderDiagramHtml(makeOptions());
      expect(html).toContain('"@dagrejs/dagre"');
    });
  });
});
