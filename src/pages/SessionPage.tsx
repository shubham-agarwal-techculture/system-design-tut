import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { buildSessionPlan, formatMinutes } from "@/utils/session";
import type { SessionDuration } from "@/types";
import { Button } from "@/design/components/Button";
import { SegmentedControl } from "@/design/components/SegmentedControl";
import { Tag } from "@/design/components/Tag";

const durations: SessionDuration[] = [5, 15, 30, 60];

export default function SessionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = Number(searchParams.get("duration")) as SessionDuration;
  const [selected, setSelected] = useState<SessionDuration>(
    durations.includes(initial) ? initial : 15,
  );
  const [started, setStarted] = useState(false);
  const [completedInSession, setCompletedInSession] = useState<string[]>([]);
  const { progress, markLessonComplete } = useProgressContext();

  const plan = useMemo(
    () =>
      buildSessionPlan(
        selected,
        [...progress.completedLessons, ...completedInSession],
        progress.completedChallenges,
      ),
    [selected, progress.completedLessons, progress.completedChallenges, completedInSession],
  );

  const handleDurationChange = (d: string) => {
    const next = Number(d) as SessionDuration;
    setSelected(next);
    setSearchParams({ duration: String(next) });
    setStarted(false);
    setCompletedInSession([]);
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        Study session
      </h1>
      <p className="mt-2 mb-6 text-[var(--color-ink-muted)]">
        Choose a duration. The plan is built from your remaining curriculum.
      </p>

      <SegmentedControl
        ariaLabel="Duration"
        options={durations.map((d) => ({
          value: String(d),
          label: d === 60 ? "60m" : `${d}m`,
        }))}
        value={String(selected)}
        onChange={handleDurationChange}
      />

      <div className="mt-8 border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-4">
        <div
          className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Plan · {formatMinutes(plan.totalMinutes)}
        </div>
        {plan.lessons.length === 0 && !plan.challenge ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            Nothing left in this window — try a longer session or a challenge.
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between border-t border-[var(--color-rule-subtle)] pt-2 text-sm"
              >
                <span>{l.title}</span>
                <span style={{ fontFamily: "var(--font-mono)" }} className="text-xs text-[var(--color-ink-subtle)]">
                  {formatMinutes(l.durationMinutes)}
                </span>
              </li>
            ))}
            {plan.challenge && (
              <li className="flex items-center justify-between border-t border-[var(--color-rule-subtle)] pt-2 text-sm">
                <span>
                  Challenge: {plan.challenge.title} <Tag>{plan.challenge.difficulty}</Tag>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {!started ? (
          <Button onClick={() => setStarted(true)} disabled={plan.lessons.length === 0}>
            Start session
          </Button>
        ) : (
          <div className="w-full space-y-3">
            {plan.lessons.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between border border-[var(--color-rule)] px-3 py-2"
              >
                <Link to={`/lesson/${l.id}`} className="text-[var(--color-signal)]">
                  {l.title}
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => {
                    markLessonComplete(l.id, l.durationMinutes);
                    setCompletedInSession((prev) => [...prev, l.id]);
                  }}
                >
                  Done
                </Button>
              </div>
            ))}
            {plan.challenge && (
              <Link to={`/challenge/${plan.challenge.id}`}>
                <Button variant="secondary">Open challenge</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
