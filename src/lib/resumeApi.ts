import axios from "axios";

import type { ResumeData, SavedResume, TemplateId, UserType } from "@/components/resume/types";

const API_BASE = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

type ResumeApiRecord = Omit<SavedResume, "id" | "template" | "user_type" | "detected_user_type"> & {
  id: number | string;
  template: string;
  user_type: string;
  detected_user_type?: string;
};

function normalizeTemplate(template: string): TemplateId {
  const allowed: TemplateId[] = [
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

  return allowed.includes(template as TemplateId) ? (template as TemplateId) : "template1";
}

function normalizeUserType(userType: string | undefined): UserType {
  return userType === "school" || userType === "college" || userType === "professional"
    ? userType
    : "college";
}

export function normalizeResume(record: ResumeApiRecord): SavedResume {
  return {
    ...record,
    id: record.id.toString(),
    phone: record.phone ?? "",
    user_type: normalizeUserType(record.user_type),
    detected_user_type: normalizeUserType(record.detected_user_type),
    highest_education: record.highest_education ?? "",
    is_studying: Boolean(record.is_studying),
    years_of_experience: Number(record.years_of_experience ?? 0),
    template: normalizeTemplate(record.template),
  };
}

export function toResumePayload(data: ResumeData) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    user_type: data.user_type,
    highest_education: data.highest_education,
    is_studying: data.is_studying,
    years_of_experience: data.user_type === "school" ? 0 : data.years_of_experience,
    education: data.education,
    skills: data.skills,
    projects: data.projects,
    experience: data.user_type === "school" ? "" : data.experience,
    certifications: data.certifications,
    internships: data.internships,
    achievements: data.achievements,
    summary: data.summary,
    template: data.template,
  };
}

export async function detectResumeUserType(highestEducation: string, yearsOfExperience: number) {
  const response = await api.post<{ user_type: UserType }>("/resume/detect-type", {
    highest_education: highestEducation,
    years_of_experience: yearsOfExperience,
  });
  return response.data.user_type;
}

export async function createResume(data: ResumeData) {
  const response = await api.post<ResumeApiRecord>("/resume/create", toResumePayload(data));
  return normalizeResume(response.data);
}

export async function getResume(id: string) {
  const response = await api.get<ResumeApiRecord>(`/resume/${id}`);
  return normalizeResume(response.data);
}

export async function listResumes() {
  const response = await api.get<ResumeApiRecord[]>("/api/resumes/");
  return response.data.map(normalizeResume);
}

export async function updateResume(id: string, data: ResumeData) {
  const response = await api.put<ResumeApiRecord>(`/api/resumes/${id}/`, toResumePayload(data));
  return normalizeResume(response.data);
}

export async function deleteResume(id: string) {
  await api.delete(`/api/resumes/${id}/`);
}
