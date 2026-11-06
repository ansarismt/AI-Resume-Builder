import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Brand arrow traced from the supplied logo mark. Two shapes (the wide wedge and
 * the thin trailing shard) so they can move independently.
 */
export function ArrowMark({
  className,
  animateOnLoad = true,
  drifting = false,
}: {
  className?: string;
  animateOnLoad?: boolean;
  drifting?: boolean;
}) {
  const [launched, setLaunched] = useState(false);
  useEffect(() => {
    if (!animateOnLoad) return;
    const id = window.setTimeout(() => setLaunched(true), 50);
    return () => window.clearTimeout(id);
  }, [animateOnLoad]);

  return (
    <svg
      viewBox="40 110 320 180"
      aria-hidden="true"
      className={cn(
        "brand-arrow",
        launched && !drifting && "is-launched",
        drifting && "is-drifting",
        className,
      )}
      fill="currentColor"
    >
      <path className="brand-arrow-wedge" d="M57 127 344 207 316 212 118 210 115 209Z" />
      <path className="brand-arrow-shard" d="M148 256 162 274 344 207 316 212Z" />
    </svg>
  );
}

/** Navbar/footer lockup: animated arrow mark plus wordmark. */
export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const large = size === "lg";
  return (
    <span
      className={cn("brand-lockup inline-flex items-center gap-2.5", large && "gap-4", className)}
    >
      <ArrowMark className={cn("w-auto text-brand", large ? "h-12" : "h-7")} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight",
            large ? "text-3xl" : "text-[1.05rem]",
          )}
        >
          AI RESUME
        </span>
        <span
          className={cn(
            "mt-0.5 font-semibold uppercase text-muted-foreground",
            large ? "mt-1 text-xs tracking-[0.5em]" : "text-[0.6rem] tracking-[0.42em]",
          )}
        >
          Builder
        </span>
      </span>
    </span>
  );
}

/** Full-page loading state: the arrow keeps moving forward while content loads. */
export function BrandLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4"
    >
      <ArrowMark className="h-12 w-auto text-brand" drifting animateOnLoad={false} />
      <p className="text-sm text-muted-foreground">{label}...</p>
    </div>
  );
}
