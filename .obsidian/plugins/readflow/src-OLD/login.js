// src/ui/WereadLoginWindow.ts
var import_obsidian6 = require("obsidian");
const { verifyWereadCookieSilent } = require("./weread");
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

module.exports = {
  WereadLoginWindow,
  parseCookieHeader,
  pairsToHeaderString,
  getRequire,
  getElectronRemote,
  getChromeLikeUA,
  readSessionCookieString,
  verifyCookieRough
};
