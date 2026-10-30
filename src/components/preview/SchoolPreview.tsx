import { memo } from "react";

import { ResumePreview as ExistingResumePreview } from "@/components/resume/ResumePreview";
import type { ResumeData } from "@/components/resume/types";

export const SchoolPreview = memo(function SchoolPreview({ data }: { data: ResumeData }) {
  return <ExistingResumePreview data={data} />;
});
