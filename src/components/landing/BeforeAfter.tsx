import { useState } from "react";
import { cn } from "@/lib/utils";

/** Illustrative sample: the same resume section before and after guided editing. */
const BEFORE = {
  title: "experience",
  lines: [
    "intern at abc company",
    "did data stuff and made reports",
    "helped team with excel",
    "worked on website sometimes",
  ],
};
const AFTER = {
  title: "Experience",
  role: "Data Analyst Intern · ABC Company",
  lines: [
    "Built weekly sales reports in Excel and SQL used by the regional team.",
    "Cleaned and merged three data sources into one reporting sheet.",
    "Updated product pages on the company website with the marketing team.",
  ],
};

function Sheet({ variant }: { variant: "before" | "after" }) {
  const after = variant === "after";
  return (
    <div
      className={cn(
        "h-full w-full p-6 sm:p-8",
        after
          ? "bg-paper text-ink"
          : "bg-[#f3f1ec] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
      )}
    >
      {after ? (
        <>
          <p className="text-xl font-bold tracking-tight">Priya Sharma</p>
          <p className="text-sm text-brand">Data Analyst · priya@example.com</p>
          <p className="mt-5 border-b border-rule pb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand">
            {AFTER.title}
          </p>
          <p className="mt-3 text-sm font-semibold">{AFTER.role}</p>
          <ul className="mt-2 space-y-1.5 text-sm leading-6">
            {AFTER.lines.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {l}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="font-serif">
          <p className="text-lg">priya sharma</p>
          <p className="text-sm">priya123@mail</p>
          <p className="mt-5 text-sm underline">{BEFORE.title}</p>
          <ul className="mt-3 space-y-1.5 text-sm leading-6">
            {BEFORE.lines.map((l) => (
              <li key={l}>- {l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Drag the brand-arrow handle to compare a rough draft with a finished section. */
export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative h-[360px] overflow-hidden rounded-2xl border border-border shadow-paper select-none sm:h-[320px]">
        <div className="absolute inset-0">
          <Sheet variant="after" />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Sheet variant="before" />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
          After
        </span>
        {/* Divider with the arrow handle. */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-brand"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand bg-background shadow-lift">
            <svg
              viewBox="40 110 320 180"
              className="h-5 w-auto text-brand"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M57 127 344 207 316 212 118 210 115 209Z" />
              <path d="M148 256 162 274 344 207 316 212Z" />
            </svg>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare the draft with the finished section"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Drag the arrow to compare. Sample content for illustration.
      </p>
    </div>
  );
}
