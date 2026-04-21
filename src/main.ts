/**
 * ReadFlow Plugin - Main Entry
 * 
 * Features:
 * 1. Reading Progress Sync from WeRead
 * 2. Auto-update Obsidian notes
 * 3. Reading progress panel view
 */

import { Plugin, App, Notice, TFile, TFolder } from "obsidian";
import * as api from "./weread/api";
import { ReadingProgressSettingsTab, DEFAULT_READING_PROGRESS_SETTINGS, type ReadingProgressSettings } from "./settings/ReadingProgressSettings";
import { ReadingProgressView } from "./ui/ReadingProgressView";

// ========== 类型定义 ==========

export interface ReadingProgressCache {
  timestamp: number;
  totalBooks: number;
  booksWithProgress: number;
  updatedCount: number;
  recentReading: Array<{
    bookId: string;
    title: string;
    author: string;
    progress: number;
    chapterIdx: number;
    readingTime: number;
    lastRead: number;
    updateTime: number;
  }>;
}

export interface ReadingProgressResult {
  success: boolean;
  totalBooks?: number;
  booksWithProgress?: number;
  updatedCount?: number;
  recentReading?: any[];
  error?: string;
}

export interface ReadFlowSettings {
  // Existing settings
  wereadCookie: string;
  booksBasePath: string;
  atomicHighlights: boolean;
  linkerMaxFiles: number;
  linkerIgnorePrefixes: string;
  wereadHeartbeat: {
    enabled: boolean;
    intervalSeconds: number;
    autoStartOnObsidianLaunch: boolean;
    customEndpoint: string;
    currentBookId: string;
    autoDetectFromWindow: boolean;
  };
  
  // New: Reading Progress settings
  readingProgress: ReadingProgressSettings;
}

const DEFAULT_SETTINGS: ReadFlowSettings = {
  wereadCookie: "",
  booksBasePath: "Books",
  atomicHighlights: false,
  linkerMaxFiles: 400,
  linkerIgnorePrefixes: ".obsidian\n.trash\n",
  wereadHeartbeat: {
    enabled: false,
    intervalSeconds: 30,
    autoStartOnObsidianLaunch: true,
    customEndpoint: "",
    currentBookId: "",
    autoDetectFromWindow: true,
  },
  readingProgress: {
    enabled: false,
    syncIntervalMinutes: 60,
    targetFolders: ["Books", "ReadingSpace/微信读书", "ReadingSpace/读书笔记", "我/读书笔记", "个人/读书笔记"],
    noteFields: {
      progress: "reading-progress",
      readingTime: "reading-time",
      lastRead: "last-read",
      chapter: "reading-chapter",
    },
    autoSyncNoteFields: true,
    lastSyncTime: 0,
    lastSyncResult: "none",
  },
};

// ========== Plugin Main Class ==========

export default class ReadFlowPlugin extends Plugin {
  settings!: ReadFlowSettings;
  readingProgressCache: ReadingProgressCache | null = null;
  settingsTab!: ReadingProgressSettingsTab;
  readingProgressView: ReadingProgressView | null = null;
  syncTimer: number | null = null;

  async onload(): Promise<void> {
    console.log("[ReadFlow] Plugin loading...");
    
    // Load settings
    await this.loadSettings();
    
    // Add settings tab
    this.settingsTab = new ReadingProgressSettingsTab(this.app, this);
    this.addSettingTab(this.settingsTab as any);
    
    // Register reading progress view
    this.registerView(
      "readflow-reading-progress",
      (leaf) => (this.readingProgressView = new ReadingProgressView(leaf, this))
    );
    
    // Add ribbon icon
    this.addRibbonIcon("book", "阅读进度", async () => {
      await this.openReadingProgressPanel();
    });
    
    // Add command to open reading progress panel
    this.addCommand({
      id: "readflow-open-reading-progress",
      name: "打开阅读进度面板",
      callback: () => this.openReadingProgressPanel(),
    });
    
    // Add command to sync reading progress
    this.addCommand({
      id: "readflow-sync-reading-progress",
      name: "同步阅读进度",
      callback: async () => {
        const result = await this.syncReadingProgress();
        if (result.success) {
          new Notice(`同步成功！更新了 ${result.updatedCount} 篇笔记`);
        } else {
          new Notice(`同步失败: ${result.error}`);
        }
      },
    });
    
    // Start auto-sync if enabled
    if (this.settings.readingProgress.enabled) {
      this.startAutoSync();
    }
    
    console.log("[ReadFlow] Plugin loaded");
  }

  async onunload(): Promise<void> {
    this.stopAutoSync();
    if (this.readingProgressView) {
      this.readingProgressView.close();
    }
    console.log("[ReadFlow] Plugin unloaded");
  }

