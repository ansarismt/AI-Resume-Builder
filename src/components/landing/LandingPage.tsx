import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  FileUp,
  Gauge,
  History,
  LayoutTemplate,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import categoryData from "../../../shared/categories.json";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CountUp, GlowSection, Reveal } from "./effects";
import { HeroDemo } from "./HeroDemo";

function Section({
  title,
  text,
  muted,
  children,
}: {
  title: string;
  text?: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border-b border-border", muted && "bg-secondary/40")}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
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

const STATS = [
  [20, "", "Templates", "10 layouts, each in sans and serif"],
  [3, "", "Resume types", "School, college and professional"],
  [4, "", "Download formats", "PDF, Word, JSON and plain text"],
  [24, "", "Job categories", "Used by the resume analysis"],
] as const;

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
    title: "20 templates, 5 colours",
    text: "Sidebars, banners, timelines and plain ATS layouts. Switch any time without losing content.",
  },
  {
    icon: History,
    title: "Saved versions",
    text: "Keep a version for each role, reopen it later, and download it in any format.",
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
];

const STEPS = [
  [
    "Fill in the form",
    "Add your details, or import a PDF or DOCX to start faster.",
    ["Sections match your resume type", "Saved to your account as you go"],
  ],
  [
    "Pick a template",
    "Choose one of 20 layouts and a colour. Switch any time.",
    ["Live preview with a template switcher", "Same content in every layout"],
  ],
  [
    "Download",
    "Export as PDF, Word, JSON or plain text.",
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
    "School for students with little experience, college for freshers with projects and internships, professional for people with work experience.",
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
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <GlowSection className="overflow-hidden border-b border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="fade-up text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Build a resume that is ready to send.
            </h1>
            <p
              className="fade-up mt-6 max-w-xl text-lg leading-8 text-muted-foreground"
              style={{ animationDelay: "100ms" }}
            >
              Fill in a guided form, choose from 20 templates, and download a clean PDF or Word
              file. Optional tools help with wording and show how your resume matches a job.
            </p>
            <div className="fade-up mt-8 flex flex-wrap gap-4" style={{ animationDelay: "200ms" }}>
              <Button asChild size="lg" className="group h-12 px-8 text-base">
                <Link to="/signup">
                  Create my resume
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>
          <HeroDemo />
        </div>
        <div className="border-t border-border bg-card/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
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

      <Section
        title="Sections that fit where you are"
        text="Pick your resume type and the form asks only for what belongs on it."
        muted
      >
        <div className="grid gap-5 md:grid-cols-3">
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <Section title="Questions">
        <div className="max-w-3xl">
          <Faq />
        </div>
      </Section>

      <section className="bg-primary text-primary-foreground">
        <Reveal className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to build yours?</h2>
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
