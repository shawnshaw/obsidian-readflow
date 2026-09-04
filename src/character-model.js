function normalizeCharacterNames(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  const seen = new Set();
  const names = [];

  for (const item of source) {
    const name = String(item || "").trim();
    const key = name.toLocaleLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

function displayCharacterName(value) {
  const label = String(value || "").trim();
  const separator = label.search(/[:：]/);
  return separator > 0 ? label.slice(separator + 1).trim() || label : label;
}

function characterNamesOfHighlight(highlight) {
  if (Array.isArray(highlight == null ? void 0 : highlight.characters)) {
    return normalizeCharacterNames(highlight.characters);
  }
  return normalizeCharacterNames((highlight == null ? void 0 : highlight.entities) || []);
}

module.exports = {
  displayCharacterName,
  normalizeCharacterNames,
  characterNamesOfHighlight,
};
