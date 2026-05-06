import "./Template13.css";
import type { ResumeData } from "./types";

export function Template13({ data }: { data: ResumeData }) {
  return (
    <article className="tpl13">
      <header>
        <h1 className="tpl13__name">{data.name || "Your Name"}</h1>
        <p className="tpl13__role">{data.summary || "Professional Title"}</p>
      </header>
      <section className="tpl13__block">
        <h2>Summary</h2>
        <p>{data.summary || "One-line summary."}</p>
      </section>
      <section className="tpl13__block">
        <h2>Experience</h2>
        <p>{data.experience || "Experience details."}</p>
      </section>
    </article>
  );
}
