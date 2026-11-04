import axios from "axios";

import {
  TEMPLATE_IDS,
  type ResumeData,
  type SavedResume,
  type TemplateId,
  type UserType,
} from "@/components/resume/types";

const API_BASE = (() => {
  const raw = import.meta.env.VITE_API_URL || "";
  const trimmed = raw.replace(/\/$/, "");
  const base = trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed || "http://127.0.0.1:8000";
  return base;
})();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface ResumeStrengthResult {
  score: number;
  category: string;
  rules: Array<{ rule: string; score: number; max_score: number; feedback: string }>;
}

export interface RoleMatchResult {
  suggestions: Array<{ category: string; confidence: number }>;
  note: string;
}

export interface ATSAnalysisResult {
  overall_score: number;
  keyword_match_percent: number;
  matched_keywords: string[];
  missing_keywords: string[];
  section_completeness: Record<string, boolean>;
  formatting_warnings: string[];
}

export interface DatasetSkillsResult {
  skills: string[];
  source: "dataset" | "ai";
}

export interface DatasetModelStatus {
  available: boolean;
  trained_at?: string;
  selected_model?: string;
  dataset_rows_used?: number;
  category_count?: number;
  test_accuracy?: number;
  test_macro_f1?: number;
  error?: string;
}

export type ResumeSection =
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "internships"
  | "achievements"
  | "certifications";

api.interceptors.request.use((config) => {
  const token = typeof window === "undefined" ? null : localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export async function requestAuth(
  endpoint: "login" | "signup",
  payload: { username: string; password: string; email?: string },
) {
  const response = await api.post<AuthResponse>(`/api/auth/${endpoint}/`, payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<Omit<AuthResponse, "token">>("/api/auth/me/");
  return response.data;
}

export async function endSession() {
  await api.post("/api/auth/logout/");
}

export async function updateAccount(payload: { username: string; password: string }) {
  const response = await api.put<AuthResponse>("/api/auth/account/", payload);
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const errorMessage = data.error;
    const detail = data.detail;
    if (typeof errorMessage === "string" && typeof detail === "string") {
      return detail.toLowerCase().startsWith(errorMessage.toLowerCase())
        ? detail
        : `${errorMessage}: ${detail}`;
    }
    if (typeof detail === "string") return detail;
    if (typeof errorMessage === "string") return errorMessage;

    const values = Object.entries(data as Record<string, unknown>)
      .map(([key, value]) => {
        if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
        return `${key}: ${String(value)}`;
      })
      .join("; ");

    if (values) return values;
  }

  return error.response?.status
    ? `${fallback} (${error.response.status})`
    : error.message || fallback;
}

type ResumeApiRecord = Omit<SavedResume, "id" | "template" | "user_type" | "detected_user_type"> & {
  id: number | string;
  template: string;
  user_type: string;
  detected_user_type?: string;
};

function normalizeTemplate(template: string): TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(template)
    ? (template as TemplateId)
    : "template1";
}

function normalizeUserType(userType: string | undefined): UserType {
  return userType === "school" || userType === "college" || userType === "professional"
    ? userType
    : "college";
}

function normalizeResume(record: ResumeApiRecord): SavedResume {
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

function toResumePayload(data: ResumeData) {
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
    title: data.title ?? "",
    job_title_target: data.job_title_target ?? "",
    links: data.links ?? {},
    location: data.location ?? "",
  };
}

export async function detectResumeUserType(highestEducation: string, yearsOfExperience: number) {
  const response = await api.post<{ user_type: UserType }>("/api/resume/detect-type/", {
    highest_education: highestEducation,
    years_of_experience: yearsOfExperience,
  });
  return response.data.user_type;
}

export async function createResume(data: ResumeData) {
  const response = await api.post<ResumeApiRecord>("/api/resumes/", toResumePayload(data));
  return normalizeResume(response.data);
}

export async function getResume(id: string) {
  const response = await api.get<ResumeApiRecord>(`/api/resumes/${id}/`);
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

export async function downloadResumeExport(
  id: string,
  format: "pdf" | "docx" | "json" | "txt",
  accentColor?: string,
) {
  const response = await api.get<Blob>(`/api/resumes/${id}/export_${format}/`, {
    responseType: "blob",
    params: accentColor ? { accent_color: accentColor } : undefined,
  });
  return response.data;
}

export async function parseResume(text: string, file?: File) {
  const formData = new FormData();
  if (text.trim()) formData.append("text", text.trim());
  if (file) formData.append("file", file);

  const response = await api.post<Partial<ResumeData>>("/api/ai/parse-resume/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function generateResumeSummaries(resume: ResumeData, tone = ""): Promise<string[]> {
  const response = await api.post<{ variants: string[] }>("/api/ai/summary/", {
    resume,
    user_type: resume.user_type,
    tone,
  });
  return response.data.variants;
}

export async function improveResumeBullets(
  bullets: string[],
  targetRole = "",
  section: ResumeSection = "experience",
): Promise<Array<{ before: string; after: string }>> {
  const response = await api.post<{ suggestions: Array<{ before: string; after: string }> }>(
    "/api/ai/improve-bullets/",
    { bullets, target_role: targetRole, section },
  );
  return response.data.suggestions;
}

export async function analyzeResumeStrength(resume: Record<string, unknown>) {
  const response = await api.post<ResumeStrengthResult>("/api/ai/resume-strength/", { resume });
  return response.data;
}

export async function matchResumeRoles(resume: Record<string, unknown>, userType: UserType) {
  const response = await api.post<RoleMatchResult>("/api/ai/job-role-match/", {
    resume,
    user_type: userType,
  });
  return response.data;
}

export async function analyzeResumeForJob(resume: Record<string, unknown>, jobDescription: string) {
  const response = await api.post<ATSAnalysisResult>("/api/ai/ats-score/", {
    resume,
    job_description: jobDescription,
  });
  return response.data;
}

export async function suggestSkillsForRole(targetRole: string, userType: UserType) {
  const response = await api.post<DatasetSkillsResult>("/api/ai/skills-suggest/", {
    target_role: targetRole,
    user_type: userType,
  });
  return response.data;
}

export async function getDatasetModelStatus() {
  const response = await api.get<DatasetModelStatus>("/api/ai/model-status/");
  return response.data;
}
