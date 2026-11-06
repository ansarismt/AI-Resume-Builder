import { useEffect, useRef } from "react";
import {
  drawArrow,
  fitCanvas,
  prefersReducedMotion,
  readColors,
} from "@/components/brand/arrowCanvas";

type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number };

/**
 * Sign-in / sign-up hero: one brand arrow that flies after the pointer with a
 * comet trail, banking into turns. Clicking makes it dash and burst. Without a
 * pointer it cruises a figure-eight. Decorative only.
 */
export function ArrowChase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let colors = readColors(host);
    const arrow = { x: 0, y: 0, vx: 2, vy: 0, angle: 0, bank: 0 };
    const target = { x: 0, y: 0, active: false };
    const particles: Particle[] = [];
    let dash = 0;
    let raf = 0;
    let frame = 0;

    const draw = (time: number) => {
      raf = 0;
      frame++;
      if (frame % 60 === 0) colors = readColors(host);
      const t = time / 1000;

      // Idle path: a lazy figure-eight across the panel.
      const goalX = target.active ? target.x : width * (0.5 + Math.sin(t * 0.45) * 0.32);
      const goalY = target.active ? target.y : height * (0.42 + Math.sin(t * 0.9) * 0.18);

      const steer = dash > 0 ? 0.03 : 0.012;
      arrow.vx += (goalX - arrow.x) * steer;
      arrow.vy += (goalY - arrow.y) * steer;
      const damping = dash > 0 ? 0.93 : 0.88;
      arrow.vx *= damping;
      arrow.vy *= damping;
      arrow.x += arrow.vx;
      arrow.y += arrow.vy;
      dash = Math.max(0, dash - 1);

      const speed = Math.hypot(arrow.vx, arrow.vy);
      if (speed > 0.3) {
        const heading = Math.atan2(arrow.vy, arrow.vx);
        let delta = heading - arrow.angle;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        arrow.angle += delta * 0.18;
        arrow.bank += (delta - arrow.bank) * 0.2;
      }

      // Comet trail from the tail.
      const tailX = arrow.x - Math.cos(arrow.angle) * 34;
      const tailY = arrow.y - Math.sin(arrow.angle) * 34;
      const emit = Math.min(4, 1 + Math.floor(speed / 4));
      for (let i = 0; i < emit; i++) {
        particles.push({
          x: tailX + (Math.random() - 0.5) * 8,
          y: tailY + (Math.random() - 0.5) * 8,
          vx: -arrow.vx * 0.15 + (Math.random() - 0.5) * 0.6,
          vy: -arrow.vy * 0.15 + (Math.random() - 0.5) * 0.6,
          life: 1,
          size: 1.5 + Math.random() * 2.5,
        });
      }

      ctx.clearRect(0, 0, width, height);

      // Soft glow following the arrow.
      const glow = ctx.createRadialGradient(arrow.x, arrow.y, 0, arrow.x, arrow.y, 160);
      glow.addColorStop(0, colors.dark ? "rgba(64,120,255,0.28)" : "rgba(0,64,193,0.14)");
      glow.addColorStop(1, "rgba(0,64,193,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = colors.brand;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.022;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life * (colors.dark ? 0.8 : 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // The arrow: the shard trails further behind the wedge when moving fast.
      const length = 74 + Math.min(18, speed * 1.2);
      ctx.save();
      ctx.shadowColor = colors.dark ? "rgba(80,140,255,0.7)" : "rgba(0,64,193,0.35)";
      ctx.shadowBlur = 18;
      drawArrow(
        ctx,
        arrow.x,
        arrow.y,
        length,
        arrow.angle + arrow.bank * 0.4,
        Math.min(0.18, speed * 0.012),
      );
      ctx.restore();

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const stopResize = fitCanvas(canvas, (w, h) => {
      width = w;
      height = h;
      if (!arrow.x) {
        arrow.x = w * 0.3;
        arrow.y = h * 0.4;
      }
      start();
    });

    const local = (event: PointerEvent | MouseEvent) => {
      const box = host.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const move = (event: PointerEvent) => {
      const p = local(event);
      target.x = p.x;
      target.y = p.y;
      target.active = true;
      start();
    };
    const leave = () => {
      target.active = false;
    };
    const click = (event: MouseEvent) => {
      const p = local(event);
      target.x = p.x;
      target.y = p.y;
      dash = 30;
      const ang = Math.atan2(p.y - arrow.y, p.x - arrow.x);
      arrow.vx += Math.cos(ang) * 18;
      arrow.vy += Math.sin(ang) * 18;
      for (let i = 0; i < 28; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 4;
        particles.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          size: 2 + Math.random() * 2,
        });
      }
      start();
    };

    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("click", click);
    return () => {
      stopResize();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("click", click);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 block"
    />
  );
}
