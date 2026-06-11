# ReadFlow

Reading hub for Obsidian: sync highlights from **WeRead (微信读书)**, structured capture with type tagging, chapter navigation, AI classification, knowledge linking, and Markdown export.

> ⚠️ **Desktop Only**: ReadFlow uses desktop-only APIs for WeRead authentication. Mobile/terminal users should use the manual Cookie paste setting.

## What It Does

ReadFlow turns WeRead highlights into an Obsidian-native reading workflow.

- Sync books, highlights, and review notes from WeRead
- Browse them in a dedicated reading workspace inside Obsidian
- Organize highlights with status, topic, entities, and optional AI classification
- Link reading highlights back into your vault
- Export structured Markdown book notes into your vault

It is designed for people who want WeRead ingestion and Obsidian knowledge work to happen in one place instead of juggling separate tools.

## Features

### WeRead Sync

- **Full Library Sync**: Pull books, highlights, notes, reviews, and chapters from WeRead via Cookie-based API
- **Incremental Sync**: Only fetches books with new/updated highlights (skips empty books)
- **Batch Push**: Push notes back to WeRead via the same Cookie
- **Vault Note Push**: Push any Markdown note (with `readflow-book-id` in frontmatter) to WeRead
- **Login Window**: Built-in browser window for WeRead authentication (desktop only)

### Reading Panel

- **Chapter Tree**: Left sidebar with full book chapter navigation
- **Highlight List**: Browse all highlights with search and type filters
- **Uncaptured Filter**: Quickly find uncaptured highlights across the library
- **Knowledge Inspector**: Review grouped topics, relationships, and exportable knowledge structures

### Capture & Structuring

- **Quick Capture**: Capture any selected text from any Obsidian note into ReadFlow
- **Type Tagging**: Classify highlights as idea / method / example / conclusion / question
- **AI Classification**: Automatically classify via configured LLM endpoint (optional)
- **Topic & Entity Tags**: Add topics and entity tags for information modeling
- **Context Preservation**: Auto-captures surrounding paragraph as context

### Knowledge Linking

- **Jaccard Similarity**: Suggests related vault content based on keyword overlap
- **Context-Aware**: Links highlights to relevant notes and passages

### Markdown Export

- **Book Notes**: Write books to `Books/<Book Title>/` with full chapter + highlight structure
- **Atomic Highlights**: Option to create one Markdown file per highlight
- **Frontmatter**: Each book note includes `book_id`, `author`, `publisher`, `cover`, `isbn`
- **Topic Pages**: Export topic-focused knowledge pages derived from a book's highlights

### LLM Integration

- **Custom Endpoint**: Configure any OpenAI-compatible API
- **Classification**: Auto-classify highlight type via LLM
- **No data stored on external servers** — only your configured LLM endpoint is used

## Screenshots

Recommended screenshots for public release:

- Reading workspace with chapter navigation and highlight list
- Quick capture modal with type tagging and related-note suggestions
- ReadFlow settings page with WeRead sync and desktop login flow

## Who It Is For

- Heavy WeRead users who want their reading history in Obsidian
- Readers building long-term notes from highlights instead of storing them as raw excerpts only
- People who want a workspace for review, structuring, and export instead of a one-shot importer

## Current Limitations

- Desktop-only for the built-in WeRead login window
- Depends on WeRead web endpoints, so upstream changes may require plugin updates
- Best experience is currently optimized for Chinese WeRead workflows
- Public release still needs real screenshots before marketplace submission

## Setup

1. Enable in **Settings → Community Plugins**
2. Open **Settings → ReadFlow**
3. Configure **WeRead Cookie** (see below)
4. Set **Books Base Path** (default: `Books`)
5. Click **Sync WeRead** to import your library

## Basic Workflow

1. Connect ReadFlow to WeRead using the desktop login window or a manual cookie.
2. Run sync to pull books and highlights into the local plugin database.
3. Open the ReadFlow workspace and filter by chapter, status, or topic.
4. Add notes, tags, topic labels, and relationships to the highlights you want to keep.
5. Export structured Markdown back into your vault.

## Push Ideas Back to WeRead

ReadFlow can write **plain-text notes (想法)** back to WeChat Reading. Requires a valid Cookie.

### From ReadFlow panel (highlights synced from WeRead)

1. Sync WeRead → open ReadFlow panel
2. Edit a highlight’s **想法** (via **整理**)
3. Click **↑ 推送想法** on the card, or **↑ 推送想法 (N)** in the book header for batch push
4. In the edit modal, use **保存并推送** to save locally and push in one step

