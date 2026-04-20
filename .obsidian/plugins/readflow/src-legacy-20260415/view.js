// ===== view (HighlightPanelView) =====

  async onOpen() {
    this.contentEl.empty();
    this.contentEl.classList.add("readflow-panel-root");
    this.plugin.linker.rebuildIndexAsync().catch((e) => console.error("[ReadFlow] linker", e));
    this.render();
  }
  refresh() {
    this.render();
  }
  async onClose() {
    if (this.detachedPanel) {
      this.detachedPanel.remove();
      this.detachedPanel = null;
    }
  }
  render() {
    var _a, _b;
    var prevExpandedId = this.expandedHighlightId;
    var prevBookId = this.currentBook ? this.currentBook.bookId : null;
    this.hoverCardId = null;
    if (this.hoverTimeoutId) { clearTimeout(this.hoverTimeoutId); this.hoverTimeoutId = null; }
    if (this.detachedPanel) {
      this.detachedPanel.remove();
      this.detachedPanel = null;
    }
    this.listContainerEl = null;
    this.listSummaryEl = null;
    this.contentEl.empty();
    this.contentEl.classList.add("readflow-panel-root");
    const books = Object.values(this.plugin.diskData.books).sort((x, y) => x.title.localeCompare(y.title));
    this.renderTopbar();
    if (books.length === 0) {
      const empty = this.contentEl.createDiv("readflow-empty");
      empty.createEl("p", { text: "\u6682\u65E0\u540C\u6B65\u6570\u636E", cls: "readflow-empty-title" });
      empty.createEl("p", {
        text: "\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u5FAE\u4FE1\u8BFB\u4E66 Cookie\uFF0C\u5E76\u6267\u884C\u300C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u300D\u6216\u4F7F\u7528\u547D\u4EE4\u9762\u677F\u641C\u7D22 ReadFlow\u3002",
        cls: "readflow-empty-desc"
      });
      return;
    }
    const selectedId = localStorage.getItem("readflow.selectedBookId") || ((_a = books[0]) == null ? void 0 : _a.bookId);
    const book = (_b = books.find((item) => item.bookId === selectedId)) != null ? _b : books[0];
    if (!book) return;
    const tree = buildChapterTree(book.highlights);
    this.currentBook = book;
    this.currentTree = tree;
    const inboxCount = book.highlights.filter((h) => h.status === "inbox").length;
    const reviewingCount = book.highlights.filter((h) => h.status === "reviewing").length;
    const draftedCount = book.highlights.filter((h) => h.status === "drafted").length;
    const processedCount = book.highlights.filter((h) => h.status === "processed").length;
    // 如果切回了同一本书，恢复展开状态
    if (prevBookId === book.bookId && prevExpandedId) {
      const exists = book.highlights.some((h) => h.id === prevExpandedId);
      if (exists) this.expandedHighlightId = prevExpandedId;
    }
    const shell = this.contentEl.createDiv("readflow-shell");
    if (this.sidebarCollapsed) shell.classList.add("readflow-shell--sidebar-collapsed");
    const sidebar = shell.createDiv("readflow-sidebar");
    if (this.sidebarCollapsed) sidebar.classList.add("readflow-sidebar--collapsed");
    const workspace = shell.createDiv("readflow-workspace");
    this.renderWorkspace(workspace, book, tree);
    this.renderSidebar(sidebar, books, book, tree, inboxCount, reviewingCount, draftedCount, processedCount);
    this.renderVisibleList(book, tree);
  }
  renderVisibleList(book, tree) {
    const visible = this.getVisibleHighlights(book, tree);
    this.renderListForBook(book, tree, visible, this.selectedChapter);
    void this.renderKnowledgeInspector(book, visible);
  }
  getVisibleHighlights(book, tree) {
    var _a, _b;
    const source = this.selectedChapter == null ? book.highlights : (_b = (_a = tree.find((node) => node.chapter === this.selectedChapter)) == null ? void 0 : _a.highlights) != null ? _b : [];
    if (this.selectedBoardFilter != null) {
      const bf = this.selectedBoardFilter;
      if (STATUS_FLOW.includes(bf)) {
        return source.filter((h) => h.status === bf && this._matchesSearch(h));
      }
      return source.filter((h) => {
        if (bf === "inbox") return (h.status === "inbox" || !h.highlightType) && this._matchesSearch(h);
        return h.highlightType === bf && this._matchesSearch(h);
      });
    }
    return source.filter((h) => {
      if (this.onlyInbox && h.status !== "inbox") return false;
      if (this.selectedTopic && (h.topic || "") !== this.selectedTopic) return false;
      return this._matchesSearch(h);
    });
  }
  _matchesSearch(h) {
    if (!this.searchQuery) return true;
    const q = this.searchQuery.toLowerCase();
    return (
      (h.content || "").toLowerCase().includes(q) ||
      (h.note || "").toLowerCase().includes(q) ||
      (h.topic || "").toLowerCase().includes(q) ||
      (h.highlightType || "").toLowerCase().includes(q) ||
      (h.chapter || "").toLowerCase().includes(q) ||
      (h.entities || []).some((e) => e.toLowerCase().includes(q))
    );
  }
  renderTopbar() {
    const topbar = this.contentEl.createDiv("readflow-topbar");
    if (this.topbarMinimized) topbar.classList.add("readflow-topbar--minimized");
    if (!this.topbarMinimized) {
      const brand = topbar.createDiv("readflow-brand");
      brand.createEl("h2", { text: "ReadFlow", cls: "readflow-brand-title" });
      brand.createEl("p", {
        text: "\u5FAE\u4FE1\u8BFB\u4E66\u540C\u6B65 \xB7 \u6458\u5F55\u6574\u7406 \xB7 Vault \u843D\u76D8",
        cls: "readflow-brand-sub"
      });
    }
    const toolbar = topbar.createDiv("readflow-toolbar");
    const syncBtn = toolbar.createEl("button", { text: "\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66", type: "button" });
    syncBtn.classList.add("readflow-btn", "readflow-btn--primary");
    syncBtn.addEventListener("click", () => void this.plugin.syncWereadAll());
    const searchWrap = toolbar.createDiv("readflow-search-wrap");
    const searchInput = searchWrap.createEl("input", {
      type: "text",
      placeholder: "\u2710 \u641C\u7D22\u6458\u5F55/\u60F3\u6CD5...",
      cls: "readflow-search-input"
    });
    searchInput.value = this.searchQuery;
    let searchTimer = null;
    searchInput.addEventListener("input", () => {
      this.searchQuery = searchInput.value.trim();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => this.renderVisibleList(this.currentBook, this.currentTree), 200);
    });
    if (this.searchQuery) {
      const clearSearch = searchWrap.createEl("button", { text: "\u2715", type: "button", cls: "readflow-search-clear" });
      clearSearch.addEventListener("click", () => {
        this.searchQuery = "";
        searchInput.value = "";
        this.renderVisibleList(this.currentBook, this.currentTree);
      });
    }
    const idxBtn = toolbar.createEl("button", { text: "\u91CD\u5EFA\u7D22\u5F15", type: "button" });
    idxBtn.classList.add("readflow-btn", "readflow-btn--secondary");
    idxBtn.addEventListener("click", async () => {
      await this.plugin.linker.rebuildIndexAsync();
      new import_obsidian5.Notice("\u5173\u8054\u7D22\u5F15\u5DF2\u66F4\u65B0");
    });
    const exportBtn = toolbar.createEl("button", { text: "\u5BFC\u51FA JSON", type: "button" });
    exportBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    exportBtn.title = "\u5BFC\u51FA data.json \u5230 vault \u6839\u76EE\u5F55";
    exportBtn.addEventListener("click", async () => {
      try {
        const json = JSON.stringify(this.plugin.diskData, null, 2);
        const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const path = `readflow-export-${ts}.json`;
        await this.app.vault.create(path, json);
        new import_obsidian5.Notice(`\u5DF2\u5BFC\u51FA\uFF1A${path}`);
      } catch (e) {
        new import_obsidian5.Notice(`\u5BFC\u51FA\u5931\u8D25: ${e && e.message}`);
      }
    });
    const addBtn = toolbar.createEl("button", { text: "\u624B\u52A8\u6458\u5F55", type: "button" });
    addBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    addBtn.addEventListener("click", () => {
      const books = Object.values(this.plugin.diskData.books);
      const current = this.getSelectedBook(books);
      new QuickCaptureModal(this.app, this.plugin, { book: current }, () => {
        void this.plugin.persistDisk();
        this.render();
      }).open();
    });
    const debugBtn = toolbar.createEl("button", { text: "\u7F16\u8BC6\u8C03\u8BD5", type: "button" });
    debugBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    debugBtn.title = "\u5C06\u6240\u6709\u6458\u5F55\u6CE8\u5165\u4E0A\u4E0B\u6587\uFF0C\u7528\u4E8E\u6D4B\u8BD5\u4E0A\u4E0B\u6587\u9884\u89C8\u529F\u80FD";
    debugBtn.addEventListener("click", () => {
      let count = 0;
      for (const book of Object.values(this.plugin.diskData.books)) {
        for (const h of book.highlights) {
          if (!h.contextAbstract && h.content) {
            h.contextAbstract = h.content;
            count++;
          }
        }
      }
      void this.plugin.persistDisk().then(() => {
        new import_obsidian5.Notice(`\u5DF2\u4E3A ${count} \u6761\u6458\u5F55\u6CE8\u5165\u4E0A\u4E0B\u6587\uFF0C\u8BF7\u91CD\u65B0\u70B9\u51FB\u300C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u300D\u6216\u5173\u95ED\u91CD\u5F00\u63D2\u4EF6`);
        this.render();
      });
    });
    // 获取原文上下文按钮（从 Weread API 拉取章节正文）
    const fetchCtxBtn = toolbar.createEl("button", { text: "\u83B7\u53D6\u539F\u6587", type: "button" });
    fetchCtxBtn.classList.add("readflow-btn", "readflow-btn--secondary");
    fetchCtxBtn.title = "\u4ECE\u5FAE\u4FE1\u8BFB\u4E66\u83B7\u53D6\u7AE0\u8282\u539F\u6587\uFF0C\u751F\u6210\u771F\u6B63\u7684\u4E0A\u4E0B\u6587\u9884\u89C8\uFF08\u5373\u4F5C\u4EF6\u65F6\u52A0\u8F7D\uFF0C\u6B22\u8F6E\u540C\u6B65\uFF09";
    fetchCtxBtn.addEventListener("click", async () => {
      const cookie = this.plugin.settings.wereadCookie.trim();
      if (!cookie) { new import_obsidian5.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199 Cookie"); return; }
      const book = this.currentBook;
      if (!book) { new import_obsidian5.Notice("\u6682\u65E0\u9009\u4E2D\u4E66\u7C4D"); return; }
      fetchCtxBtn.disabled = true; fetchCtxBtn.textContent = "\u83B7\u53D6\u4E2D\u2026";
      let done = 0, updated = 0, skipped = 0;
      const cookieRef = { value: cookie };
      for (const h of book.highlights) {
        if (!h.chapterUid || !h.content) { skipped++; continue; }
        if (h.contextAbstract && h.contextAbstract !== h.content) { skipped++; continue; }
        try {
          const chJson = await fetchChapterContent(cookieRef, book.bookId, h.chapterUid);
          const rawChapter = (chJson && (chJson.chapter || chJson.content || chJson.chapterContent)) || "";
          if (typeof rawChapter !== "string") { skipped++; continue; }
          const ctx = extractContextFromChapter(rawChapter, h.content);
          if (ctx && (ctx.before || ctx.after)) {
            h.contextAbstract = (ctx.before || "") + h.content + (ctx.after || "");
            updated++;
          } else { skipped++; }
        } catch (e) { skipped++; }
        done++;
        if (done % 5 === 0) {
          fetchCtxBtn.textContent = `\u83B7\u53D6\u4E2D ${done}/${book.highlights.length}\u2026`;
          await new Promise(r => setTimeout(r, 300));
        }
      }
      if (updated > 0) {
        await this.plugin.persistDisk();
        new import_obsidian5.Notice(`\u5DF2\u66F4\u65B0 ${updated} \u6761\u6458\u5F55\u7684\u539F\u6587\u4E0A\u4E0B\u6587\uFF0C\u8BF7\u91CD\u65B0\u70B9\u51FB\u300C\u91CD\u8F7D\u300D`);
      } else {
        new import_obsidian5.Notice(`\u672A\u83B7\u53D6\u5230\u65B0\u5185\u5BB9\uFF08${skipped}\u6761\u65E0\u7AE0\u8282\u6216\u5DF2\u6709\u4E0A\u4E0B\u6587\uFF09`);
      }
      fetchCtxBtn.disabled = false; fetchCtxBtn.textContent = "\u83B7\u53D6\u539F\u6587";
      this.render();
    });
    const toolbarTail = toolbar.createDiv("readflow-toolbar-tail");
    const reloadBtn = toolbarTail.createEl("button", { text: "\u91CD\u8F7D", type: "button" });
    reloadBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-toolbar-reload");
    reloadBtn.setAttribute("title", "\u91CD\u65B0\u52A0\u8F7D ReadFlow\uFF08\u7B49\u540C\u5728\u300C\u7B2C\u4E09\u65B9\u63D2\u4EF6\u300D\u4E2D\u5173\u95ED\u518D\u5F00\u542F\uFF09\uFF0C\u5F00\u53D1\u65F6\u66F4\u65B0 main.js \u540E\u7528");
    reloadBtn.addEventListener("click", () => void this.plugin.reloadSelf());
    const minimizeBtn = toolbarTail.createEl("button", {
      text: this.topbarMinimized ? "\u25BC" : "\u25B2",
      type: "button"
    });
    minimizeBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    minimizeBtn.setAttribute("title", this.topbarMinimized ? "\u5C55\u5F00\u9876\u680F" : "\u6536\u8D77\u9876\u680F");
    minimizeBtn.addEventListener("click", () => {
      this.topbarMinimized = !this.topbarMinimized;
      localStorage.setItem("readflow.topbarMinimized", String(this.topbarMinimized));
      this.render();
    });
  }
  renderSidebar(sidebar, books, book, tree, inboxCount, reviewingCount, draftedCount, processedCount) {
    const toggleRow = sidebar.createDiv("readflow-sidebar-toggle-row");
    const toggleBtn = toggleRow.createEl("button", { type: "button" });
    toggleBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-sidebar-toggle-btn");
    toggleBtn.setAttribute("title", this.sidebarCollapsed ? "\u5C55\u5F00\u5BFC\u822A\u4FA7\u680F" : "\u6536\u8D77\u5BFC\u822A\u4FA7\u680F");
    toggleBtn.setText(this.sidebarCollapsed ? "\u25B6" : "\u25C0");
    toggleBtn.addEventListener("click", () => {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem("readflow.sidebarCollapsed", String(this.sidebarCollapsed));
      this.render();
    });
    if (this.sidebarCollapsed) return;
    toggleRow.createEl("h3", { text: "\u9605\u8BFB\u5BFC\u822A", cls: "readflow-section-label" });
    this.bookSortMode = localStorage.getItem("readflow.bookSort") === "name" ? "name" : "recent";
    this.bookSortTimeDir = localStorage.getItem("readflow.bookSortTimeDir") === "asc" ? "asc" : "desc";
    this.bookSortNameDir = localStorage.getItem("readflow.bookSortNameDir") === "desc" ? "desc" : "asc";
    const picker = sidebar.createDiv("readflow-book-row");
    const pickerHead = picker.createDiv("readflow-book-picker-head");
    pickerHead.createDiv({ cls: "readflow-field-label", text: "\u5F53\u524D\u4E66\u7C4D" });
    const sortRow = pickerHead.createDiv("readflow-book-sort-row");
    const timeWrap = sortRow.createDiv("readflow-book-sort-group");
    const sortRecentBtn = timeWrap.createEl("button", { type: "button" });
    sortRecentBtn.classList.add("readflow-btn", "readflow-btn--sm", "readflow-book-sort-btn", "readflow-book-sort-compound");
    sortRecentBtn.classList.toggle("readflow-btn--ghost", this.bookSortMode !== "recent");
    sortRecentBtn.classList.toggle("readflow-book-sort-btn--active", this.bookSortMode === "recent");
    sortRecentBtn.title = this.bookSortMode === "recent" ? `\u65F6\u95F4\u6392\u5E8F \xB7 ${this.bookSortTimeDir === "asc" ? "\u5347\u5E8F\uFF08\u65E7\u2192\u65B0\uFF09" : "\u964D\u5E8F\uFF08\u65B0\u2192\u65E7\uFF09"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411` : "\u6309\u540C\u6B65/\u6458\u5F55\u65F6\u95F4\u6392\u5E8F";
    sortRecentBtn.setAttribute(
      "aria-label",
      this.bookSortMode === "recent" ? `\u65F6\u95F4\u6392\u5E8F\uFF0C${this.bookSortTimeDir === "asc" ? "\u5347\u5E8F" : "\u964D\u5E8F"}` : "\u5207\u6362\u5230\u65F6\u95F4\u6392\u5E8F"
    );
    const recentIconSlot = sortRecentBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
    const recentDirEl = sortRecentBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
    if (this.bookSortMode === "recent") {
      recentDirEl.setText(this.bookSortTimeDir === "desc" ? "\u2191" : "\u2193");
    } else {
      recentDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    (0, import_obsidian5.setIcon)(recentIconSlot, "history");
    const nameWrap = sortRow.createDiv("readflow-book-sort-group");
    const sortNameBtn = nameWrap.createEl("button", { type: "button" });
    sortNameBtn.classList.add("readflow-btn", "readflow-btn--sm", "readflow-book-sort-btn", "readflow-book-sort-compound");
    sortNameBtn.classList.toggle("readflow-btn--ghost", this.bookSortMode !== "name");
    sortNameBtn.classList.toggle("readflow-book-sort-btn--active", this.bookSortMode === "name");
    sortNameBtn.title = this.bookSortMode === "name" ? `\u4E66\u540D\u6392\u5E8F \xB7 ${this.bookSortNameDir === "asc" ? "A\u2192Z" : "Z\u2192A"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411` : "\u6309\u4E66\u540D\u5B57\u6BCD\u6392\u5E8F";
    sortNameBtn.setAttribute(
      "aria-label",
      this.bookSortMode === "name" ? `\u4E66\u540D\u6392\u5E8F\uFF0C${this.bookSortNameDir === "asc" ? "A-Z" : "Z-A"}` : "\u5207\u6362\u5230\u4E66\u540D\u6392\u5E8F"
    );
    const nameIconSlot = sortNameBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
    const nameDirEl = sortNameBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
    if (this.bookSortMode === "name") {
      nameDirEl.setText(this.bookSortNameDir === "asc" ? "\u2191" : "\u2193");
    } else {
      nameDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    (0, import_obsidian5.setIcon)(nameIconSlot, "library");
    const sortedBooks = [...books].sort((a, b) => {
      if (this.bookSortMode === "name") {
        const c = a.title.localeCompare(b.title, "zh-CN");
        return this.bookSortNameDir === "asc" ? c : -c;
      }
      const primary = bookRecencyTimestamp(a) - bookRecencyTimestamp(b);
      if (primary !== 0) {
        return this.bookSortTimeDir === "asc" ? primary : -primary;
      }
      const tie = a.title.localeCompare(b.title, "zh-CN");
      return tie;
    });
    const select = picker.createEl("select", { cls: "readflow-select readflow-book-select" });
    for (const b of sortedBooks) {
      const syncDate = b.lastSync ? new Date(b.lastSync).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : "\u672A\u540C\u6B65";
      const opt = select.createEl("option", { text: `${b.title} \xB7 ${b.highlights.length} \u6761 \xB7 ${syncDate}` });
      opt.value = b.bookId;
    }
    select.value = book.bookId;
    select.addEventListener("change", () => {
      localStorage.setItem("readflow.selectedBookId", select.value);
      this.render();
    });
    const persistBookSort = () => {
      localStorage.setItem("readflow.bookSort", this.bookSortMode);
      localStorage.setItem("readflow.bookSortTimeDir", this.bookSortTimeDir);
      localStorage.setItem("readflow.bookSortNameDir", this.bookSortNameDir);
    };
    sortRecentBtn.addEventListener("click", () => {
      if (this.bookSortMode === "recent") {
        this.bookSortTimeDir = this.bookSortTimeDir === "asc" ? "desc" : "asc";
      } else {
        this.bookSortMode = "recent";
      }
      persistBookSort();
      this.render();
    });
    sortNameBtn.addEventListener("click", () => {
      if (this.bookSortMode === "name") {
        this.bookSortNameDir = this.bookSortNameDir === "asc" ? "desc" : "asc";
      } else {
        this.bookSortMode = "name";
      }
      persistBookSort();
      this.render();
    });
    const overview = sidebar.createDiv("readflow-sidebar-card");
    overview.createEl("h4", { text: book.title, cls: "readflow-sidebar-title" });
    overview.createEl("p", {
      text: book.author ? `\u4F5C\u8005\uFF1A${book.author}` : "\u4F5C\u8005\u4FE1\u606F\u672A\u540C\u6B65",
      cls: "readflow-sidebar-subtitle"
    });
    const stats = overview.createDiv("readflow-stat-grid");
    this.renderStat(stats, "\u6458\u5F55", String(book.highlights.length));
    this.renderStat(stats, "\u5F85\u6574\u7406", String(inboxCount));
    this.renderStat(stats, "\u5DF2\u9605\u8BFB", String(reviewingCount));
    this.renderStat(stats, "\u8349\u7A3F\u5B8C\u6210", String(draftedCount));
    this.renderStat(stats, "\u5DF2\u5904\u7406", String(processedCount));
    this.renderStat(stats, "\u7AE0\u8282", String(tree.length));
    const meta = overview.createDiv("readflow-meta-list");
    this.renderMetaRow(meta, "bookId", book.bookId);
    const globalSyncAt = this.plugin.diskData.lastSyncAt;
    if (globalSyncAt) {
      this.renderMetaRow(meta, "\u4E0A\u6B21\u540C\u6B65", this.formatTime(globalSyncAt));
    } else {
      this.renderMetaRow(meta, "\u4E0A\u6B21\u540C\u6B65", this.formatTime(book.lastSync));
    }
    if (globalSyncAt && book.lastSync && globalSyncAt > book.lastSync) {
      this.renderMetaRow(meta, "\u672C\u4E66\u6570\u636E", this.formatTime(book.lastSync));
    }
    const statusBar = sidebar.createDiv("readflow-status-flow");
    statusBar.createEl("h3", { text: "\u72B6\u6001\u8FDB\u5EA6", cls: "readflow-section-label" });
    const total = book.highlights.length;
    const flowSteps = [
      { key: "inbox", label: "\u5F85\u6574\u7406", count: inboxCount },
      { key: "reviewing", label: "\u5DF2\u9605\u8BFB", count: reviewingCount },
      { key: "drafted", label: "\u8349\u7A3F\u5B8C\u6210", count: draftedCount },
      { key: "processed", label: "\u5DF2\u5904\u7406", count: processedCount }
    ];
    for (const step of flowSteps) {
      const pct = total > 0 ? Math.round(step.count / total * 100) : 0;
      const row = statusBar.createDiv("readflow-status-row");
      row.createEl("span", { text: step.label, cls: "readflow-status-label" });
      const bar = row.createDiv("readflow-status-bar-bg");
      const fill = bar.createDiv("readflow-status-bar-fill");
      fill.style.width = `${pct}%`;
      fill.style.background = STATUS_COLORS[step.key] || "#94a3b8";
      row.createEl("span", { text: `${step.count}\u6761 (${pct}%)`, cls: "readflow-status-count" });
    }
    sidebar.createEl("h3", { text: "\u7AE0\u8282", cls: "readflow-section-label" });
    const nav = sidebar.createDiv("readflow-nav-list");
    const allItem = nav.createDiv(`readflow-nav-item${this.selectedChapter == null ? " readflow-nav-item--active" : ""}`);
    allItem.setText(`\u5168\u90E8 \xB7 ${book.highlights.length}`);
    allItem.addEventListener("click", () => {
      this.selectedChapter = null;
      nav.querySelectorAll(".readflow-nav-item").forEach((el) => el.classList.remove("readflow-nav-item--active"));
      allItem.classList.add("readflow-nav-item--active");
      this.renderVisibleList(book, tree);
    });
    for (const node of tree) {
      const item = nav.createDiv(`readflow-nav-item${this.selectedChapter === node.chapter ? " readflow-nav-item--active" : ""}`);
      item.setText(`${node.chapter} \xB7 ${node.highlights.length}`);
      this.makeChapterDropTarget(item, book, node.chapter, node.chapterUid);
      item.addEventListener("click", () => {
        this.selectedChapter = node.chapter;
        nav.querySelectorAll(".readflow-nav-item").forEach((el) => el.classList.remove("readflow-nav-item--active"));
        item.classList.add("readflow-nav-item--active");
        this.renderVisibleList(book, tree);
      });
    }
  }
  renderWorkspace(workspace, book, tree) {
    const header = workspace.createDiv("readflow-workspace-header");
    const titleBlock = header.createDiv("readflow-workspace-titleblock");
    titleBlock.createEl("h3", { text: book.title, cls: "readflow-workspace-title" });
    titleBlock.createEl("p", {
      text: book.author ? `\u4F5C\u8005 ${book.author} \xB7 \u5F53\u524D\u5DE5\u4F5C\u533A\u5C55\u793A\u8BE5\u4E66\u6458\u5F55` : "\u5F53\u524D\u5DE5\u4F5C\u533A\u5C55\u793A\u8BE5\u4E66\u6458\u5F55",
      cls: "readflow-workspace-subtitle"
    });
    const headerActions = header.createDiv("readflow-workspace-actions");
    const writeBtn = headerActions.createEl("button", { text: "\u2193 \u5199\u5165 Vault", type: "button" });
    writeBtn.classList.add("readflow-btn", "readflow-btn--primary", "readflow-btn--sm");
    writeBtn.title = "\u5C06\u5F53\u524D\u4E66\u7C4D\u6458\u5F55\u5199\u5165/\u66F4\u65B0 Vault Markdown \u6587\u4EF6";
    writeBtn.addEventListener("click", async () => {
      try {
        await writeBookToVault(this.app, this.plugin.settings, book);
        new import_obsidian5.Notice(`\u5DF2\u843D\u76D8\uFF1A${book.title}`);
      } catch (e) {
        console.error(e);
        new import_obsidian5.Notice("\u843D\u76D8\u5931\u8D25\uFF0C\u67E5\u770B\u63A7\u5236\u53F0");
      }
    });
    const pushableCount = book.highlights.filter(
      (h) => h.sourceType === "weread" && h.note && (h.wereadRange || h.wereadReviewId)
    ).length;
    if (pushableCount > 0) {
      const batchPush = headerActions.createEl("button", {
        text: `\u2191 \u63A8\u9001\u60F3\u6CD5 (${pushableCount})`,
        type: "button"
      });
      batchPush.classList.add("readflow-btn", "readflow-btn--accent", "readflow-btn--sm");
      batchPush.title = "\u5C06\u6240\u6709\u672C\u5730\u60F3\u6CD5\u6279\u91CF\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66";
      batchPush.addEventListener("click", async () => {
        batchPush.disabled = true;
        batchPush.textContent = "\u63A8\u9001\u4E2D\u2026";
        await this.plugin.pushBatchNotes(book.bookId);
        batchPush.textContent = `\u2191 \u63A8\u9001\u60F3\u6CD5`;
        batchPush.disabled = false;
        this.render();
      });
    }
    const chips = header.createDiv("readflow-card-meta");
    chips.createSpan({ cls: "readflow-chip readflow-chip--accent", text: `${book.highlights.length} \u6761\u6458\u5F55` });
    chips.createSpan({ cls: "readflow-chip", text: `${tree.length} \u7AE0\u8282` });
    if (this.selectedTopic) {
      chips.createSpan({ cls: "readflow-chip readflow-chip--accent", text: `\u4E3B\u9898\uFF1A${this.selectedTopic}` });
    }
    const surface = workspace.createDiv("readflow-workspace-surface");
    this.renderTopicManager(surface, book, tree);
    this.renderClassificationBoard(surface, book, tree);
    this.renderBatchBar(surface, book);
    const contentGrid = surface.createDiv("readflow-content-grid");
    if (this.listDetached) contentGrid.classList.add("readflow-content-grid--detached");
    const listPane = contentGrid.createDiv("readflow-list-pane");
    if (this.listDetached) {
      listPane.style.display = "none";
    } else {
      const listHeader = listPane.createDiv("readflow-list-header");
      listHeader.createEl("h4", { text: "\u6458\u5F55\u5217\u8868", cls: "readflow-list-title" });
      const listHeaderRight = listHeader.createDiv("readflow-list-header-right");
      this.listSummaryEl = listHeaderRight.createEl("p", {
        text: "\u5168\u90E8\u7AE0\u8282 \xB7 0 \u6761",
        cls: "readflow-list-summary"
      });
      const detachBtn = listHeaderRight.createEl("button", { text: "\u6D6E\u52A8\u7A97\u53E3", type: "button" });
      detachBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      detachBtn.setAttribute("title", "\u5C06\u6458\u5F55\u5217\u8868\u4EE5\u6D6E\u52A8\u7A97\u53E3\u663E\u793A\uFF0C\u4FBF\u4E8E\u540E\u7EED\u62D6\u62FD\u64CD\u4F5C");
      detachBtn.addEventListener("click", () => {
        this.listDetached = true;
        this.render();
      });
      this.listContainerEl = listPane.createDiv("readflow-card-list");
    }
    contentGrid.createDiv("readflow-knowledge-pane");
  }
  renderTopicManager(container, book, tree) {
    const topics = this.buildTopicStats(book);
    const sec = container.createDiv("readflow-topic-section");
    const head = sec.createDiv("readflow-section-inline-head");
    const titleBtn = head.createDiv("readflow-section-title-btn");
    titleBtn.createEl("span", {
      text: this.topicSectionCollapsed ? "\u25B6" : "\u25BC",
      cls: "readflow-section-chevron"
    });
    titleBtn.createEl("h4", { text: "\u4E3B\u9898\u7BA1\u7406", cls: "readflow-list-title" });
    titleBtn.addEventListener("click", () => {
      this.topicSectionCollapsed = !this.topicSectionCollapsed;
      localStorage.setItem("readflow.topicCollapsed", String(this.topicSectionCollapsed));
      this.render();
    });
    if (this.topicSectionCollapsed) return;
    const actions = head.createDiv("readflow-inline-actions");
    const createBtn = actions.createEl("button", { text: "\u65B0\u5EFA\u4E3B\u9898", type: "button" });
    createBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    createBtn.addEventListener("click", () => {
      const next = window.prompt("\u8F93\u5165\u65B0\u4E3B\u9898\u540D\u79F0");
      if (!(next == null ? void 0 : next.trim())) return;
      this.createTopic(book, next.trim());
      this.selectedTopic = next.trim();
      this.render();
    });
    if (this.selectedTopic) {
      const renameBtn = actions.createEl("button", { text: "\u91CD\u547D\u540D", type: "button" });
      renameBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      renameBtn.addEventListener("click", () => {
        var _a;
        const next = window.prompt("\u91CD\u547D\u540D\u4E3B\u9898", (_a = this.selectedTopic) != null ? _a : "");
        if (!(next == null ? void 0 : next.trim()) || !this.selectedTopic) return;
        this.renameTopic(book, this.selectedTopic, next.trim());
        this.selectedTopic = next.trim();
        this.render();
      });
      const mergeBtn = actions.createEl("button", { text: "\u5408\u5E76\u5230\u2026", type: "button" });
      mergeBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      mergeBtn.addEventListener("click", () => {
        if (!this.selectedTopic) return;
        const target = window.prompt("\u5408\u5E76\u5230\u54EA\u4E2A\u4E3B\u9898\uFF1F", this.selectedTopic);
        if (!(target == null ? void 0 : target.trim())) return;
        this.mergeTopic(book, this.selectedTopic, target.trim());
        this.selectedTopic = target.trim();
        this.render();
      });
      const clearBtn = actions.createEl("button", { text: "\u6E05\u9664\u8FC7\u6EE4", type: "button" });
      clearBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      clearBtn.addEventListener("click", () => {
        this.selectedTopic = null;
        this.render();
      });
    }
    const row = sec.createDiv("readflow-topic-row");
    const allChip = row.createEl("button", { text: `\u5168\u90E8 ${book.highlights.length}`, type: "button" });
    allChip.classList.add("readflow-chip-button");
    if (this.selectedTopic == null) allChip.classList.add("readflow-chip-button--active");
    allChip.addEventListener("click", () => {
      this.selectedTopic = null;
      this.render();
    });
    for (const [topic, count] of [...topics.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
      const chip = row.createEl("button", { text: `${topic} ${count}`, type: "button" });
      chip.classList.add("readflow-chip-button");
      if (this.selectedTopic === topic) chip.classList.add("readflow-chip-button--active");
      chip.addEventListener("click", () => {
        this.selectedTopic = this.selectedTopic === topic ? null : topic;
        this.render();
      });
    }
  }
  renderClassificationBoard(container, book, tree) {
    const lanes = [
      { key: "inbox", label: "\u5F85\u6574\u7406", isStatus: true },
      { key: "reviewing", label: "\u5DF2\u9605\u8BFB", isStatus: true },
      { key: "drafted", label: "\u8349\u7A3F\u5B8C\u6210", isStatus: true },
      { key: "processed", label: "\u5DF2\u5904\u7406", isStatus: true },
      { key: "idea", label: HIGHLIGHT_TYPE_LABELS.idea },
      { key: "method", label: HIGHLIGHT_TYPE_LABELS.method },
      { key: "example", label: HIGHLIGHT_TYPE_LABELS.example },
      { key: "conclusion", label: HIGHLIGHT_TYPE_LABELS.conclusion },
      { key: "question", label: HIGHLIGHT_TYPE_LABELS.question }
    ];
    const sec = container.createDiv("readflow-board-section");
    const sectionHead = sec.createDiv("readflow-section-inline-head");
    const titleBtn = sectionHead.createDiv("readflow-section-title-btn");
    titleBtn.createEl("span", {
      text: this.boardSectionCollapsed ? "\u25B6" : "\u25BC",
      cls: "readflow-section-chevron"
    });
    titleBtn.createEl("h4", { text: "\u5206\u7C7B\u7CFB\u7EDF", cls: "readflow-list-title" });
    titleBtn.addEventListener("click", () => {
      this.boardSectionCollapsed = !this.boardSectionCollapsed;
      localStorage.setItem("readflow.boardCollapsed", String(this.boardSectionCollapsed));
      this.render();
    });
    if (this.boardSectionCollapsed) return;
    if (this.selectedBoardFilter) {
      const clearFilterBtn = sectionHead.createEl("button", { text: "\xD7 \u53D6\u6D88\u7B5B\u9009", type: "button" });
      clearFilterBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-board-clear-btn");
      clearFilterBtn.addEventListener("click", () => {
        this.selectedBoardFilter = null;
        this.render();
      });
    }
    sec.createEl("p", {
      text: "\u70B9\u51FB\u5206\u7C7B\u67E5\u770B\u6458\u5F55\xB7\u62D6\u52A8\u6458\u5F55\u5230\u5206\u7C7B\u5217\u5B8C\u6210\u5F52\u7C7B",
      cls: "readflow-empty-desc readflow-board-hint"
    });
    const board = sec.createDiv("readflow-board");
    for (const lane of lanes) {
      const items = book.highlights.filter(
        (h) => lane.key === "inbox" ? h.status === "inbox" || !h.highlightType : h.highlightType === lane.key
      );
      const isActive = this.selectedBoardFilter === lane.key;
      const laneEl = board.createDiv("readflow-board-lane");
      if (isActive) laneEl.classList.add("readflow-board-lane--selected");
      const laneHeader = laneEl.createDiv("readflow-board-lane-header");
      laneHeader.createEl("span", { text: lane.label, cls: "readflow-board-lane-title" });
      laneHeader.createEl("span", { text: String(items.length), cls: "readflow-board-lane-count" });
      laneEl.addEventListener("click", (evt) => {
        if (evt.dataTransfer) return;
        this.selectedBoardFilter = isActive ? null : lane.key;
        this.render();
      });
      laneEl.addEventListener("dragover", (evt) => {
        evt.preventDefault();
        laneEl.classList.add("readflow-board-lane--active");
      });
      laneEl.addEventListener("dragleave", () => laneEl.classList.remove("readflow-board-lane--active"));
      laneEl.addEventListener("drop", (evt) => {
        var _a;
        evt.preventDefault();
        laneEl.classList.remove("readflow-board-lane--active");
        const highlightId = ((_a = evt.dataTransfer) == null ? void 0 : _a.getData("text/readflow-highlight-id")) || "";
        if (!highlightId) return;
        this.assignHighlightToLane(book, highlightId, lane.key);
        this.render();
      });
    }
  }
  renderBatchBar(container, book) {
    if (this.selectedHighlightIds.size === 0) return;
    const bar = container.createDiv("readflow-batch-bar");
    bar.createEl("span", {
      text: `\u5DF2\u9009\u62E9 ${this.selectedHighlightIds.size} \u6761\u6458\u5F55`,
      cls: "readflow-batch-label"
    });
    const selectAllBtn = bar.createEl("button", { text: "\u5168\u9009", type: "button" });
    selectAllBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    selectAllBtn.addEventListener("click", () => {
      const visible = this.getVisibleHighlights(book, this.currentTree);
      visible.forEach((h) => this.selectedHighlightIds.add(h.id));
      this.render();
    });
    const clearBtn = bar.createEl("button", { text: "\u6E05\u7A7A", type: "button" });
    clearBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    clearBtn.addEventListener("click", () => {
      this.selectedHighlightIds.clear();
      this.render();
    });
    const actions = bar.createDiv("readflow-inline-actions");
    const impLabel = actions.createEl("span", { text: "\u91CD\u8981\u5EA6:", cls: "readflow-batch-label-sm" });
    for (let imp = 1; imp <= 5; imp++) {
      const impBtn = actions.createEl("button", { text: String(imp), type: "button" });
      impBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      impBtn.title = `\u5C06\u9009\u4E2D\u6458\u5F55\u91CD\u8981\u5EA6\u8BBE\u4E3A ${imp}`;
      impBtn.addEventListener("click", () => {
        this.updateManyHighlights(book, (h) =>
          this.selectedHighlightIds.has(h.id) ? { ...h, importance: imp } : h
        );
      });
    }
    const sep1 = actions.createEl("span", { cls: "readflow-batch-sep" });
    for (const type of ["idea", "method", "example", "conclusion", "question"]) {
      const btn = actions.createEl("button", { text: HIGHLIGHT_TYPE_LABELS[type], type: "button" });
      btn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      btn.addEventListener("click", () => {
        this.updateManyHighlights(
          book,
          (h) => this.selectedHighlightIds.has(h.id) ? { ...h, highlightType: type, status: "processed" } : h
        );
      });
    }
    const sep2 = actions.createEl("span", { cls: "readflow-batch-sep" });
    const nextStatus = STATUS_FLOW[1]; // default to "reviewing"
    const nextLabel = STATUS_LABELS[nextStatus] || "\u5DF2\u9605\u8BFB";
    const advanceBtn = actions.createEl("button", { text: `\u2192 ${nextLabel}`, type: "button" });
    advanceBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    advanceBtn.style.color = STATUS_COLORS[nextStatus] || "#3b82f6";
    advanceBtn.title = "\u5C06\u9009\u5B9A\u68C0\u7ED8\u5411\u4E0B\u4E00\u72B6\u6001";
    advanceBtn.addEventListener("click", () => {
      this.updateManyHighlights(book, (h) => {
        if (!this.selectedHighlightIds.has(h.id)) return h;
        const idx = STATUS_FLOW.indexOf(h.status);
        const next = STATUS_FLOW[idx + 1] || "processed";
        return { ...h, status: next };
      });
      this.render();
    });
    const topicBtn = actions.createEl("button", { text: "\u6279\u91CF\u8BBE\u4E3B\u9898", type: "button" });
    topicBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    topicBtn.addEventListener("click", () => {
      const topic = window.prompt("\u4E3A\u9009\u4E2D\u7684\u6458\u5F55\u8BBE\u7F6E\u4E3B\u9898");
      if (!(topic == null ? void 0 : topic.trim())) return;
      this.updateManyHighlights(
        book,
        (h) => this.selectedHighlightIds.has(h.id) ? { ...h, topic: topic.trim(), status: "processed" } : h
      );
      this.createTopic(book, topic.trim());
    });
    const relationBtn = actions.createEl("button", { text: "\u5EFA\u7ACB\u5173\u7CFB", type: "button" });
    relationBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    relationBtn.addEventListener("click", () => {
      if (this.selectedHighlightIds.size < 2) {
        new import_obsidian5.Notice("\u81F3\u5C11\u9009\u62E9 2 \u6761\u6458\u5F55\u624D\u80FD\u5EFA\u7ACB\u5173\u7CFB");
        return;
      }
      const relation = window.prompt("\u8F93\u5165\u5173\u7CFB\u7C7B\u578B\uFF08\u9884\u8BBE\uFF1A\u8865\u5145/\u91CD\u590D/\u56E0\u679C/\u5BF9\u6BD4\uFF0C\u6216\u81EA\u5B9A\u4E49\u5982\uFF1A\u5E08\u627F/\u7ADE\u4E89/\u5BB6\u65CF\uFF09", "\u8865\u5145");
      if (!relation) return;
      this.linkSelectedHighlights(book, relation);
    });
  }
  renderListForBook(book, tree, items, filterChapter) {
    var _a, _b, _c, _d, _e;
    let listEl = null;
    if (this.listDetached) {
      if (!this.detachedPanel) {
        this.detachedPanel = this.createDetachedListPanel(book, tree);
      }
      listEl = this.detachedPanel.querySelector(".readflow-card-list");
    } else {
      listEl = this.listContainerEl;
    }
    if (!(listEl instanceof HTMLElement)) return;
    const summaryText = filterChapter ? `${filterChapter} \xB7 ${items.length} \u6761` : `\u5168\u90E8\u7AE0\u8282 \xB7 ${items.length} \u6761`;
    if (this.listSummaryEl) this.listSummaryEl.setText(summaryText);
    if (this.detachedPanel) {
      const detachedSummary = this.detachedPanel.querySelector(".readflow-detached-summary");
      if (detachedSummary) detachedSummary.setText(summaryText);
    }
    listEl.empty();
    const rows = [...items].sort((a, b) => {
      if (this.listOrderMode === "topic") {
        const topicCompare = (a.topic || "\u672A\u5F52\u7C7B").localeCompare(b.topic || "\u672A\u5F52\u7C7B");
        if (topicCompare !== 0) return topicCompare;
        const typeCompare = (a.highlightType || "").localeCompare(b.highlightType || "");
        if (typeCompare !== 0) return typeCompare;
      }
      return b.createdAt - a.createdAt;
    });
    if (rows.length === 0) {
      const empty = listEl.createDiv("readflow-empty-inline");
      empty.createEl("p", { text: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u6458\u5F55", cls: "readflow-empty-title" });
      empty.createEl("p", {
        text: "\u53EF\u4EE5\u5207\u6362\u7AE0\u8282\u3001\u5173\u95ED\u300C\u4EC5\u672A\u6574\u7406\u300D\uFF0C\u6216\u624B\u52A8\u8865\u5145\u6458\u5F55\u3002",
        cls: "readflow-empty-desc"
      });
      return;
    }
    const topicCounts = /* @__PURE__ */ new Map();
    if (this.listOrderMode === "topic") {
      for (const row of rows) {
        const key = (row.topic || "\u672A\u5F52\u7C7B").trim() || "\u672A\u5F52\u7C7B";
        topicCounts.set(key, ((_a = topicCounts.get(key)) != null ? _a : 0) + 1);
      }
    }
    let lastTopicLabel = null;
    for (const h of rows) {
      const topicLabel = (h.topic || "\u672A\u5F52\u7C7B").trim() || "\u672A\u5F52\u7C7B";
      if (this.listOrderMode === "topic" && topicLabel !== lastTopicLabel) {
        const topicHead = listEl.createDiv("readflow-topic-divider");
        topicHead.createEl("span", { text: topicLabel, cls: "readflow-topic-divider-label" });
        topicHead.createEl("span", {
          text: `${(_b = topicCounts.get(topicLabel)) != null ? _b : 0} \u6761`,
          cls: "readflow-topic-divider-count"
        });
        lastTopicLabel = topicLabel;
      }
      const card = listEl.createDiv("readflow-card");
      if (h.status === "inbox") card.classList.add("readflow-card--inbox");
      if (this.selectedHighlightIds.has(h.id)) card.classList.add("readflow-card--selected");
      this.makeHighlightDraggable(card, h.id);
      const cardHeader = card.createDiv("readflow-card-header");
      const headerLeft = cardHeader.createDiv("readflow-card-header-left");
      const pickRow = headerLeft.createDiv("readflow-card-pickrow");
      const pick = pickRow.createEl("input", { type: "checkbox" });
      pick.checked = this.selectedHighlightIds.has(h.id);
      pick.addEventListener("change", () => {
        if (pick.checked) this.selectedHighlightIds.add(h.id);
        else this.selectedHighlightIds.delete(h.id);
        this.render();
      });
      headerLeft.createEl("span", { text: h.chapter || "(\u672A\u5206\u7AE0)", cls: "readflow-card-eyebrow" });
      headerLeft.createEl("span", { text: this.formatTime(h.createdAt), cls: "readflow-card-date" });
      const headerRight = cardHeader.createDiv("readflow-card-meta");
      const statusLabel = STATUS_LABELS[h.status] || h.status;
      const statusColor = STATUS_COLORS[h.status] || "#94a3b8";
      const statusChip = headerRight.createEl("span", {
        cls: "readflow-chip readflow-chip--status-led",
        text: statusLabel
      });
      statusChip.style.setProperty("--rf-status-led", statusColor);
      headerRight.createSpan({ cls: "readflow-chip", text: `\u91CD\u8981\u5EA6 ${h.importance}` });
      const body = card.createDiv("readflow-card-body");
      body.setText(h.content);
      const meta = card.createDiv("readflow-card-meta");
      if (h.highlightType) meta.createSpan({ cls: "readflow-chip readflow-chip--accent", text: h.highlightType });
      if (h.topic) meta.createSpan({ cls: "readflow-chip", text: h.topic });
      if ((_c = h.entities) == null ? void 0 : _c.length) {
        for (const ent of h.entities.slice(0, 3)) {
          meta.createSpan({ cls: "readflow-chip readflow-chip--entity", text: ent });
        }
        if (h.entities.length > 3) {
          meta.createSpan({ cls: "readflow-chip readflow-chip--entity", text: `+${h.entities.length - 3}` });
        }
      }
      if (h.chapter) meta.createSpan({ cls: "readflow-chip", text: h.chapter });
      if ((_d = h.links) == null ? void 0 : _d.length) meta.createSpan({ cls: "readflow-chip readflow-chip--soft", text: `\u5173\u8054 ${h.links.length}` });
      if (h.contextAbstract) {
        const ctxBtn = meta.createEl("button", { text: "\u2605 \u4E0A\u4E0B\u6587", type: "button", cls: "readflow-chip readflow-chip--context-btn" });
        ctxBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.expandedHighlightId === h.id) this.expandedHighlightId = null;
          else this.expandedHighlightId = h.id;
          this.render();
        });
      }
      if (h.note) {
        const note = card.createDiv("readflow-card-note");
        note.createEl("span", { text: "\u6211\u7684\u60F3\u6CD5", cls: "readflow-card-note-label" });
        note.createEl("p", { text: h.note, cls: "readflow-card-note-text" });
      }
      if ((_e = h.relations) == null ? void 0 : _e.length) {
        const rel = card.createDiv("readflow-card-note");
        rel.createEl("span", { text: "\u6458\u5F55\u5173\u7CFB", cls: "readflow-card-note-label" });
        for (const relation of h.relations) {
          const target = book.highlights.find((row) => row.id === relation.targetId);
          rel.createEl("p", {
            text: `${relation.hint} \u2192 ${(target == null ? void 0 : target.content.slice(0, 48)) || relation.targetId}`,
            cls: "readflow-card-note-text"
          });
        }
      }
      if (this.expandedHighlightId === h.id && h.contextAbstract) {
        const ctx = parseContextAbstract(h);
        if (ctx) {
          const ctxWrap = card.createDiv("readflow-context-wrap");
          if (ctx.chapter) {
            const ctxChap = ctxWrap.createDiv("readflow-context-chapter");
            ctxChap.textContent = ctx.chapter;
          }
          const ctxBody = ctxWrap.createDiv("readflow-context-body");
          if (ctx.before) {
            const beforeEl = ctxBody.createDiv("readflow-context-before");
            beforeEl.textContent = ctx.before;
          }
          const mainEl = ctxBody.createDiv("readflow-context-main");
          mainEl.textContent = ctx.main;
          if (ctx.after) {
            const afterEl = ctxBody.createDiv("readflow-context-after");
            afterEl.textContent = ctx.after;
          }
          const ctxFooter = ctxWrap.createDiv("readflow-context-footer");
          if (ctx.wereadRange) {
            const rangeEl = ctxFooter.createEl("span", { text: "\u7B2C" + ctx.wereadRange + "\u8282", cls: "readflow-chip readflow-chip--soft" });
            const wereadLink = ctxFooter.createEl("button", {
              text: "\u5728\u5FAE\u4FE1\u8BFB\u4E66\u4E2D\u67E5\u770B",
              type: "button",
              cls: "readflow-btn readflow-btn--ghost readflow-btn--xs"
            });
            wereadLink.addEventListener("click", (e) => {
              e.stopPropagation();
              const bookUrl = "https://weread.qq.com/book/" + book.bookId;
              window.open(bookUrl, "_blank");
            });
          }
          const collapseBtn = ctxFooter.createEl("button", { text: "\u220F \u6536\u8D77", type: "button", cls: "readflow-btn readflow-btn--ghost readflow-btn--xs" });
          collapseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.expandedHighlightId = null;
            this.render();
          });
        }
      }
      card.addEventListener("click", (e) => {
        if (e.target.closest("input, button")) return;
        if (h.contextAbstract) {
          if (this.expandedHighlightId === h.id) this.expandedHighlightId = null;
          else this.expandedHighlightId = h.id;
          this.render();
        }
      });
      card.addEventListener("mouseenter", () => {
        if (!h.contextAbstract || this.expandedHighlightId === h.id) return;
        this.hoverCardId = h.id;
        this.hoverTimeoutId = window.setTimeout(() => {
          if (this.hoverCardId === h.id) {
            this.expandedHighlightId = h.id;
            this.render();
          }
        }, 1800);
      });
      card.addEventListener("mouseleave", () => {
        this.hoverCardId = null;
        if (this.hoverTimeoutId) { clearTimeout(this.hoverTimeoutId); this.hoverTimeoutId = null; }
      });
      const actions = card.createDiv("readflow-card-actions");
      const edit = actions.createEl("button", { text: "\u6574\u7406", type: "button" });
      edit.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      edit.addEventListener("click", () => {
        new QuickCaptureModal(this.app, this.plugin, { book, highlight: h }, () => {
          void this.plugin.persistDisk();
          this.render();
        }).open();
      });
      const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(h.status) + 1] || "processed";
      const nextLabel = STATUS_LABELS[nextStatus] || "\u5DF2\u5904\u7406";
      const mark = actions.createEl("button", { text: `\u2192 ${nextLabel}`, type: "button" });
      mark.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      mark.style.color = STATUS_COLORS[nextStatus] || "#10b981";
      mark.title = `\u70B9\u51FB\u5C06\u72B6\u6001\u8F6C\u4E3A\u300C${nextLabel}\u300D`;
      mark.addEventListener("click", () => {
        const cached = this.plugin.diskData.books[book.bookId];
        if (!cached) return;
        this.plugin.diskData.books[book.bookId] = {
          ...cached,
          highlights: cached.highlights.map((x) => x.id === h.id ? { ...h, status: nextStatus } : x),
          lastSync: Date.now()
        };
        void this.plugin.persistDisk();
        this.render();
      });
      if (h.sourceType === "weread" && h.note && (h.wereadRange || h.wereadReviewId)) {
        const push = actions.createEl("button", { text: "\u2191 \u63A8\u9001\u60F3\u6CD5", type: "button" });
        push.classList.add("readflow-btn", "readflow-btn--accent", "readflow-btn--sm");
        push.title = "\u5C06\u60F3\u6CD5\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66";
        push.addEventListener("click", async () => {
          push.disabled = true;
          push.textContent = "\u63A8\u9001\u4E2D\u2026";
          const result = await this.plugin.pushHighlightNote(book.bookId, h);
          if (result.ok) {
            new import_obsidian4.Notice("\u2705 \u60F3\u6CD5\u5DF2\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66");
            push.textContent = "\u2713 \u5DF2\u63A8\u9001";
            push.classList.add("readflow-btn--pushed");
          } else {
            var detail = result.detail ? JSON.stringify(result.detail).slice(0, 120) : "";
            new import_obsidian4.Notice(`\u274C \u63A8\u9001\u5931\u8D25\uFF1A${result.reason || "\u672A\u77E5"}${detail ? "\n" + detail : ""}`, 12e3);
            console.error("[ReadFlow] push failed", result);
            push.textContent = "\u2191 \u63A8\u9001\u60F3\u6CD5";
            push.disabled = false;
          }
        });
      }
    }
  }
  async renderKnowledgeInspector(book, visible) {
    const pane = this.contentEl.querySelector(".readflow-knowledge-pane");
    if (!(pane instanceof HTMLElement)) {
      return;
    }
    pane.empty();
    let scopeBook = this.buildKnowledgeScope(book, visible);
    const availableTopics = new Set(
      scopeBook.highlights.map((h) => (h.topic || "").trim()).filter(Boolean)
    );
    if (this.selectedKnowledgeTopic && !availableTopics.has(this.selectedKnowledgeTopic)) {
      this.selectedKnowledgeTopic = null;
    }
    if (this.selectedKnowledgeTopic) {
      scopeBook = {
        ...scopeBook,
        title: `${scopeBook.title} - ${this.selectedKnowledgeTopic}`,
        highlights: scopeBook.highlights.filter((h) => (h.topic || "").trim() === this.selectedKnowledgeTopic)
      };
    }
    const selectedCount = book.highlights.filter((h) => this.selectedHighlightIds.has(h.id)).length;
    let scopeLabel = selectedCount > 0 ? `\u5F53\u524D\u8303\u56F4\uFF1A\u5DF2\u9009 ${scopeBook.highlights.length} \u6761` : visible.length !== book.highlights.length ? `\u5F53\u524D\u8303\u56F4\uFF1A\u7B5B\u9009 ${scopeBook.highlights.length} \u6761` : `\u5F53\u524D\u8303\u56F4\uFF1A\u5168\u4E66 ${scopeBook.highlights.length} \u6761`;
    if (this.selectedKnowledgeTopic) scopeLabel += ` \xB7 \u4E3B\u9898 ${this.selectedKnowledgeTopic}`;
    const head = pane.createDiv("readflow-section-inline-head");
    head.createEl("h4", { text: "\u77E5\u8BC6\u7ED3\u6784", cls: "readflow-list-title" });
    const headActions = head.createDiv("readflow-inline-actions");
    headActions.createEl("span", { text: scopeLabel, cls: "readflow-knowledge-badge" });
    if (this.selectedKnowledgeTopic) {
      const exportBtn = headActions.createEl("button", { text: "\u5BFC\u51FA\u4E3B\u9898\u9875", type: "button" });
      exportBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      exportBtn.addEventListener("click", async () => {
        if (!this.selectedKnowledgeTopic) return;
        try {
          const path = await writeTopicKnowledgeToVault(this.app, this.plugin.settings, book, this.selectedKnowledgeTopic);
          new import_obsidian5.Notice(`\u5DF2\u5BFC\u51FA\u4E3B\u9898\u9875\uFF1A${path}`);
        } catch (error) {
          console.error(error);
          new import_obsidian5.Notice("\u5BFC\u51FA\u4E3B\u9898\u9875\u5931\u8D25\uFF0C\u67E5\u770B\u63A7\u5236\u53F0");
        }
      });
      const clearBtn = headActions.createEl("button", { text: "\u67E5\u770B\u5168\u90E8\u4E3B\u9898", type: "button" });
      clearBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      clearBtn.addEventListener("click", () => {
        this.selectedKnowledgeTopic = null;
        this.render();
      });
    }
    if (scopeBook.highlights.length === 0) {
      pane.createEl("p", { text: "\u5F53\u524D\u8303\u56F4\u4E0B\u6CA1\u6709\u53EF\u5206\u6790\u7684\u6458\u5F55\u3002", cls: "readflow-muted" });
      return;
    }
    this.renderGraphSection(pane, book, scopeBook);
    this.renderTopicSummarySection(pane, scopeBook);
    this.renderRelationSection(pane, book, scopeBook);
    await this.renderKnowledgePreviewSection(pane, scopeBook);
  }
  renderGraphSection(container, book, scopeBook) {
    var _a, _b;
    const nodeSet = /* @__PURE__ */ new Set();
    const edges = [];
    for (const h of scopeBook.highlights) {
      for (const rel of (_a = h.relations) != null ? _a : []) {
        nodeSet.add(h.id);
        nodeSet.add(rel.targetId);
        edges.push({ source: h.id, target: rel.targetId, hint: rel.hint, dim: false });
      }
    }
    let usingTopicFallback = false;
    if (nodeSet.size === 0) {
      const topicGroups = /* @__PURE__ */ new Map();
      for (const h of scopeBook.highlights) {
        const t = (h.topic || "").trim();
        if (!t) continue;
        if (!topicGroups.has(t)) topicGroups.set(t, []);
        topicGroups.get(t).push(h);
      }
      for (const [, group] of topicGroups) {
        if (group.length < 2) continue;
        usingTopicFallback = true;
        for (let i = 0; i < group.length - 1; i++) {
          nodeSet.add(group[i].id);
          nodeSet.add(group[i + 1].id);
          edges.push({ source: group[i].id, target: group[i + 1].id, hint: "\u540C\u4E3B\u9898", dim: true });
        }
      }
      const entityGroups = /* @__PURE__ */ new Map();
      for (const h of scopeBook.highlights) {
        for (const ent of (_b = h.entities) != null ? _b : []) {
          const key = ent.toLowerCase().trim();
          if (!key) continue;
          if (!entityGroups.has(key)) entityGroups.set(key, []);
          entityGroups.get(key).push(h);
        }
      }
      for (const [ent, group] of entityGroups) {
        if (group.length < 2) continue;
        usingTopicFallback = true;
        const label = ent.length > 6 ? ent.slice(0, 6) : ent;
        for (let i = 0; i < group.length - 1; i++) {
          nodeSet.add(group[i].id);
          nodeSet.add(group[i + 1].id);
          edges.push({ source: group[i].id, target: group[i + 1].id, hint: label, dim: true });
        }
      }
    }
    const sec = container.createDiv("readflow-knowledge-section readflow-graph-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u5173\u7CFB\u56FE\u8C31", cls: "readflow-knowledge-title" });
    if (nodeSet.size === 0) {
      sec.createEl("p", {
        text: "\u9009\u4E2D\u6458\u5F55 \u2192 \u5EFA\u7ACB\u5173\u7CFB\uFF0C\u6216\u8BBE\u7F6E\u76F8\u540C\u4E3B\u9898\u81EA\u52A8\u751F\u6210",
        cls: "readflow-muted"
      });
      return;
    }
    const allNodes = [...nodeSet].map((id) => book.highlights.find((h) => h.id === id)).filter((h) => !!h);
    const meta = head.createDiv("readflow-inline-actions");
    meta.createEl("span", {
      text: `${allNodes.length} \u8282\u70B9`,
      cls: "readflow-chip readflow-chip--soft"
    });
    meta.createEl("span", {
      text: `${edges.length} \u5173\u7CFB`,
      cls: "readflow-chip"
    });
    if (usingTopicFallback) {
      meta.createEl("span", {
        text: "\u4E3B\u9898\u94FE\uFF08\u865A\u7EBF\uFF09",
        cls: "readflow-chip readflow-chip--accent"
      });
    }
    const resetBtn = meta.createEl("button", { text: "\u91CD\u7F6E\u89C6\u56FE", type: "button" });
    resetBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    const graphWrap = sec.createDiv("readflow-graph-wrap");
    const canvas = graphWrap.createEl("canvas", { cls: "readflow-graph-canvas" });
    const W = graphWrap.clientWidth || 340;
    const H = 260;
    canvas.width = W;
    canvas.height = H;
    const nodes = allNodes.map((h) => {
      var _a2;
      return {
        id: h.id,
        label: h.content.slice(0, 10) + (h.content.length > 10 ? "\u2026" : ""),
        type: (_a2 = h.highlightType) != null ? _a2 : null,
        status: h.status,
        x: W / 2 + (Math.random() - 0.5) * W * 0.55,
        y: H / 2 + (Math.random() - 0.5) * H * 0.55,
        vx: 0,
        vy: 0
      };
    });
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const REPULSE = 2800, SPRING = 0.025, IDEAL = 75, GRAV = 0.01;
    const cx = W / 2, cy = H / 2;
    for (let iter = 0; iter < 280; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist2 = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(dist2);
          const f = REPULSE / dist2;
          const fx = dx / dist * f, fy = dy / dist * f;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }
      for (const edge of edges) {
        const s = nodeMap.get(edge.source), t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (dist - IDEAL) * SPRING;
        const fx = dx / dist * f, fy = dy / dist * f;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }
      for (const n of nodes) {
        n.vx += (cx - n.x) * GRAV;
        n.vy += (cy - n.y) * GRAV;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x = Math.max(20, Math.min(W - 20, n.x + n.vx));
        n.y = Math.max(18, Math.min(H - 18, n.y + n.vy));
      }
    }
    const TYPE_COLORS = {
      idea: "#6366f1",
      method: "#0891b2",
      example: "#059669",
      conclusion: "#dc2626",
      question: "#d97706"
    };
    const HINT_COLORS = {
      "\u8865\u5145": "#059669",
      "\u56E0\u679C": "#dc2626",
      "\u5BF9\u6BD4": "#d97706",
      "\u91CD\u590D": "#94a3b8",
      "\u540C\u4E3B\u9898": "#8b5cf6"
    };
    let scale = 1, tx = 0, ty = 0;
    let hoveredNode = null, activeNode = null;
    let isPanning = false;
    let panOrigin = { x: 0, y: 0 };
    const getColor = (type, status) => {
      var _a2;
      if (status && STATUS_COLORS[status]) return STATUS_COLORS[status];
      if (!type) return "#94a3b8";
      return (_a2 = TYPE_COLORS[type]) != null ? _a2 : "#6366f1";
    };
    const drawRoundRect = (ctx, x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    const draw = () => {
      var _a2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const isDark = document.body.classList.contains("theme-dark");
      const bg = isDark ? "#0f172a" : "#f8fafc";
      const nodeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)";
      const labelColor = "#ffffff";
      const mutedEdge = isDark ? "#334155" : "#cbd5e1";
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      for (const edge of edges) {
        const s = nodeMap.get(edge.source), t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const isConnected = activeNode && (activeNode.id === edge.source || activeNode.id === edge.target);
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist, ny = dy / dist;
        const R2 = 14;
        const sx = s.x + nx * R2, sy = s.y + ny * R2;
        const ex = t.x - nx * R2, ey = t.y - ny * R2;
        const color = isConnected ? (_a2 = HINT_COLORS[edge.hint]) != null ? _a2 : "#6366f1" : edge.dim ? "#8b5cf6" : mutedEdge;
        ctx.strokeStyle = color;
        ctx.lineWidth = (isConnected ? 2 : 1.2) / scale;
        ctx.globalAlpha = isConnected ? 0.9 : activeNode ? 0.2 : edge.dim ? 0.3 : 0.55;
        if (edge.dim) ctx.setLineDash([4 / scale, 4 / scale]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        const angle = Math.atan2(ey - sy, ex - sx);
        const ar = 7 / scale;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - ar * Math.cos(angle - 0.42), ey - ar * Math.sin(angle - 0.42));
        ctx.lineTo(ex - ar * Math.cos(angle + 0.42), ey - ar * Math.sin(angle + 0.42));
        ctx.closePath();
        ctx.fill();
        if (isConnected) {
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = color;
          ctx.font = `${10 / scale}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(edge.hint, (s.x + t.x) / 2, (s.y + t.y) / 2 - 6 / scale);
        }
      }
      ctx.globalAlpha = 1;
      const R = 14;
      for (const node of nodes) {
        const isHov = node === hoveredNode;
        const isActive = node === activeNode;
        const nr = isHov || isActive ? R * 1.35 : R;
        const color = getColor(node.type, node.status);
        const faded = activeNode && !isActive && !edges.some(
          (e) => e.source === activeNode.id && e.target === node.id || e.target === activeNode.id && e.source === node.id
        );
        ctx.globalAlpha = faded ? 0.25 : 1;
        if (isHov || isActive) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 14 / scale;
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nr, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (isActive) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5 / scale;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nr + 2 / scale, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeStyle = nodeBorder;
          ctx.lineWidth = 1.5 / scale;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = faded ? 0.25 : 1;
        ctx.fillStyle = labelColor;
        ctx.font = `bold ${9 / scale}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.x, node.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      if (hoveredNode) {
        const h = book.highlights.find((bh) => bh.id === hoveredNode.id);
        if (h) {
          const sx = hoveredNode.x * scale + tx;
          const sy = hoveredNode.y * scale + ty;
          const text = h.content.slice(0, 56) + (h.content.length > 56 ? "\u2026" : "");
          ctx.font = "11px system-ui, sans-serif";
          const tw = Math.min(ctx.measureText(text).width, 300);
          const bw = tw + 20, bh2 = 30;
          let bx = sx - bw / 2, by = sy - R * scale - bh2 - 10;
          bx = Math.max(4, Math.min(W - bw - 4, bx));
          by = Math.max(4, by);
          const isDark2 = document.body.classList.contains("theme-dark");
          ctx.fillStyle = isDark2 ? "#1e293b" : "#0f172a";
          ctx.globalAlpha = 0.92;
          drawRoundRect(ctx, bx, by, bw, bh2, 6);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#f9fafb";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(text, bx + 10, by + bh2 / 2);
        }
      }
    };
    draw();
    resetBtn.addEventListener("click", () => {
      scale = 1;
      tx = 0;
      ty = 0;
      activeNode = null;
      draw();
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 0.88 : 1.14;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      tx = mx - (mx - tx) * f;
      ty = my - (my - ty) * f;
      scale = Math.max(0.15, Math.min(scale * f, 6));
      draw();
    }, { passive: false });
    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        isPanning = true;
        panOrigin = { x: e.clientX - tx, y: e.clientY - ty };
      }
    });
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - tx) / scale;
      const my = (e.clientY - rect.top - ty) / scale;
      if (isPanning) {
        tx = e.clientX - panOrigin.x;
        ty = e.clientY - panOrigin.y;
        draw();
        return;
      }
      let found = null;
      for (const n of nodes) {
        if (Math.hypot(n.x - mx, n.y - my) < 18) {
          found = n;
          break;
        }
      }
      if (found !== hoveredNode) {
        hoveredNode = found;
        canvas.style.cursor = found ? "pointer" : "grab";
        draw();
      }
    });
    canvas.addEventListener("click", (e) => {
      if (isPanning) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - tx) / scale;
      const my = (e.clientY - rect.top - ty) / scale;
      let clicked = null;
      for (const n of nodes) {
        if (Math.hypot(n.x - mx, n.y - my) < 18) {
          clicked = n;
          break;
        }
      }
      activeNode = (activeNode == null ? void 0 : activeNode.id) === (clicked == null ? void 0 : clicked.id) ? null : clicked;
      draw();
    });
    canvas.addEventListener("mouseup", () => {
      isPanning = false;
    });
    canvas.addEventListener("mouseleave", () => {
      isPanning = false;
      hoveredNode = null;
      draw();
    });
    canvas.addEventListener("dblclick", () => {
      scale = 1;
      tx = 0;
      ty = 0;
      draw();
    });
    const ro = new ResizeObserver(() => {
      const newW = graphWrap.clientWidth;
      if (newW > 0 && newW !== canvas.width) {
        canvas.width = newW;
        draw();
      }
    });
    ro.observe(graphWrap);
  }
  renderTopicSummarySection(container, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u4E3B\u9898\u805A\u5408", cls: "readflow-knowledge-title" });
    const actions = head.createDiv("readflow-inline-actions");
    const timeBtn = actions.createEl("button", { text: "\u6309\u65F6\u95F4", type: "button" });
    timeBtn.classList.add(
      "readflow-btn",
      this.listOrderMode === "time" ? "readflow-btn--secondary" : "readflow-btn--ghost",
      "readflow-btn--sm"
    );
    timeBtn.addEventListener("click", () => {
      this.listOrderMode = "time";
      this.render();
    });
    const topicBtn = actions.createEl("button", { text: "\u6309\u4E3B\u9898\u91CD\u6392", type: "button" });
    topicBtn.classList.add(
      "readflow-btn",
      this.listOrderMode === "topic" ? "readflow-btn--secondary" : "readflow-btn--ghost",
      "readflow-btn--sm"
    );
    topicBtn.addEventListener("click", () => {
      this.listOrderMode = "topic";
      this.render();
    });
    const topics = summarizeTopics(scopeBook).slice(0, 6);
    if (topics.length === 0) {
      sec.createEl("p", { text: "\u6682\u65E0\u4E3B\u9898\u805A\u5408\u7ED3\u679C\u3002", cls: "readflow-muted" });
      return;
    }
    for (const summary of topics) {
      const row = sec.createDiv("readflow-topic-summary");
      if (this.selectedKnowledgeTopic === summary.topic) row.classList.add("readflow-topic-summary--active");
      const main = row.createDiv("readflow-topic-summary-main");
      main.createEl("strong", { text: summary.topic, cls: "readflow-topic-summary-name" });
      main.createEl("span", { text: `${summary.count} \u6761`, cls: "readflow-topic-summary-count" });
      const meta = row.createDiv("readflow-card-meta");
      for (const [type, count] of Object.entries(summary.byType)) {
        meta.createSpan({ cls: "readflow-chip", text: `${type} ${count}` });
      }
      const rowActions = row.createDiv("readflow-inline-actions");
      const scopeBtn = rowActions.createEl("button", {
        text: this.selectedKnowledgeTopic === summary.topic ? "\u53D6\u6D88\u805A\u7126" : "\u53EA\u770B\u6B64\u4E3B\u9898",
        type: "button"
      });
      scopeBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      scopeBtn.addEventListener("click", () => {
        this.selectedKnowledgeTopic = this.selectedKnowledgeTopic === summary.topic ? null : summary.topic;
        this.render();
      });
    }
  }
  renderRelationSection(container, book, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section");
    sec.createEl("h5", { text: "\u5173\u7CFB\u5EFA\u8BAE", cls: "readflow-knowledge-title" });
    const edges = inferKnowledgeEdges(scopeBook).slice(0, 8);
    if (edges.length === 0) {
      sec.createEl("p", { text: "\u5F53\u524D\u8303\u56F4\u4E0B\u6682\u65E0\u5173\u7CFB\u5EFA\u8BAE\u3002", cls: "readflow-muted" });
      return;
    }
    for (const edge of edges) {
      const source = scopeBook.highlights.find((h) => h.id === edge.sourceId);
      const target = scopeBook.highlights.find((h) => h.id === edge.targetId);
      if (!source || !target) continue;
      const row = sec.createDiv("readflow-edge-row");
      const copy = row.createDiv("readflow-edge-copy");
      copy.createEl("span", {
        text: edge.explicit ? "\u5DF2\u786E\u8BA4" : "\u63A8\u65AD",
        cls: `readflow-chip ${edge.explicit ? "readflow-chip--soft" : "readflow-chip--accent"}`
      });
      copy.createEl("p", {
        text: `${source.content.slice(0, 24)}${source.content.length > 24 ? "\u2026" : ""} \u2192 ${target.content.slice(0, 24)}${target.content.length > 24 ? "\u2026" : ""}`,
        cls: "readflow-card-note-text"
      });
      const actions = row.createDiv("readflow-inline-actions");
      const hintWrap = actions.createDiv("readflow-hint-input-wrap");
      const hintSelect = hintWrap.createEl("select", { cls: "readflow-select readflow-select--sm" });
      for (const hint of RELATION_HINT_OPTIONS) {
        const opt = hintSelect.createEl("option", { text: hint });
        opt.value = hint;
      }
      hintSelect.createEl("option", { value: "__custom__", text: "\u81EA\u5B9A\u4E49\u2026" });
      hintSelect.value = RELATION_HINT_OPTIONS.includes(edge.hint) ? edge.hint : "__custom__";
      const customInput = hintWrap.createEl("input", {
        cls: "readflow-input readflow-input--sm",
        type: "text",
        placeholder: "\u5173\u7CFB\u7C7B\u578B\uFF08\u5982\uFF1A\u5E08\u627F\uFF09"
      });
      customInput.value = RELATION_HINT_OPTIONS.includes(edge.hint) ? "" : edge.hint;
      customInput.style.display = hintSelect.value === "__custom__" ? "block" : "none";
      hintSelect.addEventListener("change", () => {
        customInput.style.display = hintSelect.value === "__custom__" ? "block" : "none";
      });
      const getHintValue = () => hintSelect.value === "__custom__" ? customInput.value.trim() || "\u81EA\u5B9A\u4E49" : hintSelect.value;
      if (edge.explicit) {
        const updateBtn = actions.createEl("button", { text: "\u66F4\u65B0", type: "button" });
        updateBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
        updateBtn.addEventListener(
          "click",
          () => this.updateKnowledgeEdge(book, edge.sourceId, edge.targetId, getHintValue())
        );
        const deleteBtn = actions.createEl("button", { text: "\u5220\u9664", type: "button" });
        deleteBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
        deleteBtn.addEventListener("click", () => this.removeKnowledgeEdge(book, edge.sourceId, edge.targetId, edge.hint));
      } else {
        const adoptBtn = actions.createEl("button", { text: "\u91C7\u7EB3", type: "button" });
        adoptBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
        adoptBtn.addEventListener(
          "click",
          () => this.applyKnowledgeEdge(book, { ...edge, hint: getHintValue() })
        );
      }
    }
  }
  async renderKnowledgePreviewSection(container, scopeBook) {
    const mmSec = container.createDiv("readflow-knowledge-section readflow-mm-section");
    const mmHead = mmSec.createDiv("readflow-section-inline-head");
    mmHead.createEl("h5", { text: "\u77E5\u8BC6\u8111\u56FE", cls: "readflow-knowledge-title" });
    const mmActions = mmHead.createDiv("readflow-inline-actions");
    const expandBtn = mmActions.createEl("button", { text: "\u2922 \u5C55\u5F00\u5927\u56FE", type: "button" });
    expandBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    expandBtn.addEventListener("click", () => this.openMindMapExpanded(scopeBook));
    renderMindMapCanvas(mmSec, scopeBook, null);
    this.renderKnowledgeCrystallize(container, scopeBook);
    this.renderLocalReaderEntry(container, scopeBook);
    const sec = container.createDiv("readflow-knowledge-section readflow-mermaid-section");
    const mermaidHead = sec.createDiv("readflow-section-inline-head");
    mermaidHead.createEl("h5", { text: "MERMAID", cls: "readflow-knowledge-title" });
    const mermaidToggle = { collapsed: true };
    const mermaidBody = sec.createDiv("readflow-mermaid-body");
    mermaidBody.style.display = "none";
    const toggleBtn = mermaidHead.createEl("button", { text: "\u5C55\u5F00", type: "button" });
    toggleBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    toggleBtn.addEventListener("click", async () => {
      mermaidToggle.collapsed = !mermaidToggle.collapsed;
      mermaidBody.style.display = mermaidToggle.collapsed ? "none" : "block";
      toggleBtn.setText(mermaidToggle.collapsed ? "\u5C55\u5F00" : "\u6536\u8D77");
      if (!mermaidToggle.collapsed && mermaidBody.childElementCount === 0) {
        await this.renderMarkdownCard(mermaidBody, "\u4E3B\u9898\u8111\u56FE", buildTopicMindmap(scopeBook), "\u6682\u65E0");
        await this.renderMarkdownCard(mermaidBody, "\u903B\u8F91\u5173\u7CFB", buildRelationsMermaid(scopeBook), "\u6682\u65E0");
        await this.renderMarkdownCard(mermaidBody, "\u6838\u5FC3\u89C2\u70B9", buildCoreInsights(scopeBook), "\u6682\u65E0");
      }
    });
  }
  openMindMapExpanded(scopeBook) {
    const modal = new import_obsidian5.Modal(this.app);
    modal.titleEl.setText(scopeBook.title + " \u2014 \u77E5\u8BC6\u8111\u56FE");
    modal.modalEl.addClass("readflow-modal-root", "readflow-mm-modal");
    const { contentEl } = modal;
    contentEl.empty();
    contentEl.addClass("readflow-mm-modal-body");
    const hint = contentEl.createDiv("readflow-mm-modal-hint");
    hint.createEl("span", { text: "\u70B9\u51FB\u5C55\u5F00\u6536\u8D77 \xB7 \u6EDA\u8F6E\u7F29\u653E \xB7 \u62D6\u62FD\u5E73\u79FB \xB7 \u53CC\u51FB\u91CD\u7F6E", cls: "readflow-muted" });
    const fitBtn = hint.createEl("button", { text: "\u9002\u5E94\u7A97\u53E3", type: "button" });
    fitBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    renderMindMapCanvas(contentEl, scopeBook, null);
    const canvasEl = contentEl.querySelector(".readflow-mm-canvas");
    if (canvasEl) {
      canvasEl.classList.add("readflow-mm-canvas--expanded");
    }
    fitBtn.addEventListener("click", () => {
      if (canvasEl) canvasEl.dispatchEvent(new MouseEvent("dblclick"));
    });
    modal.open();
  }
  renderLocalReaderEntry(container, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section readflow-reader-entry");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u672C\u5730\u9605\u8BFB", cls: "readflow-knowledge-title" });
    const body = sec.createDiv("readflow-reader-entry-body");
    body.createEl("p", {
      text: "\u5C06\u672C\u5730 EPUBTXT \u6587\u4EF6\u4EEC\u5F15\u5165 Obsidian\uFF0C\u5373\u53EF\u5728\u8BFB\u8BFA\u6A21\u5F0F\u4E2D\u9605\u8BFB\u5E76\u76F4\u63A5\u6458\u5F55\u3002\u73B0\u6709\u300C\u624B\u52A8\u6458\u5F55\u300D\u6309\u94AE\u5DF2\u652F\u6301\u4ECE\u5F53\u524D\u6587\u6863\u63D0\u53D6\u4E0A\u4E0B\u6587\u3002",
      cls: "readflow-muted"
    });
    const actions = head.createDiv("readflow-inline-actions");
    const readLocalBtn = actions.createEl("button", { text: "\u5F00\u542F\u8BFB\u8BFA\u6A21\u5F0F", type: "button" });
    readLocalBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    readLocalBtn.addEventListener("click", () => this.openLocalReaderModal(scopeBook));
  }
  openLocalReaderModal(scopeBook) {
    const modal = new import_obsidian5.Modal(this.app);
    modal.titleEl.setText(scopeBook.title + " \u2014 \u8BFB\u8BFA\u6A21\u5F0F");
    modal.modalEl.addClass("readflow-modal-root", "readflow-reader-modal");
    const { contentEl } = modal;
    contentEl.empty();
    contentEl.addClass("readflow-reader-modal-body");
    const navBar = contentEl.createDiv("readflow-reader-nav");
    const chapters = buildChapterTree(scopeBook.highlights);
    const chapterSelect = navBar.createEl("select", { cls: "readflow-reader-chapter-select" });
    chapterSelect.createEl("option", { value: "", text: "\u2014\u9009\u62E9\u7AE0\u8282\u2014" });
    for (const ch of chapters) {
      chapterSelect.createEl("option", { value: String(ch.chapterUid || ch.chapter), text: ch.chapter + " (" + ch.highlights.length + "\u6761)" });
    }
    const contentArea = contentEl.createDiv("readflow-reader-content");
    const hint = contentArea.createDiv("readflow-reader-hint");
    hint.createEl("p", { text: "\u9009\u62E9\u4E0A\u65B9\u7AE0\u8282\u540E\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u641C\u7D22\u672C\u5730\u6587\u4EF6\u4E2D\u7684\u7AE0\u8282\u5185\u5BB9\uFF0C\u5E76\u5728\u6B63\u6587\u4E2D\u9AD8\u4EAE\u60A8\u7684\u6458\u5F55\u3002", cls: "readflow-muted" });
    const hlHighlight = contentArea.createDiv("readflow-reader-highlights");
    const hlHead = hlHighlight.createDiv("readflow-reader-hl-head");
    hlHead.createEl("h4", { text: "\u5F53\u524D\u7AE0\u8282\u6458\u5F55", cls: "readflow-reader-hl-title" });
    const hlList = hlHighlight.createDiv("readflow-reader-hl-list");
    const loadChapter = (chapterName) => {
      hlList.empty();
      const chHighlights = scopeBook.highlights.filter((h) => (h.chapter || "") === chapterName);
      if (chHighlights.length === 0) {
        hlList.createEl("p", { text: "\u6B64\u7AE0\u8282\u6682\u65E0\u6458\u5F55", cls: "readflow-muted" });
        return;
      }
      for (const h of chHighlights) {
        const row = hlList.createDiv("readflow-card");
        row.createDiv("readflow-card-body").setText(h.content);
        const meta = row.createDiv("readflow-card-meta");
        if (h.highlightType) meta.createSpan({ cls: "readflow-chip readflow-chip--accent", text: h.highlightType });
        if (h.note) {
          const noteEl = row.createDiv("readflow-card-note");
          noteEl.createEl("span", { text: "\u60F3\u6CD5", cls: "readflow-card-note-label" });
          noteEl.createEl("p", { text: h.note, cls: "readflow-card-note-text" });
        }
        const captureBtn = row.createDiv("readflow-card-actions").createEl("button", {
          text: "\u523A\u4E3E\u6458\u5F55",
          type: "button",
          cls: "readflow-btn readflow-btn--primary readflow-btn--sm"
        });
        captureBtn.addEventListener("click", () => {
          new QuickCaptureModal(this.app, this.plugin, {
            book: scopeBook,
            highlight: h,
            compactMode: false
          }, () => {
            void this.plugin.persistDisk();
            this.render();
          }).open();
        });
      }
    };
    chapterSelect.addEventListener("change", () => {
      if (chapterSelect.value) {
        const optText = chapterSelect.options[chapterSelect.selectedIndex].text;
        const chName = optText.replace(/ \(.*?\)$/, "");
        loadChapter(chName);
      }
    });
    modal.open();
  }
  renderKnowledgeCrystallize(container, scopeBook) {
    var _a;
    const sec = container.createDiv("readflow-knowledge-section readflow-crystallize-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u77E5\u8BC6\u7ED3\u6676", cls: "readflow-knowledge-title" });
    const actions = head.createDiv("readflow-inline-actions");
    const cards = (_a = this.plugin.diskData.knowledgeCards) != null ? _a : [];
    const bookCards = cards.filter((c) => c.bookId === scopeBook.bookId);
    if (bookCards.length > 0) {
      actions.createEl("span", { text: bookCards.length + " \u5F20", cls: "readflow-knowledge-badge" });
    }
    const createBtn = actions.createEl("button", { text: "+ \u65B0\u5EFA\u77E5\u8BC6\u5361", type: "button" });
    createBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    createBtn.addEventListener("click", () => {
      this.openCrystallizeDialog(scopeBook);
    });
    if (bookCards.length > 0) {
      const list = sec.createDiv("readflow-crystallize-list");
      for (const card of bookCards.slice(0, 8)) {
        const row = list.createDiv("readflow-crystallize-card");
        const main = row.createDiv("readflow-crystallize-card-main");
        main.createEl("strong", { text: card.title, cls: "readflow-crystallize-title" });
        main.createEl("p", {
          text: card.insight.slice(0, 80) + (card.insight.length > 80 ? "\u2026" : ""),
          cls: "readflow-crystallize-insight"
        });
        const meta = row.createDiv("readflow-card-meta");
        meta.createSpan({ cls: "readflow-chip readflow-chip--soft", text: card.sourceHighlightIds.length + " \u6761\u6765\u6E90" });
        if (card.tags.length > 0) {
          meta.createSpan({ cls: "readflow-chip", text: card.tags.slice(0, 3).join(", ") });
        }
        meta.createSpan({ cls: "readflow-chip", text: new Date(card.createdAt).toLocaleDateString("zh-CN") });
        const rowActions = row.createDiv("readflow-inline-actions");
        const exportBtn = rowActions.createEl("button", { text: "\u5BFC\u51FA\u7B14\u8BB0", type: "button" });
        exportBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
        exportBtn.addEventListener("click", async () => {
          try {
            const book = this.plugin.diskData.books[card.bookId];
            const md = buildKnowledgeExportMd(card, book);
            const dir = this.plugin.settings.booksBasePath || "Books";
            const path = `${dir}/\u77E5\u8BC6\u5361/${safeSegment(card.title)}.md`;
            const folder = path.substring(0, path.lastIndexOf("/"));
            if (!this.app.vault.getAbstractFileByPath(folder)) {
              await this.app.vault.createFolder(folder);
            }
            const existing = this.app.vault.getAbstractFileByPath(path);
            if (existing) {
              await this.app.vault.modify(existing, md);
            } else {
              await this.app.vault.create(path, md);
            }
            new import_obsidian5.Notice("\u5DF2\u5BFC\u51FA: " + path);
          } catch (e) {
            console.error(e);
            new import_obsidian5.Notice("\u5BFC\u51FA\u5931\u8D25\uFF0C\u67E5\u770B\u63A7\u5236\u53F0");
          }
        });
      }
    } else {
      sec.createEl("p", {
        text: "\u52FE\u9009\u6458\u5F55 \u2192 \u65B0\u5EFA\u77E5\u8BC6\u5361 \u2192 \u5BFC\u51FA Vault",
        cls: "readflow-muted readflow-crystallize-oneliner"
      });
    }
  }
  openCrystallizeDialog(scopeBook) {
    var _a;
    const selectedIds = [...this.selectedHighlightIds];
    const sourceHighlights = selectedIds.length > 0
      ? scopeBook.highlights.filter((h) => this.selectedHighlightIds.has(h.id))
      : scopeBook.highlights.filter((h) => h.status === "processed" && h.importance >= 4).slice(0, 5);
    const modal = new import_obsidian5.Modal(this.app);
    modal.titleEl.setText("\u521B\u5EFA\u77E5\u8BC6\u5361");
    modal.modalEl.addClass("readflow-modal-root");
    const { contentEl } = modal;
    contentEl.addClass("readflow-capture-modal");
    let cardTitle = "";
    let cardInsight = "";
    let cardTags = "";
    const sourceSec = contentEl.createDiv("readflow-modal-section");
    sourceSec.createEl("h4", { text: "\u6765\u6E90\u6458\u5F55 (" + sourceHighlights.length + " \u6761)" });
    if (sourceHighlights.length === 0) {
      sourceSec.createEl("p", {
        text: "\u8BF7\u5148\u5728\u5DE6\u4FA7\u5217\u8868\u52FE\u9009\u6458\u5F55\uFF0C\u6216\u786E\u4FDD\u5DF2\u6709\u91CD\u8981\u5EA6 \u2265 4 \u7684\u5DF2\u5904\u7406\u6458\u5F55\u3002",
        cls: "readflow-muted"
      });
    } else {
      for (const h of sourceHighlights.slice(0, 6)) {
        const row = sourceSec.createDiv("readflow-related-row");
        const tag = h.highlightType ? " [" + (HIGHLIGHT_TYPE_LABELS[h.highlightType] || h.highlightType) + "]" : "";
        row.createEl("span", { text: h.content.slice(0, 80) + (h.content.length > 80 ? "\u2026" : "") + tag });
      }
    }
    const inputSec = contentEl.createDiv("readflow-modal-section");
    inputSec.createEl("h4", { text: "\u77E5\u8BC6\u63D0\u70BC" });
    new import_obsidian5.Setting(inputSec).setName("\u77E5\u8BC6\u70B9\u6807\u9898").setDesc("\u7528\u4E00\u53E5\u8BDD\u6982\u62EC\u8FD9\u4E2A\u77E5\u8BC6\u70B9").addText((t) => {
      t.setPlaceholder("\u4F8B\uFF1A\u590D\u5229\u7684\u529B\u91CF\u4E0E\u957F\u671F\u4E3B\u4E49").onChange((v) => cardTitle = v);
      t.inputEl.style.width = "100%";
    });
    new import_obsidian5.Setting(inputSec).setName("\u6838\u5FC3\u89C1\u89E3").setDesc("\u7528\u81EA\u5DF1\u7684\u8BDD\u603B\u7ED3\u2014\u2014\u8FD9\u662F\u4ECE\u6458\u5F55\u5230\u77E5\u8BC6\u7684\u5173\u952E\u4E00\u6B65").addTextArea((ta) => {
      ta.setPlaceholder("\u6211\u4ECE\u8FD9\u4E9B\u6458\u5F55\u4E2D\u7406\u89E3\u5230\u2026").onChange((v) => cardInsight = v);
      ta.inputEl.rows = 4;
      ta.inputEl.style.width = "100%";
    });
    new import_obsidian5.Setting(inputSec).setName("\u6807\u7B7E\uFF08\u53EF\u9009\uFF09").setDesc("\u9017\u53F7\u5206\u9694\uFF0C\u7528\u4E8E\u8DE8\u4E66\u77E5\u8BC6\u5173\u8054").addText((t) => {
      t.setPlaceholder("\u4F8B\uFF1A\u6295\u8D44, \u590D\u5229, \u957F\u671F\u4E3B\u4E49").onChange((v) => cardTags = v);
    });
    const actionSec = contentEl.createDiv("readflow-modal-actions");
    const cancelBtn = actionSec.createEl("button", { text: "\u53D6\u6D88", type: "button" });
    cancelBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    cancelBtn.addEventListener("click", () => modal.close());
    const saveBtn = actionSec.createEl("button", { text: "\u521B\u5EFA\u77E5\u8BC6\u5361", type: "button" });
    saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
    saveBtn.addEventListener("click", async () => {
      if (!cardTitle.trim()) { new import_obsidian5.Notice("\u8BF7\u586B\u5199\u77E5\u8BC6\u70B9\u6807\u9898"); return; }
      if (!cardInsight.trim()) { new import_obsidian5.Notice("\u8BF7\u586B\u5199\u6838\u5FC3\u89C1\u89E3"); return; }
      const card = generateKnowledgeCard(
        scopeBook,
        sourceHighlights.map((h) => h.id),
        cardTitle.trim(),
        cardInsight.trim()
      );
      card.tags = cardTags.split(",").map((s) => s.trim()).filter(Boolean);
      if (!this.plugin.diskData.knowledgeCards) this.plugin.diskData.knowledgeCards = [];
      this.plugin.diskData.knowledgeCards.push(card);
      await this.plugin.persistDisk();
      new import_obsidian5.Notice("\u5DF2\u521B\u5EFA\u77E5\u8BC6\u5361: " + card.title);
      modal.close();
      this.render();
    });
    modal.open();
  }
  async renderMarkdownCard(container, title, markdown, emptyText) {
    const card = container.createDiv("readflow-knowledge-render");
    card.createEl("h6", { text: title, cls: "readflow-knowledge-subtitle" });
    const body = card.createDiv("readflow-knowledge-render-body");
    if (!markdown.trim()) {
      body.createEl("p", { text: emptyText, cls: "readflow-muted" });
      return;
    }
    try {
      await import_obsidian5.MarkdownRenderer.render(this.app, markdown, body, "", this);
    } catch (error) {
      console.error("[ReadFlow] render knowledge preview failed", error);
      body.createEl("pre", { text: markdown, cls: "readflow-knowledge-code" });
    }
  }
  buildKnowledgeScope(book, visible) {
    const selected = book.highlights.filter((h) => this.selectedHighlightIds.has(h.id));
    return {
      ...book,
      highlights: selected.length > 0 ? selected : visible
    };
  }
  applyKnowledgeEdge(book, edge) {
    this.updateManyHighlights(book, (highlight) => {
      var _a, _b;
      if (highlight.id !== edge.sourceId) return highlight;
      const relations = [...(_a = highlight.relations) != null ? _a : []];
      const exists = relations.some((row) => row.targetId === edge.targetId && row.hint === edge.hint);
      if (!exists) relations.push({ targetId: edge.targetId, hint: edge.hint });
      return {
        ...highlight,
        relations,
        relationHints: [.../* @__PURE__ */ new Set([...(_b = highlight.relationHints) != null ? _b : [], edge.hint])],
        status: "processed"
      };
    });
  }
  updateKnowledgeEdge(book, sourceId, targetId, nextHint) {
    this.updateManyHighlights(book, (highlight) => {
      var _a, _b;
      if (highlight.id !== sourceId) return highlight;
      const nextRelations = ((_a = highlight.relations) != null ? _a : []).map(
        (row) => row.targetId === targetId ? { ...row, hint: nextHint } : row
      );
      return {
        ...highlight,
        relations: nextRelations,
        relationHints: [.../* @__PURE__ */ new Set([...(_b = highlight.relationHints) != null ? _b : [], nextHint])],
        status: "processed"
      };
    });
  }
  removeKnowledgeEdge(book, sourceId, targetId, hint) {
    this.updateManyHighlights(book, (highlight) => {
      var _a;
      if (highlight.id !== sourceId) return highlight;
      const nextRelations = ((_a = highlight.relations) != null ? _a : []).filter(
        (row) => !(row.targetId === targetId && row.hint === hint)
      );
      return {
        ...highlight,
        relations: nextRelations.length > 0 ? nextRelations : void 0
      };
    });
  }
  createDetachedListPanel(book, tree) {
    var _a;
    const panel = document.createElement("div");
    panel.className = "readflow-detached-panel readflow-panel-root";
    const header = document.createElement("div");
    header.className = "readflow-detached-panel-header";
    panel.appendChild(header);
    const titleWrap = document.createElement("div");
    titleWrap.className = "readflow-detached-panel-titlerow";
    header.appendChild(titleWrap);
    const titleEl = document.createElement("span");
    titleEl.className = "readflow-detached-panel-title";
    titleEl.textContent = book.title;
    titleWrap.appendChild(titleEl);
    const summaryEl = document.createElement("span");
    summaryEl.className = "readflow-detached-summary readflow-list-summary";
    summaryEl.textContent = "";
    titleWrap.appendChild(summaryEl);
    const dockBtn = document.createElement("button");
    dockBtn.className = "readflow-btn readflow-btn--ghost readflow-btn--sm";
    dockBtn.textContent = "\u21A9 \u5F52\u4F4D";
    dockBtn.title = "\u5C06\u6458\u5F55\u5217\u8868\u5F52\u4F4D\u5230\u4E3B\u9762\u677F";
    dockBtn.addEventListener("click", () => {
      this.listDetached = false;
      this.render();
    });
    header.appendChild(dockBtn);
    const chapterNav = document.createElement("div");
    chapterNav.className = "readflow-detached-chapter-nav";
    panel.appendChild(chapterNav);
    const chapterSelect = document.createElement("select");
    chapterSelect.className = "readflow-select readflow-select--sm readflow-detached-chapter-select";
    const allOpt = document.createElement("option");
    allOpt.value = "";
    allOpt.textContent = `\u5168\u90E8\u7AE0\u8282 (${book.highlights.length})`;
    chapterSelect.appendChild(allOpt);
    for (const node of tree) {
      const opt = document.createElement("option");
      opt.value = node.chapter;
      opt.textContent = `${node.chapter.length > 20 ? node.chapter.slice(0, 20) + "\u2026" : node.chapter} \xB7 ${node.highlights.length}`;
      if (this.selectedChapter === node.chapter) opt.selected = true;
      chapterSelect.appendChild(opt);
    }
    chapterSelect.value = (_a = this.selectedChapter) != null ? _a : "";
    chapterSelect.addEventListener("change", () => {
      this.selectedChapter = chapterSelect.value || null;
      if (this.currentBook && this.currentTree) {
        this.renderVisibleList(this.currentBook, this.currentTree);
      }
    });
    chapterNav.appendChild(chapterSelect);
    const inboxToggle = document.createElement("button");
    inboxToggle.className = `readflow-btn readflow-btn--sm ${this.onlyInbox ? "readflow-btn--secondary" : "readflow-btn--ghost"}`;
    inboxToggle.textContent = "\u4EC5\u672A\u6574\u7406";
    inboxToggle.title = "\u53EA\u663E\u793A\u672A\u6574\u7406\u7684\u6458\u5F55";
    inboxToggle.addEventListener("click", () => {
      this.onlyInbox = !this.onlyInbox;
      inboxToggle.className = `readflow-btn readflow-btn--sm ${this.onlyInbox ? "readflow-btn--secondary" : "readflow-btn--ghost"}`;
      if (this.currentBook && this.currentTree) {
        this.renderVisibleList(this.currentBook, this.currentTree);
      }
    });
    chapterNav.appendChild(inboxToggle);
    const content = document.createElement("div");
    content.className = "readflow-detached-panel-content";
    panel.appendChild(content);
    const cardList = document.createElement("div");
    cardList.className = "readflow-card-list";
    content.appendChild(cardList);
    header.addEventListener("mousedown", (e) => {
      if (e.target.closest("button,select,input")) return;
      const rect = panel.getBoundingClientRect();
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.right = "auto";
      let lastX = e.clientX, lastY = e.clientY;
      const onMove = (ev) => {
        const newLeft = parseFloat(panel.style.left) + ev.clientX - lastX;
        const newTop = parseFloat(panel.style.top) + ev.clientY - lastY;
        panel.style.left = `${Math.max(0, Math.min(window.innerWidth - 60, newLeft))}px`;
        panel.style.top = `${Math.max(0, Math.min(window.innerHeight - 60, newTop))}px`;
        lastX = ev.clientX;
        lastY = ev.clientY;
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    });
    document.body.appendChild(panel);
    return panel;
  }
  renderStat(container, label, value) {
    const item = container.createDiv("readflow-stat-card");
    item.createEl("span", { text: label, cls: "readflow-stat-label" });
    item.createEl("strong", { text: value, cls: "readflow-stat-value" });
  }
  makeHighlightDraggable(el, highlightId) {
    el.draggable = true;
    el.addEventListener("dragstart", (evt) => {
      if (!evt.dataTransfer) return;
      evt.dataTransfer.setData("text/readflow-highlight-id", highlightId);
      evt.dataTransfer.effectAllowed = "move";
      el.classList.add("readflow-dragging");
    });
    el.addEventListener("dragend", () => el.classList.remove("readflow-dragging"));
  }
  makeChapterDropTarget(el, book, chapter, chapterUid) {
    el.addEventListener("dragover", (evt) => {
      evt.preventDefault();
      el.classList.add("readflow-nav-item--drop");
    });
    el.addEventListener("dragleave", () => el.classList.remove("readflow-nav-item--drop"));
    el.addEventListener("drop", (evt) => {
      var _a;
      evt.preventDefault();
      el.classList.remove("readflow-nav-item--drop");
      const highlightId = ((_a = evt.dataTransfer) == null ? void 0 : _a.getData("text/readflow-highlight-id")) || "";
      if (!highlightId) return;
      this.assignHighlightToChapter(book, highlightId, chapter, chapterUid);
      this.selectedChapter = chapter;
      this.render();
    });
  }
  assignHighlightToLane(book, highlightId, lane) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const isStatusLane = STATUS_FLOW.includes(lane);
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) => {
        if (h.id !== highlightId) return h;
        if (isStatusLane) {
          return { ...h, status: lane };
        }
        if (lane === "inbox") {
          return {
            ...h,
            status: "inbox",
            highlightType: void 0
          };
        }
        return {
          ...h,
          status: "processed",
          highlightType: lane
        };
      }),
      lastSync: Date.now()
    };
    void this.plugin.persistDisk();
  }
  updateManyHighlights(book, update) {
    var _a;
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    let nextBook = {
      ...cached,
      highlights: cached.highlights.map(update),
      lastSync: Date.now()
    };
    const topics = [
      ...(_a = nextBook.topicCatalog) != null ? _a : [],
      ...nextBook.highlights.map((h) => (h.topic || "").trim()).filter(Boolean)
    ];
    nextBook = {
      ...nextBook,
      topicCatalog: [...new Set(topics)]
    };
    this.plugin.diskData.books[book.bookId] = nextBook;
    void this.plugin.persistDisk();
    this.render();
  }
  linkSelectedHighlights(book, hint) {
    const ids = [...this.selectedHighlightIds];
    this.updateManyHighlights(book, (h) => {
      var _a, _b;
      if (!this.selectedHighlightIds.has(h.id)) return h;
      const prevRelations = (_a = h.relations) != null ? _a : [];
      const nextRelations = [...prevRelations];
      for (const targetId of ids) {
        if (targetId === h.id) continue;
        const exists = nextRelations.some((row) => row.targetId === targetId && row.hint === hint);
        if (!exists) nextRelations.push({ targetId, hint });
      }
      const hints = [.../* @__PURE__ */ new Set([...(_b = h.relationHints) != null ? _b : [], hint])];
      return {
        ...h,
        relations: nextRelations,
        relationHints: hints,
        status: "processed"
      };
    });
  }
  assignHighlightToChapter(book, highlightId, chapter, chapterUid) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map(
        (h) => h.id === highlightId ? {
          ...h,
          chapter,
          chapterUid
        } : h
      ),
      lastSync: Date.now()
    };
    void this.plugin.persistDisk();
  }
  buildTopicStats(book) {
    var _a, _b, _c;
    const topics = /* @__PURE__ */ new Map();
    for (const topic of (_a = book.topicCatalog) != null ? _a : []) {
      const key = topic.trim();
      if (!key) continue;
      topics.set(key, (_b = topics.get(key)) != null ? _b : 0);
    }
    for (const h of book.highlights) {
      const key = (h.topic || "").trim();
      if (!key) continue;
      topics.set(key, ((_c = topics.get(key)) != null ? _c : 0) + 1);
    }
    return topics;
  }
  createTopic(book, topic) {
    var _a;
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const catalog = [.../* @__PURE__ */ new Set([...(_a = cached.topicCatalog) != null ? _a : [], topic])];
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      topicCatalog: catalog,
      lastSync: Date.now()
    };
    void this.plugin.persistDisk();
  }
  renameTopic(book, from, to) {
    var _a;
    if (from === to) return;
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) => (h.topic || "").trim() === from ? { ...h, topic: to } : h),
      topicCatalog: [...new Set(((_a = cached.topicCatalog) != null ? _a : []).map((topic) => topic === from ? to : topic).concat(to))],
      lastSync: Date.now()
    };
    void this.plugin.persistDisk();
  }
  mergeTopic(book, from, to) {
    var _a;
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) => (h.topic || "").trim() === from ? { ...h, topic: to } : h),
      topicCatalog: [...new Set(((_a = cached.topicCatalog) != null ? _a : []).filter((topic) => topic !== from).concat(to))],
      lastSync: Date.now()
    };
    void this.plugin.persistDisk();
  }
  renderMetaRow(container, label, value) {
    const row = container.createDiv("readflow-meta-row");
    row.createEl("span", { text: label, cls: "readflow-meta-label" });
    row.createEl("span", { text: value, cls: "readflow-meta-value" });
  }
  formatTime(ts) {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "-";
    }
  }
  getSelectedBook(books) {
    const curId = localStorage.getItem("readflow.selectedBookId");
    if (curId) return books.find((b) => b.bookId === curId);
    return books[0];
  }
};

