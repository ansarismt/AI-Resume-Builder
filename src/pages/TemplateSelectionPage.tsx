import { ArrowLeft, ArrowRight } from "lucide-react";

import { ResumePreview } from "@/components/preview/ResumePreview";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import type { ResumeData, TemplateId } from "@/components/resume/types";
import { TEMPLATE_OPTIONS } from "./resumeFlow";

interface Props {
  data: ResumeData;
  selectedTemplate: TemplateId;
  selectedColor: string;
  onSelectTemplate: (id: TemplateId) => void;
  onSelectColor: (templateId: TemplateId, color: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function TemplateSelectionPage({
  data,
  selectedTemplate,
  selectedColor,
  onSelectTemplate,
  onSelectColor,
  onBack,
  onContinue,
}: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-accent">
              Step 3
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Pick a resume template</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Choose a style inspired by premium resume builders. Your existing template components
              stay intact.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="button" onClick={onContinue}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_OPTIONS.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={template.id === selectedTemplate}
              selectedColor={template.id === selectedTemplate ? selectedColor : template.colors[0]}
              onSelect={onSelectTemplate}
              onColorSelect={onSelectColor}
            />
          ))}
        </section>

        <aside className="self-start rounded-xl border border-border bg-card p-3 shadow-sm xl:sticky xl:top-24">
          <p className="mb-3 px-1 text-xs font-mono uppercase tracking-widest text-accent">
            Live Preview
          </p>
          <div id="resume-print" className="rounded-lg border border-border">
            <ResumePreview data={data} accentColor={selectedColor} />
          </div>
        </aside>
      </div>
    </div>
  );
}
