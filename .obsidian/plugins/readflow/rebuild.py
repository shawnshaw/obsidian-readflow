#!/usr/bin/env python3
"""
DEPRECATED.

ReadFlow now uses `src/main.js` as the source-of-truth and `esbuild.config.mjs`
to generate the root-level `main.js`.

This legacy script is kept only as a historical reference for the old
line-sliced workflow.
"""
import re, os

SRC = "/Users/oscarshao/Downloads/knowledge-system-main/.obsidian/plugins/readflow/main.js.bak"
DST = "/Users/oscarshao/Downloads/knowledge-system-main/.obsidian/plugins/readflow/main.js"

with open(SRC) as f:
    lines = f.readlines()

def section(start, end):
    """1-indexed inclusive line range -> string"""
    return "".join(lines[start-1:end])

# ---- 1. esbuild runtime (L1-28) ----
runtime = section(1, 28)

# ---- 2. settings: DEFAULT_SETTINGS + ReadFlowSettingTab + weread/utils + VaultLinker (L45-906) ----
settings = section(45, 906)

# ---- 3. panel: QuickCaptureModal + reader + context + render (L2003-2362) ----
panel = section(2003, 2362)

# ---- 4. view: HighlightPanelView (L2363-4592) ----
view = section(2363, 4592)

# ---- 5. login: WereadLoginWindow (L4593-4791) ----
login = section(4593, 4791)

# ---- 6. plugin entry (L4792-end) ----
plugin = "".join(lines[4791:])

# ---- 收集所有 import_obsidian alias ----
all_text = runtime + settings + panel + view + login + plugin
found = {}
for m in re.finditer(r'var (import_obsidian(\d*)) = require\("[^"]+"\);', all_text):
    n = m.group(1)
    if n and n not in found:
        found[n] = f'var {n} = require("obsidian");'
imports = "\n".join(found[v] for v in sorted(found.keys())) + "\n"

# ---- 去掉各 section 顶部重复的 import_obsidian7 (统一放顶部) ----
def strip_aliases(src):
    src = re.sub(r'var import_obsidian7 = require\("[^"]+"\);\n', '', src)
    return src

settings = strip_aliases(settings)
panel = strip_aliases(panel)
view = strip_aliases(view)
login = strip_aliases(login)
plugin = strip_aliases(plugin)

# ---- 组装 ----
result = "\n\n".join([
    "/*",
    " * ReadFlow — bundle rebuilt from src/ modules",
    " */",
    "",
    "// ===== esbuild runtime =====",
    runtime.strip(),
    "",
    "// ===== obsidian imports (deduplicated) =====",
    imports,
    "",
    "// ===== settings (DEFAULT_SETTINGS + weread/utils + VaultLinker) =====",
    settings,
    "",
    "// ===== panel (QuickCaptureModal + reader/context/render) =====",
    panel,
    "",
    "// ===== view (HighlightPanelView) =====",
    view,
    "",
    "// ===== login (WereadLoginWindow) =====",
    login,
    "",
    "// ===== plugin entry =====",
    plugin.strip(),
]) + "\n"

with open(DST, "w") as f:
    f.write(result)

print(f"✓ main.js rebuilt ({len(result.splitlines())} lines)")
