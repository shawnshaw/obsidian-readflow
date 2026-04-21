/**
 * Reading Progress Settings
 * 
 * 功能：
 * 1. 同步开关
 * 2. 同步间隔配置
 * 3. 同步目标文件夹
 * 4. 笔记字段映射
 * 5. 手动同步按钮
 * 6. 同步状态显示
 */

import { App, Setting, Notice, ButtonComponent, PluginSettingTab } from "obsidian";
import type ReadFlowPlugin from "../main";

export interface ReadingProgressSettings {
  enabled: boolean;
  syncIntervalMinutes: number;
  targetFolders: string[];
  noteFields: {
    progress: string;
    readingTime: string;
    lastRead: string;
    chapter: string;
  };
  autoSyncNoteFields: boolean;
  lastSyncTime: number;
  lastSyncResult: "success" | "failed" | "none";
}

export const DEFAULT_READING_PROGRESS_SETTINGS: ReadingProgressSettings = {
  enabled: false,
  syncIntervalMinutes: 60,
  targetFolders: ["Books", "ReadingSpace/微信读书", "ReadingSpace/读书笔记"],
  noteFields: {
    progress: "reading-progress",
    readingTime: "reading-time",
    lastRead: "last-read",
    chapter: "reading-chapter",
  },
  autoSyncNoteFields: true,
  lastSyncTime: 0,
  lastSyncResult: "none",
};

export class ReadingProgressSettingsTab extends PluginSettingTab {
  private plugin: ReadFlowPlugin;
  private syncButtonEl: HTMLElement | null = null;
  private lastSyncEl: HTMLElement | null = null;

  constructor(app: App, plugin: ReadFlowPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    const rpSettings = this.plugin.settings.readingProgress || DEFAULT_READING_PROGRESS_SETTINGS;
    
    // Header
    containerEl.createEl("h2", { text: "阅读进度同步" });
    containerEl.createDiv({
      text: "从微信读书同步阅读进度到 Obsidian 笔记",
      cls: "setting-item-description"
    });

    // Enable toggle
    new Setting(containerEl)
      .setName("启用同步")
      .setDesc("开启后自动同步阅读进度")
      .addToggle((toggle) => {
        toggle
          .setValue(rpSettings.enabled)
          .onChange(async (value) => {
            rpSettings.enabled = value;
            await this.plugin.saveSettings();
            new Notice(value ? "阅读进度同步已启用" : "阅读进度同步已禁用");
          });
      });

    // Sync interval
    new Setting(containerEl)
      .setName("同步间隔")
      .setDesc("自动同步的时间间隔（分钟）")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("30", "30 分钟")
          .addOption("60", "1 小时")
          .addOption("120", "2 小时")
          .addOption("360", "6 小时")
          .setValue(String(rpSettings.syncIntervalMinutes))
          .onChange(async (value) => {
            rpSettings.syncIntervalMinutes = parseInt(value);
            await this.plugin.saveSettings();
          });
      });

    // Target folders
    new Setting(containerEl)
      .setName("同步目标文件夹")
      .setDesc("搜索读书笔记的文件夹路径（逗号分隔）")
      .addText((text) => {
        text
          .setPlaceholder("Books, ReadingSpace/微信读书")
          .setValue(rpSettings.targetFolders.join(", "))
          .onChange(async (value) => {
            rpSettings.targetFolders = value.split(",").map((s) => s.trim()).filter(Boolean);
            await this.plugin.saveSettings();
          });
      });

    // Auto sync note fields
    new Setting(containerEl)
      .setName("自动更新笔记字段")
      .setDesc("自动更新 Obsidian 笔记的 frontmatter 字段")
      .addToggle((toggle) => {
        toggle
          .setValue(rpSettings.autoSyncNoteFields)
          .onChange(async (value) => {
            rpSettings.autoSyncNoteFields = value;
            await this.plugin.saveSettings();
          });
      });

    // Field mappings
    containerEl.createEl("h3", { text: "笔记字段映射" });
    
    new Setting(containerEl)
      .setName("进度字段")
      .setDesc("frontmatter 中表示阅读进度的字段名")
      .addText((text) => {
        text
          .setPlaceholder("reading-progress")
          .setValue(rpSettings.noteFields.progress)
          .onChange(async (value) => {
            rpSettings.noteFields.progress = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("阅读时长字段")
      .setDesc("frontmatter 中表示阅读时长的字段名")
      .addText((text) => {
        text
          .setPlaceholder("reading-time")
          .setValue(rpSettings.noteFields.readingTime)
          .onChange(async (value) => {
            rpSettings.noteFields.readingTime = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("最后阅读字段")
      .setDesc("frontmatter 中表示最后阅读时间的字段名")
      .addText((text) => {
        text
          .setPlaceholder("last-read")
          .setValue(rpSettings.noteFields.lastRead)
          .onChange(async (value) => {
            rpSettings.noteFields.lastRead = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("章节字段")
      .setDesc("frontmatter 中表示当前章节的字段名")
      .addText((text) => {
        text
          .setPlaceholder("reading-chapter")
          .setValue(rpSettings.noteFields.chapter)
          .onChange(async (value) => {
            rpSettings.noteFields.chapter = value;
            await this.plugin.saveSettings();
          });
      });

    // Manual sync button
    new Setting(containerEl)
      .setName("手动同步")
      .setDesc("立即执行一次同步")
      .addButton((button) => {
        button
          .setButtonText("立即同步")
          .setCta()
          .onClick(async () => {
            await this.performSync();
          });
      });

    // Sync status
    new Setting(containerEl)
      .setName("同步状态")
      .addExtraButton((btn) => {
        btn.setIcon("refresh-cw");
        btn.setTooltip("刷新");
        btn.onClick(() => {
          this.updateSyncStatus();
        });
      });
      
    this.lastSyncEl = containerEl.createDiv("readflow-sync-status");
    this.updateSyncStatus();
    
    // Save settings reference
    this.plugin.settings.readingProgress = rpSettings;
  }

  private async performSync(): Promise<void> {
    new Notice("开始同步阅读进度...");
    
    try {
      const result = await this.plugin.syncReadingProgress();
      
      const rpSettings = this.plugin.settings.readingProgress || DEFAULT_READING_PROGRESS_SETTINGS;
      rpSettings.lastSyncTime = Date.now();
      rpSettings.lastSyncResult = result.success ? "success" : "failed";
      await this.plugin.saveSettings();
      
      if (result.success) {
        new Notice(`同步成功！更新了 ${result.updatedCount} 篇笔记`);
      } else {
        new Notice(`同步失败: ${result.error}`);
      }
      
      this.updateSyncStatus();
    } catch (e) {
      new Notice(`同步出错: ${e}`);
    }
  }

  private updateSyncStatus(): void {
    if (!this.lastSyncEl) return;
    
    const rpSettings = this.plugin.settings.readingProgress || DEFAULT_READING_PROGRESS_SETTINGS;
    
    if (rpSettings.lastSyncTime === 0) {
      this.lastSyncEl.setText("从未同步");
      return;
    }
    
    const time = new Date(rpSettings.lastSyncTime);
    const timeStr = time.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    const statusIcon = rpSettings.lastSyncResult === "success" ? "✓" : 
                       rpSettings.lastSyncResult === "failed" ? "✗" : "•";
    
    this.lastSyncEl.setText(`上次同步: ${timeStr} ${statusIcon}`);
  }
}
