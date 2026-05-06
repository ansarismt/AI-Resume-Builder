import { CollegeResume } from "./CollegeResume";
import { ProfessionalResume } from "./ProfessionalResume";
import { SchoolResume } from "./SchoolResume";
import type { ResumeData } from "./types";

export function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-paper shadow-paper">
      {data.user_type === "school" ? (
        <SchoolResume data={data} />
      ) : data.user_type === "college" ? (
        <CollegeResume data={data} />
      ) : (
        <ProfessionalResume data={data} />
      )}
    </div>
  );
}
