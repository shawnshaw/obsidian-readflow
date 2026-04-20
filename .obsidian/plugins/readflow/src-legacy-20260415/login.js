// ===== login (WereadLoginWindow) =====

        const wrName = cookieArr.find((c) => c.name === "wr_name");
        const wrVid = cookieArr.find((c) => c.name === "wr_vid");
        if (wrName && wrName.value !== "" || wrVid && wrVid.value !== "") {
          void finishOk(pairsToHeaderString(cookieArr));
        } else {
          (_b = this.modal) == null ? void 0 : _b.reload();
        }
      }
    );
    const nav = () => {
      void trySyncFromSession();
    };
    this.modal.webContents.on("did-navigate", nav);
    this.modal.webContents.on("did-navigate-in-page", nav);
    this.modal.webContents.on("did-finish-load", nav);
    let loadErr = "";
    this.modal.webContents.on(
      "did-fail-load",
      (_e, code, desc, url2, isMainFrame) => {
        if (!isMainFrame) return;
        if (code === -3) return;
        loadErr = `${desc} (${code}) ${url2}`;
        console.warn("[ReadFlow] did-fail-load", loadErr);
      }
    );
    try {
      await this.modal.loadURL(WEREAD_LOGIN);
    } catch (e) {
      console.warn("[ReadFlow] loadURL \u629B\u9519/\u62D2\u7EDD\uFF08\u53EF\u80FD\u662F\u91CD\u5B9A\u5411\uFF09", e);
    }
    let url = this.modal.webContents.getURL();
    if (!url.includes("weread.qq.com")) {
      try {
        await this.modal.loadURL(WEREAD_HOME);
      } catch (e2) {
        console.error("[ReadFlow] \u52A0\u8F7D\u5FAE\u4FE1\u8BFB\u4E66\u5931\u8D25", e2, loadErr);
        const hint = loadErr || (e2 instanceof Error ? e2.message : String(e2)) || "\u672A\u77E5\u9519\u8BEF";
        new import_obsidian6.Notice(
          `\u52A0\u8F7D\u5FAE\u4FE1\u8BFB\u4E66\u5931\u8D25\u3002\u53EF\u6539\u7528\u624B\u52A8\u7C98\u8D34 Cookie\u3002
\u8BE6\u60C5\uFF1A${hint.slice(0, 200)}`,
          12e3
        );
        this.dispose();
        return;
      }
      url = this.modal.webContents.getURL();
    }
    if (!url.includes("weread.qq.com")) {
      new import_obsidian6.Notice(
        `\u672A\u6253\u5F00\u5FAE\u4FE1\u8BFB\u4E66\u9875\u9762\uFF08\u5F53\u524D\uFF1A${url.slice(0, 80) || "\u7A7A"}\uFF09\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u7528\u624B\u52A8\u7C98\u8D34 Cookie\u3002`,
        12e3
      );
      this.dispose();
      return;
    }
    await trySyncFromSession();
  }
};
async function readSessionCookieString(win) {
  try {
    const cookieStore = win.webContents.session.cookies;
    const sessionCookies = [
      ...await cookieStore.get({ domain: ".weread.qq.com" }),
      ...await cookieStore.get({ domain: "weread.qq.com" })
    ];
    const unique = /* @__PURE__ */ new Map();
    for (const c of sessionCookies) {
      if (!unique.has(c.name)) {
        let name = c.name;
        let value = c.value;
        try {
          name = decodeURIComponent(c.name);
        } catch (e) {
        }
        try {
          value = decodeURIComponent(c.value);
        } catch (e) {
        }
        unique.set(c.name, { name, value });
      }
    }
    const cookieArr = [...unique.values()];
    if (cookieArr.length === 0) return null;
    const wrVid = cookieArr.find((c) => c.name === "wr_vid");
    const wrName = cookieArr.find((c) => c.name === "wr_name");
    const wrSkey = cookieArr.find((c) => c.name === "wr_skey");
    if (!wrVid || (!wrName || wrName.value === "") && (!wrSkey || wrSkey.value === "")) {
      return null;
    }
    return pairsToHeaderString(cookieArr);
  } catch (e) {
    console.error("[ReadFlow] readSessionCookieString", e);
    return null;
  }
}
async function verifyCookieRough(cookieStr) {
  return verifyWereadCookieSilent(cookieStr);
}

