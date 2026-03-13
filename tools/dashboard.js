#!/usr/bin/env node

import { createServer } from "http";
import { readFileSync, watch, existsSync, readdirSync } from "fs";
import { join, resolve, extname } from "path";

const PORT = parseInt(process.env.PORT || "3456", 10);
const PROJECT_ROOT = resolve(process.argv[2] || process.cwd());
const PROGRESS_FILE = join(PROJECT_ROOT, "docs", "pair-progress.md");
const VIZ_DIR = join(PROJECT_ROOT, "docs", "visualizations");

// --- YAML frontmatter parser (minimal, no dependencies) ---

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: {}, body: content };

  const yaml = {};
  match[1].split("\n").forEach(line => {
    const m = line.match(/^(\w[\w_]*):\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (/^\d+$/.test(val)) val = parseInt(val, 10);
      else if (/^\d+\.\d+$/.test(val)) val = parseFloat(val);
      else val = val.replace(/^["']|["']$/g, "");
      yaml[m[1]] = val;
    }
  });

  return { frontmatter: yaml, body: content.slice(match[0].length).trim() };
}

// --- Markdown section parser ---

function parseSections(body) {
  const sections = {};
  let currentKey = null;
  let currentLines = [];

  body.split("\n").forEach(line => {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (currentKey) sections[currentKey] = currentLines.join("\n").trim();
      currentKey = heading[1];
      currentLines = [];
    } else if (currentKey) {
      currentLines.push(line);
    }
  });
  if (currentKey) sections[currentKey] = currentLines.join("\n").trim();
  return sections;
}

// --- SSE clients ---

const clients = new Set();

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => res.write(msg));
}

// --- Watch progress file ---

function readProgress() {
  if (!existsSync(PROGRESS_FILE)) return null;
  try {
    const content = readFileSync(PROGRESS_FILE, "utf-8");
    const { frontmatter, body } = parseFrontmatter(content);
    const sections = parseSections(body);
    return { frontmatter, sections };
  } catch { return null; }
}

function getVisualizations() {
  if (!existsSync(VIZ_DIR)) return [];
  try {
    return readdirSync(VIZ_DIR)
      .filter(f => extname(f) === ".html")
      .sort()
      .map(f => ({ name: f, path: `/viz/${f}` }));
  } catch { return []; }
}

let watchTimeout = null;

function startWatcher() {
  const docsDir = join(PROJECT_ROOT, "docs");
  if (!existsSync(docsDir)) return;

  watch(docsDir, { recursive: true }, () => {
    // Debounce: wait 200ms after last change
    if (watchTimeout) clearTimeout(watchTimeout);
    watchTimeout = setTimeout(() => {
      broadcast({ type: "update" });
    }, 200);
  });
}

// --- HTML template ---

