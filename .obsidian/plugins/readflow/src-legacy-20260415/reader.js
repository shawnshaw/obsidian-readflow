/*
 * ReadFlow - Local Reader Modal
 * 本地阅读模式：按章节浏览摘录卡片，可快速进入整理
 */

import { HIGHLIGHT_TYPE_LABELS } from "./constants.js";

function buildChapterTree(highlights) {
  var byChapter = new Map();
  for (var i = 0; i < highlights.length; i++) {
    var h = highlights[i];
    var key = h.chapter || "\u672A\u5206\u7AE0";
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key).push(h);
  }
  var result = [];
  byChapter.forEach(function(hl, chapter) {
    result.push({
      chapter: chapter,
      chapterUid: hl[0] && hl[0].chapterUid,
      highlights: hl.slice().sort(function(a, b) { return a.createdAt - b.createdAt; })
    });
  });
  return result;
}

function openLocalReaderModal(app, plugin, view, scopeBook) {
  var ObsidianLib = require("obsidian");
  var modal = new ObsidianLib.Modal(app);
  modal.titleEl.setText(scopeBook.title + " \u2014 \u8BFB\u8BFA\u6A21\u5F0F");
  modal.modalEl.addClass("readflow-modal-root", "readflow-reader-modal");
  var contentEl = modal.contentEl;
  contentEl.empty();
  contentEl.addClass("readflow-reader-modal-body");

  // 章节选择导航
  var navBar = contentEl.createDiv("readflow-reader-nav");
  var chapters = buildChapterTree(scopeBook.highlights);
  var chapterSelect = navBar.createEl("select", { cls: "readflow-reader-chapter-select" });
  chapterSelect.createEl("option", { value: "", text: "\u2014\u9009\u62E9\u7AE0\u8282\u2014" });
  for (var i = 0; i < chapters.length; i++) {
    var ch = chapters[i];
    chapterSelect.createEl("option", { value: String(ch.chapterUid || ch.chapter), text: ch.chapter + " (" + ch.highlights.length + "\u6761)" });
  }

  // 内容区
  var contentArea = contentEl.createDiv("readflow-reader-content");
  var hint = contentArea.createDiv("readflow-reader-hint");
  hint.createEl("p", { text: "\u9009\u62E9\u4E0A\u65B9\u7AE0\u8282\u540E\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u641C\u7D22\u672C\u5730\u6587\u4EF6\u4E2D\u7684\u7AE0\u8282\u5185\u5BB9\uFF0C\u5E76\u5728\u6B63\u6587\u4E2D\u9AD8\u4EAE\u60A8\u7684\u6458\u5F55\u3002", cls: "readflow-muted" });

  var hlHighlight = contentArea.createDiv("readflow-reader-highlights");
  var hlHead = hlHighlight.createDiv("readflow-reader-hl-head");
  hlHead.createEl("h4", { text: "\u5F53\u524D\u7AE0\u8282\u6458\u5F55", cls: "readflow-reader-hl-title" });
  var hlList = hlHighlight.createDiv("readflow-reader-hl-list");

  var QuickCaptureModal = require("./modal.js");

  function loadChapter(chapterName) {
    hlList.empty();
    var chHighlights = scopeBook.highlights.filter(function(h) { return (h.chapter || "") === chapterName; });
    if (chHighlights.length === 0) {
      hlList.createEl("p", { text: "\u6B64\u7AE0\u8282\u6682\u65E0\u6458\u5F55", cls: "readflow-muted" });
      return;
    }
    var ObsidianLib2 = require("obsidian");
    for (var i = 0; i < chHighlights.length; i++) {
      var h = chHighlights[i];
      var row = hlList.createDiv("readflow-card");
      row.createDiv("readflow-card-body").setText(h.content);
      var meta = row.createDiv("readflow-card-meta");
      if (h.highlightType) meta.createSpan({ cls: "readflow-chip readflow-chip--accent", text: h.highlightType });
      if (h.note) {
        var noteEl = row.createDiv("readflow-card-note");
        noteEl.createEl("span", { text: "\u60F3\u6CD5", cls: "readflow-card-note-label" });
        noteEl.createEl("p", { text: h.note, cls: "readflow-card-note-text" });
      }
      var captureBtn = row.createDiv("readflow-card-actions").createEl("button", {
        text: "\u523A\u4E3E\u6458\u5F55",
        type: "button",
        cls: "readflow-btn readflow-btn--primary readflow-btn--sm"
      });
      captureBtn.addEventListener("click", function() {
        new QuickCaptureModal(app, plugin, { book: scopeBook, highlight: h, compactMode: false }, function() {
          void plugin.persistDisk();
          view.render();
        }).open();
      });
    }
  }

  chapterSelect.addEventListener("change", function() {
    if (chapterSelect.value) {
      var optText = chapterSelect.options[chapterSelect.selectedIndex].text;
      var chName = optText.replace(/ \(.*?\)$/, "");
      loadChapter(chName);
    }
  });

  modal.open();
}

export {
  buildChapterTree,
  openLocalReaderModal
};
