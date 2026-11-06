import { createRoot } from "react-dom/client";

import sample from "../samples/sample_resume.json";
import { ResumeDocument } from "../src/components/resume/ResumeDocument";
import { TEMPLATE_CATALOG } from "../src/components/resume/templateCatalog";
import type { ResumeData } from "../src/components/resume/types";
import "./screenshots-gallery.css";

const resume: ResumeData = {
  ...sample,
  user_type: "college",
  detected_user_type: "college",
  template: "template1",
};

function EditorHero() {
  return (
    <>
      <header className="topbar">
        <strong>AI Resume Builder</strong>
        <span>Build a resume that feels like you</span>
      </header>
      <main className="editor-hero">
        <section className="editor-panel" aria-label="Resume editor">
          <p className="eyebrow">YOUR RESUME</p>
          <h1>Tell your story clearly.</h1>
          <p className="muted">A guided editor with an instant, polished preview.</p>
          <label>
            Full name
            <input value={resume.name} readOnly />
          </label>
          <label>
            Professional headline
            <input value={resume.headline} readOnly />
          </label>
          <label>
            Career objective
            <textarea value={resume.summary} readOnly />
          </label>
          <label>
            Skills
            <textarea value={resume.skills} readOnly />
          </label>
          <button type="button">Continue to templates</button>
        </section>
        <section className="live-preview" aria-label="Live resume preview">
          <div className="preview-title">
            <div>
              <p className="eyebrow">LIVE PREVIEW</p>
              <h2>{resume.title}</h2>
            </div>
            <span>College resume</span>
          </div>
          <ResumeDocument data={resume} accentColor={resume.accent_color} />
        </section>
      </main>
    </>
  );
}

function TemplateGallery() {
  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <p className="eyebrow">AI RESUME BUILDER</p>
        <h1>Find a layout that fits your next chapter.</h1>
        <p>Twenty thoughtful templates. One clear story: yours.</p>
      </header>
      <div className="template-gallery">
        {TEMPLATE_CATALOG.map((template) => (
          <article className="template-card" key={template.id}>
            <div className="sample-sheet">
              <div className="scaled-resume">
                <ResumeDocument
                  data={{ ...resume, template: template.id }}
                  accentColor={template.colors[0]}
                />
              </div>
            </div>
            <div className="template-label">
              <strong>{template.name}</strong>
              <span>
                {template.font} · {template.category}
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  new URLSearchParams(location.search).has("hero") ? <EditorHero /> : <TemplateGallery />,
);
