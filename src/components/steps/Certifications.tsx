import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generatingField: string | null;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateField: (field: "certifications") => void;
}

export default function Certifications({ data, generatingField, onUpdate, onGenerateField }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="certifications">Certifications</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => onGenerateField("certifications")} disabled={generatingField === "certifications"} className="text-accent hover:bg-accent/10 hover:text-accent">
          {generatingField === "certifications" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span className="ml-1 text-xs">{generatingField === "certifications" ? "Generating..." : "Generate"}</span>
        </Button>
      </div>
      <Textarea id="certifications" rows={6} value={data.certifications} onChange={(event) => onUpdate("certifications", event.target.value)} placeholder="Certifications, badges, trainings, licenses..." className="transition-shadow focus-visible:ring-accent" />
    </div>
  );
}
