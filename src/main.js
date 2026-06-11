/*
 * ReadFlow — Obsidian Community Plugin
 * Version: 0.3.1
 * Author: Oscar Shao
 * Repository: https://github.com/Os/readflow
 * License: MIT
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ReadFlowPlugin,
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  wereadCookie: "",
  booksBasePath: "Books",
  mdImportPaths: "ReadingSpace/\u5FAE\u4FE1\u8BFB\u4E66",
  autoSyncEnabled: false,
  autoSyncIntervalMinutes: 60,
  atomicHighlights: false,
  linkerMaxFiles: 400,
  linkerIgnorePrefixes: ".obsidian\n.trash\n",
  llmClassifier: {
    enabled: false,
    model: "qwen2.5",
    endpoint: "http://localhost:11434/api/generate",
    apiKey: "",
  },
};
function getMdImportPaths(settings) {
  const paths = /* @__PURE__ */ new Set();
  const base = String(settings.booksBasePath || "Books").replace(/^\/+|\/+$/g, "");
  if (base) paths.add(base);
  const raw = settings.mdImportPaths != null ? String(settings.mdImportPaths) : "";
  for (const line of raw.split(/\r?\n/)) {
    const p = line.replace(/^\/+|\/+$/g, "").trim();
    if (p) paths.add(p);
  }
  return [...paths];
}
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
      text: "\u684C\u9762\u7AEF\u53EF\u70B9\u51FB\u300C\u6253\u5F00\u767B\u5F55\u7A97\u53E3\u300D\u81EA\u52A8\u4FDD\u5B58 Cookie\uFF08\u4E0E Weread \u63D2\u4EF6\u540C\u5C5E Electron \u5185\u5D4C\u6D4F\u89C8\u5668 + \u62E6\u622A\u8BF7\u6C42\uFF09\uFF1B\u79FB\u52A8\u7AEF\u8BF7\u624B\u52A8\u7C98\u8D34\u3002",
    });
    new import_obsidian.Setting(containerEl)
      .setName("\u6253\u5F00 ReadFlow \u9762\u677F")
      .setDesc(
        "\u5728\u4E2D\u95F4\u4E3B\u533A\u57DF\u65B0\u5F00\u4E00\u4E2A\u6807\u7B7E\uFF08\u4E0E\u7B14\u8BB0\u6807\u7B7E\u5E76\u5217\uFF09\uFF0C\u4E0D\u518D\u4F7F\u7528\u5DE6\u4FA7\u529F\u80FD\u533A\u56FE\u6807\u3002\u4E5F\u53EF\u5728\u547D\u4EE4\u9762\u677F\u641C\u7D22\u300CReadFlow\u300D\u3002",
      )
      .addButton((btn) =>
        btn
          .setButtonText("\u6253\u5F00\u9762\u677F")
          .setCta()
          .onClick(() => {
            void this.plugin.openPanel();
          }),
      );
    new import_obsidian.Setting(containerEl)
      .setName("\u684C\u9762\u7AEF\uFF1A\u6253\u5F00\u5FAE\u4FE1\u8BFB\u4E66\u767B\u5F55\u7A97\u53E3")
      .setDesc(
        "\u5F39\u51FA\u72EC\u7ACB\u7A97\u53E3\u626B\u7801\u767B\u5F55\uFF1B\u6210\u529F\u540E\u4F1A\u5199\u5165\u4E0B\u65B9 Cookie \u5E76\u4FDD\u5B58\u3002\u82E5\u5931\u8D25\u8BF7\u6539\u7528\u624B\u52A8\u7C98\u8D34\u3002",
      )
      .addButton((btn) =>
        btn
          .setButtonText("\u6253\u5F00\u767B\u5F55")
          .setCta()
          .onClick(() => {
            this.plugin.openWereadLogin();
          }),
      );
    new import_obsidian.Setting(containerEl)
      .setName("\u5FAE\u4FE1\u8BFB\u4E66 Cookie")
      .setDesc(
        "\u7C98\u8D34\u5B8C\u6574 Cookie \u5B57\u7B26\u4E32\uFF08\u683C\u5F0F\uFF1Awr_vid=...\uFF1B wr_skey=...\uFF09\u3002\u624B\u52A8\u65B9\u5F0F\uFF1AChrome \u6253\u5F00 weread.qq.com \u2192 F12 \u2192 Application \u2192 Cookies \u2192 \u590D\u5236\u6240\u6709\u952E\u503C\u4E3A name=value \u5E76\u7528\u5206\u53F7\u8FDE\u63A5\u3002",
      )
      .addTextArea((ta) => {
        ta.setValue(this.plugin.settings.wereadCookie).onChange(async (v) => {
          this.plugin.settings.wereadCookie = v;
          await this.plugin.saveSettings();
        });
        ta.inputEl.rows = 4;
        ta.inputEl.style.width = "100%";
      });
    new import_obsidian.Setting(containerEl)
      .setName("\u9A8C\u8BC1 Cookie")
      .setDesc("\u6253\u901A notebook API \u68C0\u67E5 Cookie \u662F\u5426\u6709\u6548\uFF08\u5931\u6548\u65F6 errcode -2012\uFF09\u3002")
      .addButton((btn) =>
        btn.setButtonText("\u9A8C\u8BC1").onClick(async () => {
          const cookie = this.plugin.settings.wereadCookie.trim();
          if (!cookie) {
            new import_obsidian.Notice("\u8BF7\u5148\u586B\u5199 Cookie");
            return;
          }
          const ok = await verifyWereadCookieSilent(cookie);
          new import_obsidian.Notice(
            ok ? "\u2705 Cookie \u6709\u6548\uFF0C\u53EF\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66" : "\u274C Cookie \u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u6216\u4ECE\u6D4F\u89C8\u5668\u7C98\u8D34",
            8e3,
          );
        }),
      );
    containerEl.createEl("h3", {
      text: "\u60F3\u6CD5\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66",
      cls: "readflow-settings-section-title",
    });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "\u5C06 Obsidian \u4E2D\u7684\u60F3\u6CD5\u5199\u56DE\u5FAE\u4FE1\u8BFB\u4E66\uFF08\u9700\u6709\u6548 Cookie\uFF09\u3002\u4EC5\u63A8\u9001\u7EAF\u6587\u672C\u60F3\u6CD5\uFF0C\u4E0D\u5305\u542B\u6807\u7B7E/\u53CC\u94FE\u3002",
    });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "\u3010ReadFlow \u9762\u677F\u3011\u540C\u6B65\u540E\u7F16\u8F91\u6458\u5F55\u60F3\u6CD5 \u2192 \u300C\u2191 \u63A8\u9001\u60F3\u6CD5\u300D\u6216\u6279\u91CF\u63A8\u9001\u3002\u5FAE\u4FE1\u8BFB\u4E66\u6765\u6E90\u7684\u6458\u5F55\u9700\u5148\u540C\u6B65\u4EE5\u83B7\u53D6 reviewId\u3002",
    });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "\u3010Obsidian \u7B14\u8BB0\u3011\u5728 frontmatter \u8BBE readflow-book-id\uFF08\u6216 book_id\uFF09\uFF0C\u53EF\u9009 readflow-chapter-uid\u3001readflow-weread-range\u3001readflow-weread-review-id\uFF1B\u6267\u884C\u547D\u4EE4\u300C\u5C06\u5F53\u524D\u7B14\u8BB0\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66\u300D\u3002\u9996\u6B21\u63A8\u9001\u6210\u529F\u540E\u4F1A\u5199\u56DE review-id\u3002",
    });
    new import_obsidian.Setting(containerEl)
      .setName("\u5C06\u5F53\u524D\u7B14\u8BB0\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66")
      .setDesc("\u63A8\u9001\u5F53\u524D Markdown \u7B14\u8BB0\u7684\u9009\u4E2D\u5185\u5BB9\uFF08\u82E5\u672A\u9009\u4E2D\u5219\u63A8\u9001\u6B63\u6587\uFF09\u3002")
      .addButton((btn) =>
        btn.setButtonText("\u7ACB\u5373\u63A8\u9001").setCta().onClick(() => {
          void this.plugin.pushCurrentVaultNoteToWeread();
        }),
      );
    new import_obsidian.Setting(containerEl)
      .setName("\u4E66\u7C4D\u843D\u76D8\u76EE\u5F55")
      .setDesc("\u76F8\u5BF9 vault \u6839\u76EE\u5F55\uFF0C\u5982 Books\uFF08API \u540C\u6B65\u5199\u5165\u76EE\u5F55\uFF09")
      .addText((t) =>
        t.setValue(this.plugin.settings.booksBasePath).onChange(async (v) => {
          this.plugin.settings.booksBasePath = v.replace(/^\/+|\/+$/g, "") || "Books";
          await this.plugin.saveSettings();
        }),
      );
    new import_obsidian.Setting(containerEl)
      .setName("MD \u5BFC\u5165\u626B\u63CF\u76EE\u5F55")
      .setDesc(
        "\u4ECE Vault \u5BFC\u5165\u65F6\u626B\u63CF\u7684\u76EE\u5F55\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09\uFF1B\u9ED8\u8BA4\u5305\u542B ReadingSpace/\u5FAE\u4FE1\u8BFB\u4E66\u3002\u4E66\u7C4D\u843D\u76D8\u76EE\u5F55\u4F1A\u81EA\u52A8\u5408\u5E76\u3002",
      )
      .addTextArea((ta) => {
        ta.setValue(this.plugin.settings.mdImportPaths || "").onChange(async (v) => {
          this.plugin.settings.mdImportPaths = v;
          await this.plugin.saveSettings();
        });
        ta.inputEl.rows = 3;
        ta.inputEl.style.width = "100%";
        if (typeof ta.setPlaceholder === "function") {
          ta.setPlaceholder("ReadingSpace/\u5FAE\u4FE1\u8BFB\u4E66");
        }
      });
    new import_obsidian.Setting(containerEl)
      .setName("\u539F\u5B50\u6458\u5F55\u5361\u7247")
      .setDesc("\u5F00\u542F\u540E\u4E3A\u6BCF\u6761\u6458\u5F55\u751F\u6210\u72EC\u7ACB Markdown \u6587\u4EF6\u3002")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.atomicHighlights).onChange(async (v) => {
          this.plugin.settings.atomicHighlights = v;
          await this.plugin.saveSettings();
        }),
      );
    new import_obsidian.Setting(containerEl)
      .setName("\u5173\u8054\u626B\u63CF\u6700\u5927\u6587\u4EF6\u6570")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.linkerMaxFiles)).onChange(async (v) => {
          const n = Math.max(50, parseInt(v, 10) || 400);
          this.plugin.settings.linkerMaxFiles = n;
          await this.plugin.saveSettings();
        }),
      );
    new import_obsidian.Setting(containerEl)
      .setName("\u5173\u8054\u5FFD\u7565\u8DEF\u5F84\u524D\u7F00\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09")
      .addTextArea((ta) => {
        ta.setValue(this.plugin.settings.linkerIgnorePrefixes).onChange(async (v) => {
          this.plugin.settings.linkerIgnorePrefixes = v;
          await this.plugin.saveSettings();
        });
        ta.inputEl.rows = 3;
        ta.inputEl.style.width = "100%";
      });
    containerEl.createEl("h3", {
      text: "AI \u5206\u7C7B\u5668\uFF08LLM\uFF09",
      cls: "readflow-settings-section-title",
    });
    new import_obsidian.Setting(containerEl)
      .setName("\u542F\u7528 LLM \u5206\u7C7B")
      .setDesc(
        "\u5F00\u542F\u540E\uFF0C\u65B0\u540C\u6B65\u7684\u6458\u5F55\u5C06\u81EA\u52A8\u901A\u8FC7 LLM \u63A8\u65AD\u7C7B\u578B\uFF08\u89C24E2\u5206\u7C7B\uFF1A\u89C2\u70B9/\u65B9\u6CD5/\u4F8B\u5B50/\u7ED3\u8BBA/\u7591\u95EE\uFF09",
      )
      .addToggle((tg) => {
        const llm = this.plugin.settings.llmClassifier || {};
        tg.setValue(!!llm.enabled).onChange(async (v) => {
          this.plugin.settings.llmClassifier = { ...llm, enabled: v };
          await this.plugin.saveSettings();
        });
      });
    new import_obsidian.Setting(containerEl)
      .setName("LLM \u6A21\u578B")
      .setDesc("\u4F8B\u5982 qwen2.5\u3001gpt-4o-mini\u3001deepseek-chat")
      .addText((t) => {
        const llm = this.plugin.settings.llmClassifier || {};
        t.setValue(llm.model || "qwen2.5").onChange(async (v) => {
          this.plugin.settings.llmClassifier = { ...llm, model: v };
          await this.plugin.saveSettings();
        });
      });
    new import_obsidian.Setting(containerEl)
      .setName("API \u7AEF\u70B9")
      .setDesc("Ollama \u6216\u5176\u4ED6 LLM API \u5730\u5740\uFF0C\u4F8B\u5982 http://localhost:11434/api/generate")
      .addText((t) => {
        const llm = this.plugin.settings.llmClassifier || {};
        t.setValue(llm.endpoint || "").onChange(async (v) => {
          this.plugin.settings.llmClassifier = { ...llm, endpoint: v };
          await this.plugin.saveSettings();
        });
      });
    new import_obsidian.Setting(containerEl)
      .setName("API Key\uFF08\u53EF\u9009\uFF09")
      .setDesc("\u5982\u6709\u8BF4\u660E\u9700\u6C42")
      .addText((t) => {
        t.inputEl.type = "password";
        const llm = this.plugin.settings.llmClassifier || {};
        t.setValue(llm.apiKey || "").onChange(async (v) => {
          this.plugin.settings.llmClassifier = { ...llm, apiKey: v };
          await this.plugin.saveSettings();
        });
      });
    const testBtn = containerEl.createEl("button", {
      text: "\u6D4B\u8BD5 LLM \u5206\u7C7B",
      type: "button",
      cls: "readflow-btn readflow-btn--secondary",
    });
    testBtn.addEventListener("click", async () => {
      try {
        const llm = this.plugin.settings.llmClassifier || {};
        const resp = await this.plugin._testLlm(llm);
        new import_obsidian.Notice(
          resp.ok ? "\u2705 LLM \u8FDE\u63A5\u6B63\u5E38" : `\u274C \u8FDE\u63A5\u5931\u8D25: ${resp.error}`,
        );
      } catch (e) {
        new import_obsidian.Notice(`\u6D4B\u8BD5\u5F02\u5E38: ${e && e.message}`);
      }
    });

    containerEl.createEl("h3", {
      text: "\u5FAE\u4FE1\u8BFB\u4E66\u5B9A\u65F6\u540C\u6B65",
      cls: "readflow-settings-section-title",
    });
    new import_obsidian.Setting(containerEl)
      .setName("\u542F\u7528\u5B9A\u65F6\u540C\u6B65")
      .setDesc("\u6309\u95F4\u9694\u81EA\u52A8\u8C03\u7528 API \u540C\u6B65\uFF08\u9700\u6709\u6548 Cookie\uFF09\u3002Cookie \u5931\u6548\u65F6\u4F1A\u63D0\u793A\u5E76\u505C\u6B62\u3002")
      .addToggle((tg) => {
        tg.setValue(!!this.plugin.settings.autoSyncEnabled).onChange(async (v) => {
          this.plugin.settings.autoSyncEnabled = v;
          await this.plugin.saveSettings();
          if (v) this.plugin.autoSyncManager.start();
          else this.plugin.autoSyncManager.stop();
        });
      });
    new import_obsidian.Setting(containerEl)
      .setName("\u540C\u6B65\u95F4\u9694\uFF08\u5206\u949F\uFF09")
      .setDesc("\u6700\u5C0F 15 \u5206\u949F")
      .addDropdown((dd) => {
        dd.addOption("15", "15 \u5206\u949F")
          .addOption("30", "30 \u5206\u949F")
          .addOption("60", "1 \u5C0F\u65F6")
          .addOption("120", "2 \u5C0F\u65F6")
          .addOption("360", "6 \u5C0F\u65F6")
          .setValue(String(this.plugin.settings.autoSyncIntervalMinutes || 60))
          .onChange(async (v) => {
            this.plugin.settings.autoSyncIntervalMinutes = parseInt(v, 10);
            await this.plugin.saveSettings();
            if (this.plugin.settings.autoSyncEnabled) {
              this.plugin.autoSyncManager.stop();
              this.plugin.autoSyncManager.start();
            }
          });
      });

    // 心跳设置
    containerEl.createEl("h3", { text: "❤️ \u8BFB\u4E66\u5FC3\u8DF3", cls: "readflow-settings-section-title" });
    new import_obsidian.Setting(containerEl)
      .setName("\u542F\u7528\u5FC3\u8DF3")
      .setDesc("\u5F00\u542F\u540E\u5B9A\u65F6\u5411\u5FAE\u4FE1\u8BFB\u4E66\u53D1\u9001\u9605\u8BFB\u4F4D\u7F6E")
      .addToggle((tg) => {
        tg.setValue(!!this.plugin.settings.heartbeatEnabled).onChange(async (v) => {
          this.plugin.settings.heartbeatEnabled = v;
          await this.plugin.saveSettings();
          if (v) this.plugin.heartbeatManager.start(this.plugin.settings.heartbeatInterval || 30);
          else this.plugin.heartbeatManager.stop();
        });
      });
    new import_obsidian.Setting(containerEl)
      .setName("\u5FC3\u8DF3\u95F4\u9694")
      .setDesc("\u53D1\u9001\u8BFB\u8BFB\u4F4D\u7F6E\u7684\u65F6\u95F4\u95F4\u9694")
      .addDropdown((dd) => {
        dd.addOption("15", "15 \u79D2")
          .addOption("30", "30 \u79D2")
          .addOption("60", "1 \u5206\u949F")
          .addOption("120", "2 \u5206\u949F")
          .setValue(String(this.plugin.settings.heartbeatInterval || 30))
          .onChange(async (v) => {
            this.plugin.settings.heartbeatInterval = parseInt(v);
            await this.plugin.saveSettings();
            if (this.plugin.settings.heartbeatEnabled) {
              this.plugin.heartbeatManager.stop();
              this.plugin.heartbeatManager.start(parseInt(v));
            }
          });
      });
    new import_obsidian.Setting(containerEl)
      .setName("\u9605\u8BFB\u7684\u4E66")
      .setDesc(
        "\u70B9\u51FB\u300C\u540C\u6B65\u67E5\u8BE2\u300D\u540E\uFF0C\u5728\u5217\u8868\u4E2D\u70B9\u51FB\u4E00\u672C\u4E66\u8BBE\u4E3A\u5F53\u524D\u9605\u8BFB\uFF08\u624D\u4F1A\u53D1\u9001\u5FC3\u8DF3\uFF09",
      )
      .addButton((btn) =>
        btn
          .setButtonText("\u540C\u6B65\u67E5\u8BE2")
          .setCta()
          .onClick(async () => {
            const result = await this.plugin.syncHeartbeatData();
            if (result.success) {
              new import_obsidian.Notice(
                `\u67E5\u8BE2\u6210\u529F\uFF01${result.booksWithProgress}\u672C\u6709\u8FDB\u5EA6`,
              );
            } else {
              new import_obsidian.Notice(`\u67E5\u8BE2\u5931\u8D25: ${result.error}`);
            }
          }),
      );
    const hbStats = this.plugin.heartbeatManager ? this.plugin.heartbeatManager.getStats() : {};
    containerEl.createDiv("setting-item-description", {
      text: `\u72B6\u6001: ${hbStats.state === "running" ? "\u2705 \u8FD0\u884C\u4E2D" : "\u23F8 \u5DF2\u505C\u6B62"}`,
    });
    containerEl.createDiv("setting-item-description", { text: `\u5DF2\u53D1\u9001: ${hbStats.totalSent || 0} \u6B21` });
  }
};

