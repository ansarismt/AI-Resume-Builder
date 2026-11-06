import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  Lightbulb,
  MessageSquare,
  Moon,
  Save,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  ACTION_VERBS,
  CAREER_TIPS,
  INTERVIEW_QUESTIONS,
} from "@/components/dashboard/dashboardContent";
import { computeResumeHealth } from "@/components/resume/resumeInsights";
import { emptyResume } from "@/components/resume/types";
import { MODEL_STATS } from "@/lib/modelStats";
import { Reveal, Tilt } from "./effects";

const CHECK_COUNT = computeResumeHealth(emptyResume).checks.length;
const VERB_COUNT = new Set(Object.values(ACTION_VERBS).flat()).size;
const VERB_GROUPS = Object.keys(ACTION_VERBS).length;
const QUESTION_COUNT = Object.values(INTERVIEW_QUESTIONS).flat().length;
const QUESTION_GROUPS = Object.keys(INTERVIEW_QUESTIONS).length;

/** One alternating hero band: copy on one side, a live-looking mock on the other. */
function Band({
  eyebrow,
  title,
  text,
  points,
  mock,
  flip,
  tone,
}: {
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  mock: React.ReactNode;
  flip?: boolean;
  tone?: "plain" | "muted";
}) {
  return (
    <section className={cn("border-b border-border", tone === "muted" && "bg-secondary/40")}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <Reveal className={cn(flip && "lg:order-2")}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h2
            data-dart-stop
            className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{text}</p>
          <ul className="mt-5 space-y-2 text-sm">
            {points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
          <Button asChild className="group mt-7">
            <Link to="/signup">
              Try it free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={120} className={cn(flip && "lg:order-1")}>
          <Tilt>
            <div className="relative rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-paper sm:p-8">
              {mock}
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

function HealthMock() {
  const checks: Array<[string, boolean]> = [
    ["Valid email address", true],
    ["Summary of 25 to 90 words", true],
    ["At least 6 skills listed", true],
    ["Results include numbers", false],
    ["Profile link added", false],
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Resume health</p>
        <p>
          <span className="text-3xl font-bold tracking-tight">78</span>
          <span className="text-sm text-muted-foreground">/100 · Strong</span>
        </p>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border">
        <div className="h-full w-[78%] rounded-full bg-emerald-500" />
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {checks.map(([label, done]) => (
          <li key={label} className="flex items-center gap-2.5">
            {done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={done ? "text-muted-foreground" : "font-medium"}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrackerMock() {
  const rows: Array<[string, string, string, string]> = [
    [
      "Data Analyst",
      "Northwind",
      "Interview",
      "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ],
    ["BI Developer", "Contoso", "Applied", "bg-primary/15 text-primary"],
    [
      "Junior Analyst",
      "Fabrikam",
      "Offer",
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ],
    ["Reporting Lead", "Litware", "Saved", "bg-secondary text-secondary-foreground"],
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Briefcase className="h-4 w-4 text-primary" />
        Application tracker
      </div>
      <ul className="mt-4 divide-y divide-border">
        {rows.map(([role, company, status, tone]) => (
          <li key={role} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{role}</p>
              <p className="truncate text-xs text-muted-foreground">{company}</p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone)}>
              {status}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">Sample data for illustration.</p>
    </div>
  );
}

function ProgressMock() {
  const steps: Array<[string, boolean]> = [
    ["Add your name and email", true],
    ["Write a professional summary", true],
    ["List at least six skills", true],
    ["Reach a health score of 75", true],
    ["Save a resume to your account", false],
    ["Track your first application", false],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between text-sm font-semibold">
          Interview-ready checklist <span className="text-primary">4 of 6</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {steps.map(([label, done]) => (
            <li key={label} className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={done ? "text-muted-foreground line-through" : ""}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <Save className="h-5 w-5 text-primary" />
        <div>
          <p className="font-semibold">Draft restored</p>
          <p className="text-xs text-muted-foreground">Picked up where you left off, 2 min ago.</p>
        </div>
      </div>
    </div>
  );
}

function ToolkitMock() {
  const verbs = ["Led", "Built", "Automated", "Reduced", "Delivered", "Analysed", "Mentored"];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Action verb bank</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {verbs.map((verb) => (
            <span
              key={verb}
              className="rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-sm"
            >
              {verb}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Interview practice</p>
        <p className="mt-3 flex gap-2 rounded-lg bg-secondary/50 p-3 text-sm leading-6">
          <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-primary" />
          Tell me about a time you worked under a tight deadline.
        </p>
      </div>
      <div className="flex gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
        <p className="leading-6 text-muted-foreground">
          <span className="font-semibold text-foreground">Lead with impact.</span> Start bullets
          with a verb and finish with a result.
        </p>
      </div>
    </div>
  );
}

function ThemeMock() {
  const colors = ["#1f3a5f", "#2f5d8a", "#4a5568", "#2d3436", "#111111"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Light", icon: Sun, dark: false },
          { label: "Dark", icon: Moon, dark: true },
        ].map(({ label, icon: Icon, dark }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border p-4",
              dark
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-border bg-white text-slate-900",
            )}
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-blue-500" />
              {label} theme
            </p>
            <div className="mt-3 space-y-1.5">
              <div className={cn("h-2 rounded", dark ? "bg-slate-700" : "bg-slate-200")} />
              <div className={cn("h-2 w-4/5 rounded", dark ? "bg-slate-700" : "bg-slate-200")} />
              <div className="h-2 w-1/2 rounded bg-blue-500" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">30 templates, 5 colours each</p>
        <div className="mt-3 flex gap-2">
          {colors.map((color) => (
            <span
              key={color}
              className="h-8 w-8 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] rounded-md border border-border bg-white p-1.5"
              aria-hidden="true"
            >
              <div
                className="h-1.5 w-2/3 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="mt-1 h-1 rounded-sm bg-slate-200" />
              <div className="mt-0.5 h-1 w-4/5 rounded-sm bg-slate-200" />
              <div className="mt-1.5 h-1 rounded-sm bg-slate-200" />
              <div className="mt-0.5 h-1 w-3/5 rounded-sm bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureShowcases() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <Reveal className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
            From first draft to offer
          </p>
          <h2 data-dart-stop className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            More than a resume builder.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
            Score your resume, track every application, practise interviews and keep your progress
            safe, all in one workspace.
          </p>
          <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[
              [String(CHECK_COUNT), "health checks"],
              ["30", "templates"],
              [`${MODEL_STATS.top1Accuracy}%`, "role-match accuracy"],
              [String(VERB_COUNT), "action verbs"],
              [String(QUESTION_COUNT), "interview questions"],
              [String(CAREER_TIPS.length), "career tips"],
            ].map(([value, label]) => (
              <div key={label}>
                <dd className="text-4xl font-bold tracking-tight">{value}</dd>
                <dt className="mt-1 text-sm text-primary-foreground/80">{label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <Band
        eyebrow="Resume health score"
        title="Know exactly what to fix, while you type."
        text="A live score checks your contact details, summary, skills, results and length, then tells you the next thing to add. It runs in your browser, so nothing leaves your device."
        points={[
          `${CHECK_COUNT} checks with a clear tip for each one`,
          "Word count and one-page length guidance",
          "Copy your resume as plain text for online forms",
        ]}
        mock={<HealthMock />}
      />

      <Band
        eyebrow="Application tracker"
        title="Keep every application in one place."
        text="Add the company and role when you apply, then move each job from saved to applied, interview and offer. See your pipeline at a glance."
        points={[
          "Five stages with a count for each",
          "Update a status in one click",
          "Entries stay in your browser",
        ]}
        mock={<TrackerMock />}
        flip
        tone="muted"
      />

      <Band
        eyebrow="Progress and autosave"
        title="Always know your next step. Never lose your work."
        text="A checklist turns your real progress into a clear path to a finished resume, and drafts are saved as you type so a closed tab never costs you anything."
        points={[
          "Six steps that tick off automatically",
          "Draft restore banner when you come back",
          "Warning before you leave with unsaved changes",
          "Ctrl+S saves instantly",
        ]}
        mock={<ProgressMock />}
      />

      <Band
        eyebrow="Writing and interview toolkit"
        title="Find the right words, then practise saying them."
        text="Browse strong action verbs by theme, rehearse common interview questions and pick up practical tips, all without leaving the page."
        points={[
          `${VERB_COUNT} action verbs in ${VERB_GROUPS} groups, one click to copy`,
          `${QUESTION_COUNT} questions in ${QUESTION_GROUPS} categories, with the STAR method`,
          `${CAREER_TIPS.length} career tips that make a difference`,
        ]}
        mock={<ToolkitMock />}
        flip
        tone="muted"
      />

      <Band
        eyebrow="Templates and themes"
        title="Thirty looks. Light or dark. Your choice."
        text="Preview your own content in any layout, change the colour, and work in a light, dark or system theme that stays easy on the eyes."
        points={[
          "Sidebars, banners, timelines and plain ATS layouts",
          "Switch templates without losing content",
          "Theme remembered between visits",
        ]}
        mock={<ThemeMock />}
      />
    </>
  );
}
