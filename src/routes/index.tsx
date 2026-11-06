import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState, useEffect, useRef } from "react";
import { HelpCircle, ChevronDown, FileText, Gauge, Clock, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedResumes } from "@/components/resume/SavedResumes";
import {
  computeResumeHealth,
  formatRelativeTime,
  hasContent,
} from "@/components/resume/resumeInsights";
import {
  emptyResume,
  type ResumeData,
  type SavedResume,
  type TemplateId,
} from "@/components/resume/types";
import {
  createResume,
  downloadResumeExport,
  getApiErrorMessage,
  getResume,
  updateResume,
} from "@/lib/resumeApi";
import { useAuth } from "@/lib/auth";
import { downloadTextFile, resumeToHtml, resumeToMarkdown } from "@/lib/clientExports";
import { clearDraft, loadDraft, saveDraft, type Draft } from "@/lib/draft";
import { toast } from "sonner";
import { DashboardSections, SectionHeader } from "@/components/dashboard/DashboardSections";
import { ResumeWizard } from "@/pages/ResumeWizard";
import { ResumePreviewPage } from "@/pages/ResumePreviewPage";
import { TemplateSelectionPage } from "@/pages/TemplateSelectionPage";
import { FinalizeResumePage } from "@/pages/FinalizeResumePage";
import { FLOW_STEPS, getTemplateDefaultColor, type FlowStage } from "@/pages/resumeFlow";

const LandingPage = lazy(() =>
  import("@/components/landing/LandingPage").then((module) => ({ default: module.LandingPage })),
);

export const Route = createFileRoute("/")({
  component: Index,
});

function openResumePrintDialog(name: string) {
  if (!document.querySelector("#resume-print .rd-wrap")) {
    throw new Error("The resume preview is not ready to print.");
  }
  const previousTitle = document.title;
  const restoreTitle = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };
  window.addEventListener("afterprint", restoreTitle, { once: true });
  document.title = `${name.trim().replace(/\s+/g, "_") || "Resume"}_Resume`;
  try {
    window.print();
  } catch (error) {
    restoreTitle();
    throw error;
  }
}

