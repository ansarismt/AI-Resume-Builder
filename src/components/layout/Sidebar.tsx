import { CheckCircle2 } from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
}

interface Props {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<string>;
  completionPercentage: number;
  onStepClick: (index: number) => void;
}

export function Sidebar({
  steps,
  currentStep,
  completedSteps,
  completionPercentage,
  onStepClick,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-24 self-start rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-5">
        <p className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-accent">
          Resume Progress
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <span className="font-display text-3xl font-bold text-foreground">
            {completionPercentage}%
          </span>
          <span className="text-xs text-muted-foreground">complete</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = completedSteps.has(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all duration-200 ${
                isActive
                  ? "border-accent/40 bg-accent/10 text-foreground shadow-sm"
                  : "border-border bg-background/50 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-accent-foreground"
                    : isComplete
                    ? "border-accent/40 text-accent"
                    : "border-border"
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-mono uppercase tracking-widest">
                  Step {index + 1}
                </span>
                <span className="block truncate text-sm font-semibold">{step.title}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
