import { ImprovedTextarea } from "@/components/resume/ImprovedTextarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function Achievements({ data, onUpdate }: Props) {
  return (
    <ImprovedTextarea
      id="achievements"
      label="Achievements / Activities"
      section="achievements"
      rows={6}
      value={data.achievements}
      onChange={(value) => onUpdate("achievements", value)}
      placeholder="Olympiad rank, sports captaincy, club work, volunteering..."
      targetRole={data.job_title_target}
      requiredMessage="Achievements are required for this step."
    />
  );
}
