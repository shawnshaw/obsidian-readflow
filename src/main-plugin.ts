// NOT IN BUILD CHAIN — see src/README.md. Runtime entry is src/main.js.
/**
 * ReadFlow Plugin — Main Plugin Class
 * Clean TypeScript rewrite of the minified CJS source.
 */

import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  Editor,
} from "obsidian";

import {
  DEFAULT_SETTINGS,
  ReadFlowSettingTab,
  HeartbeatManager,
} from "./settings";

import { VaultLinker } from "./processor/linker";
import { writeBookToVault } from "./storage/vaultWriter";
import {
  syncAllBooksWithNotes,
  pushNoteToWeread,
  fetchNotebookBooksRaw,
} from "./importer/weread";

import { HighlightPanelView, READFLOW_VIEW_TYPE } from "./ui/HighlightPanelView";
import { QuickCaptureModal } from "./ui/QuickCaptureModal";
import { WereadLoginWindow } from "./ui/WereadLoginWindow";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReadFlowSettings {
  wereadCookie: string;
  booksBasePath: string;
  atomicHighlights: boolean;
  linkerMaxFiles: number;
  linkerIgnorePrefixes: string;
  llmClassifier: {
    enabled: boolean;
    model: string;
    endpoint: string;
    apiKey: string;
  };
  heartbeatEnabled?: boolean;
  heartbeatInterval?: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  content: string;
  note?: string;
  topic?: string;
  entities?: string[];
  chapter?: string;
  chapterUid?: number;
  wereadRange?: string;
  wereadReviewId?: string;
  wereadBookmarkId?: string;
  contextAbstract?: string;
  highlightType?: string;
  status?: string;
  importance?: number;
  createdAt: number;
  sourceType: "weread" | "manual";
  links?: string[];
  relations?: HighlightRelation[];
  relationHints?: string[];
  topicCatalog?: string[];
}

export interface HighlightRelation {
  targetId: string;
  hint: string;
}

export interface Book {
  bookId: string;
  title: string;
  author: string;
  cover?: string;
  highlights: Highlight[];
  lastSync?: number;
  chapterTitleByUid?: Record<string, string>;
  topicCatalog?: string[];
  notebookNoteCount?: number;
  notebookReviewCount?: number;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  insight: string;
  sourceHighlightIds: string[];
  bookId: string;
  bookTitle: string;
  tags: string[];
  connections: KnowledgeCardConnection[];
  createdAt: number;
  importance: number;
}

export interface KnowledgeCardConnection {
  targetId: string;
  targetTitle: string;
  relation: string;
}

export interface DiskData {
  version: number;
  books: Record<string, Book>;
  lastSyncAt?: number;
  knowledgeCards: KnowledgeCard[];
}

export interface SyncProgressEvent {
  phase: "scan" | "sync";
  scanned: number;
  total: number;
  synced: number;
  skipped: number;
  title?: string;
}

export interface HeartbeatBook {
  bookId: string;
  title: string;
  author: string;
  noteCount: number;
  reviewCount: number;
  readUpdateTime: number;
  updateTime: number;
  cover: string;
}

// ─── Plugin Class ────────────────────────────────────────────────────────────

export class ReadFlowPlugin extends Plugin {
  settings: ReadFlowSettings = { ...DEFAULT_SETTINGS };
  diskData: DiskData = { version: 1, books: {}, knowledgeCards: [] };
  wereadLogin: WereadLoginWindow | null = null;
  syncStatusEl: HTMLElement | null = null;
  selectionCaptureEl: HTMLElement | null = null;
  linker: VaultLinker;
  heartbeatManager!: HeartbeatManager;
  heartbeatBooks: HeartbeatBook[] = [];

  constructor(app: App, manifest: { id: string; version: string }) {
    super(app, manifest);
    this.settings = { ...DEFAULT_SETTINGS };
    this.diskData = { version: 1, books: {}, knowledgeCards: [] };
    this.linker = new VaultLinker(this.app, () => this.settings);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async onload(): Promise<void> {
    console.log("[ReadFlow] Plugin loading...");

    await this.loadStorage();

    // Status bar
    this.syncStatusEl = this.addStatusBarItem();
    this.setSyncStatus("ReadFlow：就绪");

    // Settings tab
    this.addSettingTab(new ReadFlowSettingTab(this.app, this));

    // Register view
    this.registerView(
      READFLOW_VIEW_TYPE,
      (leaf) => new HighlightPanelView(leaf, this)
    );

    // Commands
    this.addCommand({
      id: "readflow-open-panel",
      name: "打开阅读面板（主工作区标签）",
      callback: () => void this.openPanel(),
    });

    this.addCommand({
      id: "readflow-sync-weread",
      name: "同步微信读书",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "s" }],
      callback: () => void this.syncWereadAll(),
    });

