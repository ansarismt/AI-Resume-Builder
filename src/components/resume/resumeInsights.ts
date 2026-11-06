import type { ResumeData } from "./types";
import { splitSkills } from "./resumeUtils";

export interface HealthCheck {
  id: string;
  label: string;
  tip: string;
  weight: number;
  passed: boolean;
}

export interface ResumeHealth {
  score: number;
  level: "Getting started" | "Good" | "Strong" | "Excellent";
  checks: HealthCheck[];
  words: number;
}

const ACTION_VERBS =
  /\b(led|built|developed|designed|created|improved|increased|reduced|launched|managed|delivered|implemented|automated|optimi[sz]ed|analy[sz]ed|organi[sz]ed|achieved|won|mentored|coordinated|established)\b/i;

const BUZZWORDS =
  /hard[- ]?working|team player|go[- ]getter|self[- ]motivated|detail[- ]oriented|results[- ]driven|synergy/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function bodyText(data: ResumeData): string {
  return [
    data.summary,
    data.skills,
    data.experience,
    data.education,
    data.internships,
    data.projects,
    data.achievements,
    data.certifications,
  ].join("\n");
}

export function computeResumeHealth(data: ResumeData): ResumeHealth {
  const proof = `${data.experience}\n${data.projects}\n${data.internships}\n${data.achievements}`;
  const summaryWords = countWords(data.summary);
  const words = countWords(bodyText(data));
  const hasLink = Boolean(data.links?.linkedin || data.links?.github || data.links?.portfolio);
  const professional = !["school", "college"].includes(data.user_type);
  const experienceText = professional ? data.experience : proof;
  const hasProof = proof.trim().length > 0;
  const proofLines = proof.split(/\r?\n/).filter((line) => line.trim()).length;
  const emailValue = data.email.trim();
  const headlineWords = countWords(data.headline ?? "");
  const roleWords = (data.job_title_target ?? "")
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length >= 4);
  const bulletMarkers = proof
    .split(/\r?\n/)
    .map((line) => /^\s*([-*•–])\s+/.exec(line)?.[1])
    .filter((marker): marker is string => Boolean(marker));

  const checks: HealthCheck[] = [
    {
      id: "name",
      label: "Full name added",
      tip: "Add your full name so recruiters can find you.",
      weight: 8,
      passed: data.name.trim().length > 1,
    },
    {
      id: "email",
      label: "Valid email address",
      tip: "Use a valid, professional email address that you check often.",
      weight: 8,
      passed: EMAIL_RE.test(data.email.trim()),
    },
    {
      id: "phone",
      label: "Phone number added",
      tip: "Recruiters often call first. Add a phone number.",
      weight: 5,
      passed: data.phone.trim().length >= 7,
    },
    {
      id: "location",
      label: "Location added",
      tip: "Add your city so recruiters know where you are based.",
      weight: 4,
      passed: Boolean(data.location?.trim()),
    },
    {
      id: "summary",
      label: "Summary of 25 to 90 words",
      tip: "Write a short summary (25 to 90 words) that states your strongest points.",
      weight: 12,
      passed: summaryWords >= 25 && summaryWords <= 90,
    },
    {
      id: "skills",
      label: "At least 6 skills listed",
      tip: "List at least six relevant skills, separated by commas.",
      weight: 12,
      passed: splitSkills(data.skills).length >= 6,
    },
    {
      id: "experience",
      label: professional ? "Work experience described" : "Projects or internships described",
      tip: professional
        ? "Describe your roles with one bullet per achievement."
        : "Add projects or internships to show practical work.",
      weight: 14,
      passed: countWords(experienceText) >= 25,
    },
    {
      id: "education",
      label: "Education added",
      tip: "Add your school or college, course and year.",
      weight: 8,
      passed: countWords(data.education) >= 3,
    },
    {
      id: "numbers",
      label: "Results include numbers",
      tip: "Add numbers such as percentages, team size or amounts to show impact.",
      weight: 8,
      passed: /\d/.test(proof),
    },
    {
      id: "verbs",
      label: "Uses action verbs",
      tip: "Start bullets with verbs like built, led, improved or delivered.",
      weight: 6,
      passed: ACTION_VERBS.test(proof),
    },
    {
      id: "links",
      label: "Profile link added",
      tip: "Add your LinkedIn, GitHub or portfolio link.",
      weight: 5,
      passed: hasLink,
    },
    {
      id: "target",
      label: "Target role set",
      tip: "Set a target role so the AI tools can tailor their advice.",
      weight: 4,
      passed: Boolean(data.job_title_target?.trim()),
    },
    {
      id: "length",
      label: "Length suits one page (150 to 650 words)",
      tip:
        words > 650
          ? "Trim the content so the resume fits on one or two pages."
          : "Add more detail; the resume looks short.",
      weight: 6,
      passed: words >= 150 && words <= 650,
    },
    {
      id: "headline",
      label: "Headline added",
      tip: "Add a short headline such as Data Analyst | Python and SQL under your name.",
      weight: 4,
      passed: Boolean(data.headline?.trim()),
    },
    {
      id: "extras",
      label: "Certifications or achievements listed",
      tip: "Add a certification or achievement to set yourself apart.",
      weight: 4,
      passed: countWords(`${data.certifications} ${data.achievements}`) >= 3,
    },
    {
      id: "voice",
      label: "Summary avoids first-person words",
      tip: 'Remove "I", "my" and "me" from the summary; write it in a neutral voice.',
      weight: 3,
      passed: summaryWords > 0 && !/\b(i|my|me)\b/i.test(data.summary),
    },
    {
      id: "weak",
      label: "No weak phrases",
      tip: 'Replace phrases like "responsible for" or "worked on" with strong action verbs.',
      weight: 4,
      passed: hasProof && !/responsible for|worked on|helped with|duties included/i.test(proof),
    },
    {
      id: "bullets",
      label: "Experience broken into bullets",
      tip: "Put each achievement on its own line so recruiters can scan it.",
      weight: 4,
      passed: proofLines >= 3,
    },
    {
      id: "dates",
      label: "Dates included",
      tip: "Add years to your education and experience, for example 2021 to 2024.",
      weight: 4,
      passed: /\b(19|20)\d{2}\b/.test(`${data.education}
${data.experience}`),
    },
    {
      id: "skills-depth",
      label: "10 or more skills listed",
      tip: "Aim for ten or more skills so keyword filters find a match.",
      weight: 3,
      passed: splitSkills(data.skills).length >= 10,
    },
    {
      id: "email-pro",
      label: "Professional-looking email",
      tip: "Use an address based on your name, without long runs of digits.",
      weight: 2,
      passed: EMAIL_RE.test(emailValue) && !/\d{4,}/.test(emailValue.split("@")[0]),
    },
    {
      id: "buzzwords",
      label: "No overused buzzwords",
      tip: 'Replace phrases like "hard-working" or "team player" with a concrete example.',
      weight: 3,
      passed: hasProof && !BUZZWORDS.test(`${data.summary}\n${proof}`),
    },
    {
      id: "concise",
      label: "Bullets are concise",
      tip: "Keep each line under about 200 characters; split long lines into two bullets.",
      weight: 3,
      passed: hasProof && !proof.split(/\r?\n/).some((line) => line.length > 200),
    },
    {
      id: "quantified",
      label: "At least two quantified results",
      tip: "Add numbers to at least two bullets, such as percentages, amounts or team sizes.",
      weight: 4,
      passed: proof.split(/\r?\n/).filter((line) => /\d/.test(line)).length >= 2,
    },
    {
      id: "phone-full",
      label: "Complete phone number",
      tip: "Include the full number with area or country code.",
      weight: 2,
      passed: data.phone.replace(/\D/g, "").length >= 10,
    },
    {
      id: "linkedin",
      label: "LinkedIn profile linked",
      tip: "Add your LinkedIn address; most recruiters check it.",
      weight: 3,
      passed: Boolean(data.links?.linkedin?.trim()),
    },
    {
      id: "headline-short",
      label: "Headline under 12 words",
      tip: "Keep the headline short enough to read at a glance.",
      weight: 2,
      passed: headlineWords > 0 && headlineWords <= 12,
    },
    {
      id: "role-keywords",
      label: "Target role appears in the text",
      tip: "Use words from your target role in the summary, headline or skills.",
      weight: 3,
      passed:
        roleWords.length > 0 &&
        roleWords.some((word) =>
          `${data.summary} ${data.headline} ${data.skills}`.toLowerCase().includes(word),
        ),
    },
    {
      id: "bullet-style",
      label: "One bullet style used throughout",
      tip: "Use the same bullet marker on every line for a tidy result.",
      weight: 2,
      passed: bulletMarkers.length >= 2 && new Set(bulletMarkers).size === 1,
    },
    {
      id: "no-shouting",
      label: "No words in all capitals",
      tip: "Avoid long words in ALL CAPS in the body; they read as shouting.",
      weight: 2,
      passed: words > 0 && (bodyText(data).match(/\b[A-Z]{5,}\b/g) ?? []).length === 0,
    },
  ];

  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  const score = Math.round((earned / total) * 100);
  const level =
    score >= 90 ? "Excellent" : score >= 75 ? "Strong" : score >= 50 ? "Good" : "Getting started";
  return { score, level, checks, words };
}

