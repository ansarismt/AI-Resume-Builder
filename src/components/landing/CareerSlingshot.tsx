import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Briefcase, Rocket, Shuffle, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/components/brand/arrowCanvas";

const GOALS = [
  {
    id: "internship",
    icon: GraduationCap,
    title: "Internship",
    type: "College resume",
    template: "Clean single-column layout",
    tips: [
      "Lead with education and projects",
      "Add coursework that matches the role",
      "Keep it to one page",
    ],
  },
  {
    id: "first-job",
    icon: Briefcase,
    title: "First job",
    type: "College or professional resume",
    template: "Modern layout with a skills band",
    tips: [
      "Open with a two-line summary",
      "Turn internships into results",
      "Match keywords from the job post",
    ],
  },
  {
    id: "promotion",
    icon: Rocket,
    title: "Next promotion",
    type: "Professional resume",
    template: "Executive serif layout",
    tips: [
      "Show scope: team size, budget, users",
      "Put recent roles first",
      "Cut duties, keep outcomes",
    ],
  },
  {
    id: "switch",
    icon: Shuffle,
    title: "Career switch",
    type: "Professional resume",
    template: "Sidebar layout with transferable skills",
    tips: [
      "Lead with transferable skills",
      "Use the job-match tool to find gaps",
      "Explain the move in your summary",
    ],
  },
] as const;

type Goal = (typeof GOALS)[number];

const STAGE_H = 420;
const ANCHOR = { x: 0.16, y: 0.5 }; // fractions of the stage
const TARGET_X = 0.82;
const targetY = (i: number) => 0.14 + i * (0.72 / (GOALS.length - 1));
const MAX_PULL = 130;

/**
 * "Aim your career": drag the arrow back like a slingshot, release, and it flies
 * to the goal you aimed at. Each goal opens a short, practical plan. The goal
 * buttons also fire the arrow directly, so it works without dragging.
 */
