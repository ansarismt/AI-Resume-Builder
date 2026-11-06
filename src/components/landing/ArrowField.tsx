import { useEffect, useRef } from "react";
import {
  drawArrow,
  fitCanvas,
  prefersReducedMotion,
  readColors,
} from "@/components/brand/arrowCanvas";

type Ripple = { x: number; y: number; start: number };

/**
 * Landing hero background: a field of brand arrows. Every arrow turns to face
 * the pointer and swells as it gets closer; clicking sends a shockwave that
 * pushes them outward. With no pointer, the field ripples like a slow current
 * flowing forward. Decorative only.
 */
export function ArrowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // The canvas wrapper ignores the pointer; listen on the hero section itself.
    const host = canvas?.parentElement?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let colors = readColors(host);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, presence: 0 };
    const ripples: Ripple[] = [];
    let raf = 0;
    let visible = true;
    let frame = 0;

    const SPACING = 46;

    const draw = (time: number) => {
      raf = 0;
      frame++;
      if (frame % 60 === 0) colors = readColors(host);
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      pointer.presence += ((pointer.active ? 1 : 0) - pointer.presence) * 0.06;

      const t = time / 1000;
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;
      ctx.fillStyle = colors.brand;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = offsetX + c * SPACING;
          let y = offsetY + r * SPACING;
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const dist = Math.hypot(dx, dy);

          // Idle current: arrows point forward and sway in a travelling wave.
          const idleAngle = Math.sin(t * 0.9 + c * 0.35 + r * 0.22) * 0.45;
          const lookAngle = Math.atan2(dy, dx);
          const near = Math.exp(-dist / 190) * pointer.presence;
          // Blend angles along the shortest arc.
          let delta = lookAngle - idleAngle;
          delta = Math.atan2(Math.sin(delta), Math.cos(delta));
          const angle = idleAngle + delta * Math.min(1, pointer.presence * (0.35 + near * 0.9));

          // Shockwaves push arrows outward as a ring expands.
          let push = 0;
          for (const ripple of ripples) {
            const age = (time - ripple.start) / 1000;
            const radius = age * 620;
            const rd = Math.hypot(x - ripple.x, y - ripple.y);
            const band = Math.exp(-((rd - radius) ** 2) / 2200) * Math.max(0, 1 - age / 1.3);
            if (band > 0.01) {
              const ang = Math.atan2(y - ripple.y, x - ripple.x);
              x += Math.cos(ang) * band * 22;
              y += Math.sin(ang) * band * 22;
              push = Math.max(push, band);
            }
          }

          const size = 9 + near * 22 + push * 10;
          ctx.globalAlpha = Math.min(1, (colors.dark ? 0.22 : 0.15) + near * 0.75 + push * 0.5);
          drawArrow(ctx, x, y, size, angle, near * 0.12);
        }
      }
      ctx.globalAlpha = 1;

      for (let i = ripples.length - 1; i >= 0; i--) {
        if (time - ripples[i].start > 1400) ripples.splice(i, 1);
      }
      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const stopResize = fitCanvas(canvas, (w, h) => {
      width = w;
      height = h;
      if (!pointer.active) {
        pointer.x = pointer.tx = w * 0.7;
        pointer.y = pointer.ty = h * 0.4;
      }
      start();
    });

    const move = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      pointer.tx = event.clientX - box.left;
      pointer.ty = event.clientY - box.top;
      pointer.active = true;
      start();
    };
    const leave = () => {
      pointer.active = false;
    };
    const click = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a,button,input")) return;
      const box = host.getBoundingClientRect();
      ripples.push({
        x: event.clientX - box.left,
        y: event.clientY - box.top,
        start: performance.now(),
      });
      start();
    };
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
          })
        : null;
    io?.observe(host);

    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("click", click);
    return () => {
      stopResize();
      io?.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("click", click);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="hero-field pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block" />
      {/* Fade the field under the headline so text stays easy to read. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_45%,var(--background)_0%,color-mix(in_oklab,var(--background)_70%,transparent)_35%,transparent_70%)]" />
    </div>
  );
}