  // ========== Settings ==========

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    
    // Ensure nested objects are properly merged
    if (!this.settings.wereadHeartbeat) {
      this.settings.wereadHeartbeat = DEFAULT_SETTINGS.wereadHeartbeat;
    }
    if (!this.settings.readingProgress) {
      this.settings.readingProgress = DEFAULT_READING_PROGRESS_SETTINGS;
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    
    // Handle auto-sync toggle
    const rpEnabled = this.settings.readingProgress.enabled;
    if (rpEnabled && !this.syncTimer) {
      this.startAutoSync();
    } else if (!rpEnabled && this.syncTimer) {
      this.stopAutoSync();
    }
  }

  // ========== Auto Sync ==========

  private startAutoSync(): void {
    this.stopAutoSync();
    
    const intervalMs = this.settings.readingProgress.syncIntervalMinutes * 60 * 1000;
    console.log(`[ReadFlow] Starting auto sync, interval: ${intervalMs}ms`);
    
    this.syncTimer = window.setInterval(async () => {
      console.log("[ReadFlow] Auto sync triggered");
      const result = await this.syncReadingProgress();
      
      if (result.success) {
        // Refresh view if open
        if (this.readingProgressView) {
          await this.readingProgressView.refresh();
        }
        
        // Update cache timestamp for view refresh
        if (this.readingProgressCache) {
          this.readingProgressCache.timestamp = Date.now();
        }
      }
    }, intervalMs);
  }

  private stopAutoSync(): void {
    if (this.syncTimer !== null) {
      window.clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log("[ReadFlow] Auto sync stopped");
    }
  }

  // ========== Reading Progress Sync ==========

  /**
   * 同步阅读进度到 Obsidian 笔记
   */
  async syncReadingProgress(): Promise<ReadingProgressResult> {
    const cookie = this.settings.wereadCookie;
    
    if (!cookie) {
      return { success: false, error: "未配置微信读书 Cookie" };
    }
    
    try {
      // 1. 验证 Cookie
      const isValid = await api.verifyCookie(cookie);
      if (!isValid) {
        return { success: false, error: "Cookie 已过期，请重新配置" };
      }
      
      // 2. 获取书架数据
      const shelfResult = await api.getShelfSync(cookie);
      if (!shelfResult.ok) {
        return { success: false, error: shelfResult.error || "获取书架失败" };
      }
      
      const { books, bookProgress } = shelfResult.data!;
      
      // 3. 匹配书籍和进度
      const booksById = new Map(books.map(b => [b.bookId, b]));
      const progressByBook = new Map(bookProgress.map(p => [p.bookId, p]));
      
      // 4. 更新笔记
      let updatedCount = 0;
      
      if (this.settings.readingProgress.autoSyncNoteFields) {
        for (const bookId of progressByBook.keys()) {
          const book = booksById.get(bookId);
          const progress = progressByBook.get(bookId)!;
          
          if (book) {
            const updated = await this.updateNoteProgress(bookId, book, progress);
            if (updated) updatedCount++;
          }
        }
      }
      
      // 5. 构建最近阅读列表
      const recentReading = bookProgress
        .sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0))
        .slice(0, 20)
        .map(p => {
          const book = booksById.get(p.bookId);
          return {
            bookId: p.bookId,
            title: book?.title || "未知书籍",
            author: book?.author || "未知作者",
            progress: p.progress || 0,
            chapterIdx: p.chapterIdx || 0,
            readingTime: p.readingTime || 0,
            lastRead: p.updateTime || 0,
            updateTime: p.updateTime || 0,
          };
        });
      
      // 6. 更新缓存
      this.readingProgressCache = {
        timestamp: Date.now(),
        totalBooks: books.length,
        booksWithProgress: bookProgress.length,
        updatedCount,
        recentReading,
      };
      
      // 7. 保存同步结果
      this.settings.readingProgress.lastSyncTime = Date.now();
      this.settings.readingProgress.lastSyncResult = "success";
      await this.saveSettings();
      
