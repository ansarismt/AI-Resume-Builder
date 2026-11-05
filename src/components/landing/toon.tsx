import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "./hooks";

const TIPS = [
  "Hi, I'm Resu! Click me for a tip.",
  "Pick any of 20 templates, then switch whenever you like.",
  "Import a PDF or DOCX to fill the form fast.",
  "Aim for one page. Recruiters skim.",
  "Show results, not just duties.",
  "Download PDF, Word, JSON or TXT.",
];

const CONFETTI_COLORS = ["#0b4fc4", "#111827", "#7fb2ff", "#ffffff"];

function Confetti() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-30" aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        const distance = 70 + (index % 3) * 22;
        return (
          <span
            key={index}
            className="confetti-bit"
            style={
              {
                "--dx": `${Math.cos(angle) * distance}px`,
                "--dy": `${Math.sin(angle) * distance - 20}px`,
                "--rot": `${index * 47}deg`,
                background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

/** Cartoon resume character: eyes follow the cursor, click for a tip and confetti. */
export function Mascot({ className }: { className?: string }) {
  const [tip, setTip] = useState(0);
  const [burst, setBurst] = useState(0);
  const [happy, setHappy] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftPupil = useRef<SVGCircleElement>(null);
  const rightPupil = useRef<SVGCircleElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const box = svg.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height * 0.4);
        const length = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, length / 160) * 4.5;
        const transform = `translate(${(dx / length) * reach} ${(dy / length) * reach})`;
        leftPupil.current?.setAttribute("transform", transform);
        rightPupil.current?.setAttribute("transform", transform);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  useEffect(() => {
    if (!happy) return;
    const timer = window.setTimeout(() => setHappy(false), 1000);
    return () => window.clearTimeout(timer);
  }, [happy]);

  const onClick = () => {
    setTip((value) => (value + 1) % TIPS.length);
    setBurst((value) => value + 1);
    setHappy(true);
  };

  return (
    <div className={className}>
      <p
        key={tip}
        aria-live="polite"
        className="toon stage-in relative mb-3 max-w-[12rem] px-3 py-2 text-xs font-semibold leading-4"
      >
        {TIPS[tip]}
        <span className="absolute -bottom-[9px] left-10 h-4 w-4 rotate-45 border-b-[1.5px] border-r-[1.5px] border-foreground bg-card" />
      </p>
      <button
        type="button"
        onClick={onClick}
        aria-label="Resu, the resume mascot. Click for a tip."
        className="relative block cursor-pointer rounded-2xl focus-visible:outline-none"
      >
        {burst > 0 && <Confetti key={burst} />}
        <svg
          ref={svgRef}
          viewBox="0 0 160 200"
          className={`mascot-bounce h-36 w-28 overflow-visible ${happy ? "mascot-jump" : ""}`}
          role="img"
          aria-hidden="true"
        >
          <ellipse cx="80" cy="190" rx="44" ry="7" fill="#111827" opacity="0.15" />
          {/* legs and shoes */}
          <path d="M62 150v26M98 150v26" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
          <ellipse
            cx="58"
            cy="180"
            rx="13"
            ry="7"
            fill="#0b4fc4"
            stroke="#111827"
            strokeWidth="4"
          />
          <ellipse
            cx="102"
            cy="180"
            rx="13"
            ry="7"
            fill="#0b4fc4"
            stroke="#111827"
            strokeWidth="4"
          />
          {/* waving arm */}
          <g className="mascot-wave" style={{ transformOrigin: "26px 100px" }}>
            <path
              d="M26 100C10 92 6 76 12 62"
              stroke="#111827"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="12" cy="58" r="9" fill="#fff" stroke="#111827" strokeWidth="4" />
          </g>
          {/* pencil arm */}
          <path
            d="M134 104c14 4 20 14 20 26"
            stroke="#111827"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <g transform="rotate(25 152 130)">
            <rect
              x="147"
              y="106"
              width="9"
              height="40"
              rx="2"
              fill="#7fb2ff"
              stroke="#111827"
              strokeWidth="3.5"
            />
            <path
              d="M147 146l4.5 11 4.5-11z"
              fill="#fff"
              stroke="#111827"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>
          {/* paper body */}
          <path
            d="M32 22h62l34 34v94a14 14 0 0 1-14 14H32a14 14 0 0 1-14-14V36a14 14 0 0 1 14-14z"
            fill="#fff"
            stroke="#111827"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M94 22v22a12 12 0 0 0 12 12h22"
            fill="#cfe1ff"
            stroke="#111827"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* text lines */}
          <path d="M40 124h60M40 138h44" stroke="#7fb2ff" strokeWidth="6" strokeLinecap="round" />
          {/* eyes */}
          <g className="mascot-blink" style={{ transformOrigin: "80px 78px" }}>
            <circle cx="56" cy="78" r="13" fill="#fff" stroke="#111827" strokeWidth="4" />
            <circle cx="102" cy="78" r="13" fill="#fff" stroke="#111827" strokeWidth="4" />
            <circle ref={leftPupil} cx="56" cy="78" r="6" fill="#111827" />
            <circle ref={rightPupil} cx="102" cy="78" r="6" fill="#111827" />
          </g>
          <ellipse cx="38" cy="104" rx="7" ry="4.5" fill="#7fb2ff" opacity="0.55" />
          <ellipse cx="120" cy="104" rx="7" ry="4.5" fill="#7fb2ff" opacity="0.55" />
          {/* mouth */}
          {happy ? (
            <path
              d="M62 98q17 24 36 0z"
              fill="#111827"
              stroke="#111827"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M64 100q16 14 32 0"
              fill="none"
              stroke="#111827"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
    </div>
  );
}

/** Hand-drawn underline that draws itself. */
export function Squiggle({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute -bottom-2 left-0 h-3 w-full"
      >
        <path
          className="squiggle-path"
          d="M3 8Q20 1 38 8T75 8T113 8T150 8T197 7"
          pathLength="1"
          fill="none"
          stroke="#0b4fc4"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
