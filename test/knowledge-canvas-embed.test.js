const test = require("node:test");
const assert = require("node:assert/strict");

const {
  collectBookHighlightPaths,
  knowledgeCanvasPlugin,
  isKnowledgeCanvasAvailable,
  resolveKnowledgeAreaMode,
  resolveKnowledgeAreaModeAfterEnable,
  resolveKnowledgeAreaAfterToggle,
  createEmbeddedTeardown,
  createMountGuard,
  mountEmbeddedWhenCurrent,
  describeReadFlowSync,
  REQUIRED_EMBED_API,
} = require("../src/knowledge-canvas-embed");

const FULL_EMBED_PLUGIN = () => ({
  isReadFlowIntegrationEnabled: () => true,
  ensureReadFlowBoard: () => {},
  mountEmbeddedBoard: () => {},
  resolveReadFlowBoardPath: () => {},
  bindReadFlowBoard: () => {},
  listCanvasFiles: () => [],
  registerReadFlowIntegrationListener: () => {},
});

test("collects only the book markdown when atomic highlights are off", () => {
  const paths = collectBookHighlightPaths(
    { booksBasePath: "Books", atomicHighlights: false },
    { title: "Pride and Prejudice", highlights: [{ id: "a", content: "x" }] },
  );
  assert.deepEqual(paths, ["Books/Pride and Prejudice/Pride and Prejudice.md"]);
});

test("adds one file per highlight when atomic highlights are on", () => {
  const paths = collectBookHighlightPaths(
    { booksBasePath: "Books", atomicHighlights: true },
    {
      title: "Pride and Prejudice",
      highlights: [
        { id: "abc-123", content: "hello world" },
        { id: "def", content: "another" },
      ],
    },
  );
  assert.deepEqual(paths, [
    "Books/Pride and Prejudice/Pride and Prejudice.md",
    "Books/Pride and Prejudice/highlights/abc-123_hello world.md",
    "Books/Pride and Prejudice/highlights/def_another.md",
  ]);
});

test("sanitizes the book title into a vault-safe path segment", () => {
  const paths = collectBookHighlightPaths(
    { booksBasePath: "Books", atomicHighlights: false },
    { title: "Pride/Prejudice: The Book", highlights: [] },
  );
  assert.deepEqual(paths, [
    "Books/Pride_Prejudice_ The Book/Pride_Prejudice_ The Book.md",
  ]);
});

test("normalizes a decorated books base path", () => {
  const paths = collectBookHighlightPaths(
    { booksBasePath: "\\/Books//", atomicHighlights: false },
    { title: "Emma", highlights: [] },
  );
  assert.deepEqual(paths, ["Books/Emma/Emma.md"]);
});

test("finds the Knowledge Canvas plugin only when its full embed runtime is present", () => {
  assert.equal(knowledgeCanvasPlugin({}), null);
  assert.equal(knowledgeCanvasPlugin({ plugins: {} }), null);
  assert.equal(
    knowledgeCanvasPlugin({ plugins: { plugins: { "knowledge-canvas": {} } } }),
    null,
  );

  const plugin = FULL_EMBED_PLUGIN();
  const app = { plugins: { plugins: { "knowledge-canvas": plugin } } };
  assert.equal(knowledgeCanvasPlugin(app), plugin);
});

test("rejects a Knowledge Canvas plugin missing any embed method", () => {
  for (const missing of REQUIRED_EMBED_API) {
    const plugin = FULL_EMBED_PLUGIN();
    delete plugin[missing];
    const app = { plugins: { plugins: { "knowledge-canvas": plugin } } };
    assert.equal(
      knowledgeCanvasPlugin(app),
      null,
      `expected the gate to fail without ${missing}`,
    );
  }
});

test("treats the canvas as available only when integration is enabled", () => {
  const enabled = FULL_EMBED_PLUGIN();
  const disabled = { ...FULL_EMBED_PLUGIN(), isReadFlowIntegrationEnabled: () => false };
  assert.equal(
    isKnowledgeCanvasAvailable({
      plugins: { plugins: { "knowledge-canvas": enabled } },
    }),
    true,
  );
  assert.equal(
    isKnowledgeCanvasAvailable({
      plugins: { plugins: { "knowledge-canvas": disabled } },
    }),
    false,
  );
  assert.equal(isKnowledgeCanvasAvailable({ plugins: { plugins: {} } }), false);
});

test("defaults to the canvas and falls back to the mindmap", () => {
  assert.equal(resolveKnowledgeAreaMode(undefined, true), "canvas");
  assert.equal(resolveKnowledgeAreaMode(undefined, false), "mindmap");
  assert.equal(resolveKnowledgeAreaMode("canvas", true), "canvas");
  assert.equal(resolveKnowledgeAreaMode("canvas", false), "mindmap");
  assert.equal(resolveKnowledgeAreaMode("mindmap", true), "mindmap");
  assert.equal(resolveKnowledgeAreaMode("mindmap", false), "mindmap");
});

test("re-enabling restores the canvas only when the disable forced the mindmap", () => {
  assert.equal(resolveKnowledgeAreaModeAfterEnable("mindmap", true), "canvas");
  assert.equal(resolveKnowledgeAreaModeAfterEnable("mindmap", false), "mindmap");
  assert.equal(resolveKnowledgeAreaModeAfterEnable("canvas", true), "canvas");
  assert.equal(resolveKnowledgeAreaModeAfterEnable(null, false), "canvas");
});

