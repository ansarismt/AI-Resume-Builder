import { useEffect, useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";

import { createResume, detectResumeUserType, getApiErrorMessage, updateResume } from "@/lib/resumeApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { TemplateSelector } from "./TemplateSelector";
import {
  HIGHEST_EDUCATION_OPTIONS,
  USER_TYPE_OPTIONS,
  type ResumeData,
  type TemplateId,
  type UserType,
} from "./types";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onSaved: (id: string) => void;
  currentId: string | null;
  onNew: (template?: TemplateId) => void;
}

function getUserTypeLabel(userType: UserType) {
  return USER_TYPE_OPTIONS.find((option) => option.value === userType)?.label ?? "College Student";
}

function sentenceList(value: string, fallback: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(", ") || fallback;
}

function fallbackFieldDraft(
  field: "education" | "projects" | "internships" | "certifications" | "achievements",
  data: ResumeData,
) {
  const skills = sentenceList(data.skills, "communication, teamwork, problem solving");
  const education = data.education.trim() || data.highest_education || "current academic program";

  if (field === "projects") {
    return [
      `Academic Project: Built a practical solution using ${skills}. Focused on planning, implementation, testing, and clear presentation of results.`,
      `Portfolio Project: Created a user-focused project connected to ${education}. Improved problem-solving ability and documented the workflow clearly.`,
    ].join("\n\n");
  }

  if (field === "internships") {
    return [
      `Internship / Training: Assisted with real-world tasks using ${skills}. Learned professional communication, task ownership, and deadline management.`,
      `Practical Exposure: Worked on guided assignments related to ${education}. Supported documentation, research, and basic implementation activities.`,
    ].join("\n\n");
  }

  if (field === "education") {
    return `${education}\nRelevant strengths: ${skills}\nCurrently studying: ${data.is_studying ? "Yes" : "No"}`;
  }

  if (field === "certifications") {
    return `Certification in ${skills.split(",")[0]?.trim() || "core skills"}\nOnline training related to ${education}\nWorkshop or course supporting career readiness`;
  }

  return `Participated in academic and extracurricular activities\nRecognized for consistent performance and teamwork\nContributed to events, projects, or competitions`;
}

function fallbackSummaryDraft(data: ResumeData) {
  const skills = sentenceList(data.skills, "communication, teamwork, and problem solving");
  const education = data.education.trim() || data.highest_education || "my education";

  if (data.user_type === "professional") {
    return `Results-focused professional with ${data.years_of_experience}+ years of experience. Skilled in ${skills}, with a strong interest in delivering reliable work, improving processes, and contributing to team goals.`;
  }

  if (data.user_type === "school") {
    return `Motivated school student with interest in ${skills}. Looking for opportunities to learn, contribute, and build practical experience through academics, activities, and projects.`;
  }

  return `Motivated college student with background in ${education}. Skilled in ${skills}, with interest in internships, projects, and entry-level opportunities where I can apply my learning and grow professionally.`;
}

