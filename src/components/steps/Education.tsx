import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Education({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="education"
      label="Education"
      section="education"
      rows={6}
      value={data.education}
      onChange={(value) => onUpdate("education", value)}
      placeholder="Write your academic background in detail."
      targetRole={data.job_title_target}
      requiredMessage="Education is required for this step."
    />
  );
}
