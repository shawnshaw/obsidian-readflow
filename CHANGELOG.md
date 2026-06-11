# Changelog

## 0.3.4

- Phase 2: `entityRelations` supports `sinceHighlightId` / `chapterUid` for relationship evolution; graph shows chapter-aware edge labels and dashed evolution edges.
- Phase 2: `plotEvents` schema on book + narrative timeline「情节线」row + plot event management UI.
- Phase 2: `entityAliases` merge duplicate character nodes in relation graph.
- Phase 3: Co-occurrence relationship suggestions with one-click adopt in people workbench.
- Phase 3: Auto-route workbench (ideas / people / narrative) on first open per book based on highlight profile.

## 0.3.3

- Add three knowledge workbenches: 观点梳理 / 人物关系 / 叙事脉络 with hard UI isolation.
- Add narrative timeline (chapter columns × character swimlanes) using existing highlights and entity tags.
- Fix mind-map view persistence when switching workbench modes.
- Default top bar collapsed and wider knowledge pane for excerpt + structure focus.
- Add `npm run dev` (esbuild watch); clarify SSOT is `src/main.js` only.

## 0.3.2

- Fix character relation graph refresh and display names from highlight text.
- Fix expanded graph modal sizing and sort arrow direction.

## 0.2.2

- Fix note and review ID migration issues for existing synced data.
- Improve WeRead sync stability and cookie refresh handling.
- Start restructuring the plugin for maintainability and marketplace release preparation.

## 0.2.1

- Add batch push to WeRead.
- Improve cookie auto-save via the desktop login window.

## 0.2.0

- Add chapter tree navigation.
- Add vault linking and atomic highlight export.

## 0.1.0

- Initial release with WeRead sync, manual capture, AI classification, and Markdown export.
