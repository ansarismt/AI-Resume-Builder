import "./Template5.css";
import type { ResumeData } from "./types";

export function Template5({ data }: { data: ResumeData }) {
  return (
    <article className="tpl5">
      <h1 className="tpl5__name">{data.name || "Your Name"}</h1>
      <p className="tpl5__email">{data.email || "you@email.com"}</p>

      {data.summary && (
        <>
          <h2 className="tpl5__h">Summary</h2>
          <p className="tpl5__summary">{data.summary}</p>
        </>
      )}

      <h2 className="tpl5__h">experience</h2>
      <div className="tpl5__body">{data.experience || "Add your work history."}</div>

      <h2 className="tpl5__h">skills</h2>
      <div className="tpl5__body">{data.skills || "List your skills."}</div>

      <h2 className="tpl5__h">education</h2>
      <div className="tpl5__body">{data.education || "Add your education."}</div>

      <h2 className="tpl5__h">internships</h2>
      <div className="tpl5__body">{data.internships || "Add your internship experience."}</div>

      <h2 className="tpl5__h">projects</h2>
      <div className="tpl5__body">{data.projects || "Add your projects."}</div>

      <h2 className="tpl5__h">achievements</h2>
      <div className="tpl5__body">{data.achievements || "Add your achievements."}</div>

      <h2 className="tpl5__h">certifications</h2>
      <div className="tpl5__body">{data.certifications || "Add your certifications."}</div>
    </article>
  );
}
