import "./Template8.css";
import type { ResumeData } from "./types";

export function Template8({ data }: { data: ResumeData }) {
  return (
    <article className="tpl8">
      <header className="tpl8__header">
        <h1 className="tpl8__name">{data.name || "Your Name"}</h1>
        <p className="tpl8__email">{data.email || "you@email.com"}</p>
      </header>

      {data.summary && (
        <section className="tpl8__section tpl8__summary">
          <p className="tpl8__summary-text">{data.summary}</p>
        </section>
      )}

      <div className="tpl8__columns">
        <div className="tpl8__column">
          {data.experience && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Experience</h2>
              <p className="tpl8__text">{data.experience}</p>
            </section>
          )}

          {data.projects && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Projects</h2>
              <p className="tpl8__text">{data.projects}</p>
            </section>
          )}
        </div>

        <div className="tpl8__column">
          {data.education && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Education</h2>
              <p className="tpl8__text">{data.education}</p>
            </section>
          )}

          {data.skills && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Skills</h2>
              <p className="tpl8__text">{data.skills}</p>
            </section>
          )}

          {data.certifications && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Certifications</h2>
              <p className="tpl8__text">{data.certifications}</p>
            </section>
          )}

          {data.achievements && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Achievements</h2>
              <p className="tpl8__text">{data.achievements}</p>
            </section>
          )}

          {data.internships && (
            <section className="tpl8__section">
              <h2 className="tpl8__heading">Internships</h2>
              <p className="tpl8__text">{data.internships}</p>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
