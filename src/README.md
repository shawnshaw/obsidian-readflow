# ReadFlow Source Layout

## Single source of truth (SSOT)

| File | Role |
|------|------|
| **`src/main.js`** | **Only file esbuild bundles.** All runtime UI, sync, mind-map logic lives here. |
| `styles.css` | Plugin styles (edit directly at plugin root). |
| `main.js` | **Generated output.** Obsidian loads this. Never edit by hand. |

Build:

```bash
cd .obsidian/plugins/readflow
npm run build      # one-shot
npm run dev        # watch src/main.js → main.js
```

If you edit `main.js` directly, the next `npm run build` will **overwrite** your changes. That is the usual cause of “code lost after restart / rebuild”.

## Not in the build chain

These TypeScript / split files are **reference or migration stubs only**. Changing them has **no effect** until merged into `src/main.js`:

- `src/main.ts`, `src/main-plugin.ts`
- `src/ui/*.ts` (e.g. `HighlightPanelView.ts` is empty)
- `src/processor/mindmap.ts` (partial duplicate; inlined in `src/main.js`)
- `src/processor/knowledge.ts`, `src/importer/*`, etc.

Do not treat them as the live plugin source.

## Release version sync

When bumping version, update together:

- `manifest.json`
- `package.json`
- `versions.json`
- `CHANGELOG.md`

Then run `python3 check_release.py`.
