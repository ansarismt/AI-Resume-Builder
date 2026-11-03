import { ResumeDocument } from "./ResumeDocument";
import type { ResumeData } from "./types";

export function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-paper shadow-paper">
      <ResumeDocument data={data} />
    </div>
  );
}
