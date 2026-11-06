import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  FileUp,
  Gauge,
  History,
  Keyboard,
  LayoutTemplate,
  Smartphone,
  PenLine,
  Save,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import categoryData from "../../../shared/categories.json";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CountUp, GlowSection, Reveal } from "./effects";
import { FeatureShowcases } from "./FeatureShowcases";
import { USER_TYPE_OPTIONS } from "@/components/resume/types";
import { computeResumeHealth } from "@/components/resume/resumeInsights";
import { emptyResume } from "@/components/resume/types";
import { MODEL_STATS } from "@/lib/modelStats";
import { DartGuide, HeroDart } from "./Dart";
import { HeroDemo } from "./HeroDemo";

function Section({
  id,
  title,
  text,
  muted,
  children,
}: {
  id?: string;
  title: string;
  text?: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20 border-b border-border", muted && "bg-secondary/40")}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 data-dart-stop className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {text && <p className="mt-2 max-w-2xl text-muted-foreground">{text}</p>}
        </Reveal>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

const FEATURES = [
  {
    icon: PenLine,
    title: "Guided form",
    text: "Step-by-step sections for your resume type, with a live preview so you see every change.",
  },
  {
    icon: Sparkles,
    title: "AI writing help",
    text: "Draft a summary or rewrite a bullet point more clearly. Suggestions are optional.",
  },
  {
    icon: FileUp,
    title: "Import PDF or DOCX",
    text: "Upload an existing resume and the form is filled in for you to review and correct.",
  },
  {
    icon: Gauge,
    title: "Job match and strength",
    text: "See how your resume matches a job description and which keywords or sections are missing.",
  },
  {
    icon: LayoutTemplate,
    title: "30 templates, 5 colours",
    text: "Sidebars, banners, timelines and plain ATS layouts. Switch any time without losing content.",
  },
  {
    icon: History,
    title: "Saved versions",
    text: "Keep a version for each role, reopen it later, and download it in any format.",
  },
  {
    icon: Stethoscope,
    title: "Live resume health score",
    text: "A checklist scores your resume as you type and tells you exactly what to add next.",
  },
  {
    icon: Save,
    title: "Draft autosave",
    text: "Your work is kept in this browser while you type, so a closed tab never costs you progress.",
  },
  {
    icon: Keyboard,
    title: "Shortcuts and dark mode",
    text: "Save with Ctrl+S, print with Ctrl+P, and switch between light, dark or system themes.",
  },
  {
    icon: Smartphone,
    title: "Works on any screen",
    text: "A responsive layout that stays readable on phones, tablets and desktops.",
  },
];

const RESUME_TYPES = [
  {
    title: "School students",
    best: "Scholarships, competitions, first internships",
    sections: ["Career objective", "Education", "Skills", "Achievements and activities"],
  },
  {
    title: "College and freshers",
    best: "Campus placements and entry-level roles",
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
  {
    title: "Career changers",
    best: "Moving into a new field",
    sections: [
      "Professional summary",
      "Transferable skills",
      "Experience",
      "Projects",
      "Certifications",
      "Education",
    ],
  },
  {
    title: "Freelancers and consultants",
    best: "Independent work and client projects",
    sections: [
      "Professional summary",
      "Selected projects",
      "Skills",
      "Experience",
      "Certifications",
      "Education",
    ],
  },
  {
    title: "Senior leaders",
    best: "Executive and director-level roles",
    sections: [
      "Executive summary",
      "Experience",
      "Key achievements",
      "Skills",
      "Education",
      "Certifications",
    ],
  },
];

const STEPS = [
  [
    "Fill in the form",
    "Add your details, or import a PDF or DOCX to start faster.",
    ["Sections match your resume type", "Saved to your account as you go"],
  ],
  [
    "Pick a template",
    "Choose one of 30 layouts and a colour. Switch any time.",
    ["Live preview with a template switcher", "Same content in every layout"],
  ],
  [
    "Download",
    "Export as PDF, Word, JSON, plain text, Markdown or HTML.",
    ["PDF keeps text selectable", "Word follows the template layout"],
  ],
] as const;

const LOCAL_TOOLS = [
  "Resume strength with specific improvements",
  "Career-category match, ranked",
  "Job-description match: keywords and sections",
  "Skills that are common in your target category",
];
const WRITING_TOOLS = [
  "Import from PDF or DOCX",
  "Draft a professional summary",
  "Rewrite bullet points more clearly",
  "Tailor a resume to a job posting",
  "Cover letter, grammar check, interview questions, LinkedIn headline",
];

const FORMATS = [
  [
    "PDF",
    "For job applications",
    ["Selectable, searchable text", "Matches the preview exactly", "A4 with fonts embedded"],
  ],
  [
    "Word",
    "For further editing",
    ["Follows the template layout", "Uses the template colour and font", "Opens in Word and Docs"],
  ],
  [
    "JSON",
    "For backup",
    ["Every field you entered", "Includes template and colour", "Easy to keep or reuse"],
  ],
  [
    "Plain text",
    "For online forms",
    ["No formatting to break", "Paste into any portal", "Smallest file"],
  ],
  [
    "Markdown",
    "For notes and GitHub",
    ["Headings and bullet lists", "Works in any text editor", "Easy to version"],
  ],
  [
    "HTML",
    "For your own website",
    ["A standalone styled page", "Uses your template colour", "Opens in any browser"],
  ],
] as const;
const FORMAT_COUNT = FORMATS.length;

const CHECK_COUNT = computeResumeHealth(emptyResume).checks.length;

const STATS = [
  [30, "", "Templates", "15 layouts, each in sans and serif"],
  [USER_TYPE_OPTIONS.length, "", "Resume types", "From school students to senior leaders"],
  [FORMAT_COUNT, "", "Download formats", "PDF, Word, JSON, TXT, Markdown and HTML"],
  [MODEL_STATS.categories, "", "Job categories", "Used by the resume analysis"],
  [MODEL_STATS.top1Accuracy, "%", "Role-match accuracy", "Top match on held-out resumes"],
  [CHECK_COUNT, "", "Health checks", "Live feedback while you type"],
] as const;

const TIPS = [
  ["Keep it to one page", "Recruiters skim. Lead with your strongest, most recent items."],
  ["Show results, not duties", "Say what changed because of your work: numbers, scale, outcomes."],
  ["Match the job posting", "Use the same key terms the role uses, as long as they are true."],
  ["Use plain layouts for portals", "Many application systems read simple one-column files best."],
];

const PRIVACY = [
  [
    "Your resumes are tied to your account",
    "Only you can open, edit or export a resume you saved.",
  ],
  [
    "Text is not written to logs",
    "The app does not intentionally log resume bodies or provider credentials.",
  ],
  [
    "Suggestions never apply themselves",
    "AI output is shown for review and you choose what goes in.",
  ],
];

const FAQS = [
  [
    "Is it free to use?",
    "You can create an account and build resumes without paying. Writing tools depend on the site owner having set up a language-model provider.",
  ],
  [
    "Will AI suggestions change my resume automatically?",
    "No. Suggestions are optional and you decide whether to use them.",
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
    "How accurate is the resume analysis?",
    "It is a statistical model trained on a resume dataset, so treat scores as guidance rather than a hiring decision.",
  ],
  [
    "Which resume type should I choose?",
    "School for students with little experience, college for freshers with projects and internships, professional for people with work experience, career changer to lead with transferable skills, freelancer to lead with client projects, and senior leader for executive roles.",
  ],
  [
    "Can I use more than one resume?",
    "Yes. Save a separate version for each role and reopen any of them from your dashboard.",
  ],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {FAQS.map(([question, answer], index) => {
        const isOpen = open === index;
        return (
          <div key={question} className="toon toon-hover">
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
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LandingPage({ isStaff }: { isStaff: boolean }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLSpanElement>(null);
  const homeRef = useRef<HTMLSpanElement>(null);
  const [arrived, setArrived] = useState(false);
  const handleArrive = useCallback(() => setArrived(true), []);
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <GlowSection className="hero-stage overflow-hidden border-b border-border">
        <div ref={heroRef} className="relative">
          <div aria-hidden="true" className="hero-texture pointer-events-none absolute inset-0" />
          <HeroDart containerRef={heroRef} homeRef={homeRef} onLaunch={handleArrive} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div className="relative z-20">
              <p className="fade-up inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                30 templates · 6 resume types · 6 formats
              </p>
              <h1
                className="fade-up mt-6 text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl"
                style={{ animationDelay: "60ms" }}
              >
                Build a resume that is ready to <span className="hero-word">send.</span>
              </h1>
              <p
                className="fade-up mt-6 max-w-xl text-lg leading-8 text-muted-foreground"
                style={{ animationDelay: "140ms" }}
              >
                Fill in a guided form, choose from 30 templates, and download a clean PDF or Word
                file. Optional tools help with wording and show how your resume matches a job.
              </p>
              <div
                className="fade-up mt-9 flex flex-wrap items-center gap-4"
                style={{ animationDelay: "220ms" }}
              >
                <span
                  ref={ctaRef}
                  className="hero-cta inline-flex rounded-md"
                  data-arrived={arrived}
                >
                  <Button asChild size="lg" className="group h-12 px-8 text-base">
                    <Link to="/signup">
                      Create my resume
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </span>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
              <p
                className="fade-up mt-6 hidden text-xs text-muted-foreground sm:block"
                style={{ animationDelay: "300ms" }}
              >
                Psst, the dart is alive. Hover it, then give it a click.
              </p>
            </div>
            <div className="relative">
              <span
                ref={homeRef}
                aria-hidden="true"
                className="absolute -top-10 left-[6%] h-1 w-1 sm:-top-12"
              />
              <HeroDemo />
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-card/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:grid-cols-6">
            {STATS.map(([value, suffix, label, note]) => (
              <div key={label}>
                <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-primary">
                  <CountUp value={value} suffix={suffix} />
                </dd>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </dl>
        </div>
      </GlowSection>

      <Section
        id="features"
        title="Everything you need to finish a resume"
        text="From the first draft to the file you send, in one place."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal
              as="article"
              delay={index * 70}
              key={feature.title}
              className="toon toon-hover p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <FeatureShowcases />

      <Section
        title="Sections that fit where you are"
        text="Pick your resume type and the form asks only for what belongs on it."
        muted
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {RESUME_TYPES.map((type, index) => (
            <Reveal
              as="article"
              delay={index * 90}
              key={type.title}
              className="toon toon-hover p-6"
            >
              <h3 className="text-lg font-semibold">{type.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{type.best}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sections included
              </p>
              <Bullets items={type.sections} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="How it works">
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([title, text, points], index) => (
            <Reveal as="li" delay={index * 90} key={title} className="toon toon-hover group p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              <Bullets items={[...points]} />
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section
        title="Optional AI tools"
        text="Analysis runs on our own server. Writing tools use a language model if the site owner has set one up. Always check AI suggestions before using them."
        muted
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal as="article" className="toon toon-hover p-6">
            <h3 className="text-lg font-semibold">Resume analysis</h3>
            <p className="mt-1 text-sm font-medium text-primary">No API key needed</p>
            <Bullets items={LOCAL_TOOLS} />
            <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              Role match is right {MODEL_STATS.top1Accuracy}% of the time on held-out resumes, and{" "}
              {MODEL_STATS.top3Accuracy}% within its top three suggestions.
            </p>
            <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
              Scores come from a statistical model trained on a resume dataset. Use them as
              guidance, not as a hiring decision.
            </p>
          </Reveal>
          <Reveal as="article" delay={100} className="toon toon-hover p-6">
            <h3 className="text-lg font-semibold">Writing tools</h3>
            <p className="mt-1 text-sm font-medium text-primary">Needs a language-model provider</p>
            <Bullets items={WRITING_TOOLS} />
            <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
              Only the text needed for a request is sent to the provider. AI can be wrong, so never
              add qualifications you do not have.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section
        title="Compared with 24 job categories"
        text="The resume analysis checks how closely your resume resembles each of these fields and which skills are common in them."
      >
        <div className="flex flex-wrap gap-2">
          {categoryData.categories.map((category, index) => (
            <Reveal
              as="span"
              delay={(index % 8) * 40}
              key={category.value}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {category.label}
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Download in any format" muted>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FORMATS.map(([name, best, points], index) => (
            <Reveal as="article" delay={index * 80} key={name} className="toon toon-hover p-5">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{name}</h3>
              <p className="text-xs font-medium text-primary">{best}</p>
              <Bullets items={[...points]} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        title="Four habits of resumes that get read"
        text="Simple things that make the biggest difference."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {TIPS.map(([title, text], index) => (
            <Reveal delay={index * 80} key={title} className="toon toon-hover flex gap-4 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Your information stays in your hands" muted>
        <div className="grid gap-5 md:grid-cols-3">
          {PRIVACY.map(([title, text], index) => (
            <Reveal as="article" delay={index * 90} key={title} className="toon toon-hover p-5">
              <Check className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="faq" title="Questions">
        <div className="max-w-3xl">
          <Faq />
        </div>
      </Section>

      <section className="bg-primary text-primary-foreground">
        <Reveal className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 data-dart-stop className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to build yours?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-primary-foreground/80">
            Create an account, fill in the form and download a finished resume.
          </p>
          <Button asChild size="lg" variant="secondary" className="group mt-6 px-6">
            <Link to="/signup">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </section>

      <DartGuide heroRef={heroRef} />

      {isStaff && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <Button asChild variant="outline">
              <Link to="/admin-panel">Open Admin Panel</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
