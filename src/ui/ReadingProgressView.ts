/**
 * Reading Progress Panel View
 * 
 * 功能：
 * 1. 显示书架概览（总书籍数、有进度书籍数）
 * 2. 最近阅读列表
 * 3. 快速同步按钮
 * 4. 进度详情
 */

import { ItemView, WorkspaceLeaf, Notice, setIcon } from "obsidian";
import type ReadFlowPlugin from "../main";

export const READING_PROGRESS_VIEW_TYPE = "readflow-reading-progress";

export class ReadingProgressView extends ItemView {
  private plugin: ReadFlowPlugin;
  private containerEl: HTMLElement;
  private isLoading: boolean = false;
  private refreshTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: ReadFlowPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.containerEl = leaf.containerEl;
  }

  getViewType(): string {
    return READING_PROGRESS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "阅读进度";
  }

  async onOpen(): Promise<void> {
    this.render();
    this.startAutoRefresh();
  }

  async onClose(): Promise<void> {
    this.stopAutoRefresh();
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    // 每5分钟刷新一次
    this.refreshTimer = window.setInterval(() => {
      this.render();
    }, 5 * 60 * 1000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async refresh(): Promise<void> {
    await this.render();
  }

  private async render(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const contentEl = this.contentEl;
      contentEl.empty();
      contentEl.addClass("readflow-reading-progress");

      // Fetch latest data
      const cookie = this.plugin.settings.wereadCookie;
      if (!cookie) {
        this.renderNoCookie(contentEl);
        return;
      }

      // Check if we have cached data
      const cache = this.plugin.readingProgressCache;
      const now = Date.now();
      
      if (!cache || now - cache.timestamp > 5 * 60 * 1000) {
        // Cache expired, need to sync
        await this.syncAndRender(contentEl);
      } else {
        this.renderFromCache(contentEl, cache);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private async syncAndRender(contentEl: HTMLElement): Promise<void> {
    const result = await this.plugin.syncReadingProgress();
    
    if (result.success) {
      this.renderFromCache(contentEl, {
        timestamp: Date.now(),
        ...result
      });
    } else {
      this.renderError(contentEl, result.error || "同步失败");
    }
  }

  private renderFromCache(contentEl: HTMLElement, cache: any): void {
    // Header with stats
    const header = contentEl.createDiv("readflow-rp-header");
    
    // Stats cards
    const statsRow = header.createDiv("readflow-rp-stats");
    
    const totalCard = statsRow.createDiv("readflow-rp-stat-card");
    totalCard.createDiv("readflow-rp-stat-value").setText(String(cache.totalBooks || 0));
    totalCard.createDiv("readflow-rp-stat-label").setText("书架总数");
    
    const progressCard = statsRow.createDiv("readflow-rp-stat-card");
    progressCard.createDiv("readflow-rp-stat-value").setText(String(cache.booksWithProgress || 0));
    progressCard.createDiv("readflow-rp-stat-label").setText("有进度");
    
    const updatedCard = statsRow.createDiv("readflow-rp-stat-card");
    updatedCard.createDiv("readflow-rp-stat-value").setText(String(cache.updatedCount || 0));
    updatedCard.createDiv("readflow-rp-stat-label").setText("已更新");

    // Actions
    const actions = header.createDiv("readflow-rp-actions");
    
    const syncBtn = actions.createDiv("readflow-rp-action-btn");
    syncBtn.innerHTML = `<span class="readflow-rp-icon">🔄</span> 刷新`;
    syncBtn.onClickEvent(() => {
      this.syncAndRender(contentEl);
    });
    
    const openBtn = actions.createDiv("readflow-rp-action-btn");
    openBtn.innerHTML = `<span class="readflow-rp-icon">📚</span> 打开书架`;
    openBtn.onClickEvent(() => {
      window.open("https://weread.qq.com/", "_blank");
    });

    // Recent reading list
    const listSection = contentEl.createDiv("readflow-rp-list-section");
    listSection.createEl("h3", { text: "最近阅读" });

    const list = listSection.createDiv("readflow-rp-list");
    
    const recentBooks = cache.recentReading || [];
    
    if (recentBooks.length === 0) {
      list.createDiv("readflow-rp-empty").setText("暂无阅读记录");
      return;
    }

    for (const book of recentBooks.slice(0, 20)) {
      const item = list.createDiv("readflow-rp-item");
      
      // Book title
      const title = item.createDiv("readflow-rp-title");
      title.setText(book.title || "未知书籍");
      
      // Author
      const author = item.createDiv("readflow-rp-author");
      author.setText(book.author || "未知作者");
      
      // Progress bar
      const progressRow = item.createDiv("readflow-rp-progress-row");
      const progressBar = progressRow.createDiv("readflow-rp-progress-bar");
      const progressFill = progressBar.createDiv("readflow-rp-progress-fill");
      progressFill.style.width = `${Math.min(100, book.progress || 0)}%`;
      
      const progressText = progressRow.createDiv("readflow-rp-progress-text");
      progressText.setText(`${book.progress || 0}%`);
      
      // Meta info
      const meta = item.createDiv("readflow-rp-meta");
      const timeStr = this.formatReadingTime(book.readingTime || 0);
      const dateStr = this.formatDate(book.lastRead || book.updateTime);
      meta.setText(`${timeStr} · ${dateStr}`);
      
      // Click to open in weread
      item.addClass("clickable");
      item.onClickEvent(() => {
        window.open(`https://weread.qq.com/book/${book.bookId}`, "_blank");
      });
    }

    // Footer with last update time
    const footer = contentEl.createDiv("readflow-rp-footer");
    const updateTime = new Date(cache.timestamp);
    footer.setText(`更新于 ${updateTime.toLocaleTimeString("zh-CN")}`);
  }

  private renderNoCookie(contentEl: HTMLElement): void {
    const empty = contentEl.createDiv("readflow-rp-empty-state");
    
    empty.createEl("h3", { text: "未配置微信读书 Cookie" });
    empty.createDiv().setText("请在插件设置中配置微信读书登录 Cookie");
    
    const btn = empty.createDiv("readflow-rp-action-btn");
    btn.innerHTML = `<span class="readflow-rp-icon">⚙️</span> 打开设置`;
    btn.onClickEvent(() => {
      this.plugin.openSettings();
    });
  }

  private renderError(contentEl: HTMLElement, error: string): void {
    const errorEl = contentEl.createDiv("readflow-rp-error");
    
    errorEl.createEl("h3", { text: "同步失败" });
    errorEl.createDiv().setText(error);
    
    const retryBtn = errorEl.createDiv("readflow-rp-action-btn");
    retryBtn.innerHTML = `<span class="readflow-rp-icon">🔄</span> 重试`;
    retryBtn.onClickEvent(() => {
      this.render();
    });
  }

  private formatReadingTime(minutes: number): string {
    if (!minutes) return "无记录";
    if (minutes < 60) return `${minutes}分钟`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours < 24) {
      return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remaining = hours % 24;
    return `${days}d${remaining}h`;
  }

  private formatDate(timestamp: number | string): string {
    if (!timestamp) return "无记录";
    
    const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
    const date = new Date(ts * (ts > 1e11 ? 1 : 1000));
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  }
}
