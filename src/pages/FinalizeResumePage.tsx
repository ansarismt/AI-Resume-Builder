import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { ExportButtons } from "@/components/ExportButtons";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import { ResumeHealthCard } from "@/components/resume/ResumeHealthCard";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  selectedColor: string;
  saving: boolean;
  onBack: () => void;
  onSave: () => Promise<boolean>;
  onExportPdf: () => Promise<void> | void;
  onExportDocx: () => Promise<void>;
  onExportJson: () => Promise<void> | void;
  onExportTxt: () => Promise<void> | void;
  onExportMd: () => Promise<void> | void;
  onExportHtml: () => Promise<void> | void;
  onExportAll: () => Promise<void>;
}

export function FinalizeResumePage({
  data,
  selectedColor,
  saving,
  onBack,
  onSave,
  onExportPdf,
  onExportDocx,
  onExportJson,
  onExportTxt,
  onExportMd,
  onExportHtml,
  onExportAll,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="toon self-start p-4 sm:p-6 lg:sticky lg:top-24">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
          Step 4
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Export and finalize</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Save your resume and download the final version in the format you need.
        </p>

        <div className="mt-5 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-foreground">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Ready for export
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Download an editable Word file in the same layout as your preview, structured JSON, or
            plain text. Choose <strong>Save as PDF</strong> in the print dialog for a selectable
            PDF.
          </p>
        </div>

        <div className="mt-5">
          <ExportButtons
            saving={saving}
            onSave={onSave}
            onExportPdf={onExportPdf}
            onExportDocx={onExportDocx}
            onExportJson={onExportJson}
            onExportTxt={onExportTxt}
            onExportMd={onExportMd}
            onExportHtml={onExportHtml}
            onExportAll={onExportAll}
          />
        </div>

        <div className="mt-5">
          <ResumeHealthCard data={data} compact showCopy />
        </div>

        <Button type="button" variant="outline" onClick={onBack} className="mt-4 w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to templates
        </Button>
      </section>

      <section id="resume-print" className="toon p-3 sm:p-4">
        <ResumeDocument data={data} accentColor={selectedColor} />
      </section>
    </div>
  );
}