/** Plain-text version of the resume, for copying into application forms. */
export function resumeToPlainText(data: ResumeData): string {
  const lines: string[] = [];
  const add = (heading: string, body?: string) => {
    if (body?.trim()) lines.push("", heading.toUpperCase(), body.trim());
  };
  lines.push(data.name.trim());
  if (data.headline?.trim()) lines.push(data.headline.trim());
  const contact = [
    data.email,
    data.phone,
    data.location,
    data.links?.linkedin,
    data.links?.github,
    data.links?.portfolio,
  ]
    .map((item) => item?.trim())
    .filter(Boolean);
  if (contact.length) lines.push(contact.join(" | "));
  add("Summary", data.summary);
  add("Skills", splitSkills(data.skills).join(", "));
  add("Experience", data.experience);
  add("Internships", data.internships);
  add("Projects", data.projects);
  add("Education", data.education);
  add("Certifications", data.certifications);
  add("Achievements", data.achievements);
  return `${lines.join("\n").trim()}\n`;
}

/** True when the resume holds anything worth restoring as a draft. */
export function hasContent(data: ResumeData): boolean {
  return Boolean(
    data.name.trim() ||
    data.email.trim() ||
    data.summary.trim() ||
    data.skills.trim() ||
    data.experience.trim() ||
    data.education.trim() ||
    data.projects.trim(),
  );
}

export function formatRelativeTime(iso: string | undefined, now = Date.now()): string {
  if (!iso) return "";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.floor((now - time) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
