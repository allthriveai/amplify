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

const SHOT_TYPE_ICONS: Record<string, string> = {
  avatar: "🎙",
  "text-card": "📝",
  "screen-capture": "🖥",
  "b-roll-placeholder": "🎬",
  "branded-intro": "▶",
  "branded-outro": "◼",
};

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

function shotCardHtml(shot: Shot, index: number): string {
  const icon = SHOT_TYPE_ICONS[shot.shotType] || "•";
  const color = SHOT_TYPE_COLORS[shot.shotType] || "#666";
  const spokenText = shot.script || shot.voiceover || "";
  const visualText = shot.text || shot.direction || "";
  const hasAudio = !!(shot.script || shot.voiceover);

  return `
    <div class="shot-card" data-index="${index}" data-id="${shot.id}" draggable="true">
      <div class="shot-header" style="border-left: 4px solid ${color}">
        <span class="shot-icon">${icon}</span>
        <span class="shot-type">${shot.shotType}</span>
        <span class="shot-beat" contenteditable="true" data-field="beat">${escapeHtml(shot.beat)}</span>
        <span class="shot-duration" contenteditable="true" data-field="duration">${shot.duration}s</span>
        <span class="shot-id">#${shot.id}</span>
      </div>
      ${shot.asset ? `<div class="shot-asset">${escapeHtml(shot.asset)}</div>` : ""}
      ${shot.textCardType ? `<div class="shot-card-type">${shot.textCardType}</div>` : ""}
      ${visualText ? `<div class="shot-visual" contenteditable="true" data-field="${shot.text ? "text" : "direction"}">${escapeHtml(visualText)}</div>` : ""}
      ${spokenText ? `
        <div class="shot-script-row">
          <div class="shot-script" contenteditable="true" data-field="${shot.script ? "script" : "voiceover"}">${escapeHtml(spokenText)}</div>
          ${hasAudio ? `<button class="play-btn" data-index="${index}" title="Preview voiceover">&#9654;</button>` : ""}
        </div>
      ` : ""}
      ${!spokenText && !visualText && shot.shotType !== "branded-intro" && shot.shotType !== "branded-outro" ? `
        <div class="shot-script" contenteditable="true" data-field="direction" placeholder="Add direction..."></div>
      ` : ""}
      <div class="shot-actions">
        <button class="action-btn delete-btn" data-index="${index}" title="Delete shot">&times;</button>
      </div>
    </div>`;
}

