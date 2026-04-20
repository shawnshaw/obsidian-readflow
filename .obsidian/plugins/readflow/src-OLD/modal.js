// src/types.ts
var import_obsidian4 = require("obsidian");
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

// src/ui/QuickCaptureModal.ts

// src/processor/classifier.ts
function suggestHighlightType(text) {
  const t = text.slice(0, 500);
  if (/[？?]$|为什么|如何|怎么|是否|吗/.test(t)) return "question";
  if (/例如|比如|案例|实例/.test(t)) return "example";
  if (/步骤|方法|流程|首先|其次|最后/.test(t)) return "method";
  if (/因此|所以|总之|结论|意味着/.test(t)) return "conclusion";
  if (/认为|观点|主张|应该|必须/.test(t)) return "idea";
  return void 0;
}

// src/ui/textSimilarity.ts
function tokenizeLoose(text) {
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
function tokenOverlapScore(a, b) {
  const A = tokenizeLoose(a);
  const B = tokenizeLoose(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / Math.sqrt(A.size * B.size);
}

// src/ui/related.ts
function suggestRelatedHighlights(all, content, excludeId) {
  const scored = all.filter((h) => h.id !== excludeId).map((h) => ({ h, score: tokenOverlapScore(content, h.content) })).filter((x) => x.score > 0.08).sort((a, b) => b.score - a.score);
  return scored.map((x) => x.h);
}

// src/ui/QuickCaptureModal.ts
var QuickCaptureModal = class extends import_obsidian4.Modal {
  constructor(app, plugin, options, onSaved) {
    super(app);
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
    this.plugin = plugin;
    this.options = options;
    this.onSaved = onSaved;
  }
  onOpen() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    this.modalEl.addClass("readflow-modal-root");
    if (this.options.compactMode) this.modalEl.addClass("readflow-modal-root--compact");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("readflow-capture-modal");
    if (this.options.compactMode) contentEl.addClass("readflow-capture-modal--compact");
    const h = this.options.highlight;
    this.content = (_b = (_a = h == null ? void 0 : h.content) != null ? _a : this.options.initialContent) != null ? _b : "";
    this.note = (_c = h == null ? void 0 : h.note) != null ? _c : "";
    this.topic = (_d = h == null ? void 0 : h.topic) != null ? _d : "";
    this.entities = [...(_e = h == null ? void 0 : h.entities) != null ? _e : []];
    this.highlightType = (_g = (_f = h == null ? void 0 : h.highlightType) != null ? _f : suggestHighlightType(this.content)) != null ? _g : "";
    this.importance = (_h = h == null ? void 0 : h.importance) != null ? _h : 3;
    this.selectedLinks = [...(_i = h == null ? void 0 : h.links) != null ? _i : []];
    this.bookTitle = (_l = (_k = (_j = this.options.book) == null ? void 0 : _j.title) != null ? _k : this.options.manualBookTitle) != null ? _l : "";
    if (!this.highlightType && this.content) {
      this.highlightType = (_m = suggestHighlightType(this.content)) != null ? _m : "";
    }
    this.contextAbstract = (_a = this.options.initialContextAbstract) != null ? _a : ((_b = h == null ? void 0 : h.contextAbstract) != null ? _b : "");
    this.titleEl.setText(h ? "\u6574\u7406\u6458\u5F55" : this.options.compactMode ? "\u5FEB\u901F\u6458\u5F55" : "\u65B0\u6458\u5F55");
    const sourceSec = contentEl.createDiv("readflow-modal-section");
    sourceSec.createEl("h4", { text: "\u6765\u6E90\u4FE1\u606F" });
    new import_obsidian4.Setting(sourceSec).setName("\u4E66\u540D").addText((t) => {
      t.setValue(this.bookTitle).onChange((v) => this.bookTitle = v);
      t.setDisabled(!!this.options.book && !this.options.manualBookTitle);
    });
    new import_obsidian4.Setting(sourceSec).setName("\u539F\u6587 / \u6458\u5F55").addTextArea((ta) => {
      ta.setValue(this.content).onChange((v) => {
        var _a2;
        this.content = v;
        if (!this.options.highlight) {
          this.highlightType = (_a2 = suggestHighlightType(this.content)) != null ? _a2 : this.highlightType;
        }
        this.refreshAssistPanels();
      });
      ta.inputEl.rows = this.options.compactMode ? 3 : 5;
      ta.inputEl.style.width = "100%";
    });
    if (this.contextAbstract) {
      const ctxPreview = sourceSec.createDiv("readflow-capture-ctx-preview");
      const ctxHint = sourceSec.createEl("p", { text: "\u70B9\u51FB\u63D2\u5165\u4E0A\u4E0B\u6587", cls: "readflow-capture-ctx-hint" });
      const ctxLines = this.contextAbstract.split("\n");
      const mainLine = ctxLines.find((l) => l.length > 10) || ctxLines[0] || "";
      const mainIdx = ctxLines.indexOf(mainLine);
      for (let ci = 0; ci < ctxLines.length; ci++) {
        const line = ctxLines[ci];
        if (!line.trim()) continue;
        const isMain = ci === mainIdx && line === this.content;
        const el = ctxPreview.createEl("p", {
          text: (ci < mainIdx ? "\u2026" : "") + line.slice(0, 120) + (line.length > 120 ? "\u2026" : ""),
          cls: isMain ? "readflow-capture-ctx-main" : "readflow-capture-ctx-sub"
        });
        if (isMain) el.style.fontWeight = "600";
      }
      ctxPreview.addEventListener("click", () => {
        const raw = this.contextAbstract || "";
        const pos = raw.indexOf(this.content);
        const before = pos >= 0 ? raw.slice(0, pos) : raw;
        const after = pos >= 0 ? raw.slice(pos + this.content.length) : "";
        const toInsert = (before ? before.trimEnd() + "\n" : "") + this.content + (after ? "\n" + after.trimStart() : "");
        const cur = this.ta.value || "";
        this.ta.value = cur ? cur + "\n\n" + toInsert : toInsert;
        this.ta.dispatchEvent(new Event("input", { bubbles: true }));
        new import_obsidian4.Notice("\u5DF2\u63D2\u5165\u4E0A\u4E0B\u6587\u5230\u5907\u6CE8");
      });
    }
    const structureSec = contentEl.createDiv("readflow-modal-section");
    structureSec.createEl("h4", { text: "\u7ED3\u6784\u6574\u7406" });
    new import_obsidian4.Setting(structureSec).setName("\u7C7B\u578B").addDropdown((dd) => {
      dd.addOption("", "\uFF08\u672A\u9009\uFF09");
      Object.keys(HIGHLIGHT_TYPE_LABELS).forEach((k) => {
        dd.addOption(k, HIGHLIGHT_TYPE_LABELS[k]);
      });
      dd.setValue(this.highlightType).onChange((v) => {
        this.highlightType = v || "";
      });
    });
    const llmEnabled = this.plugin.settings.llmClassifier && this.plugin.settings.llmClassifier.enabled;
    if (llmEnabled) {
      const llmBtn = structureSec.createEl("button", { text: "\u{1F916} AI \u5206\u7C7B", type: "button" });
      llmBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      llmBtn.style.fontSize = "12px";
      llmBtn.addEventListener("click", async () => {
        if (!this.content.trim()) {
          new import_obsidian4.Notice("\u8BF7\u5148\u586B\u5199\u6458\u5F55\u5185\u5BB9");
          return;
        }
        llmBtn.disabled = true;
        llmBtn.textContent = "\u5206\u6790\u4E2D\u2026";
        const fakeH = { content: this.content, note: this.note };
        const bookTitle = this.options.book ? this.options.book.title : this.bookTitle;
        const type = await this.plugin.classifyHighlightWithLlm(fakeH, bookTitle);
        if (type && HIGHLIGHT_TYPE_LABELS[type]) {
          this.highlightType = type;
          const dropdownEl = structureSec.querySelector("select");
          if (dropdownEl) dropdownEl.value = type;
          new import_obsidian4.Notice(`\u2705 AI \u5206\u7C7B\u4E3A\uFF1A${HIGHLIGHT_TYPE_LABELS[type]}`);
        } else {
          new import_obsidian4.Notice("\u672A\u80FD\u5206\u6790\uFF0C\u8BF7\u68C0\u67E5 LLM \u914D\u7F6E");
        }
        llmBtn.disabled = false;
        llmBtn.textContent = "\u{1F916} AI \u5206\u7C7B";
      });
    }
    new import_obsidian4.Setting(structureSec).setName("\u4E3B\u9898\uFF08\u53EF\u9009\uFF09").addText((t) => {
      var _a2;
      t.setValue(this.topic).onChange((v) => this.topic = v);
      if (this.options.book) {
        const listId = `readflow-topic-list-${Date.now()}`;
        const datalist = structureSec.createEl("datalist");
        datalist.id = listId;
        const topics = [
          ...new Set(
            [...(_a2 = this.options.book.topicCatalog) != null ? _a2 : [], ...this.options.book.highlights.map((row) => (row.topic || "").trim())].filter(Boolean)
          )
        ];
        for (const topic of topics) {
          datalist.createEl("option", { value: topic });
        }
        t.inputEl.setAttribute("list", listId);
      }
    });
    new import_obsidian4.Setting(structureSec).setName("\u5B9E\u4F53\u6807\u7B7E\uFF08\u53EF\u9009\uFF09").setDesc("\u4EBA\u7269\u3001\u5730\u70B9\u3001\u4E8B\u4EF6\u3001\u6982\u5FF5\u7B49\uFF0C\u9017\u53F7\u5206\u9694\u3002\u7528\u4E8E\u4FE1\u606F\u578B\u9605\u8BFB\uFF08\u5982\u4EBA\u7269\u5173\u7CFB\u56FE\u8C31\uFF09").addText((t) => {
      t.setValue(this.entities.join(", ")).setPlaceholder("\u4F8B\uFF1A\u674E\u514B\u7528, \u592A\u539F, \u664B\u9633\u4E4B\u6218").onChange((v) => {
        this.entities = v.split(",").map((s) => s.trim()).filter(Boolean);
      });
      t.inputEl.style.width = "100%";
    });
    new import_obsidian4.Setting(structureSec).setName("\u60F3\u6CD5\uFF08\u53EF\u9009\uFF09").addTextArea((ta) => {
      ta.setValue(this.note).onChange((v) => {
        this.note = v;
        this.refreshAssistPanels();
      });
      ta.inputEl.rows = this.options.compactMode ? 2 : 3;
      ta.inputEl.style.width = "100%";
    });
    new import_obsidian4.Setting(structureSec).setName("\u91CD\u8981\u5EA6 1-5").addSlider((sl) => {
      sl.setLimits(1, 5, 1).setValue(this.importance).onChange((v) => {
        this.importance = v;
      });
    });
    this.linkSec = contentEl.createDiv("readflow-capture-links readflow-modal-section");
    this.relSec = contentEl.createDiv("readflow-capture-related readflow-modal-section");
    this.previewSec = contentEl.createDiv("readflow-capture-preview readflow-modal-section");
    this.refreshAssistPanels();
    const actions = contentEl.createDiv("readflow-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", type: "button" });
    cancelBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    cancelBtn.addEventListener("click", () => this.close());
    if (h) {
      const saveBtn = actions.createEl("button", { text: "\u4FDD\u5B58", type: "button" });
      saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
      saveBtn.addEventListener("click", () => void this.save(h.status, true));
    } else {
      const laterBtn = actions.createEl("button", { text: "\u7A0D\u540E", type: "button" });
      laterBtn.classList.add("readflow-btn", "readflow-btn--ghost");
      laterBtn.addEventListener("click", () => void this.save("inbox", true));
      const structureBtn = actions.createEl("button", { text: "\u52A0\u5165\u7ED3\u6784", type: "button" });
      structureBtn.classList.add("readflow-btn", "readflow-btn--primary");
      structureBtn.addEventListener("click", () => void this.save("processed", true));
    }
  }
  refreshSuggestions(container) {
    container.empty();
    container.createEl("h4", { text: "\u5173\u8054\u7B14\u8BB0\uFF08\u5019\u9009\uFF09" });
    this.suggestions = this.plugin.linker.suggestForText(this.content, 3);
    if (this.suggestions.length === 0) {
      container.createEl("p", {
        text: "\u65E0\u5019\u9009\uFF0C\u53EF\u5148\u6267\u884C\u547D\u4EE4\u300CReadFlow: \u91CD\u5EFA\u5173\u8054\u7D22\u5F15\u300D",
        cls: "readflow-muted"
      });
      return;
    }
    for (const s of this.suggestions) {
      const row = container.createDiv("readflow-suggest-row");
      const short = s.path.split("/").pop() || s.path;
      row.createEl("span", { text: `${short}  (${(s.score * 100).toFixed(0)}%)` });
      const active = this.selectedLinks.includes(s.path);
      const b = row.createEl("button", { text: active ? "\u5DF2\u9009" : "\u5173\u8054", type: "button" });
      b.classList.add("readflow-btn", "readflow-btn--sm");
      b.classList.add(active ? "readflow-btn--primary" : "readflow-btn--secondary");
      b.addEventListener("click", () => {
        if (this.selectedLinks.includes(s.path)) {
          this.selectedLinks = this.selectedLinks.filter((p) => p !== s.path);
        } else {
          this.selectedLinks.push(s.path);
        }
        this.refreshSuggestions(container);
      });
    }
  }
  refreshRelated(container) {
    var _a;
    container.empty();
    container.createEl("h4", { text: "\u540C\u4E66\u6458\u5F55\uFF08\u5173\u952E\u8BCD\u76F8\u8FD1\uFF09" });
    if (!this.options.book) {
      container.createEl("p", { text: "\u5F53\u524D\u672A\u5339\u914D\u5230\u4E66\u7C4D\uFF0C\u4FDD\u5B58\u540E\u53EF\u5728\u5DE5\u4F5C\u53F0\u7EE7\u7EED\u6574\u7406\u3002", cls: "readflow-muted" });
      return;
    }
    this.relatedFromBook = suggestRelatedHighlights(
      this.options.book.highlights,
      this.content,
      (_a = this.options.highlight) == null ? void 0 : _a.id
    ).slice(0, this.options.compactMode ? 3 : 5);
    if (this.relatedFromBook.length === 0) {
      container.createEl("p", { text: "\u6682\u65E0\u76F8\u8FD1\u6761\u76EE", cls: "readflow-muted" });
      return;
    }
    for (const rh of this.relatedFromBook) {
      const row = container.createDiv("readflow-related-row");
      row.createEl("span", {
        text: rh.content.slice(0, 100) + (rh.content.length > 100 ? "\u2026" : "")
      });
    }
  }
  refreshPreview(container) {
    container.empty();
    container.createEl("h4", { text: "\u5173\u7CFB\u9884\u89C8" });
    const sourceText = this.content.trim();
    const noteText = this.note.trim();
    const relatedRows = this.relatedFromBook.slice(0, 3);
    const linkedRows = this.selectedLinks.slice(0, 3);
    if (!sourceText && relatedRows.length === 0 && linkedRows.length === 0) {
      container.createEl("p", { text: "\u8F93\u5165\u6458\u5F55\u5185\u5BB9\u540E\uFF0C\u8FD9\u91CC\u4F1A\u751F\u6210\u5173\u7CFB\u8349\u56FE\u3002", cls: "readflow-muted" });
      return;
    }
    const graph = container.createDiv("readflow-graph-preview");
    const sourceCol = graph.createDiv("readflow-graph-source");
    const sourceNode = sourceCol.createDiv("readflow-graph-node readflow-graph-node--primary");
    sourceNode.createEl("span", { text: "\u5F53\u524D\u6458\u5F55", cls: "readflow-graph-node-label" });
    sourceNode.createEl("strong", {
      text: sourceText ? `${sourceText.slice(0, 56)}${sourceText.length > 56 ? "\u2026" : ""}` : "\u7B49\u5F85\u8F93\u5165\u5185\u5BB9",
      cls: "readflow-graph-node-title"
    });
    if (noteText) {
      sourceNode.createEl("p", {
        text: `\u60F3\u6CD5\uFF1A${noteText.slice(0, 56)}${noteText.length > 56 ? "\u2026" : ""}`,
        cls: "readflow-graph-node-subtitle"
      });
    }
    const edgeCol = graph.createDiv("readflow-graph-edges");
    for (const related of relatedRows) {
      const row = edgeCol.createDiv("readflow-graph-edge");
      row.createEl("span", { text: "\u8865\u5145", cls: "readflow-graph-edge-tag" });
      row.createEl("span", { text: "\u2192", cls: "readflow-graph-edge-arrow" });
      const node = row.createDiv("readflow-graph-node");
      node.createEl("span", { text: related.chapter || "\u76F8\u5173\u6458\u5F55", cls: "readflow-graph-node-label" });
      node.createEl("strong", {
        text: `${related.content.slice(0, 44)}${related.content.length > 44 ? "\u2026" : ""}`,
        cls: "readflow-graph-node-title"
      });
    }
    for (const linkPath of linkedRows) {
      const row = edgeCol.createDiv("readflow-graph-edge");
      row.createEl("span", { text: "\u5173\u8054", cls: "readflow-graph-edge-tag readflow-graph-edge-tag--soft" });
      row.createEl("span", { text: "\u2192", cls: "readflow-graph-edge-arrow" });
      const node = row.createDiv("readflow-graph-node");
      const name = linkPath.replace(/\.md$/i, "").split("/").pop() || linkPath;
      node.createEl("span", { text: "\u5E93\u5185\u7B14\u8BB0", cls: "readflow-graph-node-label" });
      node.createEl("strong", { text: name, cls: "readflow-graph-node-title" });
    }
    if (edgeCol.childElementCount === 0) {
      const empty = edgeCol.createDiv("readflow-graph-empty");
      empty.setText("\u6682\u65E0\u81EA\u52A8\u5173\u7CFB\uFF0C\u4FDD\u5B58\u540E\u53EF\u5728\u5DE5\u4F5C\u53F0\u7EE7\u7EED\u8865\u5145\u3002");
    }
  }
  refreshAssistPanels() {
    if (this.linkSec) this.refreshSuggestions(this.linkSec);
    if (this.relSec) this.refreshRelated(this.relSec);
    if (this.previewSec) this.refreshPreview(this.previewSec);
  }
  save(nextStatus, keepOpen) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (!this.content.trim()) {
      new import_obsidian4.Notice("\u8BF7\u586B\u5199\u6458\u5F55\u5185\u5BB9");
      return;
    }
    let bookId = (_b = (_a = this.options.book) == null ? void 0 : _a.bookId) != null ? _b : "";
    if (!bookId) {
      if (!this.bookTitle.trim()) {
        new import_obsidian4.Notice("\u8BF7\u586B\u5199\u4E66\u540D");
        return;
      }
      bookId = `manual-${safeManualId(this.bookTitle)}`;
    }
    const prev = this.options.highlight;
    const h = {
      id: (_c = prev == null ? void 0 : prev.id) != null ? _c : `rf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bookId,
      content: this.content.trim(),
      note: this.note.trim() || void 0,
      chapter: prev == null ? void 0 : prev.chapter,
      chapterUid: prev == null ? void 0 : prev.chapterUid,
      highlightType: this.highlightType || void 0,
      topic: this.topic.trim() || void 0,
      entities: this.entities.length ? [...this.entities] : void 0,
      links: this.selectedLinks.length ? [...this.selectedLinks] : void 0,
      status: (_d = nextStatus != null ? nextStatus : prev == null ? void 0 : prev.status) != null ? _d : "inbox",
      importance: this.importance,
      createdAt: (_e = prev == null ? void 0 : prev.createdAt) != null ? _e : Date.now(),
      sourceType: (_f = prev == null ? void 0 : prev.sourceType) != null ? _f : "manual",
      relationHints: prev == null ? void 0 : prev.relationHints,
      relations: prev == null ? void 0 : prev.relations,
      wereadRange: prev == null ? void 0 : prev.wereadRange,
      wereadBookmarkId: prev == null ? void 0 : prev.wereadBookmarkId,
      wereadReviewId: prev == null ? void 0 : prev.wereadReviewId,
      contextAbstract: this.contextAbstract || void 0
    };
    let book = (_g = this.options.book) != null ? _g : this.plugin.diskData.books[bookId];
    if (!book) {
      book = {
        bookId,
        title: this.bookTitle.trim(),
        author: "",
        highlights: [],
        lastSync: Date.now()
      };
    }
    const others = book.highlights.filter((x) => x.id !== h.id);
    book = { ...book, highlights: [...others, h], lastSync: Date.now() };
    if ((_h = h.topic) == null ? void 0 : _h.trim()) {
      book.topicCatalog = [.../* @__PURE__ */ new Set([...(_i = book.topicCatalog) != null ? _i : [], h.topic.trim()])];
    }
    this.plugin.diskData.books[book.bookId] = book;
    if (this.bookTitle.trim() && !this.options.book) {
      book.title = this.bookTitle.trim();
    }
    const doClose = !keepOpen;
    void this.plugin.persistDisk().then(() => {
      this.onSaved(h);
      new import_obsidian4.Notice("\u5DF2\u4FDD\u5B58\u6458\u5F55");
      if (doClose) {
        this.close();
      } else {
        // 清空表单，继续添加
        this.content = "";
        this.note = "";
        this.topic = "";
        this.entities = [];
        this.highlightType = "";
        this.importance = 3;
        this.selectedLinks = [];
        this.contextAbstract = "";
        this.onOpen();
      }
    });
  }
};
function safeManualId(title) {
  return title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_").slice(0, 40);
}

module.exports = {
  HIGHLIGHT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_FLOW,
  suggestHighlightType,
  suggestRelatedHighlights,
  QuickCaptureModal,
  safeManualId
};
