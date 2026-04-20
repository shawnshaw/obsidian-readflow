# ReadFlow Build Notes

`src/main.js` is the editable source-of-truth for the plugin.

`main.js` is the generated bundle that Obsidian actually loads.

## Build

```bash
cd .obsidian/plugins/readflow
npm install
npm run build
```

If the machine does not have Node installed, use the portable local build flow:

```bash
cd .obsidian/plugins/readflow
bash build_with_local_node.sh
```

## Validate

```bash
cd .obsidian/plugins/readflow
python3 check_release.py
```

## Export Standalone Repo Staging

```bash
cd .obsidian/plugins/readflow
python3 export_standalone.py
```

This creates a clean standalone staging folder under `Scripts/obsidian-plugins-release/`.

## Structure

- `src/main.js`: current maintained source entry
- `main.js`: generated bundle
- `src-legacy-20260415/`: archived line-sliced files kept only for reference

## Marketplace Checklist

- `README.md` exists at plugin root
- `LICENSE` exists at plugin root
- `manifest.json` uses valid semver and required fields
- `versions.json` maps plugin version to `minAppVersion`
- GitHub release attaches `main.js`, `manifest.json`, `styles.css`
- `SMOKE_TEST_CHECKLIST.md` is used in a clean vault before public release

## Packaging

The vault-level packaging script can build ReadFlow automatically when `esbuild.config.mjs` is present:

```bash
python3 Scripts/build_obsidian_plugins.py readflow
```
