import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Internships({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="internships"
      label="Internships"
      section="internships"
      rows={6}
      value={data.internships}
      onChange={(value) => onUpdate("internships", value)}
      placeholder="Add internships, training, research roles, or practical experience."
      targetRole={data.job_title_target}
    />
  );
}
