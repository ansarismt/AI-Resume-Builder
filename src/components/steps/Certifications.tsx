import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Certifications({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="certifications"
      label="Certifications"
      section="certifications"
      rows={6}
      value={data.certifications}
      onChange={(value) => onUpdate("certifications", value)}
      placeholder="Certifications, badges, trainings, licenses..."
      targetRole={data.job_title_target}
    />
  );
}
