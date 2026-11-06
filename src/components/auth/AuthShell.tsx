import { CheckCircle2, MousePointerClick, Send } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cubicPath, flyAlong, prefersReducedMotion, type Point } from "@/lib/flight";

/**
 * "Launch control": a resume writes itself, folds into the paper-plane logo and flies to a
 * hiring team on a radar. Click the radar to choose the next destination.
 *
 * Performance: everything that moves uses transform/opacity only, typing re-renders just the
 * card, and flights run on the Web Animations API.
 */

const PERSONAS = [
  {
    name: "Aisha Rahman",
    role: "Data Analyst",
    skills: ["SQL", "Tableau", "Python"],
    line: "Cut reporting time by 40% for 3 teams",
    score: 94,
  },
  {
    name: "Leo Martins",
    role: "Product Designer",
    skills: ["Figma", "Research", "UI"],
    line: "Redesigned checkout, +18% conversion",
    score: 91,
  },
  {
    name: "Priya Nair",
    role: "Software Engineer",
    skills: ["React", "Django", "AWS"],
    line: "Shipped an API serving 2M requests/day",
    score: 96,
  },
  {
    name: "Tomás Reyes",
    role: "Marketing Lead",
    skills: ["SEO", "Content", "Ads"],
    line: "Grew organic traffic 3x in one year",
    score: 92,
  },
  {
    name: "Mei Chen",
    role: "Nurse Practitioner",
    skills: ["Triage", "EHR", "Care"],
    line: "Led a 12-bed ward through peak season",
    score: 93,
  },
];

const DESTINATIONS = [
  { company: "Northwind", x: 0.8, y: 0.2 },
  { company: "Contoso", x: 0.72, y: 0.72 },
  { company: "Fabrikam", x: 0.86, y: 0.46 },
  { company: "Litware", x: 0.55, y: 0.14 },
  { company: "Tailspin", x: 0.62, y: 0.86 },
];

const START = { x: 0.3, y: 0.58 };
type Phase = "writing" | "folding" | "flying" | "landed";

