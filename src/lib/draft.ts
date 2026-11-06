import type { ResumeData } from "@/components/resume/types";

export interface Draft {
  data: ResumeData;
  resumeId: string | null;
  savedAt: number;
}

const key = (username: string | null) => `resume-draft:${username ?? "guest"}`;

export function saveDraft(username: string | null, data: ResumeData, resumeId: string | null) {
  try {
    const draft: Draft = { data, resumeId, savedAt: Date.now() };
    window.localStorage.setItem(key(username), JSON.stringify(draft));
  } catch {
    /* storage can be full or blocked; autosave is best effort */
  }
}

export function loadDraft(username: string | null): Draft | null {
  try {
    const raw = window.localStorage.getItem(key(username));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed || typeof parsed !== "object" || !parsed.data || typeof parsed.savedAt !== "number")
      return null;
    return { data: parsed.data, resumeId: parsed.resumeId ?? null, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function clearDraft(username: string | null) {
  try {
    window.localStorage.removeItem(key(username));
  } catch {
    /* ignore */
  }
}
