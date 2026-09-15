const test = require("node:test");
const assert = require("node:assert/strict");

const { shouldPersistNewWereadSession } = require("../src/weread-session");

const staleSession = "wr_vid=100; wr_skey=old; wr_name=reader";
const freshSession = "wr_vid=100; wr_skey=new; wr_name=reader";

test("persists a complete session when login changes its credentials", () => {
  assert.equal(shouldPersistNewWereadSession(staleSession, freshSession), true);
});

test("does not treat an unchanged session as a new login", () => {
  assert.equal(shouldPersistNewWereadSession(staleSession, staleSession), false);
});

test("persists a renewed login token but ignores unrelated cookie changes", () => {
  assert.equal(
    shouldPersistNewWereadSession(
      staleSession,
      "wr_vid=100; wr_skey=old; wr_name=reader; wr_rt=renewed",
    ),
    true,
  );
  assert.equal(
    shouldPersistNewWereadSession(
      staleSession,
      "wr_vid=100; wr_skey=old; wr_name=reader; analytics=updated",
    ),
    false,
  );
});

test("does not persist an incomplete candidate session", () => {
  assert.equal(
    shouldPersistNewWereadSession(staleSession, "wr_vid=100"),
    false,
  );
});
