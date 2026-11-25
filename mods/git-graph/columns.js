// Shared column ordering and geometry, independent of the renderer.
export const DEFAULT_ORDER = ["graph", "description", "date", "author", "hash"];
export const COLUMN_TITLES = { graph: "Graph", description: "Description", date: "Date", author: "Author", hash: "Commit" };
export function normalizeOrder(saved) {
  const valid = Array.isArray(saved) ? saved.filter((key, i) => DEFAULT_ORDER.includes(key) && saved.indexOf(key) === i) : [];
  return [...valid, ...DEFAULT_ORDER.filter((key) => !valid.includes(key))];
}
export function normalizeVisibility(saved) {
  const valid = Array.isArray(saved) ? saved.filter((key, i) => DEFAULT_ORDER.includes(key) && saved.indexOf(key) === i) : [];
  return valid.length ? valid : [...DEFAULT_ORDER];
}
export function visibleOrder(order, wide, visibility = null) {
  const all = normalizeOrder(order);
  if (visibility) {
    const enabled = new Set(normalizeVisibility(visibility));
    const selected = all.filter((key) => enabled.has(key));
    const shown = wide ? selected : selected.filter((key) => key !== "author" && key !== "hash");
    return shown.length ? shown : selected.slice(0, 1);
  }
  return all.filter((key) => wide || (key !== "author" && key !== "hash"));
}
// Coordinates are relative to the start of the row; its right padding is excluded.
export function columnBounds(order, wide, width, widths, gap, visibility = null) {
  const keys = visibleOrder(order, wide, visibility);
  const fixed = keys.reduce((sum, key) => sum + (key === "description" ? 0 : widths[key]), 0);
  const description = Math.max(0, width - fixed - gap * (keys.length - 1));
  let x = 0;
  return keys.map((key) => { const w = key === "description" ? description : widths[key]; const result = { key, left: x, right: x + w }; x += w + gap; return result; });
}
// Move only among visible columns: hidden columns retain their slots at narrow widths.
export function moveColumn(order, wide, key, target, visibility = null) {
  const all = normalizeOrder(order), visible = visibleOrder(all, wide, visibility);
  if (!visible.includes(key) || !visible.includes(target) || key === target) return all;
  const next = visible.filter((k) => k !== key);
  next.splice(visible.indexOf(target), 0, key);
  let i = 0;
  return all.map((k) => visible.includes(k) ? next[i++] : k);
}
export function targetColumn(bounds, from, delta) {
  const start = bounds.find((b) => b.key === from);
  if (!start) return from;
  const x = (start.left + start.right) / 2 + delta;
  const index = bounds.indexOf(start);
  if (delta > 0) {
    let target = from;
    for (const b of bounds.slice(index + 1)) { if (x >= (b.left + b.right) / 2) target = b.key; else break; }
    return target;
  }
  let target = from;
  for (const b of bounds.slice(0, index).reverse()) { if (x <= (b.left + b.right) / 2) target = b.key; else break; }
  return target;
}
