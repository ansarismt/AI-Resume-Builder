import { SECTION_SETS } from "@/components/resume/sections";
import { splitSkills } from "@/components/resume/resumeUtils";
import type { ResumeData } from "@/components/resume/types";

function contactList(data: ResumeData): string[] {
  const links = data.links ?? {};
  return [data.email, data.phone, data.location, links.linkedin, links.github, links.portfolio]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
}

function filledSections(data: ResumeData) {
  return (SECTION_SETS[data.user_type] ?? SECTION_SETS.college)
    .map((def) => ({ def, text: (data[def.key] ?? "").trim() }))
    .filter((item) => item.text);
}

const BULLET = /^\s*[-*•–]\s+/;

/** Turns free text into Markdown: bullet-looking lines become list items. */
function bodyToMarkdown(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => (BULLET.test(line) ? `- ${line.replace(BULLET, "")}` : line))
    .join("\n");
}

export function resumeToMarkdown(data: ResumeData): string {
  const lines: string[] = [`# ${data.name.trim() || "Your Name"}`];
  if (data.headline?.trim()) lines.push("", `_${data.headline.trim()}_`);
  const contact = contactList(data);
  if (contact.length) lines.push("", contact.join(" | "));
  for (const { def, text } of filledSections(data)) {
    lines.push("", `## ${def.title}`, "");
    lines.push(def.key === "skills" ? splitSkills(text).join(", ") : bodyToMarkdown(text));
  }
  return `${lines.join("\n")}\n`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeColor(color: string | undefined): string {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#1f3a5f";
}

function bodyToHtml(text: string): string {
  const blocks: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(`<ul>${list.map((item) => `<li>${item}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const line of text.split(/\r?\n/)) {
    if (BULLET.test(line)) {
      list.push(escapeHtml(line.replace(BULLET, "")));
    } else if (line.trim()) {
      flush();
      blocks.push(`<p>${escapeHtml(line.trim())}</p>`);
    }
  }
  flush();
  return blocks.join("");
}

/** A standalone, print-friendly HTML page with the resume content. */
export function resumeToHtml(data: ResumeData, accentColor?: string): string {
  const accent = safeColor(accentColor || data.accent_color);
  const name = escapeHtml(data.name.trim() || "Your Name");
  const sections = filledSections(data)
    .map(({ def, text }) => {
      const body =
        def.key === "skills"
          ? `<p class="skills">${splitSkills(text)
              .map((skill) => `<span>${escapeHtml(skill)}</span>`)
              .join("")}</p>`
          : bodyToHtml(text);
      return `<section><h2>${escapeHtml(def.title)}</h2>${body}</section>`;
    })
    .join("\n");
  const contact = contactList(data).map(escapeHtml).join(" &middot; ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} - Resume</title>
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1a202c; line-height: 1.55; margin: 0; background: #f4f6fa; }
  main { max-width: 800px; margin: 2rem auto; background: #fff; padding: 2.5rem 3rem; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  h1 { margin: 0; font-size: 2rem; color: ${accent}; }
  .headline { margin: .25rem 0 0; color: #4a5568; }
  .contact { margin: .6rem 0 0; color: #4a5568; font-size: .9rem; }
  header { border-bottom: 2px solid ${accent}; padding-bottom: 1rem; }
  h2 { margin: 1.6rem 0 .4rem; font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; color: ${accent}; }
  p { margin: .25rem 0; white-space: pre-wrap; }
  ul { margin: .25rem 0; padding-left: 1.2rem; }
  .skills span { display: inline-block; margin: 0 .4rem .4rem 0; padding: .1rem .6rem; border: 1px solid ${accent}; border-radius: 999px; font-size: .85rem; }
  @media print { body { background: #fff; } main { margin: 0; box-shadow: none; } }
</style>
</head>
<body>
<main>
<header>
<h1>${name}</h1>
${data.headline?.trim() ? `<p class="headline">${escapeHtml(data.headline.trim())}</p>` : ""}
${contact ? `<p class="contact">${contact}</p>` : ""}
</header>
${sections}
</main>
</body>
</html>
`;
}

export function downloadTextFile(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
