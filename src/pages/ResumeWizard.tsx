import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumeImporter } from "@/components/resume/ResumeImporter";
import { ResumeHealthCard } from "@/components/resume/ResumeHealthCard";
import type { ResumeData, TemplateId } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  currentId: string | null;
  onChange: (data: ResumeData) => void;
  onImported: (fields: Omit<ResumeData, "template">) => void;
  onSaved: (id: string) => void;
  onNew: (template?: TemplateId) => void;
  onComplete: () => void;
}

export function ResumeWizard({
  data,
  currentId,
  onChange,
  onImported,
  onSaved,
  onNew,
  onComplete,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="toon p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg font-bold">Quick start</h3>
            <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-primary">
              Import
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paste an existing resume first, or skip this and fill the guided form below.
          </p>
          <div className="mt-4">
            <ResumeImporter onParsed={onImported} />
          </div>
        </section>
        <ResumeHealthCard data={data} compact />
      </div>

      <section className="toon p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Step 1
          </p>
          <h2 className="font-display text-2xl font-bold">Build your resume details</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Complete one focused section at a time. Template selection and exports come after the
            form.
          </p>
        </div>
        <ResumeForm
          data={data}
          onChange={onChange}
          onSaved={onSaved}
          currentId={currentId}
          onNew={onNew}
          onComplete={onComplete}
        />
      </section>
    </div>
  );
}
