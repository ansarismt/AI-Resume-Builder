import { useEffect, useState } from "react";
import { AlertCircle, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import axios from "axios";
import { deleteResume, getApiErrorMessage, listResumes } from "@/lib/resumeApi";

import { TEMPLATE_IDS, type SavedResume, type TemplateId } from "./types";

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  template1: "Editorial",
  template2: "Modern",
  template3: "Minimal",
  template4: "Compact",
  template5: "Terminal",
  template6: "Classic",
  template7: "Gradient",
  template8: "Two-Column",
  template9: "Color Block",
  template10: "Executive",
  template11: "Mono",
  template12: "Split",
  template13: "Creative",
  template14: "Clean",
};

interface Props {
  refreshKey: number;
  onLoad: (resume: SavedResume) => void;
  currentId: string | null;
  onDeleted: (id: string) => void;
  onCount?: (count: number) => void;
}

export function SavedResumes({ refreshKey, onLoad, currentId, onDeleted, onCount }: Props) {
  const [items, setItems] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);

    listResumes()
      .then((resumes) => {
        if (!active) return;

        const normalized = resumes.map((resume) => ({
          ...resume,
          template: (TEMPLATE_IDS.includes(resume.template as TemplateId)
            ? resume.template
            : "template1") as TemplateId,
        }));

        setItems(normalized);
        onCount?.(normalized.length);
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;

        console.error(error);
        setItems([]);
        onCount?.(0);
        setLoadError(
          axios.isAxiosError(error) && error.response?.status === 401
            ? "Your session has expired. Sign in again to view saved resumes."
            : getApiErrorMessage(
                error,
                "Could not load saved resumes. Check that the Django backend is running.",
              ),
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey, onCount]);

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm("Delete this resume? This can't be undone.")) return;

    setDeletingId(id);

    try {
      await deleteResume(id);

      const nextItems = items.filter((resume) => resume.id !== id);
      setItems(nextItems);
      onCount?.(nextItems.length);
      onDeleted(id);
      toast.success("Resume deleted");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="font-medium text-foreground">Could not load saved resumes</p>
            <p className="mt-1">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-sm italic text-muted-foreground">
        No saved resumes yet. Save one to see it here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((resume) => (
        <li
          key={resume.id}
          className={`flex items-center gap-2 ${currentId === resume.id ? "bg-accent/5" : ""}`}
        >
          <button
            onClick={() => onLoad(resume)}
            className="group flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition-colors hover:text-accent"
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {resume.name}
                {currentId === resume.id && (
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-accent">
                    Editing
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {resume.email}
                {resume.phone ? ` | ${resume.phone}` : ""}
              </div>
              <div className="truncate text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {resume.user_type}
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {TEMPLATE_LABELS[resume.template]}
            </span>
          </button>
          <button
            onClick={(event) => handleDelete(resume.id, event)}
            disabled={deletingId === resume.id}
            className="p-2 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
            aria-label="Delete resume"
          >
            {deletingId === resume.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
