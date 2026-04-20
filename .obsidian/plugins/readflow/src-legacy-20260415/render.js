/*
 * ReadFlow - Knowledge Rendering (MindMap, Mermaid, Cards)
 * 脑图生成、Mermaid、关联建议、知识结晶
 */

import { HIGHLIGHT_TYPE_LABELS } from "./constants.js";

// ===================== Mind Map 布局 =====================
function buildTopicMindmap(book) {
  var topics = {};
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    if (!h.topic && !h.highlightType) continue;
    var key = h.topic || h.highlightType || "\u672A\u5206\u7C7B";
    if (!topics[key]) topics[key] = [];
    topics[key].push(h);
  }
  var lines = ["graph TD"];
  for (var key in topics) {
    var items = topics[key];
    lines.push("  " + safeNode(key) + "(\"\u300C" + key + "\u300D)");
    for (var j = 0; j < Math.min(items.length, 5); j++) {
      lines.push("  " + safeNode(key) + " --> " + safeNode(key + "_" + j) + "(\"" + mermaidEscape(items[j].content) + "\")");
    }
    if (items.length > 5) {
      lines.push("  " + safeNode(key) + " -.-> " + safeNode(key + "_more") + "(\"\u2026\u8FD8\u6709 " + (items.length - 5) + " \u6761\")");
    }
  }
  lines.push("");
  return lines.join("\n");
}

function safeNode(s) {
  return s.replace(/[^a-zA-Z0-9_\u4e00-\u9fff]/g, "_").slice(0, 32);
}

function mermaidEscape(s) {
  if (!s) return "";
  return s.replace(/"/g, "\\\"").replace(/\n/g, " ").replace(/\\/g, "\\\\").slice(0, 80);
}

function inferKnowledgeEdges(book) {
  var edges = [];
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    if (!h.relations) continue;
    for (var j = 0; j < h.relations.length; j++) {
      edges.push({ sourceId: h.id, targetId: h.relations[j].targetId, hint: h.relations[j].hint });
    }
  }
  return edges;
}

function buildRelationsMermaid(book) {
  var edges = inferKnowledgeEdges(book);
  if (edges.length === 0) return "";
  var byId = new Map();
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    byId.set(h.id, h);
  }
  var lines = ["flowchart LR"];
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var source = byId.get(edge.sourceId);
    var target = byId.get(edge.targetId);
    if (!source || !target) continue;
    lines.push("  " + safeNode(edge.sourceId) + "(\"" + mermaidEscape(shortLabel(source.content, 26)) + "\") --> " + safeNode(edge.targetId) + "(\"" + mermaidEscape(shortLabel(target.content, 26)) + "\")");
  }
  return lines.join("\n");
}

function buildCoreInsights(book) {
  if (!book.highlights.length) return "";
  var byType = {};
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    var key = h.highlightType || "\u672A\u5206\u7C7B";
    if (!byType[key]) byType[key] = [];
    byType[key].push(h);
  }
  var lines = ["mindmap"];
  for (var key in byType) {
    lines.push("  root(\"" + key + "\")");
    var items = byType[key].slice(0, 6);
    for (var i = 0; i < items.length; i++) {
      lines.push("    " + mermaidEscape(shortLabel(items[i].content, 40)));
    }
  }
  return lines.join("\n");
}

function shortLabel(text, maxLen) {
  if (!text) return "";
  var raw = text.trim().replace(/\s+/g, " ");
  if (raw.length <= maxLen) return raw;
  return raw.slice(0, maxLen - 1) + "\u2026";
}

// ===================== Canvas MindMap 渲染（Obsidian Canvas 节点）=====================
function renderMindMapCanvas(container, book, options) {
  var ObsidianLib = require("obsidian");
  var canvasEl = container.createDiv("readflow-mm-canvas");
  canvasEl.style.minHeight = "160px";
  canvasEl.style.padding = "12px 16px";
  var label = canvasEl.createDiv("readflow-mm-hint");
  label.setText("\u6682\u65E0\u6458\u5F55\u6570\u636E\uFF0C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u540E\u81EA\u52A8\u751F\u6210\u811A\u56FE");
  label.style.cssText = "color:var(--rf-text-muted);font-size:12px;text-align:center;padding:40px 0";
}

// ===================== 类型建议 =====================
function suggestHighlightType(content) {
  if (!content) return "";
  var trimmed = content.trim().toLowerCase();
  if (/^[\u4e00-\u9fa5]{2,}[\uff1a\uff1f\uff01](.+)/.test(trimmed)) {
    var first = trimmed.match(/^[\u4e00-\u9fa5]{2,}/);
    if (first && first[0].length >= 3) return "insight";
  }
  if (/\u3010|\u3011|\u300c|\u300d|\u300e|\u300f|\u201c|\u201d/.test(content)) return "quote";
  if (/\u56e0\u6b3e|\u539f\u56e0|\u539f\u7406/.test(trimmed)) return "concept";
  if (/\u5982\u679c|\u5c31\u662f|\u90a3\u4e48|\u53ef\u4ee5|\u5e94\u8be5/.test(trimmed)) return "method";
  if (/\u4f8b\u5b50|\u6848\u4f8b|\u4f60\u770b|\u73b0\u5b9e/.test(trimmed)) return "case_study";
  if (/\u600e\u4e48\u529e|\u600e\u4e48\u505a|\u5982\u4f55\u505a|\u600e\u4e48\u8bf4/.test(trimmed)) return "action";
  if (/\u6709\u4e9b\u4eba|\u6709\u4e9b\u4e8b|\u4f60\u53ef\u80fd|\u6211\u8003\u8651/.test(trimmed)) return "question";
  if (/^\d+[\uff0c.\u3001]/.test(trimmed)) return "data";
  return "";
}

