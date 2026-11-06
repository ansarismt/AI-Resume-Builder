import { CheckCircle2, Circle, Copy } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeResumeHealth, resumeToPlainText } from "./resumeInsights";
import type { ResumeData } from "./types";

/** Live resume-strength checklist computed in the browser from the form data. */
export function ResumeHealthCard({
  data,
  compact = false,
  showCopy = false,
}: {
  data: ResumeData;
  compact?: boolean;
  showCopy?: boolean;
}) {
  const health = useMemo(() => computeResumeHealth(data), [data]);
  const missing = health.checks.filter((check) => !check.passed);
  const tone =
    health.score >= 75 ? "bg-emerald-500" : health.score >= 50 ? "bg-amber-500" : "bg-rose-500";

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(resumeToPlainText(data));
      toast.success("Resume text copied");
    } catch {
      toast.error("Could not copy. Your browser blocked clipboard access.");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4" aria-label="Resume health">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">Resume health</p>
        <p className="text-sm">
          <span className="text-2xl font-bold tracking-tight">{health.score}</span>
          <span className="text-muted-foreground">/100 · {health.level}</span>
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={health.score}
        aria-label="Resume health score"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", tone)}
          style={{ width: `${health.score}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {health.words} words · checked in your browser
      </p>
      <ul className="mt-3 space-y-1.5 text-xs">
        {(compact ? missing.slice(0, 4) : health.checks).map((check) => (
          <li key={check.id} className="flex items-start gap-2">
            {check.passed ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className={check.passed ? "text-muted-foreground" : "text-foreground"}>
              {check.passed ? check.label : check.tip}
            </span>
          </li>
        ))}
      </ul>
      {showCopy && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={copyText}
        >
          <Copy className="mr-2 h-3.5 w-3.5" />
          Copy as plain text
        </Button>
      )}
    </div>
  );
}
