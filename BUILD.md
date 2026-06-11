# ReadFlow Build Notes

**SSOT:** `src/main.js` — the only file esbuild reads.

**Output:** `main.js` — what Obsidian loads. **Do not edit manually.**

## Build

```bash
cd .obsidian/plugins/readflow
npm install
npm run build
```

Watch mode (auto-rebuild on save):

```bash
npm run dev
```

If Node is not installed locally:

```bash
bash build_with_local_node.sh
```

## Validate

```bash
python3 check_release.py
```

## Export Standalone Repo Staging

```bash
python3 export_standalone.py
```

Creates `Scripts/obsidian-plugins-release/readflow-standalone-<version>/`.

## Structure

| Path | Purpose |
|------|---------|
| `src/main.js` | Canonical monolithic source (~8k lines) |
| `main.js` | Generated bundle |
| `src/*.ts` | **Not built** — see `src/README.md` |
| `src-legacy-20260415/` | Archived reference only |

## Why code “disappears”

1. Edited `main.js` but not `src/main.js` → next build reverts.
2. Edited `src/*.ts` stubs → never bundled.
3. Edited `src/main.js` but forgot `npm run build` → Obsidian still runs old `main.js`.

Use `npm run dev` while developing in Obsidian.

**Git / 发版（双仓库）**：见 vault 根目录 `System/ReadFlow_Git与发版规范.md`；public repo 为 SSOT，vault 使用 submodule。

## Pre-commit hook (optional)

From vault root, install once so `src/main.js` changes always rebuild and stage `main.js`:

```bash
bash Scripts/git-hooks/install-readflow-hook.sh
```

## Marketplace Checklist

- `README.md`, `LICENSE`, `manifest.json`, `versions.json`
- GitHub release assets: `main.js`, `manifest.json`, `styles.css`
- `python3 check_release.py` passes
- `SMOKE_TEST_CHECKLIST.md` in a clean vault

## Packaging

```bash
python3 Scripts/build_obsidian_plugins.py readflow
```
