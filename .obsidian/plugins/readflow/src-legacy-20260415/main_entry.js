// ===== plugin entry =====

openWereadLogin() {
    var _a;
    (_a = this.wereadLogin) == null ? void 0 : _a.dispose();
    this.wereadLogin = new WereadLoginWindow(this);
    void this.wereadLogin.open();
  }
  async loadStorage() {
    var _a, _b, _c, _d;
    const raw = (_a = await this.loadData()) != null ? _a : {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (_b = raw.settings) != null ? _b : {});
    this.diskData = {
      version: 1,
      books: { ...(_c = raw.books) != null ? _c : {} },
      lastSyncAt: raw.lastSyncAt,
      knowledgeCards: [...((_d = raw.knowledgeCards) != null ? _d : [])]
    };
    var migrated = false;
    for (var bid in this.diskData.books) {
      var b = this.diskData.books[bid];
      if (!b || !b.highlights) continue;
      for (var i = 0; i < b.highlights.length; i++) {
        var h = b.highlights[i];
        var patch = {};
        if (h.note && h.content && h.note.trim() === h.content.trim()) {
          patch.note = void 0;
        }
        if (!h.wereadReviewId && h.id && h.id.startsWith("weread-rv-")) {
          patch.wereadReviewId = h.id.slice("weread-rv-".length);
        }
        if (Object.keys(patch).length > 0) {
          b.highlights[i] = { ...h, ...patch };
          migrated = true;
        }
      }
    }
    if (migrated) {
      console.log("[ReadFlow] migrated: fixed note/reviewId for", Object.keys(this.diskData.books).length, "books");
      await this.persistDisk();
    }
  }
  async persistDisk() {
    const payload = {
      settings: this.settings,
      version: 1,
      books: this.diskData.books,
      lastSyncAt: this.diskData.lastSyncAt,
      knowledgeCards: this.diskData.knowledgeCards || []
    };
    await this.saveData(payload);
  }
  /** 兼容设置页命名 */
  async saveSettings() {
    await this.persistDisk();
  }
  /**
   * 在中间主工作区打开新标签（与普通笔记同级），不使用左侧 Ribbon、不占用右侧边栏。
   */
  async openPanel() {
    const existing = this.app.workspace.getLeavesOfType(READFLOW_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: READFLOW_VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
  refreshReadFlowViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(READFLOW_VIEW_TYPE)) {
      const v = leaf.view;
      if (v instanceof HighlightPanelView) {
        v.refresh();
      }
    }
  }
  /**
   * Obsidian 公共 d.ts 未导出 `app.plugins`，运行时存在（与社区插件热重载写法一致）。
   */
  async reloadSelf() {
    const id = this.manifest.id;
    const plugins = this.app.plugins;
    try {
      await Promise.resolve(plugins.disablePlugin(id));
      await Promise.resolve(plugins.enablePlugin(id));
      new import_obsidian7.Notice("ReadFlow \u5DF2\u91CD\u65B0\u52A0\u8F7D");
    } catch (e) {
      console.error("[ReadFlow] reloadSelf", e);
      new import_obsidian7.Notice("\u91CD\u8F7D\u5931\u8D25\uFF1A\u8BF7\u5728\u300C\u8BBE\u7F6E \u2192 \u7B2C\u4E09\u65B9\u63D2\u4EF6\u300D\u4E2D\u624B\u52A8\u5173\u95ED\u518D\u5F00\u542F ReadFlow");
    }
  }
  async pushHighlightNote(bookId, highlight) {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      return { ok: false, reason: "\u672A\u914D\u7F6E\u5FAE\u4FE1\u8BFB\u4E66 Cookie" };
    }
    if (!highlight.note || (!highlight.wereadRange && !highlight.wereadReviewId)) {
      return { ok: false, reason: "\u7F3A\u5C11\u60F3\u6CD5\u6216\u5B9A\u4F4D\u4FE1\u606F" };
    }
    const cookieRef = { value: cookie };
    const result = await pushNoteToWeread(cookieRef, highlight);
    if (cookieRef.value !== this.settings.wereadCookie) {
      this.settings.wereadCookie = cookieRef.value;
    }
    if (result.ok && result.reviewId) {
      const cached = this.diskData.books[bookId];
      if (cached) {
        this.diskData.books[bookId] = {
          ...cached,
          highlights: cached.highlights.map((h) =>
            h.id === highlight.id ? { ...h, wereadReviewId: result.reviewId } : h
          )
        };
        await this.persistDisk();
      }
    }
    return result;
  }
  async pushBatchNotes(bookId) {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      new import_obsidian7.Notice("\u8BF7\u5148\u914D\u7F6E\u5FAE\u4FE1\u8BFB\u4E66 Cookie");
      return { pushed: 0, failed: 0, skipped: 0 };
    }
    const cached = this.diskData.books[bookId];
    if (!cached) return { pushed: 0, failed: 0, skipped: 0 };
    const pushable = cached.highlights.filter(
      (h) => h.sourceType === "weread" && h.note && (h.wereadRange || h.wereadReviewId)
    );
    if (pushable.length === 0) {
      new import_obsidian7.Notice("\u6CA1\u6709\u53EF\u63A8\u9001\u7684\u60F3\u6CD5");
      return { pushed: 0, failed: 0, skipped: 0 };
    }
    const cookieRef = { value: cookie };
    let pushed = 0, failed = 0;
    const progress = new import_obsidian7.Notice(`\u63A8\u9001\u4E2D 0/${pushable.length}\u2026`, 18e4);
    for (let i = 0; i < pushable.length; i++) {
      const h = pushable[i];
      progress.setMessage(`\u63A8\u9001\u4E2D ${i + 1}/${pushable.length}\u2026`);
      const res = await pushNoteToWeread(cookieRef, h);
      if (res.ok) {
        pushed++;
        if (res.reviewId) {
          cached.highlights = cached.highlights.map((x) =>
            x.id === h.id ? { ...x, wereadReviewId: res.reviewId } : x
          );
        }
      } else {
        failed++;
        console.warn("[ReadFlow] push failed for", h.id, res);
      }
      if (i < pushable.length - 1) {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      }
    }
    if (cookieRef.value !== this.settings.wereadCookie) {
      this.settings.wereadCookie = cookieRef.value;
    }
    this.diskData.books[bookId] = cached;
    await this.persistDisk();
    progress.hide();
    new import_obsidian7.Notice(
      `\u63A8\u9001\u5B8C\u6210\uFF1A\u6210\u529F ${pushed}\uFF0C\u5931\u8D25 ${failed}\uFF0C\u5171 ${pushable.length} \u6761`
    );
    return { pushed, failed, skipped: cached.highlights.length - pushable.length };
  }
  async syncWereadAll(forceFull = false) {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      new import_obsidian7.Notice("\u8BF7\u5148\u5728 ReadFlow \u8BBE\u7F6E\u4E2D\u586B\u5199\u5FAE\u4FE1\u8BFB\u4E66 Cookie");
      return;
    }
    const progress = new import_obsidian7.Notice(forceFull ? "\u5FAE\u4FE1\u8BFB\u4E66\u5168\u91CF\u91CD\u5237\u4E2D\uFF0C\u8BF7\u7A0D\u5019\u2026" : "\u5FAE\u4FE1\u8BFB\u4E66\u540C\u6B65\u4E2D\uFF0C\u8BF7\u7A0D\u5019\u2026", 18e4);
    this.setSyncStatus(forceFull ? "ReadFlow\uFF1A\u5168\u91CF\u91CD\u5237\u4E2D\u2026" : "ReadFlow\uFF1A\u540C\u6B65\u4E2D\u2026");
    try {
      const cookieRef = { value: cookie };
      const result = await syncAllBooksWithNotes(
        cookieRef,
        (id) => this.diskData.books[id],
        forceFull,
        (event) => this.updateSyncProgress(progress, event, forceFull)
      );
      const books = result.books;
      if (cookieRef.value !== this.settings.wereadCookie) {
        this.settings.wereadCookie = cookieRef.value;
      }
      for (const b of books) {
        this.diskData.books[b.bookId] = b;
      }
      this.diskData.lastSyncAt = Date.now();
      await this.persistDisk();
      let written = 0;
      let failed = 0;
      for (const b of books) {
        try {
          await writeBookToVault(this.app, this.settings, b);
          written++;
        } catch (e) {
          failed++;
          console.error("[ReadFlow] \u843D\u76D8\u5931\u8D25", b.title, e);
        }
      }
      progress.hide();
      const base = this.settings.booksBasePath || "Books";
      if (result.scanned === 0) {
        this.setSyncStatus("ReadFlow\uFF1A\u672A\u53D1\u73B0\u53EF\u540C\u6B65\u4E66\u7C4D");
        new import_obsidian7.Notice(
          `ReadFlow\uFF1A\u672A\u62C9\u53D6\u5230\u6709\u5212\u7EBF/\u60F3\u6CD5\u7684\u4E66\uFF08\u5FAE\u4FE1\u8BFB\u4E66\u91CC noteCount \u4E3A 0 \u7684\u4F1A\u8DF3\u8FC7\uFF09\u3002\u53EF\u5728\u9762\u677F\u624B\u52A8\u6458\u5F55\u3002`
        );
      } else if (books.length === 0) {
        this.setSyncStatus(
          forceFull ? "ReadFlow\uFF1A\u672C\u6B21\u5168\u91CF\u91CD\u5237\u76EE\u6807\u4E3A\u7A7A" : `ReadFlow\uFF1A\u540C\u6B65\u5B8C\u6210\uFF0C\u626B\u63CF ${result.scanned} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C`
        );
        new import_obsidian7.Notice(
          forceFull ? `ReadFlow\uFF1A\u672A\u5237\u65B0\u4EFB\u4F55\u4E66\uFF0C\u5F53\u524D\u76EE\u6807\u4E3A\u7A7A\u3002` : `ReadFlow\uFF1A\u672C\u6B21\u672A\u53D1\u73B0\u53D8\u5316\uFF0C\u5171\u626B\u63CF ${result.scanned} \u672C\uFF0C\u5DF2\u8DF3\u8FC7 ${result.skipped} \u672C\u3002`
        );
      } else {
        this.setSyncStatus(
          forceFull ? `ReadFlow\uFF1A\u5168\u91CF\u91CD\u5237\u5B8C\u6210\uFF0C\u66F4\u65B0 ${result.synced} \u672C` : `ReadFlow\uFF1A\u540C\u6B65\u5B8C\u6210\uFF0C\u66F4\u65B0 ${result.synced} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C`
        );
        new import_obsidian7.Notice(
          forceFull ? `ReadFlow\uFF1A\u5DF2\u5168\u91CF\u91CD\u5237 ${books.length} \u672C\uFF1B\u5DF2\u5199\u5165\u300C${base}/\u300D\uFF1A${written} \u672C${failed ? `\uFF0C\u5931\u8D25 ${failed} \u672C\uFF08\u770B\u63A7\u5236\u53F0\uFF09` : ""}` : `ReadFlow\uFF1A\u5DF2\u540C\u6B65 ${result.synced} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C\uFF1B\u5DF2\u5199\u5165\u300C${base}/\u300D\uFF1A${written} \u672C${failed ? `\uFF0C\u5931\u8D25 ${failed} \u672C\uFF08\u770B\u63A7\u5236\u53F0\uFF09` : ""}`
        );
      }
      this.refreshReadFlowViews();
    } catch (e) {
      console.error("[ReadFlow] sync", e);
      progress.hide();
      this.setSyncStatus("ReadFlow\uFF1A\u540C\u6B65\u5931\u8D25");
      new import_obsidian7.Notice("\u540C\u6B65\u5931\u8D25\uFF08\u68C0\u67E5 Cookie \u4E0E\u7F51\u7EDC\uFF09");
    }
  }
  setSyncStatus(text) {
    var _a;
    (_a = this.syncStatusEl) == null ? void 0 : _a.setText(text);
  }
  updateSyncProgress(progress, event, forceFull) {
    var _a;
    const modeLabel = forceFull ? "\u5168\u91CF" : "\u5E38\u89C4";
    const text = event.phase === "scan" ? `ReadFlow\uFF1A${modeLabel}\u540C\u6B65\u51C6\u5907\u5B8C\u6210\uFF0C\u626B\u63CF ${event.scanned} \u672C\uFF0C\u5F85\u540C\u6B65 ${event.total} \u672C\uFF0C\u8DF3\u8FC7 ${event.skipped} \u672C` : `ReadFlow\uFF1A${modeLabel}\u540C\u6B65\u5DF2\u5B8C\u6210 ${event.synced}/${event.total} \xB7 ${(_a = event.title) != null ? _a : "\u672A\u547D\u540D\u4E66\u7C4D"}`;
    this.setSyncStatus(text);
    this.setNoticeMessage(progress, text.replace(/^ReadFlow：/, ""));
  }
  setNoticeMessage(progress, text) {
    const target = progress;
    if (typeof target.setMessage === "function") {
      target.setMessage(text);
      return;
    }
    const container = target.noticeEl;
    if (!container) return;
    const messageEl = container.querySelector(".notice-content");
    if (messageEl instanceof HTMLElement) {
      messageEl.setText(text);
    }
  }
  async captureFromEditorSelection(editor) {
    const selected = editor.getSelection().trim();
    if (!selected) {
      new import_obsidian7.Notice("\u8BF7\u5148\u9009\u4E2D\u8981\u6458\u5F55\u7684\u6587\u672C");
      return;
    }
    this.hideSelectionCaptureButton();
    const sel = editor.listSelections()[0];
    const lineNo = sel ? editor.doc.lineNumber(sel.anchor) + 1 : 1;
    this.openQuickCapture(selected, editor, lineNo);
  }
  openQuickCapture(selected, editor, lineNo) {
    const activeFile = this.app.workspace.getActiveFile();
    const matchedBook = this.resolveBookFromFile(activeFile);
    const manualBookTitle = matchedBook ? void 0 : activeFile == null ? void 0 : activeFile.basename;
    var initialContextAbstract = "";
    if (editor && activeFile) {
      try {
        const lineCount = editor.lineCount();
        var effectiveLineNo = lineNo != null ? lineNo : 1;
        if (lineNo == null && editor.listSelections && editor.listSelections().length) {
          var sel = editor.listSelections()[0];
          if (sel) effectiveLineNo = (editor.doc.lineNumber ? editor.doc.lineNumber(sel.anchor) : sel.anchor.line) + 1;
        }
        const start = Math.max(1, effectiveLineNo - 4);
        const end = Math.min(lineCount, effectiveLineNo + 2);
        const lines = [];
        for (let i = start; i <= end; i++) {
          lines.push(editor.getLine(i));
        }
        const rawContext = lines.join("\n");
        const idx = rawContext.indexOf(selected);
        if (idx >= 0) {
          const before = rawContext.slice(0, idx).trim();
          const after = rawContext.slice(idx + selected.length).trim();
          initialContextAbstract = (before ? "\u2026" + before.slice(-120) + "\n" : "") + selected + (after ? "\n" + after.slice(0, 120) + "\u2026" : "");
        }
      } catch (_) {
        initialContextAbstract = "";
      }
    }
    new QuickCaptureModal(
      this.app,
      this,
      {
        book: matchedBook,
        initialContent: selected,
        manualBookTitle,
        initialContextAbstract,
        compactMode: true
      },
      (h) => {
        const latestBook = this.diskData.books[h.bookId];
        if (latestBook) {
          void writeBookToVault(this.app, this.settings, latestBook).catch((e) => {
            console.error("[ReadFlow] capture write", e);
          });
        }
        this.refreshReadFlowViews();
      }
    ).open();
  }
  updateSelectionCaptureButton() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      this.hideSelectionCaptureButton();
      return;
    }
    const text = selection.toString().trim();
    if (!text) {
      this.hideSelectionCaptureButton();
      return;
    }
    const host = this.getSelectionHostElement(selection);
    if (!host || !this.isCaptureSelectionHost(host)) {
      this.hideSelectionCaptureButton();
      return;
    }
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this.hideSelectionCaptureButton();
      return;
    }
    const button = this.ensureSelectionCaptureButton();
    button.dataset.captureText = text;
    const top = Math.max(12, rect.top - 42);
    const left = Math.min(window.innerWidth - button.offsetWidth - 12, Math.max(12, rect.left + rect.width / 2 - 64));
    button.style.top = `${top}px`;
    button.style.left = `${left}px`;
    button.classList.add("is-visible");
  }
  ensureSelectionCaptureButton() {
    if (this.selectionCaptureEl) return this.selectionCaptureEl;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "readflow-selection-capture";
    button.textContent = "\u6458\u5F55\u5230 ReadFlow";
    button.addEventListener("mousedown", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    });
    button.addEventListener("click", (evt) => {
      var _a, _b;
      evt.preventDefault();
      evt.stopPropagation();
      const text = ((_a = button.dataset.captureText) == null ? void 0 : _a.trim()) || ((_b = window.getSelection()) == null ? void 0 : _b.toString().trim()) || "";
      if (!text) {
        this.hideSelectionCaptureButton();
        return;
      }
      this.hideSelectionCaptureButton();
      var ObsidianLib = require("obsidian");
      var activeView = this.app.workspace.getActiveViewOfType(ObsidianLib.MarkdownView);
      var editor = activeView && activeView.editor;
      this.openQuickCapture(text, editor, null);
    });
    document.body.appendChild(button);
    this.selectionCaptureEl = button;
    return button;
  }
  hideSelectionCaptureButton() {
    var _a;
    (_a = this.selectionCaptureEl) == null ? void 0 : _a.classList.remove("is-visible");
  }
  getSelectionHostElement(selection) {
    const node = selection.anchorNode;
    if (!node) return null;
    if (node instanceof HTMLElement) return node;
    return node.parentElement;
  }
  isCaptureSelectionHost(el) {
    if (el.closest(".modal, .readflow-capture-modal, .readflow-selection-capture")) return false;
    return !!el.closest(".markdown-source-view, .markdown-preview-view, .cm-contentContainer, .cm-editor");
  }
  resolveBookFromFile(file) {
    var _a, _b, _c;
    if (!file) return void 0;
    const frontmatter = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    const directBookId = (frontmatter == null ? void 0 : frontmatter.book_id) ? String(frontmatter.book_id).trim() : "";
    if (directBookId && this.diskData.books[directBookId]) {
      return this.diskData.books[directBookId];
    }
    const books = Object.values(this.diskData.books);
    const parentName = (_c = (_b = file.parent) == null ? void 0 : _b.name) != null ? _c : "";
    return books.find((book) => {
      return book.title === file.basename || book.title === parentName;
    });
  }
  async _testLlm(llm) {
    const { enabled, model, endpoint } = llm;
    if (!enabled || !endpoint) return { ok: false, error: "\u672A\u914D\u7F6E LLM \u7AEF\u70B9" };
    try {
      const resp = await this.app.requestUrl({
        url: endpoint,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: "\u56DE\u7B54: ok",
          stream: false
        })
      });
      return { ok: true, data: resp.json };
    } catch (e) {
      return { ok: false, error: e && e.message };
    }
  }
  async classifyHighlightWithLlm(highlight, bookTitle) {
    const llm = this.settings.llmClassifier || {};
    if (!llm.enabled || !llm.endpoint) return null;
    const prompt = `根据以下阅读摘录，判断其类型，只能回答一个词：idea（观点）、method（方法）、example（例子）、conclusion（结论）或 question（疑问）。\n\n书籍：《${bookTitle}》\n摘录：${highlight.content.slice(0, 500)}\n${highlight.note ? `笔记：${highlight.note.slice(0, 200)}` : ""}\n\n类型：`;
    try {
      const resp = await this.app.requestUrl({
        url: llm.endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(llm.apiKey ? { Authorization: `Bearer ${llm.apiKey}` } : {})
        },
        body: JSON.stringify({ model: llm.model, prompt, stream: false })
      });
      const json = resp.json;
      const raw = (json.response || json.text || json.content || "").trim();
      const match = raw.match(/^\s*(idea|method|example|conclusion|question)\s*[`\u2018\u2019"\u300C]?/i);
      return match ? match[1].toLowerCase() : null;
    } catch (e) {
      console.warn("[ReadFlow] LLM classify failed", e);
      return null;
    }
  }
};
