// ---------------------------------------------------------------------------
// Storyboard HTML generator — visual pre-production for director timelines
// ---------------------------------------------------------------------------

import type { Shot, TimelineFrontmatter } from "../types/director.js";

interface StoryboardOptions {
  timeline: TimelineFrontmatter;
  directorsNotes: string;
  timelinePath: string;
  assetsDir?: string;
  serverUrl?: string;
}

const SHOT_TYPE_COLORS: Record<string, string> = {
  avatar: "#389590",
  "text-card": "#e0a53c",
  "screen-capture": "#5b8fa8",
  "b-roll-placeholder": "#888",
  "branded-intro": "#2e4a6e",
  "branded-outro": "#2e4a6e",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shotRowHtml(shot: Shot, index: number): string {
  const words = shot.script || shot.voiceover || "";
  const images = shot.direction || shot.text || "";
  const color = SHOT_TYPE_COLORS[shot.shotType] || "#666";

  return `
    <tr class="shot-row" data-index="${index}" data-id="${shot.id}" data-shot-type="${shot.shotType}" draggable="true">
      <td class="row-handle" title="Drag to reorder">⠿</td>
      <td class="cell-beat">
        <span class="beat-label" contenteditable="true" data-field="beat">${escapeHtml(shot.beat)}</span>
        <span class="beat-meta">
          <span class="shot-duration" contenteditable="true" data-field="duration">${shot.duration}s</span>
        </span>
      </td>
      <td class="cell-words" contenteditable="true" data-field="${shot.script ? "script" : "voiceover"}">${escapeHtml(words)}</td>
      <td class="cell-images" contenteditable="true" data-field="${shot.text ? "text" : "direction"}">${escapeHtml(images)}${shot.asset ? `<div class="asset-ref">${escapeHtml(shot.asset)}</div>` : ""}</td>
      <td class="cell-music" contenteditable="true" data-field="music"></td>
      <td class="cell-effects" contenteditable="true" data-field="effects">${shot.textCardType ? escapeHtml(shot.textCardType) : ""}</td>
      <td class="cell-actions">
        <button class="play-btn" data-index="${index}" title="Preview">&#9654;</button>
        <button class="delete-btn" data-index="${index}" title="Delete">&times;</button>
      </td>
    </tr>`;
}

export function generateStoryboardHtml(options: StoryboardOptions): string {
  const { timeline, directorsNotes, timelinePath, serverUrl } = options;
  const shots = timeline.shots;
  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);
  const shotRows = shots.map((s, i) => shotRowHtml(s, i)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Storyboard: ${escapeHtml(timeline.title)}</title>
<style>
  :root {
    --bg: #ffffff;
    --border: #1a1a1a;
    --border-light: #d0d0d0;
    --text: #1a1a1a;
    --text-muted: #666666;
    --teal: #389590;
    --gold: #e0a53c;
    --navy: #2e4a6e;
    --danger: #c0392b;
    --row-hover: #fafafa;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 32px;
    line-height: 1.5;
  }

  .header {
    max-width: 1200px;
    margin: 0 auto 24px;
  }

  .header h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .header-meta {
    display: flex;
    gap: 20px;
    color: var(--text-muted);
    font-size: 13px;
    flex-wrap: wrap;
  }

  .meta-label { font-weight: 600; }

  .toolbar {
    max-width: 1200px;
    margin: 0 auto 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar button {
    background: #fff;
    color: var(--text);
    border: 1px solid var(--border-light);
    padding: 6px 14px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  .toolbar button:hover { background: #f5f5f5; }
  .toolbar .btn-primary { background: var(--teal); border-color: var(--teal); color: #fff; }
  .toolbar .btn-primary:hover { background: #2e807c; }
  .toolbar .spacer { flex: 1; }
  .toolbar .total-duration { color: var(--text-muted); font-size: 13px; font-weight: 600; }

  .dirty-indicator {
    display: none;
    width: 8px;
    height: 8px;
    background: var(--gold);
    border-radius: 50%;
    margin-left: 6px;
  }
  .dirty-indicator.visible { display: inline-block; }

  /* ---- Table storyboard ---- */
  .storyboard-wrap {
    max-width: 1200px;
    margin: 0 auto;
  }

  table.storyboard {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid var(--border);
    table-layout: fixed;
  }

  table.storyboard thead th {
    background: #fff;
    font-weight: 700;
    font-size: 15px;
    text-align: left;
    padding: 10px 14px;
    border: 2px solid var(--border);
    text-transform: lowercase;
  }

  table.storyboard tbody tr {
    border-bottom: 1px solid var(--border);
  }
  table.storyboard tbody tr:hover {
    background: var(--row-hover);
  }
  table.storyboard tbody tr.dragging { opacity: 0.3; }
  table.storyboard tbody tr.drag-over td { box-shadow: inset 0 -3px 0 var(--teal); }

  table.storyboard td {
    padding: 10px 14px;
    border-right: 1px solid var(--border);
    vertical-align: top;
    font-size: 14px;
    line-height: 1.6;
    min-height: 48px;
  }
  table.storyboard td:last-child { border-right: 2px solid var(--border); }

  table.storyboard td[contenteditable="true"] {
    outline: none;
    cursor: text;
  }
  table.storyboard td[contenteditable="true"]:focus {
    background: #fffde7;
  }
  table.storyboard td[contenteditable="true"]:empty::before {
    content: "\\00a0";
    color: var(--text-muted);
  }

  /* Column widths */
  col.col-handle  { width: 32px; }
  col.col-beat    { width: 14%; }
  col.col-words   { width: 30%; }
  col.col-images  { width: 24%; }
  col.col-music   { width: 12%; }
  col.col-effects { width: 14%; }
  col.col-actions { width: 64px; }

  .row-handle {
    text-align: center;
    cursor: grab;
    color: var(--text-muted);
    font-size: 14px;
    user-select: none;
    padding: 10px 4px !important;
  }
  .row-handle:active { cursor: grabbing; }

  .cell-beat {
    font-weight: 600;
  }

  .beat-label {
    display: block;
    outline: none;
    color: var(--text);
    font-size: 14px;
    border-bottom: 1px dashed transparent;
    padding: 0 2px;
  }
  .beat-label:hover { border-bottom-color: var(--teal); }
  .beat-label:focus { border-bottom-color: var(--gold); }

  .beat-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .shot-type-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #fff;
    padding: 1px 6px;
    border-radius: 3px;
  }

  .shot-duration {
    font-size: 12px;
    font-weight: 700;
    color: var(--gold);
    font-variant-numeric: tabular-nums;
    outline: none;
    border-bottom: 1px dashed transparent;
    padding: 0 2px;
  }
  .shot-duration:hover { border-bottom-color: var(--gold); }
  .shot-duration:focus { border-bottom-color: var(--gold); }

  .asset-ref {
    font-size: 11px;
    color: var(--text-muted);
    background: rgba(0,0,0,0.05);
    padding: 2px 6px;
    border-radius: 3px;
    margin-top: 6px;
    display: inline-block;
  }

  .cell-actions {
    text-align: center;
    white-space: nowrap;
    padding: 10px 6px !important;
  }

  .play-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: var(--teal);
    padding: 2px 4px;
  }
  .play-btn:hover { color: #2e807c; }
  .play-btn.playing { color: var(--gold); }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: var(--text-muted);
    padding: 2px 4px;
  }
  .delete-btn:hover { color: var(--danger); }

  /* Add row */
  .add-row td {
    text-align: center;
    color: var(--text-muted);
    cursor: pointer;
    padding: 12px !important;
    font-size: 13px;
    border-right: none !important;
  }
  .add-row:hover td { color: var(--teal); background: var(--row-hover); }

  /* Reference panels */
  .reference-panels {
    max-width: 1200px;
    margin: 0 auto 20px;
    display: flex;
    gap: 16px;
  }

  .ref-panel {
    flex: 1;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    overflow: hidden;
  }

  .ref-panel summary {
    padding: 10px 16px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    background: #fafafa;
    border-bottom: 1px solid var(--border-light);
    list-style: none;
  }
  .ref-panel summary::-webkit-details-marker { display: none; }
  .ref-panel summary::before {
    content: "\\25B8";
    margin-right: 8px;
    display: inline-block;
    transition: transform 0.15s;
  }
  .ref-panel[open] summary::before { transform: rotate(90deg); }
  .ref-panel[open] summary { border-bottom: 1px solid var(--border-light); }

  .ref-list {
    padding: 8px 0;
    max-height: 320px;
    overflow-y: auto;
  }

  .ref-item {
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  .ref-item:last-child { border-bottom: none; }

  .ref-item-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--text);
  }

  .ref-item-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-top: 2px;
  }

  .ref-item-example {
    font-size: 11px;
    color: var(--teal);
    font-style: italic;
    margin-top: 3px;
    line-height: 1.4;
  }

  /* Notes */
  .notes {
    max-width: 1200px;
    margin: 32px auto 0;
    padding: 20px;
    border: 1px solid var(--border-light);
    border-radius: 4px;
  }
  .notes h2 { font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
  .notes-content {
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    outline: none;
    min-height: 40px;
  }
  .notes-content:focus { background: #fffde7; }

  .save-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--teal);
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.2s, transform 0.2s;
    z-index: 100;
  }
  .save-toast.visible { opacity: 1; transform: translateY(0); }
</style>
</head>
<body>

<div class="header">
  <h1>${escapeHtml(timeline.title)}</h1>
  <div class="header-meta">
    <span><span class="meta-label">Hook:</span> ${escapeHtml(timeline.hook)}</span>
    <span><span class="meta-label">Structure:</span> ${escapeHtml(timeline.structure)}</span>
    <span><span class="meta-label">Platform:</span> ${escapeHtml(timeline.platform)}</span>
    <span><span class="meta-label">Target:</span> ${timeline.targetDuration}s</span>
    <span><span class="meta-label">Actual:</span> <span class="total-duration">${totalDuration}s</span></span>
  </div>
</div>

<div class="toolbar">
  <button class="btn-primary" onclick="playAll()">&#9654; Play All</button>
  <button onclick="stopAll()">&#9724; Stop</button>
  <button onclick="addRow()">+ Add Row</button>
  <span class="spacer"></span>
  <span class="total-duration" id="running-total">${shots.length} shots &middot; ${totalDuration}s</span>
  <span class="dirty-indicator" id="dirty-dot"></span>
  <button onclick="saveStoryboard()">Save</button>
  <button onclick="exportYaml()">Copy YAML</button>
</div>

<div class="reference-panels">
  <details class="ref-panel">
    <summary>Storytelling Principles (Matthew Dicks)</summary>
    <div class="ref-list">
      <div class="ref-item">
        <div class="ref-item-name">Stakes</div>
        <div class="ref-item-desc">The audience needs to want something for you. What could be won or lost? Without stakes, there's no reason to keep listening.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Five-Second Moment</div>
        <div class="ref-item-desc">Every story is about one moment of transformation. The instant something changed forever. Find the five seconds when it all shifted.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Elephant</div>
        <div class="ref-item-desc">Tell the audience what they should be waiting for early. The big thing hanging over the story that creates anticipation.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Backpack</div>
        <div class="ref-item-desc">Load the audience with your plan before you execute it. When they know what you're about to try, they feel every obstacle with you.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Breadcrumbs</div>
        <div class="ref-item-desc">Drop small hints of what's coming so the audience leans forward. Not spoilers. Promises.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Hourglass</div>
        <div class="ref-item-desc">When you reach the most important part, slow down. Expand the moment. Add detail. Make the audience feel every second.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Crystal Ball</div>
        <div class="ref-item-desc">Tell the audience what you think will happen next. If you're right, they feel smart. If you're wrong, they feel the surprise with you.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">But &amp; Therefore</div>
        <div class="ref-item-desc">Replace "and then" with "but" and "therefore." Every scene should cause the next one through conflict or consequence, not sequence.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Beginning &#x2260; End</div>
        <div class="ref-item-desc">Your character at the start must be different from your character at the end. That gap is the story.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Present Tense</div>
        <div class="ref-item-desc">Describe scenes as if they're happening right now. "I'm standing in the doorway" beats "I stood in the doorway."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Location</div>
        <div class="ref-item-desc">Every scene needs a physical place. Ground the audience somewhere real. A parking lot. A kitchen. A specific chair.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Heart of the Story</div>
        <div class="ref-item-desc">What is this story really about? Not the events. The deeper theme. The thing that makes a stranger care.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Humor</div>
        <div class="ref-item-desc">Contrast creates comedy. The gap between expectation and reality. You don't need jokes. You need honest surprises.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Surprise</div>
        <div class="ref-item-desc">Hide information strategically so you can reveal it at the right moment. The audience should never see the turn coming.</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Vulnerability</div>
        <div class="ref-item-desc">Say the thing you're afraid to say. The moments you want to skip are usually the ones that matter most.</div>
      </div>
    </div>
  </details>

  <details class="ref-panel">
    <summary>Hook Types</summary>
    <div class="ref-list">
      <div class="ref-item">
        <div class="ref-item-name">Contrarian</div>
        <div class="ref-item-desc">Challenge a belief the audience holds as true. Creates cognitive dissonance that keeps them engaged.</div>
        <div class="ref-item-example">"The days of prompt engineering are over."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Credibility</div>
        <div class="ref-item-desc">Lead with proof, experience, or authority. Establish trust before the audience asks "why should I listen?"</div>
        <div class="ref-item-example">"I spent 6 months building AI agent evaluation systems so you don't have to."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Curiosity Gap</div>
        <div class="ref-item-desc">Open a gap between what someone knows and what they want to know. An open loop the brain needs to close.</div>
        <div class="ref-item-example">"I changed one line in my agent's system prompt. Its evaluation scores tripled."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Empathy</div>
        <div class="ref-item-desc">Name the audience's specific pain before offering anything. Make them feel understood.</div>
        <div class="ref-item-example">"You've done the work. And your agent still hallucinates. I know that feeling."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Pattern Interrupt</div>
        <div class="ref-item-desc">Say something unexpected for the context. Breaks the brain's predictive pattern-matching and forces attention.</div>
        <div class="ref-item-example">"I deleted my entire agent architecture last Tuesday."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Question</div>
        <div class="ref-item-desc">Ask something the audience can't ignore. Activates the brain and demands an internal response.</div>
        <div class="ref-item-example">"How do you know if your AI agent is safe to deploy?"</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Shock Data</div>
        <div class="ref-item-desc">Lead with a surprising fact or stat that violates expectations and demands an explanation.</div>
        <div class="ref-item-example">"92% of AI agents deployed today have no ethics evaluation at all."</div>
      </div>
      <div class="ref-item">
        <div class="ref-item-name">Story Entry</div>
        <div class="ref-item-desc">Drop into the middle of a scene. Skip boring setup and land the audience in a moment with stakes already in play.</div>
        <div class="ref-item-example">"I was staring at agent logs full of manipulation attempts when I decided to change everything."</div>
      </div>
    </div>
  </details>
</div>

<div class="storyboard-wrap">
  <table class="storyboard" id="board">
    <colgroup>
      <col class="col-handle">
      <col class="col-beat">
      <col class="col-words">
      <col class="col-images">
      <col class="col-music">
      <col class="col-effects">
      <col class="col-actions">
    </colgroup>
    <thead>
      <tr>
        <th></th>
        <th>beat</th>
        <th>words</th>
        <th>images</th>
        <th>music</th>
        <th>effects</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="board-body">
      ${shotRows}
      <tr class="add-row" onclick="addRow()"><td colspan="7">+ add row</td></tr>
    </tbody>
  </table>
</div>

<div class="notes">
  <h2>Director's Notes</h2>
  <div class="notes-content" contenteditable="true" id="directors-notes">${escapeHtml(directorsNotes.trim())}</div>
</div>

<div class="save-toast" id="toast">Copied to clipboard</div>

<script>
const TIMELINE_PATH = ${JSON.stringify(timelinePath)};
const SERVER_URL = ${JSON.stringify(serverUrl || "")};
const SHOT_TYPES = ["avatar","text-card","screen-capture","b-roll-placeholder","branded-intro","branded-outro"];
const SHOT_TYPE_COLORS = ${JSON.stringify(SHOT_TYPE_COLORS)};
let dirty = false;
let currentAudio = null;
let playAllQueue = [];
let playAllIndex = -1;

function markDirty() {
  dirty = true;
  document.getElementById("dirty-dot").classList.add("visible");
  updateTotals();
}

// --- Editable fields ---
document.getElementById("board-body").addEventListener("input", (e) => {
  if (e.target.hasAttribute("contenteditable") || e.target.closest("[contenteditable]")) markDirty();
});
document.getElementById("directors-notes").addEventListener("input", markDirty);

// --- Duration field: strip non-numeric on blur ---
document.getElementById("board-body").addEventListener("blur", (e) => {
  if (e.target.dataset && e.target.dataset.field === "duration") {
    const num = parseInt(e.target.textContent.replace(/[^0-9]/g, ""), 10);
    e.target.textContent = (num || 3) + "s";
    updateTotals();
  }
}, true);

// --- Drag and drop rows ---
let dragIndex = null;

document.getElementById("board-body").addEventListener("dragstart", (e) => {
  const row = e.target.closest(".shot-row");
  if (!row) return;
  dragIndex = parseInt(row.dataset.index);
  row.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
});

document.getElementById("board-body").addEventListener("dragend", (e) => {
  const row = e.target.closest(".shot-row");
  if (row) row.classList.remove("dragging");
  document.querySelectorAll(".shot-row").forEach(r => r.classList.remove("drag-over"));
});

document.getElementById("board-body").addEventListener("dragover", (e) => {
  e.preventDefault();
  const row = e.target.closest(".shot-row");
  if (row) row.classList.add("drag-over");
});

document.getElementById("board-body").addEventListener("dragleave", (e) => {
  const row = e.target.closest(".shot-row");
  if (row) row.classList.remove("drag-over");
});

document.getElementById("board-body").addEventListener("drop", (e) => {
  e.preventDefault();
  const targetRow = e.target.closest(".shot-row");
  if (!targetRow) return;
  const targetIndex = parseInt(targetRow.dataset.index);
  if (dragIndex === null || dragIndex === targetIndex) return;

  const body = document.getElementById("board-body");
  const rows = [...body.querySelectorAll(".shot-row")];
  const dragRow = rows[dragIndex];

  if (dragIndex < targetIndex) {
    body.insertBefore(dragRow, targetRow.nextSibling);
  } else {
    body.insertBefore(dragRow, targetRow);
  }

  reIndex();
  markDirty();
});

function reIndex() {
  document.querySelectorAll(".shot-row").forEach((row, i) => {
    row.dataset.index = i;
    row.querySelectorAll("[data-index]").forEach(el => el.dataset.index = i);
  });
}

// --- Delete row ---
document.getElementById("board-body").addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  const row = btn.closest(".shot-row");
  row.remove();
  reIndex();
  markDirty();
});

// --- Add row ---
function addRow() {
  const body = document.getElementById("board-body");
  const addRow = body.querySelector(".add-row");
  const count = body.querySelectorAll(".shot-row").length;
  const idx = count;
  const color = SHOT_TYPE_COLORS.avatar;
  const html = \`
    <tr class="shot-row" data-index="\${idx}" data-id="\${idx + 1}" data-shot-type="avatar" draggable="true">
      <td class="row-handle" title="Drag to reorder">&#x2807;</td>
      <td class="cell-beat">
        <span class="beat-label" contenteditable="true" data-field="beat">new-beat</span>
        <span class="beat-meta">
          <span class="shot-duration" contenteditable="true" data-field="duration">5s</span>
        </span>
      </td>
      <td class="cell-words" contenteditable="true" data-field="script"></td>
      <td class="cell-images" contenteditable="true" data-field="direction"></td>
      <td class="cell-music" contenteditable="true" data-field="music"></td>
      <td class="cell-effects" contenteditable="true" data-field="effects"></td>
      <td class="cell-actions">
        <button class="play-btn" data-index="\${idx}" title="Preview">&#9654;</button>
        <button class="delete-btn" data-index="\${idx}" title="Delete">&times;</button>
      </td>
    </tr>\`;
  const temp = document.createElement("tbody");
  temp.innerHTML = html;
  body.insertBefore(temp.firstElementChild, addRow);
  markDirty();
}

// --- Audio preview ---
document.getElementById("board-body").addEventListener("click", (e) => {
  const btn = e.target.closest(".play-btn");
  if (!btn) return;
  e.stopPropagation();
  const row = btn.closest(".shot-row");
  const wordsCell = row.querySelector(".cell-words");
  if (!wordsCell) return;
  const text = wordsCell.textContent.trim();
  if (!text) return;
  playVoice(text, btn);
});

function playVoice(text, btn) {
  stopAll();
  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.onstart = () => btn && btn.classList.add("playing");
    utter.onend = () => {
      btn && btn.classList.remove("playing");
      if (playAllIndex >= 0) playNextInQueue();
    };
    window.speechSynthesis.speak(utter);
    currentAudio = utter;
  }
}

function playAll() {
  stopAll();
  const rows = document.querySelectorAll(".shot-row");
  playAllQueue = [];
  rows.forEach(row => {
    const wordsCell = row.querySelector(".cell-words");
    const btn = row.querySelector(".play-btn");
    if (wordsCell && wordsCell.textContent.trim()) {
      playAllQueue.push({ text: wordsCell.textContent.trim(), btn });
    }
  });
  if (playAllQueue.length === 0) return;
  playAllIndex = 0;
  playNextInQueue();
}

function playNextInQueue() {
  if (playAllIndex < 0 || playAllIndex >= playAllQueue.length) {
    playAllIndex = -1;
    return;
  }
  const { text, btn } = playAllQueue[playAllIndex];
  playAllIndex++;
  playVoice(text, btn);
}

function stopAll() {
  playAllIndex = -1;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  document.querySelectorAll(".play-btn.playing").forEach(b => b.classList.remove("playing"));
}

// --- Update totals ---
function updateTotals() {
  const rows = document.querySelectorAll(".shot-row");
  let total = 0;
  rows.forEach(row => {
    const durEl = row.querySelector(".shot-duration");
    total += parseInt(durEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
  });
  document.getElementById("running-total").textContent = rows.length + " shots \\u00b7 " + total + "s";
  document.querySelectorAll(".header-meta .total-duration").forEach(el => el.textContent = total + "s");
}

// --- Build shots array from DOM ---
function buildShotsArray() {
  const rows = document.querySelectorAll(".shot-row");
  const shots = [];
  rows.forEach((row, i) => {
    const beat = row.querySelector("[data-field=beat]")?.textContent.trim() || "beat";
    const type = row.dataset.shotType || "avatar";
    const dur = parseInt(row.querySelector(".shot-duration")?.textContent) || 3;
    const words = row.querySelector(".cell-words")?.textContent.trim();
    const wordsField = row.querySelector(".cell-words")?.dataset.field || "script";
    const images = row.querySelector(".cell-images")?.textContent.trim();
    const imagesField = row.querySelector(".cell-images")?.dataset.field || "direction";
    const effects = row.querySelector(".cell-effects")?.textContent.trim();
    const assetEl = row.querySelector(".asset-ref");
    const asset = assetEl ? assetEl.textContent.trim() : "";

    const shot = { id: i + 1, beat, shotType: type, duration: dur };
    if (words && wordsField === "script") shot.script = words;
    if (words && wordsField === "voiceover") {
      shot.voiceover = words;
      shot.voiceoverSource = "elevenlabs";
    }
    if (images) shot[imagesField] = images;
    if (effects) shot.textCardType = effects;
    if (asset) shot.asset = asset;
    shots.push(shot);
  });
  return shots;
}

function showToast(msg, isError) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = isError ? "#c0392b" : "#389590";
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2500);
}

// --- Save to server ---
async function saveStoryboard() {
  if (!SERVER_URL) {
    exportYaml();
    return;
  }
  const shots = buildShotsArray();
  const notes = document.getElementById("directors-notes")?.textContent || "";
  try {
    const res = await fetch(SERVER_URL + "/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shots, notes }),
    });
    const data = await res.json();
    if (data.ok) {
      dirty = false;
      document.getElementById("dirty-dot").classList.remove("visible");
      showToast("Saved to " + TIMELINE_PATH.split("/").pop());
    } else {
      showToast("Save failed: " + (data.error || "unknown"), true);
    }
  } catch (err) {
    showToast("Save failed: " + err.message, true);
  }
}

// --- Export to YAML clipboard ---
function exportYaml() {
  const shots = buildShotsArray();
  let yaml = "shots:\\n";
  shots.forEach((shot) => {
    yaml += "  - id: " + shot.id + "\\n";
    yaml += "    beat: " + shot.beat + "\\n";
    yaml += "    shotType: " + shot.shotType + "\\n";
    yaml += "    duration: " + shot.duration + "\\n";
    if (shot.script) yaml += "    script: \\"" + shot.script.replace(/"/g, '\\\\"') + "\\"\\n";
    if (shot.direction) yaml += "    direction: \\"" + shot.direction.replace(/"/g, '\\\\"') + "\\"\\n";
    if (shot.text) yaml += "    text: \\"" + shot.text.replace(/"/g, '\\\\"') + "\\"\\n";
    if (shot.textCardType) yaml += "    textCardType: " + shot.textCardType + "\\n";
    if (shot.asset) yaml += "    asset: \\"" + shot.asset + "\\"\\n";
    if (shot.voiceover) {
      yaml += "    voiceover: \\"" + shot.voiceover.replace(/"/g, '\\\\"') + "\\"\\n";
      yaml += "    voiceoverSource: " + (shot.voiceoverSource || "elevenlabs") + "\\n";
    }
  });
  navigator.clipboard.writeText(yaml).then(() => showToast("YAML copied to clipboard"));
}

// --- Keyboard shortcuts ---
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
    e.preventDefault();
    saveStoryboard();
  }
  if (e.key === "Escape") stopAll();
});
</script>
</body>
</html>`;
}
