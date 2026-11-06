import { Link } from "@tanstack/react-router";
import {
  BrainCircuit,
  CheckCircle2,
  Circle,
  Download,
  FileUp,
  LayoutTemplate,
  Lightbulb,
  MessageSquare,
  Shuffle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TEMPLATE_CATALOG } from "@/components/resume/templateCatalog";
import { computeResumeHealth } from "@/components/resume/resumeInsights";
import { splitSkills } from "@/components/resume/resumeUtils";
import type { ResumeData, TemplateId } from "@/components/resume/types";
import { cn } from "@/lib/utils";
import { ApplicationTracker } from "./ApplicationTracker";
import { ACTION_VERBS, CAREER_TIPS, INTERVIEW_QUESTIONS } from "./dashboardContent";

function Block({
  id,
  title,
  text,
  children,
}: {
  id?: string;
  title: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="toon scroll-mt-24 h-full p-5 sm:p-7 no-print">
      <h3 className="font-display text-lg font-bold sm:text-xl">{title}</h3>
      {text && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{text}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {text && <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className="toon-chip px-3 py-1 text-xs"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

interface Props {
  data: ResumeData;
  username: string | null;
  savedCount: number;
  onNew: () => void;
  onGoToStage: (stage: "templates" | "finalize") => void;
  onPickTemplate: (template: TemplateId) => void;
}

export function DashboardSections({
  data,
  username,
  savedCount,
  onNew,
  onGoToStage,
  onPickTemplate,
}: Props) {
  const [applicationCount, setApplicationCount] = useState(0);
  const handleApplicationCount = useCallback((count: number) => setApplicationCount(count), []);
  const health = useMemo(() => computeResumeHealth(data), [data]);

  const quickActions = [
    {
      icon: FileUp,
      title: "Import a resume",
      text: "Upload a PDF or DOCX and fill the form automatically.",
      onClick: () => {
        onNew();
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    },
    {
      icon: LayoutTemplate,
      title: "Browse templates",
      text: "Compare 30 layouts and colours on your own content.",
      onClick: () => onGoToStage("templates"),
    },
    {
      icon: Download,
      title: "Export and download",
      text: "Get PDF, Word, JSON or plain text.",
      onClick: () => onGoToStage("finalize"),
    },
  ];

  const checklist = [
    { label: "Add your name and email", done: Boolean(data.name.trim() && data.email.trim()) },
    { label: "Write a professional summary", done: data.summary.trim().length >= 80 },
    { label: "List at least six skills", done: splitSkills(data.skills).length >= 6 },
    { label: "Reach a health score of 75", done: health.score >= 75 },
    { label: "Save a resume to your account", done: savedCount > 0 },
    { label: "Track your first application", done: applicationCount > 0 },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  const categories = useMemo(
    () => ["All", ...new Set(TEMPLATE_CATALOG.map((t) => t.category))],
    [],
  );
  const [category, setCategory] = useState("All");
  const templates = TEMPLATE_CATALOG.filter((t) => category === "All" || t.category === category);

  const [verbGroup, setVerbGroup] = useState("Leadership");
  const [questionGroup, setQuestionGroup] = useState("Behavioural");
  const [questionIndex, setQuestionIndex] = useState(0);
  const questions = INTERVIEW_QUESTIONS[questionGroup];

  const copyVerb = async (verb: string) => {
    try {
      await navigator.clipboard.writeText(verb);
      toast.success(`Copied "${verb}"`);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  };

  return (
    <div className="space-y-16">
      <div id="toolkit" className="scroll-mt-24 space-y-6 no-print">
        <SectionHeader
          eyebrow="Career toolkit"
          title="Plan your job search"
          text="Jump to the next task, see how close you are to interview-ready, and keep every application in one place."
        />
        <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/ai-studio" className="toon toon-hover flex flex-col gap-2 p-5">
            <span className="toon-icon">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="font-semibold">AI Studio</span>
            <span className="text-sm text-muted-foreground">
              Strength feedback, role matches and job-description comparison.
            </span>
          </Link>
          {quickActions.map(({ icon: Icon, title, text, onClick }) => (
            <button
              key={title}
              type="button"
              onClick={onClick}
              className="toon toon-hover flex flex-col items-start gap-2 p-5 text-left"
            >
              <span className="toon-icon">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-semibold">{title}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </button>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-stretch">
          <Block
            title="Interview-ready checklist"
            text={`${doneCount} of ${checklist.length} steps complete.`}
          >
            <div
              className="mb-4 h-2 overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={checklist.length}
              aria-valuenow={doneCount}
              aria-label="Checklist progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="space-y-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={cn(item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          <Block
            id="application-tracker"
            title="Application tracker"
            text="Keep track of every job you apply to, from saved to offer."
          >
            <ApplicationTracker username={username} onCount={handleApplicationCount} />
          </Block>
        </div>
      </div>

      <div id="resources" className="scroll-mt-24 space-y-6 no-print">
        <SectionHeader
          eyebrow="Resources"
          title="Write better, interview with confidence"
          text="Browse layouts, borrow strong verbs, rehearse common questions and pick up practical advice."
        />
        <Block
          title="Template showcase"
          text="Pick a layout and your resume switches to it straight away."
        >
          <Chips options={categories} value={category} onChange={setCategory} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => {
              const selected = data.template === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    onPickTemplate(template.id);
                    toast.success(`${template.name} selected`);
                  }}
                  className={cn(
                    "toon toon-hover p-4 text-left",
                    selected && "border-primary ring-1 ring-primary",
                  )}
                >
                  <div className="flex gap-1.5">
                    {template.colors.slice(0, 5).map((color) => (
                      <span
                        key={color}
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-semibold">{template.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {template.category} · {template.layout.replace("-", " ")}
                  </p>
                </button>
              );
            })}
          </div>
        </Block>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <Block
            title="Action verb bank"
            text="Start each bullet with a strong verb. Click one to copy it."
          >
            <Chips options={Object.keys(ACTION_VERBS)} value={verbGroup} onChange={setVerbGroup} />
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTION_VERBS[verbGroup].map((verb) => (
                <button
                  key={verb}
                  type="button"
                  onClick={() => copyVerb(verb)}
                  className="rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {verb}
                </button>
              ))}
            </div>
          </Block>

          <Block
            title="Interview practice"
            text="Pick a category and rehearse your answer aloud using the STAR method."
          >
            <Chips
              options={Object.keys(INTERVIEW_QUESTIONS)}
              value={questionGroup}
              onChange={(group) => {
                setQuestionGroup(group);
                setQuestionIndex(0);
              }}
            />
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4">
              <p className="flex items-start gap-2 text-sm font-medium leading-6">
                <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {questions[questionIndex % questions.length]}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Situation, Task, Action, Result: keep each answer under two minutes.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setQuestionIndex((index) => (index + 1) % questions.length)}
              >
                <Shuffle className="mr-1.5 h-3.5 w-3.5" />
                Next
              </Button>
            </div>
          </Block>
        </div>

        <Block title="Career tips" text="Small changes that make a resume easier to say yes to.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_TIPS.map((tip) => (
              <article key={tip.title} className="rounded-lg border border-border p-4">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h4 className="mt-2 text-sm font-semibold">{tip.title}</h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{tip.text}</p>
              </article>
            ))}
          </div>
        </Block>
      </div>
    </div>
  );
}
