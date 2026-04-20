# ReadFlow Smoke Test Checklist

Use this checklist before creating a public GitHub release or submitting the
plugin to the Obsidian community marketplace.

## Clean Install

- Start from a clean Obsidian vault
- Copy `main.js`, `manifest.json`, and `styles.css` into `.obsidian/plugins/readflow/`
- Enable the plugin from Community Plugins
- Confirm the plugin loads without startup errors

## Settings

- Open the ReadFlow settings tab
- Confirm all expected settings render correctly
- Save a simple non-empty Books Base Path and reopen settings
- Confirm the value persists after reload

## Panel

- Run the command to open ReadFlow
- Confirm the view opens in the main workspace as a tab
- Close and reopen the panel
- Confirm the existing panel is reused instead of duplicating unexpectedly

## WeRead Login

- Open the desktop login window
- Confirm the window can load WeRead
- Confirm successful login stores a cookie
- Confirm fallback messaging is understandable when login fails

## Sync

- Run a normal sync
- Confirm status bar and notices update during progress
- Confirm synced books appear in the workspace
- Confirm exported book notes are written to the configured base path

## Highlight Operations

- Open one synced book
- Filter by chapter
- Search for a highlight
- Open a highlight and edit note, topic, entities, and status
- Save and confirm the update persists after reload

## Quick Capture

- Select text from an Obsidian note
- Trigger quick capture
- Confirm the selected text is inserted
- Save the new highlight and confirm it appears in the workspace

## Export

- Export at least one book note
- If atomic highlights are enabled, confirm files are created under `highlights/`
- Confirm generated Markdown files are readable and linked correctly

## Stability

- Disable and re-enable the plugin
- Reload Obsidian
- Confirm plugin data still loads
- Confirm no obvious console errors appear during common actions
