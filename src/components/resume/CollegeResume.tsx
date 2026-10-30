import type { ResumeData } from "./types";

function Block({
  title,
  content,
  accent = false,
}: {
  title: string;
  content: string;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${accent ? "border-accent/40 bg-accent/5" : "border-border/70 bg-white/90"}`}
    >
      <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-accent">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{content}</p>
    </section>
  );
}

export function CollegeResume({ data }: { data: ResumeData }) {
  return (
    <article className="bg-[linear-gradient(180deg,#f9fafb_0%,#ffffff_22%,#fff8ef_100%)] p-6 sm:p-8">
      <header className="rounded-[28px] border border-border bg-white/90 p-6 shadow-sm">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">
          College Student Resume
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
          title="Career Objective"
          content={
            data.summary ||
            "Add a short objective tailored to internships, placements, or fresher roles."
          }
        />
        <Block
          title="Education"
          content={
            data.education ||
            "List your degree, institution, graduation year, and coursework highlights."
          }
        />
        <Block
          title="Skills"
          content={data.skills || "Add technical tools, soft skills, and core subject strengths."}
        />
        <Block
          title="Projects"
          content={
            data.projects ||
            "Highlight academic or personal projects with impact and technologies used."
          }
          accent
        />
        <Block
          title="Internships"
          content={data.internships || "Add internships, training, or practical exposure here."}
        />
        <Block
          title="Certifications / Achievements"
          content={
            [data.certifications, data.achievements].filter(Boolean).join("\n\n") ||
            "Show certifications, awards, hackathons, or leadership achievements."
          }
        />
      </div>
    </article>
  );
}
