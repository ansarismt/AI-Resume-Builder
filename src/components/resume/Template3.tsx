import "./Template3.css";
import type { ResumeData } from "./types";

export function Template3({ data }: { data: ResumeData }) {
  return (
    <article className="tpl3">
      <header className="tpl3__top">
        <h1 className="tpl3__name">{data.name || "Your Name"}</h1>
        <span className="tpl3__email">{data.email || "you@email.com"}</span>
      </header>

      {data.summary && (
        <div className="tpl3__row">
          <div className="tpl3__label">About</div>
          <div className="tpl3__value tpl3__summary">{data.summary}</div>
        </div>
      )}
      <div className="tpl3__row">
        <div className="tpl3__label">Experience</div>
        <div className="tpl3__value">{data.experience || "Add your work history."}</div>
      </div>
      <div className="tpl3__row">
        <div className="tpl3__label">Education</div>
        <div className="tpl3__value">{data.education || "Add your education."}</div>
      </div>
      <div className="tpl3__row">
        <div className="tpl3__label">Internships</div>
        <div className="tpl3__value">{data.internships || "Add your internship experience."}</div>
      </div>
      <div className="tpl3__row">
        <div className="tpl3__label">Projects</div>
        <div className="tpl3__value">{data.projects || "Add your projects."}</div>
      </div>
      <div className="tpl3__row">
        <div className="tpl3__label">Achievements</div>
        <div className="tpl3__value">{data.achievements || "Add your achievements."}</div>
      </div>
      <div className="tpl3__row">
        <div className="tpl3__label">Certifications</div>
        <div className="tpl3__value">{data.certifications || "Add your certifications."}</div>
      </div>
      <div className="tpl3__row">
        <div className="tpl3__label">Skills</div>
        <div className="tpl3__value">{data.skills || "List your skills."}</div>
      </div>
    </article>
  );
}