import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { createResume, detectResumeUserType, getApiErrorMessage, updateResume } from "@/lib/resumeApi";
import { BuilderLayout } from "@/components/layout/BuilderLayout";
import type { WizardStep } from "@/components/layout/Sidebar";
import { StepControls } from "@/components/navigation/StepControls";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  USER_TYPE_OPTIONS,
  type ResumeData,
  type TemplateId,
  type UserType,
} from "./types";

const PersonalDetails = lazy(() => import("@/components/steps/PersonalDetails"));
const Education = lazy(() => import("@/components/steps/Education"));
const Skills = lazy(() => import("@/components/steps/Skills"));
const Projects = lazy(() => import("@/components/steps/Projects"));
const Internships = lazy(() => import("@/components/steps/Internships"));
const Experience = lazy(() => import("@/components/steps/Experience"));
const Certifications = lazy(() => import("@/components/steps/Certifications"));
const Achievements = lazy(() => import("@/components/steps/Achievements"));
const Objective = lazy(() => import("@/components/steps/Objective"));
const Summary = lazy(() => import("@/components/steps/Summary"));

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onSaved: (id: string) => void;
  currentId: string | null;
  onNew: (template?: TemplateId) => void;
  onComplete?: () => void;
}

type StepId =
  | "personal"
  | "education"
  | "skills"
  | "achievements"
  | "objective"
  | "projects"
  | "internships"
  | "certifications"
  | "summary"
  | "experience";

const STEP_LABELS: Record<StepId, string> = {
  personal: "Personal Details",
  education: "Education",
  skills: "Skills",
  achievements: "Achievements",
  objective: "Career Objective",
  projects: "Projects",
  internships: "Internships",
  certifications: "Certifications",
  summary: "Professional Summary",
  experience: "Work Experience",
};

const STEP_FIELDS: Partial<Record<StepId, Array<keyof ResumeData>>> = {
  personal: ["name", "email", "highest_education"],
  education: ["education"],
  skills: ["skills"],
  achievements: ["achievements"],
  objective: ["summary"],
  summary: ["summary"],
  experience: ["experience"],
};

const FIELD_LABELS: Partial<Record<keyof ResumeData, string>> = {
  name: "full name",
  email: "email",
  highest_education: "highest education",
  education: "education",
  skills: "skills",
  achievements: "achievements",
  summary: "summary",
  experience: "work experience",
};

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

function getSteps(userType: UserType): WizardStep[] {
  if (userType === "school") {
    return ["personal", "education", "skills", "achievements", "objective"].map((id) => ({
      id,
      title: STEP_LABELS[id as StepId],
    }));
  }

  if (userType === "professional") {
    return ["personal", "summary", "experience", "skills", "certifications", "education"].map((id) => ({
      id,
      title: STEP_LABELS[id as StepId],
    }));
  }

  return ["personal", "education", "skills", "projects", "internships", "certifications", "objective"].map((id) => ({
    id,
    title: STEP_LABELS[id as StepId],
  }));
}

