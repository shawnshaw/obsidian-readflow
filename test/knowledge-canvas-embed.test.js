const test = require("node:test");
const assert = require("node:assert/strict");

const {
  collectBookHighlightPaths,
  knowledgeCanvasPlugin,
  isKnowledgeCanvasAvailable,
  resolveKnowledgeAreaMode,
} = require("../src/knowledge-canvas-embed");

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

test("finds the Knowledge Canvas plugin only when its runtime API is present", () => {
  assert.equal(knowledgeCanvasPlugin({}), null);
  assert.equal(knowledgeCanvasPlugin({ plugins: {} }), null);
  assert.equal(
    knowledgeCanvasPlugin({ plugins: { plugins: { "knowledge-canvas": {} } } }),
    null,
  );

  const plugin = {
    isReadFlowIntegrationEnabled: () => true,
    ensureReadFlowBoard: () => {},
    mountEmbeddedBoard: () => {},
  };
  const app = { plugins: { plugins: { "knowledge-canvas": plugin } } };
  assert.equal(knowledgeCanvasPlugin(app), plugin);
});

test("treats the canvas as available only when integration is enabled", () => {
  const enabled = {
    isReadFlowIntegrationEnabled: () => true,
    ensureReadFlowBoard: () => {},
    mountEmbeddedBoard: () => {},
  };
  const disabled = {
    isReadFlowIntegrationEnabled: () => false,
    ensureReadFlowBoard: () => {},
    mountEmbeddedBoard: () => {},
  };
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
