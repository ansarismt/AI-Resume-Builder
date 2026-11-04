import { ArrowLeft, ArrowRight } from "lucide-react";
import type { KeyboardEvent } from "react";

import { ResumeDocument } from "@/components/resume/ResumeDocument";
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
  const handleTemplateKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const directions: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    const direction = directions[event.key];
    if (!direction) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const currentRadio = target.closest<HTMLButtonElement>('[role="radio"]');
    if (!currentRadio) return;

    const radios = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    );
    const currentIndex = radios.indexOf(currentRadio);
    if (currentIndex < 0 || radios.length === 0) return;

    event.preventDefault();
    const nextIndex = (currentIndex + direction + radios.length) % radios.length;
    const nextRadio = radios[nextIndex];
    nextRadio.focus();
    nextRadio.click();
  };

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
              Choose from 20 professional layouts and a restrained colour palette. Every template
              shows the same content, so you can switch freely.
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div
          role="radiogroup"
          aria-label="Resume templates"
          tabIndex={-1}
          onKeyDown={handleTemplateKeyDown}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
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
        </div>

        <aside className="self-start rounded-xl border border-border bg-card p-3 shadow-lg lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-accent">
                Live Preview
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Updates as you choose a design</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[0.65rem] font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live
            </span>
          </div>
          <div
            id="resume-print"
            className="overflow-hidden rounded-lg border border-border bg-secondary/30 p-1.5 shadow-inner"
          >
            <ResumeDocument data={data} accentColor={selectedColor} />
          </div>
        </aside>
      </div>
    </div>
  );
}
