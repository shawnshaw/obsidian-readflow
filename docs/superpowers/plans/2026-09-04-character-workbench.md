# Character Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit, book-scoped character tagging to highlights and make the existing people workbench consume it without losing legacy data.

**Architecture:** A small dependency-free character model owns normalization and the legacy fallback rule. The live plugin source uses that model in capture, profile synchronization, relationship selection, and graph construction. Existing entity profile and relation storage remains the compatibility layer.

**Tech Stack:** JavaScript, Node built-in test runner, esbuild, Obsidian plugin APIs.

## Global Constraints

- Edit `src/index.js`; it is the esbuild entry point.
- Keep existing `entities` behavior for highlights created before this feature.
- Do not infer or auto-create relationships from co-occurrence.
- Characters are scoped to one `bookId`.

---

### Task 1: Character model and regression tests

**Files:**
- Create: `src/character-model.js`
- Create: `test/character-model.test.js`

**Interfaces:**
- Produces `normalizeCharacterNames(value)` and `characterNamesOfHighlight(highlight)`.

- [x] Write tests for comma-separated normalization, case-insensitive de-duplication, explicit empty `characters`, and legacy `entities` fallback.
- [x] Run `node --test test/character-model.test.js` and verify the tests fail because the module does not exist.
- [x] Implement the two exported helpers in `src/character-model.js`.
- [x] Re-run `node --test test/character-model.test.js` and verify all tests pass.

### Task 2: Capture and profile synchronization

**Files:**
- Modify: `src/index.js`
- Test: `test/character-model.test.js`

**Interfaces:**
- Consumes `normalizeCharacterNames(value)` and `characterNamesOfHighlight(highlight)`.

- [x] Add a separate `characters` capture field with copy explaining that it is used by the people workbench.
- [x] Persist `characters` with a saved highlight.
- [x] Change profile synchronization and person collection to use `characterNamesOfHighlight`.
- [x] Build with `npm run build` and run the Node tests.

### Task 3: Workbench consistency

**Files:**
- Modify: `src/index.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes person entries collected from explicit characters or legacy data.

- [x] Use the same character source in the people graph and the relation anchor picker.
- [x] Update empty-state and capture copy to say “人物” rather than generic entity tags where appropriate.
- [x] Ensure summary cards show explicit character chips separately from ordinary entity chips.
- [x] Build the plugin and run the Node tests.
