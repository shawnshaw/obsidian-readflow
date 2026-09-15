function parseCookiePairs(raw) {
  return String(raw || "")
    .split(";")
    .map((item) => {
      const index = item.indexOf("=");
      if (index < 0) return null;
      return {
        name: item.slice(0, index).trim(),
        value: item.slice(index + 1).trim(),
      };
    })
    .filter(Boolean);
}

function sessionFingerprint(raw) {
  return parseCookiePairs(raw)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((pair) => `${pair.name}=${pair.value}`)
    .join(";");
}

function hasCompleteWereadSession(raw) {
  const pairs = parseCookiePairs(raw);
  const values = new Map(pairs.map((pair) => [pair.name, pair.value]));
  return Boolean(
    values.get("wr_vid") &&
      (values.get("wr_skey") || values.get("wr_name")),
  );
}

function shouldPersistNewWereadSession(initialRaw, candidateRaw) {
  return (
    hasCompleteWereadSession(candidateRaw) &&
    sessionFingerprint(initialRaw) !== sessionFingerprint(candidateRaw)
  );
}

module.exports = {
  shouldPersistNewWereadSession,
};
