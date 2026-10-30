import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/components/resume/types";

interface Props {
  data: ResumeData;
  generating: boolean;
  suggestions: string[];
  errorMessage: string | null;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onGenerateSummary: () => void;
  onAcceptSuggestion: (suggestion: string) => void;
  onRejectSuggestion: (index: number) => void;
}

export default function Summary({
  data,
  generating,
  suggestions,
  errorMessage,
  onUpdate,
  onGenerateSummary,
  onAcceptSuggestion,
  onRejectSuggestion,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary">Professional Summary</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onGenerateSummary}
          disabled={generating}
          className="text-accent hover:bg-accent/10 hover:text-accent"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="ml-1.5 text-xs">{generating ? "Drafting..." : "Improve with AI"}</span>
        </Button>
      </div>
      <Textarea
        id="summary"
        rows={6}
        value={data.summary}
        onChange={(event) => onUpdate("summary", event.target.value)}
        placeholder="Write a short professional summary focused on experience, skills, and impact."
        className="transition-shadow focus-visible:ring-accent"
      />
      {!data.summary.trim() && (
        <p className="text-xs text-destructive">Professional summary is required for this step.</p>
      )}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage.includes("AI not configured") ? "AI unavailable. " : ""}
          {errorMessage}
        </p>
      )}
      {suggestions.map((suggestion, index) => (
        <div
          key={`${index}-${suggestion}`}
          className="space-y-2 rounded-md border border-border bg-card p-3"
        >
          <p className="text-sm">{suggestion}</p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={() => onAcceptSuggestion(suggestion)}>
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onRejectSuggestion(index)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
