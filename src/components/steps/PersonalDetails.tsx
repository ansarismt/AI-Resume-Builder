import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HIGHEST_EDUCATION_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  USER_TYPE_OPTIONS,
  type ResumeData,
  type UserType,
} from "@/components/resume/types";

interface Props {
  data: ResumeData;
  manualOverride: boolean;
  userTypeLabel: string;
  detectedTypeLabel: string;
  onUpdate: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  onUserTypeChange: (value: UserType) => void;
  onUseDetectedType: () => void;
}

export default function PersonalDetails({
  data,
  manualOverride,
  userTypeLabel,
  detectedTypeLabel,
  onUpdate,
  onUserTypeChange,
  onUseDetectedType,
}: Props) {
  const hasCustomTarget =
    Boolean(data.job_title_target) &&
    !JOB_CATEGORY_OPTIONS.some((category) => category.value === data.job_title_target);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(event) => onUpdate("name", event.target.value)}
              placeholder="Ada Lovelace"
              className="transition-shadow focus-visible:ring-accent"
            />
            {!data.name.trim() && (
              <p className="text-xs text-destructive">Full name is required.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(event) => onUpdate("email", event.target.value)}
              placeholder="student@example.com"
              className="transition-shadow focus-visible:ring-accent"
            />
            {!data.email.trim() && <p className="text-xs text-destructive">Email is required.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(event) => onUpdate("phone", event.target.value)}
              placeholder="+91 98765 43210"
              className="transition-shadow focus-visible:ring-accent"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="headline">Resume headline (optional)</Label>
            <Input
              id="headline"
              maxLength={120}
              value={data.headline ?? ""}
              onChange={(event) => onUpdate("headline", event.target.value)}
              placeholder="Data analyst | Python and reporting"
              className="transition-shadow focus-visible:ring-accent"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          User Type Identification
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="highest_education">Highest education</Label>
            <Select
              value={data.highest_education}
              onValueChange={(value) => onUpdate("highest_education", value)}
            >
              <SelectTrigger id="highest_education">
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
              onChange={(event) => onUpdate("years_of_experience", Number(event.target.value || 0))}
              placeholder="0"
              className="transition-shadow focus-visible:ring-accent"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={data.is_studying}
              onChange={(event) => onUpdate("is_studying", event.target.checked)}
              className="h-4 w-4"
            />
            <span>Currently studying</span>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">
            Detected User Type
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              Detected user type: <span className="font-semibold">{detectedTypeLabel}</span>
            </p>
            {manualOverride && (
              <Button type="button" variant="outline" size="sm" onClick={onUseDetectedType}>
                Use detected type
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="user_type">Manual override</Label>
          <Select
            value={data.user_type}
            onValueChange={(value) => onUserTypeChange(value as UserType)}
          >
            <SelectTrigger id="user_type">
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
              ? `Manual override active. Current type: ${userTypeLabel}`
              : `Using detected type automatically: ${userTypeLabel}`}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="job_title_target">Target job category (optional)</Label>
          <Select
            value={hasCustomTarget ? data.job_title_target : data.job_title_target || "none"}
            onValueChange={(value) => onUpdate("job_title_target", value === "none" ? "" : value)}
          >
            <SelectTrigger id="job_title_target">
              <SelectValue placeholder="Choose a target job category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No target selected</SelectItem>
              {hasCustomTarget && data.job_title_target && (
                <SelectItem value={data.job_title_target}>{data.job_title_target}</SelectItem>
              )}
              {JOB_CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose from the 24 career categories in the resume training data.
          </p>
        </div>
      </div>
    </div>
  );
}
