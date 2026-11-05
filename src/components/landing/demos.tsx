import { Check, ChevronDown, Download, MoreHorizontal, Search } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { TEMPLATE_CATALOG } from "@/components/resume/templateCatalog";
import { cn } from "@/lib/utils";

/** Animated pointer that moves and "clicks" inside a demo (decorative). */
function Cursor({ className, animation }: { className?: string; animation: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("pointer-events-none absolute z-20 h-7 w-7 drop-shadow-md", className)}
      style={{ animation: `${animation} infinite both` }}
    >
      <path
        d="M5 3l14 8-6 1.8L10.5 19 5 3z"
        fill="#0b0f1a"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-secondary/70 p-5 sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Row({ title, years, open }: { title: string; years: string; open?: boolean }) {
  return (
    <div className="rounded-xl bg-primary/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{years}</p>
        </div>
        <ChevronDown
          className="h-4 w-4 text-primary"
          style={open ? { animation: "demo-flip 8s infinite both" } : undefined}
        />
      </div>
      {open && (
        <div className="grid" style={{ animation: "demo-open 8s ease infinite both" }}>
          <div className="overflow-hidden">
            <div className="mt-3 space-y-1.5 pb-1">
              <div className="h-1.5 w-11/12 rounded-full bg-primary/20" />
              <div className="h-1.5 w-9/12 rounded-full bg-primary/20" />
              <div className="h-1.5 w-7/12 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Sections that expand when "clicked". */
export function EditDemo() {
  return (
    <Panel>
      <div className="relative mx-auto max-w-sm space-y-4 rounded-xl bg-card p-4 shadow-sm">
        <p className="text-sm font-extrabold text-primary">Education</p>
        <Row title="Example State University" years="2023–2026" open />
        <p className="pt-1 text-sm font-extrabold text-primary">Experience</p>
        <Row title="Research assistant" years="2024–2025" />
        <Row title="Software intern" years="Summer 2025" />
        <Cursor className="right-6 top-[4.2rem]" animation="cur-edit 8s" />
      </div>
    </Panel>
  );
}

/** A search box that types itself and reveals suggestions. */
export function SuggestDemo() {
  return (
    <Panel>
      <div className="relative mx-auto max-w-sm min-h-[17rem] rounded-xl bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3 text-sm font-bold text-primary">
            <span>B</span>
            <span className="italic">I</span>
            <span className="underline">U</span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            style={{ animation: "demo-press 9s infinite both" }}
          >
            Add suggestion +
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {[90, 70, 80].map((width) => (
            <div
              key={width}
              className="h-2 rounded-full bg-primary/10"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
        <div
          className="absolute inset-x-3 top-14 rounded-xl border border-border bg-card p-3 shadow-lift"
          style={{ animation: "demo-pop 9s ease infinite both" }}
        >
          <div className="flex items-center gap-2 border-b-2 border-primary/60 pb-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span
              className="inline-block overflow-hidden whitespace-nowrap text-xs font-medium"
              style={{ animation: "demo-type 9s steps(13) infinite both" }}
            >
              data analyst
            </span>
          </div>
          {[
            "Built dashboards that cut reporting time by 30%",
            "Cleaned and analysed survey data in SQL",
          ].map((text, index) => (
            <p
              key={text}
              className="mt-2 rounded-lg bg-primary/5 px-2.5 py-1.5 text-xs"
              style={{ animation: `demo-result-${index + 1} 9s ease infinite both` }}
            >
              {text}
            </p>
          ))}
        </div>
        <Cursor className="right-10 top-3" animation="cur-suggest 9s" />
      </div>
    </Panel>
  );
}

/** Download button that opens a format menu. */
export function ExportDemo() {
  const formats = ["PDF", "Word (.docx)", "JSON", "Plain text"];
  return (
    <Panel>
      <div className="relative mx-auto max-w-sm min-h-[19rem] rounded-xl bg-card p-4 pb-20 shadow-sm">
        <div className="h-3 w-1/2 rounded bg-primary/60" />
        <div className="mt-3 space-y-1.5">
          {[100, 90, 80, 95].map((width) => (
            <div
              key={width}
              className="h-1.5 rounded-full bg-primary/10"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Download className="h-4 w-4" /> Download PDF
          </span>
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary"
            style={{ animation: "demo-press 8s infinite both" }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        </div>
        <ul
          className="absolute bottom-16 right-4 w-44 rounded-xl border border-border bg-card p-1.5 text-xs shadow-lift"
          style={{ animation: "demo-pop 8s ease infinite both" }}
        >
          {formats.map((format, index) => (
            <li
              key={format}
              className="rounded-lg px-3 py-2 font-medium"
              style={index === 1 ? { animation: "demo-hl 8s ease infinite both" } : undefined}
            >
              {format}
            </li>
          ))}
        </ul>
        <Cursor className="bottom-2 right-3" animation="cur-export 8s" />
      </div>
    </Panel>
  );
}

/** Cards that get selected one after another. */
export function PickDemo() {
  const cards = TEMPLATE_CATALOG.filter((_, index) => [0, 4, 8, 12].includes(index));
  return (
    <Panel>
      <div className="mx-auto grid max-w-xs grid-cols-2 gap-3">
        {cards.map((template, index) => (
          <div key={template.id} className="relative rounded-xl bg-card p-2 shadow-sm">
            <div
              className="aspect-[3/4] rounded-lg border border-border"
              style={{
                background: `linear-gradient(135deg, ${template.colors[0]} 0 26%, #fff 26% 100%)`,
              }}
            />
            <p className="mt-2 truncate px-1 text-xs font-semibold">{template.name}</p>
            <div
              className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary"
              style={
                {
                  animation: "demo-pick 12s ease infinite backwards",
                  animationDelay: `${index * 3}s`,
                } as CSSProperties
              }
            />
            <span
              className="absolute left-1/2 top-[38%] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift"
              style={
                {
                  animation: "demo-pick 12s ease infinite backwards",
                  animationDelay: `${index * 3}s`,
                } as CSSProperties
              }
            >
              <Check className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
