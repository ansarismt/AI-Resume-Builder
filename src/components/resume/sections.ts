import type { UserType } from "./types";

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "internships"
  | "projects"
  | "achievements"
  | "certifications"
  | "skills";

export interface SectionDef {
  key: SectionKey;
  title: string;
  placeholder: string;
}

const SUMMARY_PLACEHOLDER = "Add a short summary.";

// Section order and titles mirror the PDF/DOCX exports in resumes/exports.py,
// so the on-screen preview matches the downloaded file.
export const SECTION_SETS: Record<UserType, SectionDef[]> = {
  school: [
    { key: "summary", title: "Career Objective", placeholder: SUMMARY_PLACEHOLDER },
    { key: "education", title: "Education", placeholder: "Add your education." },
    { key: "skills", title: "Skills", placeholder: "List your skills." },
    {
      key: "achievements",
      title: "Achievements / Activities",
      placeholder: "Add your achievements and activities.",
    },
  ],
  college: [
    { key: "summary", title: "Career Objective", placeholder: SUMMARY_PLACEHOLDER },
    { key: "education", title: "Education", placeholder: "Add your education." },
    { key: "skills", title: "Skills", placeholder: "List your skills." },
    { key: "projects", title: "Projects", placeholder: "Add your projects." },
    { key: "internships", title: "Internships", placeholder: "Add your internships." },
    { key: "certifications", title: "Certifications", placeholder: "Add your certifications." },
    { key: "achievements", title: "Achievements", placeholder: "Add your achievements." },
  ],
  professional: [
    { key: "summary", title: "Professional Summary", placeholder: SUMMARY_PLACEHOLDER },
    { key: "experience", title: "Experience", placeholder: "Add your work history." },
    { key: "skills", title: "Skills", placeholder: "List your skills." },
    { key: "certifications", title: "Certifications", placeholder: "Add your certifications." },
    { key: "education", title: "Education", placeholder: "Add your education." },
    { key: "projects", title: "Projects", placeholder: "Add your projects." },
  ],
  career_changer: [
    { key: "summary", title: "Professional Summary", placeholder: SUMMARY_PLACEHOLDER },
    { key: "skills", title: "Transferable Skills", placeholder: "List your skills." },
    { key: "experience", title: "Experience", placeholder: "Add your work history." },
    { key: "projects", title: "Projects", placeholder: "Add your projects." },
    { key: "certifications", title: "Certifications", placeholder: "Add your certifications." },
    { key: "education", title: "Education", placeholder: "Add your education." },
  ],
  freelancer: [
    { key: "summary", title: "Professional Summary", placeholder: SUMMARY_PLACEHOLDER },
    { key: "projects", title: "Selected Projects", placeholder: "Add your client projects." },
    { key: "skills", title: "Skills", placeholder: "List your skills." },
    { key: "experience", title: "Experience", placeholder: "Add your work history." },
    { key: "certifications", title: "Certifications", placeholder: "Add your certifications." },
    { key: "education", title: "Education", placeholder: "Add your education." },
  ],
  executive: [
    { key: "summary", title: "Executive Summary", placeholder: SUMMARY_PLACEHOLDER },
    { key: "experience", title: "Experience", placeholder: "Add your work history." },
    { key: "achievements", title: "Key Achievements", placeholder: "Add your achievements." },
    { key: "skills", title: "Skills", placeholder: "List your skills." },
    { key: "education", title: "Education", placeholder: "Add your education." },
    { key: "certifications", title: "Certifications", placeholder: "Add your certifications." },
  ],
};
