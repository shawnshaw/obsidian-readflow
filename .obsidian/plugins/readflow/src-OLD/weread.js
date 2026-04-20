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
async function pushNoteToWeread(cookieRef, highlight) {
  if (!highlight.bookId || !highlight.note) {
    return { ok: false, reason: "missing_fields" };
  }
  const bookId = highlight.bookId.replace(/^weread-/, "");
  // Weread highlight missing wereadReviewId: try to create a new review from scratch
  if (!highlight.wereadReviewId) {
    if (highlight.sourceType === "weread") {
      // Cannot reliably push — we don't know which weread record to attach to
      return { ok: false, reason: "weread_reviewId_missing", detail: "该摘录来自微信读书，请先重新同步获取 reviewId后再推送", retryable: false };
    }
    // Manual note: try to create a brand-new review via the create endpoint
    try {
      const createBody = {
        bookId,
        chapterUid: highlight.chapterUid || 0,
        type: 1,
        content: highlight.note,
        synckey: 0
      };
      if (highlight.wereadRange) createBody.range = highlight.wereadRange;
      const createResp = await (0, import_obsidian2.requestUrl)({
        url: `${BASE}/web/review/create`,
        method: "POST",
        headers: buildJsonPostHeaders(cookieRef.value),
        body: JSON.stringify(createBody)
      });
      applyResponseCookies(cookieRef, createResp);
      const json = createResp.json;
      if (hasBlockingError(json)) {
        return { ok: false, reason: "create_api_error", detail: json };
      }
      return { ok: true, reviewId: json && json.reviewId ? String(json.reviewId) : void 0, created: true };
    } catch (e) {
      const status = e && e.status;
      console.error("[ReadFlow] pushNoteToWeread (create) failed", e);
      var errInfo3 = { message: e && e.message, status, isCreateAttempt: true };
      try { errInfo3.body = e && typeof e.text === "string" ? e.text.slice(0, 200) : void 0; } catch (_) {}
      try { errInfo3.json = e && e.json; } catch (_) {}
      return { ok: false, reason: "network_" + (status || "unknown"), detail: errInfo3, retryable: false };
    }
  }
  const body = {
    bookId,
    chapterUid: highlight.chapterUid || 0,
    type: 1,
    content: highlight.note,
    synckey: 0
  };
  if (highlight.wereadRange) body.range = highlight.wereadRange;
  body.reviewId = highlight.wereadReviewId;
  const primaryUrl = `${BASE}/web/review/update`;
  const fallbackUrl = `${IWEREAD_BASE}/web/review/update`;
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(500 * Math.pow(2, attempt - 1), 4000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log(`[ReadFlow] pushNoteToWeread retry ${attempt}/${MAX_RETRIES}`);
    }
    const url = attempt === MAX_RETRIES ? fallbackUrl : primaryUrl;
    try {
      const resp = await (0, import_obsidian2.requestUrl)({
        url,
        method: "POST",
        headers: buildJsonPostHeaders(cookieRef.value),
        body: JSON.stringify(body)
      });
      applyResponseCookies(cookieRef, resp);
      const json = resp.json;
      if (hasBlockingError(json)) {
        return { ok: false, reason: "api_error", detail: json };
      }
      const newReviewId = json.reviewId ? String(json.reviewId) : void 0;
      if (attempt === MAX_RETRIES && url === fallbackUrl) {
        console.log(`[ReadFlow] pushNoteToWeread: fallback succeeded`);
      }
      return { ok: true, reviewId: newReviewId };
    } catch (e) {
      const status = e && e.status;
      if (attempt < MAX_RETRIES && (status === 404 || status === 502 || status === 503 || status === 504)) {
        continue;
      }
      if (attempt === MAX_RETRIES) {
        console.error("[ReadFlow] pushNoteToWeread all endpoints failed", e);
        var errInfo = { message: e && e.message, status, url: fallbackUrl, attempts: attempt + 1 };
        try { errInfo.body = e && typeof e.text === "string" ? e.text.slice(0, 200) : void 0; } catch (_) {}
        try { errInfo.json = e && e.json; } catch (_) {}
        return { ok: false, reason: "network_" + (status || "unknown"), detail: errInfo, retryable: false };
      }
      console.error("[ReadFlow] pushNoteToWeread failed", e);
      var errInfo2 = { message: e && e.message, status, attempts: attempt + 1 };
      try { errInfo2.body = e && typeof e.text === "string" ? e.text.slice(0, 200) : void 0; } catch (_) {}
      try { errInfo2.json = e && e.json; } catch (_) {}
      return { ok: false, reason: "network_" + (status || "unknown"), detail: errInfo2, retryable: true };
    }
  }
  return { ok: false, reason: "unknown", retryable: true };
}
async function deleteWereadReview(cookieRef, reviewId) {
  if (!reviewId) return { ok: false, reason: "no_reviewId" };
  try {
    const resp = await (0, import_obsidian2.requestUrl)({
      url: `${BASE}/web/review/deleteReview`,
      method: "POST",
      headers: buildJsonPostHeaders(cookieRef.value),
      body: JSON.stringify({ reviewId })
    });
    applyResponseCookies(cookieRef, resp);
    return { ok: !hasBlockingError(resp.json) };
  } catch (e) {
    console.error("[ReadFlow] deleteWereadReview failed", e);
    return { ok: false, reason: "network" };
  }
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
  const note = review.content ? stripHtml(String(review.content)).trim() : void 0;
  if (!note) return void 0;
  if (review.contextAbstract && note === review.contextAbstract.trim()) return void 0;
  if (review.abstract && note === review.abstract.trim()) return void 0;
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
      sourceType: "weread",
      wereadRange: range || void 0,
      wereadBookmarkId: u.bookmarkId ? String(u.bookmarkId) : void 0,
      contextAbstract: u.contextAbstract ? String(u.contextAbstract) : void 0
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
    const origText = (rev.contextAbstract || rev.abstract || "").trim();
    const thought = reviewNoteText(rev);
    const content = origText || thought || "";
    if (!content) continue;
    const note = (thought && thought !== content) ? thought : void 0;
    out.push({
      id: `weread-rv-${rev.reviewId}`,
      bookId,
      content,
      note,
      chapter: rev.chapter,
      chapterUid: rev.chapterUid,
      status: "inbox",
      importance: 3,
      createdAt: rev.createdAt,
      sourceType: "weread",
      wereadRange: rev.range || void 0,
      wereadReviewId: rev.reviewId || void 0,
      contextAbstract: rev.contextAbstract || void 0
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
      var prevNoteIsBuggy = prev.note && prev.content && prev.note.trim() === prev.content.trim();
      var mergedNote = prevNoteIsBuggy ? (h.note || void 0) : (prev.note || h.note);
      map.set(h.id, {
        ...h,
        status: prev.status,
        highlightType: (_a = prev.highlightType) != null ? _a : h.highlightType,
        topic: (_b = prev.topic) != null ? _b : h.topic,
        links: ((_c = prev.links) == null ? void 0 : _c.length) ? prev.links : h.links,
        note: mergedNote,
        importance: prev.importance,
        relationHints: prev.relationHints,
        wereadRange: prev.wereadRange || h.wereadRange,
        wereadBookmarkId: prev.wereadBookmarkId || h.wereadBookmarkId,
        wereadReviewId: prev.wereadReviewId || h.wereadReviewId,
        contextAbstract: prev.contextAbstract || h.contextAbstract
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

module.exports = {
  BASE,
  IWEREAD_BASE,
  MAX_SYNC_CONCURRENCY,
  isJsonObject,
  hasBlockingError,
  extractBookmarkRows,
  parseCookieMap,
  serializeCookieMap,
  getSetCookieLines,
  mergeSetCookieFromHeaders,
  applyResponseCookies,
  bookmarkStableKey,
  fetchJsonPreferNonEmpty,
  tryFallbackIfEmpty,
  extractReviewWrappers,
  buildWebGetHeaders,
  buildJsonPostHeaders,
  encodeCookieForMobile,
  normalizeTs,
  normalizeNotebookRow,
  titleFromBookDetail,
  titleFromBookmarkPayload,
  titleFromFirstReview,
  verifyWereadCookieSilent,
  fetchNotebookBooks,
  refreshWereadSessionOnSite,
  fetchBookDetail,
  fetchBookmarkList,
  logBookmarklistIfEmpty,
  fetchReviews,
  fetchChapterInfos,
  pushNoteToWeread,
  deleteWereadReview,
  stripHtml,
  parseChapterMap,
  extractWereadReviewPayloads,
  reviewNoteText,
  buildReviewNoteMap,
  highlightsFromBookmarks,
  highlightsFromReviews,
  mergeHighlights,
  syncOneBook,
  shouldSyncBook,
  syncAllBooksWithNotes
};
