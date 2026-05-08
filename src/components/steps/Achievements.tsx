import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generatingField: string | null;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateField: (field: "achievements") => void;
}

export default function Achievements({ data, generatingField, onUpdate, onGenerateField }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="achievements">Achievements / Activities</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => onGenerateField("achievements")} disabled={generatingField === "achievements"} className="text-accent hover:bg-accent/10 hover:text-accent">
          {generatingField === "achievements" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span className="ml-1 text-xs">{generatingField === "achievements" ? "Generating..." : "Generate"}</span>
        </Button>
      </div>
      <Textarea id="achievements" rows={6} value={data.achievements} onChange={(event) => onUpdate("achievements", event.target.value)} placeholder="Olympiad rank, sports captaincy, club work, volunteering..." className="transition-shadow focus-visible:ring-accent" />
      {!data.achievements.trim() && <p className="text-xs text-destructive">Achievements are required for this step.</p>}
    </div>
  );
}
