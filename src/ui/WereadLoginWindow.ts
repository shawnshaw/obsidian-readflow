import { Notice, Platform } from "obsidian";
import { verifyWereadCookieSilent } from "../importer/weread";

const WEREAD_LOGIN = "https://weread.qq.com/#login";
const WEREAD_HOME = "https://weread.qq.com/";

interface CookiePair {
  name: string;
  value: string;
}

interface ReadFlowPluginLike {
  settings: { wereadCookie: string };
  persistDisk(): Promise<void>;
}

interface ElectronRemote {
  BrowserWindow: new (opts: Record<string, unknown>) => ElectronBrowserWindow;
  getCurrentWindow(): ElectronBrowserWindow;
}

interface ElectronBrowserWindow {
  webContents: ElectronWebContents;
  close(): void;
  show(): void;
  setTitle(title: string): void;
  loadURL(url: string): Promise<void>;
  once(event: string, listener: () => void): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
  isDestroyed?(): boolean;
}

interface ElectronWebContents {
  session: {
    cookies: { get(filter: { domain: string }): Promise<Array<{ name: string; value: string }>> };
    webRequest: {
      onCompleted(filter: { urls: string[] }, listener: (details: { statusCode: number }) => void): void;
      onSendHeaders(
        filter: { urls: string[] },
        listener: (details: { requestHeaders: Record<string, string | string[] | undefined> }) => void,
      ): void;
    };
  };
  setUserAgent(ua: string): void;
  getURL(): string;
  loadURL(url: string): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): void;
  isDestroyed?(): boolean;
}

function parseCookieHeader(cookieInput: string | string[] | undefined): CookiePair[] {
  if (!cookieInput) return [];
  const raw = Array.isArray(cookieInput) ? cookieInput.join("; ") : cookieInput;
  if (raw === "") return [];
  return raw.split(";").map((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) {
      try {
        return { name: decodeURIComponent(pair.trim()), value: "" };
      } catch {
        return { name: pair.trim(), value: "" };
      }
    }
    const nameRaw = pair.slice(0, idx).trim();
    const valueRaw = pair.slice(idx + 1).trim();
    try {
      return { name: decodeURIComponent(nameRaw), value: decodeURIComponent(valueRaw) };
    } catch {
      return { name: nameRaw, value: valueRaw };
    }
  });
}

function pairsToHeaderString(pairs: CookiePair[]): string {
  return pairs.map((c) => `${c.name}=${c.value}`).join("; ");
}

function getRequire(): NodeRequire | null {
  try {
    if (typeof window !== "undefined") {
      const w = window as Window & { require?: NodeRequire };
      if (typeof w.require === "function") return w.require;
    }
  } catch {
    /* ignore */
  }
  try {
    return require;
  } catch {
    return null;
  }
}

function getElectronRemote(): ElectronRemote | null {
  const req = getRequire();
  if (!req) return null;
  try {
    const er = req("@electron/remote") as ElectronRemote | undefined;
    if (er?.BrowserWindow && er.getCurrentWindow) return er;
  } catch {
    /* ignore */
  }
  try {
    const electron = req("electron") as { remote?: ElectronRemote };
    const r = electron.remote;
    if (r?.BrowserWindow && r.getCurrentWindow) return r;
  } catch {
    /* ignore */
  }
  return null;
}

function getChromeLikeUA(): string {
  try {
    const req = getRequire();
    if (req) {
      const proc = req("process") as { platform?: string };
      if (proc?.platform === "win32") {
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
      }
    }
  } catch {
    /* ignore */
  }
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
}

export class WereadLoginWindow {
  private modal: ElectronBrowserWindow | null = null;
  private handled = false;
  private hooksAttached = false;

  constructor(private plugin: ReadFlowPluginLike) {}

  dispose(): void {
    try {
      this.modal?.close();
    } catch {
      /* ignore */
    }
    this.modal = null;
    this.handled = false;
    this.hooksAttached = false;
  }

  private isModalAlive(): boolean {
    const m = this.modal;
    if (!m) return false;
    try {
      if (m.isDestroyed?.()) return false;
      const wc = m.webContents;
      if (!wc) return false;
      if (wc.isDestroyed?.()) return false;
      return true;
    } catch {
      return false;
    }
  }

  private getWebContents(): ElectronWebContents | null {
    if (!this.isModalAlive()) return null;
    return this.modal!.webContents;
  }

  async open(): Promise<void> {
    if (!Platform.isDesktopApp) {
      new Notice("移动端请手动粘贴 Cookie（设置 → ReadFlow）");
      return;
    }
    const remote = getElectronRemote();
    if (!remote) {
      new Notice("当前 Obsidian/Electron 无法使用内置登录，请手动粘贴 Cookie");
      return;
    }

    this.handled = false;
    this.hooksAttached = false;

    let parent: ElectronBrowserWindow | undefined;
    try {
      parent = remote.getCurrentWindow();
    } catch {
      parent = undefined;
    }

    try {
      this.modal = new remote.BrowserWindow({
        ...(parent ? { parent } : {}),
        width: 960,
        height: 540,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
        },
      });
    } catch (e) {
      console.error("[ReadFlow] 创建登录窗口失败", e);
      new Notice(
        `无法创建登录窗口：${e instanceof Error ? e.message : String(e)}。请尝试手动粘贴 Cookie。`,
        8000,
      );
      return;
    }

