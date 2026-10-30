import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Projects({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="projects"
      label="Projects"
      section="projects"
      rows={7}
      value={data.projects}
      onChange={(value) => onUpdate("projects", value)}
      placeholder="Highlight your best academic or personal projects here."
      targetRole={data.job_title_target}
    />
  );
}
