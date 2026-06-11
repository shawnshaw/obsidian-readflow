# Contributing to ReadFlow

## Critical: where to edit

**Only `src/main.js` and `styles.css` affect the running plugin.**

- ❌ Do not edit root `main.js` (generated; will be overwritten).
- ❌ Do not edit `src/*.ts` split files unless you also merge into `src/main.js`.
- ✅ Edit `src/main.js`, then `npm run build` or `npm run dev`.

See [`src/README.md`](src/README.md) for the full layout.

## Development Workflow

```bash
cd .obsidian/plugins/readflow
npm install
npm run dev    # recommended: rebuild on save
```

Reload Obsidian or disable/enable the plugin to pick up `main.js` changes.

Validate before PR:

```bash
npm run build
python3 check_release.py
```

Optional: from vault root, `bash Scripts/git-hooks/install-readflow-hook.sh` auto-rebuilds `main.js` on commit when `src/main.js` changes.

## Version bumps

Update in one commit:

- `manifest.json`
- `package.json`
- `versions.json`
- `CHANGELOG.md` (add `## x.y.z` section)

`check_release.py` enforces alignment.

## Pull Request Expectations

- Keep changes focused
- Preserve user data; add migrations when schema changes
- Regenerate `main.js` after `src/main.js` changes
- Update docs when behavior changes

## Before Submitting

- Plugin loads in Obsidian
- `main.js` banner shows `GENERATED FILE — DO NOT EDIT`
- Version files and CHANGELOG match `manifest.json`
