import { CheckCircle2, ZoomIn } from "lucide-react";

import type { TemplateLayout } from "@/components/resume/templateCatalog";
import type { TemplateId } from "@/components/resume/types";

export interface TemplateOption {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  layout: TemplateLayout;
  colors: string[];
}

const BAR = "rounded-sm bg-slate-300";
const BAR_DARK = "rounded-sm bg-slate-500";

function Lines({ widths, className = BAR }: { widths: string[]; className?: string }) {
  return (
    <div className="space-y-1.5">
      {widths.map((width, index) => (
        <div key={index} className={`h-1.5 ${className}`} style={{ width }} />
      ))}
    </div>
  );
}

function Heading({ color, width = "38%" }: { color: string; width?: string }) {
  return <div className="mb-1.5 h-1.5 rounded-sm" style={{ backgroundColor: color, width }} />;
}

function Block({ color, rule = false }: { color: string; rule?: boolean }) {
  return (
    <div className="mb-3">
      <Heading color={color} />
      {rule && <div className="mb-1.5 h-px bg-slate-300" />}
      <Lines widths={["100%", "92%", "78%"]} />
    </div>
  );
}

function TemplateThumbnail({ layout, color }: { layout: TemplateLayout; color: string }) {
  const name = <div className="h-3 w-24 rounded-sm bg-slate-700" />;
  const sub = <div className="mt-1.5 h-1.5 w-16 rounded-sm bg-slate-400" />;

  if (layout === "sidebar-left" || layout === "sidebar-right") {
    const aside = (
      <div
        className="w-1/3 space-y-3 p-3"
        style={
          layout === "sidebar-left" ? { backgroundColor: color } : { backgroundColor: "#eef1f5" }
        }
      >
        <Lines
          widths={["90%", "70%"]}
          className={layout === "sidebar-left" ? "rounded-sm bg-white/70" : BAR}
        />
        <Lines
          widths={["80%", "60%", "70%"]}
          className={layout === "sidebar-left" ? "rounded-sm bg-white/55" : BAR}
        />
        <Lines
          widths={["75%", "55%"]}
          className={layout === "sidebar-left" ? "rounded-sm bg-white/55" : BAR}
        />
      </div>
    );
    return (
      <div className={`flex h-full ${layout === "sidebar-right" ? "flex-row-reverse" : ""}`}>
        {aside}
        <div className="flex-1 p-4">
          {name}
          {sub}
          <div className="mt-4">
            <Block color={color} />
            <Block color={color} />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "banner") {
    return (
      <div className="h-full">
        <div className="p-4" style={{ backgroundColor: color }}>
          <div className="h-3 w-24 rounded-sm bg-white/90" />
          <div className="mt-1.5 h-1.5 w-32 rounded-sm bg-white/60" />
        </div>
        <div className="p-4">
          <Block color={color} rule />
          <Block color={color} rule />
          <Block color={color} rule />
        </div>
      </div>
    );
  }

  if (layout === "split") {
    return (
      <div className="h-full p-4">
        <div className="border-b-2 pb-2" style={{ borderColor: color }}>
          {name}
          {sub}
        </div>
        <div className="mt-3 flex gap-3">
          <div className="flex-[2]">
            <Block color={color} />
            <Block color={color} />
          </div>
          <div className="flex-1 space-y-2 rounded bg-slate-100 p-2">
            <Heading color={color} width="60%" />
            <Lines widths={["90%", "70%", "80%"]} />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "framed") {
    return (
      <div className="h-full border-t-[6px] p-4" style={{ borderColor: color }}>
        <div className="flex items-end justify-between border-b border-slate-300 pb-2">
          <div>
            {name}
            {sub}
          </div>
          <div className="space-y-1">
            <div className="ml-auto h-1.5 w-14 rounded-sm bg-slate-300" />
            <div className="ml-auto h-1.5 w-10 rounded-sm bg-slate-300" />
          </div>
        </div>
        <div className="mt-3">
          <Block color={color} rule />
          <Block color={color} rule />
        </div>
      </div>
    );
  }

  if (layout === "timeline") {
    return (
      <div className="h-full p-4">
        {name}
        {sub}
        <div className="mt-4 ml-1 space-y-3 border-l-2 border-slate-300 pl-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="relative">
              <div
                className="absolute -left-[17px] top-0 h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Heading color={color} />
              <Lines widths={["100%", "80%"]} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="h-full p-3">
        {name}
        {sub}
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item}>
              <div
                className="mb-1 h-2 border-l-[3px] bg-slate-100"
                style={{ borderColor: color, width: "100%" }}
              />
              <Lines widths={["100%", "88%"]} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "ats") {
    return (
      <div className="h-full p-4">
        <div className="h-3 w-24 rounded-sm bg-slate-800" />
        <div className="mt-1.5 h-1.5 w-32 rounded-sm bg-slate-500" />
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item}>
              <div className="mb-1.5 h-1.5 w-1/3 rounded-sm bg-slate-800" />
              <div className="mb-1.5 h-px bg-slate-800" />
              <Lines widths={["100%", "90%", "70%"]} className={BAR_DARK} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "classic") {
    return (
      <div className="h-full p-4">
        <div className="border-b-2 pb-2 text-center" style={{ borderColor: color }}>
          <div className="mx-auto h-3 w-24 rounded-sm bg-slate-700" />
          <div className="mx-auto mt-1.5 h-1.5 w-32 rounded-sm bg-slate-400" />
        </div>
        <div className="mt-3">
          <Block color={color} rule />
          <Block color={color} rule />
          <Block color={color} rule />
        </div>
      </div>
    );
  }

  // modern
  return (
    <div className="h-full p-4">
      <div className="border-b border-slate-300 pb-2">
        <div className="h-3 w-24 rounded-sm" style={{ backgroundColor: color }} />
        {sub}
      </div>
      <div className="mt-3">
        <Block color={color} />
        <Block color={color} />
        <Block color={color} />
      </div>
    </div>
  );
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

  return (
    <div
      className={`group text-left transition-all duration-200 ${selected ? "scale-[1.01]" : "hover:-translate-y-0.5"}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={`${template.name} template`}
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect(template.id)}
        className={`relative w-full overflow-hidden rounded-xl border bg-card p-3 text-left shadow-sm transition-all duration-200 ${
          selected
            ? "border-accent shadow-md ring-2 ring-accent/20"
            : "border-border hover:border-accent/40 hover:shadow-md"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
      >
        <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border bg-white">
          <TemplateThumbnail layout={template.layout} color={primary} />
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
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
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
