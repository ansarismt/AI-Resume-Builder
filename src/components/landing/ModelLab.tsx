import { useMemo, useState } from "react";
import { Brain, Cpu, FileText, Filter, Layers, Sparkles } from "lucide-react";
import model from "../../../shared/modelPreview.json";
import { cn } from "@/lib/utils";
import { CountUp, Reveal } from "./effects";

type Category = (typeof model.categories)[number];

// Short sample resumes visitors can load into the preview with one click.
const SAMPLES: { label: string; text: string }[] = [
  {
    label: "Accountant",
    text: "Staff accountant handling general ledger, journal entries, month end close, bank reconciliations, accounts payable and financial statements.",
  },
  {
    label: "Software engineer",
    text: "Software developer building web applications with Java, SQL and JavaScript. Network and database administration, technical support and system testing.",
  },
  {
    label: "Teacher",
    text: "Elementary teacher creating lesson plans, classroom management, student assessment and parent communication. Taught reading and math curriculum.",
  },
  {
    label: "Chef",
    text: "Sous chef leading kitchen staff, menu planning, food preparation, food safety and inventory for a busy restaurant and catering events.",
  },
];

const PIPELINE = [
  { icon: FileText, title: "Your resume text", note: "Read from the form or an import" },
  { icon: Filter, title: "Cleaning", note: "Lower-case, strip symbols and stop words" },
  { icon: Layers, title: "TF-IDF features", note: "1 and 2-word phrases, up to 50,000" },
  { icon: Cpu, title: model.selected, note: "Picked by 5-fold cross-validation" },
  { icon: Brain, title: "24 categories", note: "Ranked matches and skill gaps" },
] as const;

function pct(value: number) {
  return Math.round(value * 1000) / 10;
}

/**
 * Lightweight in-browser preview: scores each category by how many of its top
 * dataset keywords appear in the text (earlier keywords weigh more). It shows
 * the idea; the real classifier runs on the server in AI Studio.
 */
function previewScores(text: string) {
  const haystack = ` ${text.toLowerCase().replace(/[^a-z0-9+#]+/g, " ")} `;
  const results = model.categories.map((cat: Category) => {
    let score = 0;
    const matched: string[] = [];
    cat.keywords.forEach((kw, i) => {
      if (haystack.includes(` ${kw} `)) {
        const weight = ((30 - i) / 30) * (kw.includes(" ") ? 1.6 : 1);
        score += weight;
        matched.push(kw);
      }
    });
    return { cat, score, matched };
  });
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => ({ ...r, share: total ? r.score / total : 0 }));
}

export function ModelLab() {
  const [text, setText] = useState(SAMPLES[0].text);
  const scores = useMemo(() => previewScores(text), [text]);
  const top = scores[0];
  const cvEntries = Object.entries(model.cv).sort((a, b) => b[1].accuracy - a[1].accuracy);

  return (
    <section
      id="model"
      className="model-lab relative scroll-mt-16 overflow-hidden border-b border-border text-white"
    >
      <div aria-hidden="true" className="model-lab-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            <Sparkles className="h-3.5 w-3.5" /> Inside the model
          </p>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            A model trained on {model.rows.toLocaleString()} real resumes.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/70">
            Resume analysis runs on our own server with a classic, explainable machine-learning
            model, not a chatbot guess. It compares your resume with 24 job categories and tells you
            which skills and keywords are common in each.
          </p>
        </Reveal>

        {/* Metrics */}
        <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Test accuracy",
              value: pct(model.testAccuracy),
              suffix: "%",
              note: "Best category correct",
            },
            {
              label: "Top-3 accuracy",
              value: pct(model.testTop3),
              suffix: "%",
              note: "Right answer in the top 3",
            },
            {
              label: "Macro F1",
              value: pct(model.testMacroF1),
              suffix: "%",
              note: "Balanced across all categories",
            },
            {
              label: "Job categories",
              value: model.categories.length,
              suffix: "",
              note: `Held-out test set, trained ${model.trainedAt}`,
            },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 80} className="model-card rounded-2xl p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                {m.label}
              </dt>
              <dd className="mt-2 text-4xl font-extrabold tracking-tight text-sky-300 tabular-nums">
                <CountUp value={m.value} suffix={m.suffix} decimals={m.suffix ? 1 : 0} />
              </dd>
              <p className="mt-1 text-xs text-white/50">{m.note}</p>
            </Reveal>
          ))}
        </dl>

        {/* Pipeline */}
        <Reveal className="mt-14">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
            How a resume is analysed
          </h3>
          <ol className="model-pipeline relative mt-5 grid gap-4 md:grid-cols-5">
            {PIPELINE.map(({ icon: Icon, title, note }, i) => (
              <li
                key={title}
                className="model-card relative rounded-2xl p-4"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <span className="model-node flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-white/55">{note}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Live preview + model comparison */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Reveal className="model-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Try the category preview</h3>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white/70">
                Live in your browser
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setText(s.text)}
                  aria-pressed={text === s.text}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    text === s.text
                      ? "border-sky-300 bg-sky-300 text-neutral-950"
                      : "border-white/20 text-white/80 hover:border-white/50",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label htmlFor="model-preview-text" className="sr-only">
              Resume text to preview
            </label>
            <textarea
              id="model-preview-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-xl border border-white/15 bg-black/30 p-3 text-sm leading-6 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none"
              placeholder="Paste a few lines from your resume..."
            />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              Share of matched category keywords
            </p>
            <div className="mt-3 space-y-3" aria-live="polite">
              {scores.length === 0 && (
                <p className="text-sm text-white/55">
                  No category keywords found yet. Try adding your role and main duties.
                </p>
              )}
              {scores.map((r, i) => (
                <div key={r.cat.id}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className={cn("font-semibold", i === 0 && "text-sky-300")}>
                      {r.cat.label}
                    </span>
                    <span className="tabular-nums text-white/60">{Math.round(r.share * 100)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-out",
                        i === 0 ? "bg-gradient-to-r from-brand to-sky-300" : "bg-white/35",
                      )}
                      style={{ width: `${Math.max(4, r.share * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {top && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                  Keywords that matched {top.cat.label}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {top.matched.slice(0, 10).map((kw) => (
                    <span
                      key={kw}
                      className="stage-in rounded-md bg-sky-300/15 px-2 py-0.5 text-xs text-sky-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/50">
                  Common skills in this category: {top.cat.skills.slice(0, 6).join(", ")}.
                </p>
              </div>
            )}
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">
              This preview only counts each category&apos;s top dataset keywords. The full{" "}
              {model.selected} model in AI Studio reads every phrase in your resume.
            </p>
          </Reveal>

          <Reveal delay={120} className="model-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Three models, best one kept</h3>
            <p className="mt-1 text-sm text-white/60">
              Each candidate is scored with 5-fold cross-validation; the winner ships.
            </p>
            <div className="mt-6 space-y-5">
              {cvEntries.map(([name, v]) => {
                const winner = name === model.selected;
                return (
                  <div key={name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className={cn("font-semibold", winner && "text-sky-300")}>
                        {name}
                        {winner && (
                          <span className="ml-2 rounded bg-sky-300 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-neutral-950">
                            Selected
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums text-white/60">{pct(v.accuracy)}%</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "model-bar h-full rounded-full",
                          winner ? "bg-sky-300" : "bg-white/30",
                        )}
                        style={{ width: `${v.accuracy * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/45">Macro F1 {pct(v.macroF1)}%</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/60">
              Scores are guidance, not a hiring decision. The model compares wording with past
              resumes; it does not judge you as a candidate.
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
