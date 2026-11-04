import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResumeDocument } from "./ResumeDocument";
import { emptyResume, type UserType } from "./types";
import { splitSkills } from "./resumeUtils";

describe("splitSkills", () => {
  it("preserves commas inside parentheses and splits bullets and separators", () => {
    expect(splitSkills("Python (pandas, NumPy), SQL\n• Data modeling")).toEqual([
      "Python (pandas, NumPy)",
      "SQL",
      "Data modeling",
    ]);
  });
});

describe("ResumeDocument", () => {
  it.each([
    ["school", ["Career Objective", "Education", "Skills", "Achievements / Activities"]],
    [
      "college",
      ["Career Objective", "Education", "Skills", "Projects", "Internships", "Certifications"],
    ],
    [
      "professional",
      ["Professional Summary", "Experience", "Skills", "Certifications", "Education", "Projects"],
    ],
  ] as Array<[UserType, string[]]>)("renders the %s sections", (userType, headings) => {
    render(
      <ResumeDocument
        data={{
          ...emptyResume,
          name: "Test Candidate",
          user_type: userType,
          headline: "Lead analyst",
          job_title_target: "INFORMATION-TECHNOLOGY",
        }}
      />,
    );

    for (const heading of headings) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText("Lead analyst")).toBeInTheDocument();
    expect(screen.queryByText("INFORMATION-TECHNOLOGY")).not.toBeInTheDocument();
    expect(document.querySelector(".rd__section--empty")).toBeInTheDocument();
  });

  it("hides empty sections only in print styles", () => {
    const resumeStyles = readFileSync(
      resolve(process.cwd(), "src/components/resume/ResumeDocument.css"),
      "utf8",
    );
    const printStyles = resumeStyles.slice(resumeStyles.lastIndexOf("@media print"));

    expect(printStyles).toContain(".rd__section--empty");
    expect(printStyles).toContain("display: none");
    expect(resumeStyles).toContain(".rd__section--empty");
  });
});