    this.addCommand({
      id: "readflow-rebuild-link-index",
      name: "重建关联索引",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "r" }],
      callback: async () => {
        await this.linker.rebuildIndexAsync();
        new Notice("关联索引已更新");
      },
    });

    this.addCommand({
      id: "readflow-manual-capture",
      name: "手动摘录",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "n" }],
      callback: () => {
        new QuickCaptureModal(
          this.app,
          this,
          {},
          () => {
            void this.persistDisk();
            this.refreshReadFlowViews();
          }
        ).open();
      },
    });

    this.addCommand({
      id: "readflow-capture-selection",
      name: "摘录当前选中文本到 ReadFlow",
      editorCallback: (editor: Editor) => {
        void this.captureFromEditorSelection(editor);
      },
    });

    this.addCommand({
      id: "readflow-weread-login",
      name: "微信读书登录（桌面）",
      callback: () => this.openWereadLogin(),
    });

    this.addCommand({
      id: "readflow-export-data",
      name: "导出 ReadFlow 数据到 JSON",
      callback: async () => {
        const json = JSON.stringify(this.diskData, null, 2);
        const path = this.app.vault.getAvailablePath("readflow-export.json", ".");
        await this.app.vault.create(path, json);
        new Notice(`已导出：${path}`);
      },
    });

    // Editor context menu
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const selected = editor.getSelection().trim();
        if (!selected) return;
        menu.addItem((item) => {
          item
            .setTitle("摘录到 ReadFlow")
            .setIcon("highlighter")
            .onClick(() => {
              void this.captureFromEditorSelection(editor);
            });
        });
      })
    );

    // Selection capture button
    this.registerDomEvent(
      document,
      "selectionchange",
      () => this.updateSelectionCaptureButton()
    );
    this.registerDomEvent(document, "mouseup", () =>
      this.updateSelectionCaptureButton()
    );
    this.registerDomEvent(document, "keyup", () =>
      this.updateSelectionCaptureButton()
    );
    this.registerDomEvent(document, "mousedown", (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      if (target?.closest(".readflow-selection-capture")) return;
      this.hideSelectionCaptureButton();
    });
    this.registerDomEvent(
      window,
      "scroll",
      () => this.hideSelectionCaptureButton(),
      { capture: true }
    );
    this.registerDomEvent(
      window,
      "resize",
      () => this.hideSelectionCaptureButton()
    );

    // Heartbeat manager
    this.heartbeatManager = new HeartbeatManager(this);
    if (this.settings.heartbeatEnabled) {
      this.heartbeatManager.start(this.settings.heartbeatInterval || 30);
    }

    console.log("[ReadFlow] Plugin loaded");
  }

  onunload(): void {
    this.wereadLogin?.dispose();
    this.wereadLogin = null;
    this.selectionCaptureEl?.remove();
    this.selectionCaptureEl = null;
  }

  // ─── Weread Login ────────────────────────────────────────────────────────

  /** 与 Weread 类似：Electron 子窗口抓取 Cookie */
  openWereadLogin(): void {
    this.wereadLogin?.dispose();
    this.wereadLogin = new WereadLoginWindow(this);
    void this.wereadLogin.open();
  }

  // ─── Storage ─────────────────────────────────────────────────────────────

  async loadStorage(): Promise<void> {
    const raw = (await this.loadData()) as {
      settings?: Partial<ReadFlowSettings>;
      books?: Record<string, Book>;
      lastSyncAt?: number;
      knowledgeCards?: KnowledgeCard[];
    } | null;

    this.settings = Object.assign({}, DEFAULT_SETTINGS, raw?.settings ?? {});
    this.diskData = {
      version: 1,
      books: { ...(raw?.books ?? {}) },
      lastSyncAt: raw?.lastSyncAt,
      knowledgeCards: [...(raw?.knowledgeCards ?? [])],
    };

    // Migration: fix known data quirks
    let migrated = false;
    for (const bid in this.diskData.books) {
      const b = this.diskData.books[bid];
      if (!b?.highlights) continue;
      for (let i = 0; i < b.highlights.length; i++) {
        const h = b.highlights[i];
        const patch: Partial<Highlight> = {};

        if (h.note && h.content && h.note.trim() === h.content.trim()) {
          patch.note = undefined;
        }

        if (!h.wereadReviewId && h.id?.startsWith("weread-rv-")) {
          patch.wereadReviewId = h.id.slice("weread-rv-".length);
        }

        if (Object.keys(patch).length > 0) {
          b.highlights[i] = { ...h, ...patch };
          migrated = true;
        }
      }
    }

    if (migrated) {
      console.log(
        "[ReadFlow] migrated: fixed note/reviewId for",
        Object.keys(this.diskData.books).length,
        "books"
      );
      await this.persistDisk();
    }
  }

  async persistDisk(): Promise<void> {
    const payload = {
      settings: this.settings,
      version: 1,
      books: this.diskData.books,
      lastSyncAt: this.diskData.lastSyncAt,
      knowledgeCards: this.diskData.knowledgeCards ?? [],
    };
    await this.saveData(payload);
  }

  /** Alias for compatibility with setting tab */
  async saveSettings(): Promise<void> {
    await this.persistDisk();
  }

  // ─── Heartbeat ───────────────────────────────────────────────────────────

  /** 获取书架有进度的书（用于心跳同步） */
  async syncHeartbeatData(): Promise<{
    success: boolean;
    books?: HeartbeatBook[];
    booksWithProgress?: number;
    error?: string;
  }> {
    const cookie = this.settings.wereadCookie;
    if (!cookie) return { success: false, error: "请先配置 Cookie" };

    try {
      const cookieRef = { value: cookie };
      const rawBooks = await fetchNotebookBooksRaw(cookieRef);

      const booksWithProgress = rawBooks.filter(
        (b) => (b.noteCount || 0) + (b.reviewCount || 0) > 0
      );

      this.heartbeatBooks = booksWithProgress.map((book) => {
        const info = book.book || {};
        return {
          bookId: info.bookId || book.bookId || "",
          title: info.title || book.title || "未知",
          author: info.author || book.author || "",
          noteCount: book.noteCount || 0,
          reviewCount: book.reviewCount || 0,
          readUpdateTime: info.readUpdateTime || 0,
          updateTime: info.updateTime || 0,
          cover: info.cover || "",
        };
      }).sort(
        (a, b) => (b.readUpdateTime || 0) - (a.readUpdateTime || 0)
      );

      if (cookieRef.value !== this.settings.wereadCookie) {
        this.settings.wereadCookie = cookieRef.value;
      }

      console.log(
        "[ReadFlow] 心跳数据同步完成",
        this.heartbeatBooks.length,
        "本有进度"
      );
      return {
        success: true,
        books: this.heartbeatBooks,
        booksWithProgress: this.heartbeatBooks.length,
      };
    } catch (e) {
      console.error("[ReadFlow] 心跳数据同步失败:", e);
      return { success: false, error: (e as Error).message };
    }
  }

  // ─── Panel / Views ──────────────────────────────────────────────────────

  /**
   * 在中间主工作区打开新标签（与普通笔记同级），
   * 不使用左侧 Ribbon、不占用右侧边栏。
   */
  async openPanel(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(READFLOW_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: READFLOW_VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  refreshReadFlowViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(
      READFLOW_VIEW_TYPE
    )) {
      const v = leaf.view;
      if (v instanceof HighlightPanelView) {
        v.refresh();
      }
    }
  }

  async reloadSelf(): Promise<void> {
    const id = this.manifest.id;
    const plugins = (this.app as any).plugins;
    try {
      await Promise.resolve(plugins.disablePlugin(id));
      await Promise.resolve(plugins.enablePlugin(id));
      new Notice("ReadFlow 已重新加载");
    } catch (e) {
      console.error("[ReadFlow] reloadSelf", e);
      new Notice(
        "重载失败：请在「设置 → 第三方插件」中手动关闭再开启 ReadFlow"
      );
    }
  }

  // ─── Push to Weread ─────────────────────────────────────────────────────

  async pushHighlightNote(
    bookId: string,
    highlight: Highlight
  ): Promise<{ ok: boolean; reason?: string; reviewId?: string }> {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) return { ok: false, reason: "未配置微信读书 Cookie" };

    if (
      !highlight.note ||
      (!highlight.wereadRange && !highlight.wereadReviewId)
    ) {
      return { ok: false, reason: "缺少想法或定位信息" };
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
            h.id === highlight.id
              ? { ...h, wereadReviewId: result.reviewId }
              : h
          ),
        };
        await this.persistDisk();
      }
    }

    return result;
  }

  async pushBatchNotes(
    bookId: string
  ): Promise<{ pushed: number; failed: number; skipped: number }> {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      new Notice("请先配置微信读书 Cookie");
      return { pushed: 0, failed: 0, skipped: 0 };
    }

    const cached = this.diskData.books[bookId];
    if (!cached) return { pushed: 0, failed: 0, skipped: 0 };

    const pushable = cached.highlights.filter(
      (h) =>
        h.sourceType === "weread" &&
        h.note &&
        (h.wereadRange || h.wereadReviewId)
    );

    if (pushable.length === 0) {
      new Notice("没有可推送的想法");
      return { pushed: 0, failed: 0, skipped: 0 };
    }

    const cookieRef = { value: cookie };
    let pushed = 0,
      failed = 0;
    const progress = new Notice(`推送中 0/${pushable.length}…`, 180000);

    for (let i = 0; i < pushable.length; i++) {
      const h = pushable[i];
      progress.setMessage(`推送中 ${i + 1}/${pushable.length}…`);
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
        await new Promise((r) =>
          setTimeout(r, 800 + Math.random() * 400)
        );
      }
    }

    if (cookieRef.value !== this.settings.wereadCookie) {
      this.settings.wereadCookie = cookieRef.value;
    }

    this.diskData.books[bookId] = cached;
    await this.persistDisk();
    progress.hide();

    new Notice(
      `推送完成：成功 ${pushed}，失败 ${failed}，共 ${pushable.length} 条`
    );

    return {
      pushed,
      failed,
      skipped: cached.highlights.length - pushable.length,
    };
  }

  // ─── Sync ───────────────────────────────────────────────────────────────

  async syncWereadAll(forceFull = false): Promise<void> {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      new Notice(
        "请先在 ReadFlow 设置中填写微信读书 Cookie"
      );
      return;
    }

    const progress = new Notice(
      forceFull ? "微信读书全量刷新中，请稍候…" : "微信读书同步中，请稍候…",
      180000
    );
    this.setSyncStatus(
      forceFull ? "ReadFlow：全量刷新中…" : "ReadFlow：同步中…"
    );

    try {
      const cookieRef = { value: cookie };
      const result = await syncAllBooksWithNotes(
        cookieRef,
        (id: string) => this.diskData.books[id],
        forceFull,
        (event: SyncProgressEvent) =>
          this.updateSyncProgress(progress, event, forceFull)
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

      // Write to vault
      let written = 0;
      let failed = 0;
      for (const b of books) {
        try {
          await writeBookToVault(this.app, this.settings, b);
          written++;
        } catch (e) {
          failed++;
          console.error("[ReadFlow] 落盘失败", b.title, e);
        }
      }

      progress.hide();
      const base = this.settings.booksBasePath || "Books";

      if (result.scanned === 0) {
        this.setSyncStatus("ReadFlow：未发现可同步书籍");
        new Notice(
          `ReadFlow：未获取到有划线/想法的书（微信读书里 noteCount 为 0 的会跳过）。可在面板手动摘录。`
        );
      } else if (books.length === 0) {
        this.setSyncStatus(
          forceFull
            ? "ReadFlow：本次全量刷新目标为空"
            : `ReadFlow：同步完成，扫描 ${result.scanned} 本，跳过 ${result.skipped} 本`
        );
        new Notice(
          forceFull
            ? `ReadFlow：未刷新任何书，当前目标为空。`
            : `ReadFlow：本次未发现变化，共扫描 ${result.scanned} 本，已跳过 ${result.skipped} 本。`
        );
      } else {
        this.setSyncStatus(
          forceFull
            ? `ReadFlow：全量刷新完成，更新 ${result.synced} 本`
            : `ReadFlow：同步完成，更新 ${result.synced} 本，跳过 ${result.skipped} 本`
        );
        new Notice(
          forceFull
            ? `ReadFlow：已全量刷新 ${books.length} 本；已写入「${base}/」：${written} 本${
                failed ? `，失败 ${failed} 本（看控制台）` : ""
              }`
            : `ReadFlow：已同步 ${result.synced} 本，跳过 ${result.skipped} 本；已写入「${base}/」：${written} 本${
                failed ? `，失败 ${failed} 本（看控制台）` : ""
              }`
        );
      }

      this.refreshReadFlowViews();
    } catch (e) {
      console.error("[ReadFlow] sync", e);
      progress.hide();
      this.setSyncStatus("ReadFlow：同步失败");
      new Notice("同步失败（检查 Cookie 与网络）");
    }
  }

  setSyncStatus(text: string): void {
    this.syncStatusEl?.setText(text);
  }

  updateSyncProgress(
    progress: Notice,
    event: SyncProgressEvent,
    forceFull: boolean
  ): void {
    const modeLabel = forceFull ? "全量" : "常规";
    const text =
      event.phase === "scan"
        ? `ReadFlow：${modeLabel}同步准备完成，扫描 ${event.scanned} 本，待同步 ${event.total} 本，跳过 ${event.skipped} 本`
        : `ReadFlow：${modeLabel}同步已完成 ${event.synced}/${event.total} · ${
            event.title ?? "未命名书籍"
          }`;

    this.setSyncStatus(text);
    this.setNoticeMessage(progress, text.replace(/^ReadFlow：/, ""));
  }

  setNoticeMessage(progress: Notice, text: string): void {
    if (typeof (progress as any).setMessage === "function") {
      (progress as any).setMessage(text);
      return;
    }
    const container = (progress as any).noticeEl;
    if (!container) return;
    const messageEl = container.querySelector(
      ".notice-content"
    ) as HTMLElement | null;
    if (messageEl) {
      messageEl.setText(text);
    }
  }

  // ─── Quick Capture ───────────────────────────────────────────────────────

  async captureFromEditorSelection(editor: Editor): Promise<void> {
    const selected = editor.getSelection().trim();
    if (!selected) {
      new Notice("请先选中要摘录的文本");
      return;
    }
    this.hideSelectionCaptureButton();
    const sel = editor.listSelections()[0];
    const lineNo = sel ? editor.doc.lineNumber(sel.anchor) + 1 : 1;
    this.openQuickCapture(selected, editor, lineNo);
  }

  openQuickCapture(
    selected: string,
    editor?: Editor,
    lineNo?: number
  ): void {
    const activeFile = this.app.workspace.getActiveFile();
    const matchedBook = this.resolveBookFromFile(activeFile);
    const manualBookTitle = matchedBook
      ? undefined
      : (activeFile as TFile | undefined)?.basename;

    let initialContextAbstract = "";
    if (editor && activeFile) {
      try {
        const lineCount = editor.lineCount();
        const start = Math.max(0, (lineNo ?? 1) - 4);
        const end = Math.min(lineCount, (lineNo ?? 1) + 2);
        const lines: string[] = [];
        for (let i = start; i < end; i++) {
          lines.push(editor.getLine(i));
        }
        const rawContext = lines.join("\n");
        const selStart = editor.posToOffset({ ch: 0, line: (lineNo ?? 1) - 1 });
        const selEnd = selStart + selected.length;
        const before = rawContext.slice(0, rawContext.indexOf(selected)).trim();
        const after = rawContext
          .slice(rawContext.indexOf(selected) + selected.length)
          .trim();
        initialContextAbstract =
          (before ? "…" + before.slice(-120) + "\n" : "") +
          selected +
          (after ? "\n" + after.slice(0, 120) + "…" : "");
      } catch {
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
        compactMode: true,
      },
      (h) => {
        const latestBook = this.diskData.books[h.bookId];
        if (latestBook) {
          void writeBookToVault(this.app, this.settings, latestBook).catch(
            (e) => {
              console.error("[ReadFlow] capture write", e);
            }
          );
        }
        this.refreshReadFlowViews();
      }
    ).open();
  }

  // ─── Selection Capture Button ───────────────────────────────────────────

  updateSelectionCaptureButton(): void {
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
    const left = Math.min(
      window.innerWidth - button.offsetWidth - 12,
      Math.max(12, rect.left + rect.width / 2 - 64)
    );
    button.style.top = `${top}px`;
    button.style.left = `${left}px`;
    button.classList.add("is-visible");
  }

  ensureSelectionCaptureButton(): HTMLButtonElement {
    if (this.selectionCaptureEl) return this.selectionCaptureEl as HTMLButtonElement;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "readflow-selection-capture";
    button.textContent = "摘录到 ReadFlow";
    button.addEventListener("mousedown", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    });
    button.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const text =
        button.dataset.captureText?.trim() ??
        window.getSelection()?.toString().trim() ??
        "";
      if (!text) {
        this.hideSelectionCaptureButton();
        return;
      }
      this.hideSelectionCaptureButton();
      this.openQuickCapture(text);
    });

    document.body.appendChild(button);
    this.selectionCaptureEl = button;
    return button;
  }

  hideSelectionCaptureButton(): void {
    this.selectionCaptureEl?.classList.remove("is-visible");
  }

  getSelectionHostElement(selection: Selection): HTMLElement | null {
    const node = selection.anchorNode;
    if (!node) return null;
    if (node instanceof HTMLElement) return node;
    return node.parentElement;
  }

  isCaptureSelectionHost(el: HTMLElement): boolean {
    if (el.closest(".modal, .readflow-capture-modal, .readflow-selection-capture"))
      return false;
    return !!el.closest(
      ".markdown-source-view, .markdown-preview-view, .cm-contentContainer, .cm-editor"
    );
  }

  // ─── Book Resolution ────────────────────────────────────────────────────

  resolveBookFromFile(file: TFile | null): Book | undefined {
    if (!file) return undefined;

    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const directBookId = frontmatter?.book_id
      ? String(frontmatter.book_id).trim()
      : "";

    if (directBookId && this.diskData.books[directBookId]) {
      return this.diskData.books[directBookId];
    }

    const books = Object.values(this.diskData.books);
    const parentName = file.parent?.name ?? "";

    return books.find(
      (book) =>
        book.title === file.basename || book.title === parentName
    );
  }

  // ─── LLM Classification ─────────────────────────────────────────────────

  async _testLlm(llm: {
    enabled: boolean;
    model: string;
    endpoint: string;
    apiKey?: string;
  }): Promise<{ ok: boolean; error?: string; data?: unknown }> {
    const { enabled, model, endpoint } = llm;
    if (!enabled || !endpoint)
      return { ok: false, error: "未配置 LLM 端点" };

    try {
      const resp = await this.app.requestUrl({
        url: endpoint,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: "回复: ok",
          stream: false,
        }),
      });
      return { ok: true, data: resp.json };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  async classifyHighlightWithLlm(
    highlight: { content: string; note?: string },
    bookTitle: string
  ): Promise<string | null> {
    const llm = this.settings.llmClassifier || {};
    if (!llm.enabled || !llm.endpoint) return null;

    const prompt = `根据以下阅读摘录，判断其类型，只能回答一个词：idea（观点）、method（方法）、example（例子）、conclusion（结论）或 question（疑问）。

书籍：《${bookTitle}》
摘录：${highlight.content.slice(0, 500)}
${highlight.note ? `笔记：${highlight.note.slice(0, 200)}` : ""}

类型：`;

    try {
      const resp = await this.app.requestUrl({
        url: llm.endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(llm.apiKey
            ? { Authorization: `Bearer ${llm.apiKey}` }
            : {}),
        },
        body: JSON.stringify({ model: llm.model, prompt, stream: false }),
      });

      const json = resp.json as { response?: string; text?: string; content?: string };
      const raw = (json.response || json.text || json.content || "").trim();
      const match = raw.match(
        /^\s*(idea|method|example|conclusion|question)\s*[`'"「]?/i
      );
      return match ? match[1].toLowerCase() : null;
    } catch (e) {
      console.warn("[ReadFlow] LLM classify failed", e);
      return null;
    }
  }
}
