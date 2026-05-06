import type { TemplateId } from "./types";

const templates: { id: TemplateId; label: string }[] = [
  { id: "template1", label: "Editorial" },
  { id: "template2", label: "Modern" },
  { id: "template3", label: "Minimal" },
  { id: "template4", label: "Compact" },
  { id: "template5", label: "Terminal" },
  { id: "template6", label: "Classic" },
  { id: "template7", label: "Gradient" },
  { id: "template8", label: "Two-Column" },
  { id: "template9", label: "Color Block" },
  { id: "template10", label: "Executive" },
  { id: "template11", label: "Mono" },
  { id: "template12", label: "Split" },
  { id: "template13", label: "Creative" },
  { id: "template14", label: "Clean" },
];

interface Props {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

export function TemplateSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
      {templates.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="font-display">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
