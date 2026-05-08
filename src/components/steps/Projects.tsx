import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generatingField: string | null;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateField: (field: "projects") => void;
}

export default function Projects({ data, generatingField, onUpdate, onGenerateField }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="projects">Projects</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => onGenerateField("projects")} disabled={generatingField === "projects"} className="text-accent hover:bg-accent/10 hover:text-accent">
          {generatingField === "projects" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span className="ml-1 text-xs">{generatingField === "projects" ? "Generating..." : "Generate"}</span>
        </Button>
      </div>
      <Textarea id="projects" rows={7} value={data.projects} onChange={(event) => onUpdate("projects", event.target.value)} placeholder="Highlight your best academic or personal projects here." className="transition-shadow focus-visible:ring-accent" />
    </div>
  );
}
