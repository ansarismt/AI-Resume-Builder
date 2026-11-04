import type { TemplateId } from "./types";

/**
 * The 20 resume templates are ten layouts, each offered with a sans-serif and a
 * serif typeface. Every template uses the same restrained, professional colour
 * palette (navy, steel blue, slate, charcoal and black) - no bright colours.
 *
 * Keep the default colours here in sync with TEMPLATE_COLORS in resumes/exports.py.
 */

export type TemplateLayout =
  | "classic"
  | "modern"
  | "sidebar-left"
  | "sidebar-right"
  | "banner"
  | "split"
  | "compact"
  | "timeline"
  | "ats"
  | "framed";

type TemplateFont = "sans" | "serif";

export const PROFESSIONAL_COLORS = {
  navy: "#1f3a5f",
  steel: "#2f5d8a",
  slate: "#4a5568",
  charcoal: "#2d3436",
  black: "#111111",
} as const;

type ColorName = keyof typeof PROFESSIONAL_COLORS;

const COLOR_ORDER: ColorName[] = ["navy", "steel", "slate", "charcoal", "black"];

function palette(first: ColorName): string[] {
  return [first, ...COLOR_ORDER.filter((name) => name !== first)].map(
    (name) => PROFESSIONAL_COLORS[name],
  );
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  layout: TemplateLayout;
  font: TemplateFont;
  colors: string[];
}

export const TEMPLATE_CATALOG: TemplateMeta[] = [
  {
    id: "template1",
    name: "Executive",
    category: "Classic",
    description: "Centered serif header with ruled sections for senior and traditional roles.",
    layout: "classic",
    font: "serif",
    colors: palette("navy"),
  },
  {
    id: "template2",
    name: "Corporate",
    category: "Classic",
    description: "Centered sans-serif header with clean ruled sections.",
    layout: "classic",
    font: "sans",
    colors: palette("charcoal"),
  },
  {
    id: "template3",
    name: "Professional",
    category: "Modern",
    description: "Left-aligned header with accent-marked section headings.",
    layout: "modern",
    font: "sans",
    colors: palette("navy"),
  },
  {
    id: "template4",
    name: "Heritage",
    category: "Modern",
    description: "Serif left-aligned layout with understated section markers.",
    layout: "modern",
    font: "serif",
    colors: palette("slate"),
  },
  {
    id: "template5",
    name: "Navy Sidebar",
    category: "Sidebar",
    description: "Solid left column for contact details and skills, wide main column.",
    layout: "sidebar-left",
    font: "sans",
    colors: palette("navy"),
  },
  {
    id: "template6",
    name: "Charcoal Sidebar",
    category: "Sidebar",
    description: "Serif typography beside a solid charcoal side column.",
    layout: "sidebar-left",
    font: "serif",
    colors: palette("charcoal"),
  },
  {
    id: "template7",
    name: "Slate Aside",
    category: "Sidebar",
    description: "Light right-hand column for skills and education.",
    layout: "sidebar-right",
    font: "sans",
    colors: palette("slate"),
  },
  {
    id: "template8",
    name: "Refined Aside",
    category: "Sidebar",
    description: "Serif layout with a light right-hand column.",
    layout: "sidebar-right",
    font: "serif",
    colors: palette("navy"),
  },
  {
    id: "template9",
    name: "Banner",
    category: "Header Band",
    description: "Solid top band with name and contact details above a clean body.",
    layout: "banner",
    font: "sans",
    colors: palette("navy"),
  },
  {
    id: "template10",
    name: "Banner Serif",
    category: "Header Band",
    description: "Serif body under a solid top band.",
    layout: "banner",
    font: "serif",
    colors: palette("charcoal"),
  },
  {
    id: "template11",
    name: "Split",
    category: "Two Column",
    description: "Full-width header with a main column and a narrow side column.",
    layout: "split",
    font: "sans",
    colors: palette("steel"),
  },
  {
    id: "template12",
    name: "Split Serif",
    category: "Two Column",
    description: "Two-column serif layout for balanced, structured resumes.",
    layout: "split",
    font: "serif",
    colors: palette("navy"),
  },
  {
    id: "template13",
    name: "Compact",
    category: "Space Saving",
    description: "Dense layout for experience-heavy resumes.",
    layout: "compact",
    font: "sans",
    colors: palette("charcoal"),
  },
  {
    id: "template14",
    name: "Compact Serif",
    category: "Space Saving",
    description: "Dense serif layout that fits more on one page.",
    layout: "compact",
    font: "serif",
    colors: palette("slate"),
  },
  {
    id: "template15",
    name: "Timeline",
    category: "Structured",
    description: "Vertical rule with section markers for a clear career flow.",
    layout: "timeline",
    font: "sans",
    colors: palette("steel"),
  },
  {
    id: "template16",
    name: "Timeline Serif",
    category: "Structured",
    description: "Serif timeline layout with quiet section markers.",
    layout: "timeline",
    font: "serif",
    colors: palette("slate"),
  },
  {
    id: "template17",
    name: "ATS Plain",
    category: "ATS Friendly",
    description: "Plain single-column layout built for applicant tracking systems.",
    layout: "ats",
    font: "sans",
    colors: palette("black"),
  },
  {
    id: "template18",
    name: "ATS Classic",
    category: "ATS Friendly",
    description: "Plain serif single column with no graphics or shading.",
    layout: "ats",
    font: "serif",
    colors: palette("black"),
  },
  {
    id: "template19",
    name: "Framed",
    category: "Formal",
    description: "Bold top rule with the name on the left and contact details on the right.",
    layout: "framed",
    font: "sans",
    colors: palette("navy"),
  },
  {
    id: "template20",
    name: "Framed Serif",
    category: "Formal",
    description: "Formal serif layout under a bold top rule.",
    layout: "framed",
    font: "serif",
    colors: palette("charcoal"),
  },
];

export function getTemplateMeta(id: string): TemplateMeta {
  return TEMPLATE_CATALOG.find((template) => template.id === id) ?? TEMPLATE_CATALOG[0];
}
