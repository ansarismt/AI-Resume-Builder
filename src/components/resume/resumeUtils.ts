export function splitSkills(text: string): string[] {
  const items: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of text) {
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
    const isSeparator =
      depth === 0 && (char === "," || char === ";" || char === "\n" || char === "|");
    if (isSeparator) {
      items.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  items.push(current);
  return items.map((item) => item.replace(/^[\s•\-–*]+/, "").trim()).filter(Boolean);
}
