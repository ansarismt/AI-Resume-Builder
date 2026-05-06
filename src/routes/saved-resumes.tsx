import { createFileRoute } from "@tanstack/react-router";
import { SavedResumes } from "@/components/resume/SavedResumes";

export const Route = createFileRoute("/saved-resumes")({
  component: SavedResumesPage,
});

function SavedResumesPage() {
  // Minimal page wrapper to show the saved resumes list standalone
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-4">Saved resumes</h1>
        <div className="bg-card border border-border rounded-xl p-4">
          <SavedResumes
            refreshKey={0}
            onLoad={() => { /* noop - open in-place via existing UI */ }}
            currentId={null}
            onDeleted={() => { /* noop */ }}
          />
        </div>
      </div>
    </div>
  );
}
