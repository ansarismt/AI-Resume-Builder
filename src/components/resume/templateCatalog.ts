import templateData from "../../../shared/templates.json";
import { TEMPLATE_IDS, type TemplateId } from "./types";

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
  | "framed"
  | "minimal"
  | "bold"
  | "elegant"
  | "tech"
  | "ribbon";

type TemplateFont = "sans" | "serif";

export const PROFESSIONAL_COLORS = {
  navy: "#1f3a5f",
  steel: "#2f5d8a",
  slate: "#4a5568",
  charcoal: "#2d3436",
  black: "#111111",
} as const;

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  layout: TemplateLayout;
  font: TemplateFont;
  colors: string[];
}

const layouts: readonly TemplateLayout[] = [
  "classic",
  "modern",
  "sidebar-left",
  "sidebar-right",
  "banner",
  "split",
  "compact",
  "timeline",
  "ats",
  "framed",
  "minimal",
  "bold",
  "elegant",
  "tech",
  "ribbon",
];

export const TEMPLATE_CATALOG: TemplateMeta[] = templateData.map((template) => {
  if (
    !layouts.includes(template.layout as TemplateLayout) ||
    !["sans", "serif"].includes(template.font) ||
    !TEMPLATE_IDS.includes(template.id as TemplateId)
  ) {
    throw new Error(`Invalid resume template metadata: ${template.id}`);
  }
  return {
    ...template,
    id: template.id as TemplateId,
    layout: template.layout as TemplateLayout,
    font: template.font as TemplateFont,
    colors: [...template.colors],
  };
});

export function getTemplateMeta(id: string): TemplateMeta {
  return TEMPLATE_CATALOG.find((template) => template.id === id) ?? TEMPLATE_CATALOG[0];
}
