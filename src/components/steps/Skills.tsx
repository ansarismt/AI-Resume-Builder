import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Skills({ data, onUpdate }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="skills">Skills</Label>
      <Textarea id="skills" rows={6} value={data.skills} onChange={(event) => onUpdate("skills", event.target.value)} placeholder="Communication, Python, React, Excel, teamwork, SQL..." className="transition-shadow focus-visible:ring-accent" />
      {!data.skills.trim() && <p className="text-xs text-destructive">Add at least a few skills to continue.</p>}
    </div>
  );
}
