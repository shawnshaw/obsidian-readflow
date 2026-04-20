# Contributing to ReadFlow

Thanks for your interest in improving ReadFlow.

## Development Workflow

1. Work from the plugin root:

```bash
cd .obsidian/plugins/readflow
```

2. Build the plugin:

```bash
npm install
npm run build
```

If Node is not available on the machine:

```bash
bash build_with_local_node.sh
```

3. Validate release structure:

```bash
python3 check_release.py
```

## Source Layout

- `src/main.js`: thin entrypoint
- `src/plugin.js`: plugin lifecycle and commands
- `src/settings.js`: settings tab and defaults
- `src/weread.js`: WeRead sync and API logic
- `src/core.js`: linking, export, and knowledge helpers
- `src/modal.js`: capture modal and small UI helpers
- `src/view.js`: main workspace UI
- `src/login.js`: desktop login window

## Pull Request Expectations

- Keep changes focused and scoped
- Preserve existing user data when possible
- Avoid introducing sync-breaking changes without migration logic
- Update documentation when behavior changes
- Run build and release validation before submitting

## Before Submitting

- Confirm the plugin still loads in Obsidian
- Confirm `main.js` is regenerated after source changes
- Confirm `manifest.json`, `package.json`, and `versions.json` stay consistent when versioning changes
