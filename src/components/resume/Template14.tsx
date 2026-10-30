import "./Template14.css";
import type { ResumeData } from "./types";

export function Template14({ data }: { data: ResumeData }) {
  return (
    <article className="tpl14">
      <div className="tpl14__header">
        <div>
          <h1>{data.name || "Your Name"}</h1>
          <div className="tpl14__small">{data.summary || "Title"}</div>
        </div>
        <div className="tpl14__contact">{data.email || "email"}</div>
      </div>

      <section className="tpl14__content">
        <h3>Profile</h3>
        <p>{data.summary || "Short profile here."}</p>
        <h3>Experience</h3>
        <p>{data.experience || "Experience."}</p>
      </section>
    </article>
  );
}
