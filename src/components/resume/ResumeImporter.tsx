import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parseResume, convertToResumeData, type ParsedResume } from "@/lib/resumeParser";
import type { ResumeData } from "./types";

interface Props {
  onParsed: (fields: Omit<ResumeData, "template">) => void;
}

export function ResumeImporter({ onParsed }: Props) {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);

  const handleParse = async () => {
    if (rawText.trim().length < 20) {
      toast.error("Please paste more resume content");
      return;
    }

    setLoading(true);
    try {
      // Simulate parsing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = parseResume(rawText);
      setParsed(result);
      setShowPreview(true);
      toast.success("Resume parsed successfully");
    } catch (e) {
      toast.error("Failed to parse resume. Please check format.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!parsed) return;

    try {
      const resumeData = convertToResumeData(parsed);
      onParsed(resumeData);
      setRawText("");
      setParsed(null);
      setShowPreview(false);
      toast.success("Resume imported successfully");
    } catch (e) {
      toast.error("Failed to import resume");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Paste Your Resume Text</label>
        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste your unstructured resume content here. Example: I'm Ada Lovelace, ada@email.com. I'm a Senior Engineer at Acme..."
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Supports: name, email, phone, education, skills, internships, projects, experience, certifications
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleParse}
          disabled={loading || rawText.trim().length < 20}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {loading ? "Parsing…" : "Parse Resume"}
        </Button>
      </div>

      {showPreview && parsed && (
        <div className="bg-secondary/40 border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">Preview</h3>

          {parsed.name && <p><strong>Name:</strong> {parsed.name}</p>}
          {parsed.email && <p><strong>Email:</strong> {parsed.email}</p>}
          {parsed.skills.length > 0 && (
            <p><strong>Skills:</strong> {parsed.skills.slice(0, 5).join(", ")}...</p>
          )}
          {parsed.experience.length > 0 && (
            <p><strong>Experience:</strong> {parsed.experience.length} role(s) found</p>
          )}
          {parsed.projects.length > 0 && (
            <p><strong>Projects:</strong> {parsed.projects.length} project(s) found</p>
          )}
          {parsed.internships.length > 0 && (
            <p><strong>Internships:</strong> {parsed.internships.length} internship(s) found</p>
          )}
          {parsed.achievements.length > 0 && (
            <p><strong>Achievements:</strong> {parsed.achievements.length} achievement(s) found</p>
          )}
          {parsed.certifications.length > 0 && (
            <p><strong>Certifications:</strong> {parsed.certifications.length} certification(s) found</p>
          )}

          <Button
            onClick={handleImport}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Import to Resume
          </Button>
        </div>
      )}
    </div>
  );
}
