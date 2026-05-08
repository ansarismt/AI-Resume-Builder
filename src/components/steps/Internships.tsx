import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generatingField: string | null;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateField: (field: "internships") => void;
}

export default function Internships({ data, generatingField, onUpdate, onGenerateField }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="internships">Internships</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => onGenerateField("internships")} disabled={generatingField === "internships"} className="text-accent hover:bg-accent/10 hover:text-accent">
          {generatingField === "internships" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span className="ml-1 text-xs">{generatingField === "internships" ? "Generating..." : "Generate"}</span>
        </Button>
      </div>
      <Textarea id="internships" rows={6} value={data.internships} onChange={(event) => onUpdate("internships", event.target.value)} placeholder="Add internships, training, research roles, or practical experience." className="transition-shadow focus-visible:ring-accent" />
    </div>
  );
}