function Index() {
  const { isAuthenticated, isStaff, username } = useAuth();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [savedKey, setSavedKey] = useState(0);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [flowStage, setFlowStage] = useState<FlowStage>("wizard");
  const [saving, setSaving] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const savedSnapshot = useRef<string>(JSON.stringify(emptyResume));
  const [selectedTemplateColor, setSelectedTemplateColor] = useState(
    getTemplateDefaultColor(emptyResume.template),
  );

  const handleLoad = (r: SavedResume) => {
    setData({
      name: r.name,
      email: r.email,
      phone: r.phone,
      user_type: r.user_type,
      detected_user_type: r.detected_user_type,
      highest_education: r.highest_education,
      is_studying: r.is_studying,
      years_of_experience: r.years_of_experience,
      skills: r.skills,
      experience: r.experience,
      education: r.education,
      internships: r.internships,
      achievements: r.achievements,
      projects: r.projects,
      certifications: r.certifications,
      summary: r.summary,
      template: r.template,
      accent_color: r.accent_color ?? "",
      title: r.title ?? "",
      job_title_target: r.job_title_target ?? "",
      links: r.links ?? {},
      location: r.location ?? "",
    });
    setCurrentId(r.id);
    setLastSavedAt(r.updated_at ?? r.created_at ?? null);
    savedSnapshot.current = JSON.stringify(r);
    setSelectedTemplateColor(r.accent_color || getTemplateDefaultColor(r.template));
    setFlowStage("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNew = (template?: TemplateId) => {
    setData({ ...emptyResume, template: template ?? emptyResume.template });
    setCurrentId(null);
    setLastSavedAt(null);
    savedSnapshot.current = JSON.stringify({
      ...emptyResume,
      template: template ?? emptyResume.template,
    });
    setSelectedTemplateColor(getTemplateDefaultColor(template ?? emptyResume.template));
    setFlowStage("wizard");
  };

  const handleSaved = async (id: string) => {
    try {
      const latestResume = await getResume(id);
      setData(latestResume);
      savedSnapshot.current = JSON.stringify(latestResume);
      setLastSavedAt(latestResume.updated_at ?? new Date().toISOString());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resume saved, but refresh failed");
    } finally {
      setCurrentId(id);
      setSavedKey((k) => k + 1);
    }
  };

  const handleDeleted = (id: string) => {
    if (currentId === id) handleNew();
  };

  // Track unsaved edits and keep a local draft so a closed tab never loses work.
  useEffect(() => {
    setDirty(JSON.stringify(data) !== savedSnapshot.current);
  }, [data]);

  useEffect(() => {
    if (!isAuthenticated || !hasContent(data)) return;
    const timer = window.setTimeout(() => saveDraft(username, data, currentId), 800);
    return () => window.clearTimeout(timer);
  }, [data, currentId, isAuthenticated, username]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const draft = loadDraft(username);
    if (draft && hasContent(draft.data)) setPendingDraft(draft);
  }, [isAuthenticated, username]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const restoreDraft = () => {
    if (!pendingDraft) return;
    setData({ ...emptyResume, ...pendingDraft.data });
    setCurrentId(pendingDraft.resumeId);
    setSelectedTemplateColor(
      pendingDraft.data.accent_color || getTemplateDefaultColor(pendingDraft.data.template),
    );
    setPendingDraft(null);
    setFlowStage("wizard");
    toast.success("Draft restored");
  };

  const discardDraft = () => {
    clearDraft(username);
    setPendingDraft(null);
  };

  const handleSavedCount = useCallback((count: number) => {
    setSavedCount(count);
  }, []);

  const saveResumeAndGetId = async (): Promise<string | null> => {
    if (!data.name.trim() || !data.email.trim()) {
      toast.error("Name and email are required");
      return null;
    }

    setSaving(true);
    try {
      const resumeData = { ...data, accent_color: selectedTemplateColor };
      let id = currentId;
      if (currentId) {
        await updateResume(currentId, resumeData);
        toast.success("Resume updated");
        await handleSaved(currentId);
      } else {
        const created = await createResume(resumeData);
        id = created.id;
        toast.success("Resume saved");
        await handleSaved(created.id);
      }
      clearDraft(username);
      return id;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Save failed"));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResume = async () => Boolean(await saveResumeAndGetId());

  const downloadExport = async (format: "docx" | "json" | "txt") => {
    const id = await saveResumeAndGetId();
    if (!id) return;
    try {
      const blob = await downloadResumeExport(id, format, selectedTemplateColor);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${data.name.replace(/\s+/g, "_")}_Resume.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast.success(`Resume downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Could not download ${format.toUpperCase()}`));
    }
  };

  const handleExportPdf = async () => {
    try {
      const id = await saveResumeAndGetId();
      if (!id) return;
      openResumePrintDialog(data.name);
      toast.info("Choose Save as PDF in the print dialog.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the print dialog");
    }
  };
  const handleExportDocx = () => downloadExport("docx");
  const handleExportJson = () => downloadExport("json");
  const handleExportTxt = () => downloadExport("txt");
  const handleExportMd = () => {
    downloadTextFile(
      `${data.name.replace(/\s+/g, "_") || "Resume"}_Resume.md`,
      "text/markdown",
      resumeToMarkdown(data),
    );
    toast.success("Resume downloaded as Markdown");
  };
  const handleExportHtml = () => {
    downloadTextFile(
      `${data.name.replace(/\s+/g, "_") || "Resume"}_Resume.html`,
      "text/html",
      resumeToHtml(data, selectedTemplateColor),
    );
    toast.success("Resume downloaded as HTML");
  };
  const exportPdfRef = useRef<() => void | Promise<void>>(() => {});
  exportPdfRef.current = handleExportPdf;

  const handleExportAll = async () => {
    const id = await saveResumeAndGetId();
    if (!id) return;
    try {
      for (const format of ["docx", "json", "txt"] as const) {
        const blob = await downloadResumeExport(id, format, selectedTemplateColor);
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${data.name.replace(/\s+/g, "_")}_Resume.${format}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
      openResumePrintDialog(data.name);
      toast.info("DOCX, JSON, and TXT saved. Choose Save as PDF in the print dialog.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not download all formats"));
    }
  };

  const handleImported = (fields: Omit<ResumeData, "template">) => {
    setData((prev) => ({ ...fields, template: prev.template }));
    setCurrentId(null);
    setFlowStage("wizard");
  };

  const goToStage = (stage: FlowStage) => {
    const targetIndex = FLOW_STEPS.findIndex((item) => item.id === stage);
    const currentIndex = FLOW_STEPS.findIndex((item) => item.id === flowStage);

    if (
      targetIndex > currentIndex &&
      stage !== "wizard" &&
      (!data.name.trim() || !data.email.trim())
    ) {
      toast.error("Complete your name and email before moving ahead");
      return;
    }

    setFlowStage(stage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveRef = useRef<() => void | Promise<unknown>>(() => {});
  saveRef.current = () => saveResumeAndGetId();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (e.key === "Escape") setShowKeyboardShortcuts(false);
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === "?" && !typing) {
          e.preventDefault();
          setShowKeyboardShortcuts((value) => !value);
        }
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "p") {
        e.preventDefault();
        exportPdfRef.current();
      } else if (key === "s") {
        e.preventDefault();
        void saveRef.current();
      } else if (key === "?" || (key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowKeyboardShortcuts((value) => !value);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#new") {
      handleNew();
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (hash === "#saved-resumes") {
      const el = document.getElementById("saved-resumes-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  useEffect(() => {
    const onOpenSaved = () => {
      const el = document.getElementById("saved-resumes-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("open-saved", onOpenSaved as EventListener);
    return () => {
      window.removeEventListener("open-saved", onOpenSaved as EventListener);
    };
  }, []);

  const health = computeResumeHealth(data);

  const faqItems = [
    {
      id: "export",
      question: "What export formats are available?",
      answer:
        "You can export your resume as PDF, DOCX, JSON, and TXT. TXT provides a plain-text copy.",
    },
    {
      id: "templates",
      question: "Can I switch templates after building?",
      answer: "Yes. You can move between all 30 templates at any time without losing your details.",
    },
    {
      id: "students",
      question: "Is this useful for school and college students?",
      answer:
        "Yes. You can build resumes for school admissions, college applications, internships, fresher roles, and part-time jobs.",
    },
    {
      id: "workers",
      question: "Can working professionals use it too?",
      answer:
        "Absolutely. The builder supports work experience, projects, achievements, certifications, and multiple resume versions.",
    },
    {
      id: "save",
      question: "Can I save and edit later?",
      answer:
        "Yes. Save a resume, reopen it from Saved Resumes, update it, and export again whenever needed.",
    },
  ];

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
        <LandingPage isStaff={isStaff} />
      </Suspense>
    );
  }

  return (
    <div className="hero-glow min-h-screen overflow-x-clip">
      {showKeyboardShortcuts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="toon p-6 max-w-md w-full animate-in zoom-in-95">
            <h2 className="font-display text-lg font-bold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+P / Cmd+P</kbd>
                <span>Export as PDF</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">? / Ctrl+?</kbd>
                <span>Show shortcuts</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                <span>Close this dialog</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S / Cmd+S</kbd>
                <span>Save resume</span>
              </div>
            </div>
            <Button onClick={() => setShowKeyboardShortcuts(false)} className="w-full mt-6">
              Close
            </Button>
          </div>
        </div>
      )}

      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 pb-6 pt-10 sm:px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{username ? `, ${username}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Build, preview and export in four steps.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleNew()}>Create resume</Button>
            <Button
              variant="outline"
              onClick={() =>
                document
                  .getElementById("saved-resumes-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Saved resumes
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowKeyboardShortcuts((value) => !value)}
              title="Keyboard shortcuts (Ctrl+/Cmd+?)"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Shortcuts
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <section aria-label="Overview" className="grid gap-4 sm:grid-cols-3 no-print">
            {[
              { icon: FileText, label: "Saved resumes", value: String(savedCount) },
              { icon: Gauge, label: "Current resume health", value: `${health.score}/100` },
              {
                icon: Clock,
                label: "Last saved",
                value: lastSavedAt
                  ? formatRelativeTime(lastSavedAt)
                  : dirty
                    ? "Not saved yet"
                    : "Nothing yet",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="toon flex items-center gap-3 p-4">
                <span className="toon-icon">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold tracking-tight">{value}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </section>

      <nav
        aria-label="Page sections"
        className="sticky top-[65px] z-20 border-b border-border bg-background/90 backdrop-blur no-print"
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {[
            ["builder", "Builder"],
            ["saved-resumes-section", "Saved resumes"],
            ["toolkit", "Career toolkit"],
            ["resources", "Resources"],
            ["faq-section", "FAQ"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-14">
        {pendingDraft && (
          <div
            role="status"
            className="toon flex flex-wrap items-center justify-between gap-3 border-primary/40 p-4 no-print"
          >
            <div className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">Unsaved draft found</p>
                <p className="text-xs text-muted-foreground">
                  {pendingDraft.data.name || "Untitled resume"} - edited{" "}
                  {formatRelativeTime(new Date(pendingDraft.savedAt).toISOString())}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={restoreDraft}>
                Restore draft
              </Button>
              <Button size="sm" variant="outline" onClick={discardDraft}>
                <X className="mr-1 h-3.5 w-3.5" />
                Discard
              </Button>
            </div>
          </div>
        )}

        <div id="builder" className="scroll-mt-32 space-y-6">
          <SectionHeader
            eyebrow="Resume builder"
            title="Build, preview and export"
            text="Move through four steps. Your work is saved in this browser as you type."
          />
          <section className="toon p-3 no-print">
            <div className="grid gap-2 sm:grid-cols-4">
              {FLOW_STEPS.map((step, index) => {
                const active = step.id === flowStage;
                const completed = FLOW_STEPS.findIndex((item) => item.id === flowStage) > index;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStage(step.id)}
                    className={`rounded-lg border px-3 py-3 text-left transition-all ${
                      active
                        ? "border-accent/40 bg-accent/10 text-foreground"
                        : completed
                          ? "border-accent/20 bg-secondary/40 text-foreground hover:bg-secondary/60"
                          : "border-border bg-background/40 text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-widest">
                      Step {index + 1}
                    </span>
                    <span className="mt-1 block text-sm font-semibold">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div key={flowStage} className="stage-in">
            {flowStage === "wizard" && (
              <ResumeWizard
                data={data}
                currentId={currentId}
                onChange={setData}
                onImported={handleImported}
                onSaved={handleSaved}
                onNew={handleNew}
                onComplete={() => goToStage("preview")}
              />
            )}

            {flowStage === "preview" && (
              <ResumePreviewPage
                data={data}
                selectedColor={selectedTemplateColor}
                onEdit={() => goToStage("wizard")}
                onContinue={() => goToStage("templates")}
              />
            )}

            {flowStage === "templates" && (
              <TemplateSelectionPage
                data={data}
                selectedTemplate={data.template}
                selectedColor={selectedTemplateColor}
                onSelectTemplate={(template) => {
                  const color = getTemplateDefaultColor(template);
                  setData((prev) => ({ ...prev, template, accent_color: color }));
                  setSelectedTemplateColor(color);
                }}
                onSelectColor={(template, color) => {
                  setData((prev) => ({ ...prev, template, accent_color: color }));
                  setSelectedTemplateColor(color);
                }}
                onBack={() => goToStage("preview")}
                onContinue={() => goToStage("finalize")}
              />
            )}

            {flowStage === "finalize" && (
              <FinalizeResumePage
                data={data}
                selectedColor={selectedTemplateColor}
                saving={saving}
                onBack={() => goToStage("templates")}
                onSave={handleSaveResume}
                onExportPdf={handleExportPdf}
                onExportDocx={handleExportDocx}
                onExportJson={handleExportJson}
                onExportTxt={handleExportTxt}
                onExportMd={handleExportMd}
                onExportHtml={handleExportHtml}
                onExportAll={handleExportAll}
              />
            )}
          </div>
        </div>

        <section id="saved-resumes-section" className="scroll-mt-32 space-y-6 no-print">
          <SectionHeader
            eyebrow="Library"
            title="Saved resumes"
            text="Reopen, duplicate or delete any version you have saved."
          />
          <div className="toon p-5 sm:p-7">
            <SavedResumes
              refreshKey={savedKey}
              onLoad={handleLoad}
              currentId={currentId}
              onDeleted={handleDeleted}
              onCount={handleSavedCount}
            />
            {savedCount > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {savedCount} saved {savedCount === 1 ? "resume" : "resumes"} available.
              </p>
            )}
          </div>
        </section>

        <DashboardSections
          data={data}
          username={username}
          savedCount={savedCount}
          onNew={() => handleNew()}
          onGoToStage={goToStage}
          onPickTemplate={(template) => {
            const color = getTemplateDefaultColor(template);
            setData((prev) => ({ ...prev, template, accent_color: color }));
            setSelectedTemplateColor(color);
          }}
        />

        <section id="faq-section" className="scroll-mt-32 space-y-6 no-print">
          <SectionHeader eyebrow="Help" title="Frequently asked questions" />
          <div className="toon p-5 sm:p-7">
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-left">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                        expandedFaq === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === item.id && (
                    <div className="px-3 sm:px-4 py-3 border-t border-border bg-secondary/30 animate-in fade-in">
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
