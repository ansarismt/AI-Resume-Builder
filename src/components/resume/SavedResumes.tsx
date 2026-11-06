import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Copy, FileText, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import axios from "axios";
import { createResume, deleteResume, getApiErrorMessage, listResumes } from "@/lib/resumeApi";
import { formatRelativeTime } from "./resumeInsights";

import { TEMPLATE_CATALOG } from "./templateCatalog";
import { TEMPLATE_IDS, type SavedResume, type TemplateId } from "./types";

const TEMPLATE_LABELS = Object.fromEntries(
  TEMPLATE_CATALOG.map((template) => [template.id, template.name]),
) as Record<TemplateId, string>;

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
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);

    listResumes()
      .then((resumes) => {
        if (!active) return;

        const normalized = resumes.map((resume) => ({
          ...resume,
          template: ((TEMPLATE_IDS as readonly string[]).includes(resume.template)
            ? resume.template
            : "template1") as TemplateId,
        }));

        setItems(normalized);
        onCount?.(normalized.length);
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;

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
      toast.error(getApiErrorMessage(error, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (resume: SavedResume, event: React.MouseEvent) => {
    event.stopPropagation();
    setDuplicatingId(resume.id);
    try {
      const copy = await createResume({
        ...resume,
        title: `${resume.title || resume.name} (copy)`,
      });
      setItems((current) => {
        const next = [copy as SavedResume, ...current];
        onCount?.(next.length);
        return next;
      });
      toast.success("Resume duplicated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not duplicate the resume"));
    } finally {
      setDuplicatingId(null);
    }
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? items.filter((resume) =>
          [resume.name, resume.title, resume.email, resume.job_title_target, resume.user_type]
            .join(" ")
            .toLowerCase()
            .includes(needle),
        )
      : items;
    return [...filtered].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : String(b.updated_at ?? b.created_at).localeCompare(String(a.updated_at ?? a.created_at)),
    );
  }, [items, query, sort]);

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
    <>
      {items.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search saved resumes</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, role or email"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
            />
          </label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as "recent" | "name")}
            aria-label="Sort saved resumes"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="recent">Most recent</option>
            <option value="name">Name A to Z</option>
          </select>
        </div>
      )}
      {visible.length === 0 && (
        <p className="py-4 text-sm italic text-muted-foreground">No resumes match your search.</p>
      )}
      <ul className="divide-y divide-border">
        {visible.map((resume) => (
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
                  {resume.title ? `${resume.title} | ` : ""}
                  {resume.user_type}
                  {resume.updated_at ? ` | updated ${formatRelativeTime(resume.updated_at)}` : ""}
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {TEMPLATE_LABELS[resume.template]}
              </span>
            </button>
            <button
              onClick={(event) => handleDuplicate(resume, event)}
              disabled={duplicatingId === resume.id}
              className="p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              aria-label="Duplicate resume"
              title="Duplicate"
            >
              {duplicatingId === resume.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
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
    </>
  );
}
