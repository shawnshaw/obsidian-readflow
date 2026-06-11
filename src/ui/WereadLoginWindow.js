/**
 * WereadLoginWindow — Electron BrowserWindow based WeRead login
 * CJS module (same as rest of src/main.js architecture)
 */
"use strict";

var WEREAD_LOGIN = "https://weread.qq.com/#login";
var WEREAD_HOME = "https://weread.qq.com/";

// ============================================================
// Cookie helpers
// ============================================================
function parseCookieHeader(cookieInput) {
  if (!cookieInput) return [];
  var raw = Array.isArray(cookieInput) ? cookieInput.join("; ") : cookieInput;
  if (raw === "") return [];
  return raw.split(";").map(function(pair) {
    var idx = pair.indexOf("=");
    if (idx === -1) {
      try { return { name: decodeURIComponent(pair.trim()), value: "" }; }
      catch { return { name: pair.trim(), value: "" }; }
    }
    var nameRaw = pair.slice(0, idx).trim();
    var valueRaw = pair.slice(idx + 1).trim();
    try { return { name: decodeURIComponent(nameRaw), value: decodeURIComponent(valueRaw) }; }
    catch { return { name: nameRaw, value: valueRaw }; }
  });
}

function pairsToHeaderString(pairs) {
  return pairs.map(function(c) { return c.name + "=" + c.value; }).join("; ");
}

// ============================================================
// Electron helpers
// ============================================================
function getRequire() {
  try {
    if (typeof window !== "undefined" && typeof window.require === "function") {
      return window.require;
    }
  } catch {}
  try { return require; } catch { return null; }
}

function getElectronRemote() {
  var req = getRequire();
  if (!req) return null;
  try {
    var er = req("@electron/remote");
    if (er && er.BrowserWindow && er.getCurrentWindow) return er;
  } catch {}
  try {
    var electron = req("electron");
    var r = electron.remote;
    if (r && r.BrowserWindow && r.getCurrentWindow) return r;
  } catch {}
  return null;
}

function getChromeLikeUA() {
  try {
    var req = getRequire();
    if (req) {
      var proc = req("process");
      if (proc && proc.platform === "win32") {
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
      }
    }
  } catch {}
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
}

function readSessionCookieString(win) {
  return Promise.resolve().then(function() {
    var cookieStore = win.webContents.session.cookies;
    return Promise.all([
      cookieStore.get({ domain: ".weread.qq.com" }),
      cookieStore.get({ domain: "weread.qq.com" }),
    ]).then(function(_ref) {
      var arr1 = _ref[0], arr2 = _ref[1];
      var sessionCookies = arr1.concat(arr2);
      var unique = new Map();
      for (var i = 0; i < sessionCookies.length; i++) {
        var c = sessionCookies[i];
        if (!unique.has(c.name)) {
          var name = c.name, value = c.value;
          try { name = decodeURIComponent(c.name); } catch {}
          try { value = decodeURIComponent(c.value); } catch {}
          unique.set(c.name, { name: name, value: value });
        }
      }
      var cookieArr = Array.from(unique.values());
      if (cookieArr.length === 0) return null;
      var wrVid = cookieArr.find(function(c) { return c.name === "wr_vid"; });
      var wrName = cookieArr.find(function(c) { return c.name === "wr_name"; });
      var wrSkey = cookieArr.find(function(c) { return c.name === "wr_skey"; });
      if (!wrVid || (!wrName || wrName.value === "") && (!wrSkey || wrSkey.value === "")) {
        return null;
      }
      return pairsToHeaderString(cookieArr);
    });
  }).catch(function(e) {
    console.error("[ReadFlow] readSessionCookieString", e);
    return null;
  });
}

// ============================================================
// WereadLoginWindow
// ============================================================
var WereadLoginWindow = function(plugin) {
  this.plugin = plugin;
  this.modal = null;
  this.handled = false;
};

