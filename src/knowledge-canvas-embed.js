/**
 * ReadFlow → Knowledge Canvas embedding helpers.
 *
 * Pure and dependency-free (no `obsidian` import) so this module stays unit-testable
 * under `node --test`, exactly like `character-model.js` and `weread-session.js`.
 * Everything here only computes values; the DOM/plugin wiring lives in `src/index.js`.
 */

const ILLEGAL_PATH_CHARS = /[\\/:*?"<>|]/g;

/** Mirrors the safe-path-segment logic used by the ReadFlow vault writer. */
function safeSegment(name) {
  const s = String(name ?? "")
    .replace(ILLEGAL_PATH_CHARS, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return s || "untitled";
}

/** Mirrors the atomic-highlight filename used by the ReadFlow vault writer. */
function highlightFilename(h) {
  const slug =
    String(h?.content ?? "")
      .slice(0, 40)
      .replace(ILLEGAL_PATH_CHARS, "_")
      .trim() || "note";
  return `${String(h?.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "_")}_${slug}.md`;
}

/**
 * The Markdown files that represent one book's highlights: the book document
 * always comes first, and atomic mode adds one file per highlight.
 */
function collectBookHighlightPaths(settings, book) {
  const base =
    String(settings?.booksBasePath || "Books")
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\/{2,}/g, "/") || "Books";
  const seg = safeSegment(book?.title);
  const folder = `${base}/${seg}`;
  const paths = [`${folder}/${seg}.md`];
  if (settings?.atomicHighlights) {
    for (const h of book?.highlights ?? []) {
      paths.push(`${folder}/highlights/${highlightFilename(h)}`);
    }
  }
  return paths;
}

/**
 * The full Knowledge Canvas embed runtime surface. Every method must exist before
 * ReadFlow tries to embed a canvas, so an outdated Knowledge Canvas falls back to the
 * mindmap instead of half-working.
 */
const REQUIRED_EMBED_API = [
  "isReadFlowIntegrationEnabled",
  "ensureReadFlowBoard",
  "mountEmbeddedBoard",
  "resolveReadFlowBoardPath",
  "bindReadFlowBoard",
  "listCanvasFiles",
  "registerReadFlowIntegrationListener",
];

/** The Knowledge Canvas plugin instance, but only when its full embed runtime is present. */
function knowledgeCanvasPlugin(app) {
  const plugin = app?.plugins?.plugins?.["knowledge-canvas"];
  if (!plugin) return null;
  for (const method of REQUIRED_EMBED_API) {
    if (typeof plugin[method] !== "function") return null;
  }
  return plugin;
}

/** Whether the embedded canvas surface is usable right now. */
function isKnowledgeCanvasAvailable(app) {
  const plugin = knowledgeCanvasPlugin(app);
  return Boolean(plugin && plugin.isReadFlowIntegrationEnabled() === true);
}

/**
 * The right knowledge area defaults to the embedded canvas and falls back to the
 * mindmap when the canvas is unavailable or the user explicitly chose the mindmap.
 */
function resolveKnowledgeAreaMode(preference, canvasAvailable) {
  if (preference === "mindmap") return "mindmap";
  if (preference === "canvas" && canvasAvailable) return "canvas";
  return canvasAvailable ? "canvas" : "mindmap";
}

/**
 * A generation token that serialises embedded-canvas mounts. A fast book switch issues a
 * newer token before an older, slower mount resolves; the stale mount then sees it is no
 * longer current and is destroyed instead of being committed.
 */
function createMountGuard() {
  let generation = 0;
  return {
    /** Starts a new mount and returns the token it must present to commit. */
    next() {
      generation += 1;
      return generation;
    },
    /** True only while `token` is the most recently started mount. */
    isCurrent(token) {
      return token === generation;
    },
  };
}

/**
 * Runs `mount` and commits its controller only if `token` is still the latest mount.
 * A controller that landed after a newer mount started is handed to `onStale` for
 * immediate teardown, so an old book can never overwrite the newly selected one.
 */
async function mountEmbeddedWhenCurrent(guard, token, mount, onStale) {
  const controller = await mount();
  if (!guard.isCurrent(token)) {
    if (controller && onStale) await onStale(controller);
    return { controller, stale: true };
  }
  return { controller, stale: false };
}

/**
 * The human-readable result of `ensureReadFlowBoard`, for the embedded canvas header.
 * Returns `null` when nothing changed and the header should stay silent.
 */
function describeReadFlowSync(result) {
  const added = Number(result?.addedCount) || 0;
  if (result?.created) return `已创建知识画板，导入 ${added} 条摘录`;
  if (added > 0) return `已同步 ${added} 条新摘录到知识画板`;
  return null;
}

module.exports = {
  collectBookHighlightPaths,
  knowledgeCanvasPlugin,
  isKnowledgeCanvasAvailable,
  resolveKnowledgeAreaMode,
  createMountGuard,
  mountEmbeddedWhenCurrent,
  describeReadFlowSync,
  REQUIRED_EMBED_API,
};
