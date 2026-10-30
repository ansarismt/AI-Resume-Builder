import "./Template12.css";
import type { ResumeData } from "./types";

export function Template12({ data }: { data: ResumeData }) {
  return (
    <article className="tpl12">
      <div className="tpl12__sidebar">
        <h2 className="tpl12__name">{data.name || "Your Name"}</h2>
        <div className="tpl12__contact">{data.email || "email"}</div>
        <hr />
        <h3>Skills</h3>
        <div>{data.skills || "skills"}</div>
      </div>
      <main className="tpl12__main">
        <section>
          <h3>Professional Summary</h3>
          <p>{data.summary || "Summary text."}</p>
        </section>
        <section>
          <h3>Experience</h3>
          <p>{data.experience || "Experience details."}</p>
        </section>
      </main>
    </article>
  );
}
