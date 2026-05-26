// src_new/importer/wereadMd.ts
// 解析 Weread 插件落地的 md 文件（ReadingSpace/微信读书/*.md）
// 与 src/importer/wereadMd.ts 保持同步，功能一致

/** 从 ^bookId-chapterUid-start-end 提取各段 */
export function parseWereadBlockId(blockId: string | null | undefined) {
  if (!blockId || !blockId.startsWith("^")) return null;
  const inner = blockId.slice(1);
  const parts = inner.split("-");
  if (parts.length < 4) return null;
  return {
    bookId: parts[0],
    chapterUid: parseInt(parts[1], 10) || 0,
    start: parseInt(parts[2], 10) || 0,
    end: parseInt(parts[3], 10) || 0,
    range: parts.slice(1).join("-")
  };
}

function parseTimestamp(str: string): number {
  if (!str) return Date.now();
  const d = new Date(str.replace(/\//g, "-"));
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function hashStr(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function genHlId(bookId: string, blockId: string, reviewId: string): string {
  if (reviewId) return `weread-rv-${reviewId.replace(/-/g, "_")}`;
  if (blockId) {
    const p = blockId.split("-");
    if (p.length >= 4) return `weread-bm-${p.slice(1).join("-")}`;
    return `weread-bm-${hashStr(bookId + blockId)}`;
  }
  return `weread-bm-${hashStr(bookId)}`;
}

function parseFrontmatter(lines: string[], bodyStart: number) {
  const fm = lines.slice(0, bodyStart).join("\n");
  return {
    bookId: (fm.match(/(?:bookId|wereadId)[\s:]+["']?([^"'\s,]+)/i)?.[1] || "").trim(),
    isbn: (fm.match(/isbn[\s:]+["']?([^"'\s,]+)/i)?.[1] || "").trim(),
    lastReadDate: (fm.match(/lastReadDate[\s:]+["']?([^"'\s,]+)/i)?.[1] || "").trim(),
    progress: parseInt(fm.match(/(?:progress|reading-progress)[\s:]+["']?(\d+)/i)?.[1] || "0", 10) || 0,
    readingTime: (fm.match(/(?:readingTime|reading-time)[\s:]+["']?(.+?)["']?\s*$/im)?.[1] || "").trim(),
    readingDate: (fm.match(/(?:readingDate|reading-date)[\s:]+["']?([^"'\s,]+)/i)?.[1] || "").trim(),
    author: (fm.match(/^author[\s:]+["']?(.+?)["']?\s*$/im)?.[1] || "").trim().replace(/^["']|["']$/g, ""),
    cover: (fm.match(/cover[\s:]+["']?([^"'\s,]+)/i)?.[1] || "").trim(),
  };
}

function parseHlTextToReviewId(
  lines: string[],
  notesStart: number
): Map<string, { reviewId: string; chapter: string }> {
  const m = new Map<string, { reviewId: string; chapter: string }>();
  if (notesStart < 0) return m;
  let ch = "";
  for (let i = notesStart; i < lines.length; i++) {
    const t = lines[i].trim();
    const cm = t.match(/^#{2,3}\s+(.+)/);
    if (cm) { ch = cm[1].trim(); continue; }
    const rm = t.match(/^>\s*[\uD83C\uDDED\uD83D\uDCAD\u2B50\u2606📌]\s*(.+?)\s*\^(\d{6,}[-_][A-Za-z0-9]+)/);
    if (rm) { m.set(rm[1].trim().replace(/\s+$/, "").replace(/\s+/g, " "), { reviewId: rm[2], chapter: ch }); continue; }
    if (t.startsWith("> ") && /[\uD83C\uDDED\uD83D\uDCAD\u2B50📌]/.test(t)) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nxt = lines[j].trim();
        if (!nxt) continue;
        const vm = nxt.match(/(?:\s*[\u221E\u22CE\u2192\u25B6]\s*)*\^(\d{6,}[-_][A-Za-z0-9]+)/);
        if (vm) {
          const text = t.slice(t.indexOf(">") + 1).trim().replace(/^[\s\uD83C\uDDED\uD83D\uDCAD\u2B50📌]+\s*/, "").replace(/\s+/g, " ").trim();
          m.set(text, { reviewId: vm[1], chapter: ch });
          break;
        }
        if (nxt.trim() && !nxt.startsWith("-") && !nxt.startsWith(">")) break;
      }
    }
  }
  return m;
}

export interface ParsedBook {
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  lastReadDate: string;
  progress: number;
  readingTime: number;
  readingDate: string;
  cover: string;
  highlights: ParsedHighlight[];
  meta: { isbn: string; bookId: string; finishedDate: string; filePath: string };
}

export interface ParsedHighlight {
  id: string;
  bookId: string;
  content: string;
  note: string | undefined;
  chapter: string;
  chapterUid: number | undefined;
  wereadRange: string | undefined;
  wereadReviewId: string | undefined;
  createdAt: number;
  sourceType: "weread";
  status: "inbox";
  importance: number;
}

/**
 * 从 md 文件内容解析书籍和划线
 */
export function parseWereadMdFile(content: string, filePath: string): ParsedBook {
  const lines = content.split("\n");

  // 找 frontmatter
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "---") { bodyStart = i + 1; break; }
  }

  const fm = parseFrontmatter(lines, bodyStart);
  let bookId = fm.bookId, isbn = fm.isbn;
  let finishedDate = fm.lastReadDate, author = fm.author;
  let progress = fm.progress, readingTime = fm.readingTime, readingDate = fm.readingDate, cover = fm.cover;
  let title = "";

  // 从 # 元数据 区提取书名/作者
  let hlSectionStart = -1, notesSectionStart = -1;
  for (let i = bodyStart; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === "# 元数据") {
      for (let j = i + 1; j < lines.length; j++) {
        const tj = lines[j].trim();
        if (tj.startsWith("#")) break;
        const abM = tj.match(/^>\s*书名[：:]\s*(.+)/);
        if (abM) { title = abM[1].trim(); break; }
        const auM = tj.match(/^>\s*作者[：:]\s*(.+)/);
        if (auM && !author) { author = auM[1].trim(); break; }
      }
    }
    if (t === "# 高亮划线") { hlSectionStart = i + 1; }
    if (t === "# 读书笔记" || t === "# 本书评论") { notesSectionStart = i + 1; break; }
  }

  const hlTextToReviewId = parseHlTextToReviewId(lines, notesSectionStart);

  // 解析高亮
  const highlights: ParsedHighlight[] = [];
  let currentChapter = "";
  let currentChapterUid = 0;
  const scanStart = hlSectionStart >= 0 ? hlSectionStart : bodyStart;

  for (let i = scanStart; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "# 读书笔记" || trimmed === "# 本书评论") break;

    const chapM = trimmed.match(/^#{2,3}\s+(.+)/);
    if (chapM) { currentChapter = chapM[1].trim(); continue; }
    if (!trimmed.startsWith("> 📌")) continue;

    // 收集多行内容（> 开头但非 ⏱ 的行）
    const contentLines = [trimmed.slice(5).trim()];
    for (let k = i + 1; k < Math.min(i + 20, lines.length); k++) {
      const cl = lines[k].trim();
      if (!cl || cl === "# 读书笔记" || cl === "# 本书评论") break;
      if (cl.startsWith("> ⏱") || cl.startsWith("- ") || cl.startsWith("> 📌")) break;
      // 多行续行：去掉前导 > 和空格
      const cleaned = cl.replace(/^>\s?/, "").trim();
      if (cleaned) contentLines.push(cleaned);
    }
    // 清理内容末尾的内联 blockId（如 "内容 ^44026191-73-3877-3901"）
    let rawContent = contentLines.join(" ").trim();
    let blockId = "", wereadRange = "";
    if (/ \^[\w]+-[\d]+-[\d]+-[\d]+$/.test(rawContent)) {
      const m = rawContent.match(/^(.+?) \^([\w]+-[\d]+-[\d]+-[\d]+)$/);
      if (m) {
        rawContent = m[1].trim();
        blockId = m[2];
        const p = m[2].split("-");
        if (p.length >= 4) {
          if (!bookId) bookId = p[0];
          currentChapterUid = parseInt(p[1], 10) || 0;
          wereadRange = `${p[p.length - 2]}-${p[p.length - 1]}`;
        }
      }
    }
    if (!rawContent) continue;

    let createdAt = Date.now();
    let wereadReviewId = "";

    // 扫描后续元数据行（最多 i+12 行）
    for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
      const nxt = lines[j].trim();
      if (!nxt) continue;

      if (nxt.startsWith("> ⏱")) {
        const inner = nxt.slice(5).trim();
        const caretIdx = inner.lastIndexOf("^");
        if (caretIdx !== -1) {
          createdAt = parseTimestamp(inner.slice(0, caretIdx).trim());
          const bid = inner.slice(caretIdx + 1).trim();
          if (!blockId) {
            const p = bid.split("-");
            if (p.length >= 4) {
              if (!bookId) bookId = p[0];
              currentChapterUid = parseInt(p[1], 10) || 0;
              blockId = bid;
              wereadRange = `${p[p.length - 2]}-${p[p.length - 1]}`;
            }
          }
        }
        break;
      }
      if (nxt.startsWith("- ") && /\^[\w]+-[\d]+-[\d]+$/.test(nxt)) {
        const lastSpace = nxt.lastIndexOf(" ");
        if (lastSpace > 0) createdAt = parseTimestamp(nxt.slice(0, lastSpace).replace(/[^\d:\/-]/g, " ").trim());
        const cm = nxt.match(/\^([\w]+-[\d]+-[\d]+-[\d]+)$/);
        if (cm && !blockId) {
          const p = cm[1].split("-");
          if (p.length >= 4) {
            if (!bookId) bookId = p[0];
            currentChapterUid = parseInt(p[1], 10) || 0;
            blockId = cm[1];
            wereadRange = `${p[p.length - 2]}-${p[p.length - 1]}`;
          }
        }
        break;
      }
      if (/^\s*[\u221E\u22CE]/.test(nxt)) {
        const vm = nxt.match(/\^(\w+)/);
        if (vm) {
          wereadReviewId = vm[1].replace(/-/g, "_");
          if (lines[j + 1] && lines[j + 1].trim().startsWith("- ⏱")) {
            createdAt = parseTimestamp(lines[j + 1].trim().match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/)?.[1] || "");
          }
        }
        continue;
      }
      break;
    }

    if (!bookId) continue;

    if (!wereadReviewId) {
      const mapped = hlTextToReviewId.get(rawContent.trimEnd());
      if (mapped) {
        wereadReviewId = mapped.reviewId.replace(/-/g, "_");
        if (!currentChapter && mapped.chapter) currentChapter = mapped.chapter;
      }
    }

    const hlId = genHlId(bookId, blockId, wereadReviewId);

    highlights.push({
      id: hlId,
      bookId,
      content: rawContent,
      note: void 0,
      chapter: currentChapter,
      chapterUid: currentChapterUid,
      wereadRange: wereadRange || void 0,
      wereadReviewId: wereadReviewId || void 0,
      createdAt,
      sourceType: "weread",
      status: "inbox",
      importance: 3
    });
  }

  if (!title) {
    const pathParts = filePath.replace(/\\/g, "/").split("/");
    title = pathParts[pathParts.length - 1].replace(/\.md$/i, "");
  }

  return {
    bookId: bookId || isbn || title,
    title,
    author,
    isbn,
    lastReadDate: finishedDate,
    progress,
    readingTime,
    readingDate,
    cover,
    highlights,
    meta: { isbn, bookId, finishedDate, filePath }
  };
}
