import "./Template2.css";
import type { ResumeData } from "./types";

export function Template2({ data }: { data: ResumeData }) {
  return (
    <article className="tpl2">
      <aside className="tpl2__sidebar">
        <h1 className="tpl2__name">{data.name || "Your Name"}</h1>
        <span className="tpl2__role">Resume</span>
        <p className="tpl2__email">{data.email || "you@email.com"}</p>

        <h3 className="tpl2__sideHeading">Skills</h3>
        <div className="tpl2__sideBody">{data.skills || "List your skills."}</div>

        <h3 className="tpl2__sideHeading">Education</h3>
        <div className="tpl2__sideBody">{data.education || "Add your education."}</div>
      </aside>

      <main className="tpl2__main">
        {data.summary && (
          <section className="tpl2__section">
            <h2 className="tpl2__heading">Summary</h2>
            <div className="tpl2__body">{data.summary}</div>
          </section>
        )}
        <section className="tpl2__section">
          <h2 className="tpl2__heading">Experience</h2>
          <div className="tpl2__body">{data.experience || "Add your work history."}</div>
        </section>

        <section className="tpl2__section">
          <h2 className="tpl2__heading">Internships</h2>
          <div className="tpl2__body">{data.internships || "Add your internship experience."}</div>
        </section>

        <section className="tpl2__section">
          <h2 className="tpl2__heading">Projects</h2>
          <div className="tpl2__body">{data.projects || "Add your projects."}</div>
        </section>

        <section className="tpl2__section">
          <h2 className="tpl2__heading">Achievements</h2>
          <div className="tpl2__body">{data.achievements || "Add your achievements."}</div>
        </section>

        <section className="tpl2__section">
          <h2 className="tpl2__heading">Certifications</h2>
          <div className="tpl2__body">{data.certifications || "Add your certifications."}</div>
        </section>
      </main>
    </article>
  );
}
