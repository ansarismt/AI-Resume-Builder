import { describe, expect, it } from "vitest";

import {
  computeResumeHealth,
  countWords,
  formatRelativeTime,
  hasContent,
  resumeToPlainText,
} from "./resumeInsights";
import { emptyResume, type ResumeData } from "./types";

const strong: ResumeData = {
  ...emptyResume,
  name: "Jordan Example",
  email: "jordan@example.com",
  phone: "+1 555 0100",
  location: "Chennai",
  user_type: "professional",
  job_title_target: "Data Analyst",
  links: { linkedin: "https://linkedin.com/in/jordan" },
  summary:
    "Data analyst with five years of experience turning messy operational data into clear dashboards that help teams decide faster and spend less on reporting every month.",
  skills: "SQL, Tableau, Python, Excel, Statistics, Power BI",
  experience:
    "Built a reporting pipeline that reduced manual work by 40% across three teams. Led a team of 4 analysts and delivered weekly insights to leadership every single week. Automated monthly forecasting reports for finance and operations stakeholders across the company.",
  education: "B.Sc Statistics, Anna University, 2019",
};

describe("computeResumeHealth", () => {
  it("scores an empty resume low", () => {
    const health = computeResumeHealth(emptyResume);
    expect(health.score).toBeLessThan(15);
    expect(health.level).toBe("Getting started");
  });

  it("flags missing sections", () => {
    const health = computeResumeHealth(emptyResume);
    expect(health.checks.filter((check) => !check.passed).length).toBeGreaterThan(8);
  });

  it("rewards a complete resume", () => {
    const health = computeResumeHealth(strong);
    expect(health.checks.find((c) => c.id === "email")?.passed).toBe(true);
    expect(health.checks.find((c) => c.id === "numbers")?.passed).toBe(true);
    expect(health.score).toBeGreaterThanOrEqual(75);
  });

  it("has at least 30 checks", () => {
    expect(computeResumeHealth(emptyResume).checks.length).toBeGreaterThanOrEqual(30);
  });

  it("flags weak phrases and first-person summaries", () => {
    const health = computeResumeHealth({
      ...strong,
      summary: "I am a hard worker and my goal is to grow in a data role within a great team.",
      experience: "Responsible for reports every week.",
    });
    expect(health.checks.find((c) => c.id === "voice")?.passed).toBe(false);
    expect(health.checks.find((c) => c.id === "weak")?.passed).toBe(false);
  });

  it("rejects an invalid email", () => {
    const health = computeResumeHealth({ ...strong, email: "not-an-email" });
    expect(health.checks.find((c) => c.id === "email")?.passed).toBe(false);
  });
});

describe("helpers", () => {
  it("counts words", () => {
    expect(countWords("  one two\nthree ")).toBe(3);
    expect(countWords("")).toBe(0);
  });

  it("builds plain text with headings", () => {
    const text = resumeToPlainText(strong);
    expect(text.startsWith("Jordan Example")).toBe(true);
    expect(text).toContain("SKILLS\nSQL, Tableau");
    expect(text).not.toContain("INTERNSHIPS");
  });

  it("detects draft content", () => {
    expect(hasContent(emptyResume)).toBe(false);
    expect(hasContent({ ...emptyResume, name: "A" })).toBe(true);
  });

  it("formats relative time", () => {
    const now = Date.parse("2026-01-10T12:00:00Z");
    expect(formatRelativeTime("2026-01-10T11:59:40Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-01-10T11:30:00Z", now)).toBe("30 min ago");
    expect(formatRelativeTime("2026-01-10T09:00:00Z", now)).toBe("3 h ago");
    expect(formatRelativeTime("2026-01-08T12:00:00Z", now)).toBe("2 days ago");
    expect(formatRelativeTime(undefined, now)).toBe("");
  });
});
