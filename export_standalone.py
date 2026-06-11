#!/usr/bin/env python3
"""
Export ReadFlow into a standalone publishable directory.

This is useful because the plugin currently lives inside a larger Obsidian
vault repo, while the community marketplace flow works best with a dedicated
plugin repository.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VAULT_ROOT = ROOT.parents[2]
RELEASE_ROOT = VAULT_ROOT / "Scripts" / "obsidian-plugins-release"

COPY_FILES = [
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "SUPPORT.md",
    "OBSIDIAN_RELEASE_PR_TEMPLATE.md",
    "prepare_release_assets.py",
    "MARKETPLACE_SUBMISSION.md",
    "SMOKE_TEST_CHECKLIST.md",
    "manifest.json",
    "versions.json",
    "package.json",
    "esbuild.config.mjs",
    "styles.css",
    "main.js",
    "BUILD.md",
    "check_release.py",
    "bootstrap_local_node.sh",
    "build_with_local_node.sh",
    "release-notes.md",
]

COPY_DIRS = [
    "src",
    ".github",
]


def main() -> int:
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    destination = RELEASE_ROOT / f"readflow-standalone-{version}"

    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True, exist_ok=True)

    for rel in COPY_FILES:
      src = ROOT / rel
      if src.exists():
        shutil.copy2(src, destination / rel)

    for rel in COPY_DIRS:
        src_dir = ROOT / rel
        if src_dir.exists():
            shutil.copytree(src_dir, destination / rel)

    print(destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
