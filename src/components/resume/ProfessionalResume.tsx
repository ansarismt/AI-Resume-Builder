import type { ResumeData } from "./types";

function Block({
  title,
  content,
  primary = false,
}: {
  title: string;
  content: string;
  primary?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${primary ? "border-foreground/15 bg-slate-50" : "border-border/70 bg-white/90"}`}
    >
      <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-accent">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{content}</p>
    </section>
  );
}

export function ProfessionalResume({ data }: { data: ResumeData }) {
  return (
    <article className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_18%,#fdf7f1_100%)] p-6 sm:p-8">
      <header className="rounded-[28px] border border-border bg-white/90 p-6 shadow-sm">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">
          Working Professional Resume
        </p>
        <h1 className="mt-3 text-3xl font-display font-semibold tracking-tight text-foreground">
          {data.name || "Your Name"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data.email || "you@example.com"}
          {data.phone ? ` | ${data.phone}` : ""}
        </p>
      </header>

      <div className="mt-6 grid gap-4">
        <Block
          title="Professional Summary"
          content={
            data.summary ||
            "Write a concise summary of your experience, industry focus, and strengths."
          }
        />
        <Block
          title="Work Experience"
          content={
            data.experience ||
            "Add your most relevant roles, outcomes, leadership, and business impact."
          }
          primary
        />
        <Block
          title="Skills"
          content={data.skills || "List core technical, domain, and leadership skills."}
        />
        <Block
          title="Certifications"
          content={data.certifications || "Add professional certifications, licenses, or training."}
        />
        <Block
          title="Education"
          content={data.education || "Include your degree, institution, and graduation year."}
        />
      </div>
    </article>
  );
}