// src/main.ts
var ReadFlowPlugin = class extends import_obsidian7.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.settings = { ...DEFAULT_SETTINGS };
    this.diskData = { version: 1, books: {}, knowledgeCards: [] };
    this.wereadLogin = null;
    this.syncStatusEl = null;
    this.selectionCaptureEl = null;
    this.linker = new VaultLinker(this.app, () => this.settings);
  }
  async onload() {
    await this.loadStorage();
    this.syncStatusEl = this.addStatusBarItem();
    this.setSyncStatus("ReadFlow\uFF1A\u5C31\u7EEA");
    this.addSettingTab(new ReadFlowSettingTab(this.app, this));
    this.registerView(READFLOW_VIEW_TYPE, (leaf) => new HighlightPanelView(leaf, this));
    this.addCommand({
      id: "readflow-open-panel",
      name: "\u6253\u5F00\u9605\u8BFB\u9762\u677F\uFF08\u4E3B\u5DE5\u4F5C\u533A\u6807\u7B7E\uFF09",
      callback: () => void this.openPanel()
    });
    this.addCommand({
      id: "readflow-sync-weread",
      name: "\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "s" }],
      callback: () => void this.syncWereadAll()
    });
    this.addCommand({
      id: "readflow-rebuild-link-index",
      name: "\u91CD\u5EFA\u5173\u8054\u7D22\u5F15",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "r" }],
      callback: async () => {
        await this.linker.rebuildIndexAsync();
        new import_obsidian7.Notice("\u5173\u8054\u7D22\u5F15\u5DF2\u66F4\u65B0");
      }
    });
    this.addCommand({
      id: "readflow-manual-capture",
      name: "\u624B\u52A8\u6458\u5F55",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "n" }],
      callback: () => {
        new QuickCaptureModal(this.app, this, {}, () => {
          void this.persistDisk();
          this.refreshReadFlowViews();
        }).open();
      }
    });
    this.addCommand({
      id: "readflow-capture-selection",
      name: "\u6458\u5F55\u5F53\u524D\u9009\u4E2D\u6587\u672C\u5230 ReadFlow",
      editorCallback: (editor) => {
        void this.captureFromEditorSelection(editor);
      }
    });
    this.addCommand({
      id: "readflow-weread-login",
      name: "\u5FAE\u4FE1\u8BFB\u4E66\u767B\u5F55\uFF08\u684C\u9762\uFF09",
      callback: () => this.openWereadLogin()
    });
    this.addCommand({
      id: "readflow-export-data",
      name: "\u5BFC\u51FA ReadFlow \u6570\u636E\u5230 JSON",
      callback: async () => {
        const json = JSON.stringify(this.diskData, null, 2);
        const path = this.app.vault.getAvailablePath("readflow-export.json", ".");
        await this.app.vault.create(path, json);
        new import_obsidian7.Notice(`\u5DF2\u5BFC\u51FA\uFF1A${path}`);
      }
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const selected = editor.getSelection().trim();
        if (!selected) return;
        menu.addItem((item) => {
          item.setTitle("\u6458\u5F55\u5230 ReadFlow").setIcon("highlighter").onClick(() => {
            void this.captureFromEditorSelection(editor);
          });
        });
      })
    );
    this.registerDomEvent(document, "selectionchange", () => this.updateSelectionCaptureButton());
    this.registerDomEvent(document, "mouseup", () => this.updateSelectionCaptureButton());
    this.registerDomEvent(document, "keyup", () => this.updateSelectionCaptureButton());
    this.registerDomEvent(document, "mousedown", (evt) => {
      const target = evt.target;
      if (target instanceof HTMLElement && target.closest(".readflow-selection-capture")) return;
      this.hideSelectionCaptureButton();
    });
    this.registerDomEvent(window, "scroll", () => this.hideSelectionCaptureButton(), { capture: true });
    this.registerDomEvent(window, "resize", () => this.hideSelectionCaptureButton());
  }
  onunload() {
    var _a, _b;
    (_a = this.wereadLogin) == null ? void 0 : _a.dispose();
    this.wereadLogin = null;
    (_b = this.selectionCaptureEl) == null ? void 0 : _b.remove();
    this.selectionCaptureEl = null;
  }
  /** 与 Weread 类似：Electron 子窗口抓取 Cookie */




// ===== plugin entry =====
