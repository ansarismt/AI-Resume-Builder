import type { TemplateOption } from "@/components/TemplateCard";
import { PROFESSIONAL_COLORS, TEMPLATE_CATALOG } from "@/components/resume/templateCatalog";

export const FLOW_STEPS = [
  { id: "wizard", title: "Resume Form" },
  { id: "preview", title: "Preview" },
  { id: "templates", title: "Templates" },
  { id: "finalize", title: "Finalize" },
] as const;

export type FlowStage = (typeof FLOW_STEPS)[number]["id"];

export const TEMPLATE_OPTIONS: TemplateOption[] = TEMPLATE_CATALOG.map((template) => ({
  id: template.id,
  name: template.name,
  category: template.category,
  description: template.description,
  layout: template.layout,
  colors: template.colors,
}));

export function getTemplateDefaultColor(templateId: string) {
  return (
    TEMPLATE_OPTIONS.find((template) => template.id === templateId)?.colors[0] ??
    PROFESSIONAL_COLORS.navy
  );
}
