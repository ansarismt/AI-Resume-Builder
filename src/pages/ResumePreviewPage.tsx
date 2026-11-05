import { ArrowLeft, ArrowRight } from "lucide-react";

import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  selectedColor: string;
  onEdit: () => void;
  onContinue: () => void;
}

export function ResumePreviewPage({ data, selectedColor, onEdit, onContinue }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
      <section className="toon self-start p-4 sm:p-6 lg:sticky lg:top-24">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
          Step 2
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Preview your resume</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Review the content before choosing a template. This page keeps the preview large and
          uncluttered.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button type="button" variant="outline" onClick={onEdit}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Edit Resume
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <section id="resume-print" className="toon p-3 sm:p-4">
        <ResumeDocument data={data} accentColor={selectedColor} />
      </section>
    </div>
  );
}