**Requirements**: highlight must have a `note`, and either `wereadReviewId` (from sync) or `wereadRange`. WeRead-sourced highlights missing `reviewId` need a re-sync first.

### From any Obsidian Markdown note

Add frontmatter:

```yaml
readflow-book-id: "mp_xxxxxxxx"   # required (or book_id)
readflow-chapter-uid: 12         # optional, for new book-level notes
readflow-weread-range: "100-200" # optional, attach to highlight range
readflow-weread-review-id: "xxx" # optional; after first push, written back for updates
```

Then run command **将当前笔记推送到微信读书**, use the settings button, or editor menu **推送到微信读书**. Pushes selected text if any, otherwise the note body (without frontmatter).

## Development

- **Canonical source**: `src/main.js` (minified CJS — this is the original source)
- **Generated bundle**: `main.js` (run `npm run build` to regenerate)
- **Clean TypeScript rewrites**: `src/main-plugin.ts` (in progress), `src/ui/WereadLoginWindow.ts`
- **Generated TS scaffolding**: `src_ts/` (reverse-engineered modules from `src/main.js`)
- **Legacy build artifacts**: `src_ts/` may be deleted once `src/main.js` is fully migrated

Build locally:

```bash
cd .obsidian/plugins/readflow
npm install
npm run build
python3 check_release.py
python3 export_standalone.py
```

If Node is not installed on the machine, you can also use:

```bash
cd .obsidian/plugins/readflow
bash build_with_local_node.sh
```

## Release Assets

When creating a GitHub release for Obsidian submission, attach:

- `main.js`
- `manifest.json`
- `styles.css`

### Getting the WeRead Cookie

**Desktop (recommended)**:

1. Click **「打开登录」** in ReadFlow Settings
2. Log into WeRead in the popup window (WeChat scan)
3. Cookie is auto-saved when login succeeds

**Manual (fallback — also used to verify API sync)**:

1. Open [weread.qq.com](https://weread.qq.com/) in Chrome/Edge and log in
2. Open DevTools (F12) → **Application** → **Cookies** → `https://weread.qq.com`
3. Copy all session cookies as a single string: `wr_vid=...; wr_skey=...; wr_fp=...` (semicolon-separated `name=value` pairs)
4. Paste into **微信读书 Cookie** in ReadFlow Settings
5. Click **验证 Cookie** — should show “Cookie 有效”
6. Run **同步微信读书** (Cmd/Ctrl+Shift+S)

Required cookie fields: `wr_vid` plus either `wr_skey` or `wr_name`. If sync fails with errcode `-2012`, the cookie has expired.

### MD Import (no Cookie)

Export notes from WeRead as Markdown into your vault, then:

1. Place files under `ReadingSpace/微信读书/` (default scan path) or configure **MD 导入扫描目录** in settings
2. Run command **从 Vault MD 文件导入更新** or use the toolbar **导入 MD** button

## Troubleshooting

### Sync says there is no data

- Confirm the WeRead cookie is still valid
- Try the desktop login window again
- Re-run sync after opening WeRead in the embedded login window
- Check the Obsidian developer console for `ReadFlow` logs

### Login window does not work

- Use manual cookie paste as a fallback
- Confirm you are on desktop Obsidian, not mobile
- If WeRead changed its login flow, the plugin may need an update

### Build or release preparation fails

- Run `python3 check_release.py`
- If Node is not installed, run `bash build_with_local_node.sh`
- Re-export the standalone staging folder with `python3 export_standalone.py`

## Highlight Types

| Type | Description |
|------|-------------|
| `idea` | Key insight or concept |
| `method` | Methodology, process, or technique |
| `example` | Supporting case or illustration |
| `conclusion` | Summary or key takeaway |
| `question` | Open question or thought-provoking point |

## Privacy

ReadFlow communicates with:

- `weread.qq.com` — your personal reading data via WeRead API
- Your configured LLM endpoint — only for optional AI classification (no data stored externally)

## Architecture

```
Books/                    # Vault folder for exported book notes
  <Book Title>/
    index.md             # Book homepage with metadata + chapter structure
    <chapter-name>.md    # Optional: one file per chapter
    highlights/          # Optional: atomic highlight files
      <highlight-id>.md
```

## Changelog

See `release-notes.md` and `versions.json`.

## License

MIT
