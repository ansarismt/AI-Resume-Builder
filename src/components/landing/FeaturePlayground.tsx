import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileSignature,
  Linkedin,
  ListChecks,
  MessageSquareText,
  Play,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/components/brand/arrowCanvas";

type Tool = {
  id: string;
  icon: typeof Sparkles;
  name: string;
  tagline: string;
  inputLabel: string;
  input: string;
  output: string[];
  /** Optional chips rendered under the output (e.g. matched keywords). */
  chips?: { label: string; good: boolean }[];
};

// Hand-written sample content so visitors can see what each tool does. These are
// not live AI results; the real tools run in AI Studio on the user's own resume.
const TOOLS: Tool[] = [
  {
    id: "bullets",
    icon: ListChecks,
    name: "Bullet rewrite",
    tagline: "Turn a plain duty into a clear achievement line.",
    inputLabel: "Your bullet",
    input: "Worked on the college website.",
    output: [
      "Developed and maintained the responsive college website, improving page accessibility and the experience for students on mobile.",
    ],
  },
  {
    id: "summary",
    icon: Sparkles,
    name: "Summary writer",
    tagline: "Draft a professional summary from your details.",
    inputLabel: "Your details",
    input: "Final-year CS student · React, Python, SQL · built a library app",
    output: [
      "Final-year Computer Science student with hands-on experience in React, Python and SQL.",
      "Built a full-stack library management app and enjoys turning requirements into clean, usable interfaces.",
    ],
  },
  {
    id: "match",
    icon: Target,
    name: "Job match",
    tagline: "See which keywords from a job post your resume covers.",
    inputLabel: "Job post excerpt",
    input: "Looking for a Data Analyst with SQL, Tableau, Excel and stakeholder communication.",
    output: ["3 of 4 key skills found. Add Tableau to your skills or a project line."],
    chips: [
      { label: "SQL", good: true },
      { label: "Excel", good: true },
      { label: "Communication", good: true },
      { label: "Tableau", good: false },
    ],
  },
  {
    id: "cover",
    icon: FileSignature,
    name: "Cover letter",
    tagline: "Start a tailored cover letter from your resume and the role.",
    inputLabel: "Role",
    input: "Junior Frontend Developer at a product startup",
    output: [
      "Dear Hiring Team,",
      "I'm excited to apply for the Junior Frontend Developer role. In my recent projects I built responsive React interfaces and worked closely with designers to ship features users relied on...",
    ],
  },
  {
    id: "interview",
    icon: MessageSquareText,
    name: "Interview prep",
    tagline: "Practise questions drawn from your own resume.",
    inputLabel: "From your resume",
    input: "Project: Library management app (React, Node, PostgreSQL)",
    output: [
      "1. Walk me through how you designed the database for the library app.",
      "2. What was the hardest bug you fixed, and how did you find it?",
      "3. How would you scale the app to many more users?",
    ],
  },
  {
    id: "linkedin",
    icon: Linkedin,
    name: "LinkedIn headline",
    tagline: "A sharp one-line headline for your profile.",
    inputLabel: "Target",
    input: "Aspiring data analyst, strong in SQL and dashboards",
    output: [
      "Aspiring Data Analyst | SQL · Excel · Dashboards | Turning data into clear decisions",
    ],
  },
];

function useTypewriter(lines: string[], running: boolean, onDone: () => void) {
  const [shown, setShown] = useState<string[]>([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!running) return;
    if (prefersReducedMotion()) {
      setShown(lines);
      doneRef.current();
      return;
    }
    setShown([]);
    const full = lines.join("\n");
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setShown(full.slice(0, i).split("\n"));
      if (i >= full.length) {
        window.clearInterval(id);
        doneRef.current();
      }
    }, 18);
    return () => window.clearInterval(id);
  }, [lines, running]);

  return shown;
}

export function FeaturePlayground() {
  const [activeId, setActiveId] = useState(TOOLS[0].id);
  const [phase, setPhase] = useState<"idle" | "thinking" | "typing" | "done">("idle");
  const tool = TOOLS.find((t) => t.id === activeId) ?? TOOLS[0];
  const output = useTypewriter(tool.output, phase === "typing", () => setPhase("done"));

  useEffect(() => {
    if (phase !== "thinking") return;
    const id = window.setTimeout(() => setPhase("typing"), prefersReducedMotion() ? 0 : 900);
    return () => window.clearTimeout(id);
  }, [phase]);

  const select = (id: string) => {
    setActiveId(id);
    setPhase("idle");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
      <div
        role="tablist"
        aria-label="AI tools"
        aria-orientation="vertical"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
      >
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tool-tab-${t.id}`}
              aria-selected={active}
              aria-controls="tool-panel"
              onClick={() => select(t.id)}
              className={cn(
                "group flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300",
                active
                  ? "border-brand bg-card shadow-lift"
                  : "border-transparent hover:border-border hover:bg-card/60",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-brand text-white" : "toon-icon",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="hidden text-xs text-muted-foreground lg:block">{t.tagline}</span>
              </span>
              <ArrowRight
                className={cn(
                  "ml-auto hidden h-4 w-4 text-brand transition-all lg:block",
                  active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div
        id="tool-panel"
        role="tabpanel"
        aria-labelledby={`tool-tab-${tool.id}`}
        className="toon relative overflow-hidden p-6 sm:p-8"
      >
        <div key={tool.id} className="stage-in">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {tool.inputLabel}
          </p>
          <div className="mt-2 rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-3 text-sm">
            {tool.input}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => setPhase("thinking")}
              disabled={phase === "thinking" || phase === "typing"}
              className="group"
            >
              {phase === "done" ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {phase === "done" ? "Run again" : `Run ${tool.name.toLowerCase()}`}
            </Button>
            <span className="text-xs text-muted-foreground">
              Sample output. Not a live AI result.
            </span>
          </div>

          <div
            className="relative mt-6 min-h-40 rounded-xl border border-border bg-background p-5"
            aria-live="polite"
          >
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Result
            </p>
            {phase === "idle" && (
              <p className="text-sm text-muted-foreground">
                Press run to see what this tool produces.
              </p>
            )}
            {phase === "thinking" && (
              <div className="space-y-2" aria-label="Working">
                {[92, 80, 64].map((w) => (
                  <span
                    key={w}
                    className="playground-shimmer block h-3 rounded"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            )}
            {(phase === "typing" || phase === "done") && (
              <div className="space-y-2 text-sm leading-6">
                {output.map((line, i) => (
                  <p key={i}>
                    {line}
                    {phase === "typing" && i === output.length - 1 && (
                      <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-brand" />
                    )}
                  </p>
                ))}
                {phase === "done" && tool.chips && (
                  <div className="stage-in flex flex-wrap gap-2 pt-2">
                    {tool.chips.map((chip) => (
                      <span
                        key={chip.label}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          chip.good
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {chip.good ? "✓" : "+"} {chip.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <BriefcaseBusiness className="h-4 w-4 text-brand" />
            Try it on your own resume in AI Studio.
            <Link to="/signup" className="font-semibold text-brand hover:underline">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
