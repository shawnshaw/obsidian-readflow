#!/usr/bin/env python3
"""
DEPRECATED.

The plugin source of truth is now `src/main.js`.
This script belongs to the previous generated-slices workflow and is retained
only for reference.
"""
import re, os

SRC = "/Users/oscarshao/Downloads/knowledge-system-main/.obsidian/plugins/readflow/main.js"
OUT = "/Users/oscarshao/Downloads/knowledge-system-main/.obsidian/plugins/readflow/src/"

with open(SRC) as f:
    content = f.read()
    lines = content.splitlines(keepends=True)

def find_line(pattern, start=0):
    for i in range(start, len(lines)):
        if re.search(pattern, lines[i].strip()):
            return i + 1  # 1-indexed
    return None

def section_str(s, e):
    return "".join(lines[s-1:e])

def write_file(name, content):
    p = os.path.join(OUT, name)
    with open(p, "w") as f:
        f.write(content)
    print(f"  ✓ {name}: {len(content.splitlines())} lines")

os.makedirs(OUT, exist_ok=True)

# current main.js layout:
#   1-51     : esbuild runtime (up to "// ===== obsidian imports")
#   52-908   : obsidian imports + settings block (ReadFlowSettingTab...VaultLinker)
#   950-     : panel section starts (QuickCaptureModal is embedded in settings block from 908)
#   1274-    : view section (HighlightPanelView)
#   3495-    : login (WereadLoginWindow)
#   3700-    : plugin entry (ReadFlowPlugin)

# Actually scan from rebuilt main.js section markers
esbuild_end = find_line(r'^// ===== obsidian imports')
settings_end = find_line(r'^// ===== panel')
panel_end    = find_line(r'^// ===== view')
view_end     = find_line(r'^// ===== login')
login_end    = find_line(r'^// ===== plugin entry')

# constants: start to esbuild_end-1
write_file("constants.js",   section_str(1, esbuild_end))

# settings: esbuild_end to settings_end-1 (includes obsidian imports)
write_file("settings.js",    section_str(esbuild_end, settings_end))

# panel: settings_end to panel_end-1
write_file("panel.js",       section_str(settings_end, panel_end))

# view: panel_end to view_end-1
write_file("view.js",       section_str(panel_end, view_end))

# login: view_end to login_end-1
write_file("login.js",       section_str(view_end, login_end))

# main_entry: login_end to end
write_file("main_entry.js",   section_str(login_end, len(lines) + 1))

print(f"\n✓ All src/ files synced ({len(lines)} total lines in main.js)")
