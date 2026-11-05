import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutTemplate,
  School,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  TEMPLATE_CATALOG,
  type TemplateLayout,
  type TemplateMeta,
} from "@/components/resume/templateCatalog";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { EditDemo, ExportDemo, PickDemo, SuggestDemo } from "./demos";
import { Counter, Magnetic, ScrollProgress, SpotlightCard, Tilt } from "./motion";

const SWATCHES = ["#1f3a5f", "#2f5d8a", "#4a5568", "#2d3436", "#111111"];

function SectionHead({
  eyebrow,
  title,
  text,
  center,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 leading-7 text-muted-foreground">{text}</p>}
    </Reveal>
  );
}

/** Tiny drawing of a template's structure. */
function MiniTemplate({ layout, color }: { layout: TemplateLayout; color: string }) {
  const bar = "h-1 rounded-full bg-slate-200";
  const lines = (
    <div className="space-y-1">
      <div className={bar} style={{ width: "92%" }} />
      <div className={bar} style={{ width: "78%" }} />
      <div className={bar} style={{ width: "60%" }} />
    </div>
  );
  const head = <div className="h-2 w-2/5 rounded-sm" style={{ background: color }} />;
  if (layout === "sidebar-left" || layout === "sidebar-right") {
    const side = (
      <div
        className="w-1/3 space-y-1 p-1.5"
        style={{ background: layout === "sidebar-left" ? color : "#eef2f8" }}
      />
    );
    return (
      <div className="flex h-full">
        {layout === "sidebar-left" && side}
        <div className="flex-1 space-y-2 p-2">
          {head}
          {lines}
          {lines}
        </div>
        {layout === "sidebar-right" && side}
      </div>
    );
  }
  if (layout === "banner") {
    return (
      <div className="h-full">
        <div className="h-1/4" style={{ background: color }} />
        <div className="space-y-2 p-2">
          {lines}
          {lines}
        </div>
      </div>
    );
  }
  if (layout === "split") {
    return (
      <div className="space-y-2 p-2">
        <div className="h-2 w-1/2 rounded-sm" style={{ background: color }} />
        <div className="h-px" style={{ background: color }} />
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            {lines}
            {lines}
          </div>
          <div className="w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn("space-y-2 p-2", layout === "classic" && "text-center")}
      style={layout === "framed" ? { borderTop: `4px solid ${color}` } : undefined}
    >
      <div className={cn(layout === "classic" && "mx-auto w-2/5")}>{head}</div>
      <div className="h-px" style={{ background: layout === "ats" ? "#111" : color }} />
      {lines}
      {lines}
    </div>
  );
}

function HeroResume() {
  const [accent, setAccent] = useState(SWATCHES[1]);
  return (
    <div className="mx-auto w-full max-w-md">
      <Tilt>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-paper">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold" style={{ color: accent }}>
                Jordan Example
              </p>
              <p className="text-xs text-slate-500">Information Systems Student</p>
              <p className="mt-1 text-[0.65rem] text-slate-400">
                jordan.example@example.test · +1 555 010 2040
              </p>
            </div>
            <span
              className="rounded px-2 py-0.5 text-[0.6rem] font-semibold text-white"
              style={{ background: accent }}
            >
              A4 · 1 page
            </span>
          </div>
          <div className="mt-3 h-0.5 w-full" style={{ background: accent }} />
          {[
            [
              "Career objective",
              "Curious information-systems student who turns complex data into clear tools.",
            ],
            ["Education", "BSc Information Systems · Example State University · 2023–2026"],
            ["Projects", "Community Data Explorer: accessible interface for public datasets."],
          ].map(([title, text], row) => (
            <div key={title} className="mt-3">
              <p
                className="text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {title}
              </p>
              <p
                className="stage-in mt-1 text-[0.7rem] leading-4 text-slate-600"
                style={{ animationDelay: `${300 + row * 250}ms` }}
              >
                {text}
              </p>
            </div>
          ))}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["TypeScript", "React", "Python", "SQL", "Teamwork"].map((skill, index) => (
              <span
                key={skill}
                className="pop-in rounded border border-slate-200 px-2 py-0.5 text-[0.62rem] text-slate-600"
                style={{ animationDelay: `${1100 + index * 90}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Tilt>
      <div
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Try a colour"
      >
        <span className="mr-1 text-xs text-muted-foreground">Try a colour:</span>
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

const RESUME_TYPES = [
  {
    icon: School,
    title: "School students",
    best: "Scholarships, competitions, first internships",
    sections: ["Career objective", "Education", "Skills", "Achievements / activities"],
  },
  {
    icon: GraduationCap,
    title: "College and freshers",
    best: "Campus placements, internships, entry-level roles",
    sections: [
      "Career objective",
      "Education",
      "Skills",
      "Projects",
      "Internships",
      "Certifications",
      "Achievements",
    ],
  },
  {
    icon: Briefcase,
    title: "Working professionals",
    best: "Experienced hires and role changes",
    sections: [
      "Professional summary",
      "Experience",
      "Skills",
      "Certifications",
      "Education",
      "Projects",
    ],
  },
];

function ResumeTypes() {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {RESUME_TYPES.map((type, index) => (
        <Reveal key={type.title} delay={index * 90}>
          <SpotlightCard className="h-full rounded-2xl border border-border bg-card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <type.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">{type.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Best for: {type.best}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sections included
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {type.sections.map((section) => (
                <li key={section} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {section}
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}

function TemplateGallery() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(TEMPLATE_CATALOG.map((template) => template.category)))],
    [],
  );
  const [category, setCategory] = useState("All");
  const [fontFilter, setFontFilter] = useState<"all" | "sans" | "serif">("all");
  const visible = TEMPLATE_CATALOG.filter(
    (template: TemplateMeta) =>
      (category === "All" || template.category === category) &&
      (fontFilter === "all" || template.font === fontFilter),
  );

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter templates">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              category === name
                ? "border-primary bg-primary text-primary-foreground shadow-lift"
                : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40",
            )}
          >
            {name}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
        {(["all", "sans", "serif"] as const).map((font) => (
          <button
            key={font}
            type="button"
            aria-pressed={fontFilter === font}
            onClick={() => setFontFilter(font)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              fontFilter === font
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground/40",
              font === "serif" && "font-serif",
            )}
          >
            {font === "all" ? "Any font" : font === "sans" ? "Sans" : "Serif"}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        Showing {visible.length} of {TEMPLATE_CATALOG.length} templates
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((template, index) => (
          <article
            key={`${template.id}-${category}-${fontFilter}`}
            className="pop-in hover-lift flex flex-col rounded-2xl border border-border bg-card p-3"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-white">
              <MiniTemplate layout={template.layout} color={template.colors[0]} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <h3 className="font-bold">{template.name}</h3>
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-muted-foreground">
                {template.font}
              </span>
            </div>
            <p className="text-xs font-medium text-primary">{template.category}</p>
            <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">
              {template.description}
            </p>
            <div className="mt-3 flex gap-1.5">
              {template.colors.map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full border border-white shadow ring-1 ring-border"
                  style={{ background: color }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const DEMO_ROWS = [
  {
    icon: LayoutTemplate,
    title: "Edit and customize online",
    text: "Fill in a guided form and watch the preview update as you type. Your resume saves to your account, so you can leave and come back to the same place.",
    demo: <EditDemo />,
  },
  {
    icon: Sparkles,
    title: "Writing help when you want it",
    text: "Ask for a stronger version of a line or a draft summary. Suggestions appear for you to accept or ignore; nothing in your resume changes until you click.",
    demo: <SuggestDemo />,
  },
  {
    icon: Download,
    title: "Download in the format you need",
    text: "Print a PDF for applications, keep editing in Word, or export JSON and plain text for portals that ask for them.",
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
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight">{row.title}</h3>
            <p className="mt-3 max-w-md leading-7 text-muted-foreground">{row.text}</p>
          </Reveal>
          <Reveal delay={120}>{row.demo}</Reveal>
        </div>
      ))}
    </div>
  );
}

const LOCAL_TOOLS = [
  ["Resume strength", "Structure, content and writing-quality checks with specific improvements."],
  ["Career-category match", "Which job categories your resume most resembles, ranked."],
  ["Job-description match", "Keywords and sections you cover, and the ones you are missing."],
  ["Skills to explore", "Skills that are common in your target role's category."],
];
const PROVIDER_TOOLS = [
  "Import a PDF or DOCX into the form",
  "Draft a professional summary",
  "Rewrite bullet points more clearly",
  "Tailor a resume to a job posting",
  "Cover letter, grammar check, interview questions, LinkedIn headline",
];

function AiSection() {
  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-2">
      <Reveal>
        <SpotlightCard className="h-full rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">Resume analysis</h3>
              <p className="text-xs font-medium text-primary">
                Runs on our own server. No API key needed.
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-3">
            {LOCAL_TOOLS.map(([name, text]) => (
              <div key={name}>
                <dt className="text-sm font-semibold">{name}</dt>
                <dd className="text-sm text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            These scores come from a statistical model trained on a resume dataset. Use them as
            guidance, not as a hiring decision.
          </p>
        </SpotlightCard>
      </Reveal>
      <Reveal delay={100}>
        <SpotlightCard className="h-full rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">Writing tools</h3>
              <p className="text-xs font-medium text-primary">
                Use a language-model provider set up by the site owner.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {PROVIDER_TOOLS.map((tool) => (
              <li key={tool} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {tool}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Only the text needed for the request is sent to the provider. AI can be wrong, so check
            every suggestion and never add qualifications you do not have.
          </p>
        </SpotlightCard>
      </Reveal>
    </div>
  );
}

const FORMATS = [
  {
    name: "PDF",
    best: "Job applications",
    points: ["Selectable, searchable text", "Exactly matches the preview", "A4, fonts embedded"],
  },
  {
    name: "Word (.docx)",
    best: "Further editing",
    points: [
      "Follows the template layout",
      "Uses the template colour and font",
      "Opens in Word and Docs",
    ],
  },
  {
    name: "JSON",
    best: "Backup and portability",
    points: ["Every field you entered", "Easy to keep or re-use", "Includes template and colour"],
  },
  {
    name: "Plain text",
    best: "Online application forms",
    points: ["No formatting to break", "Paste into any portal", "Smallest file"],
  },
];

function Formats() {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {FORMATS.map((format, index) => (
        <Reveal key={format.name} delay={index * 80}>
          <article className="hover-lift h-full rounded-2xl border border-border bg-card p-5">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-lg font-bold">{format.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {format.best}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {format.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

const TIPS = [
  [
    "Keep it to one page",
    "Recruiters skim for seconds. Lead with your strongest, most recent items.",
  ],
  ["Show results, not duties", "Say what changed because of your work: numbers, scale, outcomes."],
  ["Match the job posting", "Use the same key terms the role uses, as long as they are true."],
  [
    "Prefer plain layouts for portals",
    "Many application systems read simple single-column files best.",
  ],
];

function Tips() {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2">
      {TIPS.map(([title, text], index) => (
        <Reveal key={title} delay={index * 80}>
          <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

const STEP_LIST = [
  [
    "Choose a template",
    "Pick one of 20 layouts and a colour. You can switch any time without losing content.",
  ],
  ["Add your details", "Fill in the guided form, or import a PDF or DOCX to start faster."],
  [
    "Download and apply",
    "Save it to your account, then export it in the format each employer asks for.",
  ],
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

const PRIVACY = [
  ["Your resumes belong to your account", "Only you can open, edit or export a resume you saved."],
  [
    "Text is not written to logs",
    "The app does not intentionally log resume bodies or credentials.",
  ],
  ["Suggestions never apply themselves", "AI output appears for review. You choose what goes in."],
];

const FAQS = [
  [
    "Is it free to use?",
    "You can create an account and build resumes without paying. Writing tools depend on the site owner having set up a language-model provider.",
  ],
  [
    "Can I choose from different resume styles?",
    "Yes. Choose from 20 templates, switch any time, and pick one of five professional colours.",
  ],
  [
    "Will suggestions change my resume automatically?",
    "No. Suggestions are optional and you decide whether to use them.",
  ],
  [
    "Which download formats are available?",
    "PDF, Word (DOCX), JSON and plain text, all from the same saved resume.",
  ],
  [
    "Why does the PDF use the print dialog?",
    "Printing from the browser keeps the text selectable and the layout identical to the preview. Choose Save as PDF as the destination.",
  ],
  [
    "Does the Word file look exactly like the preview?",
    "It follows the same layout, colours and fonts, but Word cannot reproduce every effect, so small differences are possible.",
  ],
  [
    "Can I import an existing resume?",
    "Yes. Upload a PDF or DOCX and the details are filled into the form for you to review. This uses the writing-tools provider.",
  ],
  [
    "Can I save and edit a resume later?",
    "Create an account to save resumes, keep versions and come back to update them.",
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
              <div className="overflow-hidden px-4 text-sm leading-6 text-muted-foreground">
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

      <section className="hero-glow border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="stage-in mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              For school, college and professional resumes
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Build a resume that is ready to send.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Fill in a guided form, choose from 20 designed templates, and download a clean PDF or
              Word file. Optional tools help with wording and show how your resume matches a job.
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
            <ul className="mt-8 grid max-w-xl gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "20 templates, 5 colour options",
                "3 resume types with the right sections",
                "PDF, Word, JSON and TXT downloads",
                "Import from PDF or DOCX",
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
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

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          <Counter value={20} label="Templates" />
          <Counter value={3} label="Resume types" />
          <Counter value={4} label="Download formats" />
          <Counter value={24} label="Job categories analysed" />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="Resume types"
            title="Sections that fit where you are"
            text="Pick the type that matches your situation and the form asks only for what belongs on that resume."
          />
          <ResumeTypes />
        </div>
      </section>

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="Templates"
            title="20 templates, one set of content"
            text="Every template shows the same information, so you can switch layouts freely. Filter by style or font."
          />
          <TemplateGallery />
        </div>
      </section>

      <section className="border-b border-border">
        <DemoRows />
      </section>

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="AI tools"
            title="What the AI does, and what it does not"
            text="Two separate systems: analysis that runs on our own server, and writing tools that call a language model."
          />
          <AiSection />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead
            eyebrow="Downloads"
            title="The right file for each application"
            text="Save once, then export whichever format the employer asks for."
          />
          <Formats />
        </div>
      </section>

      <section className="border-b border-border bg-secondary/40">
        <ThreeSteps />
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead eyebrow="Resume tips" title="Four habits of resumes that get read" />
          <Tips />
        </div>
      </section>

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead eyebrow="Privacy" title="Your information stays in your hands" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {PRIVACY.map(([title, text], index) => (
              <Reveal key={title} delay={index * 90}>
                <div className="hover-lift h-full rounded-2xl border border-border bg-card p-5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <SectionHead eyebrow="FAQ" title="Questions, answered" center />
          <Faq />
        </div>
      </section>

      <section className="cta-band relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to build yours?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Create an account, fill in the form and download a finished resume.
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
