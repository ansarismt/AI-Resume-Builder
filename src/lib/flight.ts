/**
 * Smooth "flight" along a cubic Bézier curve using the Web Animations API.
 * Only `transform` and `opacity` are animated, so the browser can run it on the
 * compositor without layout or paint work on every frame.
 */

export interface Point {
  x: number;
  y: number;
}

export function cubicPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

export function cubicPath(p0: Point, p1: Point, p2: Point, p3: Point): string {
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Animates `element` (absolutely positioned at 0,0 of its container) along the curve. */
export function flyAlong(
  element: HTMLElement,
  curve: [Point, Point, Point, Point],
  options: { duration: number; scaleFrom?: number; scaleTo?: number; easing?: string },
): Animation | null {
  if (typeof element.animate !== "function") return null;
  const steps = 36;
  const { scaleFrom = 1, scaleTo = 1 } = options;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const point = cubicPoint(t, ...curve);
    const ahead = cubicPoint(Math.min(1, t + 0.02), ...curve);
    const behind = cubicPoint(Math.max(0, t - 0.02), ...curve);
    const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
    const scale = scaleFrom + (scaleTo - scaleFrom) * t;
    frames.push({
      transform: `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`,
      offset: t,
    });
  }
  return element.animate(frames, {
    duration: options.duration,
    easing: options.easing ?? "cubic-bezier(.55,.05,.25,1)",
    fill: "forwards",
  });
}