function renderDashboard() {
  const progress = readProgress();
  const vizFiles = getVisualizations();
  const fm = progress?.frontmatter || {};
  const sections = progress?.sections || {};

  const phasePercent = fm.total_phases
    ? Math.round(((fm.phase - 1) / fm.total_phases) * 100 + (fm.status === "executing" ? 100 / fm.total_phases / 2 : 0))
    : 0;

  const statusColors = {
    brainstorming: "#4e79a7",
    executing: "#59a14f",
    paused: "#f28e2b",
    retro: "#76b7b2",
    complete: "#333",
    abandoned: "#e15759",
  };
  const statusColor = statusColors[fm.status] || "#666";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Pair Programming Dashboard</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tufte-css/1.8.0/tufte.min.css" />
  <style>
    body { background: #fffff8; max-width: 720px; margin: 0 auto; padding: 1rem 1.5rem; }
    h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    .status-bar { display: flex; align-items: center; gap: 1rem; margin: 0.75rem 0; }
    .status-badge { font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 2px;
      color: white; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
    .progress-track { flex: 1; height: 8px; background: #e0e0e0; border-radius: 1px; overflow: hidden; }
    .progress-fill { height: 100%; background: #4e79a7; transition: width 0.3s; }
    .progress-label { font-size: 0.8rem; color: #666; min-width: 3rem; text-align: right; }
    .card { border-top: 1px solid #e0e0e0; padding: 0.75rem 0; }
    .card h2 { font-size: 1rem; margin: 0 0 0.5rem; color: #333; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 1rem; font-size: 0.85rem; }
    .meta dt { color: #999; }
    .meta dd { margin: 0; color: #333; }
    .phase-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .phase-table td { padding: 0.25rem 0.5rem; border-bottom: 1px solid #e0e0e0; }
    .phase-table td:first-child { width: 2rem; text-align: center; }
    .phase-table td:last-child { width: 5rem; text-align: right; color: #666; }
    .status-done { color: #59a14f; }
    .status-in-progress { color: #4e79a7; font-weight: bold; }
    .status-pending { color: #ccc; }
    .section-content { font-size: 0.85rem; color: #333; white-space: pre-wrap; line-height: 1.5; }
    .viz-list { list-style: none; padding: 0; font-size: 0.85rem; }
    .viz-list li { margin: 0.25rem 0; }
    .viz-list a { color: #4e79a7; text-decoration: none; }
    .viz-list a:hover { text-decoration: underline; }
    .empty { color: #ccc; font-style: italic; font-size: 0.85rem; }
    .connected-indicator { font-size: 0.7rem; color: #59a14f; float: right; }
  </style>
</head>
<body>
  <h1>Round ${fm.round || "?"} <span class="connected-indicator" id="conn">&#x25cf; live</span></h1>

  <div class="status-bar">
    <span class="status-badge" style="background: ${statusColor}">${fm.status || "unknown"}</span>
    <div class="progress-track"><div class="progress-fill" style="width: ${phasePercent}%"></div></div>
    <span class="progress-label">${fm.phase || "?"}/${fm.total_phases || "?"}</span>
  </div>

  <div class="card">
    <dl class="meta">
      <dt>Phase</dt><dd>${fm.phase_name || "—"}</dd>
      <dt>Current task</dt><dd>${fm.current_task || "—"}</dd>
      <dt>Task owner</dt><dd>${fm.task_owner || "—"}</dd>
      <dt>Detail level</dt><dd>${fm.detail_level || "moderate"}</dd>
      ${fm.plan ? `<dt>Plan</dt><dd><a href="#" style="color:#4e79a7">${fm.plan}</a></dd>` : ""}
    </dl>
  </div>

  ${sections["Phases"] ? `
  <div class="card">
    <h2>Phases</h2>
    <table class="phase-table">${parsePhaseTable(sections["Phases"])}</table>
  </div>` : ""}

  ${sections["Completed Work"] ? `
  <div class="card">
    <h2>Completed Work</h2>
    <div class="section-content">${escapeHtml(sections["Completed Work"])}</div>
  </div>` : ""}

  ${sections["Open Items"] ? `
  <div class="card">
    <h2>Open Items</h2>
    <div class="section-content">${escapeHtml(sections["Open Items"])}</div>
  </div>` : ""}

  ${sections["Ownership Preferences"] ? `
  <div class="card">
    <h2>Ownership Preferences</h2>
    <div class="section-content">${escapeHtml(sections["Ownership Preferences"])}</div>
  </div>` : ""}

  ${vizFiles.length ? `
  <div class="card">
    <h2>Visualizations</h2>
    <ul class="viz-list">
      ${vizFiles.map(v => `<li><a href="${v.path}" target="_blank">${v.name}</a></li>`).join("")}
    </ul>
  </div>` : ""}

  ${!progress ? '<div class="empty">No docs/pair-progress.md found. Start a pairing session to see the dashboard.</div>' : ""}

  <script>
    const evtSource = new EventSource("/events");
    const conn = document.getElementById("conn");
    evtSource.onmessage = () => location.reload();
    evtSource.onerror = () => { conn.style.color = "#e15759"; conn.title = "disconnected"; };
  </script>
</body>
</html>`;
}

function parsePhaseTable(md) {
  const rows = md.split("\n").filter(l => l.startsWith("|") && !l.includes("---"));
  // Skip header row
  return rows.slice(1).map(row => {
    const cells = row.split("|").filter(Boolean).map(c => c.trim());
    if (cells.length < 3) return "";
    const num = cells[0];
    const name = cells[1];
    const status = cells[2];
    const icon = status === "done" ? "&#x25cf;" : status === "in progress" ? "&#x25d0;" : "&#x25cb;";
    const cls = status === "done" ? "status-done" : status === "in progress" ? "status-in-progress" : "status-pending";
    return `<tr><td class="${cls}">${icon}</td><td>${name}</td><td>${status}</td></tr>`;
  }).join("");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- HTTP server ---

const server = createServer((req, res) => {
  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write("data: connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.url?.startsWith("/viz/")) {
    const filename = req.url.slice(5);
    const filepath = join(VIZ_DIR, filename);
    if (existsSync(filepath) && extname(filename) === ".html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(readFileSync(filepath, "utf-8"));
      return;
    }
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(renderDashboard());
});

server.listen(PORT, () => {
  console.log(`\n  Pair Programming Dashboard`);
  console.log(`  Watching: ${PROGRESS_FILE}`);
  console.log(`  Open: http://localhost:${PORT}\n`);
  startWatcher();
});