export function ResumeForm({ data, onChange, onSaved, currentId, onNew, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [generating, setGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(data.user_type !== data.detected_user_type);
  const stepPanelRef = useRef<HTMLDivElement | null>(null);

  const steps = useMemo(() => getSteps(data.user_type), [data.user_type]);
  const activeStep = steps[currentStep] ?? steps[0];

  const update = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      onChange({ ...data, [key]: value });
    },
    [data, onChange],
  );

  useEffect(() => {
    setCurrentStep((step) => Math.min(step, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    stepPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      const firstField = stepPanelRef.current?.querySelector<HTMLElement>(
        "input:not([type='hidden']):not([disabled]), textarea:not([disabled]), button[role='combobox']:not([disabled])",
      );
      firstField?.focus();
    }, 120);
  }, [currentStep]);

  useEffect(() => {
    setSaveStatus("idle");
  }, [data]);

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

  const isStepComplete = useCallback(
    (stepId: StepId) => {
      const requiredFields = STEP_FIELDS[stepId] ?? [];
      if (!requiredFields.length) return true;

      return requiredFields.every((field) => {
        const value = data[field];
        return typeof value === "number" ? value >= 0 : Boolean(value?.toString().trim());
      });
    },
    [data],
  );

  const completedSteps = useMemo(() => {
    return new Set(steps.filter((step) => isStepComplete(step.id as StepId)).map((step) => step.id));
  }, [isStepComplete, steps]);

  const completionPercentage = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round((completedSteps.size / steps.length) * 100);
  }, [completedSteps.size, steps.length]);

  const canMoveForward = Boolean(activeStep && isStepComplete(activeStep.id as StepId));

  const validationMessage = useMemo(() => {
    if (!activeStep || canMoveForward) return "";
    const requiredFields = STEP_FIELDS[activeStep.id as StepId] ?? [];
    const missingFields = requiredFields.filter((field) => {
      const value = data[field];
      return typeof value === "number" ? value < 0 : !value?.toString().trim();
    });

    if (!missingFields.length) return "";
    return `Add ${missingFields.map((field) => FIELD_LABELS[field] ?? field).join(", ")} to continue.`;
  }, [activeStep, canMoveForward, data]);

  const saveResume = useCallback(
    async (showToast = true) => {
      if (!data.name.trim() || !data.email.trim()) {
        if (showToast) toast.error("Name and email are required");
        return false;
      }

      setSaving(true);
      setSaveStatus("saving");
      try {
        if (currentId) {
          await updateResume(currentId, data);
          if (showToast) toast.success("Resume updated");
          onSaved(currentId);
        } else {
          const created = await createResume(data);
          if (showToast) toast.success("Resume saved");
          onSaved(created.id);
        }
        setSaveStatus("saved");
        return true;
      } catch (error) {
        setSaveStatus("idle");
        toast.error(getApiErrorMessage(error, "Save failed"));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [currentId, data, onSaved],
  );

  const autoSaveIfPossible = async () => {
    if (!data.name.trim() || !data.email.trim()) return true;
    return saveResume(false);
  };

  const goToStep = async (index: number) => {
    if (index === currentStep) return;
    if (index > currentStep && !canMoveForward) {
      toast.error("Complete the required fields before continuing");
      return;
    }

    const saved = await autoSaveIfPossible();
    if (saved) setCurrentStep(index);
  };

  const goNext = () => goToStep(Math.min(currentStep + 1, steps.length - 1));
  const goBack = () => goToStep(Math.max(currentStep - 1, 0));
  const completeWizard = async () => {
    if (!canMoveForward) {
      toast.error("Complete the required fields before continuing");
      return;
    }

    const saved = await autoSaveIfPossible();
    if (saved) onComplete?.();
  };

  const handleCreateNew = (template?: TemplateId) => {
    if (!isEmptyResume(data)) {
      const shouldDiscard = window.confirm(
        "You have unsaved changes. Create a new resume and lose current changes?",
      );
      if (!shouldDiscard) return;
    }

    setCurrentStep(0);
    onNew(template);
  };

  const handleUserTypeChange = (value: UserType) => {
    setManualOverride(true);
    setCurrentStep(0);
    onChange({
      ...data,
      user_type: value,
      years_of_experience: value === "school" ? 0 : data.years_of_experience,
      experience: value === "school" ? "" : data.experience,
    });
  };

  const handleUseDetectedType = () => {
    setManualOverride(false);
    setCurrentStep(0);
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
    } catch {
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
    } catch {
      update("summary", fallbackSummaryDraft(data));
      toast.success(`${data.user_type === "professional" ? "Summary" : "Objective"} drafted locally`);
    } finally {
      setGenerating(false);
    }
  };

  const renderStep = () => {
    switch (activeStep?.id as StepId) {
      case "personal":
        return (
          <PersonalDetails
            data={data}
            manualOverride={manualOverride}
            userTypeLabel={getUserTypeLabel(data.user_type)}
            detectedTypeLabel={getUserTypeLabel(data.detected_user_type)}
            onUpdate={update}
            onUserTypeChange={handleUserTypeChange}
            onUseDetectedType={handleUseDetectedType}
          />
        );
      case "education":
        return <Education data={data} generatingField={generatingField} onUpdate={update} onGenerateField={handleGenerateField} />;
      case "skills":
        return <Skills data={data} onUpdate={update} />;
      case "projects":
        return <Projects data={data} generatingField={generatingField} onUpdate={update} onGenerateField={handleGenerateField} />;
      case "internships":
        return <Internships data={data} generatingField={generatingField} onUpdate={update} onGenerateField={handleGenerateField} />;
      case "experience":
        return <Experience data={data} onUpdate={update} />;
      case "certifications":
        return <Certifications data={data} generatingField={generatingField} onUpdate={update} onGenerateField={handleGenerateField} />;
      case "achievements":
        return <Achievements data={data} generatingField={generatingField} onUpdate={update} onGenerateField={handleGenerateField} />;
      case "summary":
        return <Summary data={data} generating={generating} onUpdate={update} onGenerateSummary={handleGenerateSummary} />;
      case "objective":
        return <Objective data={data} generating={generating} onUpdate={update} onGenerateSummary={handleGenerateSummary} />;
      default:
        return null;
    }
  };

  return (
    <BuilderLayout
      steps={steps}
      currentStep={currentStep}
      completedSteps={completedSteps}
      completionPercentage={completionPercentage}
      activeTitle={activeStep?.title ?? "Resume Builder"}
      userTypeLabel={getUserTypeLabel(data.user_type)}
      saveStatus={saveStatus}
      onStepClick={goToStep}
      controls={
        <StepControls
          canGoBack={currentStep > 0}
          canGoNext={canMoveForward}
          isLastStep={currentStep === steps.length - 1}
          saving={saving}
          validationMessage={validationMessage}
          finishLabel="Preview resume"
          onBack={goBack}
          onNext={goNext}
          onFinish={completeWizard}
          onSave={() => saveResume(true)}
        />
      }
    >
      <Suspense
        fallback={
          <div className="flex min-h-48 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading step
          </div>
        }
      >
        <div
          ref={stepPanelRef}
          className="animate-in fade-in slide-in-from-right-2 duration-200"
        >
          {renderStep()}
        </div>
      </Suspense>
    </BuilderLayout>
  );
}
