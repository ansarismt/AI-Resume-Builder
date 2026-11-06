import { describe, expect, it } from "vitest";

import { emptyResume, type ResumeData } from "@/components/resume/types";
import { resumeToHtml, resumeToMarkdown } from "./clientExports";

const resume: ResumeData = {
  ...emptyResume,
  name: "Jordan <Example>",
  email: "jordan@example.com",
  headline: "Data Analyst",
  user_type: "professional",
  summary: "Analyst who builds dashboards.",
  skills: "SQL, Tableau, Python",
  experience: "- Built a pipeline\n- Led a team of 4",
};

describe("client exports", () => {
  it("writes markdown with headings and bullets", () => {
    const md = resumeToMarkdown(resume);
    expect(md).toContain("# Jordan <Example>");
    expect(md).toContain("## Professional Summary");
    expect(md).toContain("SQL, Tableau, Python");
    expect(md).toContain("- Built a pipeline");
  });

  it("skips empty sections", () => {
    expect(resumeToMarkdown(resume)).not.toContain("## Projects");
  });

  it("escapes HTML and keeps lists", () => {
    const html = resumeToHtml(resume, "#1f3a5f");
    expect(html).toContain("Jordan &lt;Example&gt;");
    expect(html).not.toContain("<Example>");
    expect(html).toContain("<li>Built a pipeline</li>");
    expect(html).toContain("<span>Tableau</span>");
  });

  it("falls back to a safe colour", () => {
    expect(resumeToHtml(resume, "red;}</style>")).toContain("#1f3a5f");
  });
});
