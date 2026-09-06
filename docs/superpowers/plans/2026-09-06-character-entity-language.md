# Character and Entity Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the distinction between people and other entities explicit in the ReadFlow capture flow.

**Architecture:** Reorder existing capture settings and replace visible copy only. No persisted data schema or graph behavior changes.

**Tech Stack:** JavaScript, esbuild.

## Global Constraints

- Edit the live entry point `src/index.js` and regenerate `main.js`.
- Keep `characters` and `entities` values unchanged.
- Do not add a separate management page.

---

### Task 1: Capture language and verification

**Files:**
- Modify: `src/index.js`
- Generated: `main.js`

- [x] Move the existing 人物 setting above 其他实体, rename 实体标签 to 其他实体, and replace the descriptions and placeholders with their distinct purposes.
- [x] Replace stale empty-state messages that describe the old role:name entity workflow.
- [x] Run `node --check src/index.js`, `npm run build`, and `git diff --check`.