test("re-enabling always refreshes the pane, even when the user keeps their own mindmap", () => {
  // The user picked the mindmap for themselves: no automatic switch, but the canvas
  // entry must still come back because the pane is re-rendered.
  assert.deepEqual(resolveKnowledgeAreaAfterToggle(true, "mindmap", false), {
    mode: "mindmap",
    forcedToMindmap: false,
    refresh: true,
  });
  // The mindmap was only forced by the disable: return to the canvas.
  assert.deepEqual(resolveKnowledgeAreaAfterToggle(true, "mindmap", true), {
    mode: "canvas",
    forcedToMindmap: false,
    refresh: true,
  });
  assert.deepEqual(resolveKnowledgeAreaAfterToggle(false, "canvas", false), {
    mode: "mindmap",
    forcedToMindmap: true,
    refresh: true,
  });
  // A repeated disable event must not erase the fact that the mindmap was not the user's choice.
  assert.deepEqual(resolveKnowledgeAreaAfterToggle(false, "mindmap", true), {
    mode: "mindmap",
    forcedToMindmap: true,
    refresh: true,
  });
});

test("a refresh waits for the pending save to release the board before syncing again", async () => {
  const teardown = createEmbeddedTeardown();
  const events = [];
  let finishSave;
  const pendingSave = new Promise((resolve) => {
    finishSave = resolve;
  });
  const first = {
    destroy: async () => {
      events.push("teardown:start");
      await pendingSave;
      events.push("teardown:end");
    },
  };
  teardown.attach(first);

  const refresh = (async () => {
    await teardown.dispose();
    events.push("sync+remount");
  })();

  // Nothing may be synced or mounted while the old surface still owns the writer.
  await Promise.resolve();
  assert.deepEqual(events, ["teardown:start"]);
  assert.equal(teardown.controller, first);

  finishSave();
  await refresh;
  assert.deepEqual(events, ["teardown:start", "teardown:end", "sync+remount"]);
  assert.equal(teardown.controller, null);
});

test("a refresh and a close share one teardown instead of destroying the surface twice", async () => {
  const teardown = createEmbeddedTeardown();
  let destroys = 0;
  teardown.attach({
    destroy: async () => {
      destroys += 1;
      await new Promise((resolve) => setImmediate(resolve));
    },
  });
  const refresh = teardown.dispose();
  const close = teardown.dispose();
  assert.equal(refresh, close);
  await Promise.all([refresh, close]);
  assert.equal(destroys, 1);
});

test("a failed teardown keeps the controller and can be retried", async () => {
  const teardown = createEmbeddedTeardown();
  let attempts = 0;
  const controller = {
    destroy: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("flush failed");
    },
  };
  teardown.attach(controller);

  await assert.rejects(teardown.dispose(), /flush failed/);
  assert.equal(teardown.controller, controller, "a failed close must stay retryable");

  await teardown.dispose();
  assert.equal(attempts, 2);
  assert.equal(teardown.controller, null);
});

test("mount guard invalidates older tokens as new mounts start", () => {
  const guard = createMountGuard();
  const a = guard.next();
  assert.equal(guard.isCurrent(a), true);
  const b = guard.next();
  assert.equal(guard.isCurrent(a), false);
  assert.equal(guard.isCurrent(b), true);
  const c = guard.next();
  assert.equal(guard.isCurrent(b), false);
  assert.equal(guard.isCurrent(c), true);
});

test("keeps the most recent mount", async () => {
  const guard = createMountGuard();
  const token = guard.next();
  const result = await mountEmbeddedWhenCurrent(
    guard,
    token,
    () => Promise.resolve({ id: "current" }),
    () => {
      throw new Error("must not tear down a current mount");
    },
  );
  assert.equal(result.stale, false);
  assert.deepEqual(result.controller, { id: "current" });
});

test("destroys a delayed earlier mount the moment it lands after a newer switch", async () => {
  const guard = createMountGuard();
  const destroyed = [];
  const mount = (name, delay) => new Promise((resolve) =>
    setTimeout(() => resolve({ name, destroy: () => destroyed.push(name) }), delay),
  );

  // Book A starts first but resolves slowly.
  const tokenA = guard.next();
  const workA = mountEmbeddedWhenCurrent(
    guard,
    tokenA,
    () => mount("A", 30),
    (controller) => controller.destroy(),
  );

  // Book B is switched to before A's board finishes loading.
  const tokenB = guard.next();
  const workB = mountEmbeddedWhenCurrent(
    guard,
    tokenB,
    () => mount("B", 5),
    (controller) => controller.destroy(),
  );

  const [resultA, resultB] = await Promise.all([workA, workB]);
  assert.equal(resultA.stale, true);
  assert.equal(resultB.stale, false);
  assert.equal(resultB.controller.name, "B");
  assert.deepEqual(destroyed, ["A"]);
});

test("does not destroy anything when a stale mount produces no controller", async () => {
  const guard = createMountGuard();
  const tokenA = guard.next();
  guard.next();
  let teardownCalled = false;
  const result = await mountEmbeddedWhenCurrent(
    guard,
    tokenA,
    () => Promise.resolve(null),
    () => {
      teardownCalled = true;
    },
  );
  assert.equal(result.stale, true);
  assert.equal(result.controller, null);
  assert.equal(teardownCalled, false);
});

test("describes a created board, an incremental sync, and a silent no-op", () => {
  assert.equal(describeReadFlowSync({ created: true, addedCount: 3 }), "已创建知识画板，导入 3 条摘录");
  assert.equal(describeReadFlowSync({ created: false, addedCount: 2 }), "已同步 2 条新摘录到知识画板");
  assert.equal(describeReadFlowSync({ created: false, addedCount: 0 }), null);
  assert.equal(describeReadFlowSync(null), null);
  assert.equal(describeReadFlowSync({ created: true, addedCount: 0 }), "已创建知识画板，导入 0 条摘录");
});
