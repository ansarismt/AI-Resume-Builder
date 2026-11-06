import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/components/brand/arrowCanvas";

/**
 * Cycles through phrases with a slide-up swap. All phrases share one grid cell,
 * so the line keeps the width of the longest one and nothing below jumps.
 */
export function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  const leaving = (index - 1 + words.length) % words.length;
  return (
    <span className="rotating-words inline-grid align-bottom">
      <span className="sr-only">{words[0]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden="true"
          className={i === index ? "is-current" : i === leaving ? "is-leaving" : undefined}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
