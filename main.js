/*
 * ReadFlow — generated bundle (esbuild)
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ReadFlowPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  wereadCookie: "",
  booksBasePath: "Books",
  atomicHighlights: false,
  linkerMaxFiles: 400,
  linkerIgnorePrefixes: ".obsidian\n.trash\n",
  llmClassifier: {
    enabled: false,
    model: "qwen2.5",
    endpoint: "http://localhost:11434/api/generate",
    apiKey: ""
  }
};
var ReadFlowSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("readflow-settings");
    containerEl.createEl("h2", { text: "ReadFlow" });
    containerEl.createEl("p", {
      text: "\u684C\u9762\u7AEF\u53EF\u70B9\u51FB\u300C\u6253\u5F00\u767B\u5F55\u7A97\u53E3\u300D\u81EA\u52A8\u4FDD\u5B58 Cookie\uFF08\u4E0E Weread \u63D2\u4EF6\u540C\u5C5E Electron \u5185\u5D4C\u6D4F\u89C8\u5668 + \u62E6\u622A\u8BF7\u6C42\uFF09\uFF1B\u79FB\u52A8\u7AEF\u8BF7\u624B\u52A8\u7C98\u8D34\u3002"
    });
    new import_obsidian.Setting(containerEl).setName("\u6253\u5F00 ReadFlow \u9762\u677F").setDesc("\u5728\u4E2D\u95F4\u4E3B\u533A\u57DF\u65B0\u5F00\u4E00\u4E2A\u6807\u7B7E\uFF08\u4E0E\u7B14\u8BB0\u6807\u7B7E\u5E76\u5217\uFF09\uFF0C\u4E0D\u518D\u4F7F\u7528\u5DE6\u4FA7\u529F\u80FD\u533A\u56FE\u6807\u3002\u4E5F\u53EF\u5728\u547D\u4EE4\u9762\u677F\u641C\u7D22\u300CReadFlow\u300D\u3002").addButton(
      (btn) => btn.setButtonText("\u6253\u5F00\u9762\u677F").setCta().onClick(() => {
        void this.plugin.openPanel();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u684C\u9762\u7AEF\uFF1A\u6253\u5F00\u5FAE\u4FE1\u8BFB\u4E66\u767B\u5F55\u7A97\u53E3").setDesc("\u5F39\u51FA\u72EC\u7ACB\u7A97\u53E3\u626B\u7801\u767B\u5F55\uFF1B\u6210\u529F\u540E\u4F1A\u5199\u5165\u4E0B\u65B9 Cookie \u5E76\u4FDD\u5B58\u3002\u82E5\u5931\u8D25\u8BF7\u6539\u7528\u624B\u52A8\u7C98\u8D34\u3002").addButton(
      (btn) => btn.setButtonText("\u6253\u5F00\u767B\u5F55").setCta().onClick(() => {
        this.plugin.openWereadLogin();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u5FAE\u4FE1\u8BFB\u4E66 Cookie").setDesc("\u7C98\u8D34\u5B8C\u6574 Cookie \u5B57\u7B26\u4E32\u3002").addTextArea((ta) => {
      ta.setValue(this.plugin.settings.wereadCookie).onChange(async (v) => {
        this.plugin.settings.wereadCookie = v;
        await this.plugin.saveSettings();
      });
      ta.inputEl.rows = 4;
      ta.inputEl.style.width = "100%";
    });
    new import_obsidian.Setting(containerEl).setName("\u4E66\u7C4D\u843D\u76D8\u76EE\u5F55").setDesc("\u76F8\u5BF9 vault \u6839\u76EE\u5F55\uFF0C\u5982 Books").addText(
      (t) => t.setValue(this.plugin.settings.booksBasePath).onChange(async (v) => {
        this.plugin.settings.booksBasePath = v.replace(/^\/+|\/+$/g, "") || "Books";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u539F\u5B50\u6458\u5F55\u5361\u7247").setDesc("\u5F00\u542F\u540E\u4E3A\u6BCF\u6761\u6458\u5F55\u751F\u6210\u72EC\u7ACB Markdown \u6587\u4EF6\u3002").addToggle(
      (tg) => tg.setValue(this.plugin.settings.atomicHighlights).onChange(async (v) => {
        this.plugin.settings.atomicHighlights = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u5173\u8054\u626B\u63CF\u6700\u5927\u6587\u4EF6\u6570").addText(
      (t) => t.setValue(String(this.plugin.settings.linkerMaxFiles)).onChange(async (v) => {
        const n = Math.max(50, parseInt(v, 10) || 400);
        this.plugin.settings.linkerMaxFiles = n;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u5173\u8054\u5FFD\u7565\u8DEF\u5F84\u524D\u7F00\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09").addTextArea((ta) => {
      ta.setValue(this.plugin.settings.linkerIgnorePrefixes).onChange(async (v) => {
        this.plugin.settings.linkerIgnorePrefixes = v;
        await this.plugin.saveSettings();
      });
      ta.inputEl.rows = 3;
      ta.inputEl.style.width = "100%";
    });
    containerEl.createEl("h3", { text: "AI \u5206\u7C7B\u5668\uFF08LLM\uFF09", cls: "readflow-settings-section-title" });
    new import_obsidian.Setting(containerEl).setName("\u542F\u7528 LLM \u5206\u7C7B").setDesc("\u5F00\u542F\u540E\uFF0C\u65B0\u540C\u6B65\u7684\u6458\u5F55\u5C06\u901A\u8FC7 LLM \u63A8\u9001\u7C7B\u578B\uFF08\u89C2\u89C2\u70B9/\u65B9\u6CD5/\u4F8B\u5B50/\u7ED3\u8BBA/\u7591\u95EE\uFF09").addToggle((tg) => {
      var _a;
      const llm = (_a = this.plugin.settings.llmClassifier) != null ? _a : {};
      tg.setValue(!!llm.enabled).onChange(async (v) => {
        this.plugin.settings.llmClassifier = { ...llm, enabled: v };
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("LLM \u6A21\u578B").setDesc("\u4F8B\u5982 qwen2.5\u3001gpt-4o-mini\u3001deepseek-chat").addText((t) => {
      var _a;
      const llm = (_a = this.plugin.settings.llmClassifier) != null ? _a : {};
      t.setValue(llm.model || "qwen2.5").onChange(async (v) => {
        this.plugin.settings.llmClassifier = { ...llm, model: v };
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("API \u7AEF\u70B9").setDesc("Ollama \u6216\u5176\u4ED6 LLM API \u5730\u5740\uFF0C\u4F8B\u5982 http://localhost:11434/api/generate").addText((t) => {
      var _a;
      const llm = (_a = this.plugin.settings.llmClassifier) != null ? _a : {};
      t.setValue(llm.endpoint || "").onChange(async (v) => {
        this.plugin.settings.llmClassifier = { ...llm, endpoint: v };
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("API Key\uFF08\u53EF\u9009\uFF09").setDesc("\u5982\u6709\u8BF4\u660E\u8981\u6C42").addText((t) => {
      var _a;
      t.inputEl.type = "password";
      const llm = (_a = this.plugin.settings.llmClassifier) != null ? _a : {};
      t.setValue(llm.apiKey || "").onChange(async (v) => {
        this.plugin.settings.llmClassifier = { ...llm, apiKey: v };
        await this.plugin.saveSettings();
      });
    });
    const testBtn = containerEl.createEl("button", { text: "\u6D4B\u8BD5 LLM \u8FDE\u63A5", type: "button", cls: "readflow-btn readflow-btn--secondary" });
    testBtn.addEventListener("click", async () => {
      var _a;
      try {
        const llm = (_a = this.plugin.settings.llmClassifier) != null ? _a : {};
        const resp = await this.plugin.testLlm(llm);
        new Notice(resp.ok ? "\u2705 LLM \u8FDE\u63A5\u6B63\u5E38" : `\u274C \u8FDE\u63A5\u5931\u8D25: ${resp.error}`);
      } catch (e) {
        new Notice(`\u6D4B\u8BD5\u5F02\u5E38: ${e instanceof Error ? e.message : e}`);
      }
    });
  }
};

// src/importer/weread.ts
var import_obsidian2 = require("obsidian");
var BASE = "https://weread.qq.com";
var IWEREAD_BASE = "https://i.weread.qq.com";
var MAX_SYNC_CONCURRENCY = 3;
function isJsonObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function hasBlockingError(json) {
  var _a;
  if (!isJsonObject(json)) return false;
  const c = (_a = json.errCode) != null ? _a : json.errcode;
  if (typeof c === "number") return c !== 0;
  if (typeof c === "string" && /^-?\d+$/.test(c)) return parseInt(c, 10) !== 0;
  return false;
}
function extractBookmarkRows(json) {
  if (!json || !isJsonObject(json)) return [];
  if (hasBlockingError(json)) return [];
  const o = json;
  const lists = [
    o.updated,
    o.bookmarks,
    o.sorted,
    isJsonObject(o.data) ? o.data.updated : void 0,
    isJsonObject(o.bookmark) ? o.bookmark.updated : void 0
  ];
  for (const c of lists) {
    if (Array.isArray(c)) return c;
  }
  return [];
}
function parseCookieMap(raw) {
  const m = /* @__PURE__ */ new Map();
  const s = raw.trim();
  if (!s) return m;
  for (const part of s.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) m.set(k, v);
  }
  return m;
}
function serializeCookieMap(map) {
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function getSetCookieLines(headers) {
  var _a;
  if (!headers) return [];
  const raw = (_a = headers["set-cookie"]) != null ? _a : headers["Set-Cookie"];
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  const s = String(raw).trim();
  return s ? [s] : [];
}
function mergeSetCookieFromHeaders(cookieRaw, headers) {
  var _a;
  const lines = getSetCookieLines(headers);
  if (lines.length === 0) return cookieRaw;
  const map = parseCookieMap(cookieRaw);
  for (const line of lines) {
    const first = (_a = line.split(";")[0]) == null ? void 0 : _a.trim();
    if (!first) continue;
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    let val = first.slice(eq + 1).trim();
    if (!name) continue;
    const nl = name.toLowerCase();
    if (nl === "deleted" || val.toLowerCase() === "deleted") {
      map.delete(name);
      continue;
    }
    map.set(name, val);
  }
  return serializeCookieMap(map);
}
function applyResponseCookies(ref, resp) {
  const next = mergeSetCookieFromHeaders(ref.value, resp.headers);
  if (next !== ref.value) {
    ref.value = next;
  }
}
function bookmarkStableKey(u) {
  var _a, _b, _c, _d, _e, _f, _g;
  const rawId = String((_b = (_a = u.bookmarkId) != null ? _a : u.id) != null ? _b : "").trim();
  if (rawId) return rawId.replace(/[_~]/g, "-");
  const t = Number((_d = (_c = u.createTime) != null ? _c : u.created) != null ? _d : 0);
  const range = String((_e = u.range) != null ? _e : "");
  const excerpt = String((_g = (_f = u.markText) != null ? _f : u.contextAbstract) != null ? _g : "").slice(0, 48);
  return `t${t}_r${range}_x${excerpt.length}`;
}
async function fetchJsonPreferNonEmpty(cookieRef, primaryUrl, fallbackUrl, label, rowCount) {
  let primaryJson = null;
  try {
    const resp = await (0, import_obsidian2.requestUrl)({ url: primaryUrl, method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
    applyResponseCookies(cookieRef, resp);
    primaryJson = resp.json;
  } catch (e) {
    console.warn(`[ReadFlow] ${label} primary`, e);
  }
  return await tryFallbackIfEmpty(cookieRef, primaryJson, fallbackUrl, label, rowCount);
}
async function tryFallbackIfEmpty(cookieRef, primaryJson, fallbackUrl, label, rowCount) {
  if (rowCount(primaryJson) > 0) return primaryJson;
  try {
    const resp2 = await (0, import_obsidian2.requestUrl)({ url: fallbackUrl, method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
    applyResponseCookies(cookieRef, resp2);
    const alt = resp2.json;
    if (rowCount(alt) > 0) {
      console.log(`[ReadFlow] ${label}: \u5907\u7528\u63A5\u53E3\u62C9\u53D6\u5230\u6570\u636E`);
      return alt;
    }
  } catch (e) {
    console.warn(`[ReadFlow] ${label} fallback`, e);
  }
  return primaryJson;
}
function extractReviewWrappers(json) {
  if (!json || !isJsonObject(json)) return [];
  if (hasBlockingError(json)) return [];
  const revs = json.reviews;
  return Array.isArray(revs) ? revs : [];
}
function buildWebGetHeaders(cookieRaw) {
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  const headers = {
    "User-Agent": ua,
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    accept: "application/json, text/plain, */*",
    Referer: "https://weread.qq.com/",
    Origin: "https://weread.qq.com"
  };
  const c = cookieRaw == null ? void 0 : cookieRaw.trim();
  if (c) {
    headers.Cookie = !import_obsidian2.Platform.isDesktopApp ? encodeCookieForMobile(c) : c;
  }
  return headers;
}
function buildJsonPostHeaders(cookieRaw) {
  const h = buildWebGetHeaders(cookieRaw);
  h["Content-Type"] = "application/json";
  return h;
}
function encodeCookieForMobile(cookieRaw) {
  return cookieRaw.split(";").map((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return part.trim();
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    return `${name}=${encodeURIComponent(decodeURIComponent(value))}`;
  }).join(";");
}
function normalizeTs(t) {
  if (!t) return Date.now();
  if (t > 1e12) return t;
  return t * 1e3;
}
function normalizeNotebookRow(raw) {
  var _a, _b, _c, _d, _e, _f;
  const book = raw.book;
  const bookId = String((_b = (_a = book == null ? void 0 : book.bookId) != null ? _a : raw.bookId) != null ? _b : "").trim();
  if (!bookId) return null;
  const title = (_c = book == null ? void 0 : book.title) != null ? _c : raw.title;
  const authorRaw = (_d = book == null ? void 0 : book.author) != null ? _d : raw.author;
  const author = authorRaw == null ? void 0 : authorRaw.replace(/\[(.*?)\]/g, "\u3010$1\u3011");
  const noteCount = Number((_e = raw.noteCount) != null ? _e : 0);
  const reviewCount = Number((_f = raw.reviewCount) != null ? _f : 0);
  const bookType = book == null ? void 0 : book.type;
  return { bookId, title, author, noteCount, reviewCount, bookType };
}
function titleFromBookDetail(detail) {
  var _a, _b;
  if (!detail) return void 0;
  const t = detail.title || ((_a = detail.bookInfo) == null ? void 0 : _a.title) || ((_b = detail.book) == null ? void 0 : _b.title);
  return t && String(t).trim() ? String(t).trim() : void 0;
}
function titleFromBookmarkPayload(bmJson) {
  const book = bmJson == null ? void 0 : bmJson.book;
  const t = book == null ? void 0 : book.title;
  return t && t.trim() ? t.trim() : void 0;
}
function titleFromFirstReview(rvJson) {
  var _a, _b, _c;
  const reviews = rvJson == null ? void 0 : rvJson.reviews;
  const t = (_c = (_b = (_a = reviews == null ? void 0 : reviews[0]) == null ? void 0 : _a.review) == null ? void 0 : _b.book) == null ? void 0 : _c.title;
  return t && t.trim() ? t.trim() : void 0;
}
async function verifyWereadCookieSilent(cookieRaw) {
  var _a, _b;
  if (!cookieRaw.trim()) return false;
  try {
    const req = {
      url: `${BASE}/api/user/notebook`,
      method: "GET",
      headers: buildWebGetHeaders(cookieRaw)
    };
    const resp = await (0, import_obsidian2.requestUrl)(req);
    if (((_a = resp.json) == null ? void 0 : _a.errcode) === -2012) return false;
    return Array.isArray((_b = resp.json) == null ? void 0 : _b.books);
  } catch (e) {
    return false;
  }
}
async function fetchNotebookBooks(cookieRef) {
  var _a, _b;
  const req = {
    url: `${BASE}/api/user/notebook`,
    method: "GET",
    headers: buildWebGetHeaders(cookieRef.value)
  };
  const resp = await (0, import_obsidian2.requestUrl)(req);
  applyResponseCookies(cookieRef, resp);
  const books = (_a = resp.json) == null ? void 0 : _a.books;
  if (!Array.isArray(books)) {
    if (((_b = resp.json) == null ? void 0 : _b.errcode) === -2012) {
      new import_obsidian2.Notice("\u5FAE\u4FE1\u8BFB\u4E66 Cookie \u5DF2\u5931\u6548\uFF0C\u8BF7\u66F4\u65B0 Cookie");
    }
    return [];
  }
  return books.map((b) => normalizeNotebookRow(b)).filter((r) => r != null);
}
async function refreshWereadSessionOnSite(cookieRef) {
  try {
    const resp = await (0, import_obsidian2.requestUrl)({
      url: `${BASE}/`,
      method: "GET",
      throw: false,
      headers: buildWebGetHeaders(cookieRef.value)
    });
    applyResponseCookies(cookieRef, resp);
  } catch (e) {
    console.warn("[ReadFlow] GET weread.qq.com/", e);
  }
}
async function fetchBookDetail(cookieRef, bookId) {
  try {
    const req = {
      url: `${BASE}/web/book/info?bookId=${encodeURIComponent(bookId)}`,
      method: "GET",
      headers: buildWebGetHeaders(cookieRef.value)
    };
    const resp = await (0, import_obsidian2.requestUrl)(req);
    applyResponseCookies(cookieRef, resp);
    return resp.json;
  } catch (e) {
    console.error("[ReadFlow] fetchBookDetail", e);
    return null;
  }
}
async function fetchBookmarkList(cookieRef, bookId) {
  const bid = encodeURIComponent(bookId);
  const primary = `${BASE}/web/book/bookmarklist?bookId=${bid}`;
  const fallback = `${IWEREAD_BASE}/book/bookmarklist?bookId=${bid}`;
  const json = await fetchJsonPreferNonEmpty(
    cookieRef,
    primary,
    fallback,
    "bookmarklist",
    (j) => extractBookmarkRows(j).length
  );
  logBookmarklistIfEmpty(bookId, json);
  return json;
}
function logBookmarklistIfEmpty(bookId, json) {
  var _a;
  if (extractBookmarkRows(json).length > 0) return;
  if (!isJsonObject(json)) {
    console.warn("[ReadFlow] bookmarklist \u975E JSON \u6216\u7A7A", bookId);
    return;
  }
  const o = json;
  console.warn("[ReadFlow] bookmarklist \u65E0\u5212\u7EBF\u884C bookId=", bookId, {
    keys: Object.keys(o),
    errCode: (_a = o.errCode) != null ? _a : o.errcode,
    synckey: o.synckey,
    updatedLen: Array.isArray(o.updated) ? o.updated.length : null
  });
}
async function fetchReviews(cookieRef, bookId) {
  const bid = encodeURIComponent(bookId);
  const q = `bookId=${bid}&listType=11&mine=1&syncKey=0&listMode=0`;
  const primary = `${BASE}/web/review/list?${q}`;
  const fallback = `${IWEREAD_BASE}/review/list?${q}`;
  return fetchJsonPreferNonEmpty(cookieRef, primary, fallback, "review/list", (j) => extractReviewWrappers(j).length);
}
async function fetchChapterInfos(cookieRef, bookId) {
  const req = {
    url: `${BASE}/web/book/chapterInfos`,
    method: "POST",
    headers: buildJsonPostHeaders(cookieRef.value),
    body: JSON.stringify({ bookIds: [bookId], synckeys: [0], teenmode: 0 })
  };
  const resp = await (0, import_obsidian2.requestUrl)(req);
  applyResponseCookies(cookieRef, resp);
  return resp.json;
}
function stripHtml(s) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function parseChapterMap(chapterJson) {
  var _a, _b;
  const map = {};
  const data = (_b = (_a = chapterJson == null ? void 0 : chapterJson.data) == null ? void 0 : _a[0]) == null ? void 0 : _b.updated;
  if (!Array.isArray(data)) return map;
  for (const ch of data) {
    if (ch.chapterUid != null && ch.title) {
      map[String(ch.chapterUid)] = ch.title;
    }
  }
  return map;
}
function extractWereadReviewPayloads(json) {
  var _a, _b, _c, _d;
  const reviews = extractReviewWrappers(json);
  const out = [];
  for (const wrap of reviews) {
    if (!isJsonObject(wrap)) continue;
    let rev = null;
    if (isJsonObject(wrap.review)) {
      rev = wrap.review;
    } else if (wrap.reviewId != null && String(wrap.reviewId).length > 0) {
      rev = wrap;
    }
    if (!rev) continue;
    const reviewId = String((_a = rev.reviewId) != null ? _a : "").trim();
    if (!reviewId) continue;
    const type = Number((_b = rev.type) != null ? _b : 0);
    if (type !== 1 && type !== 4) continue;
    const chapterUid = typeof rev.chapterUid === "number" ? rev.chapterUid : typeof rev.chapterUid === "string" && /^\d+$/.test(rev.chapterUid) ? parseInt(rev.chapterUid, 10) : void 0;
    out.push({
      reviewId,
      type,
      range: rev.range ? String(rev.range) : void 0,
      contextAbstract: rev.contextAbstract ? String(rev.contextAbstract).trim() : void 0,
      content: stripHtml(String((_d = (_c = rev.content) != null ? _c : rev.htmlContent) != null ? _d : "")).trim() || void 0,
      abstract: rev.abstract ? String(rev.abstract).trim() : void 0,
      chapter: rev.chapterTitle ? String(rev.chapterTitle) : rev.chapterName ? String(rev.chapterName) : void 0,
      chapterUid,
      createdAt: normalizeTs(Number(rev.createTime) || 0)
    });
  }
  return out;
}
function reviewNoteText(review) {
  const note = review.content || review.abstract;
  if (!note) return void 0;
  if (review.contextAbstract && note === review.contextAbstract) return void 0;
  return note;
}
function buildReviewNoteMap(reviewPayloads) {
  const map = /* @__PURE__ */ new Map();
  for (const review of reviewPayloads) {
    if (!review.range || review.type !== 1) continue;
    map.set(review.range, review);
  }
  return map;
}
function highlightsFromBookmarks(bookId, json, reviewsByRange) {
  var _a, _b, _c, _d, _e, _f;
  const updated = extractBookmarkRows(json);
  const out = [];
  for (const u of updated) {
    const content = String(
      (_e = (_d = (_c = (_b = (_a = u.markText) != null ? _a : u.contextAbstract) != null ? _b : u.abstract) != null ? _c : u.text) != null ? _d : u.content) != null ? _e : ""
    ).trim();
    const range = u.range ? String(u.range) : "";
    const matchedReview = range ? reviewsByRange.get(range) : void 0;
    const key = bookmarkStableKey(u);
    const idSafe = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 96);
    if (!content) continue;
    out.push({
      id: `weread-bm-${idSafe}`,
      bookId,
      content,
      note: matchedReview ? reviewNoteText(matchedReview) : void 0,
      chapter: u.chapterName ? String(u.chapterName) : u.chapterTitle ? String(u.chapterTitle) : void 0,
      chapterUid: typeof u.chapterUid === "number" ? u.chapterUid : typeof u.chapterUid === "string" && /^\d+$/.test(u.chapterUid) ? parseInt(u.chapterUid, 10) : void 0,
      status: "inbox",
      importance: 3,
      createdAt: normalizeTs(Number((_f = u.createTime) != null ? _f : u.created) || 0),
      sourceType: "weread"
    });
  }
  if (updated.length > 0 && out.length === 0) {
    console.warn(
      "[ReadFlow] bookmarklist \u6709\u6761\u76EE\u4F46\u65E0\u53EF\u7528\u6B63\u6587\uFF08\u68C0\u67E5 markText/contextAbstract \u662F\u5426\u4E3A\u7A7A\uFF09",
      updated.length
    );
  }
  return out;
}
function highlightsFromReviews(bookId, json, bookmarkRanges) {
  const reviews = extractWereadReviewPayloads(json);
  const out = [];
  for (const rev of reviews) {
    if (rev.type === 1 && rev.range && bookmarkRanges.has(rev.range)) continue;
    const content = (rev.contextAbstract || rev.abstract || rev.content || "").trim();
    if (!content) continue;
    out.push({
      id: `weread-rv-${rev.reviewId}`,
      bookId,
      content,
      note: reviewNoteText(rev),
      chapter: rev.chapter,
      chapterUid: rev.chapterUid,
      status: "inbox",
      importance: 3,
      createdAt: rev.createdAt,
      sourceType: "weread"
    });
  }
  return out;
}
function mergeHighlights(existing, incoming) {
  var _a, _b, _c;
  const map = /* @__PURE__ */ new Map();
  for (const h of existing) map.set(h.id, { ...h });
  for (const h of incoming) {
    const prev = map.get(h.id);
    if (prev) {
      map.set(h.id, {
        ...h,
        status: prev.status,
        highlightType: (_a = prev.highlightType) != null ? _a : h.highlightType,
        topic: (_b = prev.topic) != null ? _b : h.topic,
        links: ((_c = prev.links) == null ? void 0 : _c.length) ? prev.links : h.links,
        note: prev.note || h.note,
        importance: prev.importance,
        relationHints: prev.relationHints
      });
    } else {
      map.set(h.id, h);
    }
  }
  return [...map.values()];
}
async function syncOneBook(cookieRef, bookId, existing, metaTitle, metaAuthor, metaNoteCount, metaReviewCount) {
  var _a, _b, _c, _d, _e, _f;
  const bmJson = await fetchBookmarkList(cookieRef, bookId);
  const rvJson = await fetchReviews(cookieRef, bookId);
  const hasTitle = !!(metaTitle && metaTitle.trim() && metaTitle !== bookId || ((_a = existing == null ? void 0 : existing.title) == null ? void 0 : _a.trim()));
  const hasAuthor = !!(metaAuthor && metaAuthor.trim() || ((_b = existing == null ? void 0 : existing.author) == null ? void 0 : _b.trim()));
  const detail = hasTitle && hasAuthor ? null : await fetchBookDetail(cookieRef, bookId);
  const d = detail;
  const title = (metaTitle && metaTitle.trim() && metaTitle !== bookId ? metaTitle.trim() : void 0) || (existing == null ? void 0 : existing.title) || titleFromBookDetail(d) || titleFromBookmarkPayload(bmJson) || titleFromFirstReview(rvJson) || bookId;
  const author = metaAuthor || (existing == null ? void 0 : existing.author) || (d == null ? void 0 : d.author) || ((_c = d == null ? void 0 : d.bookInfo) == null ? void 0 : _c.author) || ((_d = d == null ? void 0 : d.book) == null ? void 0 : _d.author) || "";
  const reviewPayloads = extractWereadReviewPayloads(rvJson);
  const reviewsByRange = buildReviewNoteMap(reviewPayloads);
  const bookmarkRanges = new Set(
    extractBookmarkRows(bmJson).map((row) => row.range ? String(row.range) : "").filter(Boolean)
  );
  const bmHl = highlightsFromBookmarks(bookId, bmJson, reviewsByRange);
  const rvHl = highlightsFromReviews(bookId, rvJson, bookmarkRanges);
  const byId = /* @__PURE__ */ new Map();
  for (const h of [...bmHl, ...rvHl]) {
    byId.set(h.id, h);
  }
  let merged = [...byId.values()];
  const cachedChapterMap = (_e = existing == null ? void 0 : existing.chapterTitleByUid) != null ? _e : {};
  let chapterTitleByUid = cachedChapterMap;
  const needsChapterMap = merged.some((h) => !h.chapter && h.chapterUid != null && !cachedChapterMap[String(h.chapterUid)]);
  if (needsChapterMap) {
    const chJson = await fetchChapterInfos(cookieRef, bookId);
    chapterTitleByUid = { ...cachedChapterMap, ...parseChapterMap(chJson) };
  }
  for (const h of merged) {
    if ((!h.chapter || h.chapter === "") && h.chapterUid != null) {
      const t = chapterTitleByUid[String(h.chapterUid)];
      if (t) h.chapter = t;
    }
  }
  const prevHighlights = (_f = existing == null ? void 0 : existing.highlights) != null ? _f : [];
  merged = mergeHighlights(prevHighlights, merged);
  return {
    bookId,
    title,
    author,
    highlights: merged,
    lastSync: Date.now(),
    chapterTitleByUid,
    topicCatalog: existing == null ? void 0 : existing.topicCatalog,
    notebookNoteCount: metaNoteCount,
    notebookReviewCount: metaReviewCount
  };
}
function shouldSyncBook(row, existing, forceFull) {
  var _a, _b, _c, _d;
  if (forceFull) return true;
  if (!existing) return true;
  const hasNotebookSnapshot = typeof existing.notebookNoteCount === "number" && typeof existing.notebookReviewCount === "number";
  if (!hasNotebookSnapshot) return true;
  const nextNoteCount = (_a = row.noteCount) != null ? _a : 0;
  const nextReviewCount = (_b = row.reviewCount) != null ? _b : 0;
  if (((_c = existing.notebookNoteCount) != null ? _c : -1) !== nextNoteCount) return true;
  if (((_d = existing.notebookReviewCount) != null ? _d : -1) !== nextReviewCount) return true;
  return false;
}
async function syncAllBooksWithNotes(cookieRef, getExisting, forceFull = false, onProgress) {
  const rows = await fetchNotebookBooks(cookieRef);
  const candidates = rows.filter((r) => {
    var _a, _b;
    return ((_a = r.noteCount) != null ? _a : 0) + ((_b = r.reviewCount) != null ? _b : 0) > 0;
  });
  const targets = candidates.filter((r) => shouldSyncBook(r, getExisting(r.bookId), forceFull));
  if (targets.length > 0) {
    await refreshWereadSessionOnSite(cookieRef);
  }
  onProgress == null ? void 0 : onProgress({
    phase: "scan",
    scanned: candidates.length,
    total: targets.length,
    synced: 0,
    skipped: Math.max(candidates.length - targets.length, 0)
  });
  const out = new Array(targets.length);
  let nextIndex = 0;
  let completed = 0;
  const skipped = Math.max(candidates.length - targets.length, 0);
  const worker = async () => {
    var _a;
    while (true) {
      const currentIndex = nextIndex;
      nextIndex++;
      if (currentIndex >= targets.length) return;
      const r = targets[currentIndex];
      const cached = await syncOneBook(
        cookieRef,
        r.bookId,
        getExisting(r.bookId),
        r.title,
        r.author,
        r.noteCount,
        r.reviewCount
      );
      out[currentIndex] = cached;
      completed++;
      onProgress == null ? void 0 : onProgress({
        phase: "sync",
        scanned: candidates.length,
        total: targets.length,
        synced: completed,
        skipped,
        title: (_a = r.title) != null ? _a : r.bookId
      });
    }
  };
  const workers = Array.from({ length: Math.min(MAX_SYNC_CONCURRENCY, targets.length) }, () => worker());
  await Promise.all(workers);
  return {
    books: out.filter((b) => !!b),
    scanned: candidates.length,
    synced: targets.length,
    skipped
  };
}
async function pushNoteToWeread(cookieRef, highlight) {
  if (!highlight.bookId || !highlight.note) {
    return { ok: false, reason: "missing_fields" };
  }
  const bookId = highlight.bookId.replace(/^weread-/, "");
  if (!highlight.wereadReviewId) {
    if (highlight.sourceType === "weread") {
      return {
        ok: false,
        reason: "weread_reviewId_missing",
        detail: "\u8BE5\u6458\u5F55\u6765\u81EA\u5FAE\u4FE1\u8BFB\u4E66\uFF0C\u8BF7\u5148\u91CD\u65B0\u540C\u6B65\u83B7\u53D6 reviewId \u540E\u518D\u63A8\u9001",
        retryable: false
      };
    }
    try {
      const createBody = {
        bookId,
        chapterUid: highlight.chapterUid || 0,
        type: 1,
        content: highlight.note,
        synckey: 0
      };
      if (highlight.wereadRange) createBody.range = highlight.wereadRange;
      const resp = await requestJson(`${BASE}/web/review/create`, {
        method: "POST",
        headers: buildJsonPostHeaders(cookieRef.value),
        body: JSON.stringify(createBody)
      }, cookieRef);
      if (hasBlockingError(resp)) return { ok: false, reason: "create_api_error", detail: resp };
      return { ok: true, reviewId: resp && typeof resp === "object" && "reviewId" in resp ? String(resp.reviewId) : void 0, created: true };
    } catch (e) {
      const status = e && typeof e === "object" && "status" in e ? e.status : void 0;
      return { ok: false, reason: `network_${status != null ? status : "unknown"}`, detail: String(e), retryable: false };
    }
  }
  const body = {
    bookId,
    chapterUid: highlight.chapterUid || 0,
    type: 1,
    content: highlight.note,
    synckey: 0,
    reviewId: highlight.wereadReviewId
  };
  if (highlight.wereadRange) body.range = highlight.wereadRange;
  const primaryUrl = `${BASE}/web/review/update`;
  const fallbackUrl = `${IWEREAD_BASE}/web/review/update`;
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.min(500 * Math.pow(2, attempt - 1), 4e3)));
    }
    const url = attempt === MAX_RETRIES ? fallbackUrl : primaryUrl;
    try {
      const resp = await requestJson(url, {
        method: "POST",
        headers: buildJsonPostHeaders(cookieRef.value),
        body: JSON.stringify(body)
      }, cookieRef);
      if (hasBlockingError(resp)) return { ok: false, reason: "api_error", detail: resp };
      const newReviewId = resp && typeof resp === "object" && "reviewId" in resp ? String(resp.reviewId) : void 0;
      return { ok: true, reviewId: newReviewId };
    } catch (e) {
      const status = e && typeof e === "object" && "status" in e ? e.status : void 0;
      if (attempt < MAX_RETRIES && (status === 404 || status === 502 || status === 503 || status === 504)) continue;
      return { ok: false, reason: `network_${status != null ? status : "unknown"}`, detail: String(e), retryable: false };
    }
  }
  return { ok: false, reason: "unreachable" };
}

