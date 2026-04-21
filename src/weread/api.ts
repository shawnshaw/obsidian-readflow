/**
 * Weread API Module
 * 微信读书 Web API 封装
 * 
 * 主要功能：
 * 1. 获取书架数据
 * 2. 获取阅读进度
 * 3. 验证 Cookie 有效性
 * 
 * API 端点：
 * - 书架同步: GET https://weread.qq.com/web/shelf/sync
 * - 书籍详情: GET https://weread.qq.com/web/book/info?bookId={id}
 */

import { requestUrl } from "obsidian";

// ========== 类型定义 ==========

export interface WereadBook {
  bookId: string;
  title: string;
  author: string;
  cover?: string;
  format?: string;
  finished?: number;
  readingTime?: number;
  readUpdateTime?: number;
  progress?: number;
  chapterIdx?: number;
}

export interface BookProgress {
  bookId: string;
  progress: number;
  chapterIdx: number;
  chapterUid: number;
  chapterOffset: number;
  readingTime: number;
  updateTime: number;
}

export interface ShelfSyncResponse {
  books: WereadBook[];
  bookProgress: BookProgress[];
  synckey: number;
  pureBookCount: number;
  bookCount: number;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ========== 常量 ==========

const WEB_API_BASE = "https://weread.qq.com/web";
const IWEREAD_API_BASE = "https://i.weread.qq.com";

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://weread.qq.com/",
  "Origin": "https://weread.qq.com",
};

// ========== Cookie 处理 ==========

/**
 * 解析 Cookie 字符串为 Map
 */
export function parseCookie(cookieStr: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieStr) return map;
  
  for (const part of cookieStr.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) map.set(name, value);
  }
  return map;
}

/**
 * 将 Cookie Map 序列化为字符串
 */
