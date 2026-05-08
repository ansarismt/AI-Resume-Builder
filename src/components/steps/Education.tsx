import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generatingField: string | null;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateField: (field: "education") => void;
}

export default function Education({ data, generatingField, onUpdate, onGenerateField }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="education">Education</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => onGenerateField("education")} disabled={generatingField === "education"} className="text-accent hover:bg-accent/10 hover:text-accent">
          {generatingField === "education" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span className="ml-1 text-xs">{generatingField === "education" ? "Generating..." : "Draft for me"}</span>
        </Button>
      </div>
      <Textarea id="education" rows={6} value={data.education} onChange={(event) => onUpdate("education", event.target.value)} placeholder="Write your academic background in detail." className="transition-shadow focus-visible:ring-accent" />
      {!data.education.trim() && <p className="text-xs text-destructive">Education is required for this step.</p>}
    </div>
  );
}
