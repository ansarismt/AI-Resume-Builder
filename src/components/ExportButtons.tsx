import { useState } from "react";
import { Download, FileArchive, FileJson, FileText, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  saving: boolean;
  onSave: () => Promise<boolean>;
  onExportPdf: () => Promise<void> | void;
  onExportDocx: () => Promise<void>;
  onExportJson: () => Promise<void> | void;
  onExportTxt: () => Promise<void> | void;
  onExportAll: () => Promise<void>;
}

type ExportState = "idle" | "pdf" | "docx" | "json" | "txt" | "all";

export function ExportButtons({
  saving,
  onSave,
  onExportPdf,
  onExportDocx,
  onExportJson,
  onExportTxt,
  onExportAll,
}: Props) {
  const [exporting, setExporting] = useState<ExportState>("idle");

  const runExport = async (
    type: Exclude<ExportState, "idle">,
    action: () => Promise<void> | void,
  ) => {
    setExporting(type);
    try {
      await action();
    } finally {
      window.setTimeout(() => setExporting("idle"), 350);
    }
  };

  const busy = saving || exporting !== "idle";

  return (
    <div className="space-y-4">
      {exporting !== "idle" && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-accent">
            <span>Preparing {exporting.toUpperCase()}</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-accent" />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" onClick={() => onSave()} disabled={busy}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Resume
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("pdf", onExportPdf)}
          disabled={busy}
        >
          <Download className="mr-2 h-4 w-4" />
          Save as PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("docx", onExportDocx)}
          disabled={busy}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download Word
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("json", onExportJson)}
          disabled={busy}
        >
          <FileJson className="mr-2 h-4 w-4" />
          Download JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("txt", onExportTxt)}
          disabled={busy}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download TXT
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runExport("all", onExportAll)}
          disabled={busy}
        >
          <FileArchive className="mr-2 h-4 w-4" />
          Download all formats
        </Button>
      </div>
    </div>
  );
}
