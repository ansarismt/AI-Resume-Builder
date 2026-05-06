import "./Template7.css";
import type { ResumeData } from "./types";

export function Template7({ data }: { data: ResumeData }) {
  return (
    <article className="tpl7">
      <header className="tpl7__header">
        <div className="tpl7__header-content">
          <h1 className="tpl7__name">{data.name || "Your Name"}</h1>
          <p className="tpl7__email">{data.email || "you@email.com"}</p>
        </div>
      </header>

      <div className="tpl7__body">
        {data.summary && (
          <section className="tpl7__section tpl7__summary-box">
            <p className="tpl7__summary">{data.summary}</p>
          </section>
        )}

        {data.experience && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Experience</h2>
            <div className="tpl7__content">{data.experience}</div>
          </section>
        )}

        {data.education && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Education</h2>
            <div className="tpl7__content">{data.education}</div>
          </section>
        )}

        {data.skills && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Skills</h2>
            <div className="tpl7__content">{data.skills}</div>
          </section>
        )}

        {data.projects && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Projects</h2>
            <div className="tpl7__content">{data.projects}</div>
          </section>
        )}

        {data.certifications && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Certifications</h2>
            <div className="tpl7__content">{data.certifications}</div>
          </section>
        )}

        {data.achievements && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Achievements</h2>
            <div className="tpl7__content">{data.achievements}</div>
          </section>
        )}

        {data.internships && (
          <section className="tpl7__section">
            <h2 className="tpl7__heading">Internships</h2>
            <div className="tpl7__content">{data.internships}</div>
          </section>
        )}
      </div>
    </article>
  );
}