      return {
        success: true,
        totalBooks: books.length,
        booksWithProgress: bookProgress.length,
        updatedCount,
        recentReading,
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error("[ReadFlow] Sync error:", error);
      
      this.settings.readingProgress.lastSyncResult = "failed";
      await this.saveSettings();
      
      return { success: false, error };
    }
  }

  /**
   * 更新单个笔记的阅读进度
   */
  private async updateNoteProgress(
    bookId: string,
    book: api.WereadBook,
    progress: api.BookProgress
  ): Promise<boolean> {
    const { targetFolders, noteFields } = this.settings.readingProgress;
    
    // 搜索笔记文件
    const notePath = await this.findNoteByBookId(bookId, targetFolders);
    if (!notePath) {
      console.log(`[ReadFlow] No note found for bookId: ${bookId}`);
      return false;
    }
    
    try {
      const file = this.app.vault.getAbstractFileByPath(notePath);
      if (!(file instanceof TFile) || file.extension !== "md") {
        return false;
      }
      
      const content = await this.app.vault.read(file);
      const updatedContent = this.updateNoteFrontmatter(content, progress);
      
      if (updatedContent !== content) {
        await this.app.vault.modify(file, updatedContent);
        console.log(`[ReadFlow] Updated note: ${notePath}`);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error(`[ReadFlow] Failed to update note ${notePath}:`, e);
      return false;
    }
  }

  /**
   * 在目标文件夹中查找书籍对应的笔记
   */
  private async findNoteByBookId(bookId: string, folders: string[]): Promise<string | null> {
    // 模式1: frontmatter 中的 book_id
    const pattern1 = new RegExp(`(?:bookId|book_id|wereadId|weread_id)[:\\s]*["']?${bookId}["']?`, "i");
    
    // 模式2: 文件名匹配书籍ID
    const pattern2 = new RegExp(`^${bookId}\\.md$`);
    
    for (const folder of folders) {
      const folderPath = folder.startsWith("/") ? folder.slice(1) : folder;
      const folderObj = this.app.vault.getAbstractFileByPath(folderPath);
      
      if (!(folderObj instanceof TFolder)) continue;
      
      const files = folderObj.children;
      for (const file of files) {
        if (!(file instanceof TFile) || file.extension !== "md") continue;
        
        try {
          const content = await this.app.vault.read(file);
          
          // 检查 frontmatter 或正文中的 bookId
          if (pattern1.test(content)) {
            return file.path;
          }
          
          // 检查文件名
          if (pattern2.test(file.name)) {
            return file.path;
          }
        } catch {
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * 更新笔记的 frontmatter
   */
  private updateNoteFrontmatter(content: string, progress: api.BookProgress): string {
    const { noteFields } = this.settings.readingProgress;
    
    const lines = content.split("\n");
    let inFrontmatter = false;
    let frontmatterEnd = 0;
    const frontmatterLines: string[] = [];
    const bodyLines: string[] = [];
    
    // 分割 frontmatter 和正文
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === "---") {
        if (!inFrontmatter) {
          inFrontmatter = true;
          frontmatterLines.push(line);
        } else {
          frontmatterEnd = i;
          bodyLines.push(line);
          // 添加剩余的正文
          for (let j = i + 1; j < lines.length; j++) {
            bodyLines.push(lines[j]);
          }
          break;
        }
      } else if (inFrontmatter) {
        frontmatterLines.push(line);
      } else {
        bodyLines.push(line);
      }
    }
    
    if (!inFrontmatter) {
      // 没有 frontmatter，添加到文件开头
      const newFields = [
        "---",
        `${noteFields.progress}: ${progress.progress || 0}`,
        `${noteFields.readingTime}: ${progress.readingTime || 0}`,
        `${noteFields.lastRead}: ${this.formatDate(progress.updateTime)}`,
        `${noteFields.chapter}: ${progress.chapterIdx || 0}`,
        "---",
        "",
      ];
      return newFields.join("\n") + content;
    }
    
    // 构建字段更新映射
    const newFields: Record<string, string> = {
      [noteFields.progress]: `${progress.progress || 0}`,
      [noteFields.readingTime]: `${progress.readingTime || 0}`,
      [noteFields.lastRead]: this.formatDate(progress.updateTime),
      [noteFields.chapter]: `${progress.chapterIdx || 0}`,
    };
    
    // 更新现有字段或添加新字段
    const updatedFrontmatter: string[] = [];
    const seenFields = new Set<string>();
    
    for (const line of frontmatterLines) {
      let matched = false;
      
      for (const [field, value] of Object.entries(newFields)) {
        const pattern = new RegExp(`^${field}\\s*:`);
        if (pattern.test(line)) {
          updatedFrontmatter.push(`${field}: ${value}`);
          seenFields.add(field);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        updatedFrontmatter.push(line);
      }
    }
    
    // 添加缺失的字段
    for (const [field, value] of Object.entries(newFields)) {
      if (!seenFields.has(field)) {
        updatedFrontmatter.push(`${field}: ${value}`);
      }
    }
    
    return updatedFrontmatter.join("\n") + "\n" + bodyLines.join("\n");
  }

  /**
   * 格式化日期
   */
  private formatDate(timestamp: number): string {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // ========== View Management ==========

  private async openReadingProgressPanel(): Promise<void> {
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.open(this.readingProgressView!);
  }

  // ========== Old Settings Compatibility ==========

  get wereadCookie(): string {
    return this.settings.wereadCookie;
  }

  set wereadCookie(value: string) {
    this.settings.wereadCookie = value;
  }
}
