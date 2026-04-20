/*
 * ReadFlow - Weread API Client & Sync Logic
 * 微信读书 API 请求、数据抓取、同步逻辑
 */

import { BASE, normalizeTs, applyResponseCookies, hasBlockingError, isJsonObject, stripHtml } from "./constants.js";

// ===================== 请求头 =====================
function buildWebGetHeaders(cookieRaw) {
  var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  var headers = {
    "User-Agent": ua,
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    accept: "application/json, text/plain, */*",
    Referer: BASE + "/",
    Origin: BASE
  };
  var c = cookieRaw == null ? void 0 : cookieRaw.trim();
  if (c) {
    var ObsidianLib = require("obsidian");
    headers.Cookie = !ObsidianLib.Platform.isDesktopApp ? encodeCookieForMobile(c) : c;
  }
  return headers;
}

function buildJsonPostHeaders(cookieRaw) {
  var h = buildWebGetHeaders(cookieRaw);
  h["Content-Type"] = "application/json";
  return h;
}

function encodeCookieForMobile(cookieRaw) {
  return cookieRaw.split(";").map(function(part) {
    var idx = part.indexOf("=");
    if (idx === -1) return part.trim();
    var name = part.slice(0, idx).trim();
    var value = part.slice(idx + 1).trim();
    return name + "=" + encodeURIComponent(decodeURIComponent(value));
  }).join(";");
}

