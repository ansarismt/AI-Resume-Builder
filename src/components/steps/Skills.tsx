import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Skills({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="skills"
      label="Skills"
      section="skills"
      rows={6}
      value={data.skills}
      onChange={(value) => onUpdate("skills", value)}
      placeholder="Communication, Python, React, Excel, teamwork, SQL..."
      targetRole={data.job_title_target}
      requiredMessage="Add at least a few skills to continue."
    />
  );
}
