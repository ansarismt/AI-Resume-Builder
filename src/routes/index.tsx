import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState, useEffect, useRef } from "react";
import {
  Download,
  Eye,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
  NotebookPen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
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

export const Route = createFileRoute("/")({
  component: Index,
});

function LandingPage({ isStaff }: { isStaff: boolean }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <section className="relative overflow-hidden border-b border-border bg-secondary/40 text-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-accent">
              Resume builder for students and professionals
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-normal leading-[1.08] sm:text-6xl">
              Create polished resumes, save versions, and export with confidence.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Start from a guided form, choose from 20 templates, preview instantly, and manage
              resumes from your dashboard after login.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="px-5">
                <Link to="/signup">Create account</Link>
              </Button>
              <Button asChild variant="outline" className="px-5">
                <Link to="/login">Login</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                20 professional templates
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                You approve every AI suggestion
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-paper">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-accent">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Your AI writing partner</p>
                  <p className="text-xs text-muted-foreground">
                    Useful help, always in your control
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ["01", "Turn your experience into stronger bullet points"],
                  ["02", "Generate tailored professional summaries"],
                  ["03", "Import a resume and extract its key details"],
                ].map(([number, text]) => (
                  <div
                    key={number}
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3"
                  >
                    <span className="font-mono text-xs text-accent">{number}</span>
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                AI writing needs a provider key configured on the backend. Your resume data and
                provider credentials stay off the public frontend.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-bold">Built for every stage</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              [
                "School students",
                "Prepare resumes for scholarships, competitions, and first opportunities.",
              ],
              [
                "College and freshers",
                "Present projects, coursework, internships, and certifications clearly.",
              ],
              [
                "Working professionals",
                "Highlight experience, achievements, skills, and career-focused versions.",
              ],
            ].map(([title, description]) => (
              <article key={title} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-bold">A simple four-step process</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Form", "Preview", "Templates", "Finalize"].map((step, index) => (
              <div key={step} className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm font-semibold text-primary">Step {index + 1}</p>
                <h3 className="mt-2 font-semibold">{step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {
                    [
                      "Add your contact details, education, skills, and experience.",
                      "Review your content and make any edits.",
                      "Select from 20 layouts to suit your needs.",
                      "Save your resume and export it in your preferred format.",
                    ][index]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-bold">A simpler way to build your resume</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              "Build a resume for school, college, or professional roles.",
              "Get writing suggestions when you want a little help.",
              "Save versions and export PDF, DOCX, JSON, or TXT files.",
            ].map((text) => (
              <div key={text} className="rounded-lg border border-border bg-card p-5">
                <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Can I choose from different resume styles?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes. Preview and choose from 20 templates, and change your selection at any time.
              </p>
            </article>
            <article className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Will suggestions change my resume automatically?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No. Suggestions are optional, and you decide whether to use them.
              </p>
            </article>
            <article className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Which download formats are available?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Download PDF, DOCX, JSON, and TXT files from the resume workflow.
              </p>
            </article>
            <article className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold">Can I save and edit a resume later?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create an account to save resumes and return to update them later.
              </p>
            </article>
          </div>
        </div>
      </section>

      {isStaff && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <Button asChild variant="outline">
              <Link to="/admin-panel">Open Admin Panel</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

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
    return <LandingPage isStaff={isStaff} />;
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-lg animate-in zoom-in-95">
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

      <section className="border-b border-border bg-secondary/40 text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              <Sparkles className="h-4 w-4" /> Resume builder for school, college, and career growth
            </p>
            <h2 className="max-w-3xl font-display text-4xl font-normal leading-[1.08] sm:text-5xl">
              Build a resume that feels clear, polished, and ready to send.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Build a polished resume for school, college, or your next role. Get real AI writing
              help, preview 20 designs, and export the version that feels like you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => handleNew()} className="px-5">
                Create Resume
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("saved-resumes-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-5"
              >
                View Saved Resumes
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
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-paper">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-accent">
                  <NotebookPen className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Your career toolkit</p>
                  <p className="text-xs text-muted-foreground">
                    A better resume, one step at a time
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold">AI writing suggestions</p>
                    <p className="text-xs text-muted-foreground">
                      Generate summaries and strengthen experience bullets.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                  <NotebookPen className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold">Start from your existing resume</p>
                    <p className="text-xs text-muted-foreground">
                      Import a PDF or DOCX and review extracted details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                  <Eye className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold">Preview, choose, and export</p>
                    <p className="text-xs text-muted-foreground">
                      20 templates with PDF, DOCX, JSON, and TXT downloads.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Download className="h-4 w-4 text-accent" />
                Your information stays yours; AI never adds facts for you.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">20</div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                Templates
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">4</div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                Export Formats
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">24</div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                Job Categories
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">∞</div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Versions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <h2 className="font-display text-2xl font-bold mb-6 sm:mb-8">Built For Every Stage</h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <GraduationCap className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-2 text-sm sm:text-base">School Students</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Prepare resumes for scholarships, competitions, and first opportunities.
              </p>
            </div>
            <div className="p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <NotebookPen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-2 text-sm sm:text-base">
                College & Freshers
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Show projects, internships, coursework, and certifications clearly.
              </p>
            </div>
            <div className="p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <BriefcaseBusiness className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-2 text-sm sm:text-base">
                Working Professionals
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Present experience, achievements, skills, and multiple career-focused versions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <h2 className="font-display text-2xl font-bold mb-6">
            A straightforward way to build your resume
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "Simple layout with clear resume sections",
              "Instant preview while editing",
              "Save, reopen, and export multiple versions",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-accent mb-3" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <section className="rounded-xl border border-border bg-card p-3 shadow-sm no-print">
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
                  <span className="block text-[0.65rem] font-mono uppercase tracking-widest">
                    Step {index + 1}
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{step.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
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

        <section
          id="saved-resumes-section"
          className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 no-print"
        >
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

        <section className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm no-print">
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
