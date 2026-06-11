#!/usr/bin/env python3
"""
DEPRECATED.

ReadFlow no longer splits `main.js` by hard-coded line numbers.
The maintained source is `src/main.js`, and the bundle is generated with esbuild.
"""
import re, sys

SRC = "/Users/oscarshao/Downloads/knowledge-system-main/.obsidian/plugins/readflow/main.js"
OUT = "/Users/oscarshao/Downloads/knowledge-system-main/.obsidian/plugins/readflow/src/"

def read():
    with open(SRC) as f:
        lines = f.readlines()
    return "".join(lines)

src = read()

# ---- 辅助：提取顶部 import_obsidian alias 声明 ----
def extract_module_header(src, marker_comment):
    """找到 '// marker' 注释后的第一行 var import_xxx = require(...)"""
    idx = src.find(marker_comment)
    if idx == -1: return ""
    tail = src[idx:]
    m = re.search(r'var (import_\w+) = require\("[^"]+"\);?\n', tail)
    if m: return "var " + m.group(1) + ' = require("obsidian");\n'
    return ""

# ---- 1. constants.js ----
# 提取 STATUS_LABELS, STATUS_COLORS, TYPE_ACCENT_COLOR, DEFAULT_SETTINGS 等散落在 settings.ts 里的常量和工具函数
# 实际上大部分在 settings.ts (L31-906) 块里，我们把纯数据和工具函数提取出来
# 先把 weread.js 里也在的函数跳过去

# ---- 边界 ----
W_SECTIONS = [
    ("constants.js", 31, 44),   # DEFAULT_SETTINGS only
    ("weread.js",     0,   0),   # 全部散落 — 用正则定位函数
    ("settings.js",  45,  906),
    ("linker.js",    907, 2002),
    ("panel.js",    2003, 2362),
    ("view.js",     2363, 4592),
    ("login.js",    4593, 4791),
]

def lines_to_str(src, start, end):
    """1-indexed line numbers -> string (inclusive start, inclusive end)"""
    lines = src.splitlines(keepends=True)
    return "".join(lines[start-1:end])

# 1. constants.js
c = lines_to_str(src, 1, 29)
# 去掉模块内任何 import_obsidian 的 re-export（constants 不需要）
# 只保留全局 runtime helper 和 DEFAULT_SETTINGS
# 实际上 L1-29 是 esbuild runtime，我们直接复制
with open(OUT + "constants.js", "w") as f:
    f.write(c)
print("✓ constants.js (L1-29)")

# 2. settings.js (L45-906)
with open(OUT + "settings.js", "w") as f:
    f.write(lines_to_str(src, 45, 906))
print("✓ settings.js (L45-906)")

# 3. linker.js (L907-2002)
with open(OUT + "linker.js", "w") as f:
    f.write(lines_to_str(src, 907, 2002))
print("✓ linker.js (L907-2002)")

# 4. panel.js (L2003-2362)
with open(OUT + "panel.js", "w") as f:
    f.write(lines_to_str(src, 2003, 2362))
print("✓ panel.js (L2003-2362)")

# 5. view.js (L2363-4592)
with open(OUT + "view.js", "w") as f:
    f.write(lines_to_str(src, 2363, 4592))
print("✓ view.js (L2363-4592)")

# 6. login.js (L4593-4791)
with open(OUT + "login.js", "w") as f:
    f.write(lines_to_str(src, 4593, 4791))
print("✓ login.js (L4593-4791)")

# 7. main.js — 只保留 esbuild runtime + ReadFlowPlugin + 导出
# 提取所有 import_obsidian alias（分散在全文的 var import_obsidianX = require(...)）
all_imports = re.findall(r'var (import_\w+) = require\("[^"]+"\);', src)
# 去重，保持顺序
seen, uniq = set(), []
for x in all_imports:
    if x not in seen:
        seen.add(x); uniq.append(x)
import_decls = "\n".join(f'var {x} = require("obsidian");' for x in uniq) + "\n"

plugin_body = lines_to_str(src, 4792, len(src.splitlines()))
new_main = (
    '/*\n * ReadFlow — plugin entry (split bundle)\n */\n'
    + c
    + "\n// All obsidian imports\n"
    + import_decls
    + "\n"
    + plugin_body
)
with open(OUT + "main_entry.js", "w") as f:
    f.write(new_main)
print("✓ main_entry.js (L4792-end, with imports)")

print("\nAll done!")
