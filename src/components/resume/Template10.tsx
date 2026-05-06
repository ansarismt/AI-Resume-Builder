import "./Template10.css";
import type { ResumeData } from "./types";

export function Template10({ data }: { data: ResumeData }) {
  return (
    <article className="tpl10">
      <header className="tpl10__header">
        <h1 className="tpl10__name">{data.name || "Your Name"}</h1>
        <p className="tpl10__contact">{data.email || "you@email.com"}</p>
      </header>

      <section className="tpl10__summary">{data.summary || "Add a short professional summary."}</section>

      <div className="tpl10__grid">
        <div className="tpl10__left">
          <h2>Experience</h2>
          <div>{data.experience || "Add your work history."}</div>
        </div>
        <aside className="tpl10__right">
          <h3>Skills</h3>
          <div>{data.skills || "List your skills."}</div>
          <h3>Certifications</h3>
          <div>{data.certifications || "Add certifications."}</div>
        </aside>
      </div>
    </article>
  );
}
