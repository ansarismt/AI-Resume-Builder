import "./Template11.css";
import type { ResumeData } from "./types";

export function Template11({ data }: { data: ResumeData }) {
  return (
    <article className="tpl11">
      <header className="tpl11__header">
        <h1 className="tpl11__name">{data.name || "Your Name"}</h1>
        <p className="tpl11__meta">{data.email || "email"}</p>
      </header>

      <section className="tpl11__body">
        <div className="tpl11__col">
          <h2>Profile</h2>
          <p>{data.summary || "Short profile."}</p>

          <h2>Education</h2>
          <p>{data.education || "Your education."}</p>
        </div>
        <div className="tpl11__col">
          <h2>Skills</h2>
          <p>{data.skills || "Skill list."}</p>

          <h2>Experience</h2>
          <p>{data.experience || "Job history."}</p>
        </div>
      </section>
    </article>
  );
}