// src/ui/WereadLoginWindow.ts
var import_obsidian6 = require("obsidian");
var WEREAD_LOGIN = "https://weread.qq.com/#login";
var WEREAD_HOME = "https://weread.qq.com/";
function parseCookieHeader(cookieInput) {
  if (!cookieInput) return [];
  const raw = Array.isArray(cookieInput) ? cookieInput.join("; ") : cookieInput;
  if (raw === "") return [];
  return raw.split(";").map((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) {
      try {
        return { name: decodeURIComponent(pair.trim()), value: "" };
      } catch (e) {
        return { name: pair.trim(), value: "" };
      }
    }
    const nameRaw = pair.slice(0, idx).trim();
    const valueRaw = pair.slice(idx + 1).trim();
    try {
      return { name: decodeURIComponent(nameRaw), value: decodeURIComponent(valueRaw) };
    } catch (e) {
      return { name: nameRaw, value: valueRaw };
    }
  });
}
function pairsToHeaderString(pairs) {
  return pairs.map((c) => `${c.name}=${c.value}`).join("; ");
}
function getRequire() {
  try {
    if (typeof window !== "undefined") {
      const w = window;
      if (typeof w.require === "function") return w.require;
    }
  } catch (e) {
  }
  try {
    return require;
  } catch (e) {
    return null;
  }
}
function getElectronRemote() {
  const req = getRequire();
  if (!req) return null;
  try {
    const er = req("@electron/remote");
    if ((er == null ? void 0 : er.BrowserWindow) && er.getCurrentWindow) return er;
  } catch (e) {
  }
  try {
    const electron = req("electron");
    const r = electron.remote;
    if ((r == null ? void 0 : r.BrowserWindow) && r.getCurrentWindow) {
      return r;
    }
  } catch (e) {
  }
  return null;
}
function getChromeLikeUA() {
  try {
    const req = getRequire();
    if (req) {
      const proc = req("process");
      if ((proc == null ? void 0 : proc.platform) === "win32") {
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
      }
    }
  } catch (e) {
  }
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
}
var WereadLoginWindow = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.modal = null;
    this.handled = false;
  }
  dispose() {
    var _a;
    try {
      (_a = this.modal) == null ? void 0 : _a.close();
    } catch (e) {
    }
    this.modal = null;
    this.handled = false;
  }
  async open() {
    if (!import_obsidian6.Platform.isDesktopApp) {
      new import_obsidian6.Notice("\u79FB\u52A8\u7AEF\u8BF7\u624B\u52A8\u7C98\u8D34 Cookie\uFF08\u8BBE\u7F6E \u2192 ReadFlow\uFF09");
      return;
    }
    const remote = getElectronRemote();
    if (!remote) {
      new import_obsidian6.Notice("\u5F53\u524D Obsidian/Electron \u65E0\u6CD5\u4F7F\u7528\u5185\u7F6E\u767B\u5F55\uFF0C\u8BF7\u624B\u52A8\u7C98\u8D34 Cookie");
      return;
    }
    this.handled = false;
    const { BrowserWindow, getCurrentWindow } = remote;
    let parent;
    try {
      parent = getCurrentWindow();
    } catch (e) {
      parent = void 0;
    }
    try {
      this.modal = new BrowserWindow({
        ...parent ? { parent } : {},
        width: 960,
        height: 540,
        show: false,
        autoHideMenuBar: true,
        /**
         * 新版 Electron 默认 sandbox: true，部分站点在子窗体中会加载失败；
         * 与多数「内嵌登录」插件一致使用 sandbox: false。
         */
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false
        }
      });
    } catch (e) {
      console.error("[ReadFlow] \u521B\u5EFA\u767B\u5F55\u7A97\u53E3\u5931\u8D25", e);
      new import_obsidian6.Notice(
        `\u65E0\u6CD5\u521B\u5EFA\u767B\u5F55\u7A97\u53E3\uFF1A${e instanceof Error ? e.message : String(e)}\u3002\u8BF7\u5C1D\u8BD5\u624B\u52A8\u7C98\u8D34 Cookie\u3002`,
        8e3
      );
      return;
    }
    this.modal.webContents.setUserAgent(getChromeLikeUA());
    this.modal.once("ready-to-show", () => {
      var _a, _b;
      (_a = this.modal) == null ? void 0 : _a.setTitle("\u767B\u5F55\u5FAE\u4FE1\u8BFB\u4E66\uFF08ReadFlow\uFF09");
      (_b = this.modal) == null ? void 0 : _b.show();
    });
    const session = this.modal.webContents.session;
    const finishOk = async (cookieStr) => {
      var _a;
      if (this.handled) return;
      this.handled = true;
      this.plugin.settings.wereadCookie = cookieStr;
      await this.plugin.persistDisk();
      new import_obsidian6.Notice("\u5FAE\u4FE1\u8BFB\u4E66 Cookie \u5DF2\u4FDD\u5B58");
      (_a = this.modal) == null ? void 0 : _a.close();
      this.modal = null;
    };
    const trySyncFromSession = async () => {
      if (this.handled || !this.modal) return;
      const str = await readSessionCookieString(this.modal);
      if (!str) return;
      const ok = await verifyCookieRough(str);
      if (ok) await finishOk(str);
    };
    session.webRequest.onCompleted(
      { urls: ["https://weread.qq.com/api/auth/getLoginInfo?uid=*"] },
      (details) => {
        var _a;
        if (details.statusCode === 200) {
          void ((_a = this.modal) == null ? void 0 : _a.loadURL("https://weread.qq.com/web/shelf"));
          void trySyncFromSession();
        }
      }
    );
    session.webRequest.onSendHeaders(
      { urls: ["https://weread.qq.com/web/user?userVid=*"] },
      (details) => {
        var _a, _b;
        const raw = (_a = details.requestHeaders["Cookie"]) != null ? _a : details.requestHeaders["cookie"];
        if (raw === void 0) return;
        const cookieArr = parseCookieHeader(raw);




// ===== login (WereadLoginWindow) =====