const TypingCard = memo(function TypingCard({
  personaIndex,
  folded,
  skip,
  onDone,
}: {
  personaIndex: number;
  folded: boolean;
  skip: boolean;
  onDone: () => void;
}) {
  const p = PERSONAS[personaIndex];
  const script = `${p.name}|${p.role}|${p.line}`;
  const [typed, setTyped] = useState(0);
  const done = typed >= script.length;

  useEffect(() => setTyped(0), [personaIndex]);
  useEffect(() => {
    if (skip) setTyped(script.length);
  }, [skip, script.length]);

  useEffect(() => {
    if (folded) return;
    if (done) {
      const timer = window.setTimeout(onDone, 900);
      return () => window.clearTimeout(timer);
    }
    // Slight randomness makes the typing feel human rather than mechanical.
    const timer = window.setTimeout(() => setTyped((v) => v + 1), 28 + Math.random() * 40);
    return () => window.clearTimeout(timer);
  }, [typed, done, folded, onDone]);

  const [name = "", role = "", line = ""] = script.slice(0, typed).split("|");
  const progress = Math.min(typed, script.length) / script.length;
  const caretAt = typed <= p.name.length ? 0 : typed <= p.name.length + 1 + p.role.length ? 1 : 2;
  const caret = !done && <span className="launch-caret" />;

  return (
    <div
      className="launch-card w-[min(260px,40vw)] rounded-xl bg-white p-4 text-slate-900 shadow-2xl"
      data-folded={folded}
    >
      <p className="min-h-[1.5rem] text-lg font-bold text-[#0047cc]">
        {name}
        {caretAt === 0 && caret}
      </p>
      <p className="min-h-[1rem] text-xs text-slate-500">
        {role}
        {caretAt === 1 && caret}
      </p>
      <div className="mt-3 h-px bg-slate-200" />
      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#0047cc]">
        Experience
      </p>
      <p className="mt-1 min-h-[2rem] text-xs leading-4">
        {line}
        {caretAt === 2 && caret}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.skills.map((skill, index) => (
          <span
            key={skill}
            className="launch-chip rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0047cc]"
            data-show={done}
            style={{ transitionDelay: `${index * 110}ms` }}
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-500">
        <span>Resume health</span>
        <span className="tabular-nums text-emerald-600">{Math.round(progress * p.score)}/100</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full w-full origin-left rounded-full bg-emerald-500 transition-transform duration-150"
          style={{ transform: `scaleX(${(progress * p.score) / 100})` }}
        />
      </div>
    </div>
  );
});

function LaunchHero({ title, text }: { title: string; text: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const flightRef = useRef<Animation | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [persona, setPersona] = useState(0);
  const [phase, setPhase] = useState<Phase>("writing");
  const [dest, setDest] = useState({ ...DESTINATIONS[0] });
  const [curveSeed, setCurveSeed] = useState(0.5);
  const [skip, setSkip] = useState(false);
  const [delivered, setDelivered] = useState(0);
  const [hint, setHint] = useState(true);

  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const update = () => setSize({ w: node.clientWidth, h: node.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => flightRef.current?.cancel(), []);

  const start = { x: START.x * size.w, y: START.y * size.h };
  const end = { x: dest.x * size.w, y: dest.y * size.h };
  // The bend of each flight varies, so no two launches look the same.
  const lift = (0.25 + curveSeed * 0.45) * size.h;
  const curve: [Point, Point, Point, Point] = [
    start,
    { x: start.x + (end.x - start.x) * 0.15, y: start.y - lift },
    {
      x: start.x + (end.x - start.x) * (0.55 + curveSeed * 0.3),
      y: end.y + (curveSeed - 0.5) * lift,
    },
    end,
  ];

  const onTyped = useCallback(() => setPhase("folding"), []);

  useEffect(() => {
    if (phase === "folding") {
      const timer = window.setTimeout(() => setPhase("flying"), 450);
      return () => window.clearTimeout(timer);
    }
    if (phase === "flying") {
      const plane = planeRef.current;
      const trail = trailRef.current;
      const duration = prefersReducedMotion() ? 1 : 1500 + curveSeed * 500;
      if (trail && typeof trail.animate === "function") {
        const length = trail.getTotalLength();
        trail.style.strokeDasharray = `${length}`;
        trail.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
          duration,
          easing: "cubic-bezier(.55,.05,.25,1)",
          fill: "forwards",
        });
      }
      flightRef.current?.cancel();
      const flight = plane
        ? flyAlong(plane, curve, { duration, scaleFrom: 0.6, scaleTo: 1 })
        : null;
      flightRef.current = flight;
      const land = () => {
        setPhase("landed");
        setDelivered((v) => v + 1);
      };
      if (flight) flight.onfinish = land;
      else land();
      return () => {
        if (flight) flight.onfinish = null;
      };
    }
    if (phase === "landed") {
      const timer = window.setTimeout(() => {
        flightRef.current?.cancel();
        setPersona((v) => (v + 1) % PERSONAS.length);
        setSkip(false);
        setCurveSeed(Math.random());
        setDest((current) => {
          const options = DESTINATIONS.filter((d) => d.company !== current.company);
          return { ...options[Math.floor(Math.random() * options.length)] };
        });
        setPhase("writing");
      }, 1900);
      return () => window.clearTimeout(timer);
    }
    // The curve only depends on size/dest/curveSeed, which do not change mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const chooseTarget = (event: React.MouseEvent) => {
    if (phase === "flying" || !size.w) return;
    const box = event.currentTarget.getBoundingClientRect();
    setHint(false);
    setDest((current) => ({
      company: current.company,
      x: Math.min(0.92, Math.max(0.08, (event.clientX - box.left) / box.width)),
      y: Math.min(0.9, Math.max(0.1, (event.clientY - box.top) / box.height)),
    }));
    if (phase === "writing") setSkip(true);
  };

  const at = (p: Point) => `translate3d(${p.x}px, ${p.y}px, 0)`;
  const flying = phase === "flying" || phase === "landed";

  return (
    <div className="auth-hero relative hidden overflow-hidden lg:flex lg:flex-col">
      <div className="relative z-10 p-10 pb-0">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--auth-accent)]">
          Launch control
        </p>
        <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight tracking-tight">{title}</h1>
        <p className="mt-3 max-w-md text-[var(--auth-muted)]">{text}</p>
      </div>

      <div
        ref={panelRef}
        onClick={chooseTarget}
        role="presentation"
        className="relative min-h-[420px] flex-1 cursor-crosshair select-none [contain:layout_paint]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--auth-grid) 1px, transparent 1px), linear-gradient(90deg, var(--auth-grid) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {size.w > 0 && (
          <>
            {/* radar, centred on the destination, moved with transform only */}
            <div
              aria-hidden="true"
              className="launch-move pointer-events-none absolute left-0 top-0"
              style={{ transform: at(end) }}
            >
              {[1, 2, 3, 4].map((ring) => (
                <div
                  key={ring}
                  className="absolute left-0 top-0 rounded-full border border-[var(--auth-ring)]"
                  style={{
                    width: ring * size.w * 0.22,
                    height: ring * size.w * 0.22,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
              <div
                className="launch-sweep absolute rounded-full"
                style={{
                  width: size.w * 0.9,
                  height: size.w * 0.9,
                  left: -size.w * 0.45,
                  top: -size.w * 0.45,
                  background:
                    "conic-gradient(from 0deg, var(--auth-sweep), transparent 18%, transparent)",
                }}
              />
            </div>

            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
              <defs>
                <linearGradient
                  id="launch-trail"
                  gradientUnits="userSpaceOnUse"
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                >
                  <stop offset="0" style={{ stopColor: "var(--auth-accent)", stopOpacity: 0 }} />
                  <stop offset="1" style={{ stopColor: "var(--auth-accent)", stopOpacity: 0.9 }} />
                </linearGradient>
              </defs>
              <path
                d={cubicPath(...curve)}
                fill="none"
                style={{ stroke: "var(--auth-ring)" }}
                strokeWidth="1.5"
                strokeDasharray="3 6"
              />
              <path
                key={`${persona}-${dest.x}-${dest.y}`}
                ref={trailRef}
                d={cubicPath(...curve)}
                fill="none"
                stroke="url(#launch-trail)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ opacity: flying ? 1 : 0, transition: "opacity .6s" }}
              />
            </svg>

            <div
              className="launch-move pointer-events-none absolute left-0 top-0"
              style={{ transform: at(end) }}
            >
              <span className="relative -ml-2 -mt-2 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--auth-accent)] opacity-50" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-[var(--auth-bg-solid)] bg-[var(--auth-accent)]" />
              </span>
              <span
                className={`absolute top-0 -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--auth-chip)] px-2 py-0.5 text-[11px] font-semibold ${dest.x > 0.6 ? "right-5" : "left-5"}`}
              >
                {dest.company} hiring team
              </span>
              {phase === "landed" && (
                <div className="launch-pop absolute left-0 top-0 flex -translate-x-1/2 -translate-y-[calc(100%+18px)] items-center gap-2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Delivered. Interview requested
                </div>
              )}
            </div>

            <div
              className="pointer-events-none absolute left-0 top-0"
              style={{ transform: at(start) }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <TypingCard
                  personaIndex={persona}
                  folded={phase !== "writing"}
                  skip={skip}
                  onDone={onTyped}
                />
              </div>
            </div>

            <div
              ref={planeRef}
              className="launch-plane pointer-events-none absolute left-0 top-0 w-20"
              data-show={flying}
              style={{ transform: `${at(start)} translate(-50%, -50%) scale(0.6)` }}
            >
              <img src="/logo.png" alt="" decoding="async" className="w-full dark:hidden" />
              <img
                src="/logo-dark.png"
                alt=""
                decoding="async"
                className="hidden w-full dark:block"
              />
            </div>
          </>
        )}

        {hint && (
          <p className="pointer-events-none absolute bottom-6 left-10 flex items-center gap-2 text-xs text-[var(--auth-muted)]">
            <MousePointerClick className="h-4 w-4" />
            Click anywhere to choose where the next resume lands
          </p>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[var(--auth-ring)] px-10 py-4 text-xs text-[var(--auth-muted)]">
        <span className="flex items-center gap-2">
          <Send className="h-3.5 w-3.5 text-[var(--auth-accent)]" />
          Resumes launched this visit:{" "}
          <strong className="text-base tabular-nums text-[var(--auth-ink)]">{delivered}</strong>
        </span>
        <span>Sample resumes for illustration</span>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-65px)] lg:grid-cols-2">
      <LaunchHero title={title} text={text} />
      <div className="hero-glow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="" className="h-10 w-14 object-contain dark:hidden" />
            <img
              src="/logo-dark.png"
              alt=""
              className="hidden h-10 w-14 object-contain dark:block"
            />
            <span className="font-display text-xl font-bold">AI Resume Builder</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
