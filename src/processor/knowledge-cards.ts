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

