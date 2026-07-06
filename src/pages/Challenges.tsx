import { Link } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getChallengesByDifficulty } from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";
import type { Difficulty } from "@/types";

const difficultyConfig: Record<
  Difficulty,
  { label: string; color: string; border: string; bg: string }
> = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-900",
    border: "border-emerald-900/20",
    bg: "bg-emerald-950/5",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-slate-800",
    border: "border-slate-800/20",
    bg: "bg-slate-800/5",
  },
  advanced: {
    label: "Advanced",
    color: "text-amber-900",
    border: "border-amber-800/25",
    bg: "bg-amber-900/5",
  },
  expert: {
    label: "Expert",
    color: "text-red-950",
    border: "border-red-900/20",
    bg: "bg-red-950/5",
  },
};

export default function Challenges() {
  const { isChallengeComplete } = useProgressContext();
  const grouped = getChallengesByDifficulty();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10 animate-fade-in">
      <header className="mb-10">
        <h1 className="heading-xl">Design Challenges</h1>
        <p className="mt-2 max-w-xl text-muted">
          Apply what you've learned. Work through these system design problems using the
          framework from Phase 8 — requirements, capacity, architecture, trade-offs.
        </p>
        <div className="divider-ornate mt-6" />
      </header>

      {(Object.entries(grouped) as [Difficulty, typeof grouped.beginner][]).map(
        ([difficulty, challenges]) => {
          if (challenges.length === 0) return null;
          const config = difficultyConfig[difficulty];
          return (
            <section key={difficulty} className="mb-10">
              <h2 className={`heading-lg mb-4 font-serif ${config.color}`}>
                {config.label}
              </h2>
              <div className="grid gap-3">
                {challenges.map((challenge) => {
                  const done = isChallengeComplete(challenge.id);
                  return (
                    <Link
                      key={challenge.id}
                      to={`/challenge/${challenge.id}`}
                      className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all hover:shadow-[var(--shadow-card)] ${
                        done ? "card-complete" : `${config.border} ${config.bg}`
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                          done
                            ? "bg-emerald-900/15 text-emerald-900"
                            : "bg-[var(--color-stone-mid)] text-subtle"
                        }`}
                      >
                        {done ? "✓" : "◈"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-medium text-[var(--color-ink)]">
                          {challenge.title}
                        </div>
                        <div className="line-clamp-1 text-sm text-subtle">
                          {challenge.description}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-subtle">
                        {formatMinutes(challenge.estimatedMinutes)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        },
      )}
    </div>
  );
}