export function generateStoryboardHtml(options: StoryboardOptions): string {
  const { timeline, directorsNotes, timelinePath, serverUrl } = options;
  const shots = timeline.shots;
  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);
  const shotCards = shots.map((s, i) => shotCardHtml(s, i)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Storyboard: ${escapeHtml(timeline.title)}</title>
<style>
  :root {
    --navy: #2e4a6e;
    --teal: #389590;
    --gold: #e0a53c;
    --charcoal: #1a2538;
    --cream: #ece6de;
    --sand: #d1c9be;
    --bg: #ffffff;
    --card-bg: #f8f8f8;
    --card-hover: #f0f0f0;
    --border: #e0e0e0;
    --text: #1a1a1a;
    --text-muted: #666666;
    --danger: #c0392b;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 24px;
    line-height: 1.5;
  }

  .header {
    max-width: 1400px;
    margin: 0 auto 32px;
  }

  .header h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .header-meta {
    display: flex;
    gap: 24px;
    color: var(--text-muted);
    font-size: 14px;
    flex-wrap: wrap;
  }

  .header-meta span { display: flex; align-items: center; gap: 6px; }
  .meta-label { color: var(--text-muted); }
  .meta-value { color: var(--teal); font-weight: 600; }

  .toolbar {
    max-width: 1400px;
    margin: 0 auto 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar button {
    background: var(--card-bg);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.15s;
  }
  .toolbar button:hover { background: var(--card-hover); }
  .toolbar .btn-primary { background: var(--teal); border-color: var(--teal); color: #fff; }
  .toolbar .btn-primary:hover { background: #2e807c; }
  .toolbar .btn-warn { background: var(--gold); color: var(--charcoal); border-color: var(--gold); }
  .toolbar .btn-warn:hover { background: #c99030; }

  .toolbar .spacer { flex: 1; }
  .toolbar .total-duration { color: var(--text-muted); font-size: 14px; font-weight: 600; }

  .timeline-bar {
    max-width: 1400px;
    margin: 0 auto 32px;
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    gap: 2px;
  }

  .timeline-segment {
    height: 100%;
    transition: flex 0.3s;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
  }
  .timeline-segment:hover { opacity: 0.8; }
  .timeline-segment .tooltip {
    display: none;
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--charcoal);
    color: #fff;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 10;
  }
  .timeline-segment:hover .tooltip { display: block; }

  .board {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .shot-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    cursor: grab;
    transition: transform 0.15s, box-shadow 0.15s;
    position: relative;
  }
  .shot-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .shot-card.dragging { opacity: 0.4; }
  .shot-card.drag-over { border-color: var(--teal); box-shadow: 0 0 0 2px var(--teal); }

  .shot-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-left: 8px;
    font-size: 13px;
  }

  .shot-icon { font-size: 16px; }
  .shot-type { color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .shot-beat {
    color: var(--teal);
    font-weight: 600;
    font-size: 13px;
    outline: none;
    border-bottom: 1px dashed transparent;
    padding: 0 2px;
  }
  .shot-beat:hover { border-bottom-color: var(--teal); }
  .shot-beat:focus { border-bottom-color: var(--gold); }
  .shot-duration {
    margin-left: auto;
    color: var(--gold);
    font-weight: 700;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    outline: none;
    border-bottom: 1px dashed transparent;
    padding: 0 2px;
    min-width: 28px;
    text-align: right;
  }
  .shot-duration:hover { border-bottom-color: var(--gold); }
  .shot-duration:focus { border-bottom-color: var(--gold); }
  .shot-id { color: var(--text-muted); font-size: 11px; }

  .shot-asset {
    font-size: 11px;
    color: var(--text-muted);
    background: rgba(0,0,0,0.04);
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    display: inline-block;
  }

  .shot-card-type {
    font-size: 11px;
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .shot-visual {
    font-size: 13px;
    color: var(--sand);
    font-style: italic;
    margin-bottom: 8px;
    outline: none;
    border-bottom: 1px dashed transparent;
    padding: 2px 0;
    min-height: 20px;
  }
  .shot-visual:hover { border-bottom-color: var(--sand); }
  .shot-visual:focus { border-bottom-color: var(--gold); background: rgba(0,0,0,0.03); }

  .shot-script-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .shot-script {
    flex: 1;
    font-size: 14px;
    color: var(--text);
    line-height: 1.5;
    outline: none;
    border-bottom: 1px dashed transparent;
    padding: 2px 0;
    min-height: 20px;
  }
  .shot-script:hover { border-bottom-color: var(--text-muted); }
  .shot-script:focus { border-bottom-color: var(--gold); background: rgba(0,0,0,0.03); }
  .shot-script[placeholder]:empty::before {
    content: attr(placeholder);
    color: var(--text-muted);
    font-style: italic;
  }

  .play-btn {
    background: var(--teal);
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .play-btn:hover { background: #2e807c; }
  .play-btn.playing { background: var(--gold); color: var(--charcoal); }

  .shot-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .shot-card:hover .shot-actions { opacity: 1; }

  .action-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 18px;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .action-btn:hover { color: var(--danger); background: rgba(192,57,43,0.1); }

  .add-shot-card {
    background: transparent;
    border: 2px dashed var(--border);
    border-radius: 8px;
    padding: 32px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 14px;
    transition: border-color 0.15s, color 0.15s;
    min-height: 120px;
  }
  .add-shot-card:hover { border-color: var(--teal); color: var(--teal); }

  .notes {
    max-width: 1400px;
    margin: 48px auto 0;
    padding: 24px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  .notes h2 { font-size: 16px; color: var(--text-muted); margin-bottom: 12px; }
  .notes-content {
    font-size: 14px;
    color: var(--text);
    line-height: 1.7;
    white-space: pre-wrap;
    outline: none;
    min-height: 60px;
  }
  .notes-content:focus { background: rgba(0,0,0,0.02); }

  .save-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--teal);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.2s, transform 0.2s;
    z-index: 100;
  }
  .save-toast.visible { opacity: 1; transform: translateY(0); }

  .dirty-indicator {
    display: none;
    width: 8px;
    height: 8px;
    background: var(--gold);
    border-radius: 50%;
    margin-left: 8px;
  }
  .dirty-indicator.visible { display: inline-block; }

  @media (max-width: 640px) {
    body { padding: 12px; }
    .board { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>${escapeHtml(timeline.title)}</h1>
  <div class="header-meta">
    <span><span class="meta-label">Hook:</span> <span class="meta-value">${escapeHtml(timeline.hook)}</span></span>
    <span><span class="meta-label">Structure:</span> <span class="meta-value">${escapeHtml(timeline.structure)}</span></span>
    <span><span class="meta-label">Platform:</span> <span class="meta-value">${escapeHtml(timeline.platform)}</span></span>
    <span><span class="meta-label">Target:</span> <span class="meta-value">${timeline.targetDuration}s</span></span>
    <span><span class="meta-label">Actual:</span> <span class="meta-value total-duration">${totalDuration}s</span></span>
  </div>
</div>

<div class="toolbar">
  <button class="btn-primary" onclick="playAll()">&#9654; Play All Audio</button>
  <button onclick="stopAll()">&#9724; Stop</button>
  <button onclick="addShot()">+ Add Shot</button>
  <span class="spacer"></span>
  <span class="total-duration" id="running-total">${shots.length} shots &middot; ${totalDuration}s</span>
  <span class="dirty-indicator" id="dirty-dot"></span>
  <button class="btn-warn" onclick="saveStoryboard()">Save</button>
  <button onclick="exportYaml()">Copy YAML</button>
</div>

<div class="timeline-bar" id="timeline-bar">
  ${shots.map((s, i) => `<div class="timeline-segment" style="flex:${s.duration};background:${SHOT_TYPE_COLORS[s.shotType] || "#666"}" data-index="${i}"><span class="tooltip">#${s.id} ${escapeHtml(s.beat)} (${s.duration}s)</span></div>`).join("")}
</div>

<div class="board" id="board">
  ${shotCards}
  <div class="add-shot-card" onclick="addShot()">+ Add shot</div>
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
const SHOT_TYPE_ICONS = ${JSON.stringify(SHOT_TYPE_ICONS)};
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
document.getElementById("board").addEventListener("input", (e) => {
  if (e.target.hasAttribute("contenteditable")) markDirty();
});
document.getElementById("directors-notes").addEventListener("input", markDirty);

// --- Duration field: strip non-numeric on blur ---
document.getElementById("board").addEventListener("blur", (e) => {
  if (e.target.dataset.field === "duration") {
    const num = parseInt(e.target.textContent.replace(/[^0-9]/g, ""), 10);
    e.target.textContent = (num || 3) + "s";
    updateTotals();
  }
}, true);

// --- Drag and drop ---
let dragIndex = null;

document.getElementById("board").addEventListener("dragstart", (e) => {
  const card = e.target.closest(".shot-card");
  if (!card) return;
  dragIndex = parseInt(card.dataset.index);
  card.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
});

document.getElementById("board").addEventListener("dragend", (e) => {
  const card = e.target.closest(".shot-card");
  if (card) card.classList.remove("dragging");
  document.querySelectorAll(".shot-card").forEach(c => c.classList.remove("drag-over"));
});

document.getElementById("board").addEventListener("dragover", (e) => {
  e.preventDefault();
  const card = e.target.closest(".shot-card");
  if (card) card.classList.add("drag-over");
});

document.getElementById("board").addEventListener("dragleave", (e) => {
  const card = e.target.closest(".shot-card");
  if (card) card.classList.remove("drag-over");
});

document.getElementById("board").addEventListener("drop", (e) => {
  e.preventDefault();
  const targetCard = e.target.closest(".shot-card");
  if (!targetCard) return;
  const targetIndex = parseInt(targetCard.dataset.index);
  if (dragIndex === null || dragIndex === targetIndex) return;

  const board = document.getElementById("board");
  const cards = [...board.querySelectorAll(".shot-card")];
  const addBtn = board.querySelector(".add-shot-card");
  const dragCard = cards[dragIndex];

  if (dragIndex < targetIndex) {
    board.insertBefore(dragCard, targetCard.nextSibling);
  } else {
    board.insertBefore(dragCard, targetCard);
  }

  // Re-index
  board.querySelectorAll(".shot-card").forEach((c, i) => {
    c.dataset.index = i;
    c.querySelector(".shot-id").textContent = "#" + (i + 1);
    c.querySelectorAll("[data-index]").forEach(el => el.dataset.index = i);
  });

  markDirty();
  updateTimelineBar();
});

// --- Delete shot ---
document.getElementById("board").addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  const card = btn.closest(".shot-card");
  card.remove();
  // Re-index
  document.querySelectorAll(".shot-card").forEach((c, i) => {
    c.dataset.index = i;
    c.querySelector(".shot-id").textContent = "#" + (i + 1);
    c.querySelectorAll("[data-index]").forEach(el => el.dataset.index = i);
  });
  markDirty();
  updateTimelineBar();
});

// --- Add shot ---
function addShot() {
  const board = document.getElementById("board");
  const addBtn = board.querySelector(".add-shot-card");
  const count = board.querySelectorAll(".shot-card").length;
  const idx = count;
  const html = \`
    <div class="shot-card" data-index="\${idx}" data-id="\${idx + 1}" draggable="true">
      <div class="shot-header" style="border-left: 4px solid \${SHOT_TYPE_COLORS.avatar}">
        <span class="shot-icon">\${SHOT_TYPE_ICONS.avatar}</span>
        <span class="shot-type">avatar</span>
        <span class="shot-beat" contenteditable="true" data-field="beat">new-beat</span>
        <span class="shot-duration" contenteditable="true" data-field="duration">5s</span>
        <span class="shot-id">#\${idx + 1}</span>
      </div>
      <div class="shot-script-row">
        <div class="shot-script" contenteditable="true" data-field="script" placeholder="Write your script..."></div>
        <button class="play-btn" data-index="\${idx}" title="Preview voiceover">&#9654;</button>
      </div>
      <div class="shot-actions">
        <button class="action-btn delete-btn" data-index="\${idx}" title="Delete shot">&times;</button>
      </div>
    </div>\`;
  const temp = document.createElement("div");
  temp.innerHTML = html;
  board.insertBefore(temp.firstElementChild, addBtn);
  markDirty();
  updateTimelineBar();
}

// --- Audio preview (ElevenLabs via browser SpeechSynthesis fallback) ---
document.getElementById("board").addEventListener("click", (e) => {
  const btn = e.target.closest(".play-btn");
  if (!btn) return;
  e.stopPropagation();
  const card = btn.closest(".shot-card");
  const scriptEl = card.querySelector(".shot-script");
  if (!scriptEl) return;
  const text = scriptEl.textContent.trim();
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
  const cards = document.querySelectorAll(".shot-card");
  playAllQueue = [];
  cards.forEach(card => {
    const scriptEl = card.querySelector(".shot-script");
    const btn = card.querySelector(".play-btn");
    if (scriptEl && scriptEl.textContent.trim()) {
      playAllQueue.push({ text: scriptEl.textContent.trim(), btn });
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

// --- Update totals and timeline bar ---
function updateTotals() {
  const cards = document.querySelectorAll(".shot-card");
  let total = 0;
  cards.forEach(card => {
    const durEl = card.querySelector(".shot-duration");
    total += parseInt(durEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
  });
  document.getElementById("running-total").textContent = cards.length + " shots \\u00b7 " + total + "s";
  document.querySelectorAll(".header-meta .total-duration").forEach(el => el.textContent = total + "s");
}

function updateTimelineBar() {
  const bar = document.getElementById("timeline-bar");
  const cards = document.querySelectorAll(".shot-card");
  let html = "";
  cards.forEach((card, i) => {
    const dur = parseInt(card.querySelector(".shot-duration").textContent) || 3;
    const type = card.querySelector(".shot-type").textContent.trim().toLowerCase();
    const beat = card.querySelector(".shot-beat").textContent.trim();
    const color = SHOT_TYPE_COLORS[type] || "#666";
    html += \`<div class="timeline-segment" style="flex:\${dur};background:\${color}" data-index="\${i}"><span class="tooltip">#\${i+1} \${beat} (\${dur}s)</span></div>\`;
  });
  bar.innerHTML = html;
}

// --- Build shots array from DOM ---
function buildShotsArray() {
  const cards = document.querySelectorAll(".shot-card");
  const shots = [];
  cards.forEach((card, i) => {
    const beat = card.querySelector(".shot-beat")?.textContent.trim() || "beat";
    const type = card.querySelector(".shot-type")?.textContent.trim().toLowerCase() || "avatar";
    const dur = parseInt(card.querySelector(".shot-duration")?.textContent) || 3;
    const cardType = card.querySelector(".shot-card-type")?.textContent.trim();
    const asset = card.querySelector(".shot-asset")?.textContent.trim();
    const visual = card.querySelector(".shot-visual")?.textContent.trim();
    const script = card.querySelector(".shot-script")?.textContent.trim();
    const field = card.querySelector(".shot-script")?.dataset.field;

    const shot = { id: i + 1, beat: beat, shotType: type, duration: dur };
    if (script && field === "script") shot.script = script;
    if (script && field === "voiceover") {
      shot.voiceover = script;
      shot.voiceoverSource = "elevenlabs";
    }
    if (visual) {
      const vField = card.querySelector(".shot-visual")?.dataset.field || "direction";
      shot[vField] = visual;
    }
    if (cardType) shot.textCardType = cardType;
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
