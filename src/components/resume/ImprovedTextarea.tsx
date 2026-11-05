import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage, improveResumeBullets, type ResumeSection } from "@/lib/resumeApi";

interface Props {
  id: string;
  label: string;
  value: string;
  rows: number;
  placeholder: string;
  section: ResumeSection;
  targetRole?: string;
  requiredMessage?: string;
  onChange: (value: string) => void;
}

export function ImprovedTextarea({
  id,
  label,
  value,
  rows,
  placeholder,
  section,
  targetRole = "",
  requiredMessage,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ before: string; after: string }>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const run = async () => {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      setErrorMessage(`Add ${label.toLowerCase()} details before requesting suggestions.`);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuggestions([]);
    try {
      setSuggestions(await improveResumeBullets(lines, targetRole, section));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, `Could not improve ${label.toLowerCase()}.`));
    } finally {
      setLoading(false);
    }
  };

  const accept = (suggestion: { before: string; after: string }) => {
    const lines = value.split(/\r?\n/);
    const index = lines.findIndex((line) => line.trim() === suggestion.before);
    if (index < 0) {
      setErrorMessage("The original text changed. Regenerate suggestions for the current text.");
      return;
    }
    lines[index] = suggestion.after;
    onChange(lines.join("\n"));
    setSuggestions((items) => items.filter((item) => item !== suggestion));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={run}
          disabled={loading}
          className="shrink-0 text-accent hover:bg-accent/10 hover:text-accent"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="ml-1.5 text-xs">
            {loading ? "Improving…" : suggestions.length ? "Regenerate" : "Improve with AI"}
          </span>
        </Button>
      </div>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setSuggestions([]);
          setErrorMessage(null);
        }}
        placeholder={placeholder}
        className="transition-shadow focus-visible:ring-accent"
      />
      {requiredMessage && !value.trim() && (
        <p className="text-xs text-destructive">{requiredMessage}</p>
      )}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage.includes("AI not configured") ? "AI unavailable. " : ""}
          {errorMessage}
        </p>
      )}
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.before}-${index}`}
          className="toon space-y-2 rounded-md p-3 text-sm"
        >
          <p>
            <span className="font-medium">Before:</span> {suggestion.before}
          </p>
          <p>
            <span className="font-medium">Suggestion:</span> {suggestion.after}
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={() => accept(suggestion)}>
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSuggestions((items) => items.filter((item) => item !== suggestion))}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
