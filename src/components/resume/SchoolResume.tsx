import type { ResumeData } from "./types";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm">
      <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-accent">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-foreground">{children}</div>
    </section>
  );
}

export function SchoolResume({ data }: { data: ResumeData }) {
  return (
    <article className="bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_20%,#f8fafc_100%)] p-6 sm:p-8">
      <header className="rounded-[28px] border border-border bg-white/90 p-6 shadow-sm">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">School Student Resume</p>
        <h1 className="mt-3 text-3xl font-display font-semibold tracking-tight text-foreground">
          {data.name || "Your Name"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data.email || "you@example.com"}
          {data.phone ? ` | ${data.phone}` : ""}
        </p>
      </header>

      <div className="mt-6 grid gap-4">
        <Block title="Career Objective">{data.summary || "Add a short objective about your academic goals and interests."}</Block>
        <Block title="Education">{data.education || "List your school, board, passing year, and notable subjects."}</Block>
        <Block title="Skills">{data.skills || "Add your communication, leadership, technical, or extracurricular skills."}</Block>
        <Block title="Achievements / Activities">{data.achievements || "Include competitions, clubs, sports, or awards."}</Block>
      </div>
    </article>
  );
}