    const wc = this.getWebContents();
    if (!wc) {
      this.dispose();
      new Notice("登录窗口初始化失败，请手动粘贴 Cookie。");
      return;
    }

    wc.setUserAgent(getChromeLikeUA());
    this.modal!.once("ready-to-show", () => {
      if (!this.isModalAlive()) return;
      this.modal!.setTitle("登录微信读书（ReadFlow）");
      this.modal!.show();
    });
    this.modal!.on("closed", () => {
      this.modal = null;
      this.hooksAttached = false;
    });

    const finishOk = async (cookieStr: string): Promise<void> => {
      if (this.handled) return;
      this.handled = true;
      this.plugin.settings.wereadCookie = cookieStr;
      await this.plugin.persistDisk();
      new Notice("微信读书 Cookie 已保存");
      if (this.isModalAlive()) this.modal!.close();
      this.modal = null;
    };

    const trySyncFromSession = async (): Promise<void> => {
      if (this.handled || !this.isModalAlive() || !this.modal) return;
      const str = await readSessionCookieString(this.modal);
      if (!str) return;
      const ok = await verifyWereadCookieSilent(str);
      if (ok) await finishOk(str);
    };

    const attachSessionHooks = (): void => {
      if (this.hooksAttached || !this.isModalAlive()) return;
      this.hooksAttached = true;
      const contents = this.getWebContents();
      if (!contents) return;
      const session = contents.session;

      session.webRequest.onCompleted(
        { urls: ["https://weread.qq.com/api/auth/getLoginInfo?uid=*"] },
        (details) => {
          if (details.statusCode === 200 && this.isModalAlive()) {
            void this.modal!.loadURL("https://weread.qq.com/web/shelf");
            void trySyncFromSession();
          }
        },
      );

      session.webRequest.onSendHeaders(
        { urls: ["https://weread.qq.com/web/user?userVid=*"] },
        (details) => {
          const raw = details.requestHeaders["Cookie"] ?? details.requestHeaders["cookie"];
          if (raw === undefined) return;
          const headerStr = Array.isArray(raw) ? raw.join("; ") : String(raw);
          const cookieArr = parseCookieHeader(headerStr);
          const wrName = cookieArr.find((c) => c.name === "wr_name");
          const wrVid = cookieArr.find((c) => c.name === "wr_vid");
          const wrSkey = cookieArr.find((c) => c.name === "wr_skey");
          if (
            (wrName && wrName.value !== "") ||
            (wrVid && wrVid.value !== "") ||
            (wrSkey && wrSkey.value !== "")
          ) {
            void finishOk(pairsToHeaderString(cookieArr));
          } else if (this.isModalAlive()) {
            void this.modal!.loadURL(WEREAD_LOGIN);
          }
        },
      );

      const nav = (): void => {
        void trySyncFromSession();
      };
      contents.on("did-navigate", nav);
      contents.on("did-navigate-in-page", nav);
      contents.on("did-finish-load", nav);
    };

    let loadErr = "";
    wc.on("did-fail-load", (_e, code, desc, url, isMainFrame) => {
      if (!isMainFrame) return;
      if (code === -3) return;
      loadErr = `${desc} (${code}) ${url}`;
      console.warn("[ReadFlow] did-fail-load", loadErr);
    });

    let loaded = false;
    for (const target of [WEREAD_HOME, WEREAD_LOGIN]) {
      if (!this.isModalAlive()) break;
      try {
        await this.getWebContents()!.loadURL(target);
      } catch (e) {
        console.warn("[ReadFlow] loadURL", target, e);
      }
      const url = this.getWebContents()?.getURL() ?? "";
      if (url.includes("weread.qq.com")) {
        loaded = true;
        break;
      }
    }

    if (!loaded || !this.isModalAlive()) {
      const url = this.getWebContents()?.getURL() ?? "";
      const hint = loadErr || url.slice(0, 80) || "未知错误";
      new Notice(`加载微信读书失败。可改用手动粘贴 Cookie。详情：${hint.slice(0, 200)}`, 12000);
      this.dispose();
      return;
    }

    attachSessionHooks();
    await trySyncFromSession();
  }
}

async function readSessionCookieString(win: ElectronBrowserWindow): Promise<string | null> {
  try {
    const cookieStore = win.webContents.session.cookies;
    const sessionCookies = [
      ...(await cookieStore.get({ domain: ".weread.qq.com" })),
      ...(await cookieStore.get({ domain: "weread.qq.com" })),
    ];
    const unique = new Map<string, CookiePair>();
    for (const c of sessionCookies) {
      if (!unique.has(c.name)) {
        let name = c.name;
        let value = c.value;
        try {
          name = decodeURIComponent(c.name);
        } catch {
          /* ignore */
        }
        try {
          value = decodeURIComponent(c.value);
        } catch {
          /* ignore */
        }
        unique.set(c.name, { name, value });
      }
    }
    const cookieArr = [...unique.values()];
    if (cookieArr.length === 0) return null;
    const wrVid = cookieArr.find((c) => c.name === "wr_vid");
    const wrName = cookieArr.find((c) => c.name === "wr_name");
    const wrSkey = cookieArr.find((c) => c.name === "wr_skey");
    if (!wrVid || ((!wrName || wrName.value === "") && (!wrSkey || wrSkey.value === ""))) {
      return null;
    }
    return pairsToHeaderString(cookieArr);
  } catch (e) {
    console.error("[ReadFlow] readSessionCookieString", e);
    return null;
  }
}
