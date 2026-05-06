import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Sparkles,
  Zap,
  Eye,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
  NotebookPen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumeImporter } from "@/components/resume/ResumeImporter";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SavedResumes } from "@/components/resume/SavedResumes";
import { emptyResume, type ResumeData, type SavedResume, type TemplateId } from "@/components/resume/types";
import { getResume } from "@/lib/resumeApi";
import { toast } from "sonner";
import { Signup } from "@/components/auth/Signup";
import { Login } from "@/components/auth/Login";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [savedKey, setSavedKey] = useState(0);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

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
    });
    setCurrentId(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNew = (template?: TemplateId) => {
    setData({ ...emptyResume, template: template ?? emptyResume.template });
    setCurrentId(null);
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

  const handleExportPdf = () => window.print();

  const handleExportDocx = async () => {
    if (!currentId) {
      toast.error("Please save your resume first");
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/resumes/${currentId}/export_docx/`,
        { method: "GET" }
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.name.replace(/\s+/g, "_")}_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded as DOCX");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(jsonContent));
    element.setAttribute("download", `${data.name.replace(/\s+/g, "_")}_Resume.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Resume downloaded as JSON");
  };

  const handleImported = (fields: Omit<ResumeData, "template">) => {
    setData((prev) => ({ ...fields, template: prev.template }));
    setCurrentId(null);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "p") {
          e.preventDefault();
          handleExportPdf();
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
    } else if (hash === "#signup") {
      setShowSignup(true);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } else if (hash === "#login") {
      setShowLogin(true);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const onOpenLogin = () => setShowLogin(true);
    const onOpenSignup = () => setShowSignup(true);
    const onOpenSaved = () => {
      const el = document.getElementById("saved-resumes-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("open-login", onOpenLogin as EventListener);
    window.addEventListener("open-signup", onOpenSignup as EventListener);
    window.addEventListener("open-saved", onOpenSaved as EventListener);
    return () => {
      window.removeEventListener("open-login", onOpenLogin as EventListener);
      window.removeEventListener("open-signup", onOpenSignup as EventListener);
      window.removeEventListener("open-saved", onOpenSaved as EventListener);
    };
  }, []);

  const faqItems = [
    {
      id: "export",
      question: "What export formats are available?",
      answer: "You can export your resume as PDF, DOCX, and JSON. Each format preserves your content and layout for reuse.",
    },
    {
      id: "templates",
      question: "Can I switch templates after building?",
      answer: "Yes. You can move between all 14 templates at any time without losing your details.",
    },
    {
      id: "students",
      question: "Is this useful for school and college students?",
      answer: "Yes. You can build resumes for school admissions, college applications, internships, fresher roles, and part-time jobs.",
    },
    {
      id: "workers",
      question: "Can working professionals use it too?",
      answer: "Absolutely. The builder supports work experience, projects, achievements, certifications, and multiple resume versions.",
    },
    {
      id: "save",
      question: "Can I save and edit later?",
      answer: "Yes. Save a resume, reopen it from Saved Resumes, update it, and export again whenever needed.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">Inkwell</h1>
            <span className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
              Resume Creator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardShortcuts((value) => !value)}
              className="text-muted-foreground hover:text-foreground"
              title="Keyboard shortcuts (Ctrl+/Cmd+?)"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <div className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-widest text-accent">
              v0.1
            </div>
          </div>
        </div>
      </header>

      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-lg animate-in zoom-in-95">
            <h2 className="font-display text-lg font-bold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+P / Cmd+P</kbd><span>Export as PDF</span></div>
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+? / Cmd+?</kbd><span>Show shortcuts</span></div>
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S / Cmd+S</kbd><span>Save resume</span></div>
            </div>
            <Button onClick={() => setShowKeyboardShortcuts(false)} className="w-full mt-6">
              Close
            </Button>
          </div>
        </div>
      )}

      <section className="border-b border-border bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <p className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-[0.2em] text-accent mb-3">
              Resume builder for school, college, and career growth
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.05] text-ink max-w-3xl">
              Build a resume that feels clear, polished, and ready to send.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Create resumes for students, freshers, interns, and working professionals. Start with your details, choose a layout, preview instantly, and export when you are ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => window.location.assign("#new")} className="px-5">
                Create Resume
              </Button>
              <Button variant="outline" onClick={() => window.location.assign("#saved-resumes")} className="px-5">
                View Saved Resumes
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid gap-3">
                <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                  <NotebookPen className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Fill details once</p>
                    <p className="text-xs text-muted-foreground">Personal details, education, projects, work experience, and achievements.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                  <Eye className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Preview before exporting</p>
                    <p className="text-xs text-muted-foreground">Switch templates and see the resume update in real time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                  <Download className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Download and share</p>
                    <p className="text-xs text-muted-foreground">Export to PDF, DOCX, or JSON and keep multiple versions saved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">14</div>
              <p className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Templates</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">3</div>
              <p className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Export Formats</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">3</div>
              <p className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">User Types</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
              <div className="text-2xl sm:text-3xl font-bold text-primary">∞</div>
              <p className="text-[0.65rem] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Versions</p>
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
              <p className="text-xs sm:text-sm text-muted-foreground">Prepare resumes for scholarships, competitions, and first opportunities.</p>
            </div>
            <div className="p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <NotebookPen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-2 text-sm sm:text-base">College & Freshers</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Show projects, internships, coursework, and certifications clearly.</p>
            </div>
            <div className="p-4 sm:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <BriefcaseBusiness className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-bold mb-2 text-sm sm:text-base">Working Professionals</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Present experience, achievements, skills, and multiple career-focused versions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <h2 className="font-display text-2xl font-bold mb-6">Why people use Inkwell</h2>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid lg:grid-cols-2 gap-6 sm:gap-10">
        <div className="space-y-6 sm:space-y-8">
          <section className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-display text-lg sm:text-xl font-bold">Import Resume</h3>
              <span className="text-[0.65rem] font-mono uppercase tracking-widest text-accent">Quick Start</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Paste your existing resume text and let the form organize it into the right sections.
            </p>
            <ResumeImporter onParsed={handleImported} />
          </section>

          <section className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="font-display text-lg sm:text-xl font-bold mb-1">Your details</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5">
              Add your information once and refine it as you go.
            </p>
            <ResumeForm
              data={data}
              onChange={setData}
              onSaved={handleSaved}
              currentId={currentId}
              onNew={handleNew}
            />
          </section>

          <section id="saved-resumes-section" className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="font-display text-lg sm:text-xl font-bold mb-3">Saved resumes</h3>
            <SavedResumes
              refreshKey={savedKey}
              onLoad={handleLoad}
              currentId={currentId}
              onDeleted={handleDeleted}
              onCount={(n) => setSavedCount(n)}
            />
            {savedCount > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {savedCount} saved {savedCount === 1 ? "resume" : "resumes"} available.
              </p>
            )}
          </section>

          <section className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 sm:p-6">
            <h3 className="font-display text-lg sm:text-xl font-bold mb-4">Good for Every Goal</h3>
            <div className="space-y-4">
              <div className="text-xs sm:text-sm">
                <p className="text-muted-foreground italic mb-2">"I used one version for internships and another for campus placements. Switching templates made it easy."</p>
                <p className="font-semibold">- College student</p>
              </div>
              <div className="text-xs sm:text-sm">
                <p className="text-muted-foreground italic mb-2">"The export options helped me keep a clean PDF and DOCX version ready for different applications."</p>
                <p className="font-semibold">- Working professional</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="lg:sticky lg:top-24 self-start space-y-4" id="preview-area">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap no-print">
              <h3 className="font-display text-lg sm:text-xl font-bold">Preview</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap w-full sm:w-auto">
                <TemplateSelector
                  value={data.template}
                  onChange={(t) => setData({ ...data, template: t })}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportPdf}
                    className="border-accent/30 text-accent hover:bg-accent/10 hover:text-accent text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportDocx}
                    className="border-accent/30 text-accent hover:bg-accent/10 hover:text-accent text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    DOCX
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportJson}
                    className="border-accent/30 text-accent hover:bg-accent/10 hover:text-accent text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            </div>
            <div id="resume-print" className="rounded-lg border border-border shadow-sm">
              <ResumePreview data={data} />
            </div>
          </div>

          <section className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-display text-lg sm:text-xl font-bold mb-4">Frequently Asked</h3>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="border border-border rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-left">{item.question}</span>
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
        </div>
      </main>

      {showSignup && <Signup open={showSignup} onClose={() => setShowSignup(false)} />}
      {showLogin && <Login open={showLogin} onClose={() => setShowLogin(false)} />}

      <footer className="border-t border-border mt-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs font-mono uppercase tracking-widest text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© Inkwell 2026</span>
          <span className="text-center">Built for study, internships, and careers</span>
          <span className="text-right">Crafted with care</span>
        </div>
      </footer>
    </div>
  );
}
