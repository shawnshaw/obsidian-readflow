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
 * Decides the knowledge-area mode after the integration is re-enabled. A mindmap that was
 * only forced because the integration was disabled returns to the canvas; a mindmap the
 * user chose for themselves stays put.
 */
function resolveKnowledgeAreaModeAfterEnable(mode, wasForcedToMindmap) {
  if (wasForcedToMindmap) return "canvas";
  return resolveKnowledgeAreaMode(mode, true);
}

/**
 * The knowledge area after the integration toggle fires. Re-enabling always asks the pane
 * to re-render, so the canvas entry reappears even when the user keeps the mindmap they
 * chose for themselves; only the automatic switch back to the canvas depends on whether
 * the mindmap was forced by the disable. A repeated disable keeps the original flag, so a
 * second toggle event cannot erase the fact that the mindmap was not the user's choice.
 */
function resolveKnowledgeAreaAfterToggle(enabled, mode, wasForcedToMindmap) {
  if (!enabled) {
    return {
      mode: "mindmap",
      forcedToMindmap: Boolean(wasForcedToMindmap) || mode !== "mindmap",
      refresh: true,
    };
  }
  return {
    mode: resolveKnowledgeAreaModeAfterEnable(mode, wasForcedToMindmap),
    forcedToMindmap: false,
    refresh: true,
  };
}

/**
 * Owns the embedded ReadFlow canvas for the whole life of one view: the mount session
 * (`ensure` + `mount` + attach) as well as the teardown of the mounted controller.
 *
 * Sessions are serialised. A new session first waits for any mount still in flight and
 * for the previous surface to be fully torn down before it starts, so a newer mount can
 * never grab a board that an older, not-yet-attached mount already holds as read-only.
 * Without that ordering the newer surface would stay read-only forever once the older one
 * released the token, and the board would be left with no writable owner at all.
 *
 * `dispose()` also waits for an in-flight session, so a refresh or close cannot observe a
 * half-mounted surface. A failed teardown keeps the controller reference and rejects, so
 * the caller can retry instead of silently losing a surface that still holds listeners.
 */
function createEmbeddedLifecycle() {
  let controller = null;
  let pendingTeardown = null;
  let pendingSession = null;
  let pendingDispose = null;

  const destroyController = () => {
    if (pendingTeardown) return pendingTeardown;
    const current = controller;
    if (!current) return Promise.resolve();
    pendingTeardown = (async () => {
      try {
        await current.destroy();
        if (controller === current) controller = null;
      } finally {
        pendingTeardown = null;
      }
    })();
    return pendingTeardown;
  };

  return {
    /** The mounted controller, or `null` when nothing is mounted. */
    get controller() {
      return controller;
    },
    /** Commits a freshly mounted surface. */
    attach(next) {
      controller = next;
      return next;
    },
    /**
     * Runs one complete mount session. The session receives no arguments and must perform
     * the ensure, the mount and the `attach` itself; whatever it leaves mounted is torn
     * down before the next session starts.
     */
    begin(task) {
      const previous = pendingSession ?? Promise.resolve();
      const current = previous
        .catch(() => {})
        .then(() => destroyController())
        .then(task);
      const barrier = current.then(
        () => {},
        () => {},
      );
      pendingSession = barrier;
      barrier
        .finally(() => {
          if (pendingSession === barrier) pendingSession = null;
        })
        .catch(() => {});
      return current;
    },
    /**
     * Waits for any in-flight session, then tears the mounted surface down. Resolves only
     * once the surface has flushed and released the board. Safe to call repeatedly: a
     * disposal that is already running is shared.
     */
    dispose() {
      if (pendingDispose) return pendingDispose;
      const waiting = pendingSession ?? Promise.resolve();
      const current = waiting.then(() => destroyController());
      pendingDispose = current;
      current
        .finally(() => {
          if (pendingDispose === current) pendingDispose = null;
        })
        .catch(() => {});
      return current;
    },
  };
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
  resolveKnowledgeAreaModeAfterEnable,
  resolveKnowledgeAreaAfterToggle,
  createEmbeddedLifecycle,
  createMountGuard,
  mountEmbeddedWhenCurrent,
  describeReadFlowSync,
  REQUIRED_EMBED_API,
};
