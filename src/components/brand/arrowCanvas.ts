/** Canvas helpers for drawing the brand arrow (traced from the supplied logo). */

// Logo polygons, translated so the arrow tip sits at (0, 0) and pointing along +x.
const TIP = [344, 207] as const;
const SCALE = 1 / 287; // full arrow length becomes 1 unit
const WEDGE = [
  [57, 127],
  [344, 207],
  [316, 212],
  [118, 210],
  [115, 209],
].map(([x, y]) => [(x - TIP[0]) * SCALE, (y - TIP[1]) * SCALE]);
const SHARD = [
  [148, 256],
  [162, 274],
  [344, 207],
  [316, 212],
].map(([x, y]) => [(x - TIP[0]) * SCALE, (y - TIP[1]) * SCALE]);
// Centre of mass is roughly 55% back from the tip; draw around that point.
const CENTER_X = -0.55;
const CENTER_Y = 0.05;

function polygon(ctx: CanvasRenderingContext2D, pts: number[][]) {
  ctx.moveTo(pts[0][0] - CENTER_X, pts[0][1] - CENTER_Y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] - CENTER_X, pts[i][1] - CENTER_Y);
  ctx.closePath();
}

/** Draw the brand arrow centred at (x, y), `length` px long, rotated by `angle`. */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number,
  shardOffset = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(length, length);
  ctx.beginPath();
  polygon(ctx, WEDGE);
  ctx.fill();
  if (shardOffset) ctx.translate(-shardOffset, 0);
  ctx.beginPath();
  polygon(ctx, SHARD);
  ctx.fill();
  ctx.restore();
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Reads theme colours from CSS so the canvas follows light/dark mode. */
export function readColors(el: Element) {
  const style = getComputedStyle(el);
  return {
    brand: style.getPropertyValue("--brand").trim() || "#0040c1",
    dark: document.documentElement.classList.contains("dark"),
  };
}

/**
 * Sizes a canvas to its parent with device-pixel-ratio scaling and keeps it
 * sized. Returns a cleanup function.
 */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  onResize: (width: number, height: number) => void,
) {
  const parent = canvas.parentElement;
  if (!parent) return () => {};
  const apply = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = parent.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize(width, height);
  };
  apply();
  if (typeof ResizeObserver === "undefined") return () => {};
  const ro = new ResizeObserver(apply);
  ro.observe(parent);
  return () => ro.disconnect();
}
