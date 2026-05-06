import "./Template9.css";
import type { ResumeData } from "./types";

export function Template9({ data }: { data: ResumeData }) {
  return (
    <article className="tpl9">
      <header className="tpl9__header">
        <div className="tpl9__accent"></div>
        <h1 className="tpl9__name">{data.name || "Your Name"}</h1>
        <p className="tpl9__email">{data.email || "you@email.com"}</p>
      </header>

      <div className="tpl9__wrapper">
        {data.summary && (
          <section className="tpl9__section tpl9__highlight">
            <p className="tpl9__summary">{data.summary}</p>
          </section>
        )}

        {data.experience && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">01</span> Experience
            </h2>
            <div className="tpl9__content">{data.experience}</div>
          </section>
        )}

        {data.education && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">02</span> Education
            </h2>
            <div className="tpl9__content">{data.education}</div>
          </section>
        )}

        {data.skills && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">03</span> Skills
            </h2>
            <div className="tpl9__content">{data.skills}</div>
          </section>
        )}

        {data.projects && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">04</span> Projects
            </h2>
            <div className="tpl9__content">{data.projects}</div>
          </section>
        )}

        {data.certifications && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">05</span> Certifications
            </h2>
            <div className="tpl9__content">{data.certifications}</div>
          </section>
        )}

        {data.achievements && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">06</span> Achievements
            </h2>
            <div className="tpl9__content">{data.achievements}</div>
          </section>
        )}

        {data.internships && (
          <section className="tpl9__section">
            <h2 className="tpl9__heading">
              <span className="tpl9__number">07</span> Internships
            </h2>
            <div className="tpl9__content">{data.internships}</div>
          </section>
        )}
      </div>
    </article>
  );
}
