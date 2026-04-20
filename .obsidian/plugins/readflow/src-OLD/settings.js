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
  }
};

module.exports = {
  DEFAULT_SETTINGS,
  ReadFlowSettingTab
};
