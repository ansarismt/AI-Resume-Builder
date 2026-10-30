import type { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar, type WizardStep } from "./Sidebar";

interface Props {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<string>;
  completionPercentage: number;
  activeTitle: string;
  userTypeLabel: string;
  saveStatus: "idle" | "saving" | "saved";
  onStepClick: (index: number) => void;
  children: ReactNode;
  controls: ReactNode;
}

// BuilderLayout owns the resume-builder shell: progress on the left,
// the active step in the center, and navigation pinned below the step.
export function BuilderLayout({
  steps,
  currentStep,
  completedSteps,
  completionPercentage,
  activeTitle,
  userTypeLabel,
  saveStatus,
  onStepClick,
  children,
  controls,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        completionPercentage={completionPercentage}
        onStepClick={onStepClick}
      />

      <div className="min-w-0 space-y-6">
        <div className="rounded-xl border border-border bg-background/50 p-4 shadow-sm transition-shadow duration-200 sm:p-5">
          <Header
            currentStep={currentStep}
            totalSteps={steps.length}
            title={activeTitle}
            userTypeLabel={userTypeLabel}
            saveStatus={saveStatus}
          />
          {children}
        </div>
        {controls}
      </div>
    </div>
  );
}