export function CareerSlingshot() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: STAGE_H });
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null);
  const [flight, setFlight] = useState<{ x: number; y: number; angle: number } | null>(null);
  const [hit, setHit] = useState<Goal | null>(null);
  const rafRef = useRef(0);
  // Narrow stages pull the goals inward so their labels fit.
  const narrow = size.w < 560;
  const tx = narrow ? 0.7 : TARGET_X;
  const ax = narrow ? 0.2 : ANCHOR.x;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const anchor = { x: ax * size.w, y: ANCHOR.y * size.h };

  // Which goal the current aim points at: extend the shot to the target column.
  const aimedIndex = (() => {
    if (!pull) return -1;
    const dx = -pull.x;
    const dy = -pull.y;
    if (Math.hypot(dx, dy) < 25 || dx <= 4) return -1;
    const yAtTarget = anchor.y + (dy / dx) * (tx * size.w - anchor.x);
    let best = 0;
    GOALS.forEach((_, i) => {
      if (Math.abs(targetY(i) * size.h - yAtTarget) < Math.abs(targetY(best) * size.h - yAtTarget))
        best = i;
    });
    return best;
  })();

  const fire = useCallback(
    (index: number) => {
      const goal = GOALS[index];
      const from = { x: ax * size.w, y: ANCHOR.y * size.h };
      const to = { x: tx * size.w - 70, y: targetY(index) * size.h };
      setHit(null);
      setPull(null);
      if (prefersReducedMotion()) {
        setFlight(null);
        setHit(goal);
        return;
      }
      const start = performance.now();
      const duration = 650;
      const arc = -30; // slight upward arc
      cancelAnimationFrame(rafRef.current);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const e = 1 - Math.pow(1 - t, 3);
        const x = from.x + (to.x - from.x) * e;
        const y = from.y + (to.y - from.y) * e + arc * 4 * e * (1 - e);
        const dydx = to.y - from.y + arc * 4 * (1 - 2 * e);
        const angle = Math.atan2(dydx, to.x - from.x);
        setFlight({ x, y, angle });
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else {
          setHit(goal);
          window.setTimeout(() => setFlight(null), 900);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [size.w, size.h, tx, ax],
  );

  const local = (e: React.PointerEvent) => {
    const box = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - box.left - anchor.x, y: e.clientY - box.top - anchor.y };
  };
  const clampPull = (p: { x: number; y: number }) => {
    const len = Math.hypot(p.x, p.y);
    return len > MAX_PULL ? { x: (p.x / len) * MAX_PULL, y: (p.y / len) * MAX_PULL } : p;
  };

  const restingAngle =
    pull && Math.hypot(pull.x, pull.y) > 4 ? Math.atan2(-pull.y, -pull.x) : -0.12;
  const arrowPos = flight ?? {
    x: anchor.x + (pull?.x ?? 0),
    y: anchor.y + (pull?.y ?? 0),
    angle: restingAngle,
  };
  const power = pull ? Math.min(1, Math.hypot(pull.x, pull.y) / MAX_PULL) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div
        ref={stageRef}
        className="slingshot-stage relative touch-none select-none overflow-hidden rounded-3xl border border-border"
        style={{ height: STAGE_H }}
      >
        {/* Trajectory preview */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {pull && aimedIndex >= 0 && (
            <line
              x1={anchor.x}
              y1={anchor.y}
              x2={tx * size.w}
              y2={targetY(aimedIndex) * size.h}
              stroke="var(--brand)"
              strokeWidth={2}
              strokeDasharray="2 10"
              strokeLinecap="round"
              className="slingshot-dash"
            />
          )}
          {pull && (
            <>
              <line
                x1={anchor.x - 14}
                y1={anchor.y - 40}
                x2={arrowPos.x}
                y2={arrowPos.y}
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                opacity={0.5}
              />
              <line
                x1={anchor.x - 14}
                y1={anchor.y + 40}
                x2={arrowPos.x}
                y2={arrowPos.y}
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                opacity={0.5}
              />
            </>
          )}
          {/* Slingshot fork */}
          <circle
            cx={anchor.x - 14}
            cy={anchor.y - 40}
            r={5}
            fill="var(--muted-foreground)"
            opacity={0.5}
          />
          <circle
            cx={anchor.x - 14}
            cy={anchor.y + 40}
            r={5}
            fill="var(--muted-foreground)"
            opacity={0.5}
          />
        </svg>

        {/* Goals */}
        {GOALS.map((goal, i) => {
          const Icon = goal.icon;
          const active = aimedIndex === i || hit?.id === goal.id;
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => fire(i)}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border bg-card px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm shadow-sm transition-all duration-300",
                active
                  ? "scale-110 border-brand text-brand shadow-lift"
                  : "border-border hover:border-brand",
                hit?.id === goal.id && "slingshot-hit",
              )}
              style={{ left: `${tx * 100}%`, top: `${targetY(i) * 100}%` }}
            >
              <Icon className="h-4 w-4" />
              {goal.title}
            </button>
          );
        })}

        {/* The arrow (drag handle) */}
        <div
          role="presentation"
          onPointerDown={(e) => {
            if (flight) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setHit(null);
            setPull(clampPull(local(e)));
          }}
          onPointerMove={(e) => {
            if (pull) setPull(clampPull(local(e)));
          }}
          onPointerUp={() => {
            if (aimedIndex >= 0) fire(aimedIndex);
            else setPull(null);
          }}
          onPointerCancel={() => setPull(null)}
          className={cn(
            "absolute z-10 flex h-16 w-24 cursor-grab items-center justify-center active:cursor-grabbing",
            !pull && !flight && "slingshot-idle",
          )}
          style={{
            left: arrowPos.x,
            top: arrowPos.y,
            transform: `translate(-50%, -50%) rotate(${arrowPos.angle}rad) scale(${1 + power * 0.15})`,
            transition:
              pull || flight
                ? "none"
                : "left 0.4s cubic-bezier(0.34,1.56,0.64,1), top 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <svg
            viewBox="40 110 320 180"
            className="h-12 w-auto text-brand drop-shadow-[0_8px_16px_color-mix(in_oklab,var(--brand)_45%,transparent)]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M57 127 344 207 316 212 118 210 115 209Z" />
            <path d="M148 256 162 274 344 207 316 212Z" />
          </svg>
        </div>

        {!pull && !flight && !hit && (
          <p className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Hand className="h-3.5 w-3.5" /> Drag the arrow back, aim at a goal and let go
          </p>
        )}
        {pull && (
          <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-brand backdrop-blur">
            {aimedIndex >= 0
              ? `Aiming at ${GOALS[aimedIndex].title}. Release to launch`
              : "Pull further back"}
          </p>
        )}
      </div>

      <div className="toon flex flex-col p-6" aria-live="polite">
        {hit ? (
          <div key={hit.id} className="stage-in flex flex-1 flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Your plan
            </p>
            <h3 className="mt-2 text-2xl font-bold">{hit.title}</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Resume type</dt>
                <dd className="font-semibold">{hit.type}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Try this template style</dt>
                <dd className="font-semibold">{hit.template}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2 text-sm">
              {hit.tips.map((tip, i) => (
                <li
                  key={tip}
                  className="stage-in flex gap-2"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {tip}
                </li>
              ))}
            </ul>
            <Button asChild className="group mt-auto w-full">
              <Link to="/signup">
                Start my {hit.title.toLowerCase()} resume
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Aim your career
            </p>
            <p className="mt-3 text-lg font-semibold">Where do you want to go next?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Launch the arrow at a goal, or tap one, to get a quick plan for that resume.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