// src/processor/linker.ts
function tokenize(text) {
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
function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}
var VaultLinker = class {
  constructor(app, getSettings) {
    this.app = app;
    this.getSettings = getSettings;
    this.index = [];
    this.lastBuild = 0;
  }
  async rebuildIndexAsync() {
    const settings = this.getSettings();
    const ignoreLines = settings.linkerIgnorePrefixes.split("\n").map((s) => s.trim().replace(/^\/+|\/+$/g, "")).filter(Boolean);
    const maxFiles = settings.linkerMaxFiles;
    const files = this.app.vault.getMarkdownFiles();
    const picked = [];
    outer: for (const f of files) {
      const path = f.path;
      for (const prefix of ignoreLines) {
        if (path === prefix || path.startsWith(prefix + "/")) continue outer;
      }
      picked.push(f);
      if (picked.length >= maxFiles * 3) break;
    }
    const next = [];
    for (const f of picked.slice(0, maxFiles)) {
      const cache = this.app.metadataCache.getCache(f.path);
      let head = f.basename;
      if (cache == null ? void 0 : cache.frontmatter) {
        try {
          head += " " + JSON.stringify(cache.frontmatter);
        } catch (e) {
        }
      }
      let body = "";
      try {
        body = await this.app.vault.read(f);
      } catch (e) {
        continue;
      }
      const tokens = tokenize(head + " " + body.slice(0, 4e3));
      next.push({ path: f.path, tokens });
    }
    this.index = next;
    this.lastBuild = Date.now();
  }
  suggestForText(text, topK = 3) {
    const q = tokenize(text);
    if (q.size === 0) return [];
    const scored = [];
    for (const row of this.index) {
      const score = jaccard(q, row.tokens);
      if (score < 0.04) continue;
      const matchedTokens = [...q].filter((t) => row.tokens.has(t)).slice(0, 6);
      scored.push({ path: row.path, score, matchedTokens });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
  get lastBuildTime() {
    return this.lastBuild;
  }
};

// src/storage/vaultWriter.ts
var import_obsidian3 = require("obsidian");

// src/structure/tree.ts
function buildChapterTree(highlights) {
  var _a;
  const byChapter = /* @__PURE__ */ new Map();
  for (const h of highlights) {
    const key = ((_a = h.chapter) == null ? void 0 : _a.trim()) || "(\u672A\u5206\u7AE0)";
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key).push(h);
  }
  return [...byChapter.entries()].map(([chapter, hls]) => {
    var _a2;
    return {
      chapter,
      chapterUid: (_a2 = hls[0]) == null ? void 0 : _a2.chapterUid,
      highlights: [...hls].sort((a, b) => a.createdAt - b.createdAt)
    };
  });
}

// src/processor/knowledge.ts
function shortLabel(text, limit = 18) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > limit ? `${oneLine.slice(0, limit)}...` : oneLine;
}
function mermaidEscape(text) {
  return text.replace(/\n/g, " ").replace(/[()[\]{}`]/g, "").replace(/"/g, "'").trim();
}
function tokenize2(text) {
  const out = /* @__PURE__ */ new Set();
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z]{3,}/g);
  if (words) for (const w of words) out.add(w);
  const cjk = lower.replace(/[^\u4e00-\u9fff]/g, "");
  for (let i = 0; i < cjk.length - 1; i++) out.add(cjk.slice(i, i + 2));
  return out;
}
function similarity(a, b) {
  const ta = tokenize2(a);
  const tb = tokenize2(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const token of ta) if (tb.has(token)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}
function scoreCandidate(source, target) {
  const sim = similarity(source.content, target.content);
  const importance = target.importance / 10;
  const timeGap = Math.abs(source.createdAt - target.createdAt);
  const timeScore = 1 / (1 + timeGap / (1e3 * 60 * 60 * 24 * 30));
  return sim + importance + timeScore;
}
function pickBestMatch(source, candidates) {
  let best;
  let bestScore = -1;
  for (const candidate of candidates) {
    if (candidate.id === source.id) continue;
    const score = scoreCandidate(source, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}
function edgeKey(edge) {
  return `${edge.sourceId}|${edge.targetId}|${edge.hint}`;
}
function summarizeTopics(book) {
  const topicMap = /* @__PURE__ */ new Map();
  for (const highlight of book.highlights) {
    const key = (highlight.topic || "").trim() || "\u672A\u5F52\u7C7B";
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key).push(highlight);
  }
  return [...topicMap.entries()].map(([topic, items]) => {
    var _a;
    const byType = {};
    for (const item of items) {
      const type = item.highlightType || "\u672A\u5206\u7C7B";
      byType[type] = ((_a = byType[type]) != null ? _a : 0) + 1;
    }
    return {
      topic,
      count: items.length,
      byType,
      items
    };
  }).sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}
function inferKnowledgeEdges(book) {
  var _a;
  const edgeMap = /* @__PURE__ */ new Map();
  const byId = new Map(book.highlights.map((h) => [h.id, h]));
  for (const source of book.highlights) {
    for (const relation of (_a = source.relations) != null ? _a : []) {
      if (!byId.has(relation.targetId)) continue;
      const edge = {
        sourceId: source.id,
        targetId: relation.targetId,
        hint: relation.hint,
        explicit: true
      };
      edgeMap.set(edgeKey(edge), edge);
    }
  }
  for (const summary of summarizeTopics(book)) {
    const group = summary.items;
    const ideas = group.filter((h) => h.highlightType === "idea");
    const methods = group.filter((h) => h.highlightType === "method");
    const examples = group.filter((h) => h.highlightType === "example");
    const conclusions = group.filter((h) => h.highlightType === "conclusion");
    const questions = group.filter((h) => h.highlightType === "question");
    for (const question of questions) {
      const target = pickBestMatch(question, [...methods, ...ideas, ...conclusions]);
      if (!target) continue;
      edgeMap.set(
        edgeKey({ sourceId: question.id, targetId: target.id, hint: "\u56E0\u679C", explicit: false }),
        { sourceId: question.id, targetId: target.id, hint: "\u56E0\u679C", explicit: false }
      );
    }
    for (const idea of ideas) {
      const example = pickBestMatch(idea, examples);
      if (!example) continue;
      edgeMap.set(
        edgeKey({ sourceId: idea.id, targetId: example.id, hint: "\u8865\u5145", explicit: false }),
        { sourceId: idea.id, targetId: example.id, hint: "\u8865\u5145", explicit: false }
      );
    }
    for (const method of methods) {
      const conclusion = pickBestMatch(method, conclusions);
      if (!conclusion) continue;
      edgeMap.set(
        edgeKey({ sourceId: method.id, targetId: conclusion.id, hint: "\u56E0\u679C", explicit: false }),
        { sourceId: method.id, targetId: conclusion.id, hint: "\u56E0\u679C", explicit: false }
      );
    }
    const ordered = [...group].sort((a, b) => a.createdAt - b.createdAt);
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const cur = ordered[i];
      if (similarity(prev.content, cur.content) >= 0.42) {
        edgeMap.set(
          edgeKey({ sourceId: prev.id, targetId: cur.id, hint: "\u91CD\u590D", explicit: false }),
          { sourceId: prev.id, targetId: cur.id, hint: "\u91CD\u590D", explicit: false }
        );
      }
    }
  }
  return [...edgeMap.values()].slice(0, 32);
}
function buildTopicMindmap(book) {
  const topics = summarizeTopics(book);
  if (topics.length === 0) return "";
  const lines = ["```mermaid", "mindmap", `  root((${mermaidEscape(shortLabel(book.title, 22))}))`];
  for (const summary of topics.slice(0, 10)) {
    lines.push(`    ${mermaidEscape(summary.topic)}`);
    for (const [type, count] of Object.entries(summary.byType)) {
      lines.push(`      ${mermaidEscape(`${type} (${count})`)}`);
      for (const row of summary.items.filter((item) => (item.highlightType || "\u672A\u5206\u7C7B") === type).slice(0, 4)) {
        lines.push(`        ${mermaidEscape(shortLabel(row.content, 26))}`);
      }
    }
  }
  lines.push("```");
  return lines.join("\n");
}
function buildRelationsMermaid(book) {
  const edges = inferKnowledgeEdges(book);
  if (edges.length === 0) return "";
  const byId = new Map(book.highlights.map((h) => [h.id, h]));
  const lines = ["```mermaid", "flowchart LR"];
  for (const edge of edges) {
    const source = byId.get(edge.sourceId);
    const target = byId.get(edge.targetId);
    if (!source || !target) continue;
    const sourceNode = `h_${source.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    const targetNode = `h_${target.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    lines.push(
      `${sourceNode}["${mermaidEscape(shortLabel(source.content))}"] -->|${edge.hint}${edge.explicit ? "" : "\xB7\u63A8\u65AD"}| ${targetNode}["${mermaidEscape(shortLabel(target.content))}"]`
    );
  }
  lines.push("```");
  return lines.join("\n");
}
function buildCoreInsights(book) {
  const sorted = [...book.highlights].sort((a, b) => b.importance - a.importance || b.createdAt - a.createdAt);
  const pick = (type, limit) => sorted.filter((h) => h.highlightType === type).slice(0, limit);
  const render = (title, rows) => {
    if (rows.length === 0) return `### ${title}

- \u6682\u65E0
`;
    return `### ${title}

${rows.map((row) => `- ${row.content.slice(0, 100)}${row.content.length > 100 ? "\u2026" : ""}`).join("\n")}
`;
  };
  return [
    "## \u6838\u5FC3\u89C2\u70B9",
    "",
    render("\u5173\u952E\u89C2\u70B9", pick("idea", 5)),
    render("\u5173\u952E\u65B9\u6CD5", pick("method", 4)),
    render("\u91CD\u8981\u4F8B\u5B50", pick("example", 4)),
    render("\u5173\u952E\u7ED3\u8BBA", pick("conclusion", 4)),
    render("\u5F85\u89E3\u95EE\u9898", pick("question", 4))
  ].join("\n");
}
function buildTopicStructure(book) {
  const topics = summarizeTopics(book).filter((summary) => summary.topic !== "\u672A\u5F52\u7C7B");
  if (topics.length === 0) return "## \u4E3B\u9898\u7ED3\u6784\n\n- \u6682\u65E0\u4E3B\u9898\u5F52\u7C7B\n";
  const lines = ["## \u4E3B\u9898\u7ED3\u6784", ""];
  for (const summary of topics) {
    lines.push(`### ${summary.topic}`);
    lines.push("");
    for (const row of summary.items.slice(0, 6)) {
      const type = row.highlightType ? ` [${row.highlightType}]` : "";
      lines.push(`- ${shortLabel(row.content, 72)}${type}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// src/storage/vaultWriter.ts
function safeSegment(name) {
  const s = name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim().slice(0, 120);
  return s || "untitled";
}
function yamlEscape(s) {
  return JSON.stringify(s != null ? s : "");
}
function highlightFilename(h) {
  const slug = h.content.slice(0, 40).replace(/[\\/:*?"<>|]/g, "_").trim() || "note";
  return `${h.id.replace(/[^a-zA-Z0-9_-]/g, "_")}_${slug}.md`;
}
function bookWikilink(settings, book) {
  const seg = safeSegment(book.title);
  const rel = (0, import_obsidian3.normalizePath)(`${settings.booksBasePath}/${seg}/${seg}`);
  return rel;
}
async function upsertVaultFile(app, path, content) {
  const existingFile = app.vault.getAbstractFileByPath(path);
  if (existingFile instanceof import_obsidian3.TFile) {
    const prev = await app.vault.cachedRead(existingFile).catch(() => "");
    if (prev !== content) {
      await app.vault.modify(existingFile, content);
    }
  } else {
    await app.vault.create(path, content);
  }
}
async function writeBookToVault(app, settings, book) {
  const base = (0, import_obsidian3.normalizePath)(settings.booksBasePath);
  const folder = (0, import_obsidian3.normalizePath)(`${base}/${safeSegment(book.title)}`);
  await app.vault.createFolder(folder).catch(() => void 0);
  const hlFolder = (0, import_obsidian3.normalizePath)(`${folder}/highlights`);
  if (settings.atomicHighlights) {
    await app.vault.createFolder(hlFolder).catch(() => void 0);
  }
  const bookPath = (0, import_obsidian3.normalizePath)(`${folder}/${safeSegment(book.title)}.md`);
  const tree = buildChapterTree(book.highlights);
  const bw = bookWikilink(settings, book);
  let highlightsSection = "## \u6458\u5F55\u76EE\u5F55\n\n";
  if (book.highlights.length === 0) {
    highlightsSection += "> **ReadFlow**\uFF1A\u672A\u5199\u5165\u4EFB\u4F55\u5212\u7EBF/\u4E66\u8BC4\u6B63\u6587\u3002\u540C\u6B65\u5DF2\u4F1A\u81EA\u52A8\u5408\u5E76\u670D\u52A1\u7AEF `Set-Cookie`\uFF08\u4E0E Weread \u63D2\u4EF6\u540C\u7406\uFF0C\u7528\u4E8E\u4FEE\u590D /web \u4E66\u7B7E\u63A5\u53E3\uFF09\u3002\u82E5\u4ECD\u6709\u6B64\u4E66\u7B14\u8BB0\uFF1A\u8BF7 **\u518D\u70B9\u4E00\u6B21\u300C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u300D** \u6216\u7528 **\u684C\u9762\u300C\u6253\u5F00\u767B\u5F55\u300D** \u91CD\u767B\uFF1B\u5728 Obsidian \u5F00\u53D1\u8005\u5DE5\u5177 Console \u641C\u7D22 **`[ReadFlow] bookmarklist`** \u67E5\u770B `errCode` / `keys` \u8BCA\u65AD\u3002\n\n";
  }
  for (const node of tree) {
    highlightsSection += `### ${node.chapter}

`;
    for (const h of node.highlights) {
      if (settings.atomicHighlights) {
        const fn = highlightFilename(h);
        const linkPath = (0, import_obsidian3.normalizePath)(`${folder}/highlights/${fn}`).replace(/\.md$/, "");
        highlightsSection += `- [[${linkPath}]] \u2014 ${h.content.slice(0, 80)}${h.content.length > 80 ? "\u2026" : ""}
`;
        await writeAtomicHighlight(app, settings, hlFolder, linkPath, book, h);
      } else {
        highlightsSection += formatEmbeddedHighlight(book, h, bw);
      }
    }
    highlightsSection += "\n";
  }
  const inbox = book.highlights.filter((h) => h.status === "inbox");
  const inboxSection = "## \u672A\u6574\u7406\u6458\u5F55\n\n" + inbox.map((h) => `- (${h.id}) ${h.content.slice(0, 120)}${h.content.length > 120 ? "\u2026" : ""}
`).join("");
  const topicMindmap = buildTopicMindmap(book);
  const topicMindmapSection = topicMindmap ? `## \u4E3B\u9898\u8111\u56FE

${topicMindmap}
` : "";
  const topicStructureSection = buildTopicStructure(book);
  const coreInsightsSection = buildCoreInsights(book);
  const relationGraph = buildRelationsMermaid(book);
  const relationSection = relationGraph ? `## \u903B\u8F91\u5173\u7CFB

${relationGraph}
` : "## \u903B\u8F91\u5173\u7CFB\n\n- \u6682\u65E0\u53EF\u751F\u6210\u7684\u5173\u7CFB\u56FE\n";
  const meta = [
    "---",
    "type: book",
    `title: ${yamlEscape(book.title)}`,
    `author: ${yamlEscape(book.author)}`,
    "source: weread",
    "status: reading",
    "tags:",
    "  - Books",
    `book_id: ${yamlEscape(book.bookId)}`,
    `readflow_last_sync: ${book.lastSync}`,
    "---",
    "",
    `# ${book.title}`,
    "",
    "## \u5143\u6570\u636E",
    `- \u4F5C\u8005:: ${book.author}`,
    `- bookId:: \`${book.bookId}\``,
    `> \u4E66\u7C4D\u4E3B\u9875\u53CC\u94FE\u57FA\u5E95: [[${bw}]]`,
    "",
    topicStructureSection,
    "",
    topicMindmapSection,
    coreInsightsSection,
    "",
    "## \u7AE0\u8282\u7ED3\u6784",
    tree.map((n) => `- ${n.chapter}\uFF08${n.highlights.length}\uFF09`).join("\n"),
    "",
    relationSection,
    highlightsSection,
    inboxSection
  ].join("\n");
  await upsertVaultFile(app, bookPath, meta);
}
async function writeTopicKnowledgeToVault(app, settings, book, topic) {
  const topicName = topic.trim();
  const topicRows = book.highlights.filter((h) => (h.topic || "").trim() === topicName);
  if (topicRows.length === 0) {
    throw new Error(`No highlights found for topic: ${topicName}`);
  }
  const topicBook = {
    ...book,
    title: `${book.title} - ${topicName}`,
    highlights: topicRows
  };
  const base = (0, import_obsidian3.normalizePath)(settings.booksBasePath);
  const folder = (0, import_obsidian3.normalizePath)(`${base}/${safeSegment(book.title)}`);
  const topicsFolder = (0, import_obsidian3.normalizePath)(`${folder}/topics`);
  await app.vault.createFolder(folder).catch(() => void 0);
  await app.vault.createFolder(topicsFolder).catch(() => void 0);
  const bw = bookWikilink(settings, book);
  const topicPath = (0, import_obsidian3.normalizePath)(`${topicsFolder}/${safeSegment(topicName)}.md`);
  const relationGraph = buildRelationsMermaid(topicBook);
  const body = [
    "---",
    "type: topic",
    `title: ${yamlEscape(topicName)}`,
    `book: "[[${bw}]]"`,
    `book_id: ${yamlEscape(book.bookId)}`,
    `topic: ${yamlEscape(topicName)}`,
    `readflow_last_sync: ${Date.now()}`,
    "---",
    "",
    `# ${topicName}`,
    "",
    `- \u6765\u6E90\u4E66\u7C4D:: [[${bw}]]`,
    `- \u6458\u5F55\u6570\u91CF:: ${topicRows.length}`,
    "",
    buildTopicStructure(topicBook),
    "",
    "## \u4E3B\u9898\u8111\u56FE",
    "",
    buildTopicMindmap(topicBook) || "- \u6682\u65E0",
    "",
    "## \u903B\u8F91\u5173\u7CFB",
    "",
    relationGraph || "- \u6682\u65E0\u53EF\u751F\u6210\u7684\u5173\u7CFB\u56FE",
    "",
    buildCoreInsights(topicBook),
    "",
    "## \u4E3B\u9898\u6458\u5F55",
    "",
    ...topicRows.map((h) => `- ${h.content.slice(0, 120)}${h.content.length > 120 ? "\u2026" : ""}`),
    ""
  ].join("\n");
  await upsertVaultFile(app, topicPath, body);
  return topicPath;
}
function formatEmbeddedHighlight(book, h, bookLink) {
  const type = h.highlightType ? `\`[${h.highlightType}]\` ` : "";
  const tags = h.topic ? ` \u{1F3F7} ${h.topic}` : "";
  const linkNames = (h.links || []).map((p) => p.replace(/\.md$/i, "").split("/").pop() || p);
  const relationLines = (h.relations || []).map((relation) => {
    const target = book.highlights.find((row) => row.id === relation.targetId);
    return `  - \u5173\u7CFB:: ${relation.hint} -> ${((target == null ? void 0 : target.content) || relation.targetId).slice(0, 60)}`;
  }).join("\n");
  const links = linkNames.length > 0 ? `
  - \u5173\u8054: ${linkNames.map((n) => `[[${n}]]`).join(" ")}` : "";
  return `- ${type}**\u6458\u5F55**${tags}

  > ${h.content.replace(/\n/g, "\n  > ")}

` + (h.note ? `  - \u60F3\u6CD5:: ${h.note}
` : "") + (relationLines ? `${relationLines}
` : "") + links + `
  - id:: \`${h.id}\`
  - \u4E66\u7C4D:: [[${bookLink}]]

`;
}
async function writeAtomicHighlight(app, settings, hlFolder, linkPathNoExt, book, h) {
  var _a, _b, _c;
  const fn = highlightFilename(h);
  const hlPath = (0, import_obsidian3.normalizePath)(`${hlFolder}/${fn}`);
  const bw = bookWikilink(settings, book);
  const lines = [
    "---",
    "type: highlight",
    `book: "[[${bw}]]"`,
    `book_id: ${yamlEscape(book.bookId)}`
  ];
  if (h.chapter) lines.push(`chapter: ${yamlEscape(h.chapter)}`);
  if (h.highlightType) lines.push(`highlight_type: ${h.highlightType}`);
  if (h.topic) lines.push(`topic: ${yamlEscape(h.topic)}`);
  lines.push(`status: ${h.status}`, `importance: ${h.importance}`, `created: ${h.createdAt}`, `source: ${h.sourceType}`, `id: ${yamlEscape(h.id)}`);
  if ((_a = h.links) == null ? void 0 : _a.length) {
    lines.push("links:");
    for (const l of h.links) lines.push(`  - "[[${l.replace(/\.md$/i, "")}]]"`);
  } else {
    lines.push("links: []");
  }
  if ((_b = h.relations) == null ? void 0 : _b.length) {
    lines.push("relations:");
    for (const relation of h.relations) lines.push(`  - ${yamlEscape(`${relation.hint}:${relation.targetId}`)}`);
  }
  lines.push(
    "---",
    "",
    "> " + h.content.replace(/\n/g, "\n> "),
    "",
    h.note ? "## \u6211\u7684\u60F3\u6CD5\n\n" + h.note + "\n\n" : "",
    ((_c = h.relations) == null ? void 0 : _c.length) ? "## \u6458\u5F55\u5173\u7CFB\n\n" + h.relations.map((relation) => {
      const target = book.highlights.find((row) => row.id === relation.targetId);
      return `- ${relation.hint} -> ${((target == null ? void 0 : target.content) || relation.targetId).slice(0, 80)}`;
    }).join("\n") + "\n\n" : "",
    "## AI \u63D0\u70BC",
    "",
    "_\uFF08v1 \u9884\u7559\uFF09_",
    "",
    "## \u76F8\u5173\u7B14\u8BB0",
    "",
    (h.links || []).map((p) => `- [[${p.replace(/\.md$/i, "")}]]`).join("\n") || "_\u6682\u65E0_",
    "",
    "## \u53EF\u6267\u884C\u884C\u52A8",
    "",
    "- ",
    "",
    "## \u7ED3\u6784\u4F4D\u7F6E",
    "",
    `- \u4E66\u7C4D:: [[${bw}]]`,
    ""
  );
  const body = lines.join("\n");
  await upsertVaultFile(app, hlPath, body);
}

// src/ui/HighlightPanelView.ts
var import_obsidian5 = require("obsidian");

// src/types.ts
var HIGHLIGHT_TYPE_LABELS = {
  idea: "\u89C2\u70B9",
  method: "\u65B9\u6CD5",
  example: "\u4F8B\u5B50",
  conclusion: "\u7ED3\u8BBA",
  question: "\u7591\u95EE"
};

// src/ui/QuickCaptureModal.ts
var import_obsidian4 = require("obsidian");

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
      relations: prev == null ? void 0 : prev.relations
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
    this.listContainerEl = null;
    this.listSummaryEl = null;
    this.currentBook = null;
    this.currentTree = null;
    this.bookSortMode = localStorage.getItem("readflow.bookSort") === "name" ? "name" : "recent";
    this.bookSortTimeDir = localStorage.getItem("readflow.bookSortTimeDir") === "asc" ? "asc" : "desc";
    this.bookSortNameDir = localStorage.getItem("readflow.bookSortNameDir") === "desc" ? "desc" : "asc";
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
    const processedCount = book.highlights.filter((h) => h.status === "processed").length;
    const shell = this.contentEl.createDiv("readflow-shell");
    if (this.sidebarCollapsed) shell.classList.add("readflow-shell--sidebar-collapsed");
    const sidebar = shell.createDiv("readflow-sidebar");
    if (this.sidebarCollapsed) sidebar.classList.add("readflow-sidebar--collapsed");
    const workspace = shell.createDiv("readflow-workspace");
    this.renderWorkspace(workspace, book, tree);
    this.renderSidebar(sidebar, books, book, tree, inboxCount, processedCount);
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
      return source.filter((h) => {
        if (bf === "inbox") return h.status === "inbox" || !h.highlightType;
        return h.highlightType === bf;
      });
    }
    return source.filter((h) => {
      if (this.onlyInbox && h.status !== "inbox") return false;
      if (this.selectedTopic && (h.topic || "") !== this.selectedTopic) return false;
      return true;
    });
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
    const idxBtn = toolbar.createEl("button", { text: "\u91CD\u5EFA\u7D22\u5F15", type: "button" });
    idxBtn.classList.add("readflow-btn", "readflow-btn--secondary");
    idxBtn.addEventListener("click", async () => {
      await this.plugin.linker.rebuildIndexAsync();
      new import_obsidian5.Notice("\u5173\u8054\u7D22\u5F15\u5DF2\u66F4\u65B0");
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
    const reloadBtn = toolbar.createEl("button", { text: "\u91CD\u8F7D", type: "button" });
    reloadBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-toolbar-reload");
    reloadBtn.setAttribute("title", "\u91CD\u65B0\u52A0\u8F7D ReadFlow\uFF08\u7B49\u540C\u5728\u300C\u7B2C\u4E09\u65B9\u63D2\u4EF6\u300D\u4E2D\u5173\u95ED\u518D\u5F00\u542F\uFF09\uFF0C\u5F00\u53D1\u65F6\u66F4\u65B0 main.js \u540E\u7528");
    reloadBtn.addEventListener("click", () => void this.plugin.reloadSelf());
    const minimizeBtn = toolbar.createEl("button", {
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
  renderSidebar(sidebar, books, book, tree, inboxCount, processedCount) {
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
    const chips = header.createDiv("readflow-card-meta");
    chips.createSpan({ cls: "readflow-chip readflow-chip--accent", text: `${book.highlights.length} \u6761\u6458\u5F55` });
    chips.createSpan({
      cls: "readflow-chip readflow-chip--soft",
      text: this.plugin.settings.atomicHighlights ? "\u539F\u5B50\u6458\u5F55\u6A21\u5F0F" : "\u5D4C\u5165\u6458\u5F55\u6A21\u5F0F"
    });
    chips.createSpan({ cls: "readflow-chip", text: `${tree.length} \u4E2A\u7AE0\u8282\u5206\u7EC4` });
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
    const footer = this.contentEl.createDiv("readflow-footer");
    const writeBtn = footer.createEl("button", {
      text: "\u5199\u5165 / \u66F4\u65B0 Vault \u4E66\u7C4D\u7B14\u8BB0",
      type: "button",
      cls: "readflow-btn readflow-btn--primary readflow-btn--block"
    });
    writeBtn.title = '\u5C06\u5F53\u524D\u4E66\u7C4D\u7684\u6240\u6709\u6458\u5F55\u5199\u5165 Obsidian Vault\uFF08\u751F\u6210\u6216\u66F4\u65B0 Markdown \u6587\u4EF6\uFF09\u3002\n\u8DEF\u5F84\uFF1A\u8BBE\u7F6E\u4E2D"\u4E66\u7C4D\u76EE\u5F55"\u5B57\u6BB5 / \u4E66\u540D / \u3002\n\u540C\u6B65\u540E\u4F1A\u81EA\u52A8\u89E6\u53D1\uFF0C\u624B\u52A8\u70B9\u51FB\u53EF\u5F3A\u5236\u5237\u65B0\u6587\u4EF6\u5185\u5BB9\u3002';
    writeBtn.addEventListener("click", async () => {
      try {
        await writeBookToVault(this.app, this.plugin.settings, book);
        new import_obsidian5.Notice(`\u5DF2\u843D\u76D8\uFF1A${book.title}`);
      } catch (e) {
        console.error(e);
        new import_obsidian5.Notice("\u843D\u76D8\u5931\u8D25\uFF0C\u67E5\u770B\u63A7\u5236\u53F0");
      }
    });
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
      { key: "inbox", label: "\u672A\u6574\u7406\u6C60" },
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
    const actions = bar.createDiv("readflow-inline-actions");
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
    const markBtn = actions.createEl("button", { text: "\u6279\u91CF\u6807\u5DF2\u5904\u7406", type: "button" });
    markBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    markBtn.addEventListener("click", () => {
      this.updateManyHighlights(
        book,
        (h) => this.selectedHighlightIds.has(h.id) ? { ...h, status: "processed" } : h
      );
    });
    const clearBtn = actions.createEl("button", { text: "\u6E05\u7A7A\u9009\u62E9", type: "button" });
    clearBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    clearBtn.addEventListener("click", () => {
      this.selectedHighlightIds.clear();
      this.render();
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
      headerRight.createSpan({
        cls: `readflow-chip ${h.status === "inbox" ? "readflow-chip--warning" : "readflow-chip--soft"}`,
        text: h.status === "inbox" ? "\u5F85\u6574\u7406" : "\u5DF2\u5904\u7406"
      });
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
      const actions = card.createDiv("readflow-card-actions");
      const edit = actions.createEl("button", { text: "\u6574\u7406", type: "button" });
      edit.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      edit.addEventListener("click", () => {
        new QuickCaptureModal(this.app, this.plugin, { book, highlight: h }, () => {
          void this.plugin.persistDisk();
          this.render();
        }).open();
      });
      const mark = actions.createEl("button", { text: "\u6807\u4E3A\u5DF2\u5904\u7406", type: "button" });
      mark.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      mark.addEventListener("click", () => {
        const cached = this.plugin.diskData.books[book.bookId];
        if (!cached) return;
        this.plugin.diskData.books[book.bookId] = {
          ...cached,
          highlights: cached.highlights.map((x) => x.id === h.id ? { ...h, status: "processed" } : x),
          lastSync: Date.now()
        };
        void this.plugin.persistDisk();
        this.render();
      });
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
        text: "\u5C1A\u65E0\u56FE\u8C31\u6570\u636E\u3002",
        cls: "readflow-muted"
      });
      const hint = sec.createDiv("readflow-graph-hint");
      hint.createEl("p", { text: "\u4E24\u79CD\u65B9\u5F0F\u5EFA\u7ACB\u5173\u8054\uFF1A", cls: "readflow-graph-hint-title" });
      const ul = hint.createEl("ul");
      ul.createEl("li", { text: '\u9009\u4E2D\u6458\u5F55 \u2192 \u6279\u91CF\u680F"\u5EFA\u7ACB\u5173\u7CFB" \u2192 \u8BBE\u7F6E\u5173\u7CFB\u7C7B\u578B\uFF08\u8865\u5145/\u56E0\u679C/\u5BF9\u6BD4/\u91CD\u590D\uFF09' });
      ul.createEl("li", { text: '\u5728\u53F3\u4FA7"\u5173\u7CFB\u5EFA\u8BAE"\u4E2D\u70B9\u51FB"\u91C7\u7EB3"\u63A5\u53D7 AI \u63A8\u65AD\u7684\u5173\u7CFB' });
      ul.createEl("li", { text: '\u7ED9\u591A\u6761\u6458\u5F55\u8BBE\u7F6E\u76F8\u540C"\u4E3B\u9898"\uFF0C\u56FE\u8C31\u5C06\u81EA\u52A8\u663E\u793A\u4E3B\u9898\u94FE' });
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
      if (status === "inbox" || !type) return "#94a3b8";
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
    const sec = container.createDiv("readflow-knowledge-section");
    sec.createEl("h5", { text: "Mermaid \u9884\u89C8", cls: "readflow-knowledge-title" });
    await this.renderMarkdownCard(sec, "\u4E3B\u9898\u8111\u56FE", buildTopicMindmap(scopeBook), "\u6682\u65E0\u53EF\u6E32\u67D3\u7684\u4E3B\u9898\u8111\u56FE");
    await this.renderMarkdownCard(sec, "\u903B\u8F91\u5173\u7CFB", buildRelationsMermaid(scopeBook), "\u6682\u65E0\u53EF\u6E32\u67D3\u7684\u903B\u8F91\u5173\u7CFB\u56FE");
    await this.renderMarkdownCard(sec, "\u6838\u5FC3\u89C2\u70B9", buildCoreInsights(scopeBook), "\u6682\u65E0\u6838\u5FC3\u89C2\u70B9\u6458\u8981");
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
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) => {
        if (h.id !== highlightId) return h;
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
      callback: () => void this.syncWereadAll()
    });
    this.addCommand({
      id: "readflow-rebuild-link-index",
      name: "\u91CD\u5EFA\u5173\u8054\u7D22\u5F15",
      callback: async () => {
        await this.linker.rebuildIndexAsync();
        new import_obsidian7.Notice("\u5173\u8054\u7D22\u5F15\u5DF2\u66F4\u65B0");
      }
    });
    this.addCommand({
      id: "readflow-manual-capture",
      name: "\u624B\u52A8\u6458\u5F55",
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
  openWereadLogin() {
    var _a;
    (_a = this.wereadLogin) == null ? void 0 : _a.dispose();
    this.wereadLogin = new WereadLoginWindow(this);
    void this.wereadLogin.open();
  }
  async loadStorage() {
    var _a, _b, _c;
    const raw = (_a = await this.loadData()) != null ? _a : {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (_b = raw.settings) != null ? _b : {});
    this.diskData = {
      version: 1,
      books: { ...(_c = raw.books) != null ? _c : {} },
      lastSyncAt: raw.lastSyncAt,
      knowledgeCards: []
    };
  }
  async persistDisk() {
    const payload = {
      settings: this.settings,
      version: 1,
      books: this.diskData.books,
      lastSyncAt: this.diskData.lastSyncAt
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
      if (this.settings.llmClassifier.enabled) {
        for (const book of books) {
          for (const h of book.highlights) {
            if (!h.highlightType && h.sourceType === "weread") {
              const type = await this.classifyHighlightWithLlm(h, book.title);
              if (type) h.highlightType = type;
            }
          }
          this.diskData.books[book.bookId] = book;
        }
        await this.persistDisk();
      }
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
      void this.linker.rebuildIndexAsync();
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
    this.openQuickCapture(selected);
  }
  openQuickCapture(selected) {
    const activeFile = this.app.workspace.getActiveFile();
    const matchedBook = this.resolveBookFromFile(activeFile);
    const manualBookTitle = matchedBook ? void 0 : activeFile == null ? void 0 : activeFile.basename;
    new QuickCaptureModal(
      this.app,
      this,
      {
        book: matchedBook,
        initialContent: selected,
        manualBookTitle,
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
      this.openQuickCapture(text);
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
  // ── 批量推送到微信读书 ──────────────────────────────────────────
  async pushHighlightNote(bookId, highlight) {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) return { ok: false, reason: "\u672A\u914D\u7F6E\u5FAE\u4FE1\u8BFB\u4E66 Cookie" };
    if (!highlight.note || !highlight.wereadRange && !highlight.wereadReviewId) {
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
          highlights: cached.highlights.map(
            (h) => h.id === highlight.id ? { ...h, wereadReviewId: result.reviewId } : h
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
    const progress = new import_obsidian7.Notice(`\u63A8\u9001\u4E2D 0/${pushable.length}\u2026`, 18e4);
    let pushed = 0;
    let failed = 0;
    for (let i = 0; i < pushable.length; i++) {
      progress.setMessage(`\u63A8\u9001\u4E2D ${i + 1}/${pushable.length}\u2026`);
      const res = await pushNoteToWeread(cookieRef, pushable[i]);
      if (res.ok) {
        pushed++;
        if (res.reviewId) {
          cached.highlights = cached.highlights.map(
            (x) => x.id === pushable[i].id ? { ...x, wereadReviewId: res.reviewId } : x
          );
        }
      } else {
        failed++;
        console.warn("[ReadFlow] push failed for", pushable[i].id, res);
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
    new import_obsidian7.Notice(`\u63A8\u9001\u5B8C\u6210\uFF1A\u6210\u529F ${pushed}\uFF0C\u5931\u8D25 ${failed}\uFF0C\u5171 ${pushable.length} \u6761`);
    return { pushed, failed, skipped: cached.highlights.length - pushable.length };
  }
  // ── LLM ────────────────────────────────────────────────────────
  async testLlm(llm) {
    const { enabled, model, endpoint } = llm;
    if (!enabled || !endpoint) return { ok: false, error: "\u672A\u914D\u7F6E LLM \u7AEF\u70B9" };
    try {
      const resp = await this.app.requestUrl({
        url: endpoint,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: "\u56DE\u7B54: ok", stream: false })
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  async classifyHighlightWithLlm(highlight, bookTitle) {
    var _a, _b, _c, _d;
    const llm = (_a = this.settings.llmClassifier) != null ? _a : {};
    if (!llm.enabled || !llm.endpoint) return null;
    const prompt = `\u6839\u636E\u4EE5\u4E0B\u9605\u8BFB\u6458\u5F55\uFF0C\u5224\u65AD\u5176\u7C7B\u578B\uFF0C\u53EA\u80FD\u56DE\u7B54\u4E00\u4E2A\u8BCD\uFF1Aidea\uFF08\u89C2\u70B9\uFF09\u3001method\uFF08\u65B9\u6CD5\uFF09\u3001example\uFF08\u4F8B\u5B50\uFF09\u3001conclusion\uFF08\u7ED3\u8BBA\uFF09\u6216 question\uFF08\u7591\u95EE\uFF09\u3002

\u4E66\u7C4D\uFF1A\u300A${bookTitle}\u300B
\u6458\u5F55\uFF1A${highlight.content.slice(0, 500)}
${highlight.note ? `\u7B14\u8BB0\uFF1A${highlight.note.slice(0, 200)}` : ""}

\u7C7B\u578B\uFF1A`;
    try {
      const resp = await this.app.requestUrl({
        url: llm.endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...llm.apiKey ? { Authorization: `Bearer ${llm.apiKey}` } : {}
        },
        body: JSON.stringify({ model: llm.model, prompt, stream: false })
      });
      const json = resp.json;
      const raw = ((_d = (_c = (_b = json.response) != null ? _b : json.text) != null ? _c : json.content) != null ? _d : "").trim();
      const match = raw.match(/^\s*(idea|method|example|conclusion|question)\s*[`'"「]/i);
      return match ? match[1].toLowerCase() : null;
    } catch (e) {
      console.warn("[ReadFlow] LLM classify failed", e);
      return null;
    }
  }
};