// ===================== 同书关联建议 =====================
function scorePair(a, b) {
  if (!a.content || !b.content) return 0;
  var words = a.content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  var otherWords = b.content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  var overlap = 0;
  for (var i = 0; i < words.length; i++) {
    for (var j = 0; j < otherWords.length; j++) {
      if (words[i] === otherWords[j]) overlap++;
    }
  }
  if (overlap >= 3) return 0.9;
  if (overlap === 2) return 0.6;
  if (overlap === 1) return 0.3;
  if (a.highlightType && a.highlightType === b.highlightType) return 0.15;
  if (a.topic && a.topic === b.topic) return 0.1;
  return 0;
}

function suggestRelatedHighlights(highlights, query, excludeId) {
  var scored = [];
  for (var i = 0; i < highlights.length; i++) {
    var h = highlights[i];
    if (!h.content || h.id === excludeId) continue;
    var score = scorePair({ content: query }, h);
    if (score > 0.1) scored.push({ highlight: h, score: score });
  }
  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.map(function(s) { return s.highlight; });
}

// ===================== 知识结晶 =====================
function buildKnowledgeCards(book) {
  var cards = [];
  var byTopic = {};
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    if (!h.topic) continue;
    if (!byTopic[h.topic]) byTopic[h.topic] = [];
    byTopic[h.topic].push(h);
  }
  for (var topic in byTopic) {
    var items = byTopic[topic];
    if (items.length < 2) continue;
    var typeCounts = {};
    var typeExamples = {};
    for (var i = 0; i < items.length; i++) {
      var h = items[i];
      var key = h.highlightType || "\u672A\u5206\u7C7B";
      if (!typeCounts[key]) typeCounts[key] = 0;
      if (!typeExamples[key]) typeExamples[key] = [];
      typeCounts[key]++;
      if (typeExamples[key].length < 3) typeExamples[key].push(h.content.slice(0, 80));
    }
    cards.push({
      id: "kc-" + Date.now() + "-" + topic.replace(/\s/g, "_").slice(0, 20),
      bookId: book.bookId,
      topic: topic,
      typeCounts: typeCounts,
      insight: items.length + " \u6761\u6458\u5F55\uFF0C" + Object.keys(typeCounts).length + " \u79CD\u7C7B\u578B\uFF0C\u5173\u952E\u8BCD\u76F8\u8FD1\uFF1A" + Object.keys(typeCounts).join(", "),
      examples: typeExamples,
      createdAt: Date.now()
    });
  }
  return cards;
}

// ===================== Vault 写入 =====================
async function writeBookToVault(app, settings, book) {
  var path = settings.booksBasePath + "/" + book.title + ".md";
  var existing = await app.vault.adapter.exists(path);
  var lines = [
    "---",
    "bookId: " + book.bookId,
    "title: \"" + book.title + "\"",
    "author: \"" + (book.author || "") + "\"",
    "lastSync: " + new Date().toISOString(),
    "---",
    "",
    "# " + book.title,
    "",
    "## \u7EFA\u8981",
    "",
    "| \u7C7B\u578B | \u6570\u91CF |",
    "|------|------|"
  ];
  var typeCounts = {};
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    var key = h.highlightType || "\u672A\u5206\u7C7B";
    typeCounts[key] = (typeCounts[key] || 0) + 1;
  }
  for (var key in typeCounts) {
    lines.push("| " + key + " | " + typeCounts[key] + " |");
  }
  lines.push("", "## \u6458\u5F55", "");
  var byChapter = {};
  for (var i = 0; i < book.highlights.length; i++) {
    var h = book.highlights[i];
    var ch = h.chapter || "\u672A\u5206\u7AE0";
    if (!byChapter[ch]) byChapter[ch] = [];
    byChapter[ch].push(h);
  }
  for (var ch in byChapter) {
    lines.push("### " + ch);
    for (var j = 0; j < byChapter[ch].length; j++) {
      var h2 = byChapter[ch][j];
      lines.push("- [" + h2.highlightType + "] " + h2.content);
      if (h2.note) lines.push("  - \u60F3\u6CD5\uFF1A" + h2.note);
    }
    lines.push("");
  }
  var front = lines.join("\n");
  if (existing) {
    var old = await app.vault.readRaw(path);
    var sep = "\n## \u672C\u5730\u6458\u5F55\n";
    var pos = old.indexOf(sep);
    if (pos !== -1) old = old.slice(0, pos);
    await app.vault.adapter.write(path, old + "\n" + front);
  } else {
    await app.vault.create(path, front);
  }
}

export {
  buildTopicMindmap, safeNode, mermaidEscape,
  inferKnowledgeEdges, buildRelationsMermaid, buildCoreInsights,
  renderMindMapCanvas,
  suggestHighlightType,
  scorePair, suggestRelatedHighlights,
  buildKnowledgeCards,
  writeBookToVault
};
