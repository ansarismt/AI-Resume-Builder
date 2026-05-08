import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generating: boolean;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateSummary: () => void;
}

export default function Objective({ data, generating, onUpdate, onGenerateSummary }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary">Career Objective</Label>
        <Button type="button" variant="ghost" size="sm" onClick={onGenerateSummary} disabled={generating} className="text-accent hover:bg-accent/10 hover:text-accent">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span className="ml-1.5 text-xs">{generating ? "Drafting..." : "Draft for me"}</span>
        </Button>
      </div>
      <Textarea id="summary" rows={6} value={data.summary} onChange={(event) => onUpdate("summary", event.target.value)} placeholder="Write a short career objective tailored to the selected user type." className="transition-shadow focus-visible:ring-accent" />
      {!data.summary.trim() && <p className="text-xs text-destructive">Career objective is required for this step.</p>}
    </div>
  );
}
