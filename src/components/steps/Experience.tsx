import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Experience({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="experience"
      label="Work Experience"
      section="experience"
      rows={8}
      value={data.experience}
      onChange={(value) => onUpdate("experience", value)}
      placeholder="Write roles, responsibilities, impact, leadership, and measurable outcomes."
      targetRole={data.job_title_target}
      requiredMessage="Work experience is required for this step."
    />
  );
}
