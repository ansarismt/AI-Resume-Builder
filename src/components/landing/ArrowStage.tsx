import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const RAIL_STOPS = [
  { id: "top", label: "Top" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "aim", label: "Aim your career" },
  { id: "model", label: "The model" },
  { id: "ai-tools", label: "AI tools" },
  { id: "faq", label: "FAQ" },
] as const;

/**
 * Fixed vertical rail on wide screens. The brand arrow slides down it as the
 * visitor scrolls, and each stop jumps to its section.
 */
export function ScrollArrowRail() {
  const [progress, setProgress] = useState(0);
  const [stops, setStops] = useState<number[]>(
    RAIL_STOPS.map((_, i) => i / (RAIL_STOPS.length - 1)),
  );

  useEffect(() => {
    let raf = 0;
    const range = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const update = () => {
      raf = 0;
      setProgress(Math.min(1, Math.max(0, window.scrollY / range())));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const measure = () => {
      const r = range();
      setStops(
        RAIL_STOPS.map((s) => {
          if (s.id === "top") return 0;
          const el = document.getElementById(s.id);
          return el ? Math.min(1, Math.max(0, (el.offsetTop - 80) / r)) : 0;
        }),
      );
      update();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const settle = window.setTimeout(measure, 800); // after lazy content has laid out
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const activeIndex = stops.reduce((acc, pos, i) => (progress >= pos - 0.01 ? i : acc), 0);
  const jump = (id: string) => {
    if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        "no-print fixed right-5 top-1/2 z-20 hidden h-64 w-9 -translate-y-1/2 transition-opacity duration-500 xl:block",
        progress > 0.02 ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-brand"
        style={{ height: `${progress * 100}%` }}
      />
      {RAIL_STOPS.map((stop, i) => (
        <button
          key={stop.id}
          type="button"
          onClick={() => jump(stop.id)}
          aria-label={`Go to ${stop.label}`}
          aria-current={i === activeIndex ? "true" : undefined}
          className="group absolute left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ top: `${stops[i] * 100}%` }}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full border-2 transition-all",
              i <= activeIndex ? "border-brand bg-brand" : "border-border bg-background",
              "group-hover:scale-150",
            )}
          />
          <span className="pointer-events-none absolute right-7 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {stop.label}
          </span>
        </button>
      ))}
      {/* The arrow itself, rotated to point down the page. */}
      <svg
        aria-hidden="true"
        viewBox="40 110 320 180"
        className="rail-arrow pointer-events-none absolute left-1/2 h-5 w-auto -translate-x-1/2 text-brand drop-shadow-[0_0_8px_color-mix(in_oklab,var(--brand)_70%,transparent)]"
        style={{ top: `${progress * 100}%` }}
        fill="currentColor"
      >
        <path d="M57 127 344 207 316 212 118 210 115 209Z" />
        <path d="M148 256 162 274 344 207 316 212Z" />
      </svg>
    </nav>
  );
}