// 心跳管理器
class HeartbeatManager {
  constructor(plugin) {
    this.plugin = plugin;
    this.state = "idle";
    this.currentBook = null;
    this.timer = null;
    this.stats = { totalSent: 0, consecutiveFailures: 0, lastSent: null };
    this.listeners = new Set();
  }
  getStats() {
    return { ...this.stats, state: this.state, currentBook: this.currentBook };
  }
  addListener(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  notify() {
    for (const cb of this.listeners) cb(this.getStats());
  }
  setCurrentBook(book) {
    this.currentBook = book;
    this.notify();
  }
  async start(intervalSeconds = 30) {
    if (this.timer) clearInterval(this.timer);
    this.state = "running";
    this.timer = setInterval(() => this.tick(), intervalSeconds * 1000);
    this.notify();
    console.log("[ReadFlow] 心跳已启动，间隔", intervalSeconds, "秒");
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state = "idle";
    this.currentBook = null;
    this.notify();
    console.log("[ReadFlow] 心跳已停止");
  }
  async tick() {
    if (!this.currentBook) return;
    const cookie = this.plugin.settings.wereadCookie;
    if (!cookie) return;
    const result = await sendHeartbeat(cookie, this.currentBook);
    if (result.ok) {
      this.stats.totalSent++;
      this.stats.consecutiveFailures = 0;
      this.stats.lastSent = Date.now();
    } else {
      this.stats.consecutiveFailures++;
      if (result.error === "AUTH_FAILED") {
        this.stop();
        new import_obsidian.Notice("心跳认证失败，请检查 Cookie");
      }
    }
    this.notify();
  }
}

async function sendHeartbeat(cookie, payload) {
  // 使用与 weread.ts 一致的 API 端点
  const url = `${BASE}/book/updateReadingProgress`;
  try {
    const resp = await requestUrl({
      url,
      method: "POST",
      headers: buildJsonPostHeaders(cookie),
      body: JSON.stringify({
        bookId: payload.bookId,
        chapterUid: payload.chapterUid || 0,
        readProgress: Math.max(0, Math.min(100, payload.readProgress || 0)),
      }),
    });
    if (resp.status >= 200 && resp.status < 300) return { ok: true };
    if (resp.status === 401 || resp.status === 403) return { ok: false, error: "AUTH_FAILED" };
    return { ok: false, error: `HTTP ${resp.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

class AutoSyncManager {
  constructor(plugin) {
    this.plugin = plugin;
    this.timer = null;
    this.running = false;
  }
  start() {
    this.stop();
    if (!this.plugin.settings.autoSyncEnabled) return;
    const mins = Math.max(15, Number(this.plugin.settings.autoSyncIntervalMinutes) || 60);
    this.timer = setInterval(() => void this.tick(), mins * 60 * 1e3);
    console.log("[ReadFlow] 定时同步已启动，间隔", mins, "分钟");
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  async tick() {
    if (this.running) return;
    const cookie = (this.plugin.settings.wereadCookie || "").trim();
    if (!cookie || !this.plugin.settings.autoSyncEnabled) return;
    this.running = true;
    try {
      const ok = await verifyWereadCookieSilent(cookie);
      if (!ok) {
        new import_obsidian.Notice(
          "\u5FAE\u4FE1\u8BFB\u4E66 Cookie \u5DF2\u5931\u6548\uFF0C\u5B9A\u65F6\u540C\u6B65\u5DF2\u505C\u6B62\u3002\u8BF7\u91CD\u65B0\u767B\u5F55\u6216\u7C98\u8D34 Cookie\u3002",
          1e4,
        );
        this.plugin.settings.autoSyncEnabled = false;
        await this.plugin.persistDisk();
        this.stop();
        return;
      }
      await this.plugin.syncWereadAll(false);
    } catch (e) {
      console.warn("[ReadFlow] autoSync tick", e);
    } finally {
      this.running = false;
    }
  }
}

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
    o.items,
    o.list,
    isJsonObject(o.data) ? o.data.updated : void 0,
    isJsonObject(o.data) ? o.data.bookmarks : void 0,
    isJsonObject(o.bookmark) ? o.bookmark.updated : void 0,
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
    const resp = await (0, import_obsidian2.requestUrl)({
      url: primaryUrl,
      method: "GET",
      headers: buildWebGetHeaders(cookieRef.value),
    });
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
    const resp2 = await (0, import_obsidian2.requestUrl)({
      url: fallbackUrl,
      method: "GET",
      headers: buildWebGetHeaders(cookieRef.value),
    });
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
async function fetchJsonPreferNonEmptyMulti(cookieRef, urls, label, rowCount) {
  let lastJson = null;
  for (let i = 0; i < urls.length; i++) {
    try {
      const resp = await (0, import_obsidian2.requestUrl)({
        url: urls[i],
        method: "GET",
        headers: buildWebGetHeaders(cookieRef.value),
      });
      applyResponseCookies(cookieRef, resp);
      const json = resp.json;
      if (i === 0) lastJson = json;
      if (rowCount(json) > 0) {
        if (i > 0) console.log(`[ReadFlow] ${label}: \u5907\u7528\u63A5\u53E3 #${i + 1} \u62C9\u53D6\u5230\u6570\u636E`, urls[i]);
        return json;
      }
    } catch (e) {
      console.warn(`[ReadFlow] ${label} url#${i + 1}`, urls[i], e);
    }
  }
  return lastJson;
}
function extractReviewWrappers(json) {
  if (!json || !isJsonObject(json)) return [];
  if (hasBlockingError(json)) return [];
  const revs = json.reviews;
  return Array.isArray(revs) ? revs : [];
}
function buildWebGetHeaders(cookieRaw) {
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  const headers = {
    "User-Agent": ua,
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    accept: "application/json, text/plain, */*",
    Referer: "https://weread.qq.com/",
    Origin: "https://weread.qq.com",
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
  return cookieRaw
    .split(";")
    .map((part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return part.trim();
      const name = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      return `${name}=${encodeURIComponent(decodeURIComponent(value))}`;
    })
    .join(";");
}
function normalizeTs(t) {
  if (!t) return Date.now();
  if (t > 1e12) return t;
  return t * 1e3;
}
function normalizeNotebookRow(raw) {
  var _a, _b, _c, _d, _e, _f;
  const book = raw.book;
  const bookId = String(
    (_b = (_a = book == null ? void 0 : book.bookId) != null ? _a : raw.bookId) != null ? _b : "",
  ).trim();
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
  const t =
    detail.title ||
    ((_a = detail.bookInfo) == null ? void 0 : _a.title) ||
    ((_b = detail.book) == null ? void 0 : _b.title);
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
  const t =
    (_c =
      (_b = (_a = reviews == null ? void 0 : reviews[0]) == null ? void 0 : _a.review) == null ? void 0 : _b.book) ==
    null
      ? void 0
      : _c.title;
  return t && t.trim() ? t.trim() : void 0;
}
async function verifyWereadCookieSilent(cookieRaw) {
  var _a, _b;
  if (!cookieRaw.trim()) return false;
  try {
    const req = {
      url: `${BASE}/api/user/notebook`,
      method: "GET",
      headers: buildWebGetHeaders(cookieRaw),
    };
    const resp = await (0, import_obsidian2.requestUrl)(req);
    if (((_a = resp.json) == null ? void 0 : _a.errcode) === -2012) return false;
    return Array.isArray((_b = resp.json) == null ? void 0 : _b.books);
  } catch (e) {
    return false;
  }
}
async function fetchNotebookBooksRaw(cookieRef) {
  var _a, _b;
  const req = {
    url: `${BASE}/api/user/notebook`,
    method: "GET",
    headers: buildWebGetHeaders(cookieRef.value),
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
  return books;
}
async function fetchNotebookBooks(cookieRef) {
  const books = await fetchNotebookBooksRaw(cookieRef);
  return books.map((b) => normalizeNotebookRow(b)).filter((r) => r != null);
}
async function refreshWereadSessionOnSite(cookieRef) {
  try {
    const resp = await (0, import_obsidian2.requestUrl)({
      url: `${BASE}/`,
      method: "GET",
      throw: false,
      headers: buildWebGetHeaders(cookieRef.value),
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
      headers: buildWebGetHeaders(cookieRef.value),
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
  const urls = [
    `${BASE}/web/book/bookmarklist?bookId=${bid}`,
    `${IWEREAD_BASE}/book/bookmarklist?bookId=${bid}`,
    `${BASE}/web/book/bookmarklist?bookId=${bid}&synckey=0`,
    `${IWEREAD_BASE}/book/bookmarklist?bookId=${bid}&synckey=0`,
  ];
  const json = await fetchJsonPreferNonEmptyMulti(
    cookieRef,
    urls,
    "bookmarklist",
    (j) => extractBookmarkRows(j).length,
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
    updatedLen: Array.isArray(o.updated) ? o.updated.length : null,
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
    body: JSON.stringify({ bookIds: [bookId], synckeys: [0], teenmode: 0 }),
  };
  const resp = await (0, import_obsidian2.requestUrl)(req);
  applyResponseCookies(cookieRef, resp);
  return resp.json;
}
var PUSH_NOTE_REASON_MESSAGES = {
  missing_fields: "缺少书籍 ID 或想法正文",
  weread_reviewId_missing: "该摘录来自微信读书但缺少 reviewId。请先执行「同步微信读书」，再在面板推送",
  create_api_error: "微信读书拒绝新建想法（create 接口错误）",
  api_error: "微信读书 API 返回错误",
  "未配置微信读书 Cookie": "请先在 ReadFlow 设置中配置 Cookie 或登录",
  缺少想法或定位信息: "请填写想法，并确保摘录带有 wereadRange 或 wereadReviewId（微信读书来源需先同步）",
};
function formatPushNoteError(result) {
  if (!result || result.ok) return "";
  var msg = PUSH_NOTE_REASON_MESSAGES[result.reason] || result.reason || "未知错误";
  if (result.reason === "api_error" || result.reason === "create_api_error") {
    var detail = result.detail;
    if (detail && typeof detail === "object") {
      var code = detail.errCode != null ? detail.errCode : detail.errcode;
      if (code != null) msg += "（errCode " + code + "）";
    }
  }
  if (String(result.reason || "").startsWith("network_")) {
    msg = "网络或请求失败（" + (result.reason || "") + "）";
    if (result.detail && result.detail.status) msg += " HTTP " + result.detail.status;
  }
  return msg;
}
function canPushHighlightToWeread(highlight) {
  if (!highlight || !highlight.bookId || !(highlight.note || "").trim()) return false;
  if (highlight.wereadRange || highlight.wereadReviewId) return true;
  return highlight.sourceType !== "weread";
}
function parseVaultNotePushMeta(cache) {
  var fm = (cache && cache.frontmatter) || {};
  var bookId = String(
    fm["readflow-book-id"] || fm.readflow_book_id || fm.book_id || fm.bookId || "",
  ).trim();
  var chapterUid = parseInt(fm["readflow-chapter-uid"] || fm.readflow_chapter_uid || 0, 10) || 0;
  var wereadRange = String(fm["readflow-weread-range"] || fm.readflow_weread_range || "").trim();
  var wereadReviewId = String(
    fm["readflow-weread-review-id"] ||
      fm.readflow_weread_review_id ||
      fm.weread_review_id ||
      "",
  ).trim();
  return { bookId: bookId, chapterUid: chapterUid, wereadRange: wereadRange, wereadReviewId: wereadReviewId };
}
async function extractVaultNoteBodyForPush(app, file) {
  var editor = app.workspace.activeEditor && app.workspace.activeEditor.editor;
  if (editor) {
    var sel = editor.getSelection();
    if (sel && sel.trim()) return sel.trim();
  }
  var content = await app.vault.read(file);
  var cache = app.metadataCache.getFileCache(file);
  if (cache && cache.frontmatterPosition && cache.frontmatterPosition.end) {
    return content.slice(cache.frontmatterPosition.end.offset).trim();
  }
  return content.replace(/^---[\r\n]+[\s\S]*?---[\r\n]*/, "").trim();
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
      return {
        ok: false,
        reason: "weread_reviewId_missing",
        detail: "该摘录来自微信读书，请先重新同步获取 reviewId后再推送",
        retryable: false,
      };
    }
    // Manual note: try to create a brand-new review via the create endpoint
    try {
      const createBody = {
        bookId,
        chapterUid: highlight.chapterUid || 0,
        type: 1,
        content: highlight.note,
        synckey: 0,
      };
      if (highlight.wereadRange) createBody.range = highlight.wereadRange;
      const createResp = await (0, import_obsidian2.requestUrl)({
        url: `${BASE}/web/review/create`,
        method: "POST",
        headers: buildJsonPostHeaders(cookieRef.value),
        body: JSON.stringify(createBody),
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
      try {
        errInfo3.body = e && typeof e.text === "string" ? e.text.slice(0, 200) : void 0;
      } catch (_) {}
      try {
        errInfo3.json = e && e.json;
      } catch (_) {}
      return { ok: false, reason: "network_" + (status || "unknown"), detail: errInfo3, retryable: false };
    }
  }
  const body = {
    bookId,
    chapterUid: highlight.chapterUid || 0,
    type: 1,
    content: highlight.note,
    synckey: 0,
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
        body: JSON.stringify(body),
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
        try {
          errInfo.body = e && typeof e.text === "string" ? e.text.slice(0, 200) : void 0;
        } catch (_) {}
        try {
          errInfo.json = e && e.json;
        } catch (_) {}
        return { ok: false, reason: "network_" + (status || "unknown"), detail: errInfo, retryable: false };
      }
      console.error("[ReadFlow] pushNoteToWeread failed", e);
      var errInfo2 = { message: e && e.message, status, attempts: attempt + 1 };
      try {
        errInfo2.body = e && typeof e.text === "string" ? e.text.slice(0, 200) : void 0;
      } catch (_) {}
      try {
        errInfo2.json = e && e.json;
      } catch (_) {}
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
      body: JSON.stringify({ reviewId }),
    });
    applyResponseCookies(cookieRef, resp);
    return { ok: !hasBlockingError(resp.json) };
  } catch (e) {
    console.error("[ReadFlow] deleteWereadReview failed", e);
    return { ok: false, reason: "network" };
  }
}
function stripHtml(s) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function parseChapterMap(chapterJson) {
  var _a, _b;
  const map = {};
  const data =
    (_b = (_a = chapterJson == null ? void 0 : chapterJson.data) == null ? void 0 : _a[0]) == null
      ? void 0
      : _b.updated;
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
    const chapterUid =
      typeof rev.chapterUid === "number"
        ? rev.chapterUid
        : typeof rev.chapterUid === "string" && /^\d+$/.test(rev.chapterUid)
          ? parseInt(rev.chapterUid, 10)
          : void 0;
    out.push({
      reviewId,
      type,
      range: rev.range ? String(rev.range) : void 0,
      contextAbstract: rev.contextAbstract ? String(rev.contextAbstract).trim() : void 0,
      content:
        stripHtml(String((_d = (_c = rev.content) != null ? _c : rev.htmlContent) != null ? _d : "")).trim() || void 0,
      abstract: rev.abstract ? String(rev.abstract).trim() : void 0,
      chapter: rev.chapterTitle ? String(rev.chapterTitle) : rev.chapterName ? String(rev.chapterName) : void 0,
      chapterUid,
      createdAt: normalizeTs(Number(rev.createTime) || 0),
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
      (_e =
        (_d =
          (_c = (_b = (_a = u.markText) != null ? _a : u.contextAbstract) != null ? _b : u.abstract) != null
            ? _c
            : u.text) != null
          ? _d
          : u.content) != null
        ? _e
        : "",
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
      chapterUid:
        typeof u.chapterUid === "number"
          ? u.chapterUid
          : typeof u.chapterUid === "string" && /^\d+$/.test(u.chapterUid)
            ? parseInt(u.chapterUid, 10)
            : void 0,
      status: "inbox",
      importance: 3,
      createdAt: (() => {
        const raw = Number((_f = u.createTime) != null ? _f : u.created) || 0;
        return raw > 0 ? normalizeTs(raw) : 0;
      })(),
      sourceType: "weread",
      wereadRange: range || void 0,
      wereadBookmarkId: u.bookmarkId ? String(u.bookmarkId) : void 0,
      contextAbstract: u.contextAbstract ? String(u.contextAbstract) : void 0,
    });
  }
  if (updated.length > 0 && out.length === 0) {
    console.warn(
      "[ReadFlow] bookmarklist \u6709\u6761\u76EE\u4F46\u65E0\u53EF\u7528\u6B63\u6587\uFF08\u68C0\u67E5 markText/contextAbstract \u662F\u5426\u4E3A\u7A7A\uFF09",
      updated.length,
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
    const note = thought && thought !== content ? thought : void 0;
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
      contextAbstract: rev.contextAbstract || void 0,
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
      var mergedNote = prevNoteIsBuggy ? h.note || void 0 : prev.note || h.note;
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
        contextAbstract: prev.contextAbstract || h.contextAbstract,
        createdAt: h.createdAt > 0 ? h.createdAt : prev.createdAt > 0 ? prev.createdAt : 0,
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
  const hasTitle = !!(
    (metaTitle && metaTitle.trim() && metaTitle !== bookId) ||
    ((_a = existing == null ? void 0 : existing.title) == null ? void 0 : _a.trim())
  );
  const hasAuthor = !!(
    (metaAuthor && metaAuthor.trim()) ||
    ((_b = existing == null ? void 0 : existing.author) == null ? void 0 : _b.trim())
  );
  const detail = hasTitle && hasAuthor ? null : await fetchBookDetail(cookieRef, bookId);
  const d = detail;
  const title =
    (metaTitle && metaTitle.trim() && metaTitle !== bookId ? metaTitle.trim() : void 0) ||
    (existing == null ? void 0 : existing.title) ||
    titleFromBookDetail(d) ||
    titleFromBookmarkPayload(bmJson) ||
    titleFromFirstReview(rvJson) ||
    bookId;
  const author =
    metaAuthor ||
    (existing == null ? void 0 : existing.author) ||
    (d == null ? void 0 : d.author) ||
    ((_c = d == null ? void 0 : d.bookInfo) == null ? void 0 : _c.author) ||
    ((_d = d == null ? void 0 : d.book) == null ? void 0 : _d.author) ||
    "";
  const reviewPayloads = extractWereadReviewPayloads(rvJson);
  const reviewsByRange = buildReviewNoteMap(reviewPayloads);
  const bookmarkRanges = new Set(
    extractBookmarkRows(bmJson)
      .map((row) => (row.range ? String(row.range) : ""))
      .filter(Boolean),
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
  const needsChapterMap = merged.some(
    (h) => !h.chapter && h.chapterUid != null && !cachedChapterMap[String(h.chapterUid)],
  );
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
    notebookReviewCount: metaReviewCount,
  };
}
function shouldSyncBook(row, existing, forceFull) {
  var _a, _b, _c, _d;
  if (forceFull) return true;
  if (!existing) return true;
  const hasNotebookSnapshot =
    typeof existing.notebookNoteCount === "number" && typeof existing.notebookReviewCount === "number";
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
  onProgress == null
    ? void 0
    : onProgress({
        phase: "scan",
        scanned: candidates.length,
        total: targets.length,
        synced: 0,
        skipped: Math.max(candidates.length - targets.length, 0),
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
        r.reviewCount,
      );
      out[currentIndex] = cached;
      completed++;
      onProgress == null
        ? void 0
        : onProgress({
            phase: "sync",
            scanned: candidates.length,
            total: targets.length,
            synced: completed,
            skipped,
            title: (_a = r.title) != null ? _a : r.bookId,
          });
    }
  };
  const workers = Array.from({ length: Math.min(MAX_SYNC_CONCURRENCY, targets.length) }, () => worker());
  await Promise.all(workers);
  return {
    books: out.filter((b) => !!b),
    scanned: candidates.length,
    synced: targets.length,
    skipped,
  };
}

// src/importer/wereadMd.ts - Parse Weread plugin MD files
function parseTimestamp(str) {
  if (!str) return Date.now();
  const d = new Date(str.replace(/\//g, "-"));
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function genHlId(bookId, blockId, reviewId) {
  if (reviewId) return `weread-rv-${reviewId.replace(/-/g, "_")}`;
  if (blockId) {
    const p = blockId.split("-");
    if (p.length >= 4) return `weread-bm-${p.slice(1).join("-")}`;
    return `weread-bm-${hashStr(bookId + blockId)}`;
  }
  return `weread-bm-${hashStr(bookId)}`;
}

function parseFrontmatter(lines, bodyStart) {
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

function parseHlTextToReviewId(lines, notesStart) {
  const m = new Map();
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

function parseWereadBlockId(blockId) {
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

function parseWereadMdFile(content, filePath) {
  const lines = content.split("\n");

  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "---") { bodyStart = i + 1; break; }
  }

  const fm = parseFrontmatter(lines, bodyStart);
  let bookId = fm.bookId, isbn = fm.isbn;
  let finishedDate = fm.lastReadDate, author = fm.author;
  let progress = fm.progress, readingTime = fm.readingTime, readingDate = fm.readingDate, cover = fm.cover;
  let title = "";

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

  const highlights = [];
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

    const contentLines = [trimmed.slice(5).trim()];
    for (let k = i + 1; k < Math.min(i + 20, lines.length); k++) {
      const cl = lines[k].trim();
      if (!cl || cl === "# 读书笔记" || cl === "# 本书评论") break;
      if (cl.startsWith("> ⏱") || cl.startsWith("- ") || cl.startsWith("> 📌")) break;
      const cleaned = cl.replace(/^>\s?/, "").trim();
      if (cleaned) contentLines.push(cleaned);
    }

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

// Scan vault for Weread MD files and import
async function importBooksFromVaultMd(app, settings) {
  const baseFolder = settings.booksBasePath || "Books";
  const folder = app.vault.getAbstractFileByPath(baseFolder);
  if (!folder || !(folder instanceof import_obsidian3.TFolder)) {
    return { imported: 0, skipped: 0, errors: 0 };
  }

  const files = app.vault.getMarkdownFiles();
  const mdFiles = files.filter(f => {
    const p = f.path.replace(/\\/g, "/");
    return p.startsWith(baseFolder + "/") && p.match(/\/[\u4e00-\u9fff\w-]+\.md$/);
  });

  let imported = 0, skipped = 0, errors = 0;

  for (const file of mdFiles) {
    try {
      const content = await app.vault.read(file);
      const parsed = parseWereadMdFile(content, file.path);
      if (parsed.highlights.length === 0) { skipped++; continue; }
      imported++;
    } catch (e) {
      errors++;
    }
  }

  return { imported, skipped, errors };
}

// src/processor/linker.ts
var INDEX_TTL_MS = 10 * 60 * 1000; // 10 minutes
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
    this.indexMtimes = /* @__PURE__ */ new Map();
    this._rebuildPromise = null;
  }
  async rebuildIndexAsync() {
    if (this._rebuildPromise) return this._rebuildPromise;
    this._rebuildPromise = this._doRebuild();
    try {
      await this._rebuildPromise;
    } finally {
      this._rebuildPromise = null;
    }
  }
  async _doRebuild() {
    const now = Date.now();
    if (this.index.length > 0 && now - this.lastBuild < INDEX_TTL_MS) {
      return;
    }
    const settings = this.getSettings();
    const ignoreLines = settings.linkerIgnorePrefixes
      .split("\n")
      .map((s) => s.trim().replace(/^\/+|\/+$/g, ""))
      .filter(Boolean);
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
    const existingMap = new Map(this.index.map((r) => [r.path, r]));
    const next = [];
    for (const f of picked.slice(0, maxFiles)) {
      const mtime = f.stat.mtime;
      const cached = existingMap.get(f.path);
      if (cached && cached._mtime === mtime) {
        next.push(cached);
        continue;
      }
      const cache = this.app.metadataCache.getCache(f.path);
      let head = f.basename;
      if (cache == null ? void 0 : cache.frontmatter) {
        try {
          head += " " + JSON.stringify(cache.frontmatter);
        } catch (e) {}
      }
      let body = "";
      try {
        body = await this.app.vault.read(f);
      } catch (e) {
        continue;
      }
      const tokens = tokenize(head + " " + body.slice(0, 4e3));
      const entry = { path: f.path, tokens, _mtime: mtime };
      this.indexMtimes.set(f.path, mtime);
      next.push(entry);
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
function parseWereadRangeStart(h) {
  if (h.wereadRange) {
    var parts = String(h.wereadRange).split("-");
    var n = parseInt(parts[0], 10);
    if (!isNaN(n)) return n;
  }
  if (h.id) {
    var m = String(h.id).match(/-(\d+)-(\d+)$/);
    if (m) return parseInt(m[1], 10);
  }
  if (h.content) {
    var cm = String(h.content).match(/\^[\w-]+-\d+-(\d+)-\d+\s*$/);
    if (cm) return parseInt(cm[1], 10);
  }
  return 0;
}
function compareHighlightTime(a, b, dir) {
  var mult = dir === "asc" ? 1 : -1;
  var ta = a.createdAt || 0;
  var tb = b.createdAt || 0;
  if (ta !== tb) return mult * (ta - tb);
  var ra = parseWereadRangeStart(a);
  var rb = parseWereadRangeStart(b);
  if (ra !== rb) return mult * (ra - rb);
  var ca = a.chapterUid || 0;
  var cb = b.chapterUid || 0;
  if (ca !== cb) return mult * (ca - cb);
  var cha = (a.chapter || "").localeCompare(b.chapter || "", "zh-CN");
  if (cha !== 0) return mult * cha;
  return a.id.localeCompare(b.id);
}
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
      highlights: [...hls].sort((a, b) => compareHighlightTime(a, b, "asc")),
    };
  });
}

// src/processor/knowledge.ts
function shortLabel(text, limit = 18) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > limit ? `${oneLine.slice(0, limit)}...` : oneLine;
}
function mermaidEscape(text) {
  return text
    .replace(/\n/g, " ")
    .replace(/[()[\]{}`]/g, "")
    .replace(/"/g, "'")
    .trim();
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
  return [...topicMap.entries()]
    .map(([topic, items]) => {
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
        items,
      };
    })
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
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
        explicit: true,
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
      edgeMap.set(edgeKey({ sourceId: question.id, targetId: target.id, hint: "\u56E0\u679C", explicit: false }), {
        sourceId: question.id,
        targetId: target.id,
        hint: "\u56E0\u679C",
        explicit: false,
      });
    }
    for (const idea of ideas) {
      const example = pickBestMatch(idea, examples);
      if (!example) continue;
      edgeMap.set(edgeKey({ sourceId: idea.id, targetId: example.id, hint: "\u8865\u5145", explicit: false }), {
        sourceId: idea.id,
        targetId: example.id,
        hint: "\u8865\u5145",
        explicit: false,
      });
    }
    for (const method of methods) {
      const conclusion = pickBestMatch(method, conclusions);
      if (!conclusion) continue;
      edgeMap.set(edgeKey({ sourceId: method.id, targetId: conclusion.id, hint: "\u56E0\u679C", explicit: false }), {
        sourceId: method.id,
        targetId: conclusion.id,
        hint: "\u56E0\u679C",
        explicit: false,
      });
    }
    const ordered = [...group].sort((a, b) => a.createdAt - b.createdAt);
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const cur = ordered[i];
      if (similarity(prev.content, cur.content) >= 0.42) {
        edgeMap.set(edgeKey({ sourceId: prev.id, targetId: cur.id, hint: "\u91CD\u590D", explicit: false }), {
          sourceId: prev.id,
          targetId: cur.id,
          hint: "\u91CD\u590D",
          explicit: false,
        });
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
      for (const row of summary.items
        .filter((item) => (item.highlightType || "\u672A\u5206\u7C7B") === type)
        .slice(0, 4)) {
        lines.push(`        ${mermaidEscape(shortLabel(row.content, 26))}`);
      }
    }
  }
  lines.push("```");
  return lines.join("\n");
}
function parseContextAbstract(h) {
  var _a;
  if (!h.contextAbstract) return null;
  var raw = h.contextAbstract;
  var excerpt = h.content || "";
  var idx = -1;
  if (excerpt) {
    idx = raw.indexOf(excerpt);
    if (idx === -1) idx = raw.indexOf(excerpt.slice(0, 20));
    if (idx === -1) idx = raw.indexOf(excerpt.slice(0, 10));
  }
  var before = "",
    main = "",
    after = "";
  if (idx !== -1) {
    before = raw.slice(0, idx).trim();
    main = excerpt;
    after = raw.slice(idx + excerpt.length).trim();
  } else {
    main = raw.slice(0, 120);
    before = "";
    after = raw.slice(120);
  }
  if (before.length > 300) before = "…" + before.slice(-280);
  if (after.length > 300) after = after.slice(0, 280) + "…";
  return {
    before: before || null,
    main: main || raw.slice(0, 100),
    after: after || null,
    chapter: h.chapter || null,
    wereadRange: h.wereadRange || null,
  };
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
      `${sourceNode}["${mermaidEscape(shortLabel(source.content))}"] -->|${edge.hint}${edge.explicit ? "" : "\xB7\u63A8\u65AD"}| ${targetNode}["${mermaidEscape(shortLabel(target.content))}"]`,
    );
  }
  lines.push("```");
  return lines.join("\n");
}
function buildCoreInsights(book) {
  const sorted = [...book.highlights].sort((a, b) => b.importance - a.importance || b.createdAt - a.createdAt);
  const pick = (type, limit) => sorted.filter((h) => h.highlightType === type).slice(0, limit);
  const render = (title, rows) => {
    if (rows.length === 0)
      return `### ${title}

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
    render("\u5F85\u89E3\u95EE\u9898", pick("question", 4)),
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

// src/processor/mindmap.ts
function buildBookMindMapTree(scopeBook) {
  var _a;
  var topics = summarizeTopics(scopeBook);
  var root = {
    id: "__mm_root",
    label: shortLabel(scopeBook.title, 20),
    full: scopeBook.title,
    ntype: "root",
    htype: null,
    exp: true,
    ch: [],
    _x: 0,
    _y: 0,
  };
  for (var ti = 0; ti < Math.min(topics.length, 15); ti++) {
    var s = topics[ti];
    var tn = {
      id: "__mm_t" + ti,
      label: shortLabel(s.topic, 14),
      full: s.topic + " (" + s.count + "\u6761)",
      ntype: "topic",
      htype: null,
      exp: ti < 4,
      ch: [],
      _x: 0,
      _y: 0,
    };
    var byType = {};
    for (var i = 0; i < s.items.length; i++) {
      var item = s.items[i];
      var tp = item.highlightType || "\u672A\u5206\u7C7B";
      if (!byType[tp]) byType[tp] = [];
      byType[tp].push(item);
    }
    var ents = Object.entries(byType).sort(function (a, b) {
      return b[1].length - a[1].length;
    });
    for (var ei = 0; ei < ents.length; ei++) {
      var typeKey = ents[ei][0];
      var items = ents[ei][1];
      var tl = (_a = HIGHLIGHT_TYPE_LABELS[typeKey]) != null ? _a : typeKey;
      var gn = {
        id: "__mm_g" + ti + "_" + ei,
        label: tl + " " + items.length,
        full: tl + " " + items.length + "\u6761",
        ntype: "type",
        htype: typeKey === "\u672A\u5206\u7C7B" ? null : typeKey,
        exp: false,
        ch: [],
        _x: 0,
        _y: 0,
      };
      for (var hi = 0; hi < Math.min(items.length, 8); hi++) {
        var h = items[hi];
        gn.ch.push({
          id: "__mm_h" + ti + "_" + ei + "_" + hi,
          label: shortLabel(h.content, 18),
          full: h.content + (h.note ? "\n\u2500\u2500\n\u60F3\u6CD5: " + h.note : ""),
          ntype: "leaf",
          htype: h.highlightType,
          imp: h.importance || 3,
          exp: false,
          ch: [],
          _x: 0,
          _y: 0,
          srcId: h.id,
        });
      }
      if (gn.ch.length > 0) tn.ch.push(gn);
    }
    root.ch.push(tn);
  }
  var uncat = scopeBook.highlights.filter(function (h2) {
    return !(h2.topic || "").trim();
  });
  if (uncat.length > 0 && uncat.length <= 60) {
    var un = {
      id: "__mm_uncat",
      label: "\u672A\u5F52\u7C7B " + uncat.length,
      full: "\u672A\u5F52\u7C7B (" + uncat.length + "\u6761)",
      ntype: "topic",
      htype: null,
      exp: false,
      ch: [],
      _x: 0,
      _y: 0,
    };
    for (var ui = 0; ui < Math.min(uncat.length, 12); ui++) {
      var uh = uncat[ui];
      un.ch.push({
        id: "__mm_uc" + ui,
        label: shortLabel(uh.content, 18),
        full: uh.content,
        ntype: "leaf",
        htype: uh.highlightType,
        imp: uh.importance || 3,
        exp: false,
        ch: [],
        _x: 0,
        _y: 0,
        srcId: uh.id,
      });
    }
    root.ch.push(un);
  }
  return root;
}
function buildMindMapTree(scopeBook) {
  return buildBookMindMapTree(scopeBook);
}
function sortDirArrow(dir) {
  return dir === "asc" ? "\u2193" : "\u2191";
}
var MINDMAP_MODE_META = {
  structure: {
    label: "\u5168\u4E66\u7ED3\u6784",
    desc: "\u6309\u4E3B\u9898\u4E0E\u7C7B\u578B\u6D4F\u89C8\u5168\u4E66\u6458\u5F55",
    base: "book",
    view: "tree",
    lens: "all",
  },
  topic: {
    label: "\u4E3B\u9898\u805A\u7891",
    desc: "\u805A\u7126\u5355\u4E2A\u4E3B\u9898\u4E0B\u7684\u6458\u5F55",
    base: "topic",
    view: "tree",
    lens: "all",
  },
  people: {
    label: "\u4EBA\u7269\u5173\u7CFB",
    desc: "\u4EBA\u540D\u5B9E\u4F53\u3001\u5171\u73B0\u4E0E\u624B\u52A8\u5173\u7CFB",
    base: "entity",
    view: "graph",
    lens: "people",
  },
  ideas: {
    label: "\u89C2\u70B9\u68B3\u7406",
    desc: "\u5DF2\u5206\u7C7B\u89C2\u70B9 + \u5F85\u5206\u7C7B\u6458\u5F55",
    base: "book",
    view: "tree",
    lens: "ideas",
  },
  narrative: {
    label: "\u5E8F\u4E8B\u8109\u7EDC",
    desc: "\u6309\u7AE0\u8282\u68B3\u7406\u4EBA\u7269\u51FA\u573A\u4E0E\u60C5\u8282\u6458\u5F55",
    base: "book",
    view: "timeline",
    lens: "narrative",
  },
};
var WORKBENCH_META = {
  ideas: {
    label: "\u89C2\u70B9\u68B3\u7406",
    desc: "\u4E3B\u9898\u3001\u7C7B\u578B\u4E0E\u89C2\u70B9\u7C7B\u6458\u5F55",
    modes: ["ideas", "structure", "topic"],
    defaultMode: "ideas",
  },
  people: {
    label: "\u4EBA\u7269\u5173\u7CFB",
    desc: "\u4EBA\u540D\u5B9E\u4F53\u3001\u5171\u73B0\u4E0E\u624B\u52A8\u5173\u7CFB",
    modes: ["people"],
    defaultMode: "people",
  },
  narrative: {
    label: "\u5E8F\u4E8B\u8109\u7EDC",
    desc: "\u6309\u7AE0\u8282\u68B3\u7406\u4EBA\u7269\u51FA\u573A\u4E0E\u60C5\u8282",
    modes: ["narrative"],
    defaultMode: "narrative",
  },
};
function workbenchForMode(mode) {
  for (var wbId of Object.keys(WORKBENCH_META)) {
    if (WORKBENCH_META[wbId].modes.indexOf(mode) >= 0) return wbId;
  }
  return "ideas";
}
function applyWorkbench(view, workbenchId) {
  var wb = WORKBENCH_META[workbenchId] || WORKBENCH_META.ideas;
  view.mindmapWorkbench = workbenchId;
  var mode = wb.defaultMode;
  if (view.mindmapMode && wb.modes.indexOf(view.mindmapMode) >= 0) mode = view.mindmapMode;
  applyMindMapMode(view, mode);
}
function isIdeasWorkbenchMode(mode) {
  return workbenchForMode(mode || "ideas") === "ideas";
}
function applyMindMapMode(view, mode, opts) {
  opts = opts || {};
  var meta = MINDMAP_MODE_META[mode] || MINDMAP_MODE_META.structure;
  view.mindmapMode = mode;
  view.mindmapBase = meta.base;
  view.mindmapLens = meta.lens;
  view.mindmapWorkbench = workbenchForMode(mode);
  if (mode === "narrative") {
    view.mindmapView = "timeline";
  } else if (!opts.preserveView) {
    view.mindmapView = meta.view;
  }
}
function initMindMapModeFromStorage(view) {
  var savedView = localStorage.getItem("readflow.mmView");
  var savedWb = localStorage.getItem("readflow.mmWorkbench");
  view.mindmapWorkbench = savedWb || "ideas";
  var saved = localStorage.getItem("readflow.mmMode");
  if (saved && MINDMAP_MODE_META[saved]) {
    applyMindMapMode(view, saved, { preserveView: !!savedView });
    view.mindmapWorkbench = workbenchForMode(saved);
  } else {
    var mode = "structure";
    var lens = localStorage.getItem("readflow.mmLens") || "all";
    var base = localStorage.getItem("readflow.mmBase") || "book";
    if (lens === "people") mode = "people";
    else if (lens === "ideas") mode = "ideas";
    else if (lens === "narrative") mode = "narrative";
    else if (base === "topic") mode = "topic";
    else if (base === "entity") mode = "people";
    applyMindMapMode(view, mode, { preserveView: !!savedView });
    view.mindmapWorkbench = workbenchForMode(mode);
  }
  if (savedWb && WORKBENCH_META[savedWb]) {
    var wb = WORKBENCH_META[savedWb];
    if (wb.modes.indexOf(view.mindmapMode) >= 0) {
      view.mindmapWorkbench = savedWb;
    } else {
      applyWorkbench(view, savedWb);
    }
  }
  if (savedView && view.mindmapMode !== "narrative") {
    if (savedView === "graph" || savedView === "tree" || savedView === "timeline") {
      view.mindmapView = savedView;
    }
  }
  view.mindmapTopic = localStorage.getItem("readflow.mmTopic") || "";
  view.mindmapEntity = localStorage.getItem("readflow.mmEntity") || "";
}
var MINDMAP_IDEA_TYPES = { idea: 1, method: 1, example: 1, conclusion: 1, question: 1 };
function parseEntityTag(raw) {
  var s = String(raw || "").trim();
  if (!s) return { role: null, name: "", raw: "" };
  var idx = s.search(/[:：]/);
  if (idx > 0) {
    return { role: s.slice(0, idx).trim(), name: s.slice(idx + 1).trim(), raw: s };
  }
  return { role: null, name: s, raw: s };
}
function entityDisplayLabel(raw) {
  var parsed = parseEntityTag(raw);
  return parsed.name || parsed.raw || String(raw || "").trim();
}
function resolveEntityDisplayName(ent, items) {
  var tagLabel = entityDisplayLabel(ent);
  if (!items || !items.length) return tagLabel;
  var freq = /* @__PURE__ */ new Map();
  for (var i = 0; i < items.length; i++) {
    var c = (items[i].content || "").trim().replace(/\s+/g, " ");
    if (!c || c.length > 28) continue;
    freq.set(c, (freq.get(c) || 0) + 1);
  }
  if (freq.size === 0) return tagLabel;
  var best = null;
  var bestCount = -1;
  var bestLen = Infinity;
  freq.forEach(function (count, text) {
    if (count > bestCount || (count === bestCount && text.length < bestLen)) {
      bestCount = count;
      bestLen = text.length;
      best = text;
    }
  });
  return best || tagLabel;
}
function entityCanonicalKey(raw) {
  return entityDisplayLabel(raw).toLowerCase();
}
function entityEntId(name) {
  return "ent:" + entityDisplayLabel(name);
}
function collectPersonEntries(scopeBook) {
  var seen = /* @__PURE__ */ new Set();
  var entries = [];
  for (var s of collectEntityStats(scopeBook)) {
    var name = s.displayName || entityDisplayLabel(s.label);
    if (!name) continue;
    var ck = entityCanonicalKey(name);
    if (seen.has(ck)) continue;
    seen.add(ck);
    entries.push({ value: name, text: name, tag: s.label });
  }
  return entries.sort(function (a, b) {
    return a.text.localeCompare(b.text, "zh-CN");
  });
}
function buildEntityAliasMap(book) {
  var map = /* @__PURE__ */ new Map();
  var raw = (book && book.entityAliases) || {};
  for (var canon of Object.keys(raw)) {
    var canonKey = entityCanonicalKey(canon);
    map.set(canonKey, canonKey);
    var aliases = raw[canon];
    if (typeof aliases === "string") aliases = [aliases];
    if (!Array.isArray(aliases)) continue;
    for (var ai = 0; ai < aliases.length; ai++) {
      map.set(entityCanonicalKey(aliases[ai]), canonKey);
    }
  }
  return map;
}
function resolveEntityCanonKey(name, aliasMap) {
  var ck = entityCanonicalKey(name);
  if (aliasMap && aliasMap.has(ck)) return aliasMap.get(ck);
  return ck;
}
function entityEntIdForGraph(name, aliasMap, lookup) {
  var canonKey = resolveEntityCanonKey(name, aliasMap);
  var label = (lookup && lookup.get(canonKey)) || entityDisplayLabel(name);
  return "ent:" + label;
}
function highlightByIdMap(book) {
  var map = /* @__PURE__ */ new Map();
  for (var i = 0; i < (book.highlights || []).length; i++) {
    map.set(book.highlights[i].id, book.highlights[i]);
  }
  return map;
}
function relationAnchorMeta(book, sinceHighlightId) {
  if (!sinceHighlightId) return null;
  var hl = highlightByIdMap(book).get(sinceHighlightId);
  if (!hl) return null;
  return {
    highlightId: sinceHighlightId,
    chapterUid: hl.chapterUid || 0,
    chapter: chapterLabel(hl),
    excerpt: shortLabel(hl.content, 28),
  };
}
function newPlotEventId() {
  return "plot_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}
function inferEntityCooccurrenceSuggestions(scopeBook) {
  var existing = /* @__PURE__ */ new Set();
  for (var er of scopeBook.entityRelations || []) {
    if (!er) continue;
    var a = entityCanonicalKey(er.source);
    var b = entityCanonicalKey(er.target);
    existing.add(a + "|" + b);
    existing.add(b + "|" + a);
  }
  var pairMap = /* @__PURE__ */ new Map();
  for (var i = 0; i < scopeBook.highlights.length; i++) {
    var h = scopeBook.highlights[i];
    var ents = (h.entities || [])
      .map(function (e) {
        return entityDisplayLabel(e);
      })
      .filter(Boolean);
    for (var a2 = 0; a2 < ents.length; a2++) {
      for (var b2 = a2 + 1; b2 < ents.length; b2++) {
        var ak = entityCanonicalKey(ents[a2]);
        var bk = entityCanonicalKey(ents[b2]);
        if (ak === bk) continue;
        var key = ak < bk ? ak + "|" + bk : bk + "|" + ak;
        if (!pairMap.has(key)) {
          pairMap.set(key, {
            source: ents[a2],
            target: ents[b2],
            count: 0,
            highlights: [],
            sinceHighlightId: h.id,
            chapterUid: h.chapterUid || 0,
          });
        }
        var row = pairMap.get(key);
        row.count++;
        row.highlights.push(h);
        if (!row.sinceHighlightId) row.sinceHighlightId = h.id;
      }
    }
  }
  return [...pairMap.values()]
    .filter(function (p) {
      var ak3 = entityCanonicalKey(p.source);
      var bk3 = entityCanonicalKey(p.target);
      return !existing.has(ak3 + "|" + bk3) && !existing.has(bk3 + "|" + ak3);
    })
    .sort(function (x, y) {
      return y.count - x.count || x.source.localeCompare(y.source, "zh-CN");
    })
    .slice(0, 12);
}
function inferBookWorkbenchProfile(book) {
  var highlights = (book && book.highlights) || [];
  var total = highlights.length;
  if (total === 0) {
    return { workbench: "ideas", confidence: 0, label: WORKBENCH_META.ideas.label, reason: "\u6682\u65E0\u6458\u5F55" };
  }
  var withEntities = 0;
  var withIdeas = 0;
  var chapterSet = /* @__PURE__ */ new Set();
  for (var i = 0; i < highlights.length; i++) {
    var h = highlights[i];
    if ((h.entities || []).length > 0) withEntities++;
    if (h.highlightType && MINDMAP_IDEA_TYPES[h.highlightType]) withIdeas++;
    chapterSet.add(chapterSortKey(h));
  }
  var entityRatio = withEntities / total;
  var ideaRatio = withIdeas / total;
  var chapterCount = chapterSet.size;
  if (entityRatio >= 0.3 && entityRatio >= ideaRatio * 1.2) {
    if (chapterCount >= 3 && entityRatio >= 0.2) {
      return {
        workbench: "narrative",
        confidence: Math.min(1, entityRatio + (chapterCount / total) * 0.2),
        label: WORKBENCH_META.narrative.label,
        reason: withEntities + " \u6761\u542B\u4EBA\u7269\u6807\u7B7E\uFF0C" + chapterCount + " \u4E2A\u7AE0\u8282 \u2014 \u9002\u5408\u5E8F\u4E8B\u8109\u7EDC",
      };
    }
    return {
      workbench: "people",
      confidence: entityRatio,
      label: WORKBENCH_META.people.label,
      reason: withEntities + " \u6761\u542B\u4EBA\u7269\u6807\u7B7E \u2014 \u9002\u5408\u4EBA\u7269\u5173\u7CFB",
    };
  }
  return {
    workbench: "ideas",
    confidence: Math.max(0.35, ideaRatio || 0.5),
    label: WORKBENCH_META.ideas.label,
    reason: withIdeas + " \u6761\u5DF2\u5206\u7C7B\u89C2\u70B9 \u2014 \u9002\u5408\u89C2\u70B9\u68B3\u7406",
  };
}
function maybeApplyBookWorkbenchProfile(view, book) {
  if (!book || !book.bookId) return null;
  var key = "readflow.wbForBook." + book.bookId;
  if (localStorage.getItem(key)) return null;
  var profile = inferBookWorkbenchProfile(book);
  if (profile.confidence < 0.35) return null;
  var current = view.mindmapWorkbench || workbenchForMode(view.mindmapMode);
  var switched = false;
  if (current !== profile.workbench) {
    applyWorkbench(view, profile.workbench);
    if (typeof view.persistMindMapPrefs === "function") view.persistMindMapPrefs();
    switched = true;
  }
  localStorage.setItem(key, profile.workbench);
  return switched ? profile : null;
}
function applyMindMapLens(highlights, lens) {
  if (!lens || lens === "all") return highlights;
  if (lens === "people") {
    return highlights.filter(function (h) {
      return ((h.entities || []).length) > 0;
    });
  }
  if (lens === "ideas") {
    return highlights.filter(function (h) {
      if (!h.highlightType) return true;
      return !!MINDMAP_IDEA_TYPES[h.highlightType];
    });
  }
  if (lens === "narrative") {
    return highlights.slice();
  }
  return highlights;
}
function chapterSortKey(h) {
  if (h.chapterUid != null && h.chapterUid > 0) return h.chapterUid;
  return 999999;
}
function chapterLabel(h) {
  return (h.chapter || "").trim() || "(\u672A\u5206\u7AE0)";
}
function relationEdgeHint(er, book) {
  var hint = (er && er.hint) || "\u5173\u7CFB";
  var anchor = relationAnchorMeta(book, er && er.sinceHighlightId);
  if (anchor && anchor.chapter && anchor.chapter !== "(\u672A\u5206\u7AE0)") {
    return hint + "\u00B7" + shortLabel(anchor.chapter, 8);
  }
  return hint;
}
function buildNarrativeTimelineModel(scopeBook, book) {
  var lookup = buildEntityLabelLookup(scopeBook);
  var chapterOrder = [];
  var chapterKeys = /* @__PURE__ */ new Set();
  for (var i = 0; i < scopeBook.highlights.length; i++) {
    var h0 = scopeBook.highlights[i];
    var ck = chapterLabel(h0) + "|" + chapterSortKey(h0);
    if (!chapterKeys.has(ck)) {
      chapterKeys.add(ck);
      chapterOrder.push({
        key: ck,
        label: chapterLabel(h0),
        sortKey: chapterSortKey(h0),
        highlights: [],
      });
    }
  }
  chapterOrder.sort(function (a, b) {
    return a.sortKey - b.sortKey || a.label.localeCompare(b.label, "zh-CN");
  });
  var chapterMap = /* @__PURE__ */ new Map();
  for (var ci = 0; ci < chapterOrder.length; ci++) {
    chapterOrder[ci].index = ci;
    chapterMap.set(chapterOrder[ci].key, chapterOrder[ci]);
  }
  for (var hi = 0; hi < scopeBook.highlights.length; hi++) {
    var h = scopeBook.highlights[hi];
    var cKey = chapterLabel(h) + "|" + chapterSortKey(h);
    var col = chapterMap.get(cKey);
    if (col) col.highlights.push(h);
  }
  var people = collectEntityStats(scopeBook);
  var rows = [];
  for (var pi = 0; pi < people.length; pi++) {
    var st = people[pi];
    var cells = chapterOrder.map(function () {
      return [];
    });
    for (var ii = 0; ii < st.items.length; ii++) {
      var item = st.items[ii];
      var iKey = chapterLabel(item) + "|" + chapterSortKey(item);
      var ch = chapterMap.get(iKey);
      if (ch) cells[ch.index].push(item);
    }
    rows.push({
      label: st.displayName || entityDisplayLabel(st.label),
      canonical: entityCanonicalKey(st.label),
      cells: cells,
    });
  }
  var untaggedCells = chapterOrder.map(function () {
    return [];
  });
  for (var ui = 0; ui < scopeBook.highlights.length; ui++) {
    var uh = scopeBook.highlights[ui];
    if ((uh.entities || []).some(function (e) {
      return String(e || "").trim();
    })) continue;
    var uKey = chapterLabel(uh) + "|" + chapterSortKey(uh);
    var uch = chapterMap.get(uKey);
    if (uch) untaggedCells[uch.index].push(uh);
  }
  if (untaggedCells.some(function (c) {
    return c.length > 0;
  })) {
    rows.push({ label: "\u672A\u6807\u6CE8\u6458\u5F55", canonical: "__untagged__", cells: untaggedCells, muted: true });
  }
  var plotEvents = (book && book.plotEvents) || [];
  if (plotEvents.length > 0) {
    var hlMap = highlightByIdMap(scopeBook);
    var plotCells = chapterOrder.map(function () {
      return [];
    });
    for (var pei = 0; pei < plotEvents.length; pei++) {
      var pe = plotEvents[pei];
      if (!pe || !pe.atHighlightId) continue;
      var phl = hlMap.get(pe.atHighlightId);
      if (!phl) continue;
      var pKey = chapterLabel(phl) + "|" + chapterSortKey(phl);
      var pCol = chapterMap.get(pKey);
      if (pCol) plotCells[pCol.index].push({ highlight: phl, plot: pe });
    }
    if (plotCells.some(function (c) {
      return c.length > 0;
    })) {
      rows.push({ label: "\u60C5\u8282\u7EBF", canonical: "__plot__", cells: plotCells, plot: true });
    }
  }
  return { chapters: chapterOrder, rows: rows, lookup: lookup };
}
function renderNarrativeTimeline(container, book, scopeBook, opts) {
  var model = buildNarrativeTimelineModel(scopeBook, book);
  if (model.chapters.length === 0) {
    container.createEl("p", {
      text: "\u6682\u65E0\u7AE0\u8282\u6570\u636E\u3002\u540C\u6B65\u6216\u624B\u52A8\u6458\u5F55\u540E\u518D\u8BD5\u3002",
      cls: "readflow-muted",
    });
    return null;
  }
  var expanded = opts && opts.expanded;
  var wrap = container.createDiv("readflow-narrative-wrap");
  if (expanded) wrap.addClass("readflow-narrative-wrap--expanded");
  var scroll = wrap.createDiv("readflow-narrative-scroll");
  var grid = scroll.createDiv("readflow-narrative-grid");
  grid.style.setProperty("--rf-narrative-cols", String(model.chapters.length));
  var corner = grid.createDiv("readflow-narrative-corner");
  corner.setText("\u4EBA\u7269 / \u7AE0\u8282");
  for (var ci2 = 0; ci2 < model.chapters.length; ci2++) {
    var chHead = grid.createDiv("readflow-narrative-col-head");
    chHead.createEl("span", { text: shortLabel(model.chapters[ci2].label, 10), cls: "readflow-narrative-col-title" });
    chHead.createEl("span", {
      text: String(model.chapters[ci2].highlights.length),
      cls: "readflow-narrative-col-count",
    });
  }
  if (model.rows.length === 0) {
    wrap.createEl("p", {
      text: "\u6682\u65E0\u4EBA\u7269\u6807\u7B7E\u3002\u5728\u6458\u5F55\u4E2D\u6DFB\u52A0\u5B9E\u4F53\u6807\u7B7E\u540E\u53EF\u5728\u6B64\u67E5\u770B\u51FA\u573A\u65F6\u95F4\u7EBF\u3002",
      cls: "readflow-muted",
    });
    return null;
  }
  for (var ri = 0; ri < model.rows.length; ri++) {
    var row = model.rows[ri];
    var rowHead = grid.createDiv("readflow-narrative-row-head");
    if (row.muted) rowHead.addClass("readflow-narrative-row-head--muted");
    if (row.plot) rowHead.addClass("readflow-narrative-row-head--plot");
    rowHead.setText(shortLabel(row.label, 12));
    for (var cj = 0; cj < row.cells.length; cj++) {
      var cell = grid.createDiv("readflow-narrative-cell");
      var items = row.cells[cj];
      if (items.length === 0) {
        cell.addClass("readflow-narrative-cell--empty");
        continue;
      }
      for (var ti = 0; ti < Math.min(items.length, 3); ti++) {
        var hl = row.plot ? items[ti].highlight : items[ti];
        var plotHint = row.plot && items[ti].plot ? items[ti].plot.hint : "";
        var chip = cell.createEl("button", {
          type: "button",
          text: shortLabel(plotHint || hl.content, 14),
          cls: row.plot ? "readflow-narrative-chip readflow-narrative-chip--plot" : "readflow-narrative-chip",
        });
        chip.title = plotHint ? plotHint + "\n" + hl.content : hl.content;
        chip.addEventListener("click", function (id) {
          return function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (opts && typeof opts.onHighlightSelect === "function") opts.onHighlightSelect(id);
          };
        }(hl.id));
      }
      if (items.length > 3) {
        cell.createSpan({ text: "+" + (items.length - 3), cls: "readflow-narrative-more" });
      }
    }
  }
  return wrap;
}
function scopedBookForMindMap(scopeBook, opts) {
  var lens = (opts && opts.lens) || "all";
  return {
    title: scopeBook.title,
    highlights: applyMindMapLens(scopeBook.highlights, lens),
  };
}
function appendEntityLeaves(en, st, ei) {
  for (var hi = 0; hi < Math.min(st.items.length, 10); hi++) {
    var h = st.items[hi];
    var co = (h.entities || []).filter(function (e) {
      return e.trim() && entityCanonicalKey(e) !== entityCanonicalKey(st.label);
    });
    var coText = co.length ? "\n\u5171\u73B0: " + co.map(entityDisplayLabel).join("\u3001") : "";
    en.ch.push({
      id: "__mm_eh_" + ei + "_" + hi,
      label: shortLabel(h.content, 18),
      full: h.content + coText + (h.note ? "\n\u2500\u2500\n\u60F3\u6CD5: " + h.note : ""),
      ntype: "leaf",
      htype: h.highlightType,
      imp: h.importance || 3,
      exp: false,
      ch: [],
      _x: 0,
      _y: 0,
      srcId: h.id,
    });
  }
}
function buildTopicMindMapTree(scopeBook, topicName) {
  var _a;
  var key = (topicName || "").trim();
  if (!key) return buildBookMindMapTree(scopeBook);
  var items = scopeBook.highlights.filter(function (h) {
    var t = (h.topic || "").trim() || "\u672A\u5F52\u7C7B";
    return t === key;
  });
  var root = {
    id: "__mm_root",
    label: shortLabel(key, 20),
    full: key + " (" + items.length + "\u6761)",
    ntype: "root",
    htype: null,
    exp: true,
    ch: [],
    _x: 0,
    _y: 0,
  };
  if (items.length === 0) return root;
  var byType = {};
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var tp = item.highlightType || "\u672A\u5206\u7C7B";
    if (!byType[tp]) byType[tp] = [];
    byType[tp].push(item);
  }
  var ents = Object.entries(byType).sort(function (a, b) {
    return b[1].length - a[1].length;
  });
  for (var ei = 0; ei < ents.length; ei++) {
    var typeKey = ents[ei][0];
    var typeItems = ents[ei][1];
    var tl = (_a = HIGHLIGHT_TYPE_LABELS[typeKey]) != null ? _a : typeKey;
    var gn = {
      id: "__mm_tg_" + ei,
      label: tl + " " + typeItems.length,
      full: tl + " " + typeItems.length + "\u6761",
      ntype: "type",
      htype: typeKey === "\u672A\u5206\u7C7B" ? null : typeKey,
      exp: ei < 3,
      ch: [],
      _x: 0,
      _y: 0,
    };
    for (var hi = 0; hi < Math.min(typeItems.length, 12); hi++) {
      var h = typeItems[hi];
      gn.ch.push({
        id: "__mm_th_" + ei + "_" + hi,
        label: shortLabel(h.content, 18),
        full: h.content + (h.note ? "\n\u2500\u2500\n\u60F3\u6CD5: " + h.note : ""),
        ntype: "leaf",
        htype: h.highlightType,
        imp: h.importance || 3,
        exp: false,
        ch: [],
        _x: 0,
        _y: 0,
        srcId: h.id,
      });
    }
    if (gn.ch.length > 0) root.ch.push(gn);
  }
  return root;
}
function buildIdeaMindMapTree(scopeBook) {
  var _a;
  var items = scopeBook.highlights;
  var untypedCount = items.filter(function (h) {
    return !h.highlightType;
  }).length;
  var root = {
    id: "__mm_root",
    label: shortLabel("\u89C2\u70B9\u68B3\u7406", 20),
    full:
      "\u89C2\u70B9\u68B3\u7406\uFF08" +
      items.length +
      "\u6761" +
      (untypedCount ? "\uFF0C" + untypedCount + "\u6761\u5F85\u5206\u7C7B" : "") +
      "\uFF09",
    ntype: "root",
    htype: null,
    exp: true,
    ch: [],
    _x: 0,
    _y: 0,
  };
  if (items.length === 0) return root;
  var byType = {};
  for (var i = 0; i < items.length; i++) {
    var tp = items[i].highlightType || "\u5F85\u5206\u7C7B";
    if (!byType[tp]) byType[tp] = [];
    byType[tp].push(items[i]);
  }
  var ents = Object.entries(byType).sort(function (a, b) {
    if (a[0] === "\u5F85\u5206\u7C7B") return -1;
    if (b[0] === "\u5F85\u5206\u7C7B") return 1;
    return b[1].length - a[1].length;
  });
  for (var ei = 0; ei < ents.length; ei++) {
    var typeKey = ents[ei][0];
    var typeItems = ents[ei][1];
    var tl = (_a = HIGHLIGHT_TYPE_LABELS[typeKey]) != null ? _a : typeKey;
    var gn = {
      id: "__mm_ig_" + ei,
      label: tl + " " + typeItems.length,
      full: tl + " " + typeItems.length + "\u6761",
      ntype: "type",
      htype: typeKey,
      exp: ei < 4,
      ch: [],
      _x: 0,
      _y: 0,
    };
    for (var hi = 0; hi < Math.min(typeItems.length, 12); hi++) {
      var h = typeItems[hi];
      gn.ch.push({
        id: "__mm_ih_" + ei + "_" + hi,
        label: shortLabel(h.content, 18),
        full: h.content + (h.note ? "\n\u2500\u2500\n\u60F3\u6CD5: " + h.note : ""),
        ntype: "leaf",
        htype: h.highlightType,
        imp: h.importance || 3,
        exp: false,
        ch: [],
        _x: 0,
        _y: 0,
        srcId: h.id,
      });
    }
    if (gn.ch.length > 0) root.ch.push(gn);
  }
  return root;
}
function collectEntityStats(scopeBook) {
  var map = /* @__PURE__ */ new Map();
  var addEntStat = function (ent) {
    var tag = String(ent || "").trim();
    if (!tag) return;
    var ck = entityCanonicalKey(tag);
    if (!map.has(ck)) {
      map.set(ck, { label: tag, displayName: entityDisplayLabel(tag), items: [] });
    }
    return map.get(ck);
  };
  for (var i = 0; i < scopeBook.highlights.length; i++) {
    var h = scopeBook.highlights[i];
    var ents = h.entities || [];
    for (var j = 0; j < ents.length; j++) {
      var row = addEntStat(ents[j]);
      if (row) row.items.push(h);
    }
  }
  for (var er of scopeBook.entityRelations || []) {
    if (!er) continue;
    addEntStat(er.source);
    addEntStat(er.target);
  }
  for (var _v of map.values()) {
    _v.displayName = resolveEntityDisplayName(_v.label, _v.items);
  }
  return [...map.values()].sort(function (a, b) {
    return b.items.length - a.items.length || a.displayName.localeCompare(b.displayName, "zh-CN");
  });
}
function buildEntityLabelLookup(scopeBook) {
  var lookup = /* @__PURE__ */ new Map();
  for (var st of collectEntityStats(scopeBook)) {
    lookup.set(entityCanonicalKey(st.label), st.displayName);
    lookup.set(entityCanonicalKey(st.displayName), st.displayName);
  }
  return lookup;
}
function entityGraphLabel(name, lookup) {
  var ck = entityCanonicalKey(name);
  return (lookup && lookup.get(ck)) || entityDisplayLabel(name);
}
function appendManualEntityRelationNodes(root, entityRelations, lookup) {
  if (!entityRelations || !entityRelations.length) return;
  var relRoot = {
    id: "__mm_manual_rels",
    label: shortLabel("\u624B\u52A8\u5173\u7CFB " + entityRelations.length, 14),
    full: "\u624B\u52A8\u5EFA\u7ACB\u7684\u4EBA\u7269\u5173\u7CFB\uFF08" + entityRelations.length + "\u6761\uFF09",
    ntype: "topic",
    htype: null,
    exp: true,
    ch: [],
    _x: 0,
    _y: 0,
  };
  for (var ri = 0; ri < Math.min(entityRelations.length, 24); ri++) {
    var rel = entityRelations[ri];
    if (!rel || !rel.source || !rel.target) continue;
    var srcLabel = entityGraphLabel(rel.source, lookup);
    var tgtLabel = entityGraphLabel(rel.target, lookup);
    relRoot.ch.push({
      id: "__mm_mrel_" + ri,
      label: shortLabel(srcLabel + " \u00B7 " + (rel.hint || "\u5173\u7CFB") + " \u00B7 " + tgtLabel, 18),
      full: srcLabel + " \u2194 " + tgtLabel + "\n" + (rel.hint || "\u5173\u7CFB"),
      ntype: "leaf",
      htype: null,
      imp: 3,
      exp: false,
      ch: [],
      _x: 0,
      _y: 0,
    });
  }
  if (relRoot.ch.length > 0) root.ch.push(relRoot);
}
function buildEntityMindMapTree(scopeBook, focusEntity, groupByRole, entityRelations) {
  var stats = collectEntityStats(scopeBook);
  var focus = (focusEntity || "").trim();
  if (focus) {
    var fl = entityCanonicalKey(focus);
    stats = stats.filter(function (s) {
      return entityCanonicalKey(s.label) === fl || s.label === focus || s.label.toLowerCase() === focus.toLowerCase();
    });
  }
  var root = {
    id: "__mm_root",
    label: shortLabel(focus || (groupByRole ? "\u4EBA\u7269\u5173\u7CFB" : "\u5B9E\u4F53\u5173\u7CFB"), 20),
    full: focus
      ? focus + " \u5B9E\u4F53\u7F51\u7EDC"
      : (groupByRole ? "\u4EBA\u7269\u5173\u7CFB" : "\u5B9E\u4F53\u5173\u7CFB") + "\uFF08" + stats.length + "\u4E2A\u5B9E\u4F53\uFF09",
    ntype: "root",
    htype: null,
    exp: true,
    ch: [],
    _x: 0,
    _y: 0,
  };
  if (groupByRole) {
    var lookup = buildEntityLabelLookup(scopeBook);
    var roleMap = /* @__PURE__ */ new Map();
    for (var si = 0; si < stats.length; si++) {
      var st0 = stats[si];
      var parsed0 = parseEntityTag(st0.label);
      var roleKey = parsed0.role || "\u4EBA\u7269";
      if (!roleMap.has(roleKey)) roleMap.set(roleKey, []);
      roleMap.get(roleKey).push({ parsed: parsed0, stat: st0 });
    }
    var roleEntries = [...roleMap.entries()].sort(function (a, b) {
      if (a[0] === "\u672A\u6807\u6CE8") return 1;
      if (b[0] === "\u672A\u6807\u6CE8") return -1;
      return b[1].length - a[1].length || a[0].localeCompare(b[0], "zh-CN");
    });
    for (var ri = 0; ri < Math.min(roleEntries.length, 12); ri++) {
      var roleEntry = roleEntries[ri];
      var roleName = roleEntry[0];
      var roleItems = roleEntry[1];
      var rn = {
        id: "__mm_role_" + ri,
        label: shortLabel(roleName, 14),
        full: roleName + " (" + roleItems.length + "\u4EBA)",
        ntype: "topic",
        htype: null,
        exp: ri < 3,
        ch: [],
        _x: 0,
        _y: 0,
      };
      for (var pi = 0; pi < Math.min(roleItems.length, 15); pi++) {
        var pack = roleItems[pi];
        var dispName = pack.stat.displayName || pack.parsed.name || pack.stat.label;
        var pn = {
          id: "__mm_pers_" + ri + "_" + pi,
          label: shortLabel(dispName, 14),
          full: dispName + " \u00B7 " + pack.stat.label + " (" + pack.stat.items.length + "\u6761)",
          ntype: "type",
          htype: null,
          exp: pi < 3,
          ch: [],
          _x: 0,
          _y: 0,
        };
        appendEntityLeaves(pn, pack.stat, ri * 100 + pi);
        if (pn.ch.length > 0) rn.ch.push(pn);
      }
      if (rn.ch.length > 0) root.ch.push(rn);
    }
    appendManualEntityRelationNodes(root, entityRelations, lookup);
    if (!focus) {
      var untagged = scopeBook.highlights.filter(function (h) {
        return !((h.entities || []).some(function (e) {
          return String(e || "").trim();
        }));
      });
      if (untagged.length > 0) {
        var un = {
          id: "__mm_untagged_people",
          label: shortLabel("\u672A\u6807\u6CE8 " + untagged.length, 14),
          full: "\u672A\u6DFB\u52A0\u5B9E\u4F53\u6807\u7B7E\u7684\u6458\u5F55\uFF08" + untagged.length + "\u6761\uFF09",
          ntype: "topic",
          htype: null,
          exp: false,
          ch: [],
          _x: 0,
          _y: 0,
        };
        for (var ui = 0; ui < Math.min(untagged.length, 12); ui++) {
          var uh = untagged[ui];
          un.ch.push({
            id: "__mm_untagged_" + ui,
            label: shortLabel(uh.content, 18),
            full: uh.content,
            ntype: "leaf",
            htype: uh.highlightType,
            imp: uh.importance || 3,
            exp: false,
            ch: [],
            _x: 0,
            _y: 0,
            srcId: uh.id,
          });
        }
        root.ch.push(un);
      }
    }
    return root;
  }
  var lookupFlat = buildEntityLabelLookup(scopeBook);
  for (var ei = 0; ei < Math.min(stats.length, 20); ei++) {
    var st = stats[ei];
    var parsed = parseEntityTag(st.label);
    var dispFlat = st.displayName || parsed.name || st.label;
    var en = {
      id: "__mm_ent_" + ei,
      label: shortLabel(dispFlat, 14),
      full: (parsed.role ? parsed.role + " \u2192 " : "") + dispFlat + " (" + st.items.length + "\u6761)",
      ntype: "topic",
      htype: null,
      exp: ei < 4,
      ch: [],
      _x: 0,
      _y: 0,
    };
    appendEntityLeaves(en, st, ei);
    if (en.ch.length > 0 || st.items.length === 0) {
      if (en.ch.length === 0) {
        en.full = dispFlat + " (\u624B\u52A8\u5173\u7CFB)";
      }
      root.ch.push(en);
    }
  }
  appendManualEntityRelationNodes(root, entityRelations, lookupFlat);
  return root;
}
function buildMindMapTreeFromOptions(scopeBook, opts) {
  var base = (opts && opts.base) || "book";
  var lens = (opts && opts.lens) || "all";
  var scoped = scopedBookForMindMap(scopeBook, opts);
  var entityRelations =
    (opts && opts.sourceBook && opts.sourceBook.entityRelations) ||
    scopeBook.entityRelations ||
    [];
  if (lens === "ideas") return buildIdeaMindMapTree(scoped);
  if (lens === "people" || base === "entity") {
    return buildEntityMindMapTree(scoped, (opts && opts.entity) || "", lens === "people", entityRelations);
  }
  if (base === "topic") {
    var topic = (opts && opts.topic) || "";
    if (!topic) return buildBookMindMapTree(scoped);
    return buildTopicMindMapTree(scoped, topic);
  }
  return buildBookMindMapTree(scoped);
}
function mmSubH(node, gap) {
  if (!node.exp || node.ch.length === 0) return gap;
  var t = 0;
  for (var i = 0; i < node.ch.length; i++) t += mmSubH(node.ch[i], gap);
  return Math.max(t, gap);
}
function layoutMM(node, x, y, h, lx, gap) {
  node._x = x;
  node._y = y + h / 2;
  if (!node.exp || node.ch.length === 0) return;
  var cx = x + lx;
  var tH = 0;
  for (var i = 0; i < node.ch.length; i++) tH += mmSubH(node.ch[i], gap);
  var oY = y + (h - tH) / 2;
  var cY = oY;
  for (var i = 0; i < node.ch.length; i++) {
    var ch = mmSubH(node.ch[i], gap);
    layoutMM(node.ch[i], cx, cY, ch, lx, gap);
    cY += ch;
  }
}
function collectMMNodes(node, arr) {
  arr.push(node);
  if (node.exp) for (var i = 0; i < node.ch.length; i++) collectMMNodes(node.ch[i], arr);
  return arr;
}
function collectMMEdges(node, arr) {
  if (node.exp) {
    for (var i = 0; i < node.ch.length; i++) {
      arr.push({ from: node, to: node.ch[i] });
      collectMMEdges(node.ch[i], arr);
    }
  }
  return arr;
}
var MM_TYPE_COLORS = {
  idea: "#6366f1",
  method: "#0891b2",
  example: "#059669",
  conclusion: "#dc2626",
  question: "#d97706",
};
var MM_NTYPE_COLORS = {
  root: "#2563eb",
  topic: "#7c3aed",
  type: "#475569",
  leaf: "#64748b",
};
function mmNodeColor(node) {
  if (node.htype && MM_TYPE_COLORS[node.htype]) return MM_TYPE_COLORS[node.htype];
  return MM_NTYPE_COLORS[node.ntype] || "#64748b";
}
function mmNodeW(node) {
  if (node.ntype === "root") return 130;
  if (node.ntype === "topic") return 110;
  if (node.ntype === "type") return 90;
  return 120;
}
function mmNodeH(node) {
  if (node.ntype === "root") return 36;
  if (node.ntype === "topic") return 30;
  return 26;
}
function renderMindMapCanvas(container, scopeBook, onCrystallize, opts) {
  var expanded = opts && opts.expanded;
  var root = buildMindMapTreeFromOptions(scopeBook, opts);
  var emptyMsg =
    opts && opts.lens === "people"
      ? "\u6682\u65E0\u4EBA\u7269\u6807\u7B7E\u3002\u8BF7\u7528\u300C\u89D2\u8272:\u540D\u5B57\u300D\u6807\u6CE8\u6458\u5F55\u3002"
      : opts && opts.lens === "ideas"
        ? "\u6682\u65E0\u89C2\u70B9\u7C7B\u6458\u5F55\u3002\u8BF7\u8BBE\u7F6E\u6458\u5F55\u7C7B\u578B\uFF08\u89C2\u70B9/\u65B9\u6CD5/\u7ED3\u8BBA\u7B49\uFF09\u3002"
        : opts && opts.base === "entity"
          ? "\u6682\u65E0\u5B9E\u4F53\u6807\u7B7E\u3002\u8BF7\u5728\u6458\u5F55\u4E2D\u6DFB\u52A0 entities\uFF08\u5982\u4EBA\u540D\uFF09\u540E\u518D\u8BD5\u3002"
          : opts && opts.base === "topic"
            ? "\u5F53\u524D\u4E3B\u9898\u4E0B\u6682\u65E0\u6458\u5F55\u6570\u636E\u3002"
            : "\u6682\u65E0\u6458\u5F55\u6570\u636E\uFF0C\u65E0\u6CD5\u751F\u6210\u8111\u56FE\u3002";
  if (root.ch.length === 0) {
    container.createEl("p", { text: emptyMsg, cls: "readflow-muted" });
    return null;
  }
  var wrap = container.createDiv("readflow-mm-wrap");
  var canvas = wrap.createEl("canvas", { cls: "readflow-mm-canvas" });
  var W =
    wrap.getBoundingClientRect().width > 0
      ? wrap.getBoundingClientRect().width
      : container.getBoundingClientRect().width || 500;
  let H = expanded
    ? Math.max(400, wrap.getBoundingClientRect().height || container.getBoundingClientRect().height - 40, 260)
    : 260;
  canvas.width = W;
  canvas.height = H;
  var LX = 150,
    GAP = 32;
  var totalH = mmSubH(root, GAP);
  layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
  var allN = collectMMNodes(root, []);
  var allE = collectMMEdges(root, []);
  var scale = 1,
    tx = 0,
    ty = 0;
  var hov = null,
    panActive = false,
    didPan = false,
    downPos = null,
    panOrig = { x: 0, y: 0 };
  if (totalH > H) {
    scale = Math.max(0.5, (H / totalH) * 0.9);
    tx = 10;
    ty = (H - totalH * scale) / 2;
  }
  var isDark = function () {
    return document.body.classList.contains("theme-dark");
  };
  var drawRR = function (ctx, x2, y2, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x2 + r, y2);
    ctx.lineTo(x2 + w - r, y2);
    ctx.quadraticCurveTo(x2 + w, y2, x2 + w, y2 + r);
    ctx.lineTo(x2 + w, y2 + h - r);
    ctx.quadraticCurveTo(x2 + w, y2 + h, x2 + w - r, y2 + h);
    ctx.lineTo(x2 + r, y2 + h);
    ctx.quadraticCurveTo(x2, y2 + h, x2, y2 + h - r);
    ctx.lineTo(x2, y2 + r);
    ctx.quadraticCurveTo(x2, y2, x2 + r, y2);
    ctx.closePath();
  };
  function draw() {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dk = isDark();
    var bg = dk ? "#0b1220" : "#f8fafc";
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (var i = 0; i < allE.length; i++) {
      var e = allE[i];
      var fx = e.from._x + mmNodeW(e.from),
        fy = e.from._y;
      var tx2 = e.to._x,
        ty2 = e.to._y;
      var cpx = fx + (tx2 - fx) * 0.5;
      var isHovEdge = hov && (hov.id === e.from.id || hov.id === e.to.id);
      ctx.strokeStyle = isHovEdge ? mmNodeColor(e.to) : dk ? "#334155" : "#cbd5e1";
      ctx.lineWidth = (isHovEdge ? 2 : 1.2) / scale;
      ctx.globalAlpha = isHovEdge ? 0.9 : hov ? 0.25 : 0.6;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(cpx, fy, cpx, ty2, tx2, ty2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < allN.length; i++) {
      var n = allN[i];
      var nw = mmNodeW(n),
        nh = mmNodeH(n);
      var nx = n._x,
        ny = n._y - nh / 2;
      var col = mmNodeColor(n);
      var isH = n === hov;
      var faded =
        hov &&
        n !== hov &&
        !allE.some(function (e2) {
          return (e2.from === hov && e2.to === n) || (e2.to === hov && e2.from === n);
        });
      ctx.globalAlpha = faded ? 0.3 : 1;
      if (isH) {
        ctx.shadowColor = col;
        ctx.shadowBlur = 12 / scale;
      }
      if (n.ntype === "root") {
        ctx.fillStyle = col;
        drawRR(ctx, nx, ny, nw, nh, nh / 2);
        ctx.fill();
      } else {
        ctx.fillStyle = dk ? "#1e293b" : "#ffffff";
        drawRR(ctx, nx, ny, nw, nh, 6);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = (isH ? 2 : 1.2) / scale;
        drawRR(ctx, nx, ny, nw, nh, 6);
        ctx.stroke();
        if (n.ntype === "topic") {
          ctx.fillStyle = col;
          ctx.globalAlpha = (faded ? 0.3 : 1) * 0.12;
          drawRR(ctx, nx, ny, nw, nh, 6);
          ctx.fill();
          ctx.globalAlpha = faded ? 0.3 : 1;
        }
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = n.ntype === "root" ? "#f8fafc" : dk ? "#e2e8f0" : "#1e293b";
      ctx.font = (n.ntype === "root" || n.ntype === "topic" ? "600 " : "") + 11 / scale + "px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.label, nx + nw / 2, n._y, nw - 8);
      if (n.ch.length > 0) {
        var ex = n.exp ? "\u25BC" : "\u25B6";
        ctx.fillStyle = dk ? "#94a3b8" : "#64748b";
        ctx.font = 8 / scale + "px system-ui";
        ctx.textAlign = "right";
        ctx.fillText(ex, nx + nw - 4, n._y);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (hov) {
      var sx = hov._x * scale + tx,
        sy = (hov._y - mmNodeH(hov) / 2) * scale + ty - 8;
      var text = hov.full.length > 80 ? hov.full.slice(0, 80) + "\u2026" : hov.full;
      var lines = text.split("\n");
      var maxLine = lines[0];
      ctx.font = "12px system-ui, sans-serif";
      var tw2 = Math.min(ctx.measureText(maxLine).width, 320);
      var bw = tw2 + 24,
        bh = 14 + lines.length * 16;
      var bx = Math.max(4, Math.min(W - bw - 4, sx));
      var by = Math.max(4, sy - bh - 6);
      ctx.fillStyle = isDark() ? "#1e293b" : "#0f172a";
      ctx.globalAlpha = 0.94;
      drawRR(ctx, bx, by, bw, bh, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#f1f5f9";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li].slice(0, 50), bx + 12, by + 8 + li * 16);
      }
    }
  }
  // Delay first draw until layout is settled so getBoundingClientRect has real size
  function notifyScale() {
    if (opts && opts.onScaleChange) opts.onScaleChange(scale);
  }
  function resetView() {
    scale = 1;
    tx = 0;
    ty = 0;
    if (totalH > H) {
      scale = Math.max(0.5, (H / totalH) * 0.9);
      tx = 10;
      ty = (H - totalH * scale) / 2;
    }
    draw();
    notifyScale();
  }
  function zoomAt(f, cx, cy) {
    var rect = canvas.getBoundingClientRect();
    var mx = cx != null ? cx - rect.left : rect.width / 2;
    var my = cy != null ? cy - rect.top : rect.height / 2;
    tx = mx - (mx - tx) * f;
    ty = my - (my - ty) * f;
    scale = Math.max(0.15, Math.min(scale * f, 6));
    draw();
    notifyScale();
  }
  function onWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    var raw = Math.abs(e.deltaY);
    var step = raw > 80 ? 0.06 : raw > 30 ? 0.04 : 0.025;
    var f = e.deltaY > 0 ? 1 - step : 1 + step;
    zoomAt(f, e.clientX, e.clientY);
  }
  requestAnimationFrame(function () {
    var _cr2 = wrap.getBoundingClientRect();
    var changed = false;
    if (_cr2.width > 0 && _cr2.width !== W) {
      W = _cr2.width;
      canvas.width = W;
      changed = true;
    }
    if (expanded && _cr2.height > 0 && _cr2.height !== H) {
      H = _cr2.height;
      canvas.height = H;
      changed = true;
    }
    if (changed) {
      totalH = mmSubH(root, GAP);
      layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
      allN = collectMMNodes(root, []);
      allE = collectMMEdges(root, []);
      if (totalH > H) {
        scale = Math.max(0.5, (H / totalH) * 0.9);
        tx = 10;
        ty = (H - totalH * scale) / 2;
      }
    }
    draw();
    notifyScale();
  });
  function hitTest(mx, my) {
    for (var i = allN.length - 1; i >= 0; i--) {
      var n = allN[i];
      var nw = mmNodeW(n),
        nh = mmNodeH(n);
      if (mx >= n._x && mx <= n._x + nw && my >= n._y - nh / 2 && my <= n._y + nh / 2) return n;
    }
    return null;
  }
  canvas.addEventListener("wheel", onWheel, { passive: false });
  if (expanded) wrap.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("mousedown", function (e) {
    if (e.button === 0) {
      downPos = { x: e.clientX, y: e.clientY };
      panOrig = { x: e.clientX - tx, y: e.clientY - ty };
    }
  });
  canvas.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - tx) / scale;
    var my = (e.clientY - rect.top - ty) / scale;
    if (downPos) {
      var dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
      if (!panActive && dx * dx + dy * dy > 16) { panActive = true; didPan = true; }
      if (panActive) {
        tx = e.clientX - panOrig.x;
        ty = e.clientY - panOrig.y;
        draw();
        return;
      }
    }
    var found = hitTest(mx, my);
    if (found !== hov) {
      hov = found;
      canvas.style.cursor = found ? "pointer" : "grab";
      draw();
    }
  });
  canvas.addEventListener("click", function (e) {
    if (didPan) { didPan = false; return; }
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - tx) / scale;
    var my = (e.clientY - rect.top - ty) / scale;
    var found = hitTest(mx, my);
    if (found && found.ch.length > 0) {
      found.exp = !found.exp;
      totalH = mmSubH(root, GAP);
      layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
      allN = collectMMNodes(root, []);
      allE = collectMMEdges(root, []);
      draw();
    }
  });
  canvas.addEventListener("mouseup", function () {
    panActive = false;
    downPos = null;
  });
  canvas.addEventListener("mouseleave", function () {
    panActive = false;
    downPos = null;
    hov = null;
    draw();
  });
  canvas.addEventListener("dblclick", resetView);
  var controls = {
    zoomIn: function () {
      zoomAt(1.18);
    },
    zoomOut: function () {
      zoomAt(1 / 1.18);
    },
    resetView: resetView,
    getScale: function () {
      return scale;
    },
    reflow: function () {
      var _cr2 = wrap.getBoundingClientRect();
      var changed = false;
      if (_cr2.width > 0 && _cr2.width !== W) {
        W = _cr2.width;
        canvas.width = W;
        changed = true;
      }
      if (expanded && _cr2.height > 0 && _cr2.height !== H) {
        H = _cr2.height;
        canvas.height = H;
        changed = true;
      }
      if (changed) {
        totalH = mmSubH(root, GAP);
        layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
        allN = collectMMNodes(root, []);
        allE = collectMMEdges(root, []);
        if (expanded && totalH > H) {
          scale = Math.max(0.5, (H / totalH) * 0.9);
          tx = 10;
          ty = (H - totalH * scale) / 2;
        } else if (expanded) {
          scale = 1;
          tx = 0;
          ty = 0;
        }
        draw();
        notifyScale();
      }
    },
  };
  wrap.readflowMmControls = controls;
  var ro = new ResizeObserver(function () {
    var nw = wrap.getBoundingClientRect().width;
    var changed = false;
    if (nw > 0 && nw !== W) { W = nw; canvas.width = W; changed = true; }
    if (expanded) {
      var nh = wrap.getBoundingClientRect().height;
      if (nh > 0 && nh !== H) { H = nh; canvas.height = H; changed = true; }
    }
    if (changed) {
      totalH = mmSubH(root, GAP);
      layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
      allN = collectMMNodes(root, []);
      allE = collectMMEdges(root, []);
      if (expanded && totalH > H) {
        scale = Math.max(0.5, (H / totalH) * 0.9);
        tx = 10;
        ty = (H - totalH * scale) / 2;
      } else if (expanded) {
        scale = 1; tx = 0; ty = 0;
      }
      draw();
    }
  });
  ro.observe(wrap);
  return controls;
}
function generateKnowledgeCard(book, highlightIds, title, insight) {
  var card = {
    id: "kc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    title: title,
    insight: insight,
    sourceHighlightIds: highlightIds,
    bookId: book.bookId,
    bookTitle: book.title,
    tags: [],
    connections: [],
    createdAt: Date.now(),
    importance: 3,
  };
  return card;
}
function buildKnowledgeExportMd(card, book) {
  var sources = [];
  if (book) {
    for (var i = 0; i < card.sourceHighlightIds.length; i++) {
      var h = book.highlights.find(function (x) {
        return x.id === card.sourceHighlightIds[i];
      });
      if (h) sources.push(h);
    }
  }
  var lines = [
    "---",
    "type: knowledge",
    'source: "' + (card.bookTitle || "").replace(/"/g, "'") + '"',
    "created: " + new Date(card.createdAt).toISOString().slice(0, 10),
    "importance: " + card.importance,
    "tags: [" +
      card.tags
        .map(function (t) {
          return '"' + t + '"';
        })
        .join(", ") +
      "]",
    "---",
    "",
    "# " + card.title,
    "",
    "## \u6838\u5FC3\u89C1\u89E3",
    "",
    card.insight,
    "",
    "## \u6765\u6E90\u6458\u5F55",
    "",
  ];
  for (var i = 0; i < sources.length; i++) {
    var s = sources[i];
    var typeTag = s.highlightType ? " [" + (HIGHLIGHT_TYPE_LABELS[s.highlightType] || s.highlightType) + "]" : "";
    lines.push("> " + s.content.slice(0, 200) + typeTag);
    if (s.note) lines.push("> \u2014\u2014 \u60F3\u6CD5: " + s.note);
    lines.push("");
  }
  lines.push("## \u76F8\u5173\u94FE\u63A5");
  lines.push("");
  lines.push("- [[" + (card.bookTitle || "unknown") + "]]");
  for (var i = 0; i < card.connections.length; i++) {
    var conn = card.connections[i];
    lines.push("- [[" + conn.targetTitle + "]] (" + conn.relation + ")");
  }
  lines.push("");
  return lines.join("\n");
}

// src/storage/vaultWriter.ts
function safeSegment(name) {
  const s = name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return s || "untitled";
}
function yamlEscape(s) {
  return JSON.stringify(s != null ? s : "");
}
function highlightFilename(h) {
  const slug =
    h.content
      .slice(0, 40)
      .replace(/[\\/:*?"<>|]/g, "_")
      .trim() || "note";
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
    highlightsSection +=
      "> **ReadFlow**\uFF1A\u672A\u5199\u5165\u4EFB\u4F55\u5212\u7EBF/\u4E66\u8BC4\u6B63\u6587\u3002\u540C\u6B65\u5DF2\u4F1A\u81EA\u52A8\u5408\u5E76\u670D\u52A1\u7AEF `Set-Cookie`\uFF08\u4E0E Weread \u63D2\u4EF6\u540C\u7406\uFF0C\u7528\u4E8E\u4FEE\u590D /web \u4E66\u7B7E\u63A5\u53E3\uFF09\u3002\u82E5\u4ECD\u6709\u6B64\u4E66\u7B14\u8BB0\uFF1A\u8BF7 **\u518D\u70B9\u4E00\u6B21\u300C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u300D** \u6216\u7528 **\u684C\u9762\u300C\u6253\u5F00\u767B\u5F55\u300D** \u91CD\u767B\uFF1B\u5728 Obsidian \u5F00\u53D1\u8005\u5DE5\u5177 Console \u641C\u7D22 **`[ReadFlow] bookmarklist`** \u67E5\u770B `errCode` / `keys` \u8BCA\u65AD\u3002\n\n";
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
  const inboxSection =
    "## \u672A\u6574\u7406\u6458\u5F55\n\n" +
    inbox
      .map(
        (h) => `- (${h.id}) ${h.content.slice(0, 120)}${h.content.length > 120 ? "\u2026" : ""}
`,
      )
      .join("");
  const topicMindmap = buildTopicMindmap(book);
  const topicMindmapSection = topicMindmap
    ? `## \u4E3B\u9898\u8111\u56FE

${topicMindmap}
`
    : "";
  const topicStructureSection = buildTopicStructure(book);
  const coreInsightsSection = buildCoreInsights(book);
  const relationGraph = buildRelationsMermaid(book);
  const relationSection = relationGraph
    ? `## \u903B\u8F91\u5173\u7CFB

${relationGraph}
`
    : "## \u903B\u8F91\u5173\u7CFB\n\n- \u6682\u65E0\u53EF\u751F\u6210\u7684\u5173\u7CFB\u56FE\n";
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
    inboxSection,
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
    highlights: topicRows,
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
    "",
  ].join("\n");
  await upsertVaultFile(app, topicPath, body);
  return topicPath;
}
function formatEmbeddedHighlight(book, h, bookLink) {
  const type = h.highlightType ? `\`[${h.highlightType}]\` ` : "";
  const tags = h.topic ? ` \u{1F3F7} ${h.topic}` : "";
  const linkNames = (h.links || []).map((p) => p.replace(/\.md$/i, "").split("/").pop() || p);
  const relationWikilinks = (h.relations || [])
    .map((relation) => {
      const target = book.highlights.find((row) => row.id === relation.targetId);
      const targetExcerpt = ((target == null ? void 0 : target.content) || relation.targetId).slice(0, 60);
      const hint = relation.hint || "\u5173\u7CFB";
      const targetIdSafe = relation.targetId.replace(/[^a-zA-Z0-9]/g, "_");
      return `  - ${hint}:: [[${bookLink}#${targetIdSafe}|${targetExcerpt}\u2026]]`;
    })
    .join("\n");
  const links =
    linkNames.length > 0
      ? `
  - \u5173\u8054: ${linkNames.map((n) => `[[${n}]]`).join(" ")}`
      : "";
  const relationLines = relationWikilinks
    ? `\u270F **\u903B\u8F91\u5173\u7CFB**
${relationWikilinks}
`
    : "";
  const hIdSafe = h.id.replace(/[^a-zA-Z0-9]/g, "_");
  return (
    `- ${type}**\u6458\u5F55**${tags} ^${hIdSafe}

  > ${h.content.replace(/\n/g, "\n  > ")}

` +
    (h.note
      ? `  - \u60F3\u6CD5:: ${h.note}
`
      : "") +
    (relationLines ? `${relationLines}` : "") +
    links +
    `
  - \u4E66\u7C4D:: [[${bookLink}]]

`
  );
}
async function writeAtomicHighlight(app, settings, hlFolder, linkPathNoExt, book, h) {
  var _a, _b, _c;
  const fn = highlightFilename(h);
  const hlPath = (0, import_obsidian3.normalizePath)(`${hlFolder}/${fn}`);
  const bw = bookWikilink(settings, book);
  const lines = ["---", "type: highlight", `book: "[[${bw}]]"`, `book_id: ${yamlEscape(book.bookId)}`];
  if (h.chapter) lines.push(`chapter: ${yamlEscape(h.chapter)}`);
  if (h.highlightType) lines.push(`highlight_type: ${h.highlightType}`);
  if (h.topic) lines.push(`topic: ${yamlEscape(h.topic)}`);
  lines.push(
    `status: ${h.status}`,
    `importance: ${h.importance}`,
    `created: ${h.createdAt}`,
    `source: ${h.sourceType}`,
    `id: ${yamlEscape(h.id)}`,
  );
  if ((_a = h.links) == null ? void 0 : _a.length) {
    lines.push("links:");
    for (const l of h.links) lines.push(`  - "[[${l.replace(/\.md$/i, "")}]]"`);
  } else {
    lines.push("links: []");
  }
  if ((_b = h.relations) == null ? void 0 : _b.length) {
    lines.push("relations:");
    for (const relation of h.relations) {
      const target = book.highlights.find((row) => row.id === relation.targetId);
      const targetExcerpt = ((target == null ? void 0 : target.content) || relation.targetId).slice(0, 80);
      const targetIdSafe = relation.targetId.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`  - ${relation.hint}: [[${bw}#${targetIdSafe}|${targetExcerpt}]]`);
    }
  }
  lines.push(
    "---",
    "",
    "> " + h.content.replace(/\n/g, "\n> "),
    "",
    h.note ? "## \u6211\u7684\u60F3\u6CD5\n\n" + h.note + "\n\n" : "",
    ((_c = h.relations) == null ? void 0 : _c.length)
      ? "## \u6458\u5F55\u5173\u7CFB\n\n" +
          h.relations
            .map((relation) => {
              const target = book.highlights.find((row) => row.id === relation.targetId);
              return `- ${relation.hint} -> ${((target == null ? void 0 : target.content) || relation.targetId).slice(0, 80)}`;
            })
            .join("\n") +
          "\n\n"
      : "",
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
    "",
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
  question: "\u7591\u95EE",
};
var STATUS_LABELS = {
  inbox: "\u5F85\u6574\u7406",
  reviewing: "\u5DF2\u9605\u8BFB",
  drafted: "\u8349\u7A3F\u5B8C\u6210",
  processed: "\u5DF2\u5904\u7406",
};
var STATUS_COLORS = {
  inbox: "#f59e0b",
  reviewing: "#3b82f6",
  drafted: "#8b5cf6",
  processed: "#10b981",
};
var STATUS_FLOW = ["inbox", "reviewing", "drafted", "processed"];

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
  const scored = all
    .filter((h) => h.id !== excludeId)
    .map((h) => ({ h, score: tokenOverlapScore(content, h.content) }))
    .filter((x) => x.score > 0.08)
    .sort((a, b) => b.score - a.score);
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
    this.contextAbstract = "";
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
    this.content =
      (_b = (_a = h == null ? void 0 : h.content) != null ? _a : this.options.initialContent) != null ? _b : "";
    this.note = (_c = h == null ? void 0 : h.note) != null ? _c : "";
    this.topic = (_d = h == null ? void 0 : h.topic) != null ? _d : "";
    this.entities = [...((_e = h == null ? void 0 : h.entities) != null ? _e : [])];
    this.highlightType =
      (_g = (_f = h == null ? void 0 : h.highlightType) != null ? _f : suggestHighlightType(this.content)) != null
        ? _g
        : "";
    this.importance = (_h = h == null ? void 0 : h.importance) != null ? _h : 3;
    this.selectedLinks = [...((_i = h == null ? void 0 : h.links) != null ? _i : [])];
    this.bookTitle =
      (_l = (_k = (_j = this.options.book) == null ? void 0 : _j.title) != null ? _k : this.options.manualBookTitle) !=
      null
        ? _l
        : "";
    if (!this.highlightType && this.content) {
      this.highlightType = (_m = suggestHighlightType(this.content)) != null ? _m : "";
    }
    this.contextAbstract =
      (_a = this.options.initialContextAbstract) != null
        ? _a
        : (_b = h == null ? void 0 : h.contextAbstract) != null
          ? _b
          : "";
    this.titleEl.setText(
      h ? "\u6574\u7406\u6458\u5F55" : this.options.compactMode ? "\u5FEB\u901F\u6458\u5F55" : "\u65B0\u6458\u5F55",
    );
    const sourceSec = contentEl.createDiv("readflow-modal-section");
    sourceSec.createEl("h4", { text: "\u6765\u6E90\u4FE1\u606F" });
    new import_obsidian4.Setting(sourceSec).setName("\u4E66\u540D").addText((t) => {
      t.setValue(this.bookTitle).onChange((v) => (this.bookTitle = v));
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
    if (this.contextAbstract) {
      const ctxPreview = sourceSec.createDiv("readflow-capture-ctx-preview");
      const ctxLines = this.contextAbstract.split("\n");
      const mainLine = ctxLines.find((l) => l.length > 10) || ctxLines[0] || "";
      const mainIdx = ctxLines.indexOf(mainLine);
      for (let ci = 0; ci < ctxLines.length; ci++) {
        const line = ctxLines[ci];
        if (!line.trim()) continue;
        const isMain = ci === mainIdx && line === this.content;
        const el = ctxPreview.createEl("p", {
          text: (ci < mainIdx ? "\u2026" : "") + line.slice(0, 120) + (line.length > 120 ? "\u2026" : ""),
          cls: isMain ? "readflow-capture-ctx-main" : "readflow-capture-ctx-sub",
        });
        if (isMain) el.style.fontWeight = "600";
      }
    }
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
    const llmEnabled = this.plugin.settings.llmClassifier && this.plugin.settings.llmClassifier.enabled;
    if (llmEnabled) {
      const llmBtn = structureSec.createEl("button", { text: "\u{1F916} AI \u5206\u7C7B", type: "button" });
      llmBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      llmBtn.style.fontSize = "12px";
      llmBtn.addEventListener("click", async () => {
        if (!this.content.trim()) {
          new import_obsidian4.Notice("\u8BF7\u5148\u586B\u5199\u6458\u5F55\u5185\u5BB9");
          return;
        }
        llmBtn.disabled = true;
        llmBtn.textContent = "\u5206\u6790\u4E2D\u2026";
        const fakeH = { content: this.content, note: this.note };
        const bookTitle = this.options.book ? this.options.book.title : this.bookTitle;
        const type = await this.plugin.classifyHighlightWithLlm(fakeH, bookTitle);
        if (type && HIGHLIGHT_TYPE_LABELS[type]) {
          this.highlightType = type;
          const dropdownEl = structureSec.querySelector("select");
          if (dropdownEl) dropdownEl.value = type;
          new import_obsidian4.Notice(`\u2705 AI \u5206\u7C7B\u4E3A\uFF1A${HIGHLIGHT_TYPE_LABELS[type]}`);
        } else {
          new import_obsidian4.Notice("\u672A\u80FD\u5206\u6790\uFF0C\u8BF7\u68C0\u67E5 LLM \u914D\u7F6E");
        }
        llmBtn.disabled = false;
        llmBtn.textContent = "\u{1F916} AI \u5206\u7C7B";
      });
    }
    new import_obsidian4.Setting(structureSec).setName("\u4E3B\u9898\uFF08\u53EF\u9009\uFF09").addText((t) => {
      var _a2;
      t.setValue(this.topic).onChange((v) => (this.topic = v));
      if (this.options.book) {
        const listId = `readflow-topic-list-${Date.now()}`;
        const datalist = structureSec.createEl("datalist");
        datalist.id = listId;
        const topics = [
          ...new Set(
            [
              ...((_a2 = this.options.book.topicCatalog) != null ? _a2 : []),
              ...this.options.book.highlights.map((row) => (row.topic || "").trim()),
            ].filter(Boolean),
          ),
        ];
        for (const topic of topics) {
          datalist.createEl("option", { value: topic });
        }
        t.inputEl.setAttribute("list", listId);
      }
    });
    new import_obsidian4.Setting(structureSec)
      .setName("\u5B9E\u4F53\u6807\u7B7E\uFF08\u53EF\u9009\uFF09")
      .setDesc(
        "\u4EBA\u7269\u3001\u5730\u70B9\u3001\u6982\u5FF5\u7B49\uFF0C\u9017\u53F7\u5206\u9694\u3002\u4EBA\u7269\u53EF\u7528\u300C\u89D2\u8272:\u540D\u5B57\u300D\uFF08\u5982\u5BFC\u5E08:\u7EB3\u74E6\u5C14\uFF09\uFF0C\u5173\u7CFB\u5728\u77E5\u8BC6\u7ED3\u6784\u533A\u65B0\u589E\u3002",
      )
      .addText((t) => {
        t.setValue(this.entities.join(", "))
          .setPlaceholder("\u4F8B\uFF1A\u674E\u514B\u7528, \u592A\u539F, \u664B\u9633\u4E4B\u6218")
          .onChange((v) => {
            this.entities = v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
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
      sl.setLimits(1, 5, 1)
        .setValue(this.importance)
        .onChange((v) => {
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
      saveBtn.addEventListener("click", () => void this.save(h.status, false));
      const draftForPush = {
        bookId: this.options.book ? this.options.book.bookId : void 0,
        note: this.note,
        wereadRange: h.wereadRange,
        wereadReviewId: h.wereadReviewId,
        sourceType: h.sourceType,
        chapterUid: h.chapterUid,
      };
      if (canPushHighlightToWeread(draftForPush)) {
        const savePushBtn = actions.createEl("button", { text: "\u4FDD\u5B58\u5E76\u63A8\u9001", type: "button" });
        savePushBtn.classList.add("readflow-btn", "readflow-btn--accent");
        savePushBtn.title = "\u4FDD\u5B58\u540E\u5C06\u60F3\u6CD5\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66";
        savePushBtn.addEventListener("click", () => void this.save(h.status, true));
      }
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
        cls: "readflow-muted",
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
      container.createEl("p", {
        text: "\u5F53\u524D\u672A\u5339\u914D\u5230\u4E66\u7C4D\uFF0C\u4FDD\u5B58\u540E\u53EF\u5728\u5DE5\u4F5C\u53F0\u7EE7\u7EED\u6574\u7406\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    this.relatedFromBook = suggestRelatedHighlights(
      this.options.book.highlights,
      this.content,
      (_a = this.options.highlight) == null ? void 0 : _a.id,
    ).slice(0, this.options.compactMode ? 3 : 5);
    if (this.relatedFromBook.length === 0) {
      container.createEl("p", { text: "\u6682\u65E0\u76F8\u8FD1\u6761\u76EE", cls: "readflow-muted" });
      return;
    }
    for (const rh of this.relatedFromBook) {
      const row = container.createDiv("readflow-related-row");
      row.createEl("span", {
        text: rh.content.slice(0, 100) + (rh.content.length > 100 ? "\u2026" : ""),
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
      container.createEl("p", {
        text: "\u8F93\u5165\u6458\u5F55\u5185\u5BB9\u540E\uFF0C\u8FD9\u91CC\u4F1A\u751F\u6210\u5173\u7CFB\u8349\u56FE\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    const graph = container.createDiv("readflow-graph-preview");
    const sourceCol = graph.createDiv("readflow-graph-source");
    const sourceNode = sourceCol.createDiv("readflow-graph-node readflow-graph-node--primary");
    sourceNode.createEl("span", { text: "\u5F53\u524D\u6458\u5F55", cls: "readflow-graph-node-label" });
    sourceNode.createEl("strong", {
      text: sourceText
        ? `${sourceText.slice(0, 56)}${sourceText.length > 56 ? "\u2026" : ""}`
        : "\u7B49\u5F85\u8F93\u5165\u5185\u5BB9",
      cls: "readflow-graph-node-title",
    });
    if (noteText) {
      sourceNode.createEl("p", {
        text: `\u60F3\u6CD5\uFF1A${noteText.slice(0, 56)}${noteText.length > 56 ? "\u2026" : ""}`,
        cls: "readflow-graph-node-subtitle",
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
        cls: "readflow-graph-node-title",
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
      empty.setText(
        "\u6682\u65E0\u81EA\u52A8\u5173\u7CFB\uFF0C\u4FDD\u5B58\u540E\u53EF\u5728\u5DE5\u4F5C\u53F0\u7EE7\u7EED\u8865\u5145\u3002",
      );
    }
  }
  refreshAssistPanels() {
    if (this.linkSec) this.refreshSuggestions(this.linkSec);
    if (this.relSec) this.refreshRelated(this.relSec);
    if (this.previewSec) this.refreshPreview(this.previewSec);
  }
  save(nextStatus, pushAfter) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _self = this;
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
      id:
        (_c = prev == null ? void 0 : prev.id) != null
          ? _c
          : `rf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
      relations: prev == null ? void 0 : prev.relations,
      wereadRange: prev == null ? void 0 : prev.wereadRange,
      wereadBookmarkId: prev == null ? void 0 : prev.wereadBookmarkId,
      wereadReviewId: prev == null ? void 0 : prev.wereadReviewId,
      contextAbstract: this.contextAbstract || void 0,
    };
    let book = (_g = this.options.book) != null ? _g : this.plugin.diskData.books[bookId];
    if (!book) {
      book = {
        bookId,
        title: this.bookTitle.trim(),
        author: "",
        highlights: [],
        lastSync: Date.now(),
      };
    }
    const others = book.highlights.filter((x) => x.id !== h.id);
    book = { ...book, highlights: [...others, h], lastSync: Date.now() };
    if ((_h = h.topic) == null ? void 0 : _h.trim()) {
      book.topicCatalog = [
        .../* @__PURE__ */ new Set([...((_i = book.topicCatalog) != null ? _i : []), h.topic.trim()]),
      ];
    }
    this.plugin.diskData.books[book.bookId] = book;
    if (this.bookTitle.trim() && !this.options.book) {
      book.title = this.bookTitle.trim();
    }
    this.plugin.persistDisk().then(async function () {
      if (pushAfter && canPushHighlightToWeread(h)) {
        const pushRes = await _self.plugin.pushHighlightNote(book.bookId, h);
        if (pushRes.ok) {
          new import_obsidian4.Notice("\u2705 \u5DF2\u4FDD\u5B58\u5E76\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66");
        } else {
          new import_obsidian4.Notice(
            "\u5DF2\u4FDD\u5B58\u672C\u5730\uFF0C\u4F46\u63A8\u9001\u5931\u8D25\uFF1A" + formatPushNoteError(pushRes),
            1e4,
          );
        }
      } else {
        new import_obsidian4.Notice("\u5DF2\u4FDD\u5B58\u6458\u5F55");
      }
      _self.onSaved(h);
      _self.close();
    }).catch((err) => {
      console.error("[ReadFlow] persistDisk failed:", err);
      new import_obsidian4.Notice("\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
    });
  }
};
function safeManualId(title) {
  return title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_").slice(0, 40);
}

// src/ui/HighlightPanelView.ts
var READFLOW_VIEW_TYPE = "readflow-highlight-panel";
var RELATION_HINT_OPTIONS = ["\u8865\u5145", "\u91CD\u590D", "\u56E0\u679C", "\u5BF9\u6BD4"];
var ENTITY_RELATION_HINTS = ["\u76F8\u5173", "\u5E08\u5F92", "\u540C\u4E8B", "\u5408\u4F5C", "\u7ADE\u4E89", "\u5BB6\u65CF", "\u5F15\u7528"];
var EntityRelationModal = class extends import_obsidian5.Modal {
  constructor(app, scopeBook, onSave) {
    super(app);
    this.scopeBook = scopeBook;
    this.onSave = onSave;
    this.entries = collectPersonEntries(scopeBook);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("readflow-modal-body", "readflow-entity-rel-modal");
    this.titleEl.setText("\u65B0\u589E\u4EBA\u7269\u5173\u7CFB");
    if (this.entries.length < 1) {
      contentEl.createEl("p", {
        text: "\u8BF7\u5148\u5728\u6458\u5F55\u7F16\u8F91\u4E2D\u6DFB\u52A0\u5B9E\u4F53\u6807\u7B7E\uFF0C\u683C\u5F0F\u5982\u300C\u5BFC\u5E08:\u7EB3\u74E6\u5C14\u300D\uFF08\u9017\u53F7\u5206\u9694\u591A\u4E2A\uFF09\u3002",
        cls: "readflow-muted",
      });
      const okBtn = contentEl.createEl("button", { text: "\u77E5\u9053\u4E86", type: "button" });
      okBtn.classList.add("readflow-btn", "readflow-btn--primary");
      okBtn.addEventListener("click", () => this.close());
      return;
    }
    const form = contentEl.createDiv("readflow-entity-rel-form");
    form.createEl("label", { text: "\u4EBA\u7269 A", cls: "readflow-field-label" });
    const srcSelect = form.createEl("select", { cls: "readflow-select" });
    for (const entry of this.entries) {
      const opt = srcSelect.createEl("option");
      opt.value = entry.value;
      opt.textContent = entry.text;
    }
    form.createEl("label", { text: "\u4EBA\u7269 B", cls: "readflow-field-label" });
    const tgtSelect = form.createEl("select", { cls: "readflow-select" });
    for (const entry of this.entries) {
      const opt2 = tgtSelect.createEl("option");
      opt2.value = entry.value;
      opt2.textContent = entry.text;
    }
    if (this.entries.length > 1) tgtSelect.value = this.entries[1].value;
    form.createEl("label", { text: "\u5173\u7CFB\u7C7B\u578B", cls: "readflow-field-label" });
    const hintSelect = form.createEl("select", { cls: "readflow-select" });
    for (const h of ENTITY_RELATION_HINTS) {
      const ho = hintSelect.createEl("option", { value: h, text: h });
      ho.value = h;
    }
    const customOpt = hintSelect.createEl("option", { value: "__custom", text: "\u81EA\u5B9A\u4E49\u2026" });
    customOpt.value = "__custom";
    const customHint = form.createEl("input", {
      type: "text",
      cls: "readflow-input",
      placeholder: "\u5982\uFF1A\u5E08\u5F92\u3001\u540C\u95E8",
    });
    customHint.style.display = "none";
    hintSelect.addEventListener("change", () => {
      customHint.style.display = hintSelect.value === "__custom" ? "block" : "none";
    });
    form.createEl("label", { text: "\u5173\u7CFB\u8D77\u59CB\u6458\u5F55\uFF08\u53EF\u9009\uFF09", cls: "readflow-field-label" });
    const anchorSelect = form.createEl("select", { cls: "readflow-select" });
    anchorSelect.createEl("option", { value: "", text: "\u65E0\u951A\u70B9" });
    const sortedHl = [...this.scopeBook.highlights].sort(
      (a, b) => chapterSortKey(a) - chapterSortKey(b) || a.createdAt - b.createdAt,
    );
    for (const h of sortedHl) {
      if (!(h.entities || []).length) continue;
      const opt = anchorSelect.createEl("option");
      opt.value = h.id;
      const ch = chapterLabel(h);
      opt.textContent = shortLabel((ch && ch !== "(\u672A\u5206\u7AE0)" ? ch + " \u00B7 " : "") + h.content, 40);
    }
    const actions = contentEl.createDiv("readflow-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", type: "button" });
    cancelBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = actions.createEl("button", { text: "\u4FDD\u5B58", type: "button" });
    saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
    saveBtn.addEventListener("click", () => {
      const source = srcSelect.value.trim();
      const target = tgtSelect.value.trim();
      if (!source || !target) {
        new import_obsidian5.Notice("\u8BF7\u9009\u62E9\u4E24\u4F4D\u4EBA\u7269");
        return;
      }
      if (source === target) {
        new import_obsidian5.Notice("\u8BF7\u9009\u62E9\u4E0D\u540C\u7684\u4E24\u4F4D\u4EBA\u7269");
        return;
      }
      const hint =
        hintSelect.value === "__custom" ? customHint.value.trim() || "\u76F8\u5173" : hintSelect.value;
      const anchorId = anchorSelect.value.trim();
      const anchorHl = anchorId ? sortedHl.find((h) => h.id === anchorId) : null;
      this.onSave(source, target, hint, {
        sinceHighlightId: anchorId || void 0,
        chapterUid: anchorHl ? anchorHl.chapterUid : void 0,
      });
      this.close();
    });
  }
};
var PlotEventModal = class extends import_obsidian5.Modal {
  constructor(app, scopeBook, onSave) {
    super(app);
    this.scopeBook = scopeBook;
    this.onSave = onSave;
    this.entries = collectPersonEntries(scopeBook);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("readflow-modal-body", "readflow-plot-event-modal");
    this.titleEl.setText("\u65B0\u589E\u60C5\u8282\u4E8B\u4EF6");
    const form = contentEl.createDiv("readflow-entity-rel-form");
    form.createEl("label", { text: "\u4E8B\u4EF6\u63CF\u8FF0", cls: "readflow-field-label" });
    const hintInput = form.createEl("input", {
      type: "text",
      cls: "readflow-input",
      placeholder: "\u5982\uFF1A\u9996\u6B21\u76F8\u9047\u3001\u51B2\u7A81\u7206\u53D1",
    });
    form.createEl("label", { text: "\u951A\u5B9A\u6458\u5F55", cls: "readflow-field-label" });
    const hlSelect = form.createEl("select", { cls: "readflow-select" });
    const sortedHl = [...this.scopeBook.highlights].sort(
      (a, b) => chapterSortKey(a) - chapterSortKey(b) || a.createdAt - b.createdAt,
    );
    for (const h of sortedHl) {
      const opt = hlSelect.createEl("option");
      opt.value = h.id;
      const ch = chapterLabel(h);
      opt.textContent = shortLabel((ch && ch !== "(\u672A\u5206\u7AE0)" ? ch + " \u00B7 " : "") + h.content, 44);
    }
    form.createEl("label", { text: "\u53C2\u4E0E\u4EBA\u7269\uFF08\u53EF\u591A\u9009\uFF09", cls: "readflow-field-label" });
    const partHost = form.createDiv("readflow-plot-participants");
    const partChecks = [];
    if (this.entries.length === 0) {
      partHost.createEl("p", { text: "\u6682\u65E0\u4EBA\u7269\u6807\u7B7E\uFF0C\u53EF\u7559\u7A7A\u3002", cls: "readflow-muted" });
    } else {
      for (const entry of this.entries.slice(0, 24)) {
        const row = partHost.createDiv("readflow-plot-participant-row");
        const cb = row.createEl("input", { type: "checkbox" });
        cb.value = entry.value;
        row.createEl("span", { text: entry.text });
        partChecks.push(cb);
      }
    }
    const actions = contentEl.createDiv("readflow-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", type: "button" });
    cancelBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = actions.createEl("button", { text: "\u4FDD\u5B58", type: "button" });
    saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
    saveBtn.addEventListener("click", () => {
      const hint = hintInput.value.trim();
      const atHighlightId = hlSelect.value.trim();
      if (!hint) {
        new import_obsidian5.Notice("\u8BF7\u586B\u5199\u4E8B\u4EF6\u63CF\u8FF0");
        return;
      }
      if (!atHighlightId) {
        new import_obsidian5.Notice("\u8BF7\u9009\u62E9\u951A\u5B9A\u6458\u5F55");
        return;
      }
      const anchorHl = sortedHl.find((h) => h.id === atHighlightId);
      const participants = partChecks.filter((cb) => cb.checked).map((cb) => cb.value);
      this.onSave({
        hint,
        atHighlightId,
        participants,
        chapterUid: anchorHl ? anchorHl.chapterUid : void 0,
      });
      this.close();
    });
  }
};
function bookRecencyTimestamp(b) {
  if (b.lastSync && b.lastSync > 0) return b.lastSync;
  let maxH = 0;
  for (const h of b.highlights) {
    if (h.createdAt > maxH) maxH = h.createdAt;
  }
  return maxH;
}
function filterBooksByQuery(books, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return books;
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q) ||
      b.bookId.toLowerCase().includes(q),
  );
}
function buildBooksForSelect(sortedBooks, query) {
  if (!String(query || "").trim()) {
    return [...sortedBooks];
  }
  return filterBooksByQuery(sortedBooks, query);
}
function repopulateBookSelect(select, booksForSelect, selectedBookId, options = {}) {
  const searchActive = Boolean(options.searchActive);
  select.empty();
  if (booksForSelect.length === 0) {
    const opt = select.createEl("option", { text: "\u65E0\u5339\u914D\u4E66\u7C4D" });
    opt.disabled = true;
    opt.value = "";
    return;
  }
  if (searchActive) {
    const placeholder = select.createEl("option", { text: "\u8BF7\u9009\u62E9\u5339\u914D\u4E66\u7C4D\u2026" });
    placeholder.value = "";
  }
  for (const b of booksForSelect) {
    const syncDate = b.lastSync
      ? new Date(b.lastSync).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
      : "\u672A\u540C\u6B65";
    const opt = select.createEl("option", { text: `${b.title} \xB7 ${b.highlights.length} \u6761 \xB7 ${syncDate}` });
    opt.value = b.bookId;
  }
  if (searchActive) {
    select.value = "";
  } else if (booksForSelect.some((b) => b.bookId === selectedBookId)) {
    select.value = selectedBookId;
  }
}
function attachDetachedPanelResize(panel) {
  if (!(panel instanceof HTMLElement)) return;
  var MIN_W = 320,
    MIN_H = 240;
  var savedW = parseInt(localStorage.getItem("readflow.detachedW") || "440", 10);
  var savedH = parseInt(localStorage.getItem("readflow.detachedH") || "0", 10);
  var clampDim = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };
  panel.style.width = clampDim(savedW, MIN_W, window.innerWidth - 24) + "px";
  if (savedH > 0) {
    panel.style.height = clampDim(savedH, MIN_H, window.innerHeight - 48) + "px";
  }
  var existing = panel.querySelector(".readflow-detached-resize-grip");
  if (existing) existing.remove();
  var grip = document.createElement("div");
  grip.className = "readflow-detached-resize-grip";
  grip.setAttribute("title", "\u62D6\u62FD\u8C03\u6574\u7A97\u53E3\u5927\u5C0F");
  panel.appendChild(grip);
  grip.addEventListener("mousedown", function (e) {
    e.preventDefault();
    e.stopPropagation();
    grip.classList.add("is-dragging");
    var startX = e.clientX,
      startY = e.clientY;
    var startW = panel.offsetWidth,
      startH = panel.offsetHeight;
    var onMove = function (ev) {
      var nw = clampDim(startW + ev.clientX - startX, MIN_W, window.innerWidth - 24);
      var nh = clampDim(startH + ev.clientY - startY, MIN_H, window.innerHeight - 48);
      panel.style.width = nw + "px";
      panel.style.height = nh + "px";
    };
    var onUp = function () {
      grip.classList.remove("is-dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      localStorage.setItem("readflow.detachedW", String(panel.offsetWidth));
      localStorage.setItem("readflow.detachedH", String(panel.offsetHeight));
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}
function resolveMindMapModalBox(modal) {
  if (!modal) return null;
  var el = modal.modalEl;
  if (!(el instanceof HTMLElement)) return null;
  var inner = el.querySelector(".modal");
  if (inner instanceof HTMLElement) return inner;
  var fromContent = modal.contentEl && modal.contentEl.closest(".modal");
  if (fromContent instanceof HTMLElement) return fromContent;
  return el;
}
function applyMindMapModalDimensions(containerEl, innerBox, w, h) {
  var pxW = w + "px";
  var pxH = h + "px";
  if (containerEl instanceof HTMLElement) {
    containerEl.style.width = pxW;
    containerEl.style.height = pxH;
    containerEl.style.maxWidth = "96vw";
    containerEl.style.maxHeight = "92vh";
  }
  if (innerBox instanceof HTMLElement) {
    innerBox.style.width = "100%";
    innerBox.style.height = "100%";
    innerBox.style.maxWidth = "96vw";
    innerBox.style.maxHeight = "92vh";
  }
}
function attachMindMapModalResize(modal) {
  var containerEl = modal && modal.modalEl;
  var modalBox = resolveMindMapModalBox(modal);
  if (!(modalBox instanceof HTMLElement)) {
    console.warn("[ReadFlow] attachMindMapModalResize: modal box not found");
    return null;
  }
  var MIN_W = 600,
    MIN_H = 400;
  var savedW = parseInt(localStorage.getItem("readflow.mmModalW") || "1100", 10);
  var savedH = parseInt(localStorage.getItem("readflow.mmModalH") || "720", 10);
  var clampDim = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };
  var applySize = function (w, h) {
    var cw = clampDim(w, MIN_W, window.innerWidth * 0.96);
    var ch = clampDim(h, MIN_H, window.innerHeight * 0.92);
    applyMindMapModalDimensions(containerEl, modalBox, cw, ch);
    modalBox.dispatchEvent(new CustomEvent("readflow-mm-resize"));
    return { w: cw, h: ch };
  };
  applySize(savedW, savedH);
  var existing = modalBox.querySelector(".readflow-mm-modal-resize-grip");
  if (existing) existing.remove();
  var grip = modalBox.createDiv("readflow-mm-modal-resize-grip");
  grip.setAttribute("title", "\u62D6\u62FD\u8C03\u6574\u7A97\u53E3\u5927\u5C0F");
  grip.addEventListener("mousedown", function (e) {
    e.preventDefault();
    e.stopPropagation();
    grip.classList.add("is-dragging");
    var startX = e.clientX,
      startY = e.clientY;
    var startW = modalBox.offsetWidth,
      startH = modalBox.offsetHeight;
    var onMove = function (ev) {
      applySize(startW + ev.clientX - startX, startH + ev.clientY - startY);
    };
    var onUp = function () {
      grip.classList.remove("is-dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      localStorage.setItem("readflow.mmModalW", String(modalBox.offsetWidth));
      localStorage.setItem("readflow.mmModalH", String(modalBox.offsetHeight));
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
  return modalBox;
}
function buildRelationGraphModel(book, scopeBook, opts) {
  var _a, _b;
  var base = (opts && opts.base) || "book";
  var lens = (opts && opts.lens) || "all";
  var topicFilter = ((opts && opts.topic) || "").trim();
  var focusEntity = ((opts && opts.entity) || "").trim();
  if (lens === "people") base = "entity";
  var highlights = applyMindMapLens(scopeBook.highlights, lens);
  if (base === "topic" && topicFilter) {
    highlights = highlights.filter(function (h) {
      var t = (h.topic || "").trim() || "\u672A\u5F52\u7C7B";
      return t === topicFilter;
    });
  }
  var nodeMap = /* @__PURE__ */ new Map();
  var edges = [];
  var usingTopicFallback = false;
  var entityLabelLookup = buildEntityLabelLookup(scopeBook);
  var aliasMap = buildEntityAliasMap(book);
  var addHl = function (h) {
    if (!h || nodeMap.has(h.id)) return;
    nodeMap.set(h.id, {
      id: h.id,
      label: h.content.slice(0, 10) + (h.content.length > 10 ? "\u2026" : ""),
      kind: "highlight",
      type: h.highlightType,
      status: h.status,
      highlight: h,
    });
  };
  var addEnt = function (name) {
    var id = entityEntIdForGraph(name, aliasMap, entityLabelLookup);
    if (nodeMap.has(id)) return;
    nodeMap.set(id, {
      id: id,
      label: shortLabel(entityGraphLabel(name, entityLabelLookup), 8),
      kind: "entity",
      type: null,
      status: null,
    });
  };
  var addBookEntityRelations = function () {
    for (var er of book.entityRelations || []) {
      if (!er || !er.source || !er.target) continue;
      addEnt(er.source);
      addEnt(er.target);
      edges.push({
        source: entityEntIdForGraph(er.source, aliasMap, entityLabelLookup),
        target: entityEntIdForGraph(er.target, aliasMap, entityLabelLookup),
        hint: relationEdgeHint(er, book),
        dim: false,
        evolution: !!er.sinceHighlightId,
      });
    }
  };
  if (base === "entity") {
    for (var i = 0; i < highlights.length; i++) {
      var h = highlights[i];
      var ents = (h.entities || []).map(function (e) {
        return e.trim();
      }).filter(Boolean);
      if (ents.length === 0) continue;
      addHl(h);
      for (var j = 0; j < ents.length; j++) {
        addEnt(ents[j]);
        edges.push({
          source: entityEntIdForGraph(ents[j], aliasMap, entityLabelLookup),
          target: h.id,
          hint: "\u63D0\u53CA",
          dim: false,
        });
      }
      for (var a = 0; a < ents.length; a++) {
        for (var b = a + 1; b < ents.length; b++) {
          edges.push({
            source: entityEntIdForGraph(ents[a], aliasMap, entityLabelLookup),
            target: entityEntIdForGraph(ents[b], aliasMap, entityLabelLookup),
            hint: "\u5171\u73B0",
            dim: false,
          });
        }
      }
    }
    for (var k = 0; k < highlights.length; k++) {
      var hs = highlights[k];
      for (var r = 0; r < (((_a = hs.relations) == null ? void 0 : _a.length) || 0); r++) {
        var rel = hs.relations[r];
        var tgt = book.highlights.find(function (x) {
          return x.id === rel.targetId;
        });
        if (!tgt || !highlights.find(function (x) {
          return x.id === tgt.id;
        })) continue;
        addHl(hs);
        addHl(tgt);
        edges.push({ source: hs.id, target: rel.targetId, hint: rel.hint, dim: false });
      }
    }
    addBookEntityRelations();
    if (focusEntity) {
      var fid = entityEntIdForGraph(focusEntity, aliasMap, entityLabelLookup);
      var fl = entityCanonicalKey(focusEntity);
      for (var _iter = nodeMap.entries(), _step = _iter.next(); !_step.done; _step = _iter.next()) {
        var entry = _step.value;
        if (!entry[0].startsWith("ent:")) continue;
        var nodeLabel = entry[1] && entry[1].label ? entry[1].label : entry[0].slice(4);
        if (entityCanonicalKey(nodeLabel) === fl || entry[0].slice(4).toLowerCase() === fl) fid = entry[0];
      }
      var keep = /* @__PURE__ */ new Set([fid]);
      for (var ei = 0; ei < edges.length; ei++) {
        var e = edges[ei];
        if (e.source === fid || e.target === fid) {
          keep.add(e.source);
          keep.add(e.target);
        }
      }
      for (var nk of [...nodeMap.keys()]) {
        if (!keep.has(nk)) nodeMap.delete(nk);
      }
      edges = edges.filter(function (e2) {
        return nodeMap.has(e2.source) && nodeMap.has(e2.target);
      });
    }
    if (lens === "people") {
      for (var nk of [...nodeMap.keys()]) {
        var nd = nodeMap.get(nk);
        if (!nd || nd.kind !== "entity") nodeMap.delete(nk);
      }
      edges = edges.filter(function (e3) {
        return e3.source.startsWith("ent:") && e3.target.startsWith("ent:");
      });
    }
  } else {
    for (var hi = 0; hi < highlights.length; hi++) {
      var h2 = highlights[hi];
      for (var ri = 0; ri < (((_b = h2.relations) == null ? void 0 : _b.length) || 0); ri++) {
        var rel2 = h2.relations[ri];
        addHl(h2);
        addHl(book.highlights.find(function (x) {
          return x.id === rel2.targetId;
        }));
        edges.push({ source: h2.id, target: rel2.targetId, hint: rel2.hint, dim: false });
      }
    }
    if (nodeMap.size === 0 && lens !== "ideas" && lens !== "people") {
      var topicGroups = /* @__PURE__ */ new Map();
      for (var ti = 0; ti < highlights.length; ti++) {
        var ht = highlights[ti];
        var tk = (ht.topic || "").trim();
        if (!tk) continue;
        if (!topicGroups.has(tk)) topicGroups.set(tk, []);
        topicGroups.get(tk).push(ht);
      }
      for (var _pair of topicGroups) {
        var group = _pair[1];
        if (group.length < 2) continue;
        usingTopicFallback = true;
        for (var gi = 0; gi < group.length - 1; gi++) {
          addHl(group[gi]);
          addHl(group[gi + 1]);
          edges.push({ source: group[gi].id, target: group[gi + 1].id, hint: "\u540C\u4E3B\u9898", dim: true });
        }
      }
      if (lens !== "ideas") {
        var entityGroups = /* @__PURE__ */ new Map();
        for (var ei2 = 0; ei2 < highlights.length; ei2++) {
          var he = highlights[ei2];
          for (var ej = 0; ej < (he.entities || []).length; ej++) {
            var ek = he.entities[ej].toLowerCase().trim();
            if (!ek) continue;
            if (!entityGroups.has(ek)) entityGroups.set(ek, []);
            entityGroups.get(ek).push(he);
          }
        }
        for (var _ep of entityGroups) {
          var entKey = _ep[0];
          var eg = _ep[1];
          if (eg.length < 2) continue;
          usingTopicFallback = true;
          var lbl = entKey.length > 6 ? entKey.slice(0, 6) : entKey;
          for (var egI = 0; egI < eg.length - 1; egI++) {
            addHl(eg[egI]);
            addHl(eg[egI + 1]);
            edges.push({ source: eg[egI].id, target: eg[egI + 1].id, hint: lbl, dim: true });
          }
        }
      }
    }
  }
  var emptyMsg =
    lens === "people"
      ? "\u6682\u65E0\u4EBA\u7269\u6807\u7B7E\u3002\u8BF7\u7528\u300C\u89D2\u8272:\u540D\u5B57\u300D\u6807\u6CE8\u6458\u5F55\uFF0C\u5E76\u70B9\u300C\u65B0\u589E\u4EBA\u7269\u5173\u7CFB\u300D\u3002"
      : lens === "ideas"
        ? "\u6682\u65E0\u53EF\u68B3\u7406\u6458\u5F55\u3002\u5207\u6362\u5230\u300C\u5168\u4E66\u7ED3\u6784\u300D\u53EF\u67E5\u770B\u6240\u6709\u5185\u5BB9\u3002"
        : base === "entity"
          ? "\u6682\u65E0\u5B9E\u4F53\u6807\u7B7E\u3002\u8BF7\u5728\u6458\u5F55\u4E2D\u6DFB\u52A0 entities\uFF08\u5982\u4EBA\u540D\uFF09\u3002"
          : "\u9009\u4E2D\u6458\u5F55 \u2192 \u5EFA\u7ACB\u5173\u7CFB\uFF0C\u6216\u8BBE\u7F6E\u76F8\u540C\u4E3B\u9898/\u5B9E\u4F53\u540E\u81EA\u52A8\u751F\u6210";
  return {
    nodes: [...nodeMap.values()],
    edges: edges,
    usingTopicFallback: usingTopicFallback,
    emptyMsg: emptyMsg,
  };
}
function renderRelationGraphCanvas(container, book, scopeBook, opts) {
  var model = buildRelationGraphModel(book, scopeBook, opts);
  if (model.nodes.length === 0) {
    container.createEl("p", { text: model.emptyMsg, cls: "readflow-muted" });
    return null;
  }
  var expanded = opts && opts.expanded;
  var wrap = container.createDiv("readflow-graph-wrap");
  if (expanded) wrap.addClass("readflow-graph-wrap--expanded");
  var canvas = wrap.createEl("canvas", { cls: "readflow-graph-canvas" });
  var _gcr = wrap.getBoundingClientRect();
  var W = _gcr.width > 0 ? _gcr.width : container.getBoundingClientRect().width || 340;
  var H =
    expanded && _gcr.height > 0
      ? _gcr.height
      : expanded
        ? Math.max(400, container.getBoundingClientRect().height - 40, 260)
        : _gcr.height > 0
          ? _gcr.height
          : 260;
  canvas.width = W;
  canvas.height = H;
  var nodes = model.nodes.map(function (n) {
    return {
      id: n.id,
      label: n.label,
      kind: n.kind,
      type: n.type,
      status: n.status,
      highlight: n.highlight,
      x: W / 2 + (Math.random() - 0.5) * W * 0.55,
      y: H / 2 + (Math.random() - 0.5) * H * 0.55,
      vx: 0,
      vy: 0,
    };
  });
  var edges = model.edges.slice();
  var nodeMap = new Map(nodes.map(function (n) {
    return [n.id, n];
  }));
  var REPULSE = 2800,
    SPRING = 0.025,
    IDEAL = 75,
    GRAV = 0.01;
  var cx = W / 2,
    cy = H / 2;
  for (var iter = 0; iter < 280; iter++) {
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i],
          b = nodes[j];
        var dx = b.x - a.x,
          dy = b.y - a.y;
        var dist2 = dx * dx + dy * dy + 1;
        var dist = Math.sqrt(dist2);
        var f = REPULSE / dist2;
        var fx = (dx / dist) * f,
          fy = (dy / dist) * f;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
    for (var ei = 0; ei < edges.length; ei++) {
      var edge = edges[ei];
      var s = nodeMap.get(edge.source),
        t = nodeMap.get(edge.target);
      if (!s || !t) continue;
      var dx2 = t.x - s.x,
        dy2 = t.y - s.y;
      var dist3 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      var f2 = (dist3 - IDEAL) * SPRING;
      var fx2 = (dx2 / dist3) * f2,
        fy2 = (dy2 / dist3) * f2;
      s.vx += fx2;
      s.vy += fy2;
      t.vx -= fx2;
      t.vy -= fy2;
    }
    for (var ni = 0; ni < nodes.length; ni++) {
      var n = nodes[ni];
      n.vx += (cx - n.x) * GRAV;
      n.vy += (cy - n.y) * GRAV;
      n.vx *= 0.82;
      n.vy *= 0.82;
      n.x = Math.max(20, Math.min(W - 20, n.x + n.vx));
      n.y = Math.max(18, Math.min(H - 18, n.y + n.vy));
    }
  }
  var TYPE_COLORS = {
    idea: "#6366f1",
    method: "#0891b2",
    example: "#059669",
    conclusion: "#dc2626",
    question: "#d97706",
  };
  var HINT_COLORS = {
    "\u8865\u5145": "#059669",
    "\u56E0\u679C": "#dc2626",
    "\u5BF9\u6BD4": "#d97706",
    "\u91CD\u590D": "#94a3b8",
    "\u540C\u4E3B\u9898": "#8b5cf6",
    "\u5171\u73B0": "#ec4899",
    "\u63D0\u53CA": "#6366f1",
    "\u5173\u7CFB": "#ec4899",
    "\u76F8\u5173": "#ec4899",
    "\u5E08\u5F92": "#f97316",
    "\u540C\u4E8B": "#06b6d4",
    "\u5408\u4F5C": "#059669",
    "\u7ADE\u4E89": "#dc2626",
    "\u5BB6\u65CF": "#a855f7",
    "\u5F15\u7528": "#6366f1",
  };
  var scale = 1,
    tx = 0,
    ty = 0;
  var hoveredNode = null,
    activeNode = null;
  var isPanning = false;
  var panOrigin = { x: 0, y: 0 };
  var getColor = function (node) {
    if (node.kind === "entity") return "#ec4899";
    if (node.status && STATUS_COLORS[node.status]) return STATUS_COLORS[node.status];
    if (!node.type) return "#94a3b8";
    return TYPE_COLORS[node.type] || "#6366f1";
  };
  var drawRoundRect = function (ctx, x, y, w, h, r) {
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
  var draw = function () {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var isDark = document.body.classList.contains("theme-dark");
    var bg = isDark ? "#0f172a" : "#f8fafc";
    var nodeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)";
    var labelColor = "#ffffff";
    var mutedEdge = isDark ? "#334155" : "#cbd5e1";
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    for (var ei2 = 0; ei2 < edges.length; ei2++) {
      var edge2 = edges[ei2];
      var s2 = nodeMap.get(edge2.source),
        t2 = nodeMap.get(edge2.target);
      if (!s2 || !t2) continue;
      var isConnected = activeNode && (activeNode.id === edge2.source || activeNode.id === edge2.target);
      var dx4 = t2.x - s2.x,
        dy4 = t2.y - s2.y;
      var dist4 = Math.sqrt(dx4 * dx4 + dy4 * dy4) || 1;
      var nx = dx4 / dist4,
        ny = dy4 / dist4;
      var R2 = s2.kind === "entity" ? 16 : 14;
      var R2t = t2.kind === "entity" ? 16 : 14;
      var sx = s2.x + nx * R2,
        sy = s2.y + ny * R2;
      var ex = t2.x - nx * R2t,
        ey = t2.y - ny * R2t;
      var color = isConnected ? HINT_COLORS[edge2.hint] || "#6366f1" : edge2.dim ? "#8b5cf6" : mutedEdge;
      ctx.strokeStyle = color;
      ctx.lineWidth = (isConnected ? 2 : 1.2) / scale;
      ctx.globalAlpha = isConnected ? 0.9 : activeNode ? 0.2 : edge2.dim ? 0.3 : 0.55;
      if (edge2.dim) ctx.setLineDash([4 / scale, 4 / scale]);
      else if (edge2.evolution) ctx.setLineDash([5 / scale, 3 / scale]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);
      if (isConnected) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = color;
        ctx.font = `${10 / scale}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(edge2.hint, (s2.x + t2.x) / 2, (s2.y + t2.y) / 2 - 6 / scale);
      }
    }
    ctx.globalAlpha = 1;
    for (var ni2 = 0; ni2 < nodes.length; ni2++) {
      var node = nodes[ni2];
      var isHov = node === hoveredNode;
      var isActive = node === activeNode;
      var baseR = node.kind === "entity" ? 16 : 14;
      var nr = isHov || isActive ? baseR * 1.35 : baseR;
      var color2 = getColor(node);
      var faded =
        activeNode &&
        !isActive &&
        !edges.some(function (e) {
          return (e.source === activeNode.id && e.target === node.id) || (e.target === activeNode.id && e.source === node.id);
        });
      ctx.globalAlpha = faded ? 0.25 : 1;
      ctx.fillStyle = color2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${9 / scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  var reflowGraph = function () {
    var nw = wrap.getBoundingClientRect().width;
    var nh = wrap.getBoundingClientRect().height;
    var changed = false;
    if (nw > 0 && nw !== canvas.width) {
      W = nw;
      canvas.width = W;
      changed = true;
    }
    if (expanded && nh > 0 && nh !== canvas.height) {
      H = nh;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
      changed = true;
    }
    if (changed) draw();
  };
  draw();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      reflowGraph();
    });
  });
  canvas.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      var f = e.deltaY > 0 ? 0.88 : 1.14;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      tx = mx - (mx - tx) * f;
      ty = my - (my - ty) * f;
      scale = Math.max(0.15, Math.min(scale * f, 6));
      draw();
      if (opts && opts.onScaleChange) opts.onScaleChange(scale);
    },
    { passive: false },
  );
  canvas.addEventListener("mousedown", function (e) {
    if (e.button === 0) {
      isPanning = true;
      panOrigin = { x: e.clientX - tx, y: e.clientY - ty };
    }
  });
  canvas.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - tx) / scale;
    var my = (e.clientY - rect.top - ty) / scale;
    if (isPanning) {
      tx = e.clientX - panOrigin.x;
      ty = e.clientY - panOrigin.y;
      draw();
      return;
    }
    var found = null;
    for (var i2 = 0; i2 < nodes.length; i2++) {
      var n2 = nodes[i2];
      var br = n2.kind === "entity" ? 18 : 16;
      if (Math.hypot(n2.x - mx, n2.y - my) < br) {
        found = n2;
        break;
      }
    }
    if (found !== hoveredNode) {
      hoveredNode = found;
      canvas.style.cursor = found ? "pointer" : "grab";
      draw();
    }
  });
  canvas.addEventListener("mouseup", function () {
    isPanning = false;
  });
  canvas.addEventListener("mouseleave", function () {
    isPanning = false;
    hoveredNode = null;
    draw();
  });
  var ro = new ResizeObserver(reflowGraph);
  ro.observe(wrap);
  var controls = {
    zoomIn: function () {
      var f = 1.14;
      tx = W / 2 - (W / 2 - tx) * f;
      ty = H / 2 - (H / 2 - ty) * f;
      scale = Math.min(scale * f, 6);
      draw();
      if (opts && opts.onScaleChange) opts.onScaleChange(scale);
    },
    zoomOut: function () {
      var f = 0.88;
      tx = W / 2 - (W / 2 - tx) * f;
      ty = H / 2 - (H / 2 - ty) * f;
      scale = Math.max(scale * f, 0.15);
      draw();
      if (opts && opts.onScaleChange) opts.onScaleChange(scale);
    },
    resetView: function () {
      scale = 1;
      tx = 0;
      ty = 0;
      draw();
      if (opts && opts.onScaleChange) opts.onScaleChange(scale);
    },
    reflow: reflowGraph,
    getScale: function () {
      return scale;
    },
  };
  wrap.readflowMmControls = controls;
  return controls;
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
    this.listTimeDir = (localStorage.getItem("readflow.listTimeDir") || "desc") === "asc" ? "asc" : "desc";
    this.listTopicDir = (localStorage.getItem("readflow.listTopicDir") || "asc") === "asc" ? "asc" : "desc";
    this.selectedKnowledgeTopic = null;
    initMindMapModeFromStorage(this);
    this.bookSearchQuery = "";
    this._bookSearchTimer = null;
    this.sidebarCollapsed = localStorage.getItem("readflow.sidebarCollapsed") === "true";
    this.topbarMinimized = localStorage.getItem("readflow.topbarMinimized") !== "false";
    this.topicSectionCollapsed = localStorage.getItem("readflow.topicCollapsed") !== "false";
    this.boardSectionCollapsed = localStorage.getItem("readflow.boardCollapsed") !== "false";
    this.knowledgePaneWidth = parseInt(localStorage.getItem("readflow.knowledgePaneWidth") || "420", 10);
    this.listDetached = false;
    this.detachedPanel = null;
    this.selectedBoardFilter = null;
    this.searchQuery = "";
    this._searchTimer = null;
    this.listContainerEl = null;
    this.listSummaryEl = null;
    this._shellRo = null;
    this.currentBook = null;
    this.currentTree = null;
    this.bookSortMode = localStorage.getItem("readflow.bookSort") === "name" ? "name" : "recent";
    this.bookSortTimeDir = localStorage.getItem("readflow.bookSortTimeDir") === "asc" ? "asc" : "desc";
    this.bookSortNameDir = localStorage.getItem("readflow.bookSortNameDir") === "desc" ? "desc" : "asc";
    this.bookSortCountDir = localStorage.getItem("readflow.bookSortCountDir") === "asc" ? "asc" : "desc";
    this.expandedHighlightId = null;
    this.hoverTimeoutId = null;
    this.hoverCardId = null;
    this.shouldRestoreScroll = false;
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
    this.expandedHighlightId = null;
    this.hoverCardId = null;
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = null;
    }
    if (this.detachedPanel) {
      this.detachedPanel.remove();
      this.detachedPanel = null;
    }
    this.listContainerEl = null;
    this.listSummaryEl = null;
    this.contentEl.empty();
    this.contentEl.classList.add("readflow-panel-root");
    const renderNonce = (this._renderNonce || 0) + 1;
    this._renderNonce = renderNonce;
    console.log("[ReadFlow] render() called, nonce:", renderNonce);
    const books = Object.values(this.plugin.diskData.books).sort((x, y) => x.title.localeCompare(y.title));
    this.renderTopbar();
    if (books.length === 0) {
      const empty = this.contentEl.createDiv("readflow-empty");
      empty.createEl("p", { text: "\u6682\u65E0\u540C\u6B65\u6570\u636E", cls: "readflow-empty-title" });
      empty.createEl("p", {
        text: "\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u5FAE\u4FE1\u8BFB\u4E66 Cookie\uFF0C\u5E76\u6267\u884C\u300C\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66\u300D\u6216\u4F7F\u7528\u547D\u4EE4\u9762\u677F\u641C\u7D22 ReadFlow\u3002",
        cls: "readflow-empty-desc",
      });
      return;
    }
    const selectedId = localStorage.getItem("readflow.selectedBookId");
    const validBook = books.find((item) => item.bookId === selectedId);
    const book = validBook ? validBook : (books[0] || null);
    if (!book) return;
    if (!validBook && selectedId) {
      console.warn("[ReadFlow] selectedBookId \u6307\u5411\u7684\u4E66\u7C4D\u5DF2\u4E0D\u5B58\u5728\uFF0C\u56DE\u9000\u5230\u7B2C\u4E00\u672C\u4E66\u3002", selectedId);
    }
    const tree = buildChapterTree(book.highlights);
    this.currentBook = book;
    this.currentTree = tree;
    const wbProfile = maybeApplyBookWorkbenchProfile(this, book);
    if (wbProfile && wbProfile.label) {
      new import_obsidian5.Notice("\u5DF2\u5207\u6362\u5230\u300C" + wbProfile.label + "\u300D\u5DE5\u4F5C\u53F0\uFF1A" + wbProfile.reason, 5e3);
    }
    const inboxCount = book.highlights.filter((h) => h.status === "inbox").length;
    const reviewingCount = book.highlights.filter((h) => h.status === "reviewing").length;
    const draftedCount = book.highlights.filter((h) => h.status === "drafted").length;
    const processedCount = book.highlights.filter((h) => h.status === "processed").length;
    const shell = this.contentEl.createDiv("readflow-shell");
    if (this.sidebarCollapsed) shell.classList.add("readflow-shell--sidebar-collapsed");
    const sidebar = shell.createDiv("readflow-sidebar");
    if (this.sidebarCollapsed) sidebar.classList.add("readflow-sidebar--collapsed");
    const workspace = shell.createDiv("readflow-workspace");
    this.renderWorkspace(workspace, book, tree);
    this.renderSidebar(sidebar, books, book, tree, inboxCount, reviewingCount, draftedCount, processedCount);
    this.renderVisibleList(book, tree);
    // Guard: prevent Obsidian layout-change from collapsing content-grid.
    // Strategy: observe contentEl (ItemView root) and detect extreme squish.
    // Also observe the shell itself. If either signals collapse, pin the shell's height.
    const cg = this.contentEl.querySelector(".readflow-content-grid");
    if (cg instanceof HTMLElement) {
      if (this._shellRo) this._shellRo.disconnect();
      let goodShellH = shell.getBoundingClientRect().height;
      const MIN_SHELL_H = 400;
      const lockShell = () => {
        if (shell.getBoundingClientRect().height < MIN_SHELL_H && goodShellH >= MIN_SHELL_H) {
          shell.style.height = `${goodShellH}px`;
        } else if (shell.getBoundingClientRect().height >= MIN_SHELL_H) {
          goodShellH = shell.getBoundingClientRect().height;
        }
      };
      this._shellRo = new ResizeObserver((entries) => {
        for (const _e of entries) {
          lockShell();
        }
      });
      this._shellRo.observe(shell);
    }
  }
  renderVisibleList(book, tree) {
    const visible = this.getVisibleHighlights(book, tree);
    const listEl = this.listDetached
      ? this.detachedPanel == null
        ? null
        : this.detachedPanel.querySelector(".readflow-card-list")
      : this.listContainerEl;
    const pct =
      listEl instanceof HTMLElement && listEl.scrollHeight > listEl.clientHeight
        ? listEl.scrollTop / (listEl.scrollHeight - listEl.clientHeight)
        : 0;
    this._scrollRestoreEl = listEl instanceof HTMLElement ? listEl : null;
    this._scrollRestorePct = pct;
    this.shouldRestoreScroll = true;
    this._updateSortBtnDirs();
    this.renderListForBook(book, tree, visible, this.selectedChapter);
    this.renderKnowledgeInspector(book, visible);
  }
  _updateSortBtnDirs() {
    const header = this.listDetached
      ? this.detachedPanel == null ? null : this.detachedPanel.querySelector(".readflow-detached-panel-header")
      : this.contentEl == null ? null : this.contentEl.querySelector(".readflow-list-header");
    if (!header) return;
    const timeBtn = header.querySelector(".readflow-book-sort-compound__icon")?.parentElement;
    const topicBtn = timeBtn ? timeBtn.nextElementSibling : null;
    if (timeBtn) {
      const timeDir = timeBtn.querySelector(".readflow-book-sort-compound__dir");
      const isTimeActive = this.listOrderMode === "time";
      timeBtn.classList.toggle("readflow-btn--ghost", !isTimeActive);
      timeBtn.classList.toggle("readflow-book-sort-btn--active", isTimeActive);
      timeBtn.title = isTimeActive
        ? `\u65F6\u95F4\u6392\u5E8F \xB7 ${this.listTimeDir === "desc" ? "\u65B0\u2192\u65E7" : "\u65E7\u2192\u65B0"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
        : "\u6309\u65F6\u95F4\u6392\u5E8F";
      if (timeDir) {
        if (isTimeActive) {
          timeDir.textContent = sortDirArrow(this.listTimeDir);
          timeDir.classList.remove("readflow-book-sort-compound__dir--hidden");
        } else {
          timeDir.classList.add("readflow-book-sort-compound__dir--hidden");
        }
      }
    }
    if (topicBtn) {
      const topicDir = topicBtn.querySelector(".readflow-book-sort-compound__dir");
      const isTopicActive = this.listOrderMode === "topic";
      topicBtn.classList.toggle("readflow-btn--ghost", !isTopicActive);
      topicBtn.classList.toggle("readflow-book-sort-btn--active", isTopicActive);
      topicBtn.title = isTopicActive
        ? `\u4E3B\u9898\u6392\u5E8F \xB7 ${this.listTopicDir === "asc" ? "A\u2192Z" : "Z\u2192A"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
        : "\u6309\u4E3B\u9898\u6392\u5E8F";
      if (topicDir) {
        if (isTopicActive) {
          topicDir.textContent = this.listTopicDir === "asc" ? "\u2191" : "\u2193";
          topicDir.classList.remove("readflow-book-sort-compound__dir--hidden");
        } else {
          topicDir.classList.add("readflow-book-sort-compound__dir--hidden");
        }
      }
    }
  }
  getVisibleHighlights(book, tree) {
    var _a, _b;
    console.log(
      "[ReadFlow] getVisibleHighlights",
      "selectedChapter:", this.selectedChapter,
      "selectedBoardFilter:", this.selectedBoardFilter,
      "selectedTopic:", this.selectedTopic,
      "onlyInbox:", this.onlyInbox,
      "searchQuery:", this.searchQuery,
      "tree.length:", tree.length,
      "book.highlights.length:", book.highlights.length,
    );
    const source =
      this.selectedChapter == null
        ? book.highlights
        : (_b = (_a = tree.find((node) => node.chapter === this.selectedChapter)) == null ? void 0 : _a.highlights) !=
            null
          ? _b
          : [];
    if (this.selectedBoardFilter != null) {
      const bf = this.selectedBoardFilter;
      if (STATUS_FLOW.includes(bf)) {
        return source.filter((h) => h.status === bf && this._matchesSearch(h));
      }
      return source.filter((h) => {
        if (bf === "inbox") return (h.status === "inbox" || !h.highlightType) && this._matchesSearch(h);
        return h.highlightType === bf && this._matchesSearch(h);
      });
    }
    return source.filter((h) => {
      if (this.onlyInbox && h.status !== "inbox") return false;
      if (this.selectedTopic && (h.topic || "") !== this.selectedTopic) return false;
      return this._matchesSearch(h);
    });
  }
  _matchesSearch(h) {
    if (!this.searchQuery) return true;
    const q = this.searchQuery.toLowerCase();
    return (
      (h.content || "").toLowerCase().includes(q) ||
      (h.note || "").toLowerCase().includes(q) ||
      (h.topic || "").toLowerCase().includes(q) ||
      (h.highlightType || "").toLowerCase().includes(q) ||
      (h.chapter || "").toLowerCase().includes(q) ||
      (h.entities || []).some((e) => e.toLowerCase().includes(q))
    );
  }
  renderTopbar() {
    this.mountTopbar();
  }
  setTopbarHidden(hidden) {
    this.topbarMinimized = hidden;
    localStorage.setItem("readflow.topbarMinimized", String(hidden));
    this.mountTopbar();
  }
  mountTopbar() {
    this.contentEl.querySelector(".readflow-topbar")?.remove();
    const topbar = this.contentEl.createDiv("readflow-topbar");
    if (this.contentEl.firstChild !== topbar) {
      this.contentEl.insertBefore(topbar, this.contentEl.firstChild);
    }
    this.populateTopbar(topbar);
  }
  populateTopbar(topbar) {
    if (this.topbarMinimized) {
      topbar.classList.add("readflow-topbar--hidden");
      const revealBtn = topbar.createEl("button", { type: "button" });
      revealBtn.classList.add("readflow-topbar-reveal");
      revealBtn.setAttribute("aria-label", "\u5C55\u5F00\u9876\u680F");
      revealBtn.setAttribute("title", "\u5C55\u5F00\u9876\u680F\u5DE5\u5177\u680F");
      const revealIcon = revealBtn.createSpan({ cls: "readflow-topbar-reveal__icon" });
      (0, import_obsidian5.setIcon)(revealIcon, "chevron-down");
      revealBtn.createSpan({ text: "\u663E\u793A\u5DE5\u5177\u680F", cls: "readflow-topbar-reveal__label" });
      revealBtn.addEventListener("click", () => this.setTopbarHidden(false));
      return;
    }
    const brand = topbar.createDiv("readflow-brand");
    brand.createEl("h2", { text: "ReadFlow", cls: "readflow-brand-title" });
    brand.createEl("p", {
      text: "\u5FAE\u4FE1\u8BFB\u4E66\u540C\u6B65 \xB7 \u6458\u5F55\u6574\u7406 \xB7 Vault \u843D\u76D8",
      cls: "readflow-brand-sub",
    });
    const toolbar = topbar.createDiv("readflow-toolbar");
    const actions = toolbar.createDiv("readflow-toolbar-actions");
    const syncBtn = actions.createEl("button", { text: "\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66", type: "button" });
    syncBtn.classList.add("readflow-btn", "readflow-btn--primary");
    syncBtn.title = "\u4ECE\u5FAE\u4FE1\u8BFB\u4E66\u62C9\u53D6\u6700\u65B0\u6458\u5F55\u4E0E\u60F3\u6CD5";
    syncBtn.addEventListener("click", () => void this.plugin.syncWereadAll());
    const importMdBtn = actions.createEl("button", { text: "\u5BFC\u5165 MD", type: "button" });
    importMdBtn.classList.add("readflow-btn", "readflow-btn--secondary");
    importMdBtn.title = "\u4ECE Vault \u4E2D\u7684\u5FAE\u4FE1\u8BFB\u4E66 MD \u6587\u4EF6\u5BFC\u5165\u66F4\u65B0\uFF08\u63A8\u8350\uFF09";
    importMdBtn.addEventListener("click", async () => {
      try {
        const result = await this.plugin.importFromVaultMd();
        new import_obsidian5.Notice(`\u5BFC\u5165\u5B8C\u6210\uFF1A\u66F4\u65B0 ${result.imported} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C${result.errors ? '\uFF0C\u9519\u8BEF ' + result.errors + ' \u4E2A' : ''}`);
        this.render();
      } catch (e) {
        new import_obsidian5.Notice(`\u5BFC\u5165\u5931\u8D25: ${e && e.message}`);
      }
    });
    const writeVaultBtn = actions.createEl("button", { text: "\u5199\u5165 Vault", type: "button" });
    writeVaultBtn.classList.add("readflow-btn", "readflow-btn--secondary");
    writeVaultBtn.title =
      "\u5C06\u5F53\u524D\u4E66\u7C4D\u6458\u5F55\u5199\u5165/\u66F4\u65B0 Vault Markdown\uFF08\u9ED8\u8BA4\u76EE\u5F55\u8BBE\u7F6E\u91CC\u7684\u4E66\u7C4D\u8DEF\u5F84\uFF09";
    writeVaultBtn.addEventListener("click", () => void this.writeCurrentBookToVault(writeVaultBtn));
    const searchArea = toolbar.createDiv("readflow-toolbar-search");
    const searchWrap = searchArea.createDiv("readflow-search-wrap");
    const searchInput = searchWrap.createEl("input", {
      type: "text",
      placeholder: "\u2710 \u641C\u7D22\u6458\u5F55/\u60F3\u6CD5...",
      cls: "readflow-search-input",
    });
    searchInput.value = this.searchQuery;
    searchInput.addEventListener("input", () => {
      this.searchQuery = searchInput.value.trim();
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.renderVisibleList(this.currentBook, this.currentTree), 200);
    });
    if (this.searchQuery) {
      const clearSearch = searchWrap.createEl("button", {
        text: "\u2715",
        type: "button",
        cls: "readflow-search-clear",
      });
      clearSearch.addEventListener("click", () => {
        this.searchQuery = "";
        searchInput.value = "";
        this.renderVisibleList(this.currentBook, this.currentTree);
      });
    }
    const util = toolbar.createDiv("readflow-toolbar-util");
    const reloadBtn = util.createEl("button", { text: "\u91CD\u8F7D", type: "button" });
    reloadBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    reloadBtn.setAttribute(
      "title",
      "\u91CD\u65B0\u52A0\u8F7D ReadFlow\uFF08\u7B49\u540C\u5728\u300C\u7B2C\u4E09\u65B9\u63D2\u4EF6\u300D\u4E2D\u5173\u95ED\u518D\u5F00\u542F\uFF09",
    );
    reloadBtn.addEventListener("click", () => void this.plugin.reloadSelf());
    const moreBtn = util.createEl("button", { type: "button" });
    moreBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--icon", "readflow-btn--sm", "readflow-toolbar-more");
    moreBtn.setAttribute("aria-label", "\u66F4\u591A\u64CD\u4F5C");
    moreBtn.setAttribute("title", "\u66F4\u591A\u64CD\u4F5C\uFF1A\u91CD\u5EFA\u7D22\u5F15\u3001\u624B\u52A8\u6458\u5F55");
    (0, import_obsidian5.setIcon)(moreBtn, "more-horizontal");
    moreBtn.addEventListener("click", (e) => {
      const menu = new import_obsidian5.Menu();
      menu.addItem((item) => {
        item
          .setTitle("\u91CD\u5EFA\u7D22\u5F15")
          .setIcon("database")
          .onClick(async () => {
            await this.plugin.linker.rebuildIndexAsync();
            new import_obsidian5.Notice("\u5173\u8054\u7D22\u5F15\u5DF2\u66F4\u65B0");
          });
      });
      menu.addItem((item) => {
        item.setTitle("\u624B\u52A8\u6458\u5F55").setIcon("square-pen").onClick(() => {
          const books = Object.values(this.plugin.diskData.books);
          const current = this.getSelectedBook(books);
          new QuickCaptureModal(this.app, this.plugin, { book: current }, () => {
            void this.plugin.persistDisk();
            this.render();
          }).open();
        });
      });
      menu.showAtMouseEvent(e);
    });
    const hideBtn = util.createEl("button", { type: "button" });
    hideBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--icon", "readflow-btn--sm", "readflow-topbar-hide");
    hideBtn.setAttribute("aria-label", "\u9690\u85CF\u9876\u680F");
    hideBtn.setAttribute("title", "\u9690\u85CF\u9876\u680F\u5DE5\u5177\u680F");
    (0, import_obsidian5.setIcon)(hideBtn, "chevron-up");
    hideBtn.addEventListener("click", () => this.setTopbarHidden(true));
  }
  renderSidebar(sidebar, books, book, tree, inboxCount, reviewingCount, draftedCount, processedCount) {
    const toggleRow = sidebar.createDiv("readflow-sidebar-toggle-row");
    const toggleBtn = toggleRow.createEl("button", { type: "button" });
    toggleBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-sidebar-toggle-btn");
    toggleBtn.setAttribute(
      "title",
      this.sidebarCollapsed ? "\u5C55\u5F00\u5BFC\u822A\u4FA7\u680F" : "\u6536\u8D77\u5BFC\u822A\u4FA7\u680F",
    );
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
    this.bookSortCountDir = localStorage.getItem("readflow.bookSortCountDir") === "asc" ? "asc" : "desc";
    const picker = sidebar.createDiv("readflow-book-row");
    const pickerHead = picker.createDiv("readflow-book-picker-head");
    pickerHead.createDiv({ cls: "readflow-field-label", text: "\u5F53\u524D\u4E66\u7C4D" });
    const bookSearchWrap = picker.createDiv("readflow-book-search-wrap");
    const bookSearchInput = bookSearchWrap.createEl("input", {
      type: "search",
      placeholder: "\u641C\u7D22\u4E66\u540D / \u4F5C\u8005...",
      cls: "readflow-search-input readflow-book-search-input",
    });
    bookSearchInput.value = this.bookSearchQuery || "";
    const clearBookSearch = bookSearchWrap.createEl("button", {
      text: "\u2715",
      type: "button",
      cls: "readflow-search-clear",
    });
    const syncBookSearchClearVisibility = () => {
      clearBookSearch.classList.toggle("readflow-search-clear--hidden", !this.bookSearchQuery);
    };
    syncBookSearchClearVisibility();
    const sortRow = pickerHead.createDiv("readflow-book-sort-row");
    const timeWrap = sortRow.createDiv("readflow-book-sort-group");
    const sortRecentBtn = timeWrap.createEl("button", { type: "button" });
    sortRecentBtn.classList.add(
      "readflow-btn",
      "readflow-btn--sm",
      "readflow-book-sort-btn",
      "readflow-book-sort-compound",
    );
    sortRecentBtn.classList.toggle("readflow-btn--ghost", this.bookSortMode !== "recent");
    sortRecentBtn.classList.toggle("readflow-book-sort-btn--active", this.bookSortMode === "recent");
    sortRecentBtn.title =
      this.bookSortMode === "recent"
        ? `\u65F6\u95F4\u6392\u5E8F \xB7 ${this.bookSortTimeDir === "asc" ? "\u5347\u5E8F\uFF08\u65E7\u2192\u65B0\uFF09" : "\u964D\u5E8F\uFF08\u65B0\u2192\u65E7\uFF09"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
        : "\u6309\u540C\u6B65/\u6458\u5F55\u65F6\u95F4\u6392\u5E8F";
    sortRecentBtn.setAttribute(
      "aria-label",
      this.bookSortMode === "recent"
        ? `\u65F6\u95F4\u6392\u5E8F\uFF0C${this.bookSortTimeDir === "asc" ? "\u5347\u5E8F" : "\u964D\u5E8F"}`
        : "\u5207\u6362\u5230\u65F6\u95F4\u6392\u5E8F",
    );
    const recentIconSlot = sortRecentBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
    const recentDirEl = sortRecentBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
    if (this.bookSortMode === "recent") {
      recentDirEl.setText(sortDirArrow(this.bookSortTimeDir));
    } else {
      recentDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    (0, import_obsidian5.setIcon)(recentIconSlot, "history");
    const nameWrap = sortRow.createDiv("readflow-book-sort-group");
    const sortNameBtn = nameWrap.createEl("button", { type: "button" });
    sortNameBtn.classList.add(
      "readflow-btn",
      "readflow-btn--sm",
      "readflow-book-sort-btn",
      "readflow-book-sort-compound",
    );
    sortNameBtn.classList.toggle("readflow-btn--ghost", this.bookSortMode !== "name");
    sortNameBtn.classList.toggle("readflow-book-sort-btn--active", this.bookSortMode === "name");
    sortNameBtn.title =
      this.bookSortMode === "name"
        ? `\u4E66\u540D\u6392\u5E8F \xB7 ${this.bookSortNameDir === "asc" ? "A\u2192Z" : "Z\u2192A"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
        : "\u6309\u4E66\u540D\u5B57\u6BCD\u6392\u5E8F";
    sortNameBtn.setAttribute(
      "aria-label",
      this.bookSortMode === "name"
        ? `\u4E66\u540D\u6392\u5E8F\uFF0C${this.bookSortNameDir === "asc" ? "A-Z" : "Z-A"}`
        : "\u5207\u6362\u5230\u4E66\u540D\u6392\u5E8F",
    );
    const nameIconSlot = sortNameBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
    const nameDirEl = sortNameBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
    if (this.bookSortMode === "name") {
      nameDirEl.setText(this.bookSortNameDir === "asc" ? "\u2191" : "\u2193");
    } else {
      nameDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    (0, import_obsidian5.setIcon)(nameIconSlot, "library");
    const countWrap = sortRow.createDiv("readflow-book-sort-group");
    const sortCountBtn = countWrap.createEl("button", { type: "button" });
    sortCountBtn.classList.add(
      "readflow-btn",
      "readflow-btn--sm",
      "readflow-book-sort-btn",
      "readflow-book-sort-compound",
    );
    sortCountBtn.classList.toggle("readflow-btn--ghost", this.bookSortMode !== "count");
    sortCountBtn.classList.toggle("readflow-book-sort-btn--active", this.bookSortMode === "count");
    sortCountBtn.title =
      this.bookSortMode === "count"
        ? `\u5212\u7EBF\u6570\u6392\u5E8F \xB7 ${this.bookSortCountDir === "asc" ? "\u5C11\u2192\u591A" : "\u591A\u2192\u5C11"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
        : "\u6309\u5212\u7EBF\u6570\u91CF\u6392\u5E8F";
    sortCountBtn.setAttribute(
      "aria-label",
      this.bookSortMode === "count"
        ? `\u5212\u7EBF\u6570\u6392\u5E8F\uFF0C${this.bookSortCountDir === "asc" ? "\u5C11\u2192\u591A" : "\u591A\u2192\u5C11"}`
        : "\u5207\u6362\u5230\u5212\u7EBF\u6570\u6392\u5E8F",
    );
    const countIconSlot = sortCountBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
    const countDirEl = sortCountBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
    if (this.bookSortMode === "count") {
      countDirEl.setText(this.bookSortCountDir === "asc" ? "\u2191" : "\u2193");
    } else {
      countDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    (0, import_obsidian5.setIcon)(countIconSlot, "hash");
    const sortedBooks = [...books].sort((a, b) => {
      if (this.bookSortMode === "name") {
        const c = a.title.localeCompare(b.title, "zh-CN");
        return this.bookSortNameDir === "asc" ? c : -c;
      }
      if (this.bookSortMode === "count") {
        const diff = a.highlights.length - b.highlights.length;
        return this.bookSortCountDir === "asc" ? diff : -diff;
      }
      const primary = bookRecencyTimestamp(a) - bookRecencyTimestamp(b);
      if (primary !== 0) {
        return this.bookSortTimeDir === "asc" ? primary : -primary;
      }
      const tie = a.title.localeCompare(b.title, "zh-CN");
      return tie;
    });
    const select = picker.createEl("select", { cls: "readflow-select readflow-book-select" });
    const isBookSearchActive = () => Boolean(String(this.bookSearchQuery || "").trim());
    const refreshBookSelectFromSearch = () => {
      const searchActive = isBookSearchActive();
      const next = buildBooksForSelect(sortedBooks, this.bookSearchQuery);
      repopulateBookSelect(select, next, book.bookId, { searchActive });
    };
    refreshBookSelectFromSearch();
    bookSearchInput.addEventListener("input", () => {
      this.bookSearchQuery = bookSearchInput.value.trim();
      syncBookSearchClearVisibility();
      if (this._bookSearchTimer) clearTimeout(this._bookSearchTimer);
      this._bookSearchTimer = setTimeout(() => {
        this._bookSearchTimer = null;
        refreshBookSelectFromSearch();
      }, 150);
    });
    clearBookSearch.addEventListener("click", () => {
      this.bookSearchQuery = "";
      bookSearchInput.value = "";
      syncBookSearchClearVisibility();
      refreshBookSelectFromSearch();
      bookSearchInput.focus();
    });
    select.addEventListener("change", () => {
      const nextId = select.value;
      if (!nextId) return;
      localStorage.setItem("readflow.selectedBookId", nextId);
      this.bookSearchQuery = "";
      this.render();
    });
    const persistBookSort = () => {
      localStorage.setItem("readflow.bookSort", this.bookSortMode);
      localStorage.setItem("readflow.bookSortTimeDir", this.bookSortTimeDir);
      localStorage.setItem("readflow.bookSortNameDir", this.bookSortNameDir);
      localStorage.setItem("readflow.bookSortCountDir", this.bookSortCountDir);
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
    sortCountBtn.addEventListener("click", () => {
      if (this.bookSortMode === "count") {
        this.bookSortCountDir = this.bookSortCountDir === "asc" ? "desc" : "asc";
      } else {
        this.bookSortMode = "count";
      }
      persistBookSort();
      this.render();
    });
    const overview = sidebar.createDiv("readflow-sidebar-card");
    overview.createEl("h4", { text: book.title, cls: "readflow-sidebar-title" });
    overview.createEl("p", {
      text: book.author ? `\u4F5C\u8005\uFF1A${book.author}` : "\u4F5C\u8005\u4FE1\u606F\u672A\u540C\u6B65",
      cls: "readflow-sidebar-subtitle",
    });
    const stats = overview.createDiv("readflow-stat-grid");
    this.renderStat(stats, "\u6458\u5F55", String(book.highlights.length));
    this.renderStat(stats, "\u5F85\u6574\u7406", String(inboxCount));
    this.renderStat(stats, "\u5DF2\u9605\u8BFB", String(reviewingCount));
    this.renderStat(stats, "\u8349\u7A3F\u5B8C\u6210", String(draftedCount));
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
    const statusBar = sidebar.createDiv("readflow-status-flow");
    statusBar.createEl("h3", { text: "\u72B6\u6001\u8FDB\u5EA6", cls: "readflow-section-label" });
    const total = book.highlights.length;
    const flowSteps = [
      { key: "inbox", label: "\u5F85\u6574\u7406", count: inboxCount },
      { key: "reviewing", label: "\u5DF2\u9605\u8BFB", count: reviewingCount },
      { key: "drafted", label: "\u8349\u7A3F\u5B8C\u6210", count: draftedCount },
      { key: "processed", label: "\u5DF2\u5904\u7406", count: processedCount },
    ];
    for (const step of flowSteps) {
      const pct = total > 0 ? Math.round((step.count / total) * 100) : 0;
      const row = statusBar.createDiv("readflow-status-row");
      row.createEl("span", { text: step.label, cls: "readflow-status-label" });
      const bar = row.createDiv("readflow-status-bar-bg");
      const fill = bar.createDiv("readflow-status-bar-fill");
      fill.style.width = `${pct}%`;
      fill.style.background = STATUS_COLORS[step.key] || "#94a3b8";
      row.createEl("span", { text: `${step.count}\u6761 (${pct}%)`, cls: "readflow-status-count" });
    }
    sidebar.createEl("h3", { text: "\u7AE0\u8282", cls: "readflow-section-label" });
    const nav = sidebar.createDiv("readflow-nav-list");
    const allItem = nav.createDiv(
      `readflow-nav-item${this.selectedChapter == null ? " readflow-nav-item--active" : ""}`,
    );
    allItem.setAttribute("role", "button");
    allItem.setAttribute("aria-label", this.selectedChapter == null
      ? `\u5DF2\u9009\u4E2D\u5168\u90E8 \xB7 ${book.highlights.length}`
      : `\u9009\u4E2D\u5168\u90E8 \xB7 ${book.highlights.length}`);
    allItem.setText(`\u5168\u90E8 \xB7 ${book.highlights.length}`);
    allItem.addEventListener("click", () => {
      this.selectedChapter = null;
      nav.querySelectorAll(".readflow-nav-item").forEach((el) => el.classList.remove("readflow-nav-item--active"));
      allItem.classList.add("readflow-nav-item--active");
      this.renderVisibleList(book, tree);
    });
    for (const node of tree) {
      const item = nav.createDiv(
        `readflow-nav-item${this.selectedChapter === node.chapter ? " readflow-nav-item--active" : ""}`,
      );
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", this.selectedChapter === node.chapter
        ? `\u5DF2\u9009\u4E2D\u7B2C ${node.chapter} \xB7 ${node.highlights.length}`
        : `\u9009\u4E2D\u7B2C ${node.chapter} \xB7 ${node.highlights.length}`);
      item.setText(`${node.chapter} \xB7 ${node.highlights.length}`);
      this.makeChapterDropTarget(item, book, node.chapter, node.chapterUid);
      item.addEventListener("click", () => {
        this.selectedChapter = node.chapter;
        nav.querySelectorAll(".readflow-nav-item").forEach((el) => el.classList.remove("readflow-nav-item--active"));
        item.classList.add("readflow-nav-item--active");
        this.renderVisibleList(book, tree);
      });
    }
    const topicSec = sidebar.createDiv("readflow-topic-section readflow-sidebar-topic-section");
    const topicHead = topicSec.createDiv("readflow-section-inline-head");
    const topicTitleBtn = topicHead.createDiv("readflow-section-title-btn");
    topicTitleBtn.createEl("span", { text: this.topicSectionCollapsed ? "\u25B6" : "\u25BC", cls: "readflow-section-chevron" });
    topicTitleBtn.createEl("h4", { text: "\u4E3B\u9898\u7BA1\u7406", cls: "readflow-list-title" });
    topicTitleBtn.addEventListener("click", () => {
      this.topicSectionCollapsed = !this.topicSectionCollapsed;
      localStorage.setItem("readflow.topicCollapsed", String(this.topicSectionCollapsed));
      this.render();
    });
    if (!this.topicSectionCollapsed) {
      const topicActions = topicHead.createDiv("readflow-inline-actions");
      const createBtn = topicActions.createEl("button", { text: "+\u65B0\u5EFA", type: "button" });
      createBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      createBtn.addEventListener("click", () => {
        const next = window.prompt("\u8F93\u5165\u65B0\u4E3B\u9898\u540D\u79F0");
        if (!next || !next.trim()) return;
        this.createTopic(book, next.trim());
        this.selectedTopic = next.trim();
        this.render();
      });
      const topics = this.buildTopicStats(book);
      const topicRow = topicSec.createDiv("readflow-topic-row");
      const allChip = topicRow.createEl("button", { text: `\u5168\u90E8 ${book.highlights.length}`, type: "button" });
      allChip.classList.add("readflow-chip-button");
      if (this.selectedTopic == null) allChip.classList.add("readflow-chip-button--active");
      allChip.addEventListener("click", () => { this.selectedTopic = null; this.render(); });
      for (const [topic, count] of [...topics.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
        const chip = topicRow.createEl("button", { text: `${topic} ${count}`, type: "button" });
        chip.classList.add("readflow-chip-button");
        if (this.selectedTopic === topic) chip.classList.add("readflow-chip-button--active");
        chip.addEventListener("click", () => {
          this.selectedTopic = this.selectedTopic === topic ? null : topic;
          this.render();
        });
      }
    }
    const boardSec = sidebar.createDiv("readflow-board-section readflow-sidebar-board-section");
    const boardHead = boardSec.createDiv("readflow-section-inline-head");
    const boardTitleBtn = boardHead.createDiv("readflow-section-title-btn");
    boardTitleBtn.createEl("span", { text: this.boardSectionCollapsed ? "\u25B6" : "\u25BC", cls: "readflow-section-chevron" });
    boardTitleBtn.createEl("h4", { text: "\u5206\u7C7B\u7CFB\u7EDF", cls: "readflow-list-title" });
    boardTitleBtn.addEventListener("click", () => {
      this.boardSectionCollapsed = !this.boardSectionCollapsed;
      localStorage.setItem("readflow.boardCollapsed", String(this.boardSectionCollapsed));
      this.render();
    });
    if (!this.boardSectionCollapsed) {
      if (this.selectedBoardFilter) {
        const clearBtn = boardHead.createEl("button", { text: "\xD7", type: "button" });
        clearBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
        clearBtn.addEventListener("click", () => { this.selectedBoardFilter = null; this.render(); });
      }
      const board = boardSec.createDiv("readflow-board");
      const lanes = [
        { key: "inbox", label: "\u5F85\u6574\u7406" },
        { key: "reviewing", label: "\u5DF2\u9605\u8BFB" },
        { key: "drafted", label: "\u8349\u7A3F" },
        { key: "processed", label: "\u5DF2\u5904\u7406" },
      ];
      for (const lane of lanes) {
        const count = book.highlights.filter(h => h.status === lane.key).length;
        const isActive = this.selectedBoardFilter === lane.key;
        const item = board.createDiv("readflow-board-nav-item");
        if (isActive) item.classList.add("readflow-board-nav-item--active");
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", isActive ? `\u5173\u95ED ${lane.label} \u7B5B\u9009` : `\u7B5B\u9009 ${lane.label} ${count} \u6761`);
        item.setAttribute("tabindex", "0");
        item.createEl("span", { text: lane.label, cls: "readflow-board-nav-label" });
        item.createEl("span", { text: String(count), cls: "readflow-board-nav-count" });
        item.addEventListener("click", () => {
          this.selectedBoardFilter = isActive ? null : lane.key;
          this.render();
        });
      }
    }
  }
  renderWorkspace(workspace, book, tree) {
    const header = workspace.createDiv("readflow-workspace-header");
    const titleBlock = header.createDiv("readflow-workspace-titleblock");
    titleBlock.createEl("h3", { text: book.title, cls: "readflow-workspace-title" });
    titleBlock.createEl("p", {
      text: book.author
        ? `\u4F5C\u8005 ${book.author} \xB7 \u5F53\u524D\u5DE5\u4F5C\u533A\u5C55\u793A\u8BE5\u4E66\u6458\u5F55`
        : "\u5F53\u524D\u5DE5\u4F5C\u533A\u5C55\u793A\u8BE5\u4E66\u6458\u5F55",
      cls: "readflow-workspace-subtitle",
    });
    const headerActions = header.createDiv("readflow-workspace-actions");
    const pushableCount = book.highlights.filter((h) => canPushHighlightToWeread(h)).length;
    if (pushableCount > 0) {
      const batchPush = headerActions.createEl("button", {
        text: `\u2191 \u63A8\u9001\u60F3\u6CD5 (${pushableCount})`,
        type: "button",
      });
      batchPush.classList.add("readflow-btn", "readflow-btn--accent", "readflow-btn--sm");
      batchPush.title =
        "\u5C06\u6240\u6709\u672C\u5730\u60F3\u6CD5\u6279\u91CF\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66";
      batchPush.addEventListener("click", async () => {
        batchPush.disabled = true;
        batchPush.textContent = "\u63A8\u9001\u4E2D\u2026";
        await this.plugin.pushBatchNotes(book.bookId);
        batchPush.textContent = `\u2191 \u63A8\u9001\u60F3\u6CD5`;
        batchPush.disabled = false;
        this.render();
      });
    }
    const chips = header.createDiv("readflow-card-meta");
    chips.createSpan({
      cls: "readflow-chip readflow-chip--accent",
      text: `${book.highlights.length} \u6761\u6458\u5F55`,
    });
    chips.createSpan({ cls: "readflow-chip", text: `${tree.length} \u7AE0\u8282` });
    if (this.selectedTopic) {
      chips.createSpan({ cls: "readflow-chip readflow-chip--accent", text: `\u4E3B\u9898\uFF1A${this.selectedTopic}` });
    }
    const surface = workspace.createDiv("readflow-workspace-surface");
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
        cls: "readflow-list-summary",
      });
      const detachBtn = listHeaderRight.createEl("button", { text: "\u6D6E\u52A8\u7A97\u53E3", type: "button" });
      detachBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      detachBtn.setAttribute(
        "title",
        "\u5C06\u6458\u5F55\u5217\u8868\u4EE5\u6D6E\u52A8\u7A97\u53E3\u663E\u793A\uFF0C\u4FBF\u4E8E\u540E\u7EED\u62D6\u62FD\u64CD\u4F5C",
      );
      detachBtn.addEventListener("click", () => {
        this.listDetached = true;
        this.render();
      });
      const sortTimeBtn = listHeaderRight.createEl("button", { type: "button" });
      sortTimeBtn.classList.add(
        "readflow-btn",
        "readflow-btn--sm",
        "readflow-book-sort-btn",
        "readflow-book-sort-compound",
      );
      sortTimeBtn.classList.toggle("readflow-btn--ghost", this.listOrderMode !== "time");
      sortTimeBtn.classList.toggle("readflow-book-sort-btn--active", this.listOrderMode === "time");
      sortTimeBtn.title =
        this.listOrderMode === "time"
          ? `\u65F6\u95F4\u6392\u5E8F \xB7 ${this.listTimeDir === "desc" ? "\u65B0\u2192\u65E7" : "\u65E7\u2192\u65B0"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
          : "\u6309\u65F6\u95F4\u6392\u5E8F";
      sortTimeBtn.setAttribute(
        "aria-label",
        this.listOrderMode === "time"
          ? `\u65F6\u95F4\u6392\u5E8F\uFF0C${this.listTimeDir === "desc" ? "\u964D\u5E8F" : "\u5347\u5E8F"}`
          : "\u5207\u6362\u5230\u65F6\u95F4\u6392\u5E8F",
      );
      const timeIconSlot = sortTimeBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
      const timeDirEl = sortTimeBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
      if (this.listOrderMode === "time") {
        timeDirEl.setText(sortDirArrow(this.listTimeDir));
      } else {
        timeDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
      }
      (0, import_obsidian5.setIcon)(timeIconSlot, "clock");
      sortTimeBtn.addEventListener("click", () => {
        if (this.listOrderMode === "time") {
          this.listTimeDir = this.listTimeDir === "asc" ? "desc" : "asc";
        } else {
          this.listOrderMode = "time";
          this.listTimeDir = "desc";
        }
        localStorage.setItem("readflow.listTimeDir", this.listTimeDir);
        this.renderVisibleList(book, tree);
      });
      const sortTopicBtn = listHeaderRight.createEl("button", { type: "button" });
      sortTopicBtn.classList.add(
        "readflow-btn",
        "readflow-btn--sm",
        "readflow-book-sort-btn",
        "readflow-book-sort-compound",
      );
      sortTopicBtn.classList.toggle("readflow-btn--ghost", this.listOrderMode !== "topic");
      sortTopicBtn.classList.toggle("readflow-book-sort-btn--active", this.listOrderMode === "topic");
      sortTopicBtn.title = this.listOrderMode === "topic"
        ? `\u4E3B\u9898\u6392\u5E8F \xB7 ${this.listTopicDir === "asc" ? "A\u2192Z" : "Z\u2192A"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
        : "\u6309\u4E3B\u9898\u6392\u5E8F";
      sortTopicBtn.setAttribute("aria-label", this.listOrderMode === "topic"
        ? `\u4E3B\u9898\u6392\u5E8F\uFF0C${this.listTopicDir === "asc" ? "A-Z" : "Z-A"}`
        : "\u5207\u6362\u5230\u4E3B\u9898\u6392\u5E8F");
      const topicIconSlot = sortTopicBtn.createSpan({ cls: "readflow-book-sort-compound__icon" });
      const topicDirEl = sortTopicBtn.createSpan({ cls: "readflow-book-sort-compound__dir" });
      if (this.listOrderMode === "topic") {
        topicDirEl.textContent = this.listTopicDir === "asc" ? "\u2191" : "\u2193";
      } else {
        topicDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
      }
      (0, import_obsidian5.setIcon)(topicIconSlot, "tag");
      sortTopicBtn.addEventListener("click", () => {
        if (this.listOrderMode === "topic") {
          this.listTopicDir = this.listTopicDir === "asc" ? "desc" : "asc";
        } else {
          this.listOrderMode = "topic";
          this.listTopicDir = "asc";
        }
        localStorage.setItem("readflow.listTopicDir", this.listTopicDir);
        this.renderVisibleList(book, tree);
      });
      this.listContainerEl = listPane.createDiv("readflow-card-list");
    }
    const splitter = contentGrid.createDiv("readflow-content-splitter");
    splitter.addEventListener("mousedown", (e) => {
      e.preventDefault();
      splitter.classList.add("is-dragging");
      const startX = e.clientX;
      const startWidth = this.knowledgePaneWidth;
      const onMove = (ev) => {
        const delta = ev.clientX - startX;
        const next = Math.max(200, Math.min(700, startWidth - delta));
        this.knowledgePaneWidth = next;
        localStorage.setItem("readflow.knowledgePaneWidth", String(next));
        const kp = this.contentEl.querySelector(".readflow-knowledge-pane");
        if (kp) kp.style.width = `${next}px`;
      };
      const onUp = () => {
        splitter.classList.remove("is-dragging");
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
    const knowledgePane = contentGrid.createDiv("readflow-knowledge-pane");
    knowledgePane.style.width = `${this.knowledgePaneWidth}px`;
    knowledgePane.createDiv("readflow-knowledge-scroll");
  }
  renderTopicManager(container, book, tree) {
    const topics = this.buildTopicStats(book);
    const sec = container.createDiv("readflow-topic-section");
    const head = sec.createDiv("readflow-section-inline-head");
    const titleBtn = head.createDiv("readflow-section-title-btn");
    titleBtn.createEl("span", {
      text: this.topicSectionCollapsed ? "\u25B6" : "\u25BC",
      cls: "readflow-section-chevron",
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
      { key: "inbox", label: "\u5F85\u6574\u7406", isStatus: true },
      { key: "reviewing", label: "\u5DF2\u9605\u8BFB", isStatus: true },
      { key: "drafted", label: "\u8349\u7A3F\u5B8C\u6210", isStatus: true },
      { key: "processed", label: "\u5DF2\u5904\u7406", isStatus: true },
      { key: "idea", label: HIGHLIGHT_TYPE_LABELS.idea },
      { key: "method", label: HIGHLIGHT_TYPE_LABELS.method },
      { key: "example", label: HIGHLIGHT_TYPE_LABELS.example },
      { key: "conclusion", label: HIGHLIGHT_TYPE_LABELS.conclusion },
      { key: "question", label: HIGHLIGHT_TYPE_LABELS.question },
    ];
    const sec = container.createDiv("readflow-board-section");
    const sectionHead = sec.createDiv("readflow-section-inline-head");
    const titleBtn = sectionHead.createDiv("readflow-section-title-btn");
    titleBtn.createEl("span", {
      text: this.boardSectionCollapsed ? "\u25B6" : "\u25BC",
      cls: "readflow-section-chevron",
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
      clearFilterBtn.classList.add(
        "readflow-btn",
        "readflow-btn--ghost",
        "readflow-btn--sm",
        "readflow-board-clear-btn",
      );
      clearFilterBtn.addEventListener("click", () => {
        this.selectedBoardFilter = null;
        this.render();
      });
    }
    sec.createEl("p", {
      text: "\u70B9\u51FB\u5206\u7C7B\u67E5\u770B\u6458\u5F55\xB7\u62D6\u52A8\u6458\u5F55\u5230\u5206\u7C7B\u5217\u5B8C\u6210\u5F52\u7C7B",
      cls: "readflow-empty-desc readflow-board-hint",
    });
    const board = sec.createDiv("readflow-board");
    for (const lane of lanes) {
      const items = book.highlights.filter((h) =>
        lane.key === "inbox" ? h.status === "inbox" || !h.highlightType : h.highlightType === lane.key,
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
      cls: "readflow-batch-label",
    });
    const selectAllBtn = bar.createEl("button", { text: "\u5168\u9009", type: "button" });
    selectAllBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    selectAllBtn.addEventListener("click", () => {
      const visible = this.getVisibleHighlights(book, this.currentTree);
      visible.forEach((h) => this.selectedHighlightIds.add(h.id));
      this.render();
    });
    const clearBtn = bar.createEl("button", { text: "\u6E05\u7A7A", type: "button" });
    clearBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    clearBtn.addEventListener("click", () => {
      this.selectedHighlightIds.clear();
      this.render();
    });
    const actions = bar.createDiv("readflow-inline-actions");
    const impLabel = actions.createEl("span", { text: "\u91CD\u8981\u5EA6:", cls: "readflow-batch-label-sm" });
    for (let imp = 1; imp <= 5; imp++) {
      const impBtn = actions.createEl("button", { text: String(imp), type: "button" });
      impBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      impBtn.title = `\u5C06\u9009\u4E2D\u6458\u5F55\u91CD\u8981\u5EA6\u8BBE\u4E3A ${imp}`;
      impBtn.addEventListener("click", () => {
        this.updateManyHighlights(book, (h) => (this.selectedHighlightIds.has(h.id) ? { ...h, importance: imp } : h));
      });
    }
    const sep1 = actions.createEl("span", { cls: "readflow-batch-sep" });
    for (const type of ["idea", "method", "example", "conclusion", "question"]) {
      const btn = actions.createEl("button", { text: HIGHLIGHT_TYPE_LABELS[type], type: "button" });
      btn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      btn.addEventListener("click", () => {
        this.updateManyHighlights(book, (h) =>
          this.selectedHighlightIds.has(h.id) ? { ...h, highlightType: type, status: "processed" } : h,
        );
      });
    }
    const sep2 = actions.createEl("span", { cls: "readflow-batch-sep" });
    const nextStatus = STATUS_FLOW[1]; // default to "reviewing"
    const nextLabel = STATUS_LABELS[nextStatus] || "\u5DF2\u9605\u8BFB";
    const advanceBtn = actions.createEl("button", { text: `\u2192 ${nextLabel}`, type: "button" });
    advanceBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    advanceBtn.style.color = STATUS_COLORS[nextStatus] || "#3b82f6";
    advanceBtn.title = "\u5C06\u9009\u5B9A\u68C0\u7ED8\u5411\u4E0B\u4E00\u72B6\u6001";
    advanceBtn.addEventListener("click", () => {
      this.updateManyHighlights(book, (h) => {
        if (!this.selectedHighlightIds.has(h.id)) return h;
        const idx = STATUS_FLOW.indexOf(h.status);
        const next = STATUS_FLOW[idx + 1] || "processed";
        return { ...h, status: next };
      });
      this.render();
    });
    const topicBtn = actions.createEl("button", { text: "\u6279\u91CF\u8BBE\u4E3B\u9898", type: "button" });
    topicBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    topicBtn.addEventListener("click", () => {
      const topic = window.prompt("\u4E3A\u9009\u4E2D\u7684\u6458\u5F55\u8BBE\u7F6E\u4E3B\u9898");
      if (!(topic == null ? void 0 : topic.trim())) return;
      this.updateManyHighlights(book, (h) =>
        this.selectedHighlightIds.has(h.id) ? { ...h, topic: topic.trim(), status: "processed" } : h,
      );
      this.createTopic(book, topic.trim());
    });
    const relationBtn = actions.createEl("button", { text: "\u5EFA\u7ACB\u5173\u7CFB", type: "button" });
    relationBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    relationBtn.addEventListener("click", () => {
      if (this.selectedHighlightIds.size < 2) {
        new import_obsidian5.Notice(
          "\u81F3\u5C11\u9009\u62E9 2 \u6761\u6458\u5F55\u624D\u80FD\u5EFA\u7ACB\u5173\u7CFB",
        );
        return;
      }
      const relation = window.prompt(
        "\u8F93\u5165\u5173\u7CFB\u7C7B\u578B\uFF08\u9884\u8BBE\uFF1A\u8865\u5145/\u91CD\u590D/\u56E0\u679C/\u5BF9\u6BD4\uFF0C\u6216\u81EA\u5B9A\u4E49\u5982\uFF1A\u5E08\u627F/\u7ADE\u4E89/\u5BB6\u65CF\uFF09",
        "\u8865\u5145",
      );
      if (!relation) return;
      this.linkSelectedHighlights(book, relation);
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
    const summaryText = filterChapter
      ? `${filterChapter} \xB7 ${items.length} \u6761`
      : `\u5168\u90E8\u7AE0\u8282 \xB7 ${items.length} \u6761`;
    if (this.listSummaryEl) this.listSummaryEl.setText(summaryText);
    if (this.detachedPanel) {
      const detachedSummary = this.detachedPanel.querySelector(".readflow-detached-summary");
      if (detachedSummary) detachedSummary.setText(summaryText);
    }
    listEl.empty();
    const rows = [...items].sort((a, b) => {
      if (this.listOrderMode === "topic") {
        const topicA = a.topic || "\u672A\u5F52\u7C7B";
        const topicB = b.topic || "\u672A\u5F52\u7C7B";
        const topicCompare = topicA.localeCompare(topicB, "zh-CN");
        if (topicCompare !== 0) {
          return this.listTopicDir === "asc" ? topicCompare : -topicCompare;
        }
        const typeA = a.highlightType || "";
        const typeB = b.highlightType || "";
        const typeCompare = typeA.localeCompare(typeB);
        if (typeCompare !== 0) return typeCompare;
        return compareHighlightTime(a, b, this.listTopicDir);
      }
      return compareHighlightTime(a, b, this.listTimeDir);
    });
    if (rows.length === 0) {
      const empty = listEl.createDiv("readflow-empty-inline");
      const isStaleChapter = this.selectedChapter != null;
      if (isStaleChapter) {
        empty.createEl("p", {
          text: `\u300A${this.selectedChapter}\u300B\u7B2C\u8282\u6682\u65E0\u6458\u5F55`,
          cls: "readflow-empty-title",
        });
        empty.createEl("p", {
          text: "\u6B64\u7AE0\u8282\u7684\u6458\u5F55\u5DF2\u5168\u90E8\u79FB\u8D70\u6216\u5220\u9664\uFF0C\u70B9\u51FB\u4E0B\u65B9\u300C\u5168\u90E8\u300D\u91CD\u7F6E",
          cls: "readflow-empty-desc",
        });
      } else {
        empty.createEl("p", {
          text: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u6458\u5F55",
          cls: "readflow-empty-title",
        });
        empty.createEl("p", {
          text: "\u53EF\u4EE5\u5207\u6362\u7AE0\u8282\u3001\u5173\u95ED\u300C\u4EC5\u672A\u6574\u7406\u300D\uFF0C\u6216\u624B\u52A8\u8865\u5145\u6458\u5F55\u3002",
          cls: "readflow-empty-desc",
        });
      }
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
          cls: "readflow-topic-divider-count",
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
      const statusLabel = STATUS_LABELS[h.status] || h.status;
      const statusColor = STATUS_COLORS[h.status] || "#94a3b8";
      const statusChip = headerRight.createEl("span", {
        cls: "readflow-chip readflow-chip--status-led",
        text: statusLabel,
      });
      statusChip.style.setProperty("--rf-status-led", statusColor);
      headerRight.createSpan({ cls: "readflow-chip", text: `\u91CD\u8981\u5EA6 ${h.importance}` });
      const body = card.createDiv("readflow-card-body");
      body.setText(h.content);
      const meta = card.createDiv("readflow-card-meta");
      if (h.highlightType) meta.createSpan({ cls: "readflow-chip readflow-chip--accent", text: h.highlightType });
      if (h.topic) meta.createSpan({ cls: "readflow-chip", text: h.topic });
      if ((_c = h.entities) == null ? void 0 : _c.length) {
        for (const ent of h.entities.slice(0, 3)) {
          meta.createSpan({ cls: "readflow-chip readflow-chip--entity", text: resolveEntityDisplayName(ent, [h]) });
        }
        if (h.entities.length > 3) {
          meta.createSpan({ cls: "readflow-chip readflow-chip--entity", text: `+${h.entities.length - 3}` });
        }
      }
      if (h.chapter) meta.createSpan({ cls: "readflow-chip", text: h.chapter });
      if ((_d = h.links) == null ? void 0 : _d.length)
        meta.createSpan({ cls: "readflow-chip readflow-chip--soft", text: `\u5173\u8054 ${h.links.length}` });
      if (h.contextAbstract) {
        const ctxBtn = meta.createEl("button", {
          text: "\u2605 \u4E0A\u4E0B\u6587",
          type: "button",
          cls: "readflow-chip readflow-chip--context-btn",
        });
        ctxBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.expandedHighlightId === h.id) this.expandedHighlightId = null;
          else this.expandedHighlightId = h.id;
          this.render();
        });
      }
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
            cls: "readflow-card-note-text",
          });
        }
      }
      if (this.expandedHighlightId === h.id && h.contextAbstract) {
        const ctx = parseContextAbstract(h);
        if (ctx) {
          const ctxWrap = card.createDiv("readflow-context-wrap");
          if (ctx.chapter) {
            const ctxChap = ctxWrap.createDiv("readflow-context-chapter");
            ctxChap.textContent = ctx.chapter;
          }
          const ctxBody = ctxWrap.createDiv("readflow-context-body");
          if (ctx.before) {
            const beforeEl = ctxBody.createDiv("readflow-context-before");
            beforeEl.textContent = ctx.before;
          }
          const mainEl = ctxBody.createDiv("readflow-context-main");
          mainEl.textContent = ctx.main;
          if (ctx.after) {
            const afterEl = ctxBody.createDiv("readflow-context-after");
            afterEl.textContent = ctx.after;
          }
          const ctxFooter = ctxWrap.createDiv("readflow-context-footer");
          if (ctx.wereadRange) {
            const rangeEl = ctxFooter.createEl("span", {
              text: "\u7B2C" + ctx.wereadRange + "\u8282",
              cls: "readflow-chip readflow-chip--soft",
            });
            const wereadLink = ctxFooter.createEl("button", {
              text: "\u5728\u5FAE\u4FE1\u8BFB\u4E66\u4E2D\u6253\u5F00",
              type: "button",
              cls: "readflow-btn readflow-btn--ghost readflow-btn--xs",
            });
            wereadLink.addEventListener("click", (e) => {
              e.stopPropagation();
              const rawId = book.bookId.replace(/^weread-/, "");
              const reviewId = h.wereadReviewId ? (h.wereadReviewId.split("_")[1] ?? h.wereadReviewId) : "";
              // weread:// 协议直接拉起 App 并定位到划线
              const appUrl = `weread://reader/${rawId}#r=${reviewId}`;
              window.open(appUrl, "_blank");
            });
          }
          const collapseBtn = ctxFooter.createEl("button", {
            text: "\u220F \u6536\u8D77",
            type: "button",
            cls: "readflow-btn readflow-btn--ghost readflow-btn--xs",
          });
          collapseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.expandedHighlightId = null;
            this.render();
          });
        }
      }
      card.addEventListener("click", (e) => {
        if (e.target.closest("input, button")) return;
        if (h.contextAbstract) {
          if (this.expandedHighlightId === h.id) this.expandedHighlightId = null;
          else this.expandedHighlightId = h.id;
          this.render();
        }
      });
      card.addEventListener("mouseenter", () => {
        if (!h.contextAbstract || this.expandedHighlightId === h.id) return;
        this.hoverCardId = h.id;
        this.hoverTimeoutId = window.setTimeout(() => {
          if (this.hoverCardId === h.id) {
            this.expandedHighlightId = h.id;
            this.render();
          }
        }, 1800);
      });
      card.addEventListener("mouseleave", () => {
        this.hoverCardId = null;
        if (this.hoverTimeoutId) {
          clearTimeout(this.hoverTimeoutId);
          this.hoverTimeoutId = null;
        }
      });
      const actions = card.createDiv("readflow-card-actions");
      const edit = actions.createEl("button", { text: "\u6574\u7406", type: "button" });
      edit.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      edit.addEventListener("click", () => {
        new QuickCaptureModal(this.app, this.plugin, { book, highlight: h }, () => {
          void this.plugin.persistDisk();
          this.render();
        }).open();
      });
      const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(h.status) + 1] || "processed";
      const nextLabel = STATUS_LABELS[nextStatus] || "\u5DF2\u5904\u7406";
      const mark = actions.createEl("button", { text: `\u2192 ${nextLabel}`, type: "button" });
      mark.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      mark.style.color = STATUS_COLORS[nextStatus] || "#10b981";
      mark.title = `\u70B9\u51FB\u5C06\u72B6\u6001\u8F6C\u4E3A\u300C${nextLabel}\u300D`;
      mark.addEventListener("click", () => {
        const cached = this.plugin.diskData.books[book.bookId];
        if (!cached) return;
        this.plugin.diskData.books[book.bookId] = {
          ...cached,
          highlights: cached.highlights.map((x) => (x.id === h.id ? { ...h, status: nextStatus } : x)),
          lastSync: Date.now(),
        };
        void this.plugin.persistDisk();
        this.render();
      });
      if (canPushHighlightToWeread(h)) {
        const push = actions.createEl("button", { text: "\u2191 \u63A8\u9001\u60F3\u6CD5", type: "button" });
        push.classList.add("readflow-btn", "readflow-btn--accent", "readflow-btn--sm");
        push.title = "\u5C06\u60F3\u6CD5\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66";
        push.addEventListener("click", async () => {
          push.disabled = true;
          push.textContent = "\u63A8\u9001\u4E2D\u2026";
          const result = await this.plugin.pushHighlightNote(book.bookId, h);
          if (result.ok) {
            new import_obsidian4.Notice("\u2705 \u60F3\u6CD5\u5DF2\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66");
            push.textContent = "\u2713 \u5DF2\u63A8\u9001";
            push.classList.add("readflow-btn--pushed");
          } else {
            new import_obsidian4.Notice(
              "\u274C \u63A8\u9001\u5931\u8D25\uFF1A" + formatPushNoteError(result),
              12e3,
            );
            console.error("[ReadFlow] push failed", result);
            push.textContent = "\u2191 \u63A8\u9001\u60F3\u6CD5";
            push.disabled = false;
          }
        });
      }
    }
  }
  async renderKnowledgeInspector(book, visible) {
    const pane = this.contentEl.querySelector(".readflow-knowledge-scroll");
    if (!(pane instanceof HTMLElement)) {
      return;
    }
    pane.empty();
    let scopeBook = this.buildKnowledgeScope(book, visible);
    const availableTopics = new Set(scopeBook.highlights.map((h) => (h.topic || "").trim()).filter(Boolean));
    if (this.selectedKnowledgeTopic && !availableTopics.has(this.selectedKnowledgeTopic)) {
      this.selectedKnowledgeTopic = null;
    }
    if (this.selectedKnowledgeTopic) {
      scopeBook = {
        ...scopeBook,
        title: `${scopeBook.title} - ${this.selectedKnowledgeTopic}`,
        highlights: scopeBook.highlights.filter((h) => (h.topic || "").trim() === this.selectedKnowledgeTopic),
      };
    }
    const selectedCount = book.highlights.filter((h) => this.selectedHighlightIds.has(h.id)).length;
    let scopeLabel =
      selectedCount > 0
        ? `\u5F53\u524D\u8303\u56F4\uFF1A\u5DF2\u9009 ${scopeBook.highlights.length} \u6761`
        : visible.length !== book.highlights.length
          ? `\u5F53\u524D\u8303\u56F4\uFF1A\u7B5B\u9009 ${scopeBook.highlights.length} \u6761`
          : `\u5F53\u524D\u8303\u56F4\uFF1A\u5168\u4E66 ${scopeBook.highlights.length} \u6761`;
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
          const path = await writeTopicKnowledgeToVault(
            this.app,
            this.plugin.settings,
            book,
            this.selectedKnowledgeTopic,
          );
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
      pane.createEl("p", {
        text: "\u5F53\u524D\u8303\u56F4\u4E0B\u6CA1\u6709\u53EF\u5206\u6790\u7684\u6458\u5F55\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    await this.renderKnowledgePreviewSection(pane, book, scopeBook);
    if (this.mindmapMode === "people") {
      this.renderEntityRelationSection(pane, book, scopeBook);
      this.renderEntityCooccurrenceSection(pane, book, scopeBook);
      this.renderEntityAliasSection(pane, book, scopeBook);
    }
    if (this.mindmapMode === "narrative") {
      this.renderPlotEventsSection(pane, book, scopeBook);
    }
    if (isIdeasWorkbenchMode(this.mindmapMode)) {
      this.renderTopicSummarySection(pane, scopeBook);
      this.renderRelationSection(pane, book, scopeBook);
    }
    if (this.shouldRestoreScroll && this._scrollRestoreEl instanceof HTMLElement) {
      const el = this._scrollRestoreEl;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        requestAnimationFrame(() => {
          if (el.scrollHeight - el.clientHeight > 0) {
            el.scrollTop = Math.round(this._scrollRestorePct * (el.scrollHeight - el.clientHeight));
          }
        });
      }
      this.shouldRestoreScroll = false;
    }
  }
  renderGraphSection(container, book, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section readflow-graph-section");
    const head = sec.createDiv("readflow-section-inline-head");
    const graphTitle =
      this.mindmapLens === "people"
        ? "\u4EBA\u7269\u5173\u7CFB\u56FE"
        : this.mindmapLens === "ideas"
          ? "\u89C2\u70B9\u5173\u7CFB\u56FE"
          : "\u5173\u7CFB\u56FE\u8C31";
    head.createEl("h5", { text: graphTitle, cls: "readflow-knowledge-title" });
    const headActions = head.createDiv("readflow-inline-actions");
    if (this.mindmapLens === "people" || this.mindmapBase === "entity") {
      const addRelBtn = headActions.createEl("button", { text: "+\u4EBA\u7269\u5173\u7CFB", type: "button" });
      addRelBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      addRelBtn.addEventListener("click", () =>
        this.promptAddEntityRelation(book, scopeBook, () => this.refreshKnowledgePane(book)),
      );
    }
    const model = buildRelationGraphModel(book, scopeBook, this.getMindMapOpts(scopeBook));
    if (model.nodes.length === 0) {
      sec.createEl("p", { text: model.emptyMsg, cls: "readflow-muted" });
      return;
    }
    const meta = headActions;
    meta.createEl("span", { text: `${model.nodes.length} \u8282\u70B9`, cls: "readflow-chip readflow-chip--soft" });
    meta.createEl("span", { text: `${model.edges.length} \u5173\u7CFB`, cls: "readflow-chip" });
    if (model.usingTopicFallback) {
      meta.createEl("span", { text: "\u4E3B\u9898\u94FE\uFF08\u865A\u7EBF\uFF09", cls: "readflow-chip readflow-chip--accent" });
    }
    const host = sec.createDiv("readflow-graph-host");
    renderRelationGraphCanvas(host, book, scopeBook, this.getMindMapOpts(scopeBook));
  }
  persistMindMapPrefs() {
    localStorage.setItem("readflow.mmWorkbench", this.mindmapWorkbench || workbenchForMode(this.mindmapMode));
    localStorage.setItem("readflow.mmMode", this.mindmapMode || "structure");
    localStorage.setItem("readflow.mmBase", this.mindmapBase || "book");
    localStorage.setItem("readflow.mmView", this.mindmapView || "tree");
    localStorage.setItem("readflow.mmTopic", this.mindmapTopic || "");
    localStorage.setItem("readflow.mmEntity", this.mindmapEntity || "");
    localStorage.setItem("readflow.mmLens", this.mindmapLens || "all");
  }
  describeMindMapScope(scopeBook) {
    const opts = this.getMindMapOpts(scopeBook);
    const scoped = scopedBookForMindMap(scopeBook, opts);
    const meta = MINDMAP_MODE_META[this.mindmapMode] || MINDMAP_MODE_META.structure;
    const wb = WORKBENCH_META[this.mindmapWorkbench] || WORKBENCH_META.ideas;
    const viewLabel =
      this.mindmapView === "graph"
        ? "\u5173\u7CFB\u56FE"
        : this.mindmapView === "timeline"
          ? "\u7AE0\u8282\u65F6\u95F4\u8F74"
          : "\u6811\u5F62\u56FE";
    const parts = [wb.label, meta.label, viewLabel, scoped.highlights.length + " \u6761"];
    if (this.mindmapMode === "people") {
      parts.push(collectEntityStats(scoped).length + " \u4E2A\u4EBA\u7269");
    }
    if (this.mindmapMode === "ideas") {
      const untyped = scoped.highlights.filter((h) => !h.highlightType).length;
      if (untyped > 0) parts.push(untyped + " \u6761\u5F85\u5206\u7C7B");
    }
    if (this.mindmapMode === "narrative") {
      parts.push(collectEntityStats(scoped).length + " \u4E2A\u4EBA\u7269");
      parts.push(buildNarrativeTimelineModel(scoped).chapters.length + " \u7AE0");
    }
    if (this.mindmapMode === "topic" && opts.topic) parts.push(opts.topic);
    return parts.join(" \u00B7 ");
  }
  renderMindMapWorkbench(parent, book, scopeBook, onChange, onModeChange) {
    const self = this;
    const wrap = parent.createDiv("readflow-mm-workbench");
    const rowWb = wrap.createDiv("readflow-mm-workbench-row readflow-mm-workbench-row--primary");
    rowWb.createSpan({ text: "\u5DE5\u4F5C\u53F0", cls: "readflow-mm-workbench-label" });
    const wbHost = rowWb.createDiv("readflow-mm-preset-group readflow-mm-workbench-tabs");
    for (const wbId of Object.keys(WORKBENCH_META)) {
      const wbMeta = WORKBENCH_META[wbId];
      const wbBtn = wbHost.createEl("button", { text: wbMeta.label, type: "button" });
      wbBtn.classList.add("readflow-mm-preset-btn", "readflow-mm-workbench-tab");
      wbBtn.title = wbMeta.desc;
      if ((self.mindmapWorkbench || workbenchForMode(self.mindmapMode)) === wbId) {
        wbBtn.classList.add("is-active");
      }
      wbBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyWorkbench(self, wbId);
        self.persistMindMapPrefs();
        const refresh = typeof onModeChange === "function" ? onModeChange : onChange;
        refresh();
      });
    }
    const wb = WORKBENCH_META[self.mindmapWorkbench || workbenchForMode(self.mindmapMode)] || WORKBENCH_META.ideas;
    if (wb.modes.length > 1) {
      const rowSub = wrap.createDiv("readflow-mm-workbench-row");
      rowSub.createSpan({ text: "\u5B50\u6A21\u5F0F", cls: "readflow-mm-workbench-label" });
      const subHost = rowSub.createDiv("readflow-mm-preset-group");
      for (const modeId of wb.modes) {
        const meta = MINDMAP_MODE_META[modeId];
        if (!meta) continue;
        const btn = subHost.createEl("button", { text: meta.label, type: "button" });
        btn.classList.add("readflow-mm-preset-btn", "readflow-mm-preset-btn--sub");
        btn.title = meta.desc;
        if (self.mindmapMode === modeId) btn.classList.add("is-active");
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          applyMindMapMode(self, modeId);
          self.mindmapWorkbench = workbenchForMode(modeId);
          self.persistMindMapPrefs();
          const refresh = typeof onModeChange === "function" ? onModeChange : onChange;
          refresh();
        });
      }
    }
    if (self.mindmapMode === "people") {
      const row2 = wrap.createDiv("readflow-mm-workbench-row");
      row2.createSpan({ text: "\u5448\u73B0\u65B9\u5F0F", cls: "readflow-mm-workbench-label" });
      const viewHost = row2.createDiv("readflow-mm-preset-group");
      for (const v of [
        { id: "tree", label: "\u6811\u5F62" },
        { id: "graph", label: "\u5173\u7CFB\u56FE" },
      ]) {
        const vbtn = viewHost.createEl("button", { text: v.label, type: "button" });
        vbtn.classList.add("readflow-mm-preset-btn", "readflow-mm-preset-btn--sub");
        if (self.mindmapView === v.id) vbtn.classList.add("is-active");
        vbtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          self.mindmapView = v.id;
          self.persistMindMapPrefs();
          onChange();
        });
      }
    }
    wrap.createEl("p", { text: self.describeMindMapScope(scopeBook), cls: "readflow-mm-workbench-status" });
    const ctxRow = wrap.createDiv("readflow-mm-workbench-row readflow-mm-workbench-row--ctx");
    if (self.mindmapMode === "topic") {
      const tops = summarizeTopics(scopeBook);
      if (tops.length) {
        ctxRow.createSpan({ text: "\u4E3B\u9898", cls: "readflow-mm-workbench-label" });
        const sel = ctxRow.createEl("select", { cls: "readflow-select readflow-select--sm" });
        for (const t of tops) {
          const opt = sel.createEl("option", { text: t.topic });
          opt.value = t.topic;
        }
        if (self.mindmapTopic || self.selectedKnowledgeTopic) {
          sel.value = self.mindmapTopic || self.selectedKnowledgeTopic;
        }
        sel.addEventListener("change", () => {
          self.mindmapTopic = sel.value;
          self.persistMindMapPrefs();
          onChange();
        });
      }
    }
    if (self.mindmapMode === "people") {
      const people = collectPersonEntries(scopeBook);
      if (people.length) {
        ctxRow.createSpan({ text: "\u805A\u7126", cls: "readflow-mm-workbench-label" });
        const sel2 = ctxRow.createEl("select", { cls: "readflow-select readflow-select--sm" });
        sel2.createEl("option", { value: "", text: "\u5168\u90E8\u4EBA\u7269" });
        for (const person of people.slice(0, 30)) {
          const opt2 = sel2.createEl("option");
          opt2.value = person.value;
          opt2.textContent = person.text;
        }
        if (self.mindmapEntity) {
          var focusName = entityDisplayLabel(self.mindmapEntity);
          var focusMatch = people.find(function (p) {
            return entityCanonicalKey(p.value) === entityCanonicalKey(focusName);
          });
          if (focusMatch) sel2.value = focusMatch.value;
        }
        sel2.addEventListener("change", () => {
          self.mindmapEntity = sel2.value;
          self.persistMindMapPrefs();
          onChange();
        });
      }
      const addRelBtn = ctxRow.createEl("button", { text: "+\u65B0\u589E\u4EBA\u7269\u5173\u7CFB", type: "button" });
      addRelBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      addRelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        self.promptAddEntityRelation(book, scopeBook, () => {
          if (self.mindmapMode === "people") {
            self.mindmapView = "graph";
            self.persistMindMapPrefs();
          }
          if (typeof onModeChange === "function") onModeChange();
          else if (self.currentBook) self.refreshKnowledgePane(self.currentBook);
          else onChange();
        });
      });
    }
  }
  getMindMapOpts(scopeBook, expanded) {
    var topic = (this.mindmapTopic || this.selectedKnowledgeTopic || "").trim();
    if (!topic && this.mindmapBase === "topic") {
      var tops = summarizeTopics(scopeBook);
      if (tops.length) topic = tops[0].topic;
    }
    var view = this.mindmapView || "tree";
    if (this.mindmapMode === "narrative") view = "timeline";
    return {
      base: this.mindmapBase || "book",
      view: view,
      lens: this.mindmapLens || "all",
      topic: topic,
      entity: (this.mindmapEntity || "").trim(),
      expanded: !!expanded,
    };
  }
  renderMindMapVisual(host, book, scopeBook, opts, onScaleChange) {
    host.empty();
    var fullOpts = Object.assign({}, opts, { onScaleChange: onScaleChange, sourceBook: book });
    if (opts.view === "timeline" || opts.lens === "narrative") {
      return renderNarrativeTimeline(host, book, scopeBook, fullOpts);
    }
    if (opts.view === "graph") {
      return renderRelationGraphCanvas(host, book, scopeBook, fullOpts);
    }
    return renderMindMapCanvas(host, scopeBook, null, fullOpts);
  }
  mindMapModalTitle(scopeBook, opts) {
    const meta = MINDMAP_MODE_META[this.mindmapMode] || MINDMAP_MODE_META.structure;
    const wb = WORKBENCH_META[this.mindmapWorkbench] || WORKBENCH_META.ideas;
    const parts = [scopeBook.title, wb.label, meta.label];
    if (opts.base === "topic" && opts.topic) parts.push(opts.topic);
    if (opts.base === "entity" && opts.entity && this.mindmapMode === "people") {
      parts.push(entityDisplayLabel(opts.entity));
    }
    parts.push(
      opts.view === "graph"
        ? "\u5173\u7CFB\u56FE\u8C31"
        : opts.view === "timeline"
          ? "\u7AE0\u8282\u65F6\u95F4\u8F74"
          : "\u77E5\u8BC6\u8111\u56FE",
    );
    return parts.join(" \u2014 ");
  }
  renderEntityRelationSection(container, book, scopeBook) {
    if (this.mindmapMode !== "people") return;
    const liveBook = this.plugin.diskData.books[book.bookId] || book;
    const rels = liveBook.entityRelations || [];
    const sec = container.createDiv("readflow-knowledge-section readflow-entity-relation-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u4EBA\u7269\u5173\u7CFB\u660E\u7EC6", cls: "readflow-knowledge-title" });
    const headActions = head.createDiv("readflow-inline-actions");
    const addBtn = headActions.createEl("button", { text: "+\u65B0\u589E", type: "button" });
    addBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    addBtn.addEventListener("click", () => this.promptAddEntityRelation(liveBook, scopeBook, () => this.refreshKnowledgePane(liveBook)));
    if (rels.length === 0) {
      sec.createEl("p", {
        text: "\u6682\u65E0\u624B\u52A8\u5EFA\u7ACB\u7684\u4EBA\u7269\u5173\u7CFB\u3002\u5171\u73B0\u4E0E\u624B\u52A8\u5173\u7CFB\u5747\u4F1A\u663E\u793A\u5728\u5173\u7CFB\u56FE\u8C31\u4E2D\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    const lookup = buildEntityLabelLookup(scopeBook);
    for (const rel of rels) {
      const row = sec.createDiv("readflow-edge-row readflow-entity-edge-row");
      const copy = row.createDiv("readflow-edge-copy");
      copy.createEl("span", { text: rel.hint || "\u5173\u7CFB", cls: "readflow-chip readflow-chip--entity" });
      const anchor = relationAnchorMeta(liveBook, rel.sinceHighlightId);
      copy.createEl("p", {
        text: `${entityGraphLabel(rel.source, lookup)} \u2194 ${entityGraphLabel(rel.target, lookup)}`,
        cls: "readflow-card-note-text",
      });
      if (anchor) {
        copy.createEl("p", {
          text: `\u8D77\u59CB\uFF1A${anchor.chapter} \u00B7 ${anchor.excerpt}`,
          cls: "readflow-muted readflow-entity-rel-anchor",
        });
      }
      const actions = row.createDiv("readflow-inline-actions");
      const deleteBtn = actions.createEl("button", { text: "\u5220\u9664", type: "button" });
      deleteBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      deleteBtn.addEventListener("click", () => this.removeEntityRelation(liveBook, rel.source, rel.target, rel.hint));
    }
  }
  promptAddEntityRelation(book, scopeBook, onSaved) {
    new EntityRelationModal(this.app, scopeBook, (source, target, hint, anchorOpts) => {
      this.addEntityRelation(book, source, target, hint, onSaved, anchorOpts);
    }).open();
  }
  refreshKnowledgePane(book) {
    if (!book) return;
    const tree = this.currentTree || buildChapterTree(book.highlights);
    this.currentBook = this.plugin.diskData.books[book.bookId] || book;
    this.currentTree = tree;
    this.renderVisibleList(this.currentBook, tree);
  }
  addEntityRelation(book, source, target, hint, onSaved, anchorOpts) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const srcName = entityDisplayLabel(source);
    const tgtName = entityDisplayLabel(target);
    const relations = [...(cached.entityRelations || [])];
    const duplicate = relations.some(function (r) {
      var samePair =
        (entityCanonicalKey(r.source) === entityCanonicalKey(srcName) &&
          entityCanonicalKey(r.target) === entityCanonicalKey(tgtName)) ||
        (entityCanonicalKey(r.source) === entityCanonicalKey(tgtName) &&
          entityCanonicalKey(r.target) === entityCanonicalKey(srcName));
      return samePair && r.hint === hint;
    });
    const rel = { source: srcName, target: tgtName, hint };
    if (anchorOpts && anchorOpts.sinceHighlightId) {
      rel.sinceHighlightId = anchorOpts.sinceHighlightId;
      if (anchorOpts.chapterUid != null) rel.chapterUid = anchorOpts.chapterUid;
      else {
        const meta = relationAnchorMeta(cached, anchorOpts.sinceHighlightId);
        if (meta) rel.chapterUid = meta.chapterUid;
      }
    }
    if (!duplicate) relations.push(rel);
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      entityRelations: relations,
      lastSync: Date.now(),
    };
    void this.plugin.persistDisk();
    if (!duplicate) {
      if (this.mindmapMode === "people") {
        this.mindmapView = "graph";
        this.persistMindMapPrefs();
      }
      new import_obsidian5.Notice("\u5DF2\u6DFB\u52A0\u4EBA\u7269\u5173\u7CFB\uFF0C\u5DF2\u540C\u6B65\u5230\u5173\u7CFB\u56FE\u8C31");
    } else {
      new import_obsidian5.Notice("\u8BE5\u4EBA\u7269\u5173\u7CFB\u5DF2\u5B58\u5728");
    }
    if (typeof onSaved === "function") {
      onSaved();
      return;
    }
    this.refreshKnowledgePane(book);
  }
  removeEntityRelation(book, source, target, hint) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const relations = (cached.entityRelations || []).filter(function (r) {
      return !(
        entityCanonicalKey(r.source) === entityCanonicalKey(source) &&
        entityCanonicalKey(r.target) === entityCanonicalKey(target) &&
        r.hint === hint
      );
    });
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      entityRelations: relations.length ? relations : void 0,
      lastSync: Date.now(),
    };
    void this.plugin.persistDisk();
    this.refreshKnowledgePane(book);
  }
  renderEntityCooccurrenceSection(container, book, scopeBook) {
    if (this.mindmapMode !== "people") return;
    const suggestions = inferEntityCooccurrenceSuggestions(scopeBook);
    const sec = container.createDiv("readflow-knowledge-section readflow-cooccurrence-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u5171\u73B0\u5173\u7CFB\u5EFA\u8BAE", cls: "readflow-knowledge-title" });
    if (suggestions.length === 0) {
      sec.createEl("p", {
        text: "\u6682\u65E0\u65B0\u7684\u5171\u73B0\u5EFA\u8BAE\u3002\u540C\u4E00\u6458\u5F55\u5185\u591A\u4EBA\u51FA\u73B0\u65F6\u4F1A\u81EA\u52A8\u63A8\u8350\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    for (const sug of suggestions) {
      const row = sec.createDiv("readflow-edge-row readflow-cooccurrence-row");
      const copy = row.createDiv("readflow-edge-copy");
      copy.createEl("span", { text: "\u5171\u73B0 " + sug.count + "\u6B21", cls: "readflow-chip readflow-chip--accent" });
      copy.createEl("p", {
        text: `${sug.source} \u2194 ${sug.target}`,
        cls: "readflow-card-note-text",
      });
      const actions = row.createDiv("readflow-inline-actions");
      const adoptBtn = actions.createEl("button", { text: "\u91C7\u7EB3", type: "button" });
      adoptBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
      adoptBtn.addEventListener("click", () => {
        this.addEntityRelation(book, sug.source, sug.target, "\u5171\u73B0", () => this.refreshKnowledgePane(book), {
          sinceHighlightId: sug.sinceHighlightId,
          chapterUid: sug.chapterUid,
        });
      });
    }
  }
  renderEntityAliasSection(container, book, scopeBook) {
    if (this.mindmapMode !== "people") return;
    const liveBook = this.plugin.diskData.books[book.bookId] || book;
    const aliases = liveBook.entityAliases || {};
    const sec = container.createDiv("readflow-knowledge-section readflow-alias-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u4EBA\u7269\u522B\u540D\u5408\u5E76", cls: "readflow-knowledge-title" });
    const headActions = head.createDiv("readflow-inline-actions");
    const addBtn = headActions.createEl("button", { text: "+\u522B\u540D", type: "button" });
    addBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    addBtn.addEventListener("click", () => this.promptAddEntityAlias(liveBook, scopeBook));
    const keys = Object.keys(aliases);
    if (keys.length === 0) {
      sec.createEl("p", {
        text: "\u540C\u4E00\u4EBA\u7269\u591A\u4E2A\u540D\u5B57\u65F6\uFF0C\u53EF\u5408\u5E76\u5230\u540C\u4E00\u8282\u70B9\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    for (const canon of keys) {
      const list = Array.isArray(aliases[canon]) ? aliases[canon] : [aliases[canon]];
      for (const alias of list) {
        const row = sec.createDiv("readflow-edge-row readflow-alias-row");
        const copy = row.createDiv("readflow-edge-copy");
        copy.createEl("p", { text: `${alias} \u2192 ${canon}`, cls: "readflow-card-note-text" });
        const actions = row.createDiv("readflow-inline-actions");
        const delBtn = actions.createEl("button", { text: "\u5220\u9664", type: "button" });
        delBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
        delBtn.addEventListener("click", () => this.removeEntityAlias(liveBook, canon, alias));
      }
    }
  }
  promptAddEntityAlias(book, scopeBook) {
    const entries = collectPersonEntries(scopeBook);
    if (entries.length < 2) {
      new import_obsidian5.Notice("\u81F3\u5C11\u9700\u8981\u4E24\u4E2A\u4EBA\u7269\u6807\u7B7E\u624D\u80FD\u5408\u5E76\u522B\u540D");
      return;
    }
    const modal = new import_obsidian5.Modal(this.app);
    modal.titleEl.setText("\u5408\u5E76\u4EBA\u7269\u522B\u540D");
    const { contentEl } = modal;
    contentEl.addClass("readflow-modal-body", "readflow-entity-rel-modal");
    const form = contentEl.createDiv("readflow-entity-rel-form");
    form.createEl("label", { text: "\u6B63\u5F0F\u540D\uFF08\u5408\u5E76\u76EE\u6807\uFF09", cls: "readflow-field-label" });
    const canonSelect = form.createEl("select", { cls: "readflow-select" });
    for (const entry of entries) {
      const opt = canonSelect.createEl("option");
      opt.value = entry.value;
      opt.textContent = entry.text;
    }
    form.createEl("label", { text: "\u522B\u540D", cls: "readflow-field-label" });
    const aliasSelect = form.createEl("select", { cls: "readflow-select" });
    for (const entry of entries) {
      const opt2 = aliasSelect.createEl("option");
      opt2.value = entry.value;
      opt2.textContent = entry.text;
    }
    if (entries.length > 1) aliasSelect.value = entries[1].value;
    const actions = contentEl.createDiv("readflow-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", type: "button" });
    cancelBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    cancelBtn.addEventListener("click", () => modal.close());
    const saveBtn = actions.createEl("button", { text: "\u4FDD\u5B58", type: "button" });
    saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
    saveBtn.addEventListener("click", () => {
      this.addEntityAlias(book, canonSelect.value, aliasSelect.value);
      modal.close();
    });
    modal.open();
  }
  addEntityAlias(book, canonical, alias) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const canon = entityDisplayLabel(canonical).trim();
    const ali = entityDisplayLabel(alias).trim();
    if (!canon || !ali || entityCanonicalKey(canon) === entityCanonicalKey(ali)) {
      new import_obsidian5.Notice("\u8BF7\u9009\u62E9\u4E0D\u540C\u7684\u4E24\u4E2A\u4EBA\u7269");
      return;
    }
    const next = { ...(cached.entityAliases || {}) };
    const existing = next[canon];
    const list = Array.isArray(existing) ? [...existing] : existing ? [existing] : [];
    if (!list.some((x) => entityCanonicalKey(x) === entityCanonicalKey(ali))) list.push(ali);
    next[canon] = list;
    this.plugin.diskData.books[book.bookId] = { ...cached, entityAliases: next, lastSync: Date.now() };
    void this.plugin.persistDisk();
    new import_obsidian5.Notice("\u5DF2\u5408\u5E76\u522B\u540D");
    this.refreshKnowledgePane(book);
  }
  removeEntityAlias(book, canonical, alias) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached || !cached.entityAliases) return;
    const next = { ...cached.entityAliases };
    const list = Array.isArray(next[canonical]) ? [...next[canonical]] : next[canonical] ? [next[canonical]] : [];
    const filtered = list.filter((x) => entityCanonicalKey(x) !== entityCanonicalKey(alias));
    if (filtered.length === 0) delete next[canonical];
    else next[canonical] = filtered;
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      entityAliases: Object.keys(next).length ? next : void 0,
      lastSync: Date.now(),
    };
    void this.plugin.persistDisk();
    this.refreshKnowledgePane(book);
  }
  renderPlotEventsSection(container, book, scopeBook) {
    if (this.mindmapMode !== "narrative") return;
    const liveBook = this.plugin.diskData.books[book.bookId] || book;
    const events = liveBook.plotEvents || [];
    const sec = container.createDiv("readflow-knowledge-section readflow-plot-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u60C5\u8282\u4E8B\u4EF6", cls: "readflow-knowledge-title" });
    const headActions = head.createDiv("readflow-inline-actions");
    const addBtn = headActions.createEl("button", { text: "+\u4E8B\u4EF6", type: "button" });
    addBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    addBtn.addEventListener("click", () => this.promptAddPlotEvent(liveBook, scopeBook));
    if (events.length === 0) {
      sec.createEl("p", {
        text: "\u6807\u8BB0\u5173\u952E\u60C5\u8282\u8282\u70B9\uFF0C\u5C06\u663E\u793A\u5728\u7AE0\u8282\u65F6\u95F4\u8F74\u7684\u300C\u60C5\u8282\u7EBF\u300D\u884C\u3002",
        cls: "readflow-muted",
      });
      return;
    }
    const hlMap = highlightByIdMap(scopeBook);
    for (const ev of events) {
      const hl = hlMap.get(ev.atHighlightId);
      const row = sec.createDiv("readflow-edge-row readflow-plot-row");
      const copy = row.createDiv("readflow-edge-copy");
      copy.createEl("span", { text: ev.hint || "\u4E8B\u4EF6", cls: "readflow-chip readflow-chip--plot" });
      if (hl) {
        copy.createEl("p", {
          text: `${chapterLabel(hl)} \u00B7 ${shortLabel(hl.content, 32)}`,
          cls: "readflow-card-note-text",
        });
      }
      if ((ev.participants || []).length > 0) {
        copy.createEl("p", {
          text: ev.participants.join("\u3001"),
          cls: "readflow-muted",
        });
      }
      const actions = row.createDiv("readflow-inline-actions");
      const delBtn = actions.createEl("button", { text: "\u5220\u9664", type: "button" });
      delBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      delBtn.addEventListener("click", () => this.removePlotEvent(liveBook, ev.id));
    }
  }
  promptAddPlotEvent(book, scopeBook) {
    new PlotEventModal(this.app, scopeBook, (payload) => {
      this.addPlotEvent(book, payload);
    }).open();
  }
  addPlotEvent(book, payload) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const events = [...(cached.plotEvents || [])];
    events.push({
      id: newPlotEventId(),
      hint: payload.hint,
      atHighlightId: payload.atHighlightId,
      participants: payload.participants || [],
      chapterUid: payload.chapterUid,
    });
    this.plugin.diskData.books[book.bookId] = { ...cached, plotEvents: events, lastSync: Date.now() };
    void this.plugin.persistDisk();
    new import_obsidian5.Notice("\u5DF2\u6DFB\u52A0\u60C5\u8282\u4E8B\u4EF6");
    this.refreshKnowledgePane(book);
  }
  removePlotEvent(book, eventId) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    const events = (cached.plotEvents || []).filter((ev) => ev.id !== eventId);
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      plotEvents: events.length ? events : void 0,
      lastSync: Date.now(),
    };
    void this.plugin.persistDisk();
    this.refreshKnowledgePane(book);
  }
  renderTopicSummarySection(container, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u4E3B\u9898\u805A\u5408", cls: "readflow-knowledge-title" });
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
        text:
          this.selectedKnowledgeTopic === summary.topic ? "\u53D6\u6D88\u805A\u7126" : "\u53EA\u770B\u6B64\u4E3B\u9898",
        type: "button",
      });
      scopeBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
      scopeBtn.addEventListener("click", () => {
        if (this.selectedKnowledgeTopic === summary.topic) {
          this.selectedKnowledgeTopic = null;
        } else {
          this.selectedKnowledgeTopic = summary.topic;
          this.mindmapTopic = summary.topic;
          this.mindmapBase = "topic";
          this.persistMindMapPrefs();
        }
        this.render();
      });
    }
  }
  renderRelationSection(container, book, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section");
    sec.createEl("h5", { text: "\u5173\u7CFB\u5EFA\u8BAE", cls: "readflow-knowledge-title" });
    const edges = inferKnowledgeEdges(scopeBook).slice(0, 8);
    if (edges.length === 0) {
      sec.createEl("p", {
        text: "\u5F53\u524D\u8303\u56F4\u4E0B\u6682\u65E0\u5173\u7CFB\u5EFA\u8BAE\u3002",
        cls: "readflow-muted",
      });
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
        cls: `readflow-chip ${edge.explicit ? "readflow-chip--soft" : "readflow-chip--accent"}`,
      });
      copy.createEl("p", {
        text: `${source.content.slice(0, 24)}${source.content.length > 24 ? "\u2026" : ""} \u2192 ${target.content.slice(0, 24)}${target.content.length > 24 ? "\u2026" : ""}`,
        cls: "readflow-card-note-text",
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
        placeholder: "\u5173\u7CFB\u7C7B\u578B\uFF08\u5982\uFF1A\u5E08\u627F\uFF09",
      });
      customInput.value = RELATION_HINT_OPTIONS.includes(edge.hint) ? "" : edge.hint;
      customInput.style.display = hintSelect.value === "__custom__" ? "block" : "none";
      hintSelect.addEventListener("change", () => {
        customInput.style.display = hintSelect.value === "__custom__" ? "block" : "none";
      });
      const getHintValue = () =>
        hintSelect.value === "__custom__" ? customInput.value.trim() || "\u81EA\u5B9A\u4E49" : hintSelect.value;
      if (edge.explicit) {
        const updateBtn = actions.createEl("button", { text: "\u66F4\u65B0", type: "button" });
        updateBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
        updateBtn.addEventListener("click", () =>
          this.updateKnowledgeEdge(book, edge.sourceId, edge.targetId, getHintValue()),
        );
        const deleteBtn = actions.createEl("button", { text: "\u5220\u9664", type: "button" });
        deleteBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
        deleteBtn.addEventListener("click", () =>
          this.removeKnowledgeEdge(book, edge.sourceId, edge.targetId, edge.hint),
        );
      } else {
        const adoptBtn = actions.createEl("button", { text: "\u91C7\u7EB3", type: "button" });
        adoptBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
        adoptBtn.addEventListener("click", () => this.applyKnowledgeEdge(book, { ...edge, hint: getHintValue() }));
      }
    }
  }
  async renderKnowledgePreviewSection(container, book, scopeBook) {
    const self = this;
    const mmSec = container.createDiv("readflow-knowledge-section readflow-mm-section");
    const mmHead = mmSec.createDiv("readflow-section-inline-head");
    mmHead.createEl("h5", { text: "\u77E5\u8BC6\u89C6\u56FE", cls: "readflow-knowledge-title" });
    const mmActions = mmHead.createDiv("readflow-inline-actions");
    const expandBtn = mmActions.createEl("button", { text: "\u2922 \u5C55\u5F00\u5927\u56FE", type: "button" });
    expandBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    expandBtn.addEventListener("click", () => this.openMindMapExpanded(book, scopeBook));
    const toolbarHost = mmSec.createDiv("readflow-mm-toolbar-inline");
    const vizHost = mmSec.createDiv("readflow-mm-viz-host");
    const getLiveBook = () => self.plugin.diskData.books[book.bookId] || book;
    const refreshMindMapInline = () => {
      const liveBook = getLiveBook();
      toolbarHost.empty();
      self.renderMindMapWorkbench(
        toolbarHost,
        liveBook,
        scopeBook,
        refreshMindMapInline,
        onWorkbenchModeChange,
      );
      vizHost.empty();
      const mmOpts = Object.assign({}, self.getMindMapOpts(scopeBook), {
        onHighlightSelect: function (id) {
          self.expandedHighlightId = id;
          if (self.currentBook && self.currentTree) {
            self.renderVisibleList(self.currentBook, self.currentTree);
          }
        },
      });
      self.renderMindMapVisual(vizHost, liveBook, scopeBook, mmOpts);
    };
    const onWorkbenchModeChange = () => {
      if (self.currentBook && self.currentTree) {
        self.refreshKnowledgePane(self.currentBook);
      } else {
        refreshMindMapInline();
      }
    };
    refreshMindMapInline();
    if (isIdeasWorkbenchMode(this.mindmapMode)) {
      this.renderKnowledgeCrystallize(container, scopeBook);
    }
    if (this.mindmapMode !== "narrative") {
      this.renderLocalReaderEntry(container, scopeBook);
    }
    if (!isIdeasWorkbenchMode(this.mindmapMode)) {
      return;
    }
    const sec = container.createDiv("readflow-knowledge-section readflow-mermaid-section");
    const mermaidHead = sec.createDiv("readflow-section-inline-head");
    mermaidHead.createEl("h5", { text: "MERMAID", cls: "readflow-knowledge-title" });
    const mermaidToggle = { collapsed: true };
    const mermaidBody = sec.createDiv("readflow-mermaid-body");
    mermaidBody.style.display = "none";
    const toggleBtn = mermaidHead.createEl("button", { text: "\u5C55\u5F00", type: "button" });
    toggleBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    toggleBtn.addEventListener("click", async () => {
      mermaidToggle.collapsed = !mermaidToggle.collapsed;
      mermaidBody.style.display = mermaidToggle.collapsed ? "none" : "block";
      toggleBtn.setText(mermaidToggle.collapsed ? "\u5C55\u5F00" : "\u6536\u8D77");
      if (!mermaidToggle.collapsed && mermaidBody.childElementCount === 0) {
        await this.renderMarkdownCard(
          mermaidBody,
          "\u4E3B\u9898\u8111\u56FE",
          buildTopicMindmap(scopeBook),
          "\u6682\u65E0",
        );
        await this.renderMarkdownCard(
          mermaidBody,
          "\u903B\u8F91\u5173\u7CFB",
          buildRelationsMermaid(scopeBook),
          "\u6682\u65E0",
        );
        await this.renderMarkdownCard(
          mermaidBody,
          "\u6838\u5FC3\u89C2\u70B9",
          buildCoreInsights(scopeBook),
          "\u6682\u65E0",
        );
      }
    });
  }
  openMindMapExpanded(book, scopeBook) {
    const self = this;
    if (!book) return;
    const getLiveBook = () => self.plugin.diskData.books[book.bookId] || book;
    const modal = new import_obsidian5.Modal(this.app);
    modal.modalEl.addClass("readflow-modal-root", "readflow-mm-modal");
    const { contentEl } = modal;
    contentEl.empty();
    contentEl.addClass("readflow-mm-modal-body");
    const hint = contentEl.createDiv("readflow-mm-modal-hint");
    hint.createEl("span", {
      text: "\u70B9\u51FB\u5C55\u5F00/\u6536\u8D77 \xB7 \u6EDA\u8F6E\u7F29\u653E\u5185\u5BB9 \xB7 \u62D6\u62FD\u5E73\u79FB \xB7 \u53F3\u4E0B\u89D2\u8C03\u6574\u7A97\u53E3",
      cls: "readflow-muted",
    });
    const actions = hint.createDiv("readflow-mm-modal-actions");
    const zoomOutBtn = actions.createEl("button", { text: "\u2212", type: "button" });
    zoomOutBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-mm-zoom-btn");
    zoomOutBtn.title = "\u7F29\u5C0F";
    const zoomLabel = actions.createEl("span", { text: "100%", cls: "readflow-mm-zoom-label" });
    const zoomInBtn = actions.createEl("button", { text: "+", type: "button" });
    zoomInBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm", "readflow-mm-zoom-btn");
    zoomInBtn.title = "\u653E\u5927";
    const fitBtn = actions.createEl("button", { text: "\u9002\u5E94\u7A97\u53E3", type: "button" });
    fitBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
    const toolbarHost = contentEl.createDiv("readflow-mm-modal-toolbar");
    const vizHost = contentEl.createDiv("readflow-mm-viz-host readflow-mm-modal-viz");
    const getMmControls = () => {
      const wrap = vizHost.querySelector(".readflow-mm-wrap, .readflow-graph-wrap, .readflow-narrative-wrap");
      return wrap?.readflowMmControls;
    };
    const updateZoomLabel = (s) => zoomLabel.setText(Math.round(s * 100) + "%");
    zoomOutBtn.addEventListener("click", () => getMmControls()?.zoomOut());
    zoomInBtn.addEventListener("click", () => getMmControls()?.zoomIn());
    fitBtn.addEventListener("click", () => getMmControls()?.resetView());
    const refreshModalMindMap = () => {
      const liveBook = getLiveBook();
      const opts = Object.assign({}, self.getMindMapOpts(scopeBook, true), {
        onHighlightSelect: function (id) {
          self.expandedHighlightId = id;
          modal.close();
          if (self.currentBook && self.currentTree) {
            self.renderVisibleList(self.currentBook, self.currentTree);
          }
        },
      });
      modal.titleEl.setText(self.mindMapModalTitle(scopeBook, opts));
      toolbarHost.empty();
      self.renderMindMapWorkbench(toolbarHost, liveBook, scopeBook, refreshModalMindMap, refreshModalMindMap);
      vizHost.empty();
      self.renderMindMapVisual(vizHost, liveBook, scopeBook, opts, updateZoomLabel);
    };
    requestAnimationFrame(function () {
      modal.open();
      requestAnimationFrame(function () {
        var modalBox = attachMindMapModalResize(modal);
        if (modalBox) {
          modalBox.addEventListener("readflow-mm-resize", function () {
            getMmControls()?.reflow();
          });
        }
        requestAnimationFrame(refreshModalMindMap);
      });
    });
  }
  renderLocalReaderEntry(container, scopeBook) {
    const sec = container.createDiv("readflow-knowledge-section readflow-reader-entry");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u672C\u5730\u9605\u8BFB", cls: "readflow-knowledge-title" });
    const body = sec.createDiv("readflow-reader-entry-body");
    body.createEl("p", {
      text: "\u5C06\u672C\u5730 EPUBTXT \u6587\u4EF6\u4EEC\u5F15\u5165 Obsidian\uFF0C\u5373\u53EF\u5728\u8BFB\u8BFA\u6A21\u5F0F\u4E2D\u9605\u8BFB\u5E76\u76F4\u63A5\u6458\u5F55\u3002\u73B0\u6709\u300C\u624B\u52A8\u6458\u5F55\u300D\u6309\u94AE\u5DF2\u652F\u6301\u4ECE\u5F53\u524D\u6587\u6863\u63D0\u53D6\u4E0A\u4E0B\u6587\u3002",
      cls: "readflow-muted",
    });
    const actions = head.createDiv("readflow-inline-actions");
    const readLocalBtn = actions.createEl("button", { text: "\u5F00\u542F\u8BFB\u8BFA\u6A21\u5F0F", type: "button" });
    readLocalBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    readLocalBtn.addEventListener("click", () => this.openLocalReaderModal(scopeBook));
  }
  openLocalReaderModal(scopeBook) {
    const modal = new import_obsidian5.Modal(this.app);
    modal.titleEl.setText(scopeBook.title + " \u2014 \u8BFB\u8BFA\u6A21\u5F0F");
    modal.modalEl.addClass("readflow-modal-root", "readflow-reader-modal");
    const { contentEl } = modal;
    contentEl.empty();
    contentEl.addClass("readflow-reader-modal-body");
    const navBar = contentEl.createDiv("readflow-reader-nav");
    const chapters = buildChapterTree(scopeBook.highlights);
    const chapterSelect = navBar.createEl("select", { cls: "readflow-reader-chapter-select" });
    chapterSelect.createEl("option", { value: "", text: "\u2014\u9009\u62E9\u7AE0\u8282\u2014" });
    for (const ch of chapters) {
      chapterSelect.createEl("option", {
        value: String(ch.chapterUid || ch.chapter),
        text: ch.chapter + " (" + ch.highlights.length + "\u6761)",
      });
    }
    const contentArea = contentEl.createDiv("readflow-reader-content");
    const hint = contentArea.createDiv("readflow-reader-hint");
    hint.createEl("p", {
      text: "\u9009\u62E9\u4E0A\u65B9\u7AE0\u8282\u540E\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u641C\u7D22\u672C\u5730\u6587\u4EF6\u4E2D\u7684\u7AE0\u8282\u5185\u5BB9\uFF0C\u5E76\u5728\u6B63\u6587\u4E2D\u9AD8\u4EAE\u60A8\u7684\u6458\u5F55\u3002",
      cls: "readflow-muted",
    });
    const hlHighlight = contentArea.createDiv("readflow-reader-highlights");
    const hlHead = hlHighlight.createDiv("readflow-reader-hl-head");
    hlHead.createEl("h4", { text: "\u5F53\u524D\u7AE0\u8282\u6458\u5F55", cls: "readflow-reader-hl-title" });
    const hlList = hlHighlight.createDiv("readflow-reader-hl-list");
    const loadChapter = (chapterName) => {
      hlList.empty();
      const chHighlights = scopeBook.highlights.filter((h) => (h.chapter || "") === chapterName);
      if (chHighlights.length === 0) {
        hlList.createEl("p", { text: "\u6B64\u7AE0\u8282\u6682\u65E0\u6458\u5F55", cls: "readflow-muted" });
        return;
      }
      for (const h of chHighlights) {
        const row = hlList.createDiv("readflow-card");
        row.createDiv("readflow-card-body").setText(h.content);
        const meta = row.createDiv("readflow-card-meta");
        if (h.highlightType) meta.createSpan({ cls: "readflow-chip readflow-chip--accent", text: h.highlightType });
        if (h.note) {
          const noteEl = row.createDiv("readflow-card-note");
          noteEl.createEl("span", { text: "\u60F3\u6CD5", cls: "readflow-card-note-label" });
          noteEl.createEl("p", { text: h.note, cls: "readflow-card-note-text" });
        }
        const captureBtn = row.createDiv("readflow-card-actions").createEl("button", {
          text: "\u523A\u4E3E\u6458\u5F55",
          type: "button",
          cls: "readflow-btn readflow-btn--primary readflow-btn--sm",
        });
        captureBtn.addEventListener("click", () => {
          new QuickCaptureModal(
            this.app,
            this.plugin,
            {
              book: scopeBook,
              highlight: h,
              compactMode: false,
            },
            () => {
              void this.plugin.persistDisk();
              this.render();
            },
          ).open();
        });
      }
    };
    chapterSelect.addEventListener("change", () => {
      if (chapterSelect.value) {
        const optText = chapterSelect.options[chapterSelect.selectedIndex].text;
        const chName = optText.replace(/ \(.*?\)$/, "");
        loadChapter(chName);
      }
    });
    modal.open();
  }
  renderKnowledgeCrystallize(container, scopeBook) {
    var _a;
    const sec = container.createDiv("readflow-knowledge-section readflow-crystallize-section");
    const head = sec.createDiv("readflow-section-inline-head");
    head.createEl("h5", { text: "\u77E5\u8BC6\u7ED3\u6676", cls: "readflow-knowledge-title" });
    const actions = head.createDiv("readflow-inline-actions");
    const cards = (_a = this.plugin.diskData.knowledgeCards) != null ? _a : [];
    const bookCards = cards.filter((c) => c.bookId === scopeBook.bookId);
    if (bookCards.length > 0) {
      actions.createEl("span", { text: bookCards.length + " \u5F20", cls: "readflow-knowledge-badge" });
    }
    const createBtn = actions.createEl("button", { text: "+ \u65B0\u5EFA\u77E5\u8BC6\u5361", type: "button" });
    createBtn.classList.add("readflow-btn", "readflow-btn--secondary", "readflow-btn--sm");
    createBtn.addEventListener("click", () => {
      this.openCrystallizeDialog(scopeBook);
    });
    if (bookCards.length > 0) {
      const list = sec.createDiv("readflow-crystallize-list");
      for (const card of bookCards.slice(0, 8)) {
        const row = list.createDiv("readflow-crystallize-card");
        const main = row.createDiv("readflow-crystallize-card-main");
        main.createEl("strong", { text: card.title, cls: "readflow-crystallize-title" });
        main.createEl("p", {
          text: card.insight.slice(0, 80) + (card.insight.length > 80 ? "\u2026" : ""),
          cls: "readflow-crystallize-insight",
        });
        const meta = row.createDiv("readflow-card-meta");
        meta.createSpan({
          cls: "readflow-chip readflow-chip--soft",
          text: card.sourceHighlightIds.length + " \u6761\u6765\u6E90",
        });
        if (card.tags.length > 0) {
          meta.createSpan({ cls: "readflow-chip", text: card.tags.slice(0, 3).join(", ") });
        }
        meta.createSpan({ cls: "readflow-chip", text: new Date(card.createdAt).toLocaleDateString("zh-CN") });
        const rowActions = row.createDiv("readflow-inline-actions");
        const exportBtn = rowActions.createEl("button", { text: "\u5BFC\u51FA\u7B14\u8BB0", type: "button" });
        exportBtn.classList.add("readflow-btn", "readflow-btn--ghost", "readflow-btn--sm");
        exportBtn.addEventListener("click", async () => {
          try {
            const book = this.plugin.diskData.books[card.bookId];
            const md = buildKnowledgeExportMd(card, book);
            const dir = this.plugin.settings.booksBasePath || "Books";
            const path = `${dir}/\u77E5\u8BC6\u5361/${safeSegment(card.title)}.md`;
            const folder = path.substring(0, path.lastIndexOf("/"));
            if (!this.app.vault.getAbstractFileByPath(folder)) {
              await this.app.vault.createFolder(folder);
            }
            const existing = this.app.vault.getAbstractFileByPath(path);
            if (existing) {
              await this.app.vault.modify(existing, md);
            } else {
              await this.app.vault.create(path, md);
            }
            new import_obsidian5.Notice("\u5DF2\u5BFC\u51FA: " + path);
          } catch (e) {
            console.error(e);
            new import_obsidian5.Notice("\u5BFC\u51FA\u5931\u8D25\uFF0C\u67E5\u770B\u63A7\u5236\u53F0");
          }
        });
      }
    } else {
      sec.createEl("p", {
        text: "\u52FE\u9009\u6458\u5F55 \u2192 \u65B0\u5EFA\u77E5\u8BC6\u5361 \u2192 \u5BFC\u51FA Vault",
        cls: "readflow-muted readflow-crystallize-oneliner",
      });
    }
  }
  openCrystallizeDialog(scopeBook) {
    var _a;
    const selectedIds = [...this.selectedHighlightIds];
    const sourceHighlights =
      selectedIds.length > 0
        ? scopeBook.highlights.filter((h) => this.selectedHighlightIds.has(h.id))
        : scopeBook.highlights.filter((h) => h.status === "processed" && h.importance >= 4).slice(0, 5);
    const modal = new import_obsidian5.Modal(this.app);
    modal.titleEl.setText("\u521B\u5EFA\u77E5\u8BC6\u5361");
    modal.modalEl.addClass("readflow-modal-root");
    const { contentEl } = modal;
    contentEl.addClass("readflow-capture-modal");
    let cardTitle = "";
    let cardInsight = "";
    let cardTags = "";
    const sourceSec = contentEl.createDiv("readflow-modal-section");
    sourceSec.createEl("h4", { text: "\u6765\u6E90\u6458\u5F55 (" + sourceHighlights.length + " \u6761)" });
    if (sourceHighlights.length === 0) {
      sourceSec.createEl("p", {
        text: "\u8BF7\u5148\u5728\u5DE6\u4FA7\u5217\u8868\u52FE\u9009\u6458\u5F55\uFF0C\u6216\u786E\u4FDD\u5DF2\u6709\u91CD\u8981\u5EA6 \u2265 4 \u7684\u5DF2\u5904\u7406\u6458\u5F55\u3002",
        cls: "readflow-muted",
      });
    } else {
      for (const h of sourceHighlights.slice(0, 6)) {
        const row = sourceSec.createDiv("readflow-related-row");
        const tag = h.highlightType ? " [" + (HIGHLIGHT_TYPE_LABELS[h.highlightType] || h.highlightType) + "]" : "";
        row.createEl("span", { text: h.content.slice(0, 80) + (h.content.length > 80 ? "\u2026" : "") + tag });
      }
    }
    const inputSec = contentEl.createDiv("readflow-modal-section");
    inputSec.createEl("h4", { text: "\u77E5\u8BC6\u63D0\u70BC" });
    new import_obsidian5.Setting(inputSec)
      .setName("\u77E5\u8BC6\u70B9\u6807\u9898")
      .setDesc("\u7528\u4E00\u53E5\u8BDD\u6982\u62EC\u8FD9\u4E2A\u77E5\u8BC6\u70B9")
      .addText((t) => {
        t.setPlaceholder("\u4F8B\uFF1A\u590D\u5229\u7684\u529B\u91CF\u4E0E\u957F\u671F\u4E3B\u4E49").onChange(
          (v) => (cardTitle = v),
        );
        t.inputEl.style.width = "100%";
      });
    new import_obsidian5.Setting(inputSec)
      .setName("\u6838\u5FC3\u89C1\u89E3")
      .setDesc(
        "\u7528\u81EA\u5DF1\u7684\u8BDD\u603B\u7ED3\u2014\u2014\u8FD9\u662F\u4ECE\u6458\u5F55\u5230\u77E5\u8BC6\u7684\u5173\u952E\u4E00\u6B65",
      )
      .addTextArea((ta) => {
        ta.setPlaceholder("\u6211\u4ECE\u8FD9\u4E9B\u6458\u5F55\u4E2D\u7406\u89E3\u5230\u2026").onChange(
          (v) => (cardInsight = v),
        );
        ta.inputEl.rows = 4;
        ta.inputEl.style.width = "100%";
      });
    new import_obsidian5.Setting(inputSec)
      .setName("\u6807\u7B7E\uFF08\u53EF\u9009\uFF09")
      .setDesc("\u9017\u53F7\u5206\u9694\uFF0C\u7528\u4E8E\u8DE8\u4E66\u77E5\u8BC6\u5173\u8054")
      .addText((t) => {
        t.setPlaceholder("\u4F8B\uFF1A\u6295\u8D44, \u590D\u5229, \u957F\u671F\u4E3B\u4E49").onChange(
          (v) => (cardTags = v),
        );
      });
    const actionSec = contentEl.createDiv("readflow-modal-actions");
    const cancelBtn = actionSec.createEl("button", { text: "\u53D6\u6D88", type: "button" });
    cancelBtn.classList.add("readflow-btn", "readflow-btn--ghost");
    cancelBtn.addEventListener("click", () => modal.close());
    const saveBtn = actionSec.createEl("button", { text: "\u521B\u5EFA\u77E5\u8BC6\u5361", type: "button" });
    saveBtn.classList.add("readflow-btn", "readflow-btn--primary");
    saveBtn.addEventListener("click", async () => {
      if (!cardTitle.trim()) {
        new import_obsidian5.Notice("\u8BF7\u586B\u5199\u77E5\u8BC6\u70B9\u6807\u9898");
        return;
      }
      if (!cardInsight.trim()) {
        new import_obsidian5.Notice("\u8BF7\u586B\u5199\u6838\u5FC3\u89C1\u89E3");
        return;
      }
      const card = generateKnowledgeCard(
        scopeBook,
        sourceHighlights.map((h) => h.id),
        cardTitle.trim(),
        cardInsight.trim(),
      );
      card.tags = cardTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!this.plugin.diskData.knowledgeCards) this.plugin.diskData.knowledgeCards = [];
      this.plugin.diskData.knowledgeCards.push(card);
      await this.plugin.persistDisk();
      new import_obsidian5.Notice("\u5DF2\u521B\u5EFA\u77E5\u8BC6\u5361: " + card.title);
      modal.close();
      this.render();
    });
    modal.open();
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
      highlights: selected.length > 0 ? selected : visible,
    };
  }
  applyKnowledgeEdge(book, edge) {
    this.updateManyHighlights(book, (highlight) => {
      var _a, _b;
      if (highlight.id !== edge.sourceId) return highlight;
      const relations = [...((_a = highlight.relations) != null ? _a : [])];
      const exists = relations.some((row) => row.targetId === edge.targetId && row.hint === edge.hint);
      if (!exists) relations.push({ targetId: edge.targetId, hint: edge.hint });
      return {
        ...highlight,
        relations,
        relationHints: [.../* @__PURE__ */ new Set([...((_b = highlight.relationHints) != null ? _b : []), edge.hint])],
        status: "processed",
      };
    });
  }
  updateKnowledgeEdge(book, sourceId, targetId, nextHint) {
    this.updateManyHighlights(book, (highlight) => {
      var _a, _b;
      if (highlight.id !== sourceId) return highlight;
      const nextRelations = ((_a = highlight.relations) != null ? _a : []).map((row) =>
        row.targetId === targetId ? { ...row, hint: nextHint } : row,
      );
      return {
        ...highlight,
        relations: nextRelations,
        relationHints: [.../* @__PURE__ */ new Set([...((_b = highlight.relationHints) != null ? _b : []), nextHint])],
        status: "processed",
      };
    });
  }
  removeKnowledgeEdge(book, sourceId, targetId, hint) {
    this.updateManyHighlights(book, (highlight) => {
      var _a;
      if (highlight.id !== sourceId) return highlight;
      const nextRelations = ((_a = highlight.relations) != null ? _a : []).filter(
        (row) => !(row.targetId === targetId && row.hint === hint),
      );
      return {
        ...highlight,
        relations: nextRelations.length > 0 ? nextRelations : void 0,
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
    const sortTimeBtn = document.createElement("button");
    sortTimeBtn.className = "readflow-btn readflow-btn--ghost readflow-btn--sm readflow-book-sort-btn readflow-book-sort-compound";
    sortTimeBtn.classList.toggle("readflow-book-sort-btn--active", this.listOrderMode === "time");
    sortTimeBtn.title = this.listOrderMode === "time"
      ? `\u65F6\u95F4\u6392\u5E8F \xB7 ${this.listTimeDir === "desc" ? "\u65B0\u2192\u65E7" : "\u65E7\u2192\u65B0"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
      : "\u6309\u65F6\u95F4\u6392\u5E8F";
    const timeIconSlot = document.createElement("span");
    timeIconSlot.className = "readflow-book-sort-compound__icon";
    sortTimeBtn.appendChild(timeIconSlot);
    const timeDirEl = document.createElement("span");
    timeDirEl.className = "readflow-book-sort-compound__dir";
    if (this.listOrderMode === "time") {
      timeDirEl.textContent = sortDirArrow(this.listTimeDir);
    } else {
      timeDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    sortTimeBtn.appendChild(timeDirEl);
    (0, import_obsidian5.setIcon)(timeIconSlot, "clock");
    sortTimeBtn.addEventListener("click", () => {
      if (this.listOrderMode === "time") {
        this.listTimeDir = this.listTimeDir === "asc" ? "desc" : "asc";
      } else {
        this.listOrderMode = "time";
        this.listTimeDir = "desc";
      }
      localStorage.setItem("readflow.listTimeDir", this.listTimeDir);
      if (this.currentBook && this.currentTree) this.renderVisibleList(this.currentBook, this.currentTree);
    });
    header.appendChild(sortTimeBtn);
    const sortTopicBtn = document.createElement("button");
    sortTopicBtn.className = "readflow-btn readflow-btn--ghost readflow-btn--sm readflow-book-sort-btn readflow-book-sort-compound";
    sortTopicBtn.classList.toggle("readflow-book-sort-btn--active", this.listOrderMode === "topic");
    sortTopicBtn.title = this.listOrderMode === "topic"
      ? `\u4E3B\u9898\u6392\u5E8F \xB7 ${this.listTopicDir === "asc" ? "A\u2192Z" : "Z\u2192A"}\uFF0C\u518D\u70B9\u5207\u6362\u65B9\u5411`
      : "\u6309\u4E3B\u9898\u6392\u5E8F";
    const topicIconSlot = document.createElement("span");
    topicIconSlot.className = "readflow-book-sort-compound__icon";
    sortTopicBtn.appendChild(topicIconSlot);
    const topicDirEl = document.createElement("span");
    topicDirEl.className = "readflow-book-sort-compound__dir";
    if (this.listOrderMode === "topic") {
      topicDirEl.textContent = this.listTopicDir === "asc" ? "\u2191" : "\u2193";
    } else {
      topicDirEl.classList.add("readflow-book-sort-compound__dir--hidden");
    }
    sortTopicBtn.appendChild(topicDirEl);
    (0, import_obsidian5.setIcon)(topicIconSlot, "tag");
    sortTopicBtn.addEventListener("click", () => {
      if (this.listOrderMode === "topic") {
        this.listTopicDir = this.listTopicDir === "asc" ? "desc" : "asc";
      } else {
        this.listOrderMode = "topic";
        this.listTopicDir = "asc";
      }
      localStorage.setItem("readflow.listTopicDir", this.listTopicDir);
      if (this.currentBook && this.currentTree) this.renderVisibleList(this.currentBook, this.currentTree);
    });
    header.appendChild(sortTopicBtn);
    const chapterNav = document.createElement("div");
    chapterNav.className = "readflow-detached-chapter-nav";
    panel.appendChild(chapterNav);
    const chapterSelect = document.createElement("select");
    chapterSelect.className = "readflow-select readflow-select--sm readflow-select--compact readflow-detached-chapter-select";
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
      let lastX = e.clientX,
        lastY = e.clientY;
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
    attachDetachedPanelResize(panel);
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
    const isStatusLane = STATUS_FLOW.includes(lane);
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) => {
        if (h.id !== highlightId) return h;
        if (isStatusLane) {
          return { ...h, status: lane };
        }
        if (lane === "inbox") {
          return {
            ...h,
            status: "inbox",
            highlightType: void 0,
          };
        }
        return {
          ...h,
          status: "processed",
          highlightType: lane,
        };
      }),
      lastSync: Date.now(),
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
      lastSync: Date.now(),
    };
    const topics = [
      ...((_a = nextBook.topicCatalog) != null ? _a : []),
      ...nextBook.highlights.map((h) => (h.topic || "").trim()).filter(Boolean),
    ];
    nextBook = {
      ...nextBook,
      topicCatalog: [...new Set(topics)],
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
      const hints = [.../* @__PURE__ */ new Set([...((_b = h.relationHints) != null ? _b : []), hint])];
      return {
        ...h,
        relations: nextRelations,
        relationHints: hints,
        status: "processed",
      };
    });
  }
  assignHighlightToChapter(book, highlightId, chapter, chapterUid) {
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) =>
        h.id === highlightId
          ? {
              ...h,
              chapter,
              chapterUid,
            }
          : h,
      ),
      lastSync: Date.now(),
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
    const catalog = [.../* @__PURE__ */ new Set([...((_a = cached.topicCatalog) != null ? _a : []), topic])];
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      topicCatalog: catalog,
      lastSync: Date.now(),
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
      highlights: cached.highlights.map((h) => ((h.topic || "").trim() === from ? { ...h, topic: to } : h)),
      topicCatalog: [
        ...new Set(
          ((_a = cached.topicCatalog) != null ? _a : []).map((topic) => (topic === from ? to : topic)).concat(to),
        ),
      ],
      lastSync: Date.now(),
    };
    void this.plugin.persistDisk();
  }
  mergeTopic(book, from, to) {
    var _a;
    const cached = this.plugin.diskData.books[book.bookId];
    if (!cached) return;
    this.plugin.diskData.books[book.bookId] = {
      ...cached,
      highlights: cached.highlights.map((h) => ((h.topic || "").trim() === from ? { ...h, topic: to } : h)),
      topicCatalog: [
        ...new Set(((_a = cached.topicCatalog) != null ? _a : []).filter((topic) => topic !== from).concat(to)),
      ],
      lastSync: Date.now(),
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
        minute: "2-digit",
      });
    } catch (e) {
      return "-";
    }
  }
  getSelectedBook(books) {
    const curId = localStorage.getItem("readflow.selectedBookId");
    const validBook = books.find((b) => b.bookId === curId);
    if (validBook) return validBook;
    if (curId) console.warn("[ReadFlow] selectedBookId \u6307\u5411\u7684\u4E66\u7C4D\u5DF2\u4E0D\u5B58\u5728\uFF0C\u56DE\u9000\u5230\u7B2C\u4E00\u672C\u4E66\u3002", curId);
    return books[0];
  }
  async writeCurrentBookToVault(triggerBtn) {
    const books = Object.values(this.plugin.diskData.books);
    if (books.length === 0) {
      new import_obsidian5.Notice("\u6682\u65E0\u4E66\u7C4D\uFF0C\u8BF7\u5148\u540C\u6B65\u6216\u5BFC\u5165");
      return;
    }
    const book = this.getSelectedBook(books);
    const prevLabel = triggerBtn == null ? void 0 : triggerBtn.textContent;
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.setText("\u5199\u5165\u4E2D\u2026");
    }
    try {
      await writeBookToVault(this.app, this.plugin.settings, book);
      const base = this.plugin.settings.booksBasePath || "Books";
      new import_obsidian5.Notice(`\u5DF2\u5199\u5165 Vault\uFF1A${base}/${book.title}`);
    } catch (e) {
      console.error("[ReadFlow] writeBookToVault", e);
      new import_obsidian5.Notice("\u5199\u5165 Vault \u5931\u8D25\uFF0C\u67E5\u770B\u63A7\u5236\u53F0");
    } finally {
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.setText(prevLabel || "\u5199\u5165 Vault");
      }
    }
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
  } catch (e) {}
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
  } catch (e) {}
  try {
    const electron = req("electron");
    const r = electron.remote;
    if ((r == null ? void 0 : r.BrowserWindow) && r.getCurrentWindow) {
      return r;
    }
  } catch (e) {}
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
  } catch (e) {}
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
}
var WereadLoginWindow = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.modal = null;
    this.handled = false;
    this._hooksAttached = false;
  }
  dispose() {
    var _a;
    try {
      (_a = this.modal) == null ? void 0 : _a.close();
    } catch (e) {}
    this.modal = null;
    this.handled = false;
    this._hooksAttached = false;
  }
  isModalAlive() {
    const m = this.modal;
    if (!m) return false;
    try {
      if (typeof m.isDestroyed === "function" && m.isDestroyed()) return false;
      const wc = m.webContents;
      if (!wc) return false;
      if (typeof wc.isDestroyed === "function" && wc.isDestroyed()) return false;
      return true;
    } catch (e) {
      return false;
    }
  }
  getWebContents() {
    if (!this.isModalAlive()) return null;
    return this.modal.webContents;
  }
  async open() {
    if (!import_obsidian6.Platform.isDesktopApp) {
      new import_obsidian6.Notice(
        "\u79FB\u52A8\u7AEF\u8BF7\u624B\u52A8\u7C98\u8D34 Cookie\uFF08\u8BBE\u7F6E \u2192 ReadFlow\uFF09",
      );
      return;
    }
    const remote = getElectronRemote();
    if (!remote) {
      new import_obsidian6.Notice(
        "\u5F53\u524D Obsidian/Electron \u65E0\u6CD5\u4F7F\u7528\u5185\u7F6E\u767B\u5F55\uFF0C\u8BF7\u624B\u52A8\u7C98\u8D34 Cookie",
      );
      return;
    }
    this.handled = false;
    this._hooksAttached = false;
    const { BrowserWindow, getCurrentWindow } = remote;
    let parent;
    try {
      parent = getCurrentWindow();
    } catch (e) {
      parent = void 0;
    }
    try {
      this.modal = new BrowserWindow({
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
      console.error("[ReadFlow] \u521B\u5EFA\u767B\u5F55\u7A97\u53E3\u5931\u8D25", e);
      new import_obsidian6.Notice(
        `\u65E0\u6CD5\u521B\u5EFA\u767B\u5F55\u7A97\u53E3\uFF1A${e instanceof Error ? e.message : String(e)}\u3002\u8BF7\u5C1D\u8BD5\u624B\u52A8\u7C98\u8D34 Cookie\u3002`,
        8e3,
      );
      return;
    }
    const wc = this.getWebContents();
    if (!wc) {
      this.dispose();
      new import_obsidian6.Notice("\u767B\u5F55\u7A97\u53E3\u521D\u59CB\u5316\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u7C98\u8D34 Cookie\u3002");
      return;
    }
    wc.setUserAgent(getChromeLikeUA());
    this.modal.once("ready-to-show", () => {
      if (!this.isModalAlive()) return;
      this.modal.setTitle("\u767B\u5F55\u5FAE\u4FE1\u8BFB\u4E66\uFF08ReadFlow\uFF09");
      this.modal.show();
    });
    this.modal.on("closed", () => {
      this.modal = null;
      this._hooksAttached = false;
    });
    const finishOk = async (cookieStr) => {
      if (this.handled) return;
      this.handled = true;
      this.plugin.settings.wereadCookie = cookieStr;
      await this.plugin.persistDisk();
      new import_obsidian6.Notice("\u5FAE\u4FE1\u8BFB\u4E66 Cookie \u5DF2\u4FDD\u5B58");
      if (this.isModalAlive()) this.modal.close();
      this.modal = null;
    };
    const trySyncFromSession = async () => {
      if (this.handled || !this.isModalAlive()) return;
      const str = await readSessionCookieString(this.modal);
      if (!str) return;
      const ok = await verifyCookieRough(str);
      if (ok) await finishOk(str);
    };
    const attachSessionHooks = () => {
      if (this._hooksAttached || !this.isModalAlive()) return;
      this._hooksAttached = true;
      const session = this.getWebContents().session;
      session.webRequest.onCompleted({ urls: ["https://weread.qq.com/api/auth/getLoginInfo?uid=*"] }, (details) => {
        if (details.statusCode === 200 && this.isModalAlive()) {
          void this.modal.loadURL("https://weread.qq.com/web/shelf");
          void trySyncFromSession();
        }
      });
      session.webRequest.onSendHeaders({ urls: ["https://weread.qq.com/web/user?userVid=*"] }, (details) => {
        const raw = details.requestHeaders["Cookie"] ?? details.requestHeaders["cookie"];
        if (raw === void 0) return;
        const cookieArr = parseCookieHeader(raw);
        const wrName = cookieArr.find((c) => c.name === "wr_name");
        const wrVid = cookieArr.find((c) => c.name === "wr_vid");
        const wrSkey = cookieArr.find((c) => c.name === "wr_skey");
        if ((wrName && wrName.value !== "") || (wrVid && wrVid.value !== "") || (wrSkey && wrSkey.value !== "")) {
          void finishOk(pairsToHeaderString(cookieArr));
        } else if (this.isModalAlive()) {
          void this.modal.loadURL(WEREAD_LOGIN);
        }
      });
      const nav = () => {
        void trySyncFromSession();
      };
      const contents = this.getWebContents();
      contents.on("did-navigate", nav);
      contents.on("did-navigate-in-page", nav);
      contents.on("did-finish-load", nav);
    };
    let loadErr = "";
    wc.on("did-fail-load", (_e, code, desc, url2, isMainFrame) => {
      if (!isMainFrame) return;
      if (code === -3) return;
      loadErr = `${desc} (${code}) ${url2}`;
      console.warn("[ReadFlow] did-fail-load", loadErr);
    });
    const loadTargets = [WEREAD_HOME, WEREAD_LOGIN];
    let loaded = false;
    for (const target of loadTargets) {
      if (!this.isModalAlive()) break;
      try {
        await this.getWebContents().loadURL(target);
      } catch (e) {
        console.warn("[ReadFlow] loadURL", target, e);
      }
      const url = this.getWebContents()?.getURL?.() || "";
      if (url.includes("weread.qq.com")) {
        loaded = true;
        break;
      }
    }
    if (!loaded || !this.isModalAlive()) {
      const wc2 = this.getWebContents();
      const url = wc2 ? wc2.getURL() : "";
      const hint = loadErr || url.slice(0, 80) || "\u672A\u77E5\u9519\u8BEF";
      new import_obsidian6.Notice(
        `\u52A0\u8F7D\u5FAE\u4FE1\u8BFB\u4E66\u5931\u8D25\u3002\u53EF\u6539\u7528\u624B\u52A8\u7C98\u8D34 Cookie\u3002\u8BE6\u60C5\uFF1A${hint.slice(0, 200)}`,
        12e3,
      );
      this.dispose();
      return;
    }
    attachSessionHooks();
    await trySyncFromSession();
  }
};
async function readSessionCookieString(win) {
  try {
    const cookieStore = win.webContents.session.cookies;
    const sessionCookies = [
      ...(await cookieStore.get({ domain: ".weread.qq.com" })),
      ...(await cookieStore.get({ domain: "weread.qq.com" })),
    ];
    const unique = /* @__PURE__ */ new Map();
    for (const c of sessionCookies) {
      if (!unique.has(c.name)) {
        let name = c.name;
        let value = c.value;
        try {
          name = decodeURIComponent(c.name);
        } catch (e) {}
        try {
          value = decodeURIComponent(c.value);
        } catch (e) {}
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
      callback: () => void this.openPanel(),
    });
    this.addCommand({
      id: "readflow-sync-weread",
      name: "\u540C\u6B65\u5FAE\u4FE1\u8BFB\u4E66",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "s" }],
      callback: () => void this.syncWereadAll(),
    });
    this.addCommand({
      id: "readflow-rebuild-link-index",
      name: "\u91CD\u5EFA\u5173\u8054\u7D22\u5F15",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "r" }],
      callback: async () => {
        await this.linker.rebuildIndexAsync();
        new import_obsidian7.Notice("\u5173\u8054\u7D22\u5F15\u5DF2\u66F4\u65B0");
      },
    });
    this.addCommand({
      id: "readflow-manual-capture",
      name: "\u624B\u52A8\u6458\u5F55",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "n" }],
      callback: () => {
        new QuickCaptureModal(this.app, this, {}, () => {
          void this.persistDisk();
          this.refreshReadFlowViews();
        }).open();
      },
    });
    this.addCommand({
      id: "readflow-capture-selection",
      name: "\u6458\u5F55\u5F53\u524D\u9009\u4E2D\u6587\u672C\u5230 ReadFlow",
      editorCallback: (editor) => {
        void this.captureFromEditorSelection(editor);
      },
    });
    this.addCommand({
      id: "readflow-weread-login",
      name: "\u5FAE\u4FE1\u8BFB\u4E66\u767B\u5F55\uFF08\u684C\u9762\uFF09",
      callback: () => this.openWereadLogin(),
    });
    this.addCommand({
      id: "readflow-export-data",
      name: "\u5BFC\u51FA ReadFlow \u6570\u636E\u5230 JSON",
      callback: async () => {
        const json = JSON.stringify(this.diskData, null, 2);
        const path = this.app.vault.getAvailablePath("readflow-export.json", ".");
        await this.app.vault.create(path, json);
        new import_obsidian7.Notice(`\u5DF2\u5BFC\u51FA\uFF1A${path}`);
      },
    });
    this.addCommand({
      id: "readflow-import-vault-md",
      name: "\u4ECE Vault MD \u6587\u4EF6\u5BFC\u5165\u66F4\u65B0",
      callback: async () => {
        const result = await this.importFromVaultMd();
        new import_obsidian7.Notice(
          `\u5BFC\u5165\u5B8C\u6210\uFF1A\u66F4\u65B0 ${result.imported} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C\uFF0C\u626B\u63CF ${result.files ?? 0} \u4E2A MD\u6587\u4EF6\uFF08${result.scannedPaths ?? 0} \u4E2A\u76EE\u5F55\uFF09${result.errors ? "\uFF0C\u9519\u8BEF " + result.errors + " \u4E2A" : ""}`,
        );
        this.refreshReadFlowViews();
      },
    });
    this.addCommand({
      id: "readflow-push-vault-note-weread",
      name: "\u5C06\u5F53\u524D\u7B14\u8BB0\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66",
      editorCallback: () => {
        void this.pushCurrentVaultNoteToWeread();
      },
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const selected = editor.getSelection().trim();
        if (selected) {
          menu.addItem((item) => {
            item
              .setTitle("\u6458\u5F55\u5230 ReadFlow")
              .setIcon("highlighter")
              .onClick(() => {
                void this.captureFromEditorSelection(editor);
              });
          });
        }
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === "md") {
          menu.addItem((item) => {
            item
              .setTitle("\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66")
              .setIcon("upload")
              .onClick(() => {
                void this.pushCurrentVaultNoteToWeread();
              });
          });
        }
      }),
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

    // 初始化心跳管理器
    this.heartbeatManager = new HeartbeatManager(this);
    if (this.settings.heartbeatEnabled) {
      this.heartbeatManager.start(this.settings.heartbeatInterval || 30);
    }
    this.autoSyncManager = new AutoSyncManager(this);
    if (this.settings.autoSyncEnabled) {
      this.autoSyncManager.start();
    }
  }
  onunload() {
    var _a, _b, _c, _d;
    (_a = this.wereadLogin) == null ? void 0 : _a.dispose();
    this.wereadLogin = null;
    (_b = this.selectionCaptureEl) == null ? void 0 : _b.remove();
    this.selectionCaptureEl = null;
    (_c = this.heartbeatManager) == null ? void 0 : _c.stop();
    (_d = this.autoSyncManager) == null ? void 0 : _d.stop();
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }
    if (this._bookSearchTimer) {
      clearTimeout(this._bookSearchTimer);
      this._bookSearchTimer = null;
    }
    if (this._shellRo) {
      this._shellRo.disconnect();
      this._shellRo = null;
    }
  }
  /** 与 Weread 类似：Electron 子窗口抓取 Cookie */
  openWereadLogin() {
    var _a;
    (_a = this.wereadLogin) == null ? void 0 : _a.dispose();
    this.wereadLogin = new WereadLoginWindow(this);
    void this.wereadLogin.open();
  }
  async loadStorage() {
    var _a, _b, _c, _d;
    const raw = (_a = await this.loadData()) != null ? _a : {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (_b = raw.settings) != null ? _b : {});
    this.diskData = {
      version: 1,
      books: { ...((_c = raw.books) != null ? _c : {}) },
      lastSyncAt: raw.lastSyncAt,
      knowledgeCards: [...((_d = raw.knowledgeCards) != null ? _d : [])],
    };
    var migrated = false;
    for (var bid in this.diskData.books) {
      var b = this.diskData.books[bid];
      if (!b || !b.highlights) continue;
      for (var i = 0; i < b.highlights.length; i++) {
        var h = b.highlights[i];
        var patch = {};
        if (h.note && h.content && h.note.trim() === h.content.trim()) {
          patch.note = void 0;
        }
        if (!h.wereadReviewId && h.id && h.id.startsWith("weread-rv-")) {
          patch.wereadReviewId = h.id.slice("weread-rv-".length);
        }
        if (Object.keys(patch).length > 0) {
          b.highlights[i] = { ...h, ...patch };
          migrated = true;
        }
      }
    }
    if (migrated) {
      console.log("[ReadFlow] migrated: fixed note/reviewId for", Object.keys(this.diskData.books).length, "books");
      await this.persistDisk();
    }
  }
  async persistDisk() {
    const payload = {
      settings: this.settings,
      version: 1,
      books: this.diskData.books,
      lastSyncAt: this.diskData.lastSyncAt,
      knowledgeCards: this.diskData.knowledgeCards || [],
    };
    await this.saveData(payload);
  }
  /** 兼容设置页命名 */
  async saveSettings() {
    await this.persistDisk();
  }

  /** 从 Vault MD 文件导入书籍和划线（支持多目录） */
  async importFromVaultMd() {
    const importPaths = getMdImportPaths(this.settings);
    const files = this.app.vault.getMarkdownFiles();
    const mdFileSet = /* @__PURE__ */ new Map();
    for (const baseFolder of importPaths) {
      const folder = this.app.vault.getAbstractFileByPath(baseFolder);
      if (!folder || !(folder instanceof import_obsidian7.TFolder)) continue;
      for (const f of files) {
        const p = f.path.replace(/\\/g, "/");
        if (!p.startsWith(baseFolder + "/")) continue;
        if (!/\/[\u4e00-\u9fff\w\-（）()「」【】]+\.md$/u.test(p)) continue;
        mdFileSet.set(f.path, f);
      }
    }

    let imported = 0,
      skipped = 0,
      errors = 0;

    for (const file of mdFileSet.values()) {
      try {
        const content = await this.app.vault.read(file);
        const parsed = parseWereadMdFile(content, file.path);
        if (parsed.highlights.length === 0) {
          skipped++;
          continue;
        }

        const existing = this.diskData.books[parsed.bookId];
        if (existing) {
          const existingIds = new Set(existing.highlights.map((h) => h.id));
          const newHighlights = parsed.highlights.filter((h) => !existingIds.has(h.id));
          existing.highlights.push(...newHighlights);
          if (parsed.title && (!existing.title || existing.title === parsed.bookId)) {
            existing.title = parsed.title;
          }
          if (parsed.author && !existing.author) existing.author = parsed.author;
        } else {
          this.diskData.books[parsed.bookId] = {
            bookId: parsed.bookId,
            title: parsed.title,
            author: parsed.author,
            cover: parsed.cover,
            highlights: parsed.highlights,
            lastSync: Date.now(),
          };
        }
        imported++;
      } catch (e) {
        errors++;
        console.error("[ReadFlow] import md error", file.path, e);
      }
    }

    if (imported > 0) {
      this.diskData.lastSyncAt = Date.now();
      await this.persistDisk();
    }

    return { imported, skipped, errors, scannedPaths: importPaths.length, files: mdFileSet.size };
  }

  /** 心跳数据同步 - 获取书架有进度的书（有笔记/摘录的书） */
  async syncHeartbeatData() {
    const cookie = this.settings.wereadCookie;
    if (!cookie) return { success: false, error: "请先配置 Cookie" };

    try {
      const cookieRef = { value: cookie };
      const rawBooks = await fetchNotebookBooksRaw(cookieRef);

      // 有笔记/noteCount > 0 或有想法/reviewCount > 0 的书视为"有进度"
      const booksWithProgress = rawBooks.filter((b) => (b.noteCount || 0) + (b.reviewCount || 0) > 0);

      this.heartbeatBooks = booksWithProgress
        .map((book) => {
          const info = book.book || {};
          return {
            bookId: info.bookId || book.bookId || "",
            title: info.title || book.title || "未知",
            author: info.author || book.author || "",
            noteCount: book.noteCount || 0,
            reviewCount: book.reviewCount || 0,
            readUpdateTime: info.readUpdateTime || 0,
            updateTime: info.updateTime || 0,
            cover: info.cover || "",
          };
        })
        .sort((a, b) => (b.readUpdateTime || 0) - (a.readUpdateTime || 0));

      // 如果是桌面端，同步 cookie（有些 API 会更新 wr_skey）
      if (cookieRef.value !== this.settings.wereadCookie) {
        this.settings.wereadCookie = cookieRef.value;
      }

      console.log("[ReadFlow] 心跳数据同步完成", this.heartbeatBooks.length, "本有进度");
      return { success: true, books: this.heartbeatBooks, booksWithProgress: this.heartbeatBooks.length };
    } catch (e) {
      console.error("[ReadFlow] 心跳数据同步失败:", e);
      return { success: false, error: e.message };
    }
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
      new import_obsidian7.Notice(
        "\u91CD\u8F7D\u5931\u8D25\uFF1A\u8BF7\u5728\u300C\u8BBE\u7F6E \u2192 \u7B2C\u4E09\u65B9\u63D2\u4EF6\u300D\u4E2D\u624B\u52A8\u5173\u95ED\u518D\u5F00\u542F ReadFlow",
      );
    }
  }
  async pushHighlightNote(bookId, highlight) {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      return { ok: false, reason: "\u672A\u914D\u7F6E\u5FAE\u4FE1\u8BFB\u4E66 Cookie" };
    }
    if (!canPushHighlightToWeread(highlight)) {
      return { ok: false, reason: "\u7F3A\u5C11\u60F3\u6CD5\u6216\u5B9A\u4F4D\u4FE1\u606F" };
    }
    const cookieRef = { value: cookie };
    const result = await pushNoteToWeread(cookieRef, highlight);
    if (cookieRef.value !== this.settings.wereadCookie) {
      this.settings.wereadCookie = cookieRef.value;
      await this.persistDisk();
    }
    if (result.ok && result.reviewId) {
      const cached = this.diskData.books[bookId];
      if (cached) {
        this.diskData.books[bookId] = {
          ...cached,
          highlights: cached.highlights.map((h) =>
            h.id === highlight.id ? { ...h, wereadReviewId: result.reviewId } : h,
          ),
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
    const pushable = cached.highlights.filter((h) => canPushHighlightToWeread(h));
    if (pushable.length === 0) {
      new import_obsidian7.Notice("\u6CA1\u6709\u53EF\u63A8\u9001\u7684\u60F3\u6CD5");
      return { pushed: 0, failed: 0, skipped: 0 };
    }
    const cookieRef = { value: cookie };
    let pushed = 0,
      failed = 0;
    const progress = new import_obsidian7.Notice(`\u63A8\u9001\u4E2D 0/${pushable.length}\u2026`, 18e4);
    for (let i = 0; i < pushable.length; i++) {
      const h = pushable[i];
      progress.setMessage(`\u63A8\u9001\u4E2D ${i + 1}/${pushable.length}\u2026`);
      const res = await pushNoteToWeread(cookieRef, h);
      if (res.ok) {
        pushed++;
        if (res.reviewId) {
          cached.highlights = cached.highlights.map((x) =>
            x.id === h.id ? { ...x, wereadReviewId: res.reviewId } : x,
          );
        }
      } else {
        failed++;
        console.warn("[ReadFlow] push failed for", h.id, res);
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
    new import_obsidian7.Notice(
      `\u63A8\u9001\u5B8C\u6210\uFF1A\u6210\u529F ${pushed}\uFF0C\u5931\u8D25 ${failed}\uFF0C\u5171 ${pushable.length} \u6761`,
    );
    return { pushed, failed, skipped: cached.highlights.length - pushable.length };
  }
  async pushCurrentVaultNoteToWeread() {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") {
      new import_obsidian7.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7 Markdown \u7B14\u8BB0");
      return { ok: false, reason: "no_file" };
    }
    const cache = this.app.metadataCache.getFileCache(file);
    const meta = parseVaultNotePushMeta(cache);
    let bookId = meta.bookId;
    if (!bookId) {
      const resolved = this.resolveBookFromFile(file);
      if (resolved) bookId = resolved.bookId;
    }
    if (!bookId) {
      new import_obsidian7.Notice(
        "\u8BF7\u5728 frontmatter \u8BBE\u7F6E readflow-book-id\uFF08\u6216 book_id\uFF09\uFF0C\u6216\u628A\u7B14\u8BB0\u653E\u5728\u4E0E ReadFlow \u4E66\u540D\u5339\u914D\u7684\u76EE\u5F55\u4E0B",
        1e4,
      );
      return { ok: false, reason: "no_book" };
    }
    const body = await extractVaultNoteBodyForPush(this.app, file);
    if (!body) {
      new import_obsidian7.Notice("\u7B14\u8BB0\u6B63\u6587\u6216\u9009\u4E2D\u5185\u5BB9\u4E3A\u7A7A");
      return { ok: false, reason: "empty_body" };
    }
    const highlight = {
      id: "vault-note-" + file.path,
      bookId: bookId,
      content: body.slice(0, 120),
      note: body.slice(0, 4000),
      chapterUid: meta.chapterUid,
      wereadRange: meta.wereadRange || void 0,
      wereadReviewId: meta.wereadReviewId ? meta.wereadReviewId.replace(/-/g, "_") : void 0,
      sourceType: meta.wereadReviewId ? "weread" : "manual",
    };
    if (!canPushHighlightToWeread(highlight)) {
      new import_obsidian7.Notice(
        "\u65E0\u6CD5\u63A8\u9001\uFF1A\u8BF7\u786E\u4FDD\u6709\u5185\u5BB9\uFF0C\u5E76\u914D\u7F6E readflow-weread-review-id\uFF08\u66F4\u65B0\uFF09\u6216 readflow-weread-range / chapter-uid\uFF08\u65B0\u5EFA\uFF09",
        1e4,
      );
      return { ok: false, reason: "not_pushable" };
    }
    const result = await this.pushHighlightNote(bookId, highlight);
    if (result.ok) {
      if (result.reviewId && this.app.fileManager && this.app.fileManager.processFrontMatter) {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
          fm["readflow-weread-review-id"] = String(result.reviewId).replace(/_/g, "-");
          if (!fm["readflow-book-id"] && !fm.book_id) fm["readflow-book-id"] = bookId;
        });
      }
      new import_obsidian7.Notice("\u2705 \u5DF2\u63A8\u9001\u5230\u5FAE\u4FE1\u8BFB\u4E66");
    } else {
      new import_obsidian7.Notice("\u274C \u63A8\u9001\u5931\u8D25\uFF1A" + formatPushNoteError(result), 1e4);
    }
    return result;
  }
  async syncWereadAll(forceFull = false) {
    const cookie = this.settings.wereadCookie.trim();
    if (!cookie) {
      new import_obsidian7.Notice(
        "\u8BF7\u5148\u5728 ReadFlow \u8BBE\u7F6E\u4E2D\u586B\u5199\u5FAE\u4FE1\u8BFB\u4E66 Cookie\uFF08\u6216\u4F7F\u7528\u767B\u5F55\u7A97\u53E3\uFF09",
      );
      return;
    }
    const cookieValid = await verifyWereadCookieSilent(cookie);
    if (!cookieValid) {
      new import_obsidian7.Notice(
        "\u5FAE\u4FE1\u8BFB\u4E66 Cookie \u5DF2\u5931\u6548\uFF08errcode -2012\uFF09\u3002\u8BF7\u91CD\u65B0\u767B\u5F55\u6216\u4ECE\u6D4F\u89C8\u5668\u7C98\u8D34 Cookie\u3002",
        1e4,
      );
      this.setSyncStatus("ReadFlow\uFF1ACookie \u5931\u6548");
      return;
    }
    const progress = new import_obsidian7.Notice(
      forceFull
        ? "\u5FAE\u4FE1\u8BFB\u4E66\u5168\u91CF\u91CD\u5237\u4E2D\uFF0C\u8BF7\u7A0D\u5019\u2026"
        : "\u5FAE\u4FE1\u8BFB\u4E66\u540C\u6B65\u4E2D\uFF0C\u8BF7\u7A0D\u5019\u2026",
      18e4,
    );
    this.setSyncStatus(
      forceFull ? "ReadFlow\uFF1A\u5168\u91CF\u91CD\u5237\u4E2D\u2026" : "ReadFlow\uFF1A\u540C\u6B65\u4E2D\u2026",
    );
    try {
      const cookieRef = { value: cookie };
      const result = await syncAllBooksWithNotes(
        cookieRef,
        (id) => this.diskData.books[id],
        forceFull,
        (event) => this.updateSyncProgress(progress, event, forceFull),
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
      progress.hide();
      const base = this.settings.booksBasePath || "Books";
      if (result.scanned === 0) {
        this.setSyncStatus("ReadFlow\uFF1A\u672A\u53D1\u73B0\u53EF\u540C\u6B65\u4E66\u7C4D");
        new import_obsidian7.Notice(
          `ReadFlow\uFF1A\u672A\u62C9\u53D6\u5230\u6709\u5212\u7EBF/\u60F3\u6CD5\u7684\u4E66\uFF08\u5FAE\u4FE1\u8BFB\u4E66\u91CC noteCount \u4E3A 0 \u7684\u4F1A\u8DF3\u8FC7\uFF09\u3002\u53EF\u5728\u9762\u677F\u624B\u52A8\u6458\u5F55\u3002`,
        );
      } else if (books.length === 0) {
        this.setSyncStatus(
          forceFull
            ? "ReadFlow\uFF1A\u672C\u6B21\u5168\u91CF\u91CD\u5237\u76EE\u6807\u4E3A\u7A7A"
            : `ReadFlow\uFF1A\u540C\u6B65\u5B8C\u6210\uFF0C\u626B\u63CF ${result.scanned} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C`,
        );
        new import_obsidian7.Notice(
          forceFull
            ? `ReadFlow\uFF1A\u672A\u5237\u65B0\u4EFB\u4F55\u4E66\uFF0C\u5F53\u524D\u76EE\u6807\u4E3A\u7A7A\u3002`
            : `ReadFlow\uFF1A\u672C\u6B21\u672A\u53D1\u73B0\u53D8\u5316\uFF0C\u5171\u626B\u63CF ${result.scanned} \u672C\uFF0C\u5DF2\u8DF3\u8FC7 ${result.skipped} \u672C\u3002`,
        );
      } else {
        this.setSyncStatus(
          forceFull
            ? `ReadFlow\uFF1A\u5168\u91CF\u91CD\u5237\u5B8C\u6210\uFF0C\u66F4\u65B0 ${result.synced} \u672C`
            : `ReadFlow\uFF1A\u540C\u6B65\u5B8C\u6210\uFF0C\u66F4\u65B0 ${result.synced} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C`,
        );
        new import_obsidian7.Notice(
          forceFull
            ? `ReadFlow\uFF1A\u5DF2\u5168\u91CF\u91CD\u5237 ${books.length} \u672C\uFF1B\u5DF2\u5199\u5165\u300C${base}/\u300D\uFF1A${written} \u672C${failed ? `\uFF0C\u5931\u8D25 ${failed} \u672C\uFF08\u770B\u63A7\u5236\u53F0\uFF09` : ""}`
            : `ReadFlow\uFF1A\u5DF2\u540C\u6B65 ${result.synced} \u672C\uFF0C\u8DF3\u8FC7 ${result.skipped} \u672C\uFF1B\u5DF2\u5199\u5165\u300C${base}/\u300D\uFF1A${written} \u672C${failed ? `\uFF0C\u5931\u8D25 ${failed} \u672C\uFF08\u770B\u63A7\u5236\u53F0\uFF09` : ""}`,
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
    const text =
      event.phase === "scan"
        ? `ReadFlow\uFF1A${modeLabel}\u540C\u6B65\u51C6\u5907\u5B8C\u6210\uFF0C\u626B\u63CF ${event.scanned} \u672C\uFF0C\u5F85\u540C\u6B65 ${event.total} \u672C\uFF0C\u8DF3\u8FC7 ${event.skipped} \u672C`
        : `ReadFlow\uFF1A${modeLabel}\u540C\u6B65\u5DF2\u5B8C\u6210 ${event.synced}/${event.total} \xB7 ${(_a = event.title) != null ? _a : "\u672A\u547D\u540D\u4E66\u7C4D"}`;
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
    const sel = editor.listSelections()[0];
    const lineNo = sel ? editor.doc.lineNumber(sel.anchor) + 1 : 1;
    this.openQuickCapture(selected, editor, lineNo);
  }
  openQuickCapture(selected, editor, lineNo) {
    const activeFile = this.app.workspace.getActiveFile();
    const matchedBook = this.resolveBookFromFile(activeFile);
    const manualBookTitle = matchedBook ? void 0 : activeFile == null ? void 0 : activeFile.basename;
    var initialContextAbstract = "";
    if (editor && activeFile) {
      var _a;
      try {
        const lineCount = editor.lineCount();
        const start = Math.max(0, lineNo - 4);
        const end = Math.min(lineCount, lineNo + 2);
        const lines = [];
        for (let i = start; i < end; i++) {
          lines.push(editor.getLine(i));
        }
        const rawContext = lines.join("\n");
        const selStart = editor.posToOffset({ ch: 0, line: lineNo - 1 });
        const selEnd = selStart + selected.length;
        const before = rawContext.slice(0, rawContext.indexOf(selected)).trim();
        const after = rawContext.slice(rawContext.indexOf(selected) + selected.length).trim();
        initialContextAbstract =
          (before ? "\u2026" + before.slice(-120) + "\n" : "") +
          selected +
          (after ? "\n" + after.slice(0, 120) + "\u2026" : "");
      } catch (_) {
        initialContextAbstract = "";
      }
    }
    new QuickCaptureModal(
      this.app,
      this,
      {
        book: matchedBook,
        initialContent: selected,
        manualBookTitle,
        initialContextAbstract,
        compactMode: true,
      },
      (h) => {
        const latestBook = this.diskData.books[h.bookId];
        if (latestBook) {
          void writeBookToVault(this.app, this.settings, latestBook).catch((e) => {
            console.error("[ReadFlow] capture write", e);
          });
        }
        this.refreshReadFlowViews();
      },
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
      const text =
        ((_a = button.dataset.captureText) == null ? void 0 : _a.trim()) ||
        ((_b = window.getSelection()) == null ? void 0 : _b.toString().trim()) ||
        "";
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
    const readflowBookId = (frontmatter == null ? void 0 : frontmatter["readflow-book-id"])
      ? String(frontmatter["readflow-book-id"]).trim()
      : "";
    if (readflowBookId && this.diskData.books[readflowBookId]) {
      return this.diskData.books[readflowBookId];
    }
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
  async _testLlm(llm) {
    const { enabled, model, endpoint } = llm;
    if (!enabled || !endpoint) return { ok: false, error: "\u672A\u914D\u7F6E LLM \u7AEF\u70B9" };
    try {
      const resp = await this.app.requestUrl({
        url: endpoint,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: "\u56DE\u7B54: ok",
          stream: false,
        }),
      });
      return { ok: true, data: resp.json };
    } catch (e) {
      return { ok: false, error: e && e.message };
    }
  }
  async classifyHighlightWithLlm(highlight, bookTitle) {
    const llm = this.settings.llmClassifier || {};
    if (!llm.enabled || !llm.endpoint) return null;
    const prompt = `根据以下阅读摘录，判断其类型，只能回答一个词：idea（观点）、method（方法）、example（例子）、conclusion（结论）或 question（疑问）。\n\n书籍：《${bookTitle}》\n摘录：${highlight.content.slice(0, 500)}\n${highlight.note ? `笔记：${highlight.note.slice(0, 200)}` : ""}\n\n类型：`;
    try {
      const resp = await this.app.requestUrl({
        url: llm.endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(llm.apiKey ? { Authorization: `Bearer ${llm.apiKey}` } : {}),
        },
        body: JSON.stringify({ model: llm.model, prompt, stream: false }),
      });
      const json = resp.json;
      const raw = (json.response || json.text || json.content || "").trim();
      const match = raw.match(/^\s*(idea|method|example|conclusion|question)\s*[`\u2018\u2019"\u300C]?/i);
      return match ? match[1].toLowerCase() : null;
    } catch (e) {
      console.warn("[ReadFlow] LLM classify failed", e);
      return null;
    }
  }
};
