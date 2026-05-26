// src/processor/classifier.ts
function suggestHighlightType(text) {
  const t = text.slice(0, 500);
  if (/[？?]$|为什么|如何|怎么|是否|吗/.test(t)) return "question";
  if (/例如|比如|案例|实例/.test(t)) return "example";
  if (/步骤|方法|流程|首先|其次|最后/.test(t)) return "method";
  if (/因此|所以|总之|结论|意味着/.test(t)) return "conclusion";
  if (/认为|观点|主张|应该|必须/.test(t)) return "idea";
  return void 0;
}