export function serializeCookie(map: Map<string, string>): string {
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

/**
 * 编码 Cookie（用于移动端）
 */
export function encodeCookie(cookieRaw: string): string {
  return cookieRaw.split(";").map((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return part.trim();
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    return `${name}=${encodeURIComponent(decodeURIComponent(value))}`;
  }).join(";");
}

/**
 * 从 Set-Cookie header 提取并合并 Cookie
 */
export function mergeSetCookie(existingCookie: string, setCookieHeaders: string[]): string {
  const map = parseCookie(existingCookie);
  
  for (const line of setCookieHeaders) {
    const first = line.split(";")[0]?.trim();
    if (!first) continue;
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    let value = first.slice(eq + 1).trim();
    if (!name) continue;
    
    // 处理删除标记
    if (name.toLowerCase() === "deleted" || value.toLowerCase() === "deleted") {
      map.delete(name);
      continue;
    }
    map.set(name, value);
  }
  
  return serializeCookie(map);
}

// ========== 请求工具 ==========

function buildHeaders(cookieRaw: string, isMobile: boolean = false): Record<string, string> {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  const cookie = cookieRaw?.trim();
  
  if (cookie) {
    headers["Cookie"] = isMobile ? encodeCookie(cookie) : cookie;
  }
  
  return headers;
}

async function fetchJson<T>(
  url: string,
  cookie: string,
  options: { method?: string; body?: unknown; isMobile?: boolean } = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, isMobile = false } = options;
  
  try {
    const headers = buildHeaders(cookie, isMobile);
    if (body) {
      headers["Content-Type"] = "application/json;charset=UTF-8";
    }
    
    const resp = await requestUrl({
      url,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // 合并 Set-Cookie
    const setCookieHeader = resp.headers["set-cookie"] || resp.headers["Set-Cookie"];
    if (setCookieHeader) {
      const newCookie = mergeSetCookie(
        cookie,
        Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
      );
      if (newCookie !== cookie) {
        // Cookie 已更新，可通过返回值通知调用者
      }
    }
    
    if (resp.status >= 200 && resp.status < 300) {
      const json = resp.json;
      
      // 检查业务错误
      if (json?.errCode === -2012 || json?.errcode === -2012) {
        return { ok: false, error: "AUTH_EXPIRED" };
      }
      
      return { ok: true, data: json as T };
    }
    
    return { ok: false, error: `HTTP_${resp.status}` };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `NETWORK_ERROR: ${err}` };
  }
}

// ========== API 方法 ==========

/**
 * 验证 Cookie 是否有效
 */
export async function verifyCookie(cookie: string): Promise<boolean> {
  const result = await fetchJson<{ errCode?: number }>(
    `${WEB_API_BASE}/user`,
    cookie
  );
  return result.ok && result.data?.errCode !== -2012;
}

/**
 * 获取用户信息
 */
export async function getUserInfo(cookie: string): Promise<ApiResult<{
  userVid: string;
  nickname: string;
  sk: string;
}>> {
  const result = await fetchJson<any>(`${WEB_API_BASE}/user`, cookie);
  
  if (!result.ok) return result;
  
  const data = result.data;
  const userSpace = data?.userSpace || data;
  
  return {
    ok: true,
    data: {
      userVid: userSpace?.userVid || userSpace?.vid || "",
      nickname: userSpace?.nickname || "",
      sk: userSpace?.sk || "",
    }
  };
}

/**
 * 获取书架同步数据
 * 
 * @param cookie - 微信读书 Cookie
 * @param synckey - 上次同步的 synckey，0 表示全量获取
 * @returns 书架数据和阅读进度
 */
export async function getShelfSync(
  cookie: string,
  synckey: number = 0
): Promise<ApiResult<ShelfSyncResponse>> {
  const url = `${WEB_API_BASE}/shelf/sync?album=1&localBookCount=0&onlyBookid=0&synckey=${synckey}`;
  
  const result = await fetchJson<any>(url, cookie);
  
  if (!result.ok) return result;
  
  const data = result.data;
  
  return {
    ok: true,
    data: {
      books: data.books || [],
      bookProgress: data.bookProgress || [],
      synckey: data.synckey || 0,
      pureBookCount: data.pureBookCount || 0,
      bookCount: data.bookCount || 0,
    }
  };
}

/**
 * 获取单本书籍的详细信息
 */
export async function getBookDetail(
  cookie: string,
  bookId: string
): Promise<ApiResult<WereadBook>> {
  const url = `${WEB_API_BASE}/book/info?bookId=${encodeURIComponent(bookId)}`;
  
  const result = await fetchJson<any>(url, cookie);
  
  if (!result.ok) return result;
  
  const data = result.data;
  
  return {
    ok: true,
    data: {
      bookId: data.bookId || bookId,
      title: data.title || "",
      author: data.author || "",
      cover: data.cover,
      format: data.format,
      finished: data.finished,
      readingTime: data.readingTime,
      readUpdateTime: data.readUpdateTime,
    }
  };
}

/**
 * 获取最近阅读书籍
 */
export async function getRecentBooks(cookie: string): Promise<ApiResult<WereadBook[]>> {
  const url = `${WEB_API_BASE}/book/getRecentBooks`;
  
  const result = await fetchJson<any>(url, cookie);
  
  if (!result.ok) return result;
  
  const data = result.data;
  const books: WereadBook[] = [];
  
  if (Array.isArray(data.books)) {
    for (const b of data.books) {
      books.push({
        bookId: b.bookId || b.book?.bookId || "",
        title: b.title || b.book?.title || "",
        author: b.author || b.book?.author || "",
        cover: b.cover || b.book?.cover,
        format: b.format || b.book?.format,
      });
    }
  }
  
  return { ok: true, data: books };
}

// ========== 工具函数 ==========

/**
 * 格式化阅读时长
 */
export function formatReadingTime(minutes: number): string {
  if (!minutes) return "无记录";
  if (minutes < 60) return `${minutes}分钟`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours < 24) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}天${remainingHours}小时`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(ts: number): string {
  if (!ts) return "无记录";
  try {
    const date = new Date(ts * 1000);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(ts);
  }
}

/**
 * 从 Cookie 中提取 vid
 */
export function extractVid(cookie: string): string {
  const map = parseCookie(cookie);
  return map.get("wr_vid") || "";
}

/**
 * 从 Cookie 中提取 skey
 */
export function extractSkey(cookie: string): string {
  const map = parseCookie(cookie);
  return map.get("wr_skey") || "";
}