WereadLoginWindow.prototype.dispose = function() {
  try { if (this.modal) this.modal.close(); } catch {}
  this.modal = null;
  this.handled = false;
};

WereadLoginWindow.prototype.open = function() {
  var _this = this;
  var obsidian = require("obsidian");
  var Notice = obsidian.Notice;
  var Platform = obsidian.Platform;

  if (!Platform.isDesktopApp) {
    new Notice("移动端请手动粘贴 Cookie（设置 → ReadFlow）");
    return;
  }

  var remote = getElectronRemote();
  if (!remote) {
    new Notice("当前 Obsidian/Electron 无法使用内置登录，请手动粘贴 Cookie");
    return;
  }

  this.handled = false;
  var BrowserWindow = remote.BrowserWindow;
  var getCurrentWindow = remote.getCurrentWindow;

  var parent;
  try { parent = getCurrentWindow() || undefined; } catch { parent = undefined; }

  var self = this;

  try {
    this.modal = new BrowserWindow({
      parent: parent,
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
    console.error("[ReadFlow] 创建登录窗口失败", e);
    new Notice("无法创建登录窗口：" + (e instanceof Error ? e.message : String(e)) + "。请尝试手动粘贴 Cookie。", 8000);
    return;
  }

  var modal = this.modal;
  modal.webContents.setUserAgent(getChromeLikeUA());

  modal.once("ready-to-show", function() {
    if (modal) {
      modal.setTitle("登录微信读书（ReadFlow）");
      modal.show();
    }
  });

  var session = modal.webContents.session;

  var finishOk = function(cookieStr) {
    return Promise.resolve().then(function() {
      if (_this.handled) return;
      _this.handled = true;
      _this.plugin.settings.wereadCookie = cookieStr;
      return _this.plugin.persistDisk().then(function() {
        new Notice("微信读书 Cookie 已保存");
        if (_this.modal) {
          _this.modal.close();
          _this.modal = null;
        }
      });
    });
  };

  var trySyncFromSession = function() {
    if (_this.handled || !_this.modal) return;
    return readSessionCookieString(_this.modal).then(function(str) {
      if (!str) return;
      return verifyWereadCookieSilent(str).then(function(ok) {
        if (ok) return finishOk(str);
      });
    }).catch(function() {});
  };

  // Login success → navigate to shelf
  session.webRequest.onCompleted(
    { urls: ["https://weread.qq.com/api/auth/getLoginInfo?uid=*"] },
    function(details) {
      if (details.statusCode === 200 && _this.modal) {
        _this.modal.loadURL(WEREAD_HOME);
        trySyncFromSession();
      }
    }
  );

  // Intercept Cookie header
  session.webRequest.onSendHeaders(
    { urls: ["https://weread.qq.com/web/user?userVid=*"] },
    function(details) {
      var raw = details.requestHeaders["Cookie"] || details.requestHeaders["cookie"];
      if (!raw) return;
      var cookieArr = parseCookieHeader(Array.isArray(raw) ? raw : [raw]);
      var wrName = cookieArr.find(function(c) { return c.name === "wr_name"; });
      var wrVid = cookieArr.find(function(c) { return c.name === "wr_vid"; });
      if ((wrName && wrName.value !== "") || (wrVid && wrVid.value !== "")) {
        finishOk(pairsToHeaderString(cookieArr));
      } else {
        if (_this.modal) _this.modal.reload();
      }
    }
  );

  // Periodic check on navigation
  var nav = function() { trySyncFromSession(); };
  modal.webContents.on("did-navigate", nav);
  modal.webContents.on("did-navigate-in-page", nav);
  modal.webContents.on("did-finish-load", nav);

  modal.loadURL(WEREAD_LOGIN);
};

// verifyWereadCookieSilent is defined in importer/weread.ts (available via the bundle)
// No extra work needed here

module.exports = { WereadLoginWindow: WereadLoginWindow };
