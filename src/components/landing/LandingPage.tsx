import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlowSection, Reveal } from "./effects";
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <h1 className="fade-up text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Build a resume that is ready to send.
            </h1>
            <p
              className="fade-up mt-5 max-w-lg text-base leading-7 text-muted-foreground"
              style={{ animationDelay: "100ms" }}
            >
              Fill in a guided form, choose from 20 templates, and download a clean PDF or Word
              file. Optional tools help with wording and show how your resume matches a job.
            </p>
            <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "200ms" }}>
              <Button asChild size="lg" className="group px-6">
                <Link to="/signup">
                  Create my resume
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>
          <HeroDemo />
        </div>
      </GlowSection>

      <Section
        title="Sections that fit where you are"
        text="Pick your resume type and the form asks only for what belongs on it."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {RESUME_TYPES.map(([title, best, sections], index) => (
            <Reveal as="article" delay={index * 90} key={title} className="toon toon-hover p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{best}</p>
              <p className="mt-4 text-sm">{sections}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="How it works" muted>
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([title, text], index) => (
            <Reveal as="li" delay={index * 90} key={title} className="toon toon-hover group p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section
        title="Optional AI tools"
        text="Analysis runs on our own server. Writing tools use a language model if the site owner has set one up. Always check AI suggestions before using them."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal as="article" className="toon toon-hover p-6">
            <h3 className="text-lg font-semibold">Resume analysis</h3>
            <p className="mt-1 text-sm text-muted-foreground">No API key needed.</p>
            <p className="mt-4 text-sm">
              Resume strength, career-category match, job-description match and skills to explore.
            </p>
          </Reveal>
          <Reveal as="article" delay={100} className="toon toon-hover p-6">
            <h3 className="text-lg font-semibold">Writing tools</h3>
            <p className="mt-1 text-sm text-muted-foreground">Needs a language-model provider.</p>
            <p className="mt-4 text-sm">
              Import from PDF or DOCX, summaries, clearer bullet points, tailoring to a job, cover
              letters and more.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section title="Download in any format" muted>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FORMATS.map(([name, text], index) => (
            <Reveal as="article" delay={index * 80} key={name} className="toon toon-hover p-5">
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
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