// ===================== 单条 API =====================
async function fetchNotebookBooks(cookieRef) {
  var ObsidianLib = require("obsidian");
  var resp = await ObsidianLib.requestUrl({ url: BASE + "/api/user/notebook", method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
  applyResponseCookies(cookieRef, resp);
  var books = resp.json.books;
  if (!Array.isArray(books)) {
    if (resp.json.errcode === -2012) new ObsidianLib.Notice("微信读书 Cookie 已失效，请更新 Cookie");
    return [];
  }
  return books.map(function(b) { return normalizeNotebookRow(b); }).filter(function(r) { return r != null; });
}

async function fetchBookDetail(cookieRef, bookId) {
  var ObsidianLib = require("obsidian");
  var resp = await ObsidianLib.requestUrl({ url: BASE + "/api/book/" + bookId + "/info", method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
  applyResponseCookies(cookieRef, resp);
  return resp.json;
}

async function fetchBookmarkList(cookieRef, bookId) {
  var ObsidianLib = require("obsidian");
  var resp = await ObsidianLib.requestUrl({ url: BASE + "/api/book/" + bookId + "/bookmarklist", method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
  applyResponseCookies(cookieRef, resp);
  return resp.json;
}

async function fetchReviews(cookieRef, bookId) {
  var ObsidianLib = require("obsidian");
  var resp = await ObsidianLib.requestUrl({ url: BASE + "/api/book/" + bookId + "/reviewlist", method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
  applyResponseCookies(cookieRef, resp);
  return resp.json;
}

async function fetchJsonPreferNonEmpty(cookieRef, primaryUrl, fallbackUrl, label, rowCount) {
  var ObsidianLib = require("obsidian");
  var primaryJson = null;
  try {
    var resp = await ObsidianLib.requestUrl({ url: primaryUrl, method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
    applyResponseCookies(cookieRef, resp);
    primaryJson = resp.json;
  } catch (e) {
    console.warn("[ReadFlow] " + label + " primary", e);
  }
  return tryFallbackIfEmpty(cookieRef, primaryJson, fallbackUrl, label, rowCount);
}

async function tryFallbackIfEmpty(cookieRef, primaryJson, fallbackUrl, label, rowCount) {
  if (rowCount(primaryJson) > 0) return primaryJson;
  var ObsidianLib = require("obsidian");
  try {
    var resp2 = await ObsidianLib.requestUrl({ url: fallbackUrl, method: "GET", headers: buildWebGetHeaders(cookieRef.value) });
    applyResponseCookies(cookieRef, resp2);
    var alt = resp2.json;
    if (rowCount(alt) > 0) {
      console.log("[ReadFlow] " + label + ": \u5907\u7528\u63A5\u53E3\u62C9\u53D6\u5230\u6570\u636E");
      return alt;
    }
  } catch (e) {
    console.warn("[ReadFlow] " + label + " fallback", e);
  }
  return primaryJson;
}

async function verifyWereadCookieSilent(cookieRaw) {
  if (!cookieRaw.trim()) return false;
  var ObsidianLib = require("obsidian");
  try {
    var resp = await ObsidianLib.requestUrl({ url: BASE + "/api/user/notebook", method: "GET", headers: buildWebGetHeaders(cookieRaw) });
    if (resp.json.errcode === -2012) return false;
    return Array.isArray(resp.json.books);
  } catch (e) {
    return false;
  }
}

async function refreshWereadSessionOnSite(cookieRef) {
  var ObsidianLib = require("obsidian");
  try {
    var resp = await ObsidianLib.requestUrl({ url: BASE + "/", method: "GET", throw: false, headers: buildWebGetHeaders(cookieRef.value) });
    applyResponseCookies(cookieRef, resp);
  } catch (e) {
    console.warn("[ReadFlow] GET weread.qq.com/", e);
  }
}

// ===================== 数据规范化 =====================
function normalizeNotebookRow(raw) {
  var book = raw.book;
  var bookId = String((book == null ? void 0 : book.bookId) || raw.bookId || "").trim();
  if (!bookId) return null;
  var title = (book == null ? void 0 : book.title) || raw.title;
  var authorRaw = (book == null ? void 0 : book.author) || raw.author;
  var author = authorRaw == null ? void 0 : authorRaw.replace(/\[(.*?)\]/g, "\u3010$1\u3011");
  return {
    bookId: bookId,
    title: title,
    author: author,
    noteCount: Number(raw.noteCount || 0),
    reviewCount: Number(raw.reviewCount || 0),
    bookType: book == null ? void 0 : book.type
  };
}

function titleFromBookDetail(detail) {
  if (!detail) return void 0;
  var t = detail.title || (detail.bookInfo && detail.bookInfo.title) || (detail.book && detail.book.title);
  return t && String(t).trim() ? String(t).trim() : void 0;
}

function titleFromBookmarkPayload(bmJson) {
  var book = bmJson == null ? void 0 : bmJson.book;
  var t = book == null ? void 0 : book.title;
  return t && t.trim() ? t.trim() : void 0;
}

function titleFromFirstReview(rvJson) {
  var reviews = rvJson == null ? void 0 : rvJson.reviews;
  var first = reviews && reviews[0];
  var firstReview = first && first.review;
  var firstBook = firstReview && firstReview.book;
  var t = firstBook && firstBook.title;
  return t && t.trim() ? t.trim() : void 0;
}

// ===================== 抽取逻辑 =====================
function extractReviewWrappers(json) {
  if (!json || !isJsonObject(json)) return [];
  if (hasBlockingError(json)) return [];
  var revs = json.reviews;
  return Array.isArray(revs) ? revs : [];
}

function extractBookmarkRows(json) {
  var updated = [];
  if (!json || !isJsonObject(json)) return updated;
  var list = json.updated || json.bookmarkList;
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      if (!u || typeof u !== "object") continue;
      updated.push(u);
    }
  }
  return updated;
}

function bookmarkStableKey(u) {
  var rawId = String(u.bookmarkId || u.id || "").trim();
  if (rawId) return rawId.replace(/[_~]/g, "-");
  var t = Number(u.createTime || u.created || 0);
  var range = String(u.range || "");
  var excerpt = String(u.markText || u.contextAbstract || u.abstract || u.text || u.content || "").slice(0, 48);
  return "t" + t + "_r" + range + "_x" + excerpt.length;
}

function extractWereadReviewPayloads(json) {
  var out = [];
  if (!json || !isJsonObject(json)) return out;
  var reviews = json.reviews;
  if (!Array.isArray(reviews)) return out;
  for (var i = 0; i < reviews.length; i++) {
    var rev = reviews[i];
    if (!rev) continue;
    var reviewId = String(rev.reviewId || "").trim();
    if (!reviewId) continue;
    var type = Number(rev.type || 0);
    if (type !== 1 && type !== 4) continue;
    var chapterUid = typeof rev.chapterUid === "number" ? rev.chapterUid :
      (typeof rev.chapterUid === "string" && /^\d+$/.test(rev.chapterUid) ? parseInt(rev.chapterUid, 10) : void 0);
    out.push({
      reviewId: reviewId,
      type: type,
      range: rev.range ? String(rev.range) : void 0,
      contextAbstract: rev.contextAbstract ? String(rev.contextAbstract).trim() : void 0,
      content: stripHtml(String(rev.content || rev.htmlContent || "")).trim() || void 0,
      abstract: rev.abstract ? String(rev.abstract).trim() : void 0,
      chapter: rev.chapterTitle || rev.chapterName || void 0,
      chapterUid: chapterUid,
      createdAt: normalizeTs(Number(rev.createTime) || 0)
    });
  }
  return out;
}

function reviewNoteText(review) {
  var note = review.content ? stripHtml(String(review.content)).trim() : void 0;
  if (!note) return void 0;
  if (review.contextAbstract && note === review.contextAbstract.trim()) return void 0;
  if (review.abstract && note === review.abstract.trim()) return void 0;
  return note;
}

function buildReviewNoteMap(reviewPayloads) {
  var map = new Map();
  for (var i = 0; i < reviewPayloads.length; i++) {
    var review = reviewPayloads[i];
    if (!review.range || review.type !== 1) continue;
    map.set(review.range, review);
  }
  return map;
}

// ===================== Highlight 构造 =====================
function highlightsFromBookmarks(bookId, json, reviewsByRange) {
  var updated = extractBookmarkRows(json);
  var out = [];
  for (var i = 0; i < updated.length; i++) {
    var u = updated[i];
    var content = String(u.markText || u.contextAbstract || u.abstract || u.text || u.content || "").trim();
    var range = u.range ? String(u.range) : "";
    var matchedReview = range ? reviewsByRange.get(range) : void 0;
    var key = bookmarkStableKey(u);
    var idSafe = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 96);
    if (!content) continue;
    out.push({
      id: "weread-bm-" + idSafe,
      bookId: bookId,
      content: content,
      note: matchedReview ? reviewNoteText(matchedReview) : void 0,
      chapter: u.chapterName ? String(u.chapterName) : u.chapterTitle ? String(u.chapterTitle) : void 0,
      chapterUid: typeof u.chapterUid === "number" ? u.chapterUid :
        (typeof u.chapterUid === "string" && /^\d+$/.test(u.chapterUid) ? parseInt(u.chapterUid, 10) : void 0),
      status: "inbox",
      importance: 3,
      createdAt: normalizeTs(Number(u.createTime || u.created) || 0),
      sourceType: "weread",
      wereadRange: range || void 0,
      wereadBookmarkId: u.bookmarkId ? String(u.bookmarkId) : void 0,
      contextAbstract: u.contextAbstract ? String(u.contextAbstract) : void 0
    });
  }
  if (updated.length > 0 && out.length === 0) {
    console.warn("[ReadFlow] bookmarklist 有条目但无可用正文（检查 markText/contextAbstract 是否为空）", updated.length);
  }
  return out;
}

function highlightsFromReviews(bookId, json, bookmarkRanges) {
  var reviews = extractWereadReviewPayloads(json);
  var out = [];
  for (var i = 0; i < reviews.length; i++) {
    var rev = reviews[i];
    if (rev.type === 1 && rev.range && bookmarkRanges.has(rev.range)) continue;
    var origText = (rev.contextAbstract || rev.abstract || "").trim();
    var thought = reviewNoteText(rev);
    var content = origText || thought || "";
    if (!content) continue;
    var note = (thought && thought !== content) ? thought : void 0;
    out.push({
      id: "weread-rv-" + rev.reviewId,
      bookId: bookId,
      content: content,
      note: note,
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
  var map = new Map();
  for (var i = 0; i < existing.length; i++) {
    var h = existing[i];
    map.set(h.id, Object.assign({}, h));
  }
  for (var j = 0; j < incoming.length; j++) {
    var h2 = incoming[j];
    var prev = map.get(h2.id);
    if (prev) {
      var prevNoteIsBuggy = prev.note && prev.content && prev.note.trim() === prev.content.trim();
      var mergedNote = prevNoteIsBuggy ? (h2.note || void 0) : (prev.note || h2.note);
      map.set(h2.id, Object.assign(Object.assign({}, h2), {
        status: prev.status,
        highlightType: prev.highlightType || h2.highlightType,
        topic: prev.topic || h2.topic,
        links: (prev.links && prev.links.length) ? prev.links : h2.links,
        note: mergedNote,
        importance: prev.importance,
        relationHints: prev.relationHints,
        wereadRange: prev.wereadRange || h2.wereadRange,
        wereadBookmarkId: prev.wereadBookmarkId || h2.wereadBookmarkId,
        wereadReviewId: prev.wereadReviewId || h2.wereadReviewId,
        contextAbstract: prev.contextAbstract || h2.contextAbstract
      }));
    } else {
      map.set(h2.id, h2);
    }
  }
  return Array.from(map.values());
}

export {
  buildWebGetHeaders, buildJsonPostHeaders, encodeCookieForMobile,
  fetchNotebookBooks, fetchBookDetail, fetchBookmarkList, fetchReviews,
  fetchJsonPreferNonEmpty, tryFallbackIfEmpty,
  verifyWereadCookieSilent, refreshWereadSessionOnSite,
  normalizeNotebookRow, titleFromBookDetail, titleFromBookmarkPayload, titleFromFirstReview,
  extractReviewWrappers, extractBookmarkRows, bookmarkStableKey,
  extractWereadReviewPayloads, reviewNoteText, buildReviewNoteMap,
  highlightsFromBookmarks, highlightsFromReviews, mergeHighlights
};
