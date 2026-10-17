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

/** The Knowledge Canvas plugin instance, but only when its embed runtime is present. */
function knowledgeCanvasPlugin(app) {
  const plugin = app?.plugins?.plugins?.["knowledge-canvas"];
  if (!plugin) return null;
  if (typeof plugin.isReadFlowIntegrationEnabled !== "function") return null;
  if (typeof plugin.ensureReadFlowBoard !== "function") return null;
  if (typeof plugin.mountEmbeddedBoard !== "function") return null;
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

module.exports = {
  collectBookHighlightPaths,
  knowledgeCanvasPlugin,
  isKnowledgeCanvasAvailable,
  resolveKnowledgeAreaMode,
};
