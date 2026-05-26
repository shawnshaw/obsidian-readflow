// src/ui/related.ts
function suggestRelatedHighlights(all, content, excludeId) {
  const scored = all.filter((h) => h.id !== excludeId).map((h) => ({ h, score: tokenOverlapScore(content, h.content) })).filter((x) => x.score > 0.08).sort((a, b) => b.score - a.score);
  return scored.map((x) => x.h);
}

