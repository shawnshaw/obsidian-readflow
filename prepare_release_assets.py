#!/usr/bin/env python3
"""
Copy the exact GitHub release assets into a versioned folder.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUT_ROOT = ROOT / "release-assets"


def main() -> int:
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    out_dir = OUT_ROOT / version

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for name in ("manifest.json", "main.js", "styles.css"):
        shutil.copy2(ROOT / name, out_dir / name)

    print(out_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
