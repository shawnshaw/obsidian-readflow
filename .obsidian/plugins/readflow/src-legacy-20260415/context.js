/*
 * ReadFlow - Context & Card Rendering
 * 上下文解析、卡片渲染、上下文展开区
 */

// ===================== 上下文解析 =====================
/**
 * 解析 contextAbstract 字段，尝试切分出 上文/原文/下文
 * Weread API 返回的 contextAbstract 通常就是纯文本片段，
 * 我们用摘录内容(content)在其中定位来切分三段。
 */
function parseContextAbstract(h) {
  if (!h.contextAbstract) return null;
  var raw = h.contextAbstract;
  var excerpt = h.content || "";
  var idx = -1;

  if (excerpt) {
    idx = raw.indexOf(excerpt);
    if (idx === -1) idx = raw.indexOf(excerpt.slice(0, 20));
    if (idx === -1) idx = raw.indexOf(excerpt.slice(0, 10));
  }

  var before = "", main = "", after = "";
  if (idx !== -1) {
    before = raw.slice(0, idx).trim();
    main = excerpt;
    after = raw.slice(idx + excerpt.length).trim();
  } else {
    main = raw.slice(0, 120);
    before = "";
    after = raw.slice(120);
  }

  if (before.length > 300) before = "\u2026" + before.slice(-280);
  if (after.length > 300) after = after.slice(0, 280) + "\u2026";

  return {
    before: before || null,
    main: main || raw.slice(0, 100),
    after: after || null,
    chapter: h.chapter || null,
    wereadRange: h.wereadRange || null
  };
}

// ===================== 上下文展开区 DOM（插入到卡片内）=====================
/**
 * 在给定 cardEl 末尾插入上下文展开区。
 * 调用时 card 刚创建完，actions 尚未创建。
 */
function appendContextWrap(view, cardEl, h, book) {
  var ObsidianLib = require("obsidian");
  var ctx = parseContextAbstract(h);
  if (!ctx) return;

  var ctxWrap = cardEl.createDiv("readflow-context-wrap");

  // 章节标题
  if (ctx.chapter) {
    var ctxChap = ctxWrap.createDiv("readflow-context-chapter");
    ctxChap.textContent = ctx.chapter;
  }

  // 正文
  var ctxBody = ctxWrap.createDiv("readflow-context-body");
  if (ctx.before) {
    var beforeEl = ctxBody.createDiv("readflow-context-before");
    beforeEl.textContent = ctx.before;
  }
  var mainEl = ctxBody.createDiv("readflow-context-main");
  mainEl.textContent = ctx.main;
  if (ctx.after) {
    var afterEl = ctxBody.createDiv("readflow-context-after");
    afterEl.textContent = ctx.after;
  }

  // 页脚
  var ctxFooter = ctxWrap.createDiv("readflow-context-footer");
  if (ctx.wereadRange) {
    ctxFooter.createEl("span", { text: "\u7B2C" + ctx.wereadRange + "\u8282", cls: "readflow-chip readflow-chip--soft" });
    var wereadLink = ctxFooter.createEl("button", {
      text: "\u5728\u5FAE\u4FE1\u8BFB\u4E66\u4E2D\u67E5\u770B",
      type: "button",
      cls: "readflow-btn readflow-btn--ghost readflow-btn--xs"
    });
    wereadLink.addEventListener("click", function(e) {
      e.stopPropagation();
      window.open("https://weread.qq.com/book/" + book.bookId, "_blank");
    });
  }
  var collapseBtn = ctxFooter.createEl("button", {
    text: "\u220F \u6536\u8D77",
    type: "button",
    cls: "readflow-btn readflow-btn--ghost readflow-btn--xs"
  });
  collapseBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    view.expandedHighlightId = null;
    view.render();
  });
}

// ===================== 上下文按钮（插入到 meta 行）=====================
function appendContextBtn(view, meta, h) {
  var ObsidianLib = require("obsidian");
  var ctxBtn = meta.createEl("button", {
    text: "\u2605 \u4E0A\u4E0B\u6587",
    type: "button",
    cls: "readflow-chip readflow-chip--context-btn"
  });
  ctxBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    if (view.expandedHighlightId === h.id) view.expandedHighlightId = null;
    else view.expandedHighlightId = h.id;
    view.render();
  });
}

// ===================== 卡片点击 / Hover 事件 =====================
function attachCardInteraction(view, cardEl, h) {
  // 点击卡片（排除按钮/checkbox）切换展开
  cardEl.addEventListener("click", function(e) {
    if (e.target.closest("input, button")) return;
    if (h.contextAbstract) {
      if (view.expandedHighlightId === h.id) view.expandedHighlightId = null;
      else view.expandedHighlightId = h.id;
      view.render();
    }
  });

  // Hover 进入：1.8 秒后自动展开（仅在尚未展开时）
  cardEl.addEventListener("mouseenter", function() {
    if (!h.contextAbstract || view.expandedHighlightId === h.id) return;
    view.hoverCardId = h.id;
    view.hoverTimeoutId = window.setTimeout(function() {
      if (view.hoverCardId === h.id) {
        view.expandedHighlightId = h.id;
        view.render();
      }
    }, 1800);
  });

  // Hover 离开：取消计时
  cardEl.addEventListener("mouseleave", function() {
    view.hoverCardId = null;
    if (view.hoverTimeoutId) {
      clearTimeout(view.hoverTimeoutId);
      view.hoverTimeoutId = null;
    }
  });
}

export {
  parseContextAbstract,
  appendContextWrap,
  appendContextBtn,
  attachCardInteraction
};
