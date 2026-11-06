import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** Thin reading-progress bar plus a floating back-to-top button. */
export function ScrollHelpers() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="no-print">
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />
      {progress > 0.08 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
