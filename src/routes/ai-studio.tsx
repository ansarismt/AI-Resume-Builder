import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { emptyResume, type ResumeData, type SavedResume } from "@/components/resume/types";
import { useAuth } from "@/lib/auth";
import {
  analyzeResumeForJob,
  analyzeResumeStrength,
  getApiErrorMessage,
  getDatasetModelStatus,
  listResumes,
  matchResumeRoles,
  suggestSkillsForRole,
  type ATSAnalysisResult,
  type DatasetModelStatus,
  type DatasetSkillsResult,
  type ResumeStrengthResult,
  type RoleMatchResult,
} from "@/lib/resumeApi";

export const Route = createFileRoute("/ai-studio")({
  component: AIStudioPage,
});

interface AnalysisResults {
  strength?: ResumeStrengthResult;
  roles?: RoleMatchResult;
  ats?: ATSAnalysisResult;
  skills?: DatasetSkillsResult;
}

function AIStudioPage() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ResumeData>(emptyResume);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<AnalysisResults>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState<DatasetModelStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingSetup(false);
      return;
    }

    let active = true;
    const loadSavedResumes = async () => {
      try {
        const resumes = await listResumes();
        if (active) setSavedResumes(resumes);
      } catch (error) {
        if (active) {
          setErrors([
            `${getApiErrorMessage(error, "Could not load saved resumes.")} You can still enter details manually.`,
          ]);
        }
      }
    };
    const loadStatus = async () => {
      try {
        const status = await getDatasetModelStatus();
        if (active) {
          setModelStatus(status);
          setStatusError(null);
        }
      } catch (error) {
        if (active)
          setStatusError(getApiErrorMessage(error, "Could not check the local AI model."));
      }
    };

    void Promise.all([loadSavedResumes(), loadStatus()]).finally(() => {
      if (active) setLoadingSetup(false);
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const updateProfile = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setResults({});
    setErrors([]);
  };

  const loadSavedResume = (id: string) => {
    setSelectedResume(id);
    const saved = savedResumes.find((resume) => resume.id === id);
    if (!saved) return;
    setProfile({
      ...emptyResume,
      ...saved,
      template: saved.template,
    });
    setTargetRole(saved.job_title_target ?? "");
    setResults({});
    setErrors([]);
  };

  const refreshModelStatus = async () => {
    setLoadingSetup(true);
    try {
      setModelStatus(await getDatasetModelStatus());
      setStatusError(null);
    } catch (error) {
      setModelStatus(null);
      setStatusError(getApiErrorMessage(error, "Could not check the local AI model."));
    } finally {
      setLoadingSetup(false);
    }
  };

  const analyze = async () => {
    const hasContent = [
      profile.summary,
      profile.experience,
      profile.education,
      profile.skills,
      profile.projects,
      profile.internships,
      profile.achievements,
    ].some((value) => value.trim());
    if (!hasContent) {
      setErrors(["Add resume content or choose a saved resume before analyzing."]);
      return;
    }

    setAnalyzing(true);
    setErrors([]);
    const resume: Record<string, unknown> = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      user_type: profile.user_type,
      summary: profile.summary,
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
      projects: profile.projects,
      internships: profile.internships,
      achievements: profile.achievements,
      certifications: profile.certifications,
    };

    try {
      const [strength, roles, ats, skills] = await Promise.allSettled([
        analyzeResumeStrength(resume),
        matchResumeRoles(resume, profile.user_type),
        jobDescription.trim()
          ? analyzeResumeForJob(resume, jobDescription.trim())
          : Promise.resolve(undefined),
        targetRole.trim()
          ? suggestSkillsForRole(targetRole.trim(), profile.user_type)
          : Promise.resolve(undefined),
      ]);

      setResults({
        strength: strength.status === "fulfilled" ? strength.value : undefined,
        roles: roles.status === "fulfilled" ? roles.value : undefined,
        ats: ats.status === "fulfilled" ? ats.value : undefined,
        skills: skills.status === "fulfilled" ? skills.value : undefined,
      });

      const failures: string[] = [];
      if (strength.status === "rejected") {
        failures.push(`Resume score: ${getApiErrorMessage(strength.reason, "Analysis failed.")}`);
      }
      if (roles.status === "rejected") {
        failures.push(`Career matches: ${getApiErrorMessage(roles.reason, "Analysis failed.")}`);
      }
      if (ats.status === "rejected") {
        failures.push(
          `Job description match: ${getApiErrorMessage(ats.reason, "Analysis failed.")}`,
        );
      }
      if (skills.status === "rejected") {
        failures.push(`Role skills: ${getApiErrorMessage(skills.reason, "Analysis failed.")}`);
      }
      setErrors(failures);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="rounded-2xl border border-border bg-card p-8 text-center shadow-paper">
          <BrainCircuit className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Sign in to use AI Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your resume analysis is private to your account.
          </p>
          <Button asChild className="mt-6">
            <Link to="/login">Sign in</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="rounded-3xl border border-border bg-secondary/40 p-6 text-foreground shadow-paper sm:p-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to AI Resume Builder
        </Link>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <Sparkles className="h-4 w-4" />
              Local, dataset-trained career tools
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">AI Studio</h1>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              Check your resume strength, see career categories that fit, find skills represented in
              the training data, and compare your resume with a job description.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-6 w-6 text-accent" />
              <div>
                <p className="text-sm font-semibold">Your data stays private</p>
                <p className="text-xs text-muted-foreground">
                  Analysis runs on your local backend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-live="polite"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {loadingSetup ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : modelStatus?.available ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <BrainCircuit className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="font-semibold">
              {loadingSetup
                ? "Checking your local model…"
                : modelStatus?.available
                  ? `Dataset model ready · ${modelStatus.category_count} career categories`
                  : "Dataset model is not ready"}
            </p>
            <p className="text-sm text-muted-foreground">
              {modelStatus?.available
                ? `${modelStatus.dataset_rows_used?.toLocaleString()} resumes · ${modelStatus.selected_model} · ${(100 * (modelStatus.test_macro_f1 ?? 0)).toFixed(1)}% test macro-F1`
                : statusError || "Train the model to enable local career and resume analysis."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loadingSetup}
          onClick={refreshModelStatus}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh status
        </Button>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Your profile
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Give your resume a closer look</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Choose a saved resume or enter its sections below. Details are sent only to your
              configured backend for analysis.
            </p>
          </div>

          {savedResumes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="saved-resume">Start with a saved resume</Label>
              <select
                id="saved-resume"
                value={selectedResume}
                onChange={(event) => loadSavedResume(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">Enter resume details manually</option>
                {savedResumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title || resume.name || "Untitled resume"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-name">Name</Label>
              <input
                id="ai-name"
                value={profile.name}
                onChange={(event) => updateProfile("name", event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-user-type">Career stage</Label>
              <select
                id="ai-user-type"
                value={profile.user_type}
                onChange={(event) =>
                  updateProfile("user_type", event.target.value as ResumeData["user_type"])
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="school">School student</option>
                <option value="college">College student / fresher</option>
                <option value="professional">Working professional</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-email">Email</Label>
              <input
                id="ai-email"
                type="email"
                value={profile.email}
                onChange={(event) => updateProfile("email", event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-phone">Phone</Label>
              <input
                id="ai-phone"
                value={profile.phone}
                onChange={(event) => updateProfile("phone", event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Contact number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-summary">Summary or objective</Label>
            <Textarea
              id="ai-summary"
              rows={3}
              value={profile.summary}
              onChange={(event) => updateProfile("summary", event.target.value)}
              placeholder="A short overview of your experience and goals"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-experience">Experience</Label>
            <Textarea
              id="ai-experience"
              rows={5}
              value={profile.experience}
              onChange={(event) => updateProfile("experience", event.target.value)}
              placeholder="Roles, responsibilities, outcomes, and dates"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-education">Education</Label>
            <Textarea
              id="ai-education"
              rows={3}
              value={profile.education}
              onChange={(event) => updateProfile("education", event.target.value)}
              placeholder="Qualifications, institutions, and dates"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-skills">Skills</Label>
            <Textarea
              id="ai-skills"
              rows={3}
              value={profile.skills}
              onChange={(event) => updateProfile("skills", event.target.value)}
              placeholder="Tools, technologies, and strengths"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-projects">Projects</Label>
              <Textarea
                id="ai-projects"
                rows={3}
                value={profile.projects}
                onChange={(event) => updateProfile("projects", event.target.value)}
                placeholder="Selected projects"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-internships">Internships</Label>
              <Textarea
                id="ai-internships"
                rows={3}
                value={profile.internships}
                onChange={(event) => updateProfile("internships", event.target.value)}
                placeholder="Internships and relevant training"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-achievements">Achievements</Label>
              <Textarea
                id="ai-achievements"
                rows={3}
                value={profile.achievements}
                onChange={(event) => updateProfile("achievements", event.target.value)}
                placeholder="Awards and measurable accomplishments"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-certifications">Certifications</Label>
              <Textarea
                id="ai-certifications"
                rows={3}
                value={profile.certifications}
                onChange={(event) => updateProfile("certifications", event.target.value)}
                placeholder="Professional or technical certifications"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-target-role">Target role (optional)</Label>
            <input
              id="ai-target-role"
              value={targetRole}
              onChange={(event) => {
                setTargetRole(event.target.value);
                setResults({});
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="e.g. data analyst, registered nurse, project manager"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-job-description">Job description (optional)</Label>
            <Textarea
              id="ai-job-description"
              rows={5}
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setResults({});
              }}
              placeholder="Paste a job description to compare role keywords and resume sections."
            />
          </div>

          {errors.length > 0 && (
            <div
              role="alert"
              className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={analyze}
            disabled={analyzing || loadingSetup || !modelStatus?.available}
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {analyzing ? "Analyzing your resume…" : "Run AI analysis"}
          </Button>
          {!modelStatus?.available && !loadingSetup && (
            <p className="text-center text-xs text-muted-foreground">
              Run <code>python manage.py train_model</code> in the project folder to enable
              analysis.
            </p>
          )}
        </section>

        <aside className="space-y-6">
          <ResultCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Resume strength"
            subtitle="Structure, content, and writing-quality checks"
          >
            {results.strength ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-primary/30 text-2xl font-bold text-primary">
                    {results.strength.score}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">out of 100</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Closest dataset category: {results.strength.category.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {results.strength.rules.map((rule) => (
                    <div key={rule.rule} className="space-y-1.5">
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="font-medium">{rule.rule.replaceAll("_", " ")}</span>
                        <span className="text-muted-foreground">
                          {rule.score}/{rule.max_score}
                        </span>
                      </div>
                      <Progress value={(rule.score / rule.max_score) * 100} />
                      <p className="text-xs leading-5 text-muted-foreground">{rule.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyResult>Run an analysis to see strengths and specific improvements.</EmptyResult>
            )}
          </ResultCard>

          <ResultCard
            icon={<Target className="h-5 w-5" />}
            title="Career category matches"
            subtitle="Ranked from patterns in the supplied resume dataset"
          >
            {results.roles ? (
              <div className="space-y-4">
                {results.roles.suggestions.length > 0 ? (
                  results.roles.suggestions.map((match) => (
                    <div key={match.category} className="space-y-2">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-medium">{match.category.replaceAll("-", " ")}</span>
                        <span className="text-primary">{Math.round(match.confidence * 100)}%</span>
                      </div>
                      <Progress value={match.confidence * 100} />
                    </div>
                  ))
                ) : (
                  <EmptyResult>
                    The model could not confidently match this resume to a training category.
                  </EmptyResult>
                )}
                <p className="text-xs leading-5 text-muted-foreground">{results.roles.note}</p>
              </div>
            ) : (
              <EmptyResult>Get the top career categories that resemble your resume.</EmptyResult>
            )}
          </ResultCard>

          <ResultCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Skills to explore"
            subtitle="Frequently represented for your target role in the dataset"
          >
            {results.skills ? (
              results.skills.skills.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {results.skills.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.skills.source === "dataset"
                      ? "Suggestions are derived from the training dataset; they are not claims about your current skills."
                      : "Suggestions were generated by the configured language model."}
                  </p>
                </div>
              ) : (
                <EmptyResult>No skills were returned for this target role.</EmptyResult>
              )
            ) : (
              <EmptyResult>Enter a target role to see related skills.</EmptyResult>
            )}
          </ResultCard>

          <ResultCard
            icon={<FileSearch className="h-5 w-5" />}
            title="Job description match"
            subtitle="Compare keywords and required resume sections"
          >
            {results.ats ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {results.ats.overall_score}
                  </div>
                  <div>
                    <p className="font-semibold">Match score out of 100</p>
                    <p className="text-xs text-muted-foreground">
                      {results.ats.keyword_match_percent}% of key terms found in the resume
                    </p>
                  </div>
                </div>
                <KeywordList title="Matched keywords" values={results.ats.matched_keywords} />
                <KeywordList title="Missing keywords" values={results.ats.missing_keywords} />
                <div>
                  <p className="mb-2 text-sm font-semibold">Suggested sections</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(results.ats.section_completeness).map(([section, present]) => (
                      <span
                        key={section}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          present
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {present ? "✓ " : ""}
                        {section.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
                {results.ats.formatting_warnings.length > 0 && (
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {results.ats.formatting_warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyResult>
                Paste a job description to check keyword and section alignment.
              </EmptyResult>
            )}
          </ResultCard>

          <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">How to read these insights</p>
            <p className="mt-2">
              Results compare your content with patterns in the provided resume dataset. They are
              guidance, not hiring predictions or guarantees. Add missing skills only when you
              actually have them.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ResultCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyResult({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  );
}

function KeywordList({ title, values }: { title: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
