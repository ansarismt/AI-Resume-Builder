import { memo } from "react";

import { ResumePreview as ExistingResumePreview } from "@/components/resume/ResumePreview";
import type { ResumeData } from "@/components/resume/types";

export const ProfessionalPreview = memo(function ProfessionalPreview({ data }: { data: ResumeData }) {
  return <ExistingResumePreview data={data} />;
});
