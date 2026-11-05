import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useCountUp, useInView, usePrefersReducedMotion } from "./hooks";

/** Thin blue bar at the top of the page that fills as you scroll. */
export function ScrollProgress() {
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 no-print" aria-hidden="true">
      <div
        className="h-full origin-left bg-gradient-to-r from-primary to-sky-400"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

/** Card whose border glows under the cursor. */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      node.style.setProperty("--mx", `${event.clientX - box.left}px`);
      node.style.setProperty("--my", `${event.clientY - box.top}px`);
    };
    node.addEventListener("pointermove", move);
    return () => node.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={ref} className={cn("spotlight", className)}>
      {children}
    </div>
  );
}

/** Tilts its child in 3D toward the pointer. */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      node.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    };
    const leave = () => {
      node.style.transform = "";
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);
  return (
    <div ref={ref} className={cn("tilt", className)}>
      {children}
    </div>
  );
}

/** Wrapper that nudges its child toward the cursor, like a magnet. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const x = event.clientX - (box.left + box.width / 2);
      const y = event.clientY - (box.top + box.height / 2);
      node.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
    };
    const leave = () => {
      node.style.transform = "";
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);
  return (
    <span ref={ref} className="inline-block transition-transform duration-200 ease-out">
      {children}
    </span>
  );
}

export function Counter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const shown = useCountUp(value, seen);
  return (
    <div ref={ref} className="toon toon-hover bg-card px-3 py-5 text-center">
      <p className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
        {shown}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
