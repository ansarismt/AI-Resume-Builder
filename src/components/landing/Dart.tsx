import { useEffect, useId, useRef, type RefObject } from "react";

import { prefersReducedMotion } from "@/lib/flight";

/**
 * The dart from the logo, as a theme-aware vector. Colours come from --dart-a / --dart-b, so
 * it switches with the light and dark themes without re-rendering.
 */
export function LogoDart({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`dart-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--dart-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--dart-b)" }} />
        </linearGradient>
      </defs>
      <path d="M4 2 L98 30 L22 34 Z" fill={`url(#dart-${id})`} />
      <path d="M30 50 L98 30 L36 62 Z" fill={`url(#dart-${id})`} />
    </svg>
  );
}

const GHOSTS = 6;

/** Shared spring + comet-trail state, written straight to the DOM (no React re-renders). */
function createMover(el: HTMLElement, ghosts: HTMLElement[]) {
  const s = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    scale: 1,
    history: [] as Array<[number, number, number]>,
  };
  const render = (speedOpacity = true) => {
    el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) rotate(${s.angle}deg) scale(${s.scale})`;
    s.history.unshift([s.x, s.y, s.angle]);
    if (s.history.length > GHOSTS * 3) s.history.pop();
    const speed = Math.hypot(s.vx, s.vy);
    ghosts.forEach((ghost, i) => {
      const point = s.history[(i + 1) * 3] ?? s.history[s.history.length - 1];
      const fade = speedOpacity ? Math.min(1, speed / 14) : 1;
      ghost.style.opacity = String(((GHOSTS - i) / GHOSTS) * 0.35 * fade);
      ghost.style.transform = `translate3d(${point[0]}px, ${point[1]}px, 0) translate(-50%, -50%) rotate(${point[2]}deg) scale(${s.scale * (1 - i * 0.08)})`;
    });
  };
  const spring = (tx: number, ty: number, stiffness = 0.07, damping = 0.8, dt = 1) => {
    const keep = Math.pow(damping, dt);
    s.vx = (s.vx + (tx - s.x) * stiffness * dt) * keep;
    s.vy = (s.vy + (ty - s.y) * stiffness * dt) * keep;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
  };
  const turn = (target: number, ease = 0.15, dt = 1) => {
    ease = 1 - Math.pow(1 - ease, dt);
    let delta = ((target - s.angle + 540) % 360) - 180;
    if (Math.abs(delta) < 0.01) delta = 0;
    s.angle += delta * ease;
  };
  return { s, render, spring, turn };
}

function Ghosts({ refs, className }: { refs: RefObject<HTMLDivElement[]>; className: string }) {
  return (
    <>
      {Array.from({ length: GHOSTS }, (_, i) => (
        <div
          key={i}
          ref={(node) => {
            if (node && refs.current) refs.current[i] = node;
          }}
          className={`dart-ghost pointer-events-none absolute left-0 top-0 ${className}`}
        >
          <LogoDart className="h-auto w-full" />
        </div>
      ))}
    </>
  );
}

/** Lets the scroll guide pick up exactly where the hero dart was. */
const handoff = { x: -100, y: 200 };

/**
 * The hero dart: flies in on a spring, leans toward the cursor like it is magnetised, glows
 * on hover, and loops the loop when clicked (or Enter/Space), then pulses the call to action.
 */
export function HeroDart({
  containerRef,
  homeRef,
  onLaunch,
}: {
  containerRef: RefObject<HTMLElement | null>;
  homeRef: RefObject<HTMLElement | null>;
  onLaunch: () => void;
}) {
  const dartRef = useRef<HTMLButtonElement>(null);
  const ghostRefs = useRef<HTMLDivElement[]>([]);
  const launchRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    const dart = dartRef.current;
    if (!container || !dart) return;
    const mover = createMover(dart, ghostRefs.current);
    const { s } = mover;
    let home = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0, active: false };
    let loopStart = -1;
    let frame = 0;
    let last = 0;
    let running = false;
    let visible = true;

    const measure = () => {
      const c = container.getBoundingClientRect();
      const h = homeRef.current?.getBoundingClientRect();
      home = h
        ? { x: h.left - c.left + h.width / 2, y: h.top - c.top + h.height / 2 }
        : { x: c.width * 0.75, y: c.height * 0.3 };
    };
    measure();

    if (prefersReducedMotion()) {
      s.x = home.x;
      s.y = home.y;
      s.angle = -8;
      mover.render(false);
      launchRef.current = onLaunch;
      const onResize = () => {
        measure();
        s.x = home.x;
        s.y = home.y;
        mover.render(false);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    // Entrance: start off-screen, low and left, with an upward kick, and let the spring fly it in.
    s.x = -160;
    s.y = home.y + 160;
    s.vx = 34;
    s.vy = -22;
    s.angle = -30;

    const tick = (now: number) => {
      const t = now / 1000;
      const dt = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      if (loopStart >= 0) {
        const p = Math.min(1, (now - loopStart) / 1500);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const a = eased * Math.PI * 2;
        const rx = Math.min(200, container.clientWidth * 0.18);
        const ry = 110;
        const nx = home.x + Math.sin(a) * rx;
        const ny = home.y + ry - Math.cos(a) * ry;
        s.vx = nx - s.x;
        s.vy = ny - s.y;
        s.x = nx;
        s.y = ny;
        mover.turn((Math.atan2(s.vy, s.vx) * 180) / Math.PI, 0.5);
        s.scale = 1 + Math.sin(eased * Math.PI) * 0.15;
        if (p >= 1) {
          loopStart = -1;
          onLaunch();
        }
      } else {
        // Idle: a slow figure-eight drift with a lean into each curve, so it never looks
        // like a loop on repeat (two frequencies that rarely line up).
        const driftX = Math.sin(t * 0.53) * 16 + Math.sin(t * 0.21) * 9;
        const driftY = Math.sin(t * 1.06) * 9 + Math.sin(t * 0.37) * 4;
        let tx = home.x + driftX;
        let ty = home.y + driftY;
        let targetAngle = -8 + Math.cos(t * 0.53) * 6 + Math.cos(t * 1.06) * 2;
        const dx = pointer.x - home.x;
        const dy = pointer.y - home.y;
        const dist = Math.hypot(dx, dy);
        const near = pointer.active && dist < 420;
        if (near) {
          const pull = Math.min(1, 1 - dist / 420) * 0.35;
          tx += Math.max(-80, Math.min(80, dx * pull));
          ty += Math.max(-60, Math.min(60, dy * pull));
          targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        }
        mover.spring(tx, ty, 0.07, 0.8, dt);
        const speed = Math.hypot(s.vx, s.vy);
        mover.turn(
          speed > 3 ? (Math.atan2(s.vy, s.vx) * 180) / Math.PI : targetAngle,
          near ? 0.1 : 0.06,
          dt,
        );
        const hover = pointer.active && Math.hypot(pointer.x - s.x, pointer.y - s.y) < 90;
        dart.dataset.hover = String(hover);
        const breathe = 1 + Math.sin(t * 1.7) * 0.015;
        s.scale += ((hover ? 1.08 : breathe) - s.scale) * 0.15;
      }
      mover.render();
      const c = container.getBoundingClientRect();
      handoff.x = c.left + s.x;
      handoff.y = c.top + s.y;
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !visible) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      const c = container.getBoundingClientRect();
      pointer.x = event.clientX - c.left;
      pointer.y = event.clientY - c.top;
      pointer.active = event.pointerType === "mouse";
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);
    launchRef.current = () => {
      if (loopStart < 0) loopStart = performance.now();
    };
    start();

    return () => {
      stop();
      observer.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, homeRef, onLaunch]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <Ghosts refs={ghostRefs} className="w-28 sm:w-40 lg:w-48" />
      <button
        ref={dartRef}
        type="button"
        onClick={() => launchRef.current()}
        aria-label="Launch the dart"
        title="Click me"
        className="hero-dart pointer-events-auto absolute left-0 top-0 w-28 cursor-pointer rounded-full sm:w-40 lg:w-48"
        style={{ transform: "translate3d(-300px, 0, 0)" }}
      >
        <span className="hero-dart-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <LogoDart className="relative h-auto w-full" />
      </button>
    </div>
  );
}

/**
 * After the hero, a smaller dart guides the reader. Its position is a continuous function of
 * scroll: every section heading is an anchor on one path, and each anchor is "reached" at
 * the scroll offset where its heading crosses the reading line (clamped to the real scroll
 * range, so the final anchor is reached exactly at the bottom of the page). Between anchors
 * the dart swings out into the margin on a smooth curve and points along its path; at an
 * anchor it points at the heading and underlines it. A spring on top keeps fast scrolling
 * smooth. Clicking it scrolls to the next heading.
 */
interface Anchor {
  el: HTMLElement;
  x: number;
  docY: number;
  arrive: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function DartGuide({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const dartRef = useRef<HTMLButtonElement>(null);
  const ghostRefs = useRef<HTMLDivElement[]>([]);
  const nextRef = useRef<() => void>(() => {});

  useEffect(() => {
    const dart = dartRef.current;
    if (!dart || prefersReducedMotion()) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const mover = createMover(dart, ghostRefs.current);
    const { s } = mover;
    const READING_LINE = 0.35;
    let anchors: Anchor[] = [];
    let active: HTMLElement | null = null;
    let shown = false;
    let frame = 0;
    let last = 0;

    // Anchors are measured in document coordinates, so they stay valid while scrolling and
    // only need re-measuring when layout changes.
    const measure = () => {
      const vh = window.innerHeight;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-dart-stop]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          const docY = r.top + window.scrollY + Math.min(r.height, 44) / 2;
          return {
            el,
            x: Math.max(36, r.left - 52),
            docY,
            arrive: Math.min(maxScroll, Math.max(0, docY - vh * READING_LINE)),
          };
        })
        .filter((a) => a.el.offsetParent !== null)
        .sort((a, b) => a.docY - b.docY);
    };
    measure();
    const layoutObserver = new ResizeObserver(measure);
    layoutObserver.observe(document.body);
    window.addEventListener("resize", measure);

    const setActive = (el: HTMLElement | null) => {
      if (active === el) return;
      active?.removeAttribute("data-dart-active");
      active = el;
      active?.setAttribute("data-dart-active", "true");
    };

    /** Target position and heading for the current scroll offset. */
    const target = (scroll: number) => {
      const view = (a: Anchor) => ({ x: a.x, y: a.docY - scroll });
      if (scroll <= anchors[0].arrive) return { ...view(anchors[0]), angle: 0, at: anchors[0] };
      const lastAnchor = anchors[anchors.length - 1];
      if (scroll >= lastAnchor.arrive) return { ...view(lastAnchor), angle: 0, at: lastAnchor };
      let i = 0;
      while (i < anchors.length - 2 && scroll >= anchors[i + 1].arrive) i += 1;
      const a = anchors[i];
      const b = anchors[i + 1];
      const span = Math.max(1, b.arrive - a.arrive);
      const raw = (scroll - a.arrive) / span;
      // Linger near each heading, travel in between.
      const t = easeInOut(raw);
      const pa = view(a);
      const pb = view(b);
      const swing = Math.sin(Math.PI * t) * Math.min(28, Math.max(pa.x, pb.x) - 24);
      const x = pa.x + (pb.x - pa.x) * t - swing;
      const y = pa.y + (pb.y - pa.y) * t;
      // Direction of travel along the curve, blended to "pointing at the heading" at the ends.
      const dt = 0.01;
      const t2 = easeInOut(Math.min(1, raw + dt));
      const swing2 = Math.sin(Math.PI * t2) * Math.min(28, Math.max(pa.x, pb.x) - 24);
      const x2 = pa.x + (pb.x - pa.x) * t2 - swing2;
      const y2 = pa.y + (pb.y - pa.y) * t2;
      const travel = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const weight = Math.sin(Math.PI * Math.min(1, raw * 1.4));
      const angle = travel * weight;
      const at = raw < 0.12 ? a : raw > 0.88 ? b : null;
      return { x, y, angle, at };
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      const vh = window.innerHeight;
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0;
      const shouldShow = desktop.matches && anchors.length > 0 && heroBottom < vh * 0.35;
      if (shouldShow !== shown) {
        shown = shouldShow;
        dart.dataset.show = String(shown);
        if (shown) {
          // Take over from wherever the hero dart was last seen.
          s.x = Math.max(36, Math.min(handoff.x, window.innerWidth - 60));
          s.y = Math.max(vh * 0.15, Math.min(handoff.y, vh * 0.4));
          s.vx = 0;
          s.vy = 4;
          s.history = [];
        } else {
          setActive(null);
        }
      }
      if (shown) {
        const goal = target(window.scrollY);
        const t = now / 1000;
        // A little life while waiting: a gentle bob and a slow nod.
        const resting = goal.at ? 1 : 0;
        mover.spring(goal.x, goal.y + Math.sin(t * 2.1) * 3 * resting, 0.14, 0.72, dt);
        mover.turn(goal.angle + Math.sin(t * 1.3) * 4 * resting, 0.16, dt);
        const settled = Math.hypot(goal.x - s.x, goal.y - s.y) < 10;
        setActive(goal.at && settled ? goal.at.el : null);
        mover.render();
      }
      frame = requestAnimationFrame(tick);
    };

    nextRef.current = () => {
      const lineY = window.scrollY + window.innerHeight * READING_LINE + 8;
      const next = anchors.find((a) => a.docY > lineY);
      next?.el.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      layoutObserver.disconnect();
      window.removeEventListener("resize", measure);
      setActive(null);
    };
  }, [heroRef]);

  return (
    <div className="dart-guide pointer-events-none fixed inset-0 z-30 hidden lg:block">
      <Ghosts refs={ghostRefs} className="w-11" />
      <button
        ref={dartRef}
        type="button"
        data-show="false"
        onClick={() => nextRef.current()}
        aria-label="Go to the next section"
        title="Next section"
        className="dart-guide-dart pointer-events-auto absolute left-0 top-0 w-11 cursor-pointer"
      >
        <LogoDart className="h-auto w-full" />
      </button>
    </div>
  );
}
