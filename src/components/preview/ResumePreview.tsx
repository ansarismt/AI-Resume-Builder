import { type CSSProperties, memo, useMemo } from "react";

import type { ResumeData } from "@/components/resume/types";
import { CollegePreview } from "./CollegePreview";
import { ProfessionalPreview } from "./ProfessionalPreview";
import { SchoolPreview } from "./SchoolPreview";
import "./templateTheme.css";

interface Props {
  data: ResumeData;
  accentColor?: string;
  sticky?: boolean;
}

function getReadableTextColor(color: string) {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#111827" : "#ffffff";
}

export const ResumePreview = memo(function ResumePreview({
  data,
  accentColor = "#1f3a5f",
  sticky = true,
}: Props) {
  const preview = useMemo(() => {
    if (data.user_type === "school") return <SchoolPreview data={data} />;
    if (data.user_type === "professional") return <ProfessionalPreview data={data} />;
    return <CollegePreview data={data} />;
  }, [data]);

  const style = useMemo(
    () =>
      ({
        "--accent": accentColor,
        "--primary": accentColor,
        "--ink": "#172033",
        "--paper": "#ffffff",
        "--rule": "#d8dee8",
        "--resume-primary": accentColor,
        "--resume-primary-foreground": getReadableTextColor(accentColor),
        "--resume-soft": `${accentColor}18`,
      }) as CSSProperties,
    [accentColor],
  );

  return (
    <div className={`resume-theme${sticky ? " lg:sticky lg:top-24" : ""}`} style={style}>
      {preview}
    </div>
  );
});
