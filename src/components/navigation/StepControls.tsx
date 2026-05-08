import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  saving: boolean;
  validationMessage?: string;
  finishLabel?: string;
  onBack: () => void;
  onNext: () => void;
  onFinish?: () => void;
  onSave: () => void;
}

export function StepControls({
  canGoBack,
  canGoNext,
  isLastStep,
  saving,
  validationMessage,
  finishLabel = "Continue",
  onBack,
  onNext,
  onFinish,
  onSave,
}: Props) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 flex flex-col gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:px-0 sm:pt-4">
      <Button type="button" variant="outline" onClick={onBack} disabled={!canGoBack || saving}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-1 flex-col gap-2 sm:items-end">
        {validationMessage && !canGoNext && (
          <p className="text-xs text-destructive">{validationMessage}</p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSave} disabled={saving || !canGoNext}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
          {isLastStep ? (
            <Button type="button" onClick={onFinish} disabled={saving || !canGoNext}>
              {finishLabel}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={onNext} disabled={saving || !canGoNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
