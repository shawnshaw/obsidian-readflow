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
    new import_obsidian.Setting(containerEl)
      .setName("\u542F\u7528 LLM \u5206\u7C7B")
      .setDesc("\u5F00\u542F\u540E\uFF0C\u65B0\u540C\u6B65\u7684\u6458\u5F55\u5C06\u81EA\u52A8\u901A\u8FC7 LLM \u63A8\u65AD\u7C7B\u578B\uFF08\u89C24E2\u5206\u7C7B\uFF1A\u89C2\u70B9/\u65B9\u6CD5/\u4F8B\u5B50/\u7ED3\u8BBA/\u7591\u95EE\uFF09")
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
    const testBtn = containerEl.createEl("button", { text: "\u6D4B\u8BD5 LLM \u5206\u7C7B", type: "button", cls: "readflow-btn readflow-btn--secondary" });
    testBtn.addEventListener("click", async () => {
      try {
        const llm = this.plugin.settings.llmClassifier || {};
        const resp = await this.plugin._testLlm(llm);
        new import_obsidian.Notice(resp.ok ? "\u2705 LLM \u8FDE\u63A5\u6B63\u5E38" : `\u274C \u8FDE\u63A5\u5931\u8D25: ${resp.error}`);
      } catch (e) {
        new import_obsidian.Notice(`\u6D4B\u8BD5\u5F02\u5E38: ${e && e.message}`);
      }
    });
    
    // 心跳设置
    containerEl.createEl("h3", { html: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-2px;margin-right:4px"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>\u8BFB\u4E66\u5FC3\u8DF3', cls: "readflow-settings-section-title" });
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
        dd.addOption("15", "15 \u79D2").addOption("30", "30 \u79D2").addOption("60", "1 \u5206\u949F").addOption("120", "2 \u5206\u949F")
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
      .setDesc("\u70B9\u51FB\u300C\u540C\u6B65\u67E5\u8BE2\u300D\u540E\uFF0C\u5728\u5217\u8868\u4E2D\u70B9\u51FB\u4E00\u672C\u4E66\u8BBE\u4E3A\u5F53\u524D\u9605\u8BFB\uFF08\u624D\u4F1A\u53D1\u9001\u5FC3\u8DF3\uFF09")
      .addButton((btn) => btn.setButtonText("\u540C\u6B65\u67E5\u8BE2").setCta().onClick(async () => {
        const result = await this.plugin.syncHeartbeatData();
        if (result.success) {
          new import_obsidian.Notice(`\u67E5\u8BE2\u6210\u529F\uFF01${result.booksWithProgress}\u672C\u6709\u8FDB\u5EA6`);
        } else {
          new import_obsidian.Notice(`\u67E5\u8BE2\u5931\u8D25: ${result.error}`);
        }
      }));
    const hbStats = this.plugin.heartbeatManager ? this.plugin.heartbeatManager.getStats() : {};
    containerEl.createDiv("setting-item-description", { text: `\u72B6\u6001: ${hbStats.state === "running" ? "\u2705 \u8FD0\u884C\u4E2D" : "\u23F8 \u5DF2\u505C\u6B62"}` });
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
  getStats() { return { ...this.stats, state: this.state, currentBook: this.currentBook }; }
  addListener(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  notify() { for (const cb of this.listeners) cb(this.getStats()); }
  setCurrentBook(book) { this.currentBook = book; this.notify(); }
  async start(intervalSeconds = 30) {
    if (this.timer) clearInterval(this.timer);
    this.state = "running";
    this.timer = setInterval(() => this.tick(), intervalSeconds * 1000);
    this.notify();
    console.log('[ReadFlow] 心跳已启动，间隔', intervalSeconds, '秒');
  }
  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.state = "idle"; this.currentBook = null;
    this.notify();
    console.log('[ReadFlow] 心跳已停止');
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
      if (result.error === "AUTH_FAILED") { this.stop(); new import_obsidian.Notice("心跳认证失败，请检查 Cookie"); }
    }
    this.notify();
  }
}

async function sendHeartbeat(cookie, payload) {
  // 使用与 weread.ts 一致的 API 端点
  const url = `${BASE}/book/updateReadingProgress`;
  try {
    const resp = await requestUrl({
      url, method: "POST",
      headers: buildJsonPostHeaders(cookie),
      body: JSON.stringify({ bookId: payload.bookId, chapterUid: payload.chapterUid || 0, readProgress: Math.max(0, Math.min(100, payload.readProgress || 0)) })
    });
    if (resp.status >= 200 && resp.status < 300) return { ok: true };
    if (resp.status === 401 || resp.status === 403) return { ok: false, error: "AUTH_FAILED" };
    return { ok: false, error: `HTTP ${resp.status}` };
  } catch (e) { return { ok: false, error: e.message }; }
}