export function ResumeForm({ data, onChange, onSaved, currentId, onNew }: Props) {
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(data.user_type !== data.detected_user_type);

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange({ ...data, [key]: value });

  useEffect(() => {
    setManualOverride(data.user_type !== data.detected_user_type);
  }, [data.user_type, data.detected_user_type, currentId]);

  useEffect(() => {
    let active = true;

    const runDetection = async () => {
      try {
        const detected = await detectResumeUserType(data.highest_education, data.years_of_experience);
        if (!active) return;

        if (manualOverride) {
          if (data.detected_user_type !== detected) {
            onChange({ ...data, detected_user_type: detected });
          }
          return;
        }

        if (data.detected_user_type !== detected || data.user_type !== detected) {
          onChange({
            ...data,
            detected_user_type: detected,
            user_type: detected,
            years_of_experience: detected === "school" ? 0 : data.years_of_experience,
            experience: detected === "school" ? "" : data.experience,
          });
        }
      } catch {
        if (!active) return;
      }
    };

    runDetection();
    return () => {
      active = false;
    };
  }, [
    data.highest_education,
    data.years_of_experience,
    data.detected_user_type,
    data.user_type,
    data.experience,
    manualOverride,
    onChange,
  ]);

  const isEmptyResume = (resume: ResumeData) =>
    [
      resume.name,
      resume.email,
      resume.phone,
      resume.highest_education,
      resume.education,
      resume.skills,
      resume.projects,
      resume.experience,
      resume.certifications,
      resume.internships,
      resume.achievements,
      resume.summary,
    ].every((value) => !(value || "").toString().trim());

  const handleCreateNew = (template?: TemplateId) => {
    if (!isEmptyResume(data)) {
      const shouldDiscard = window.confirm(
        "You have unsaved changes. Create a new resume and lose current changes?",
      );
      if (!shouldDiscard) return;
    }

    onNew(template);
  };

  const handleUserTypeChange = (value: UserType) => {
    setManualOverride(true);
    onChange({
      ...data,
      user_type: value,
      years_of_experience: value === "school" ? 0 : data.years_of_experience,
      experience: value === "school" ? "" : data.experience,
    });
  };

  const handleUseDetectedType = () => {
    setManualOverride(false);
    onChange({
      ...data,
      user_type: data.detected_user_type,
      years_of_experience: data.detected_user_type === "school" ? 0 : data.years_of_experience,
      experience: data.detected_user_type === "school" ? "" : data.experience,
    });
  };

  const handleGenerateField = async (
    field: "education" | "projects" | "internships" | "certifications" | "achievements",
  ) => {
    setGeneratingField(field);

    try {
      let prompt = "";

      if (field === "education") {
        prompt = `Write a concise education section for a ${data.user_type} resume.
Highest education: ${data.highest_education}
Currently studying: ${data.is_studying}
Existing details: ${data.education}`;
      }

      if (field === "projects") {
        prompt = `Generate 2 strong project entries for a college student resume.
Skills: ${data.skills}
Education: ${data.education}`;
      }

      if (field === "internships") {
        prompt = `Generate 2 internship entries for a college student resume.
Skills: ${data.skills}
Education: ${data.education}`;
      }

      if (field === "certifications") {
        prompt = `Generate 3 professional certifications for this resume.
Skills: ${data.skills}
Experience: ${data.experience}`;
      }

      if (field === "achievements") {
        prompt = `Generate 3 achievements or activities for a school student resume.
Education: ${data.education}
Skills: ${data.skills}`;
      }

      const { data: response, error } = await supabase.functions.invoke("generate-summary", {
        body: { prompt },
      });

      if (error) throw error;

      const draft = response?.summary || fallbackFieldDraft(field, data);
      update(field as keyof ResumeData, draft);
      toast.success(`${field} generated`);
    } catch (error) {
      update(field as keyof ResumeData, fallbackFieldDraft(field, data));
      toast.success(`${field} drafted locally`);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (
      !data.education.trim() &&
      !data.skills.trim() &&
      !data.projects.trim() &&
      !data.internships.trim() &&
      !data.experience.trim() &&
      !data.certifications.trim() &&
      !data.achievements.trim()
    ) {
      toast.error("Add a few details first to draft a summary");
      return;
    }

    setGenerating(true);

    try {
      const { data: response, error } = await supabase.functions.invoke("generate-summary", {
        body: {
          name: data.name,
          userType: data.user_type,
          highestEducation: data.highest_education,
          yearsOfExperience: data.years_of_experience,
          education: data.education,
          skills: data.skills,
          projects: data.projects,
          internships: data.internships,
          experience: data.experience,
          certifications: data.certifications,
          achievements: data.achievements,
        },
      });

      if (error) throw error;
      if (response?.error) throw new Error(response.error);

      update("summary", response?.summary || fallbackSummaryDraft(data));
      toast.success(`${data.user_type === "professional" ? "Summary" : "Objective"} drafted`);
    } catch (error) {
      update("summary", fallbackSummaryDraft(data));
      toast.success(`${data.user_type === "professional" ? "Summary" : "Objective"} drafted locally`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!data.name.trim() || !data.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);

    try {
      if (currentId) {
        await updateResume(currentId, data);
        toast.success("Resume updated");
        onSaved(currentId);
      } else {
        const created = await createResume(data);
        toast.success("Resume saved");
        onSaved(created.id);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={data.name} onChange={(event) => update("name", event.target.value)} placeholder="Ada Lovelace" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={(event) => update("email", event.target.value)} placeholder="student@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={data.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4" />

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          User Type Identification
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Highest education</Label>
            <Select value={data.highest_education} onValueChange={(value) => update("highest_education", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select highest education" />
              </SelectTrigger>
              <SelectContent>
                {HIGHEST_EDUCATION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_of_experience">Years of experience</Label>
            <Input
              id="years_of_experience"
              type="number"
              min={0}
              value={data.years_of_experience}
              onChange={(event) => update("years_of_experience", Number(event.target.value || 0))}
              placeholder="0"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={data.is_studying}
              onChange={(event) => update("is_studying", event.target.checked)}
              className="h-4 w-4"
            />
            <span>Currently studying</span>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Detected User Type</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              Detected user type: <span className="font-semibold">{getUserTypeLabel(data.detected_user_type)}</span>
            </p>
            {manualOverride && (
              <Button type="button" variant="outline" size="sm" onClick={handleUseDetectedType}>
                Use detected type
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>Manual override</Label>
          <Select value={data.user_type} onValueChange={(value) => handleUserTypeChange(value as UserType)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user type" />
            </SelectTrigger>
            <SelectContent>
              {USER_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {manualOverride
              ? `Manual override active. Current type: ${getUserTypeLabel(data.user_type)}`
              : `Using detected type automatically: ${getUserTypeLabel(data.user_type)}`}
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-4" />

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Resume Sections
        </h4>
        <div className="space-y-4">
          {data.user_type !== "professional" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="education">Education</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerateField("education")} disabled={generatingField === "education"} className="text-accent hover:bg-accent/10 hover:text-accent">
                    {generatingField === "education" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    <span className="ml-1 text-xs">{generatingField === "education" ? "Generating..." : "Draft for me"}</span>
                  </Button>
                </div>
                <Textarea id="education" rows={3} value={data.education} onChange={(event) => update("education", event.target.value)} placeholder="Write your academic background in detail." />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea id="skills" rows={3} value={data.skills} onChange={(event) => update("skills", event.target.value)} placeholder="Communication, Python, React, Excel, teamwork, SQL..." />
          </div>

          {data.user_type === "school" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="achievements">Achievements / Activities</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerateField("achievements")} disabled={generatingField === "achievements"} className="text-accent hover:bg-accent/10 hover:text-accent">
                  {generatingField === "achievements" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  <span className="ml-1 text-xs">{generatingField === "achievements" ? "Generating..." : "Generate"}</span>
                </Button>
              </div>
              <Textarea id="achievements" rows={3} value={data.achievements} onChange={(event) => update("achievements", event.target.value)} placeholder="Olympiad rank, sports captaincy, club work, volunteering..." />
            </div>
          )}

          {data.user_type === "college" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="projects">Projects</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerateField("projects")} disabled={generatingField === "projects"} className="text-accent hover:bg-accent/10 hover:text-accent">
                    {generatingField === "projects" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    <span className="ml-1 text-xs">{generatingField === "projects" ? "Generating..." : "Generate"}</span>
                  </Button>
                </div>
                <Textarea id="projects" rows={4} value={data.projects} onChange={(event) => update("projects", event.target.value)} placeholder="Highlight your best academic or personal projects here." />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="internships">Internships</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerateField("internships")} disabled={generatingField === "internships"} className="text-accent hover:bg-accent/10 hover:text-accent">
                    {generatingField === "internships" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    <span className="ml-1 text-xs">{generatingField === "internships" ? "Generating..." : "Generate"}</span>
                  </Button>
                </div>
                <Textarea id="internships" rows={3} value={data.internships} onChange={(event) => update("internships", event.target.value)} placeholder="Add internships, training, research roles, or practical experience." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea id="certifications" rows={3} value={data.certifications} onChange={(event) => update("certifications", event.target.value)} placeholder="Certifications, badges, trainings..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements_college">Achievements</Label>
                <Textarea id="achievements_college" rows={3} value={data.achievements} onChange={(event) => update("achievements", event.target.value)} placeholder="Hackathons, competitions, awards, leadership..." />
              </div>
            </>
          )}

          {data.user_type === "professional" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="experience">Work Experience</Label>
                <Textarea id="experience" rows={6} value={data.experience} onChange={(event) => update("experience", event.target.value)} placeholder="Write roles, responsibilities, impact, leadership, and measurable outcomes." />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleGenerateField("certifications")} disabled={generatingField === "certifications"} className="text-accent hover:bg-accent/10 hover:text-accent">
                    {generatingField === "certifications" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    <span className="ml-1 text-xs">{generatingField === "certifications" ? "Generating..." : "Generate"}</span>
                  </Button>
                </div>
                <Textarea id="certifications" rows={3} value={data.certifications} onChange={(event) => update("certifications", event.target.value)} placeholder="AWS, PMP, Scrum, domain certifications, licenses..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_professional">Education</Label>
                <Textarea id="education_professional" rows={3} value={data.education} onChange={(event) => update("education", event.target.value)} placeholder="Degree, college, year, and relevant specialization." />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4" />

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {data.user_type === "professional" ? "Professional Summary" : "Career Objective"}
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary">{data.user_type === "professional" ? "Summary" : "Objective"}</Label>
            <Button type="button" variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={generating} className="text-accent hover:bg-accent/10 hover:text-accent">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-1.5 text-xs">{generating ? "Drafting..." : "Draft for me"}</span>
            </Button>
          </div>
          <Textarea id="summary" rows={4} value={data.summary} onChange={(event) => update("summary", event.target.value)} placeholder="Write a short introduction tailored to the selected user type." />
        </div>
      </div>

      <div className="border-t border-border pt-4" />

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving || !data.name.trim() || !data.email.trim()} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {currentId ? "Update resume" : "Save resume"}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a new resume</DialogTitle>
              <DialogDescription>Choose a template for your new resume. This will create a fresh resume using the selected template.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <TemplateSelector value={data.template} onChange={(template) => update("template", template)} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={() => handleCreateNew(data.template)} className="ml-2">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
