import { Check, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Tilt } from "./effects";

const BEFORE = 62;
const AFTER = 91;
const TIPS = [
  "Add the keywords SQL and Tableau",
  "Show results with numbers",
  "Keep it to one page",
];

function useAnimatedNumber(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    const from = current.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      current.current = next;
      setValue(Math.round(next));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
  }, []);
  return reduced;
}

/**
 * Phases of the looping sample: -1 reset, 0 first score, 1 pointer moves to the
 * button, 2 clicked (score improves), 3 hold.
 */
export function HeroDemo() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduced) {
      setPhase(3);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const at = (ms: number, next: number) =>
      timers.push(window.setTimeout(() => !cancelled && setPhase(next), ms));
    const run = () => {
      setPhase(0);
      at(3200, 1);
      at(4400, 2);
      at(4700, 3);
      at(9200, -1);
      timers.push(window.setTimeout(() => !cancelled && run(), 9700));
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [reduced]);

  const improved = phase >= 2;
  const score = useAnimatedNumber(phase === -1 ? 0 : improved ? AFTER : BEFORE);

  return (
    <div
      className="fade-up mx-auto w-full max-w-2xl lg:origin-center lg:scale-105"
      style={{ animationDelay: "200ms" }}
    >
      <Tilt>
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-secondary p-4 sm:p-6"
          aria-hidden="true"
        >
          {/* the resume */}
          <div className="w-[62%] rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-primary" />
              Jordan_Example_Resume
            </div>
            <p className="mt-3 text-sm font-bold text-primary">Jordan Example</p>
            <p className="text-[0.65rem] text-slate-500">Data Analyst</p>
            <div className="mt-3 space-y-1.5">
              {[100, 86, 94, 70].map((width, index) => (
                <div
                  key={index}
                  className="h-1.5 rounded-full bg-slate-200"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
            <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-primary">
              Experience
            </p>
            <div className="mt-2 space-y-1.5">
              {[92, 78, 88, 60, 82].map((width, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-700",
                    improved && index < 2 ? "bg-primary/40" : "bg-slate-200",
                  )}
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </div>

          {/* the score card */}
          <div className="absolute right-3 top-6 w-[58%] rounded-xl border border-border bg-card p-4 shadow-lift sm:right-5 sm:top-8">
            <p className="text-sm font-bold">Resume check</p>
            <p className="text-[0.65rem] text-muted-foreground">Target role: Data Analyst</p>
            <div className="mt-3 rounded-lg border border-border p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold">Job match score</span>
                <span className="text-sm font-bold tabular-nums">
                  {score}
                  <span className="text-[0.65rem] font-normal text-muted-foreground"> /100</span>
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
              <ul className="mt-3 space-y-1.5">
                {TIPS.map((tip, index) => (
                  <li
                    key={tip}
                    className={cn(
                      "flex items-center gap-2 text-[0.68rem] transition-opacity duration-500",
                      phase === -1 ? "opacity-0" : "opacity-100",
                    )}
                    style={{ transitionDelay: phase === -1 ? "0ms" : `${index * 120}ms` }}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                        improved
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-slate-300",
                      )}
                      style={{ transitionDelay: improved ? `${index * 160}ms` : "0ms" }}
                    >
                      {improved && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className={cn(improved && "text-muted-foreground line-through")}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={cn(
                "relative mt-3 rounded-lg px-3 py-2 text-center text-xs font-semibold transition-all duration-300",
                improved ? "bg-secondary text-primary" : "bg-primary text-primary-foreground",
                phase === 2 && "scale-95",
              )}
            >
              {improved ? "Improvements applied" : "Improve my resume"}
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "pointer-events-none absolute right-6 top-3 h-6 w-6 drop-shadow transition-transform duration-1000 ease-out",
                  phase >= 1 ? "translate-x-0 translate-y-0" : "translate-x-16 translate-y-10",
                  phase === 2 && "scale-75",
                )}
              >
                <path
                  d="M5 3l14 8-6 1.8L10.5 19 5 3z"
                  fill="#0b0f1a"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="h-32 sm:h-10" />
        </div>
      </Tilt>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sample analysis. Your own scores come from AI Studio.
      </p>
    </div>
  );
}
