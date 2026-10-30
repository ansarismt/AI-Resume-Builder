import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage, parseResume } from "@/lib/resumeApi";
import { emptyResume, type ResumeData } from "./types";

interface Props {
  onParsed: (fields: Omit<ResumeData, "template">) => void;
}

export function ResumeImporter({ onParsed }: Props) {
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Partial<ResumeData> | null>(null);

  const handleParse = async () => {
    if (!file && rawText.trim().length < 20) {
      setErrorMessage("Paste at least 20 characters or upload a PDF/DOCX file.");
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      setErrorMessage("Resume files must be 5 MB or smaller.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      setParsed(await parseResume(rawText, file));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Resume parsing failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!parsed) return;
    const data = { ...emptyResume, ...parsed };
    const { template: _template, ...fields } = data;
    onParsed(fields);
    setRawText("");
    setFile(undefined);
    setParsed(null);
    setErrorMessage(null);
  };

  const parsedDetails = parsed
    ? [
        ["Name", parsed.name],
        ["Email", parsed.email],
        ["Phone", parsed.phone],
        ["Education", parsed.education],
        ["Skills", parsed.skills],
        ["Experience", parsed.experience],
        ["Projects", parsed.projects],
        ["Internships", parsed.internships],
        ["Certifications", parsed.certifications],
        ["Achievements", parsed.achievements],
      ].filter(([, value]) => typeof value === "string" && value.trim())
    : [];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="resume-import-text" className="mb-2 block text-sm font-medium">
          Paste resume text
        </label>
        <Textarea
          id="resume-import-text"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="Paste resume text to extract facts into the form."
          rows={5}
          className="resize-y"
          disabled={loading}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          PDF/DOCX uploads are also supported (5 MB max).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline">
          <FileUp className="h-4 w-4" />
          {file?.name ?? "Choose PDF or DOCX"}
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => {
              setFile(event.target.files?.[0]);
              setParsed(null);
              setErrorMessage(null);
            }}
            disabled={loading}
          />
        </label>
        <Button
          type="button"
          onClick={handleParse}
          disabled={loading || (!file && rawText.trim().length < 20)}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2 h-4 w-4" />
          )}
          {loading ? "Parsing…" : "Parse Resume"}
        </Button>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {errorMessage.includes("AI not configured") ? "AI unavailable. " : ""}
          {errorMessage}
        </p>
      )}

      {parsed && (
        <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
          <h3 className="font-semibold">Review extracted details</h3>
          {parsedDetails.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No supported fields were found. You can still fill the form manually.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {parsedDetails.map(([label, value]) => (
                <li key={label}>
                  <strong>{label}:</strong> {String(value).slice(0, 180)}
                </li>
              ))}
            </ul>
          )}
          <Button type="button" onClick={handleImport} className="w-full">
            Use these details
          </Button>
        </div>
      )}
    </div>
  );
}
