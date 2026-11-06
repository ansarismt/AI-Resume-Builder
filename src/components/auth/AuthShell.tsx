import { useState } from "react";
import { Eye, EyeOff, FileText, MousePointer2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { passwordStrength } from "@/lib/passwordStrength";
import { ArrowChase } from "./ArrowChase";

const HIGHLIGHTS = [
  { icon: FileText, text: "20 templates that follow your colours and fonts" },
  { icon: Sparkles, text: "AI help for summaries, bullets and cover letters" },
  { icon: ShieldCheck, text: "Your resumes stay private to your account" },
] as const;

/** Split-screen layout shared by sign-in and sign-up. */
export function AuthShell({
  headline,
  intro,
  steps,
  progress,
  children,
}: {
  headline: string;
  intro: string;
  /** Milestones shown on the career track; the arrow advances as the form is filled. */
  steps: string[];
  /** 0 to 1: how much of the form is complete. */
  progress: number;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="auth-hero relative hidden cursor-crosshair overflow-hidden border-r border-border bg-secondary/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <ArrowChase />
        <Logo size="lg" className="pointer-events-none relative w-fit" />
        <div className="pointer-events-none relative">
          <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
            {headline}
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">{intro}</p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="toon-icon h-9 w-9">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none relative">
          <CareerTrack steps={steps} progress={progress} />
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <MousePointer2 className="h-3.5 w-3.5" />
            Move your cursor here and the arrow follows. Click to launch it.
          </p>
        </div>
      </aside>
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="stage-in w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <CareerTrack steps={steps} progress={progress} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

/** A path of milestones; the brand arrow travels along it as the form fills in. */
function CareerTrack({ steps, progress }: { steps: string[]; progress: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const reached = Math.floor((pct / 100) * (steps.length - 1) + 0.001);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span className="uppercase tracking-[0.18em] text-muted-foreground">Your progress</span>
        <span className="text-brand tabular-nums">{pct}%</span>
      </div>
      <div className="relative h-10">
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        <span
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        {steps.map((step, i) => {
          const pos = (i / (steps.length - 1)) * 100;
          return (
            <span
              key={step}
              className={cn(
                "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500",
                i <= reached && pct > 0 ? "border-brand bg-brand" : "border-border bg-background",
              )}
              style={{ left: `${pos}%` }}
            />
          );
        })}
        <svg
          aria-hidden="true"
          viewBox="40 110 320 180"
          className="track-arrow absolute top-1/2 h-6 w-auto text-brand transition-[left] duration-700 ease-out"
          style={{ left: `${pct}%` }}
          fill="currentColor"
        >
          <path d="M57 127 344 207 316 212 118 210 115 209Z" />
          <path d="M148 256 162 274 344 207 316 212Z" />
        </svg>
      </div>
      <div className="mt-1 flex justify-between text-[0.7rem] text-muted-foreground">
        {steps.map((step, i) => (
          <span
            key={step}
            className={cn(i <= reached && pct > 0 && "font-semibold text-foreground")}
          >
            {step}
          </span>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        Form {pct}% complete
      </span>
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error && errorId, describedBy) || undefined}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function StrengthMeter({ id, password }: { id: string; password: string }) {
  const { score, label } = passwordStrength(password);
  const colors = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-emerald-500"];
  return (
    <div id={id} className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              password && score >= n ? colors[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {password ? `Password strength: ${label}` : "Use at least 8 characters."}
      </p>
    </div>
  );
}
