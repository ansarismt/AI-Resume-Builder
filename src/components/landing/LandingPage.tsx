import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  Gauge,
  History,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { TEMPLATE_CATALOG } from "@/components/resume/templateCatalog";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { EditDemo, ExportDemo, PickDemo, SuggestDemo } from "./demos";
import { Counter, Magnetic, RotatingWord, ScrollProgress, SpotlightCard, Tilt } from "./motion";

const SWATCHES = ["#1f3a5f", "#2f5d8a", "#4a5568", "#2d3436", "#111111"];

function HeroResume() {
  const [accent, setAccent] = useState(SWATCHES[1]);
  return (
    <div className="relative mx-auto w-full max-w-md">
      <Tilt>
        <div className="relative rounded-2xl border border-border bg-white p-6 shadow-paper">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-extrabold" style={{ color: accent }}>
                Jordan Example
              </p>
              <p className="text-xs text-muted-foreground">Information Systems Student</p>
            </div>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: accent }}
            >
              JE
            </span>
          </div>
          <div className="mt-4 h-0.5 w-full" style={{ background: accent }} />
          {["Career objective", "Skills", "Education"].map((title, row) => (
            <div key={title} className="mt-4">
              <p
                className="text-[0.62rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {title}
              </p>
              <div className="mt-2 space-y-1.5">
                {[100, 88, 64].slice(0, row === 1 ? 2 : 3).map((width, line) => (
                  <div
                    key={width}
                    className="draw-line h-1.5 rounded-full bg-slate-200"
                    style={{
                      width: `${width}%`,
                      animationDelay: `${600 + row * 260 + line * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {["React", "Python", "SQL", "Teamwork"].map((skill, index) => (
              <span
                key={skill}
                className="pop-in rounded border border-slate-200 px-2 py-0.5 text-[0.65rem] text-slate-600"
                style={{ animationDelay: `${1500 + index * 110}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Tilt>

      <div className="float-slow absolute -left-4 top-10 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-lift sm:-left-10 sm:block">
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <Gauge className="h-3.5 w-3.5 text-primary" /> ATS score
        </p>
        <p className="mt-0.5 text-xl font-extrabold text-primary">92</p>
      </div>
      <div
        className="float-slow absolute -right-3 top-1/3 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-lift sm:-right-8 sm:block"
        style={{ animationDelay: "1.2s" }}
      >
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI suggestion
        </p>
        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">Stronger bullet ready</p>
      </div>
      <div
        className="float-slow absolute -bottom-4 left-8 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-lift sm:block"
        style={{ animationDelay: "2.1s" }}
      >
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <Download className="h-3.5 w-3.5 text-primary" /> PDF · DOCX · TXT
        </p>
      </div>

      <div
        className="mt-8 flex items-center justify-center gap-2"
        role="group"
        aria-label="Try a colour"
      >
        <span className="mr-1 text-xs text-muted-foreground">Try a colour</span>
        {SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Use colour ${color}`}
            aria-pressed={accent === color}
            onClick={() => setAccent(color)}
            className={cn(
              "h-6 w-6 rounded-full border-2 border-white shadow transition-transform hover:scale-125",
              accent === color && "scale-125 ring-2 ring-primary",
            )}
            style={{ background: color }}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateMarquee() {
  const row = [...TEMPLATE_CATALOG, ...TEMPLATE_CATALOG];
  return (
    <div className="marquee overflow-hidden py-2" aria-label="Resume templates">
      <div className="marquee__track flex w-max gap-3">
        {row.map((template, index) => (
          <div
            key={`${template.id}-${index}`}
            aria-hidden={index >= TEMPLATE_CATALOG.length}
            className="flex w-56 shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lift"
          >
            <span
              className="h-12 w-9 shrink-0 rounded-md border border-border"
              style={{
                background: `linear-gradient(135deg, ${template.colors[0]} 0 30%, #fff 30% 100%)`,
              }}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{template.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {template.category}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DEMO_ROWS = [
  {
    icon: LayoutTemplate,
    title: "Edit and customize online",
    text: "Open any section, change it, and watch the preview update. Your resume saves as you go, so you can leave and come back to the same place.",
    demo: <EditDemo />,
  },
  {
    icon: Sparkles,
    title: "Writing help when you want it",
    text: "Search for a role and get ready-made bullet points, or ask for a stronger version of your own line. Nothing is added unless you click it.",
    demo: <SuggestDemo />,
  },
  {
    icon: Download,
    title: "Download in the format you need",
    text: "Get a PDF for applications, a Word file to keep editing, or JSON and plain text for portals that ask for them.",
    demo: <ExportDemo />,
  },
];

function DemoRows() {
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
      {DEMO_ROWS.map((row, index) => (
        <div key={row.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className={index % 2 === 1 ? "lg:order-2" : ""}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <row.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">{row.title}</h2>
            <p className="mt-3 max-w-md leading-7 text-muted-foreground">{row.text}</p>
          </Reveal>
          <Reveal delay={120}>{row.demo}</Reveal>
        </div>
      ))}
    </div>
  );
}

const STEP_LIST = [
  ["Choose a template", "Pick one of 20 layouts. You can switch any time without losing content."],
  ["Add your details", "Fill in the guided form, or import a PDF or DOCX to start faster."],
  ["Download and apply", "Save it, export it, and send it off."],
];

function ThreeSteps() {
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <Reveal>
        <PickDemo />
      </Reveal>
      <div>
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Build it in 3 steps
          </h2>
        </Reveal>
        <ol className="mt-8 space-y-6">
          {STEP_LIST.map(([title, text], index) => (
            <Reveal as="li" key={title} delay={index * 100} className="group flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-extrabold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-1 leading-7 text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI writing help",
    text: "Stronger bullet points and tailored summaries. Every suggestion is optional.",
    wide: true,
  },
  {
    icon: FileUp,
    title: "Import in seconds",
    text: "Upload a PDF or DOCX and the details are extracted for you to review.",
  },
  {
    icon: LayoutTemplate,
    title: "20 professional templates",
    text: "Sidebars, banners, timelines, plain ATS layouts, in sans and serif.",
  },
  {
    icon: Gauge,
    title: "ATS-aware scoring",
    text: "See how well your resume matches a job description and what is missing.",
    wide: true,
  },
  {
    icon: History,
    title: "Saved versions",
    text: "Keep a version for every role and come back to edit any time.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    text: "No resume text is logged, and AI never invents facts about you.",
  },
];

const FAQS = [
  [
    "Can I choose from different resume styles?",
    "Yes. Preview and choose from 20 templates, and change your selection at any time.",
  ],
  [
    "Will suggestions change my resume automatically?",
    "No. Suggestions are optional, and you decide whether to use them.",
  ],
  [
    "Which download formats are available?",
    "PDF, Word (DOCX), JSON and plain text, all from the same resume.",
  ],
  [
    "Can I save and edit a resume later?",
    "Create an account to save resumes and return to update them later.",
  ],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-8 space-y-3">
      {FAQS.map(([question, answer], index) => {
        const isOpen = open === index;
        return (
          <div
            key={question}
            className="rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold"
            >
              {question}
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-primary transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden px-4 text-sm text-muted-foreground">
                <p className="pb-4">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LandingPage({ isStaff }: { isStaff: boolean }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <ScrollProgress />

      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="blob blob-a" aria-hidden="true" />
        <div className="blob blob-b" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="stage-in mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
              Free resume builder
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              A resume that works for{" "}
              <RotatingWord words={["students", "freshers", "professionals", "career changers"]} />
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Build it in a guided form, pick from 20 templates, get optional AI help, and download
              it as PDF or Word.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Button asChild size="lg" className="shine px-7">
                  <Link to="/signup">
                    Create my resume <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Magnetic>
              <Button asChild size="lg" variant="outline" className="px-7">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                "20 professional templates",
                "You approve every AI suggestion",
                "PDF, Word, JSON, TXT",
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <HeroResume />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-3">
        <TemplateMarquee />
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <Counter value={20} label="Templates" />
          <Counter value={4} label="Export formats" />
          <Counter value={24} label="Job categories" />
          <Counter value={100} suffix="%" label="Your content" />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything between a blank page and an offer
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal
                key={feature.title}
                delay={index * 80}
                className={feature.wide ? "lg:col-span-2" : ""}
              >
                <SpotlightCard className="h-full rounded-2xl border border-border bg-card p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <DemoRows />
      </section>

      <section className="border-b border-border bg-secondary/40">
        <ThreeSteps />
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
          </Reveal>
          <Faq />
        </div>
      </section>

      <section className="cta-band relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to build yours?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Create an account, fill in the form and download a polished resume in minutes.
          </p>
          <div className="mt-8">
            <Magnetic>
              <Button asChild size="lg" variant="secondary" className="shine px-8">
                <Link to="/signup">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </section>

      {isStaff && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <Button asChild variant="outline">
              <Link to="/admin-panel">Open Admin Panel</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
