export type TemplateId =
  | "template1"
  | "template2"
  | "template3"
  | "template4"
  | "template5"
  | "template6"
  | "template7"
  | "template8"
  | "template9"
  | "template10"
  | "template11"
  | "template12"
  | "template13"
  | "template14";

export const TEMPLATE_IDS: TemplateId[] = [
  "template1",
  "template2",
  "template3",
  "template4",
  "template5",
  "template6",
  "template7",
  "template8",
  "template9",
  "template10",
  "template11",
  "template12",
  "template13",
  "template14",
];

export type UserType = "school" | "college" | "professional";

export const USER_TYPE_OPTIONS: Array<{ value: UserType; label: string; description: string }> = [
  {
    value: "school",
    label: "School Student",
    description: "Best for 10th or 12th learners with no work experience.",
  },
  {
    value: "college",
    label: "College Student",
    description: "Best for college learners, freshers, projects, and internships.",
  },
  {
    value: "professional",
    label: "Working Professional",
    description: "Best for candidates with real work experience.",
  },
];

export const HIGHEST_EDUCATION_OPTIONS = [
  "10th",
  "12th",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
] as const;

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  user_type: UserType;
  detected_user_type: UserType;
  highest_education: string;
  is_studying: boolean;
  years_of_experience: number;
  skills: string;
  experience: string;
  education: string;
  internships: string;
  achievements: string;
  projects: string;
  certifications: string;
  summary: string;
  template: TemplateId;
  title?: string;
  job_title_target?: string;
  links?: { linkedin?: string; github?: string; portfolio?: string };
  location?: string;
}

export interface SavedResume extends ResumeData {
  id: string;
  created_at: string;
  updated_at?: string;
  parent?: number | null;
  is_archived?: boolean;
}

export const emptyResume: ResumeData = {
  name: "",
  email: "",
  phone: "",
  user_type: "college",
  detected_user_type: "college",
  highest_education: "",
  is_studying: true,
  years_of_experience: 0,
  skills: "",
  experience: "",
  education: "",
  internships: "",
  achievements: "",
  projects: "",
  certifications: "",
  summary: "",
  template: "template1",
  title: "",
  job_title_target: "",
  links: {},
  location: "",
};
