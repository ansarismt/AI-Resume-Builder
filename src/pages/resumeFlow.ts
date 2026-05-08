import type { TemplateOption } from "@/components/TemplateCard";

export const FLOW_STEPS = [
  { id: "wizard", title: "Resume Form" },
  { id: "preview", title: "Preview" },
  { id: "templates", title: "Templates" },
  { id: "finalize", title: "Finalize" },
] as const;

export type FlowStage = (typeof FLOW_STEPS)[number]["id"];

const IMAGE_ORDER_COLORS = ["#0f5c7a", "#d39200", "#132b78", "#047967", "#343a40", "#c4652f", "#0ea5e9"];

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "template2",
    name: "Sidebar Classic",
    category: "Image Order 1",
    description: "Tall left color panel with clean white content.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template9",
    name: "Executive Bar",
    category: "Image Order 2",
    description: "Strong top identity band inspired by the selected sample.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template12",
    name: "Soft Sidebar",
    category: "Image Order 3",
    description: "Light side column with crisp main resume sections.",
    colors: ["#2b9ed8", "#fb8576", "#334155", "#0bbda8", "#132b78", "#c9b99e", "#0ea5e9"],
  },
  {
    id: "template3",
    name: "Centered Minimal",
    category: "Image Order 4",
    description: "Minimal centered header with open ATS-friendly sections.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template7",
    name: "Mint Header",
    category: "Image Order 5",
    description: "Header color band with structured two-column content.",
    colors: ["#a7e7df", "#0f5c7a", "#d39200", "#0bbda8", "#006b2e", "#2b9ed8", "#334155"],
  },
  {
    id: "template14",
    name: "Timeline Clean",
    category: "Image Order 6",
    description: "Clean blue-accent layout for structured work history.",
    colors: ["#2b9ed8", "#93c5fd", "#132b78", "#0bbda8", "#933c4b", "#f2c500", "#006b2e"],
  },
  {
    id: "template1",
    name: "Editorial",
    category: "Classic",
    description: "Polished serif layout for academic and career summaries.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template8",
    name: "Two-Column",
    category: "Modern",
    description: "Clear sidebar hierarchy with full-width content blocks.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template4",
    name: "Compact",
    category: "Space Saving",
    description: "Dense information layout for experience-heavy resumes.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template10",
    name: "Executive",
    category: "Leadership",
    description: "Refined structure for senior professionals and managers.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template11",
    name: "Mono",
    category: "Minimal",
    description: "Sharp monochrome resume for clean ATS exports.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template13",
    name: "Creative",
    category: "Portfolio",
    description: "Distinctive accents for projects, design, and creative work.",
    colors: ["#be185d", "#0f5c7a", "#d39200", "#7c3aed", "#0bbda8", "#343a40", "#0ea5e9"],
  },
  {
    id: "template5",
    name: "Terminal",
    category: "Technical",
    description: "Crisp technical look for engineering and developer roles.",
    colors: IMAGE_ORDER_COLORS,
  },
  {
    id: "template6",
    name: "Classic",
    category: "Traditional",
    description: "Balanced professional structure for broad job searches.",
    colors: IMAGE_ORDER_COLORS,
  },
];

export function getTemplateDefaultColor(templateId: string) {
  return TEMPLATE_OPTIONS.find((template) => template.id === templateId)?.colors[0] ?? IMAGE_ORDER_COLORS[0];
}
