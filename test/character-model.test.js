const test = require("node:test");
const assert = require("node:assert/strict");

const {
  displayCharacterName,
  normalizeCharacterNames,
  characterNamesOfHighlight,
} = require("../src/character-model");

test("uses the name portion of a role-prefixed character label", () => {
  assert.equal(displayCharacterName("姐姐:伊丽莎白"), "伊丽莎白");
});

test("normalizes character names without duplicate spellings", () => {
  assert.deepEqual(
    normalizeCharacterNames(" Darcy, Elizabeth , darcy, , Mr. Darcy "),
    ["Darcy", "Elizabeth", "Mr. Darcy"],
  );
});

test("uses explicit characters even when the list is intentionally empty", () => {
  assert.deepEqual(
    characterNamesOfHighlight({ characters: [], entities: ["London"] }),
    [],
  );
});

test("uses legacy entity tags when the highlight has no characters field", () => {
  assert.deepEqual(
    characterNamesOfHighlight({ entities: ["Elizabeth", "Darcy"] }),
    ["Elizabeth", "Darcy"],
  );
});
