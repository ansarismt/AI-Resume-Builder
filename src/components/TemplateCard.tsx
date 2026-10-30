import { CheckCircle2, ZoomIn } from "lucide-react";

import type { TemplateId } from "@/components/resume/types";

export interface TemplateOption {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  colors: string[];
}

interface Props {
  template: TemplateOption;
  selected: boolean;
  selectedColor: string;
  onSelect: (id: TemplateId) => void;
  onColorSelect: (templateId: TemplateId, color: string) => void;
}

export function TemplateCard({
  template,
  selected,
  selectedColor,
  onSelect,
  onColorSelect,
}: Props) {
  const primary = selected ? selectedColor : (template.colors[0] ?? "#0f172a");
  const secondary = template.colors[1] ?? "#e2e8f0";

  return (
    <div
      className={`group text-left transition-all duration-200 ${selected ? "scale-[1.01]" : "hover:-translate-y-0.5"}`}
    >
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        className={`relative w-full overflow-hidden rounded-xl border bg-card p-3 text-left shadow-sm transition-all duration-200 ${
          selected
            ? "border-accent shadow-md ring-2 ring-accent/20"
            : "border-border hover:border-accent/40 hover:shadow-md"
        }`}
      >
        <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border bg-paper">
          <div className="flex h-full">
            <div className="w-1/3 p-3" style={{ backgroundColor: primary }}>
              <div className="h-3 w-16 rounded bg-white/90" />
              <div className="mt-2 h-2 w-12 rounded bg-white/70" />
              <div className="mt-6 space-y-2">
                <div className="h-2 rounded bg-white/80" />
                <div className="h-2 w-4/5 rounded bg-white/60" />
                <div className="h-2 w-3/5 rounded bg-white/60" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-2 rounded bg-white/80" />
                <div className="h-2 w-5/6 rounded bg-white/60" />
                <div className="h-2 w-2/3 rounded bg-white/60" />
              </div>
            </div>
            <div className="flex-1 p-4" style={{ backgroundColor: secondary }}>
              <div className="h-3 w-28 rounded bg-foreground/70" />
              <div className="mt-2 h-2 w-20 rounded bg-muted-foreground/40" />
              <div className="mt-6 space-y-2">
                <div className="h-2 rounded bg-muted-foreground/35" />
                <div className="h-2 rounded bg-muted-foreground/25" />
                <div className="h-2 w-4/5 rounded bg-muted-foreground/25" />
              </div>
              <div className="mt-6 h-px bg-border" />
              <div className="mt-4 grid grid-cols-[44px_1fr] gap-3">
                <div className="space-y-2">
                  <div className="h-2 rounded bg-muted-foreground/35" />
                  <div className="h-2 rounded bg-muted-foreground/25" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded bg-foreground/55" />
                  <div className="h-2 rounded bg-muted-foreground/25" />
                  <div className="h-2 w-5/6 rounded bg-muted-foreground/25" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {selected && (
          <div className="absolute right-5 top-5 rounded-full bg-accent p-1 text-accent-foreground shadow">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-5 bottom-20 translate-y-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="mx-auto flex w-max items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg">
            <ZoomIn className="mr-1.5 h-3.5 w-3.5" />
            Use this template
          </div>
        </div>
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold">{template.name}</p>
          <p className="text-xs text-muted-foreground">{template.category}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {template.colors.map((color) => {
            const colorActive = selected && selectedColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => onColorSelect(template.id, color)}
                className={`h-5 w-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                  colorActive ? "border-foreground ring-2 ring-accent/40" : "border-border"
                }`}
                aria-label={`Use ${color} for ${template.name}`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{template.description}</p>
    </div>
  );
}
