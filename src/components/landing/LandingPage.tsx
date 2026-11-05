import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SWATCHES = ["#1f3a5f", "#2f5d8a", "#4a5568", "#2d3436", "#111111"];

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
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {text && <p className="mt-2 max-w-2xl text-muted-foreground">{text}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function HeroResume() {
  const [accent, setAccent] = useState(SWATCHES[1]);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="toon bg-white p-6">
        <p className="text-xl font-bold" style={{ color: accent }}>
          Jordan Example
        </p>
        <p className="text-xs text-slate-500">Information Systems Student</p>
        <p className="mt-1 text-[0.65rem] text-slate-400">
          jordan.example@example.test · +1 555 010 2040
        </p>
        <div className="mt-3 h-0.5 w-full" style={{ background: accent }} />
        {[
          [
            "Career objective",
            "Curious information-systems student who turns complex data into clear tools.",
          ],
          ["Education", "BSc Information Systems · Example State University · 2023–2026"],
          ["Projects", "Community Data Explorer: accessible interface for public datasets."],
        ].map(([title, text]) => (
          <div key={title} className="mt-3">
            <p
              className="text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              {title}
            </p>
            <p className="mt-1 text-[0.7rem] leading-4 text-slate-600">{text}</p>
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["TypeScript", "React", "Python", "SQL"].map((skill) => (
            <span
              key={skill}
              className="rounded border border-slate-200 px-2 py-0.5 text-[0.62rem] text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div
        className="mt-5 flex items-center justify-center gap-2"
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
              "h-6 w-6 rounded-full border-2 border-white shadow ring-1 ring-border transition-transform hover:scale-110",
              accent === color && "ring-2 ring-primary",
            )}
            style={{ background: color }}
          />
        ))}
      </div>
    </div>
  );
}

const RESUME_TYPES = [
  [
    "School students",
    "Scholarships, competitions, first internships",
    "Career objective, education, skills, achievements",
  ],
  [
    "College and freshers",
    "Campus placements and entry-level roles",
    "Objective, education, skills, projects, internships, certifications, achievements",
  ],
  [
    "Working professionals",
    "Experienced hires and role changes",
    "Summary, experience, skills, certifications, education, projects",
  ],
];

const STEPS = [
  ["Fill in the form", "Add your details, or import a PDF or DOCX to start faster."],
  ["Pick a template", "Choose one of 20 layouts and a colour. Switch any time."],
  ["Download", "Export as PDF, Word, JSON or plain text."],
];

const FORMATS = [
  ["PDF", "For job applications. Selectable text, matches the preview."],
  ["Word", "For further editing. Follows the template layout and colour."],
  ["JSON", "For backup. Every field you entered."],
  ["Plain text", "For online forms. Paste anywhere."],
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
    "Yes. Upload a PDF or DOCX and the details are filled into the form for you to review.",
  ],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {FAQS.map(([question, answer], index) => {
        const isOpen = open === index;
        return (
          <div key={question} className="toon">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold"
            >
              {question}
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-primary transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LandingPage({ isStaff }: { isStaff: boolean }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Build a resume that is ready to send.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Fill in a guided form, choose from 20 templates, and download a clean PDF or Word
              file. Optional tools help with wording and show how your resume matches a job.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-6">
                <Link to="/signup">
                  Create my resume <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
            <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
              {[
                "20 templates and 5 colours",
                "School, college and professional resumes",
                "PDF, Word, JSON and TXT downloads",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <HeroResume />
        </div>
      </section>

      <Section
        title="Sections that fit where you are"
        text="Pick your resume type and the form asks only for what belongs on it."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {RESUME_TYPES.map(([title, best, sections]) => (
            <article key={title} className="toon p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{best}</p>
              <p className="mt-4 text-sm">{sections}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="How it works" muted>
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([title, text], index) => (
            <li key={title} className="toon p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Optional AI tools"
        text="Analysis runs on our own server. Writing tools use a language model if the site owner has set one up. Always check AI suggestions before using them."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <article className="toon p-6">
            <h3 className="text-lg font-semibold">Resume analysis</h3>
            <p className="mt-1 text-sm text-muted-foreground">No API key needed.</p>
            <p className="mt-4 text-sm">
              Resume strength, career-category match, job-description match and skills to explore.
            </p>
          </article>
          <article className="toon p-6">
            <h3 className="text-lg font-semibold">Writing tools</h3>
            <p className="mt-1 text-sm text-muted-foreground">Needs a language-model provider.</p>
            <p className="mt-4 text-sm">
              Import from PDF or DOCX, summaries, clearer bullet points, tailoring to a job, cover
              letters and more.
            </p>
          </article>
        </div>
      </Section>

      <Section title="Download in any format" muted>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FORMATS.map(([name, text]) => (
            <article key={name} className="toon p-5">
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Questions">
        <div className="max-w-3xl">
          <Faq />
        </div>
      </Section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to build yours?</h2>
          <p className="mx-auto mt-2 max-w-md text-primary-foreground/80">
            Create an account, fill in the form and download a finished resume.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 px-6">
            <Link to="/signup">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
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
