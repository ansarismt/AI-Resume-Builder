import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Experience({ data, onUpdate }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="experience">Work Experience</Label>
      <Textarea id="experience" rows={8} value={data.experience} onChange={(event) => onUpdate("experience", event.target.value)} placeholder="Write roles, responsibilities, impact, leadership, and measurable outcomes." className="transition-shadow focus-visible:ring-accent" />
      {!data.experience.trim() && <p className="text-xs text-destructive">Work experience is required for this step.</p>}
    </div>
  );
}
