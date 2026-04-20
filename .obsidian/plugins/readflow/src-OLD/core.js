// src/processor/linker.ts
var INDEX_TTL_MS = 10 * 60 * 1000; // 10 minutes
function tokenize(text) {
  const out = /* @__PURE__ */ new Set();
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z]{3,}/g);
  if (words) for (const w of words) out.add(w);
  const cjk = lower.replace(/[^\u4e00-\u9fff]/g, "");
  for (let i = 0; i < cjk.length - 1; i++) {
    out.add(cjk.slice(i, i + 2));
  }
  return out;
}
function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}
var VaultLinker = class {
  constructor(app, getSettings) {
    this.app = app;
    this.getSettings = getSettings;
    this.index = [];
    this.lastBuild = 0;
    this.indexMtimes = /* @__PURE__ */ new Map();
    this._rebuildPromise = null;
  }
  async rebuildIndexAsync() {
    if (this._rebuildPromise) return this._rebuildPromise;
    this._rebuildPromise = this._doRebuild();
    try {
      await this._rebuildPromise;
    } finally {
      this._rebuildPromise = null;
    }
  }
  async _doRebuild() {
    const now = Date.now();
    if (this.index.length > 0 && now - this.lastBuild < INDEX_TTL_MS) {
      return;
    }
    const settings = this.getSettings();
    const ignoreLines = settings.linkerIgnorePrefixes.split("\n").map((s) => s.trim().replace(/^\/+|\/+$/g, "")).filter(Boolean);
    const maxFiles = settings.linkerMaxFiles;
    const files = this.app.vault.getMarkdownFiles();
    const picked = [];
    outer: for (const f of files) {
      const path = f.path;
      for (const prefix of ignoreLines) {
        if (path === prefix || path.startsWith(prefix + "/")) continue outer;
      }
      picked.push(f);
      if (picked.length >= maxFiles * 3) break;
    }
    const existingMap = new Map(this.index.map((r) => [r.path, r]));
    const next = [];
    for (const f of picked.slice(0, maxFiles)) {
      const mtime = f.stat.mtime;
      const cached = existingMap.get(f.path);
      if (cached && cached._mtime === mtime) {
        next.push(cached);
        continue;
      }
      const cache = this.app.metadataCache.getCache(f.path);
      let head = f.basename;
      if (cache == null ? void 0 : cache.frontmatter) {
        try {
          head += " " + JSON.stringify(cache.frontmatter);
        } catch (e) {
        }
      }
      let body = "";
      try {
        body = await this.app.vault.read(f);
      } catch (e) {
        continue;
      }
      const tokens = tokenize(head + " " + body.slice(0, 4e3));
      const entry = { path: f.path, tokens, _mtime: mtime };
      this.indexMtimes.set(f.path, mtime);
      next.push(entry);
    }
    this.index = next;
    this.lastBuild = Date.now();
  }
  suggestForText(text, topK = 3) {
    const q = tokenize(text);
    if (q.size === 0) return [];
    const scored = [];
    for (const row of this.index) {
      const score = jaccard(q, row.tokens);
      if (score < 0.04) continue;
      const matchedTokens = [...q].filter((t) => row.tokens.has(t)).slice(0, 6);
      scored.push({ path: row.path, score, matchedTokens });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
  get lastBuildTime() {
    return this.lastBuild;
  }
};

// src/storage/vaultWriter.ts
var import_obsidian3 = require("obsidian");

// src/structure/tree.ts
function buildChapterTree(highlights) {
  var _a;
  const byChapter = /* @__PURE__ */ new Map();
  for (const h of highlights) {
    const key = ((_a = h.chapter) == null ? void 0 : _a.trim()) || "(\u672A\u5206\u7AE0)";
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key).push(h);
  }
  return [...byChapter.entries()].map(([chapter, hls]) => {
    var _a2;
    return {
      chapter,
      chapterUid: (_a2 = hls[0]) == null ? void 0 : _a2.chapterUid,
      highlights: [...hls].sort((a, b) => a.createdAt - b.createdAt)
    };
  });
}

// src/processor/knowledge.ts
function shortLabel(text, limit = 18) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > limit ? `${oneLine.slice(0, limit)}...` : oneLine;
}
function mermaidEscape(text) {
  return text.replace(/\n/g, " ").replace(/[()[\]{}`]/g, "").replace(/"/g, "'").trim();
}
function tokenize2(text) {
  const out = /* @__PURE__ */ new Set();
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z]{3,}/g);
  if (words) for (const w of words) out.add(w);
  const cjk = lower.replace(/[^\u4e00-\u9fff]/g, "");
  for (let i = 0; i < cjk.length - 1; i++) out.add(cjk.slice(i, i + 2));
  return out;
}
function similarity(a, b) {
  const ta = tokenize2(a);
  const tb = tokenize2(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const token of ta) if (tb.has(token)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}
function scoreCandidate(source, target) {
  const sim = similarity(source.content, target.content);
  const importance = target.importance / 10;
  const timeGap = Math.abs(source.createdAt - target.createdAt);
  const timeScore = 1 / (1 + timeGap / (1e3 * 60 * 60 * 24 * 30));
  return sim + importance + timeScore;
}
function pickBestMatch(source, candidates) {
  let best;
  let bestScore = -1;
  for (const candidate of candidates) {
    if (candidate.id === source.id) continue;
    const score = scoreCandidate(source, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}
function edgeKey(edge) {
  return `${edge.sourceId}|${edge.targetId}|${edge.hint}`;
}
function summarizeTopics(book) {
  const topicMap = /* @__PURE__ */ new Map();
  for (const highlight of book.highlights) {
    const key = (highlight.topic || "").trim() || "\u672A\u5F52\u7C7B";
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key).push(highlight);
  }
  return [...topicMap.entries()].map(([topic, items]) => {
    var _a;
    const byType = {};
    for (const item of items) {
      const type = item.highlightType || "\u672A\u5206\u7C7B";
      byType[type] = ((_a = byType[type]) != null ? _a : 0) + 1;
    }
    return {
      topic,
      count: items.length,
      byType,
      items
    };
  }).sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}
function inferKnowledgeEdges(book) {
  var _a;
  const edgeMap = /* @__PURE__ */ new Map();
  const byId = new Map(book.highlights.map((h) => [h.id, h]));
  for (const source of book.highlights) {
    for (const relation of (_a = source.relations) != null ? _a : []) {
      if (!byId.has(relation.targetId)) continue;
      const edge = {
        sourceId: source.id,
        targetId: relation.targetId,
        hint: relation.hint,
        explicit: true
      };
      edgeMap.set(edgeKey(edge), edge);
    }
  }
  for (const summary of summarizeTopics(book)) {
    const group = summary.items;
    const ideas = group.filter((h) => h.highlightType === "idea");
    const methods = group.filter((h) => h.highlightType === "method");
    const examples = group.filter((h) => h.highlightType === "example");
    const conclusions = group.filter((h) => h.highlightType === "conclusion");
    const questions = group.filter((h) => h.highlightType === "question");
    for (const question of questions) {
      const target = pickBestMatch(question, [...methods, ...ideas, ...conclusions]);
      if (!target) continue;
      edgeMap.set(
        edgeKey({ sourceId: question.id, targetId: target.id, hint: "\u56E0\u679C", explicit: false }),
        { sourceId: question.id, targetId: target.id, hint: "\u56E0\u679C", explicit: false }
      );
    }
    for (const idea of ideas) {
      const example = pickBestMatch(idea, examples);
      if (!example) continue;
      edgeMap.set(
        edgeKey({ sourceId: idea.id, targetId: example.id, hint: "\u8865\u5145", explicit: false }),
        { sourceId: idea.id, targetId: example.id, hint: "\u8865\u5145", explicit: false }
      );
    }
    for (const method of methods) {
      const conclusion = pickBestMatch(method, conclusions);
      if (!conclusion) continue;
      edgeMap.set(
        edgeKey({ sourceId: method.id, targetId: conclusion.id, hint: "\u56E0\u679C", explicit: false }),
        { sourceId: method.id, targetId: conclusion.id, hint: "\u56E0\u679C", explicit: false }
      );
    }
    const ordered = [...group].sort((a, b) => a.createdAt - b.createdAt);
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const cur = ordered[i];
      if (similarity(prev.content, cur.content) >= 0.42) {
        edgeMap.set(
          edgeKey({ sourceId: prev.id, targetId: cur.id, hint: "\u91CD\u590D", explicit: false }),
          { sourceId: prev.id, targetId: cur.id, hint: "\u91CD\u590D", explicit: false }
        );
      }
    }
  }
  return [...edgeMap.values()].slice(0, 32);
}
function buildTopicMindmap(book) {
  const topics = summarizeTopics(book);
  if (topics.length === 0) return "";
  const lines = ["```mermaid", "mindmap", `  root((${mermaidEscape(shortLabel(book.title, 22))}))`];
  for (const summary of topics.slice(0, 10)) {
    lines.push(`    ${mermaidEscape(summary.topic)}`);
    for (const [type, count] of Object.entries(summary.byType)) {
      lines.push(`      ${mermaidEscape(`${type} (${count})`)}`);
      for (const row of summary.items.filter((item) => (item.highlightType || "\u672A\u5206\u7C7B") === type).slice(0, 4)) {
        lines.push(`        ${mermaidEscape(shortLabel(row.content, 26))}`);
      }
    }
  }
  lines.push("```");
  return lines.join("\n");
}
function parseContextAbstract(h) {
  var _a;
  if (!h.contextAbstract) return null;
  var raw = h.contextAbstract;
  var excerpt = h.content || "";
  var idx = -1;
  if (excerpt) {
    idx = raw.indexOf(excerpt);
    if (idx === -1) idx = raw.indexOf(excerpt.slice(0, 20));
    if (idx === -1) idx = raw.indexOf(excerpt.slice(0, 10));
  }
  var before = "", main = "", after = "";
  if (idx !== -1) {
    before = raw.slice(0, idx).trim();
    main = excerpt;
    after = raw.slice(idx + excerpt.length).trim();
  } else {
    main = raw.slice(0, 120);
    before = "";
    after = raw.slice(120);
  }
  if (before.length > 300) before = "…" + before.slice(-280);
  if (after.length > 300) after = after.slice(0, 280) + "…";
  return {
    before: before || null,
    main: main || raw.slice(0, 100),
    after: after || null,
    chapter: h.chapter || null,
    wereadRange: h.wereadRange || null
  };
}
function buildRelationsMermaid(book) {
  const edges = inferKnowledgeEdges(book);
  if (edges.length === 0) return "";
  const byId = new Map(book.highlights.map((h) => [h.id, h]));
  const lines = ["```mermaid", "flowchart LR"];
  for (const edge of edges) {
    const source = byId.get(edge.sourceId);
    const target = byId.get(edge.targetId);
    if (!source || !target) continue;
    const sourceNode = `h_${source.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    const targetNode = `h_${target.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    lines.push(
      `${sourceNode}["${mermaidEscape(shortLabel(source.content))}"] -->|${edge.hint}${edge.explicit ? "" : "\xB7\u63A8\u65AD"}| ${targetNode}["${mermaidEscape(shortLabel(target.content))}"]`
    );
  }
  lines.push("```");
  return lines.join("\n");
}
function buildCoreInsights(book) {
  const sorted = [...book.highlights].sort((a, b) => b.importance - a.importance || b.createdAt - a.createdAt);
  const pick = (type, limit) => sorted.filter((h) => h.highlightType === type).slice(0, limit);
  const render = (title, rows) => {
    if (rows.length === 0) return `### ${title}

- \u6682\u65E0
`;
    return `### ${title}

${rows.map((row) => `- ${row.content.slice(0, 100)}${row.content.length > 100 ? "\u2026" : ""}`).join("\n")}
`;
  };
  return [
    "## \u6838\u5FC3\u89C2\u70B9",
    "",
    render("\u5173\u952E\u89C2\u70B9", pick("idea", 5)),
    render("\u5173\u952E\u65B9\u6CD5", pick("method", 4)),
    render("\u91CD\u8981\u4F8B\u5B50", pick("example", 4)),
    render("\u5173\u952E\u7ED3\u8BBA", pick("conclusion", 4)),
    render("\u5F85\u89E3\u95EE\u9898", pick("question", 4))
  ].join("\n");
}
function buildTopicStructure(book) {
  const topics = summarizeTopics(book).filter((summary) => summary.topic !== "\u672A\u5F52\u7C7B");
  if (topics.length === 0) return "## \u4E3B\u9898\u7ED3\u6784\n\n- \u6682\u65E0\u4E3B\u9898\u5F52\u7C7B\n";
  const lines = ["## \u4E3B\u9898\u7ED3\u6784", ""];
  for (const summary of topics) {
    lines.push(`### ${summary.topic}`);
    lines.push("");
    for (const row of summary.items.slice(0, 6)) {
      const type = row.highlightType ? ` [${row.highlightType}]` : "";
      lines.push(`- ${shortLabel(row.content, 72)}${type}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// src/processor/mindmap.ts
function buildMindMapTree(scopeBook) {
  var _a;
  var topics = summarizeTopics(scopeBook);
  var root = {
    id: "__mm_root",
    label: shortLabel(scopeBook.title, 20),
    full: scopeBook.title,
    ntype: "root",
    htype: null,
    exp: true,
    ch: [],
    _x: 0,
    _y: 0
  };
  for (var ti = 0; ti < Math.min(topics.length, 15); ti++) {
    var s = topics[ti];
    var tn = {
      id: "__mm_t" + ti,
      label: shortLabel(s.topic, 14),
      full: s.topic + " (" + s.count + "\u6761)",
      ntype: "topic",
      htype: null,
      exp: ti < 4,
      ch: [],
      _x: 0,
      _y: 0
    };
    var byType = {};
    for (var i = 0; i < s.items.length; i++) {
      var item = s.items[i];
      var tp = item.highlightType || "\u672A\u5206\u7C7B";
      if (!byType[tp]) byType[tp] = [];
      byType[tp].push(item);
    }
    var ents = Object.entries(byType).sort(function(a, b) { return b[1].length - a[1].length; });
    for (var ei = 0; ei < ents.length; ei++) {
      var typeKey = ents[ei][0];
      var items = ents[ei][1];
      var tl = (_a = HIGHLIGHT_TYPE_LABELS[typeKey]) != null ? _a : typeKey;
      var gn = {
        id: "__mm_g" + ti + "_" + ei,
        label: tl + " " + items.length,
        full: tl + " " + items.length + "\u6761",
        ntype: "type",
        htype: typeKey === "\u672A\u5206\u7C7B" ? null : typeKey,
        exp: false,
        ch: [],
        _x: 0,
        _y: 0
      };
      for (var hi = 0; hi < Math.min(items.length, 8); hi++) {
        var h = items[hi];
        gn.ch.push({
          id: "__mm_h" + ti + "_" + ei + "_" + hi,
          label: shortLabel(h.content, 18),
          full: h.content + (h.note ? "\n\u2500\u2500\n\u60F3\u6CD5: " + h.note : ""),
          ntype: "leaf",
          htype: h.highlightType,
          imp: h.importance || 3,
          exp: false,
          ch: [],
          _x: 0,
          _y: 0,
          srcId: h.id
        });
      }
      if (gn.ch.length > 0) tn.ch.push(gn);
    }
    root.ch.push(tn);
  }
  var uncat = scopeBook.highlights.filter(function(h2) { return !(h2.topic || "").trim(); });
  if (uncat.length > 0 && uncat.length <= 60) {
    var un = {
      id: "__mm_uncat",
      label: "\u672A\u5F52\u7C7B " + uncat.length,
      full: "\u672A\u5F52\u7C7B (" + uncat.length + "\u6761)",
      ntype: "topic",
      htype: null,
      exp: false,
      ch: [],
      _x: 0,
      _y: 0
    };
    for (var ui = 0; ui < Math.min(uncat.length, 12); ui++) {
      var uh = uncat[ui];
      un.ch.push({
        id: "__mm_uc" + ui,
        label: shortLabel(uh.content, 18),
        full: uh.content,
        ntype: "leaf",
        htype: uh.highlightType,
        imp: uh.importance || 3,
        exp: false,
        ch: [],
        _x: 0,
        _y: 0,
        srcId: uh.id
      });
    }
    root.ch.push(un);
  }
  return root;
}
function mmSubH(node, gap) {
  if (!node.exp || node.ch.length === 0) return gap;
  var t = 0;
  for (var i = 0; i < node.ch.length; i++) t += mmSubH(node.ch[i], gap);
  return Math.max(t, gap);
}
function layoutMM(node, x, y, h, lx, gap) {
  node._x = x;
  node._y = y + h / 2;
  if (!node.exp || node.ch.length === 0) return;
  var cx = x + lx;
  var tH = 0;
  for (var i = 0; i < node.ch.length; i++) tH += mmSubH(node.ch[i], gap);
  var oY = y + (h - tH) / 2;
  var cY = oY;
  for (var i = 0; i < node.ch.length; i++) {
    var ch = mmSubH(node.ch[i], gap);
    layoutMM(node.ch[i], cx, cY, ch, lx, gap);
    cY += ch;
  }
}
function collectMMNodes(node, arr) {
  arr.push(node);
  if (node.exp) for (var i = 0; i < node.ch.length; i++) collectMMNodes(node.ch[i], arr);
  return arr;
}
function collectMMEdges(node, arr) {
  if (node.exp) {
    for (var i = 0; i < node.ch.length; i++) {
      arr.push({ from: node, to: node.ch[i] });
      collectMMEdges(node.ch[i], arr);
    }
  }
  return arr;
}
var MM_TYPE_COLORS = {
  idea: "#6366f1",
  method: "#0891b2",
  example: "#059669",
  conclusion: "#dc2626",
  question: "#d97706"
};
var MM_NTYPE_COLORS = {
  root: "#2563eb",
  topic: "#7c3aed",
  type: "#475569",
  leaf: "#64748b"
};
function mmNodeColor(node) {
  if (node.htype && MM_TYPE_COLORS[node.htype]) return MM_TYPE_COLORS[node.htype];
  return MM_NTYPE_COLORS[node.ntype] || "#64748b";
}
function mmNodeW(node) {
  if (node.ntype === "root") return 130;
  if (node.ntype === "topic") return 110;
  if (node.ntype === "type") return 90;
  return 120;
}
function mmNodeH(node) {
  if (node.ntype === "root") return 36;
  if (node.ntype === "topic") return 30;
  return 26;
}
function renderMindMapCanvas(container, scopeBook, onCrystallize) {
  var root = buildMindMapTree(scopeBook);
  if (root.ch.length === 0) {
    container.createEl("p", { text: "\u6682\u65E0\u6458\u5F55\u6570\u636E\uFF0C\u65E0\u6CD5\u751F\u6210\u8111\u56FE\u3002", cls: "readflow-muted" });
    return;
  }
  var wrap = container.createDiv("readflow-mm-wrap");
  var canvas = wrap.createEl("canvas", { cls: "readflow-mm-canvas" });
  var W = wrap.clientWidth || 500;
  var H = wrap.clientHeight || canvas.clientHeight || 260;
  if (H < 100) H = 260;
  canvas.width = W;
  canvas.height = H;
  var LX = 150, GAP = 32;
  var totalH = mmSubH(root, GAP);
  layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
  var allN = collectMMNodes(root, []);
  var allE = collectMMEdges(root, []);
  var scale = 1, tx = 0, ty = 0;
  var hov = null, isPan = false, panOrig = { x: 0, y: 0 };
  if (totalH > H) {
    scale = Math.max(0.5, H / totalH * 0.9);
    tx = 10;
    ty = (H - totalH * scale) / 2;
  }
  var isDark = function() { return document.body.classList.contains("theme-dark"); };
  var drawRR = function(ctx, x2, y2, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x2 + r, y2);
    ctx.lineTo(x2 + w - r, y2);
    ctx.quadraticCurveTo(x2 + w, y2, x2 + w, y2 + r);
    ctx.lineTo(x2 + w, y2 + h - r);
    ctx.quadraticCurveTo(x2 + w, y2 + h, x2 + w - r, y2 + h);
    ctx.lineTo(x2 + r, y2 + h);
    ctx.quadraticCurveTo(x2, y2 + h, x2, y2 + h - r);
    ctx.lineTo(x2, y2 + r);
    ctx.quadraticCurveTo(x2, y2, x2 + r, y2);
    ctx.closePath();
  };
  function draw() {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dk = isDark();
    var bg = dk ? "#0b1220" : "#f8fafc";
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (var i = 0; i < allE.length; i++) {
      var e = allE[i];
      var fx = e.from._x + mmNodeW(e.from), fy = e.from._y;
      var tx2 = e.to._x, ty2 = e.to._y;
      var cpx = fx + (tx2 - fx) * 0.5;
      var isHovEdge = hov && (hov.id === e.from.id || hov.id === e.to.id);
      ctx.strokeStyle = isHovEdge ? mmNodeColor(e.to) : (dk ? "#334155" : "#cbd5e1");
      ctx.lineWidth = (isHovEdge ? 2 : 1.2) / scale;
      ctx.globalAlpha = isHovEdge ? 0.9 : (hov ? 0.25 : 0.6);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(cpx, fy, cpx, ty2, tx2, ty2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < allN.length; i++) {
      var n = allN[i];
      var nw = mmNodeW(n), nh = mmNodeH(n);
      var nx = n._x, ny = n._y - nh / 2;
      var col = mmNodeColor(n);
      var isH = n === hov;
      var faded = hov && n !== hov && !allE.some(function(e2) {
        return (e2.from === hov && e2.to === n) || (e2.to === hov && e2.from === n);
      });
      ctx.globalAlpha = faded ? 0.3 : 1;
      if (isH) { ctx.shadowColor = col; ctx.shadowBlur = 12 / scale; }
      if (n.ntype === "root") {
        ctx.fillStyle = col;
        drawRR(ctx, nx, ny, nw, nh, nh / 2);
        ctx.fill();
      } else {
        ctx.fillStyle = dk ? "#1e293b" : "#ffffff";
        drawRR(ctx, nx, ny, nw, nh, 6);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = (isH ? 2 : 1.2) / scale;
        drawRR(ctx, nx, ny, nw, nh, 6);
        ctx.stroke();
        if (n.ntype === "topic") {
          ctx.fillStyle = col;
          ctx.globalAlpha = (faded ? 0.3 : 1) * 0.12;
          drawRR(ctx, nx, ny, nw, nh, 6);
          ctx.fill();
          ctx.globalAlpha = faded ? 0.3 : 1;
        }
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = n.ntype === "root" ? "#f8fafc" : (dk ? "#e2e8f0" : "#1e293b");
      ctx.font = ((n.ntype === "root" || n.ntype === "topic") ? "600 " : "") + (11 / scale) + "px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.label, nx + nw / 2, n._y, nw - 8);
      if (n.ch.length > 0) {
        var ex = n.exp ? "\u25BC" : "\u25B6";
        ctx.fillStyle = dk ? "#94a3b8" : "#64748b";
        ctx.font = (8 / scale) + "px system-ui";
        ctx.textAlign = "right";
        ctx.fillText(ex, nx + nw - 4, n._y);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (hov) {
      var sx = hov._x * scale + tx, sy = (hov._y - mmNodeH(hov) / 2) * scale + ty - 8;
      var text = hov.full.length > 80 ? hov.full.slice(0, 80) + "\u2026" : hov.full;
      var lines = text.split("\n");
      var maxLine = lines[0];
      ctx.font = "12px system-ui, sans-serif";
      var tw2 = Math.min(ctx.measureText(maxLine).width, 320);
      var bw = tw2 + 24, bh = 14 + lines.length * 16;
      var bx = Math.max(4, Math.min(W - bw - 4, sx));
      var by = Math.max(4, sy - bh - 6);
      ctx.fillStyle = isDark() ? "#1e293b" : "#0f172a";
      ctx.globalAlpha = 0.94;
      drawRR(ctx, bx, by, bw, bh, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#f1f5f9";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li].slice(0, 50), bx + 12, by + 8 + li * 16);
      }
    }
  }
  draw();
  function hitTest(mx, my) {
    for (var i = allN.length - 1; i >= 0; i--) {
      var n = allN[i];
      var nw = mmNodeW(n), nh = mmNodeH(n);
      if (mx >= n._x && mx <= n._x + nw && my >= n._y - nh / 2 && my <= n._y + nh / 2) return n;
    }
    return null;
  }
  canvas.addEventListener("wheel", function(e) {
    e.preventDefault();
    var raw = Math.abs(e.deltaY);
    var step = raw > 80 ? 0.06 : raw > 30 ? 0.04 : 0.025;
    var f = e.deltaY > 0 ? (1 - step) : (1 + step);
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    tx = mx - (mx - tx) * f;
    ty = my - (my - ty) * f;
    scale = Math.max(0.15, Math.min(scale * f, 6));
    draw();
  }, { passive: false });
  canvas.addEventListener("mousedown", function(e) {
    if (e.button === 0) { isPan = true; panOrig = { x: e.clientX - tx, y: e.clientY - ty }; }
  });
  canvas.addEventListener("mousemove", function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - tx) / scale;
    var my = (e.clientY - rect.top - ty) / scale;
    if (isPan) { tx = e.clientX - panOrig.x; ty = e.clientY - panOrig.y; draw(); return; }
    var found = hitTest(mx, my);
    if (found !== hov) { hov = found; canvas.style.cursor = found ? "pointer" : "grab"; draw(); }
  });
  canvas.addEventListener("click", function(e) {
    if (isPan) return;
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - tx) / scale;
    var my = (e.clientY - rect.top - ty) / scale;
    var found = hitTest(mx, my);
    if (found && found.ch.length > 0) {
      found.exp = !found.exp;
      totalH = mmSubH(root, GAP);
      layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
      allN = collectMMNodes(root, []);
      allE = collectMMEdges(root, []);
      draw();
    }
  });
  canvas.addEventListener("mouseup", function() { isPan = false; });
  canvas.addEventListener("mouseleave", function() { isPan = false; hov = null; draw(); });
  canvas.addEventListener("dblclick", function() {
    scale = 1; tx = 0; ty = 0;
    if (totalH > H) { scale = Math.max(0.5, H / totalH * 0.9); tx = 10; ty = (H - totalH * scale) / 2; }
    draw();
  });
  var ro = new ResizeObserver(function() {
    var nw = wrap.clientWidth;
    var nh = wrap.clientHeight || canvas.clientHeight;
    var changed = false;
    if (nw > 0 && nw !== W) { W = nw; canvas.width = W; changed = true; }
    if (nh > 100 && nh !== H) {
      H = nh; canvas.height = H;
      totalH = mmSubH(root, GAP);
      layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
      allN = collectMMNodes(root, []);
      allE = collectMMEdges(root, []);
      if (totalH > H) { scale = Math.max(0.5, H / totalH * 0.9); tx = 10; ty = (H - totalH * scale) / 2; }
      changed = true;
    }
    if (changed) draw();
  });
  ro.observe(wrap);
}

// src/processor/knowledge-cards.ts
function generateKnowledgeCard(book, highlightIds, title, insight) {
  var card = {
    id: "kc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    title: title,
    insight: insight,
    sourceHighlightIds: highlightIds,
    bookId: book.bookId,
    bookTitle: book.title,
    tags: [],
    connections: [],
    createdAt: Date.now(),
    importance: 3
  };
  return card;
}
function buildKnowledgeExportMd(card, book) {
  var sources = [];
  if (book) {
    for (var i = 0; i < card.sourceHighlightIds.length; i++) {
      var h = book.highlights.find(function(x) { return x.id === card.sourceHighlightIds[i]; });
      if (h) sources.push(h);
    }
  }
  var lines = [
    "---",
    "type: knowledge",
    "source: \"" + (card.bookTitle || "").replace(/"/g, "'") + "\"",
    "created: " + new Date(card.createdAt).toISOString().slice(0, 10),
    "importance: " + card.importance,
    "tags: [" + card.tags.map(function(t) { return '"' + t + '"'; }).join(", ") + "]",
    "---",
    "",
    "# " + card.title,
    "",
    "## \u6838\u5FC3\u89C1\u89E3",
    "",
    card.insight,
    "",
    "## \u6765\u6E90\u6458\u5F55",
    ""
  ];
  for (var i = 0; i < sources.length; i++) {
    var s = sources[i];
    var typeTag = s.highlightType ? " [" + (HIGHLIGHT_TYPE_LABELS[s.highlightType] || s.highlightType) + "]" : "";
    lines.push("> " + s.content.slice(0, 200) + typeTag);
    if (s.note) lines.push("> \u2014\u2014 \u60F3\u6CD5: " + s.note);
    lines.push("");
  }
  lines.push("## \u76F8\u5173\u94FE\u63A5");
  lines.push("");
  lines.push("- [[" + (card.bookTitle || "unknown") + "]]");
  for (var i = 0; i < card.connections.length; i++) {
    var conn = card.connections[i];
    lines.push("- [[" + conn.targetTitle + "]] (" + conn.relation + ")");
  }
  lines.push("");
  return lines.join("\n");
}

// src/storage/vaultWriter.ts
function safeSegment(name) {
  const s = name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim().slice(0, 120);
  return s || "untitled";
}
function yamlEscape(s) {
  return JSON.stringify(s != null ? s : "");
}
function highlightFilename(h) {
  const slug = h.content.slice(0, 40).replace(/[\\/:*?"<>|]/g, "_").trim() || "note";
  return `${h.id.replace(/[^a-zA-Z0-9_-]/g, "_")}_${slug}.md`;
}
function bookWikilink(settings, book) {
  const seg = safeSegment(book.title);
  const rel = (0, import_obsidian3.normalizePath)(`${settings.booksBasePath}/${seg}/${seg}`);
  return rel;
}
async function upsertVaultFile(app, path, content) {
  const existingFile = app.vault.getAbstractFileByPath(path);
  if (existingFile instanceof import_obsidian3.TFile) {
    const prev = await app.vault.cachedRead(existingFile).catch(() => "");
    if (prev !== content) {
      await app.vault.modify(existingFile, content);
    }
  } else {
    await app.vault.create(path, content);
  }
}
async function writeBookToVault(app, settings, book) {
  const base = (0, import_obsidian3.normalizePath)(settings.booksBasePath);
  const folder = (0, import_obsidian3.normalizePath)(`${base}/${safeSegment(book.title)}`);
  await app.vault.createFolder(folder).catch(() => void 0);
  const hlFolder = (0, import_obsidian3.normalizePath)(`${folder}/highlights`);
  if (settings.atomicHighlights) {
    await app.vault.createFolder(hlFolder).catch(() => void 0);
  }
  const bookPath = (0, import_obsidian3.normalizePath)(`${folder}/${safeSegment(book.title)}.md`);
  const tree = buildChapterTree(book.highlights);
  const bw = bookWikilink(settings, book);
  let highlightsSection = "## \u6458\u5F55\u76EE\u5F55\n\n";
  if (book.highlights.length === 0) {
    highlightsSection += "> **ReadFlow**\uFF1A\u672A\u5199\u5165\u4EFB\u4F55\u5212\u7EBF/\u4E66\u8BC4\u6B63\u6587\u3002\u540C\u6B65\u5DF2\u4F1A\u81EA\u52A8\u5408\u5E76\u670D\u52A1\u7AEF `Set-Cookie`\uFF08\u4E0E Weread \u63D2\u4EF6\u540C\u7406\uFF0C\u7528\u4E8E\u4FEE\u590D /web \u4E66\u7B7E\u63A5\u53E3\uFF09\u3002\u82E5\u4ECD\u6709\u6B64\u4E66\u7B14\u8BB0\uFF1A\u8BF7 **\u518D\u70B9\u4E00\u6B21\u300C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u300D** \u6216\u7528 **\u684C\u9762\u300C\u6253\u5F00\u767B\u5F55\u300D** \u91CD\u767B\uFF1B\u5728 Obsidian \u5F00\u53D1\u8005\u5DE5\u5177 Console \u641C\u7D22 **`[ReadFlow] bookmarklist`** \u67E5\u770B `errCode` / `keys` \u8BCA\u65AD\u3002\n\n";
  }
  for (const node of tree) {
    highlightsSection += `### ${node.chapter}

`;
    for (const h of node.highlights) {
      if (settings.atomicHighlights) {
        const fn = highlightFilename(h);
        const linkPath = (0, import_obsidian3.normalizePath)(`${folder}/highlights/${fn}`).replace(/\.md$/, "");
        highlightsSection += `- [[${linkPath}]] \u2014 ${h.content.slice(0, 80)}${h.content.length > 80 ? "\u2026" : ""}
`;
        await writeAtomicHighlight(app, settings, hlFolder, linkPath, book, h);
      } else {
        highlightsSection += formatEmbeddedHighlight(book, h, bw);
      }
    }
    highlightsSection += "\n";
  }
  const inbox = book.highlights.filter((h) => h.status === "inbox");
  const inboxSection = "## \u672A\u6574\u7406\u6458\u5F55\n\n" + inbox.map((h) => `- (${h.id}) ${h.content.slice(0, 120)}${h.content.length > 120 ? "\u2026" : ""}
`).join("");
  const topicMindmap = buildTopicMindmap(book);
  const topicMindmapSection = topicMindmap ? `## \u4E3B\u9898\u8111\u56FE

${topicMindmap}
` : "";
  const topicStructureSection = buildTopicStructure(book);
  const coreInsightsSection = buildCoreInsights(book);
  const relationGraph = buildRelationsMermaid(book);
  const relationSection = relationGraph ? `## \u903B\u8F91\u5173\u7CFB

${relationGraph}
` : "## \u903B\u8F91\u5173\u7CFB\n\n- \u6682\u65E0\u53EF\u751F\u6210\u7684\u5173\u7CFB\u56FE\n";
  const meta = [
    "---",
    "type: book",
    `title: ${yamlEscape(book.title)}`,
    `author: ${yamlEscape(book.author)}`,
    "source: weread",
    "status: reading",
    "tags:",
    "  - Books",
    `book_id: ${yamlEscape(book.bookId)}`,
    `readflow_last_sync: ${book.lastSync}`,
    "---",
    "",
    `# ${book.title}`,
    "",
    "## \u5143\u6570\u636E",
    `- \u4F5C\u8005:: ${book.author}`,
    `- bookId:: \`${book.bookId}\``,
    `> \u4E66\u7C4D\u4E3B\u9875\u53CC\u94FE\u57FA\u5E95: [[${bw}]]`,
    "",
    topicStructureSection,
    "",
    topicMindmapSection,
    coreInsightsSection,
    "",
    "## \u7AE0\u8282\u7ED3\u6784",
    tree.map((n) => `- ${n.chapter}\uFF08${n.highlights.length}\uFF09`).join("\n"),
    "",
    relationSection,
    highlightsSection,
    inboxSection
  ].join("\n");
  await upsertVaultFile(app, bookPath, meta);
}
async function writeTopicKnowledgeToVault(app, settings, book, topic) {
  const topicName = topic.trim();
  const topicRows = book.highlights.filter((h) => (h.topic || "").trim() === topicName);
  if (topicRows.length === 0) {
    throw new Error(`No highlights found for topic: ${topicName}`);
  }
  const topicBook = {
    ...book,
    title: `${book.title} - ${topicName}`,
    highlights: topicRows
  };
  const base = (0, import_obsidian3.normalizePath)(settings.booksBasePath);
  const folder = (0, import_obsidian3.normalizePath)(`${base}/${safeSegment(book.title)}`);
  const topicsFolder = (0, import_obsidian3.normalizePath)(`${folder}/topics`);
  await app.vault.createFolder(folder).catch(() => void 0);
  await app.vault.createFolder(topicsFolder).catch(() => void 0);
  const bw = bookWikilink(settings, book);
  const topicPath = (0, import_obsidian3.normalizePath)(`${topicsFolder}/${safeSegment(topicName)}.md`);
  const relationGraph = buildRelationsMermaid(topicBook);
  const body = [
    "---",
    "type: topic",
    `title: ${yamlEscape(topicName)}`,
    `book: "[[${bw}]]"`,
    `book_id: ${yamlEscape(book.bookId)}`,
    `topic: ${yamlEscape(topicName)}`,
    `readflow_last_sync: ${Date.now()}`,
    "---",
    "",
    `# ${topicName}`,
    "",
    `- \u6765\u6E90\u4E66\u7C4D:: [[${bw}]]`,
    `- \u6458\u5F55\u6570\u91CF:: ${topicRows.length}`,
    "",
    buildTopicStructure(topicBook),
    "",
    "## \u4E3B\u9898\u8111\u56FE",
    "",
    buildTopicMindmap(topicBook) || "- \u6682\u65E0",
    "",
    "## \u903B\u8F91\u5173\u7CFB",
    "",
    relationGraph || "- \u6682\u65E0\u53EF\u751F\u6210\u7684\u5173\u7CFB\u56FE",
    "",
    buildCoreInsights(topicBook),
    "",
    "## \u4E3B\u9898\u6458\u5F55",
    "",
    ...topicRows.map((h) => `- ${h.content.slice(0, 120)}${h.content.length > 120 ? "\u2026" : ""}`),
    ""
  ].join("\n");
  await upsertVaultFile(app, topicPath, body);
  return topicPath;
}
function formatEmbeddedHighlight(book, h, bookLink) {
  const type = h.highlightType ? `\`[${h.highlightType}]\` ` : "";
  const tags = h.topic ? ` \u{1F3F7} ${h.topic}` : "";
  const linkNames = (h.links || []).map((p) => p.replace(/\.md$/i, "").split("/").pop() || p);
  const relationWikilinks = (h.relations || []).map((relation) => {
    const target = book.highlights.find((row) => row.id === relation.targetId);
    const targetExcerpt = ((target == null ? void 0 : target.content) || relation.targetId).slice(0, 60);
    const hint = relation.hint || "\u5173\u7CFB";
    const targetIdSafe = relation.targetId.replace(/[^a-zA-Z0-9]/g, "_");
    return `  - ${hint}:: [[${bookLink}#${targetIdSafe}|${targetExcerpt}\u2026]]`;
  }).join("\n");
  const links = linkNames.length > 0 ? `
  - \u5173\u8054: ${linkNames.map((n) => `[[${n}]]`).join(" ")}` : "";
  const relationLines = relationWikilinks ? `\u270F **\u903B\u8F91\u5173\u7CFB**
${relationWikilinks}
` : "";
  const hIdSafe = h.id.replace(/[^a-zA-Z0-9]/g, "_");
  return `- ${type}**\u6458\u5F55**${tags} ^${hIdSafe}

  > ${h.content.replace(/\n/g, "\n  > ")}

` + (h.note ? `  - \u60F3\u6CD5:: ${h.note}
` : "") + (relationLines ? `${relationLines}` : "") + links + `
  - \u4E66\u7C4D:: [[${bookLink}]]

`;
}
async function writeAtomicHighlight(app, settings, hlFolder, linkPathNoExt, book, h) {
  var _a, _b, _c;
  const fn = highlightFilename(h);
  const hlPath = (0, import_obsidian3.normalizePath)(`${hlFolder}/${fn}`);
  const bw = bookWikilink(settings, book);
  const lines = [
    "---",
    "type: highlight",
    `book: "[[${bw}]]"`,
    `book_id: ${yamlEscape(book.bookId)}`
  ];
  if (h.chapter) lines.push(`chapter: ${yamlEscape(h.chapter)}`);
  if (h.highlightType) lines.push(`highlight_type: ${h.highlightType}`);
  if (h.topic) lines.push(`topic: ${yamlEscape(h.topic)}`);
  lines.push(`status: ${h.status}`, `importance: ${h.importance}`, `created: ${h.createdAt}`, `source: ${h.sourceType}`, `id: ${yamlEscape(h.id)}`);
  if ((_a = h.links) == null ? void 0 : _a.length) {
    lines.push("links:");
    for (const l of h.links) lines.push(`  - "[[${l.replace(/\.md$/i, "")}]]"`);
  } else {
    lines.push("links: []");
  }
  if ((_b = h.relations) == null ? void 0 : _b.length) {
    lines.push("relations:");
    for (const relation of h.relations) {
      const target = book.highlights.find((row) => row.id === relation.targetId);
      const targetExcerpt = ((target == null ? void 0 : target.content) || relation.targetId).slice(0, 80);
      const targetIdSafe = relation.targetId.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`  - ${relation.hint}: [[${bw}#${targetIdSafe}|${targetExcerpt}]]`);
    }
  }
  lines.push(
    "---",
    "",
    "> " + h.content.replace(/\n/g, "\n> "),
    "",
    h.note ? "## \u6211\u7684\u60F3\u6CD5\n\n" + h.note + "\n\n" : "",
    ((_c = h.relations) == null ? void 0 : _c.length) ? "## \u6458\u5F55\u5173\u7CFB\n\n" + h.relations.map((relation) => {
      const target = book.highlights.find((row) => row.id === relation.targetId);
      return `- ${relation.hint} -> ${((target == null ? void 0 : target.content) || relation.targetId).slice(0, 80)}`;
    }).join("\n") + "\n\n" : "",
    "## AI \u63D0\u70BC",
    "",
    "_\uFF08v1 \u9884\u7559\uFF09_",
    "",
    "## \u76F8\u5173\u7B14\u8BB0",
    "",
    (h.links || []).map((p) => `- [[${p.replace(/\.md$/i, "")}]]`).join("\n") || "_\u6682\u65E0_",
    "",
    "## \u53EF\u6267\u884C\u884C\u52A8",
    "",
    "- ",
    "",
    "## \u7ED3\u6784\u4F4D\u7F6E",
    "",
    `- \u4E66\u7C4D:: [[${bw}]]`,
    ""
  );
  const body = lines.join("\n");
  await upsertVaultFile(app, hlPath, body);
}

// src/ui/HighlightPanelView.ts
var import_obsidian5 = require("obsidian");

// src/types.ts
var HIGHLIGHT_TYPE_LABELS = {
  idea: "\u89C2\u70B9",
  method: "\u65B9\u6CD5",
  example: "\u4F8B\u5B50",
  conclusion: "\u7ED3\u8BBA",
  question: "\u7591\u95EE"
};
var STATUS_LABELS = {
  inbox: "\u5F85\u6574\u7406",
  reviewing: "\u5DF2\u9605\u8BFB",
  drafted: "\u8349\u7A3F\u5B8C\u6210",
  processed: "\u5DF2\u5904\u7406"
};
var STATUS_COLORS = {
  inbox: "#f59e0b",
  reviewing: "#3b82f6",
  drafted: "#8b5cf6",
  processed: "#10b981"
};
var STATUS_FLOW = ["inbox", "reviewing", "drafted", "processed"];

module.exports = {
  VaultLinker,
  buildChapterTree,
  summarizeTopics,
  inferKnowledgeEdges,
  buildTopicMindmap,
  buildCoreInsights,
  parseContextAbstract,
  buildRelationsMermaid,
  generateKnowledgeCard,
  buildKnowledgeExportMd,
  writeBookToVault,
  HIGHLIGHT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_FLOW
};
