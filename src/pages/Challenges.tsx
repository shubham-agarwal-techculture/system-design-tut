import { Link } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getChallengesByDifficulty } from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";
import { Tag } from "@/design/components/Tag";

const order = ["beginner", "intermediate", "advanced", "expert"] as const;

export default function Challenges() {
  const { isChallengeComplete } = useProgressContext();
  const byDiff = getChallengesByDifficulty();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <header className="mb-10">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
          Design challenges
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Worksheets with rubrics. Write a design, then request an AI review when the API is
          running.
        </p>
      </header>

      <div className="space-y-10">
        {order.map((diff) => (
          <section key={diff}>
            <h2
              className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {diff}
            </h2>
            <ul className="space-y-2">
              {byDiff[diff].map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/challenge/${c.id}`}
                    className="flex items-start justify-between gap-4 border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-4 py-3 hover:border-[var(--color-ink-muted)]"
                  >
                    <div>
                      <div className="text-[var(--color-ink)]">{c.title}</div>
                      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                        {c.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {isChallengeComplete(c.id) && <Tag signal>Done</Tag>}
                      <span
                        className="text-xs text-[var(--color-ink-subtle)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {formatMinutes(c.estimatedMinutes)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
