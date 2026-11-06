import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const currentIndex = Math.max(
    0,
    TEMPLATE_OPTIONS.findIndex((template) => template.id === selectedTemplate),
  );
  const currentTemplate = TEMPLATE_OPTIONS[currentIndex];
  const stepTemplate = (direction: number) => {
    const next =
      TEMPLATE_OPTIONS[
        (currentIndex + direction + TEMPLATE_OPTIONS.length) % TEMPLATE_OPTIONS.length
      ];
    onSelectTemplate(next.id);
  };

  useEffect(() => {
    if (!previewOpen) return;
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

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
      <section className="toon p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              Step 3
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Pick a resume template</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Choose from 30 professional layouts and a restrained colour palette. Every template
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

      <div
        role="radiogroup"
        aria-label="Resume templates"
        tabIndex={-1}
        onKeyDown={handleTemplateKeyDown}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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

      {/* Rendered on the page body so the tab and panel overlay the whole screen. */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Open resume preview"
              onClick={() => setPreviewOpen(true)}
              className="no-print group fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-xl border border-r-0 border-primary bg-primary px-2.5 py-4 text-primary-foreground shadow-lift transition-all duration-200 hover:pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Eye className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-semibold tracking-wide [text-orientation:mixed] [writing-mode:vertical-rl]">
                Preview
              </span>
            </button>

            {previewOpen && (
              <div className="fixed inset-0 z-50">
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full cursor-default bg-black/50"
                  onClick={() => setPreviewOpen(false)}
                />
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Resume preview"
                  className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-border bg-card shadow-2xl sm:w-[min(48rem,92vw)]"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Preview
                    </p>
                    <Button
                      ref={closeRef}
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label="Close preview"
                      onClick={() => setPreviewOpen(false)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Close
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Previous template"
                        onClick={() => stepTemplate(-1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <p
                        className="min-w-[8.5rem] text-center text-sm font-semibold"
                        aria-live="polite"
                      >
                        {currentTemplate.name}
                        <span className="block text-[0.65rem] font-normal text-muted-foreground">
                          {currentIndex + 1} of {TEMPLATE_OPTIONS.length}
                        </span>
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Next template"
                        onClick={() => stepTemplate(1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      role="group"
                      aria-label="Template colour"
                    >
                      {currentTemplate.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Use colour ${color}`}
                          aria-pressed={selectedColor.toLowerCase() === color.toLowerCase()}
                          onClick={() => onSelectColor(currentTemplate.id, color)}
                          className="h-6 w-6 rounded-full border-2 border-white shadow ring-1 ring-border transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-primary"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                    <Button type="button" size="sm" className="ml-auto" onClick={onContinue}>
                      Use this template
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-secondary/30 p-3 sm:p-5">
                    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-inner">
                      <ResumeDocument data={data} accentColor={selectedColor} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </div>
  );
}
