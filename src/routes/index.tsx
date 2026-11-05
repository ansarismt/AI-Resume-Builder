import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState, useEffect, useRef } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedResumes } from "@/components/resume/SavedResumes";
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
import { toast } from "sonner";
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
  const { isAuthenticated, isStaff } = useAuth();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [savedKey, setSavedKey] = useState(0);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [flowStage, setFlowStage] = useState<FlowStage>("wizard");
  const [saving, setSaving] = useState(false);
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
    setSelectedTemplateColor(r.accent_color || getTemplateDefaultColor(r.template));
    setFlowStage("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNew = (template?: TemplateId) => {
    setData({ ...emptyResume, template: template ?? emptyResume.template });
    setCurrentId(null);
    setSelectedTemplateColor(getTemplateDefaultColor(template ?? emptyResume.template));
    setFlowStage("wizard");
  };

  const handleSaved = async (id: string) => {
    try {
      const latestResume = await getResume(id);
      setData(latestResume);
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "p") {
          e.preventDefault();
          exportPdfRef.current();
        }
        if (e.key === "s") {
          e.preventDefault();
          toast.success("Keyboard shortcut: Save with Ctrl+S or Cmd+S");
        }
        if (e.key === "?") {
          e.preventDefault();
          setShowKeyboardShortcuts((value) => !value);
        }
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
      answer: "Yes. You can move between all 20 templates at any time without losing your details.",
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="toon p-6 max-w-md w-full animate-in zoom-in-95">
            <h2 className="font-display text-lg font-bold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+P / Cmd+P</kbd>
                <span>Export as PDF</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+? / Cmd+?</kbd>
                <span>Show shortcuts</span>
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your resumes</h1>
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
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
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
              onExportAll={handleExportAll}
            />
          )}
        </div>

        <section id="saved-resumes-section" className="toon p-4 sm:p-6 no-print">
          <h3 className="font-display text-lg sm:text-xl font-bold mb-3">Saved resumes</h3>
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
        </section>

        <section className="toon p-4 sm:p-6 no-print">
          <h3 className="font-display text-lg sm:text-xl font-bold mb-4">Frequently Asked</h3>
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
        </section>
      </main>
    </div>
  );
}
