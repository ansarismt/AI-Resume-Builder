import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

const LABELS = { light: "Light theme", dark: "Dark theme", system: "System theme" } as const;

export function ThemeToggle() {
  const { mode, cycle } = useTheme();
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`${LABELS[mode]}. Click to change.`}
      title={LABELS[mode]}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
