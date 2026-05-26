// src/processor/mindmap.ts
function buildMindMapTree(scopeBook) {
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
    _y: 0
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
      _y: 0
    };
    var byType = {};
    for (var i = 0; i < s.items.length; i++) {
      var item = s.items[i];
      var tp = item.highlightType || "\u672A\u5206\u7C7B";
      if (!byType[tp]) byType[tp] = [];
      byType[tp].push(item);
    }
    var ents = Object.entries(byType).sort(function(a, b) { return b[1].length - a[1].length; });
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
        _y: 0
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
          srcId: h.id
        });
      }
      if (gn.ch.length > 0) tn.ch.push(gn);
    }
    root.ch.push(tn);
  }
  var uncat = scopeBook.highlights.filter(function(h2) { return !(h2.topic || "").trim(); });
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
      _y: 0
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
        srcId: uh.id
      });
    }
    root.ch.push(un);
  }
  return root;
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
  question: "#d97706"
};
var MM_NTYPE_COLORS = {
  root: "#2563eb",
  topic: "#7c3aed",
  type: "#475569",
  leaf: "#64748b"
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
  var root = buildMindMapTree(scopeBook);
  if (root.ch.length === 0) {
    container.createEl("p", { text: "\u6682\u65E0\u6458\u5F55\u6570\u636E\uFF0C\u65E0\u6CD5\u751F\u6210\u8111\u56FE\u3002", cls: "readflow-muted" });
    return;
  }
  var wrap = container.createDiv("readflow-mm-wrap");
  var canvas = wrap.createEl("canvas", { cls: "readflow-mm-canvas" });
  var W = wrap.getBoundingClientRect().width > 0 ? wrap.getBoundingClientRect().width : container.getBoundingClientRect().width || 500;
  var H = expanded
    ? Math.max(400, wrap.getBoundingClientRect().height || container.getBoundingClientRect().height - 40, 260)
    : 260;
  canvas.width = W;
  canvas.height = H;
  var LX = 150, GAP = 32;
  var totalH = mmSubH(root, GAP);
  layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
  var allN = collectMMNodes(root, []);
  var allE = collectMMEdges(root, []);
  var scale = 1, tx = 0, ty = 0;
  var hov = null, panActive = false, didPan = false, downPos = null, panOrig = { x: 0, y: 0 };
  if (totalH > H) {
    scale = Math.max(0.5, H / totalH * 0.9);
    tx = 10;
    ty = (H - totalH * scale) / 2;
  }
  var isDark = function() { return document.body.classList.contains("theme-dark"); };
  var drawRR = function(ctx, x2, y2, w, h, r) {
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
      var fx = e.from._x + mmNodeW(e.from), fy = e.from._y;
      var tx2 = e.to._x, ty2 = e.to._y;
      var cpx = fx + (tx2 - fx) * 0.5;
      var isHovEdge = hov && (hov.id === e.from.id || hov.id === e.to.id);
      ctx.strokeStyle = isHovEdge ? mmNodeColor(e.to) : (dk ? "#334155" : "#cbd5e1");
      ctx.lineWidth = (isHovEdge ? 2 : 1.2) / scale;
      ctx.globalAlpha = isHovEdge ? 0.9 : (hov ? 0.25 : 0.6);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(cpx, fy, cpx, ty2, tx2, ty2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < allN.length; i++) {
      var n = allN[i];
      var nw = mmNodeW(n), nh = mmNodeH(n);
      var nx = n._x, ny = n._y - nh / 2;
      var col = mmNodeColor(n);
      var isH = n === hov;
      var faded = hov && n !== hov && !allE.some(function(e2) {
        return (e2.from === hov && e2.to === n) || (e2.to === hov && e2.from === n);
      });
      ctx.globalAlpha = faded ? 0.3 : 1;
      if (isH) { ctx.shadowColor = col; ctx.shadowBlur = 12 / scale; }
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
      ctx.fillStyle = n.ntype === "root" ? "#f8fafc" : (dk ? "#e2e8f0" : "#1e293b");
      ctx.font = ((n.ntype === "root" || n.ntype === "topic") ? "600 " : "") + (11 / scale) + "px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.label, nx + nw / 2, n._y, nw - 8);
      if (n.ch.length > 0) {
        var ex = n.exp ? "\u25BC" : "\u25B6";
        ctx.fillStyle = dk ? "#94a3b8" : "#64748b";
        ctx.font = (8 / scale) + "px system-ui";
        ctx.textAlign = "right";
        ctx.fillText(ex, nx + nw - 4, n._y);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (hov) {
      var sx = hov._x * scale + tx, sy = (hov._y - mmNodeH(hov) / 2) * scale + ty - 8;
      var text = hov.full.length > 80 ? hov.full.slice(0, 80) + "\u2026" : hov.full;
      var lines = text.split("\n");
      var maxLine = lines[0];
      ctx.font = "12px system-ui, sans-serif";
      var tw2 = Math.min(ctx.measureText(maxLine).width, 320);
      var bw = tw2 + 24, bh = 14 + lines.length * 16;
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
  function notifyScale() {
    if (opts && opts.onScaleChange) opts.onScaleChange(scale);
  }
  function resetView() {
    scale = 1; tx = 0; ty = 0;
    if (totalH > H) { scale = Math.max(0.5, H / totalH * 0.9); tx = 10; ty = (H - totalH * scale) / 2; }
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
    var f = e.deltaY > 0 ? (1 - step) : (1 + step);
    zoomAt(f, e.clientX, e.clientY);
  }
  // Delay first draw until layout is settled so getBoundingClientRect has real size
  requestAnimationFrame(function() {
    var _cr2 = wrap.getBoundingClientRect();
    var changed = false;
    if (_cr2.width > 0 && _cr2.width !== W) { W = _cr2.width; canvas.width = W; changed = true; }
    if (expanded && _cr2.height > 0 && _cr2.height !== H) { H = _cr2.height; canvas.height = H; changed = true; }
    if (changed) {
      totalH = mmSubH(root, GAP);
      layoutMM(root, 30, 0, Math.max(totalH, H), LX, GAP);
      allN = collectMMNodes(root, []);
      allE = collectMMEdges(root, []);
      if (totalH > H) { scale = Math.max(0.5, H / totalH * 0.9); tx = 10; ty = (H - totalH * scale) / 2; }
    }
    draw();
    notifyScale();
  });
  function hitTest(mx, my) {  for (var i = allN.length - 1; i >= 0; i--) {
      var n = allN[i];
      var nw = mmNodeW(n), nh = mmNodeH(n);
      if (mx >= n._x && mx <= n._x + nw && my >= n._y - nh / 2 && my <= n._y + nh / 2) return n;
    }
    return null;
  }
  canvas.addEventListener("wheel", onWheel, { passive: false });
  if (expanded) wrap.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("mousedown", function(e) {
    if (e.button === 0) {
      downPos = { x: e.clientX, y: e.clientY };
      panOrig = { x: e.clientX - tx, y: e.clientY - ty };
    }
  });
  canvas.addEventListener("mousemove", function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - tx) / scale;
    var my = (e.clientY - rect.top - ty) / scale;
    if (downPos) {
      var dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
      if (!panActive && dx * dx + dy * dy > 16) { panActive = true; didPan = true; }
      if (panActive) { tx = e.clientX - panOrig.x; ty = e.clientY - panOrig.y; draw(); return; }
    }
    var found = hitTest(mx, my);
    if (found !== hov) { hov = found; canvas.style.cursor = found ? "pointer" : "grab"; draw(); }
  });
  canvas.addEventListener("click", function(e) {
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
  canvas.addEventListener("mouseup", function() { panActive = false; downPos = null; });
  canvas.addEventListener("mouseleave", function() { panActive = false; downPos = null; hov = null; draw(); });
  canvas.addEventListener("dblclick", resetView);
  var controls = {
    zoomIn: function() { zoomAt(1.18); },
    zoomOut: function() { zoomAt(1 / 1.18); },
    resetView: resetView,
    getScale: function() { return scale; }
  };
  wrap.readflowMmControls = controls;
  var ro = new ResizeObserver(function() {
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
        scale = Math.max(0.5, H / totalH * 0.9);
        tx = 10; ty = (H - totalH * scale) / 2;
      } else if (expanded) {
        scale = 1; tx = 0; ty = 0;
      }
      draw();
    }
  });
  ro.observe(wrap);
  return controls;
}

