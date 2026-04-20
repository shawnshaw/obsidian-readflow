// ===== panel (QuickCaptureModal + reader/context/render) =====

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
      saveBtn.addEventListener("click", () => void this.save(h.status));
    } else {
      const laterBtn = actions.createEl("button", { text: "\u7A0D\u540E", type: "button" });
      laterBtn.classList.add("readflow-btn", "readflow-btn--ghost");
      laterBtn.addEventListener("click", () => void this.save("inbox"));
      const structureBtn = actions.createEl("button", { text: "\u52A0\u5165\u7ED3\u6784", type: "button" });
      structureBtn.classList.add("readflow-btn", "readflow-btn--primary");
      structureBtn.addEventListener("click", () => void this.save("processed"));
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
  save(nextStatus) {
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
    void this.plugin.persistDisk().then(() => {
      this.onSaved(h);
      new import_obsidian4.Notice("\u5DF2\u4FDD\u5B58\u6458\u5F55");
      this.close();
    });
  }
};
function safeManualId(title) {
  return title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_").slice(0, 40);
}

// src/ui/HighlightPanelView.ts
var READFLOW_VIEW_TYPE = "readflow-highlight-panel";
var RELATION_HINT_OPTIONS = ["\u8865\u5145", "\u91CD\u590D", "\u56E0\u679C", "\u5BF9\u6BD4"];
function bookRecencyTimestamp(b) {
  if (b.lastSync && b.lastSync > 0) return b.lastSync;
  let maxH = 0;
  for (const h of b.highlights) {
    if (h.createdAt > maxH) maxH = h.createdAt;
  }
  return maxH;
}
var HighlightPanelView = class extends import_obsidian5.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.selectedChapter = null;
    this.onlyInbox = false;
    this.selectedTopic = null;
    this.selectedHighlightIds = /* @__PURE__ */ new Set();
    this.listOrderMode = "time";
    this.selectedKnowledgeTopic = null;
    this.sidebarCollapsed = localStorage.getItem("readflow.sidebarCollapsed") === "true";
    this.topbarMinimized = localStorage.getItem("readflow.topbarMinimized") === "true";
    this.topicSectionCollapsed = localStorage.getItem("readflow.topicCollapsed") !== "false";
    this.boardSectionCollapsed = localStorage.getItem("readflow.boardCollapsed") !== "false";
    this.listDetached = false;
    this.detachedPanel = null;
    this.selectedBoardFilter = null;
    this.searchQuery = "";
    this.listContainerEl = null;
    this.listSummaryEl = null;
    this.currentBook = null;
    this.currentTree = null;
    this.bookSortMode = localStorage.getItem("readflow.bookSort") === "name" ? "name" : "recent";
    this.bookSortTimeDir = localStorage.getItem("readflow.bookSortTimeDir") === "asc" ? "asc" : "desc";
    this.bookSortNameDir = localStorage.getItem("readflow.bookSortNameDir") === "desc" ? "desc" : "asc";
    this.expandedHighlightId = null;
    this.hoverTimeoutId = null;
    this.hoverCardId = null;
  }
  getViewType() {
    return READFLOW_VIEW_TYPE;
  }
  getDisplayText() {
    return "ReadFlow";
  }
  getIcon() {
    return "book-open";
  }




// ===== view (HighlightPanelView) =====
