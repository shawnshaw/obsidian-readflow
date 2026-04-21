#!/usr/bin/env python3
"""
Lightweight release validator for the ReadFlow plugin.

Checks:
- required root files for Obsidian plugin submission
- manifest schema basics
- versions.json mapping format
- source/build files expected by the local workflow
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
REQUIRED_ROOT_FILES = [
    "README.md",
    "LICENSE",
    "manifest.json",
    "versions.json",
    "package.json",
    "esbuild.config.mjs",
    "src/main.js",
]

SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    raise SystemExit(1)


def warn(message: str) -> None:
    print(f"[WARN] {message}")


def ok(message: str) -> None:
    print(f"[OK] {message}")


def require_file(path: Path) -> None:
    if not path.exists():
        fail(f"Missing required file: {path.relative_to(ROOT)}")
    ok(f"Found {path.relative_to(ROOT)}")


def main() -> int:
    for rel in REQUIRED_ROOT_FILES:
        require_file(ROOT / rel)

    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    versions = json.loads((ROOT / "versions.json").read_text(encoding="utf-8"))
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))

    required_manifest_fields = [
        "id",
        "name",
        "version",
        "minAppVersion",
        "description",
        "author",
        "isDesktopOnly",
    ]
    for field in required_manifest_fields:
        if field not in manifest:
            fail(f"manifest.json missing required field: {field}")
    ok("manifest.json contains required fields")

    if "obsidian" in manifest["id"].lower():
        fail("manifest id must not contain 'obsidian'")
    ok("manifest id looks valid")

    for key in ("version", "minAppVersion"):
        if not SEMVER_RE.match(str(manifest[key])):
            fail(f"manifest {key} must use x.y.z format")
    ok("manifest version fields use semver format")

    if not isinstance(manifest["isDesktopOnly"], bool):
        fail("manifest isDesktopOnly must be boolean")
    ok("manifest isDesktopOnly type is valid")

    if package.get("version") != manifest["version"]:
        warn("package.json version does not match manifest.json version")
    else:
        ok("package.json version matches manifest.json")

    if not isinstance(versions, dict) or not versions:
        fail("versions.json must be a non-empty object")
    for plugin_version, min_app_version in versions.items():
        if not SEMVER_RE.match(str(plugin_version)):
            fail(f"versions.json key is not semver: {plugin_version}")
        if not SEMVER_RE.match(str(min_app_version)):
            fail(
                "versions.json values must be minAppVersion strings, "
                f"got {plugin_version}: {min_app_version}"
            )
    ok("versions.json uses plugin-version -> minAppVersion mapping")

    if manifest["version"] not in versions:
        warn("Current manifest version is not present in versions.json")
    else:
        ok("Current manifest version is present in versions.json")

    release_assets = ["main.js", "manifest.json", "styles.css"]
    for asset in release_assets:
        if not (ROOT / asset).exists():
            warn(f"Release asset missing locally: {asset}")
        else:
            ok(f"Release asset present locally: {asset}")

    print("\nRelease validation completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
