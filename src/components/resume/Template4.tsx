import "./Template4.css";
import type { ResumeData } from "./types";

export function Template4({ data }: { data: ResumeData }) {
  return (
    <article className="tpl4">
      <header className="tpl4__head">
        <h1 className="tpl4__name">{data.name || "Your Name"}</h1>
        <span className="tpl4__chip">CV</span>
      </header>
      <div className="tpl4__email">{data.email || "you@email.com"}</div>
      {data.summary && <p className="tpl4__summary">{data.summary}</p>}
      <div className="tpl4__cols">
        <div>
          <h2 className="tpl4__h">Experience</h2>
          <div className="tpl4__body">{data.experience || "Add your work history."}</div>
        </div>
        <div>
          <h2 className="tpl4__h">Skills</h2>
          <div className="tpl4__body">{data.skills || "List your skills."}</div>
          <h2 className="tpl4__h">Education</h2>
          <div className="tpl4__body">{data.education || "Add your education."}</div>
        </div>
      </div>
      <div className="tpl4__extras">
        <h2 className="tpl4__h">Internships</h2>
        <div className="tpl4__body">{data.internships || "Add your internship experience."}</div>
        <h2 className="tpl4__h">Projects</h2>
        <div className="tpl4__body">{data.projects || "Add your projects."}</div>
        <h2 className="tpl4__h">Achievements</h2>
        <div className="tpl4__body">{data.achievements || "Add your achievements."}</div>
        <h2 className="tpl4__h">Certifications</h2>
        <div className="tpl4__body">{data.certifications || "Add your certifications."}</div>
      </div>
    </article>
  );
}
