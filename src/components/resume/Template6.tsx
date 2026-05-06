import "./Template6.css";
import type { ResumeData } from "./types";

export function Template6({ data }: { data: ResumeData }) {
  return (
    <article className="tpl6">
      <div className="tpl6__container">
        {/* Sidebar */}
        <aside className="tpl6__sidebar">
          <div className="tpl6__profile">
            <h1 className="tpl6__name">{data.name || "Your Name"}</h1>
            <p className="tpl6__email">{data.email || "you@email.com"}</p>
          </div>

          {data.skills && (
            <section className="tpl6__section">
              <h3 className="tpl6__heading">Skills</h3>
              <p className="tpl6__content">{data.skills}</p>
            </section>
          )}

          {data.certifications && (
            <section className="tpl6__section">
              <h3 className="tpl6__heading">Certifications</h3>
              <p className="tpl6__content">{data.certifications}</p>
            </section>
          )}

          {data.achievements && (
            <section className="tpl6__section">
              <h3 className="tpl6__heading">Achievements</h3>
              <p className="tpl6__content">{data.achievements}</p>
            </section>
          )}
        </aside>

        {/* Main Content */}
        <main className="tpl6__main">
          {data.summary && (
            <section className="tpl6__section tpl6__summary-section">
              <p className="tpl6__summary">{data.summary}</p>
            </section>
          )}

          {data.experience && (
            <section className="tpl6__section">
              <h2 className="tpl6__title">Experience</h2>
              <p className="tpl6__text">{data.experience}</p>
            </section>
          )}

          {data.education && (
            <section className="tpl6__section">
              <h2 className="tpl6__title">Education</h2>
              <p className="tpl6__text">{data.education}</p>
            </section>
          )}

          {data.internships && (
            <section className="tpl6__section">
              <h2 className="tpl6__title">Internships</h2>
              <p className="tpl6__text">{data.internships}</p>
            </section>
          )}

          {data.projects && (
            <section className="tpl6__section">
              <h2 className="tpl6__title">Projects</h2>
              <p className="tpl6__text">{data.projects}</p>
            </section>
          )}
        </main>
      </div>
    </article>
  );
}
