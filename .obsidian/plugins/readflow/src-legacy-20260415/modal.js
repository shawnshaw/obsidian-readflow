/*
 * ReadFlow - QuickCaptureModal
 * 快速摘录弹窗：新增 / 整理单条摘录
 */

import {
  HIGHLIGHT_TYPE_LABELS, TYPE_ACCENT_COLOR,
  STATUS_FLOW, STATUS_LABELS, STATUS_COLORS
} from "./constants.js";

var QuickCaptureModal = (function() {
  function QuickCaptureModal(app, plugin, options, onSaved) {
    this.content = "";
    this.bookTitle = "";
    this.note = "";
    this.topic = "";
    this.entities = [];
    this.highlightType = "";
    this.importance = 3;
    this.selectedLinks = [];
    this.suggestions = [];
    this.relatedFromBook = [];
    this.linkSec = null;
    this.relSec = null;
    this.previewSec = null;
    this.contextAbstract = "";
    this.app = app;
    this.plugin = plugin;
    this.options = options;
    this.onSaved = onSaved;
  }

  QuickCaptureModal.prototype.onOpen = function() {
    var self = this;
    var ObsidianLib = require("obsidian");
    this.modalEl.addClass("readflow-modal-root");
    if (this.options.compactMode) this.modalEl.addClass("readflow-modal-root--compact");

    var contentEl = this.contentEl;
    contentEl.empty();
    contentEl.addClass("readflow-capture-modal");
    if (this.options.compactMode) contentEl.addClass("readflow-capture-modal--compact");

    var h = this.options.highlight;
    this.content = (h && h.content) || this.options.initialContent || "";
    this.note = (h && h.note) || "";
    this.topic = (h && h.topic) || "";
    this.entities = (h && h.entities) ? h.entities.slice() : [];
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    this.highlightType = (h && h.highlightType) || (this.options.initialContent ? suggestHighlightType(this.content) : "");
    this.importance = (h && h.importance) || 3;
    this.selectedLinks = (h && h.links) ? h.links.slice() : [];
    this.bookTitle = ((_a = this.options.book) && this.options.book.title) ||
      this.options.manualBookTitle || "";
    this.contextAbstract = this.options.initialContextAbstract ||
      ((h && h.contextAbstract) || "");

    this.titleEl.setText(h ? "\u6574\u7406\u6458\u5F55" :
      (this.options.compactMode ? "\u5FEB\u901F\u6458\u5F55" : "\u65B0\u6458\u5F55"));

    // --- 来源信息 ---
    var sourceSec = contentEl.createDiv("readflow-modal-section");
    sourceSec.createEl("h4", { text: "\u6765\u6E90\u4FE1\u606F" });

    new ObsidianLib.Setting(sourceSec).setName("\u4E66\u540D").addText(function(t) {
      t.setValue(self.bookTitle).onChange(function(v) { self.bookTitle = v; });
      t.setDisabled(!!self.options.book && !self.options.manualBookTitle);
    });

    new ObsidianLib.Setting(sourceSec).setName("\u539F\u6587 / \u6458\u5F55").addTextArea(function(ta) {
      ta.setValue(self.content).onChange(function(v) {
        self.content = v;
        if (!self.options.highlight) {
          var autoType = suggestHighlightType(self.content);
          if (autoType) self.highlightType = autoType;
        }
        self.refreshAssistPanels();
      });
      ta.inputEl.rows = self.options.compactMode ? 3 : 5;
      ta.inputEl.style.width = "100%";
      self.ta = ta;
    });

    // 上下文预览
    if (this.contextAbstract) {
      var ctxPreview = sourceSec.createDiv("readflow-capture-ctx-preview");
      var ctxHint = sourceSec.createEl("p", { text: "\u70B9\u51FB\u63D2\u5165\u4E0A\u4E0B\u6587", cls: "readflow-capture-ctx-hint" });
      var ctxLines = this.contextAbstract.split("\n");
      var mainLine = ctxLines.find(function(l) { return l.length > 10; }) || ctxLines[0] || "";
      var mainIdx = ctxLines.indexOf(mainLine);
      ctxLines.forEach(function(line, ci) {
        if (!line.trim()) return;
        var isMain = ci === mainIdx;
        var el = ctxPreview.createEl("p", {
          text: (ci < mainIdx ? "\u2026" : "") + line.slice(0, 120) + (line.length > 120 ? "\u2026" : ""),
          cls: isMain ? "readflow-capture-ctx-main" : "readflow-capture-ctx-sub"
        });
        if (isMain) el.style.fontWeight = "600";
      });
      ctxPreview.addEventListener("click", function() {
        var raw = self.contextAbstract || "";
        var pos = raw.indexOf(self.content);
        var before = pos >= 0 ? raw.slice(0, pos) : raw;
        var after = pos >= 0 ? raw.slice(pos + self.content.length) : "";
        var toInsert = (before ? before.trimEnd() + "\n" : "") + self.content + (after ? "\n" + after.trimStart() : "");
        var cur = self.ta.value || "";
        self.ta.value = cur ? cur + "\n\n" + toInsert : toInsert;
        self.ta.dispatchEvent(new Event("input", { bubbles: true }));
        new ObsidianLib.Notice("\u5DF2\u63D1\u5165\u4E0A\u4E0B\u6587\u5230\u5907\u6CE8");
      });
    }

    // --- 结构整理 ---
    var structureSec = contentEl.createDiv("readflow-modal-section");
    structureSec.createEl("h4", { text: "\u7ED3\u6784\u6574\u7406" });

    new ObsidianLib.Setting(structureSec).setName("\u7C7B\u578B").addDropdown(function(dd) {
      dd.addOption("", "(\u672A\u9009)");
      Object.keys(HIGHLIGHT_TYPE_LABELS).forEach(function(k) {
        dd.addOption(k, HIGHLIGHT_TYPE_LABELS[k]);
      });
      dd.setValue(self.highlightType).onChange(function(v) { self.highlightType = v || ""; });
    });

    new ObsidianLib.Setting(structureSec).setName("\u4E3B\u9898\uFF08\u53EF\u9009\uFF09").addText(function(t) {
      t.setValue(self.topic).onChange(function(v) { self.topic = v; });
      if (self.options.book) {
        var listId = "readflow-topic-list-" + Date.now();
        var datalist = structureSec.createEl("datalist");
        datalist.id = listId;
        var topics = [
          ...new Set([
            ...((_b = self.options.book.topicCatalog) != null ? _b : []),
            ...self.options.book.highlights.map(function(row) { return (row.topic || "").trim(); })
          ]).values()
        ].filter(Boolean);
        topics.forEach(function(topic) {
          datalist.createEl("option", { value: topic });
        });
        t.inputEl.setAttribute("list", listId);
      }
    });

    new ObsidianLib.Setting(structureSec).setName("\u5B9E\u4F53\u6807\u7B7E\uFF08\u53EF\u9009\uFF09")
      .setDesc("\u4EBA\u7269\u3001\u5730\u70B9\u3001\u4E8B\u4EF6\u3001\u6982\u5FF5\u7B49\uFF0C\u9017\u53F7\u5206\u9694\u3002")
      .addText(function(t) {
        t.setValue(self.entities.join(", ")).setPlaceholder("\u4F8B\uFF1A\u674E\u514B\u7528, \u592A\u539F, \u664B\u9633\u4E4B\u6218")
          .onChange(function(v) { self.entities = v.split(",").map(function(s) { return s.trim(); }).filter(Boolean); });
        t.inputEl.style.width = "100%";
      });

    new ObsidianLib.Setting(structureSec).setName("\u91CD\u8981\u5EA6")
      .addSlider(function(s) {
        s.setValue(self.importance).setLimits(1, 5, 1)
          .onChange(function(v) { self.importance = v; });
        s.setDynamicTooltip();
      });

    // --- 想法 ---
    var ideaSec = contentEl.createDiv("readflow-modal-section");
    ideaSec.createEl("h4", { text: "\u6211\u7684\u60F3\u6CD5" });
    new ObsidianLib.Setting(ideaSec).setName("\u60F3\u6CD5 / \u7B14\u8BB0").addTextArea(function(ta) {
      ta.setValue(self.note).onChange(function(v) { self.note = v; });
      ta.inputEl.rows = self.options.compactMode ? 2 : 4;
      ta.inputEl.style.width = "100%";
    });

    // --- 关联 ---
    var linkSec = contentEl.createDiv("readflow-modal-section readflow-capture-links-section");
    linkSec.createEl("h4", { text: "\u5173\u8054\u7B14\u8BB0" });
    var linkList = linkSec.createDiv("readflow-link-list");
    linkList.style.maxHeight = "120px";
    linkList.style.overflowY = "auto";
    linkList.createEl("p", { text: "\u7B49\u5F85\u8F93\u5165\u5185\u5BB9\u540E\u81EA\u52A8\u63D0\u793A\u2026", cls: "readflow-muted" });
    this.linkSec = linkList;

    // --- 同书关联 ---
    var relSec = contentEl.createDiv("readflow-modal-section");
    relSec.createEl("h4", { text: "\u540C\u4E66\u6458\u5F55\uFF08\u5173\u952E\u8BCD\u76F8\u8FD1\uFF09" });
    var relList = relSec.createDiv("readflow-related-list");
    relList.createEl("p", { text: "\u6682\u65E0\u76F8\u5173\u6458\u5F55", cls: "readflow-muted" });
    this.relSec = relList;

    // --- 辅助面板 ---
    this.refreshAssistPanels();

    // --- 预览 ---
    var previewSec = contentEl.createDiv("readflow-modal-section");
    previewSec.createEl("h4", { text: "\u5173\u7CFB\u9884\u89C8" });
    var previewWrap = previewSec.createDiv("readflow-graph-preview");
    previewWrap.createEl("p", { text: "\u8F93\u5165\u6458\u5F55\u5185\u5BB9\u540E\uFF0C\u8FD9\u91CC\u4F1A\u751F\u6210\u5173\u7CFB\u8349\u56FE\u3002", cls: "readflow-muted" });
    this.previewSec = previewWrap;

    // --- 保存按钮 ---
    var actions = contentEl.createDiv("readflow-modal-actions");
    var saveBtn = actions.createEl("button", { text: "\u4FDD\u5B58\u5E76\u7EE7\u7EED\u6DFB\u52A0", type: "button" });
    saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
    saveBtn.style.marginRight = "8px";
    saveBtn.addEventListener("click", function() { self.save(void 0, true); });

    if (!h) {
      var quickStatus = actions.createEl("button", { text: "\u2192 \u5F85\u6574\u7406", type: "button" });
      quickStatus.classList.add("readflow-btn", "readflow-btn--ghost");
      quickStatus.style.color = STATUS_COLORS["inbox"];
      quickStatus.addEventListener("click", function() { self.save("inbox"); });
    }

    var closeBtn = actions.createEl("button", { text: "\u5173\u95ED", type: "button" });
    closeBtn.classList.add("readflow-btn", "readflow-btn--secondary");
    closeBtn.addEventListener("click", function() { self.close(); });
  };

  QuickCaptureModal.prototype.refreshAssistPanels = function() {
    if (this.linkSec) this.refreshSuggestions(this.linkSec);
    if (this.relSec) this.refreshRelated(this.relSec);
    if (this.previewSec) this.refreshPreview(this.previewSec);
  };

  QuickCaptureModal.prototype.refreshSuggestions = function(container) {
    var self = this;
    container.empty();
    if (!this.content.trim()) {
      container.createEl("p", { text: "\u7B49\u5F85\u8F93\u5165\u5185\u5BB9\u540E\u81EA\u52A8\u63D0\u793A\u2026", cls: "readflow-muted" });
      return;
    }
    this.plugin.linker.search(this.content, 5).then(function(results) {
      self.suggestions = results;
      container.empty();
      if (results.length === 0) {
        container.createEl("p", { text: "\u6682\u65E0\u76F8\u5173\u7B14\u8BB0", cls: "readflow-muted" });
        return;
      }
      results.forEach(function(s) {
        var row = container.createDiv("readflow-link-row");
        var short = s.path.split("/").pop() || s.path;
        row.createEl("span", { text: short + "  (" + (s.score * 100).toFixed(0) + "%)" });
        var active = self.selectedLinks.includes(s.path);
        var b = row.createEl("button", { text: active ? "\u5DF2\u9009" : "\u5173\u8054", type: "button" });
        b.classList.add("readflow-btn", "readflow-btn--sm");
        b.classList.add(active ? "readflow-btn--primary" : "readflow-btn--secondary");
        b.addEventListener("click", function() {
          if (self.selectedLinks.includes(s.path)) {
            self.selectedLinks = self.selectedLinks.filter(function(p) { return p !== s.path; });
          } else {
            self.selectedLinks.push(s.path);
          }
          self.refreshSuggestions(container);
        });
      });
    }).catch(function() {
      container.empty();
      container.createEl("p", { text: "\u68C0\u7D22\u5931\u8D25", cls: "readflow-muted" });
    });
  };

  QuickCaptureModal.prototype.refreshRelated = function(container) {
    var self = this;
    container.empty();
    if (!this.options.book) {
      container.createEl("p", { text: "\u5F53\u524D\u672A\u5339\u914D\u5230\u4E66\u7C4D\uFF0C\u4FDD\u5B58\u540E\u53EF\u5728\u5DE5\u4F5C\u53F7\u7EE7\u7EED\u6574\u7406\u3002", cls: "readflow-muted" });
      return;
    }
    var related = suggestRelatedHighlights(this.options.book.highlights, this.content,
      this.options.highlight && this.options.highlight.id).slice(0, this.options.compactMode ? 3 : 5);
    if (related.length === 0) {
      container.createEl("p", { text: "\u6682\u65E0\u76F8\u8FD1\u6761\u76EE", cls: "readflow-muted" });
      return;
    }
    this.relatedFromBook = related;
    related.forEach(function(rh) {
      var row = container.createDiv("readflow-related-row");
      row.createEl("span", { text: rh.content.slice(0, 100) + (rh.content.length > 100 ? "\u2026" : "") });
    });
  };

  QuickCaptureModal.prototype.refreshPreview = function(container) {
    var self = this;
    container.empty();
    var sourceText = this.content.trim();
    var noteText = this.note.trim();
    var relatedRows = this.relatedFromBook ? this.relatedFromBook.slice(0, 3) : [];
    var linkedRows = this.selectedLinks.slice(0, 3);
    if (!sourceText && relatedRows.length === 0 && linkedRows.length === 0) {
      container.createEl("p", { text: "\u8F93\u5165\u6458\u5F55\u5185\u5BB9\u540E\uFF0C\u8FD9\u91CC\u4F1A\u751F\u6210\u5173\u7CFB\u8349\u56FE\u3002", cls: "readflow-muted" });
      return;
    }
    var graph = container.createDiv("readflow-graph-preview");
    var sourceCol = graph.createDiv("readflow-graph-source");
    var sourceNode = sourceCol.createDiv("readflow-graph-node readflow-graph-node--primary");
    sourceNode.createEl("span", { text: "\u5F53\u524D\u6458\u5F55", cls: "readflow-graph-node-label" });
    sourceNode.createEl("strong", {
      text: sourceText ? (sourceText.slice(0, 56) + (sourceText.length > 56 ? "\u2026" : "")) : "\u7B49\u5F85\u8F93\u5165\u5185\u5BB9",
      cls: "readflow-graph-node-title"
    });
    if (noteText) {
      sourceNode.createEl("p", { text: "\u60F3\u6CD5\uFF1A" + noteText.slice(0, 56) + (noteText.length > 56 ? "\u2026" : ""), cls: "readflow-graph-node-subtitle" });
    }
    var edgeCol = graph.createDiv("readflow-graph-edges");
    relatedRows.forEach(function(related) {
      var row = edgeCol.createDiv("readflow-graph-edge");
      row.createEl("span", { text: "\u8865\u5145", cls: "readflow-graph-edge-tag" });
      row.createEl("span", { text: "\u2192", cls: "readflow-graph-edge-arrow" });
      var node = row.createDiv("readflow-graph-node");
      node.createEl("span", { text: related.chapter || "\u76F8\u5173\u6458\u5F55", cls: "readflow-graph-node-label" });
      node.createEl("strong", { text: related.content.slice(0, 44) + (related.content.length > 44 ? "\u2026" : ""), cls: "readflow-graph-node-title" });
    });
    linkedRows.forEach(function(linkPath) {
      var row = edgeCol.createDiv("readflow-graph-edge");
      row.createEl("span", { text: "\u5173\u8054", cls: "readflow-graph-edge-tag readflow-graph-edge-tag--soft" });
      row.createEl("span", { text: "\u2192", cls: "readflow-graph-edge-arrow" });
      var node = row.createDiv("readflow-graph-node");
      var name = linkPath.replace(/\.md$/i, "").split("/").pop() || linkPath;
      node.createEl("span", { text: "\u5E93\u5185\u7B14\u8BB0", cls: "readflow-graph-node-label" });
      node.createEl("strong", { text: name, cls: "readflow-graph-node-title" });
    });
    if (edgeCol.childElementCount === 0) {
      edgeCol.createDiv("readflow-graph-empty").setText("\u6682\u65E0\u81EA\u52A8\u5173\u7CFB\uFF0C\u4FDD\u5B58\u540E\u53EF\u5728\u5DE5\u4F5C\u53F8\u7EE7\u7EED\u8865\u5145\u3002");
    }
  };

  QuickCaptureModal.prototype.save = function(nextStatus, keepOpen) {
    var self = this;
    var ObsidianLib = require("obsidian");
    if (!this.content.trim()) {
      new ObsidianLib.Notice("\u8BF7\u586B\u5199\u6458\u5F55\u5185\u5BB9");
      return;
    }
    var bookId = (this.options.book && this.options.book.bookId) || "";
    if (!bookId) {
      if (!this.bookTitle.trim()) {
        new ObsidianLib.Notice("\u8BF7\u586B\u5199\u4E66\u540D");
        return;
      }
      bookId = "manual-" + safeManualId(this.bookTitle);
    }
    var prev = this.options.highlight;
    var h = {
      id: (prev && prev.id) || ("rf-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8)),
      bookId: bookId,
      content: this.content.trim(),
      note: this.note.trim() || void 0,
      chapter: (prev && prev.chapter) || void 0,
      chapterUid: (prev && prev.chapterUid) || void 0,
      highlightType: this.highlightType || void 0,
      topic: this.topic.trim() || void 0,
      entities: this.entities.length ? this.entities.slice() : void 0,
      links: this.selectedLinks.length ? this.selectedLinks.slice() : void 0,
      status: (nextStatus != null ? nextStatus : (prev && prev.status)) || "inbox",
      importance: this.importance,
      createdAt: (prev && prev.createdAt) || Date.now(),
      sourceType: (prev && prev.sourceType) || "manual",
      relationHints: (prev && prev.relationHints) || void 0,
      relations: (prev && prev.relations) || void 0,
      wereadRange: (prev && prev.wereadRange) || void 0,
      wereadBookmarkId: (prev && prev.wereadBookmarkId) || void 0,
      wereadReviewId: (prev && prev.wereadReviewId) || void 0,
      contextAbstract: this.contextAbstract || void 0
    };
    var book = this.options.book || this.plugin.diskData.books[bookId];
    if (!book) {
      book = {
        bookId: bookId,
        title: this.bookTitle.trim(),
        author: "",
        highlights: [],
        lastSync: Date.now()
      };
    }
    var others = book.highlights.filter(function(x) { return x.id !== h.id; });
    book = Object.assign(Object.assign({}, book), {
      highlights: [].concat(others, [h]),
      lastSync: Date.now()
    });
    if (h.topic && h.topic.trim()) {
      var _a;
      book.topicCatalog = [
        ...new Set([].concat((_a = book.topicCatalog) != null ? _a : [], [h.topic.trim()]))
      ];
    }
    this.plugin.diskData.books[book.bookId] = book;
    if (this.bookTitle.trim() && !this.options.book) {
      book.title = this.bookTitle.trim();
    }
    var doClose = !keepOpen;
    this.plugin.persistDisk().then(function() {
      self.onSaved(h);
      new ObsidianLib.Notice("\u5DF2\u4FDD\u5B58\u6458\u5F55");
      if (doClose) {
        self.close();
      } else {
        // \u6E05\u7A7A\u8868\u5355\uFF0C\u7EE7\u7EED\u6DFb\u52A0
        self.content = "";
        self.note = "";
        self.topic = "";
        self.entities = [];
        self.highlightType = "";
        self.importance = 3;
        self.selectedLinks = [];
        self.contextAbstract = "";
        // \u91CD\u7ED8\u8868\u5355
        self.onOpen();
      }
    });
  };

  return QuickCaptureModal;
})();

module.exports = QuickCaptureModal;
