import type { ResumeData } from "./types";

function Section({ title, content }: { title: string; content: string }) {
  if (!content.trim()) return null;

  return (
    <section className="rounded-2xl border border-border/70 bg-white/80 p-5 shadow-sm">
      <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-accent">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{content}</p>
    </section>
  );
}

function getLabel(userType: ResumeData["user_type"]) {
  if (userType === "school") return "School Student";
  if (userType === "college") return "College Student";
  return "Working Professional";
}

function getSections(data: ResumeData) {
  if (data.user_type === "school") {
    return [
      { key: "objective", title: "Objective", content: data.summary },
      { key: "education", title: "Education", content: data.education },
      { key: "skills", title: "Skills", content: data.skills },
      { key: "achievements", title: "Achievements", content: data.achievements },
    ];
  }

  if (data.user_type === "college") {
    return [
      { key: "profile", title: "Profile", content: data.summary },
      { key: "projects", title: "Projects", content: data.projects },
      { key: "internships", title: "Internships", content: data.internships },
      { key: "education", title: "Education", content: data.education },
      { key: "skills", title: "Skills", content: data.skills },
    ];
  }

  return [
    { key: "summary", title: "Professional Summary", content: data.summary },
    { key: "experience", title: "Experience", content: data.experience },
    { key: "skills", title: "Skills", content: data.skills },
    { key: "certifications", title: "Certifications", content: data.certifications },
    { key: "education", title: "Education", content: data.education },
  ];
}

export function UserTypeResumePreview({ data }: { data: ResumeData }) {
  const sections = getSections(data);

  return (
    <article className="bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_20%,#f8fafc_100%)] p-6 sm:p-8">
      <header className="rounded-[28px] border border-border bg-white/90 p-6 shadow-sm">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">{getLabel(data.user_type)}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
              {data.name || "Your Name"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.email || "you@example.com"}
              {data.phone ? ` | ${data.phone}` : ""}
            </p>
          </div>
          <div className="max-w-xs rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
            {data.user_type === "school"
              ? "Objective and education stay front and center for school opportunities."
              : data.user_type === "college"
              ? "Projects and internships are highlighted for campus and entry-level roles."
              : "Experience moves to the top to support professional applications."}
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-4">
        {sections.map((section) => (
          <Section key={section.key} title={section.title} content={section.content} />
        ))}
      </div>
    </article>
  );
}
