interface Props {
  currentStep: number;
  totalSteps: number;
  title: string;
  userTypeLabel: string;
  saveStatus: "idle" | "saving" | "saved";
}

export function Header({ currentStep, totalSteps, title, userTypeLabel, saveStatus }: Props) {
  const saveLabel =
    saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Ready";

  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-accent">
          Step {currentStep + 1} of {totalSteps}
        </p>
        <h4 className="mt-1 font-display text-xl font-bold">{title}</h4>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{userTypeLabel}</span>
        <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 font-mono uppercase tracking-widest">
          {saveLabel}
        </span>
      </div>
    </div>
  );
}
