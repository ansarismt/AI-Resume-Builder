import { cn } from "@/lib/utils";

export const VDART_URL = "https://www.vdart.com";

/** "Developed by VDart" attribution. `pill` is for the top bar, `text` for the footer. */
export function VDartBadge({
  variant = "pill",
  className,
}: {
  variant?: "pill" | "text";
  className?: string;
}) {
  if (variant === "text") {
    return (
      <span className={className}>
        Developed by{" "}
        <a
          href={VDART_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          VDart
        </a>
      </span>
    );
  }
  return (
    <a
      href={VDART_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Visit VDart"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/15",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      <span>
        Developed by <strong className="font-bold tracking-wide text-primary">VDart</strong>
      </span>
    </a>
  );
}
