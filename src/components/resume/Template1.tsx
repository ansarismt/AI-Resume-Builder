import "./Template1.css";
import type { ResumeData } from "./types";

export function Template1({ data }: { data: ResumeData }) {
  return (
    <article className="tpl1">
      <header className="tpl1__header">
        <h1 className="tpl1__name">{data.name || "Your Name"}</h1>
        <p className="tpl1__email">{data.email || "you@email.com"}</p>
      </header>

      {data.summary && (
        <section className="tpl1__section">
          <h2 className="tpl1__heading">Summary</h2>
          <p className="tpl1__summary">{data.summary}</p>
        </section>
      )}

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Experience</h2>
        <div className="tpl1__body">{data.experience || "Add your work history."}</div>
      </section>

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Education</h2>
        <div className="tpl1__body">{data.education || "Add your education."}</div>
      </section>

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Internships</h2>
        <div className="tpl1__body">{data.internships || "Add your internship experience."}</div>
      </section>

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Projects</h2>
        <div className="tpl1__body">{data.projects || "Add your projects."}</div>
      </section>

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Achievements</h2>
        <div className="tpl1__body">{data.achievements || "Add your achievements."}</div>
      </section>

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Certifications</h2>
        <div className="tpl1__body">{data.certifications || "Add your certifications."}</div>
      </section>

      <section className="tpl1__section">
        <h2 className="tpl1__heading">Skills</h2>
        <div className="tpl1__body">{data.skills || "List your skills."}</div>
      </section>
    </article>
  );
}