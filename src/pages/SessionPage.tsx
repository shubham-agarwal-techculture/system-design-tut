import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { buildSessionPlan, formatMinutes } from "@/utils/session";
import type { SessionDuration } from "@/types";

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

  const handleDurationChange = (d: SessionDuration) => {
    setSelected(d);
    setSearchParams({ duration: String(d) });
    setStarted(false);
    setCompletedInSession([]);
  };

  const handleLessonDone = (lessonId: string, minutes: number) => {
    markLessonComplete(lessonId, minutes);
    setCompletedInSession((prev) => [...prev, lessonId]);
  };

  const allDone =
    plan.lessons.every((l) => completedInSession.includes(l.id)) &&
    (!plan.challenge || progress.completedChallenges.includes(plan.challenge.id));

  return (
    <div className="mx-auto max-w-3xl px-8 py-10 animate-fade-in">
      <header className="mb-8">
        <h1 className="heading-xl">Study Session</h1>
        <p className="mt-2 text-muted">
          Tell us how much time you have. We'll build a focused plan from your current
          progress.
        </p>
        <div className="divider-ornate mt-6" />
      </header>

      <div className="mb-8 grid grid-cols-4 gap-3">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => handleDurationChange(d)}
            className={`card gothic-arch py-3 text-center font-serif transition-all ${
              selected === d
                ? "session-active"
                : "text-muted hover:border-[var(--color-burgundy)]/25"
            }`}
          >
            {d < 60 ? `${d} min` : "1 hour"}
          </button>
        ))}
      </div>

      <div className="card-lifted mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-lg">Your session plan</h2>
          <span className="text-sm text-subtle">~{formatMinutes(plan.totalMinutes)}</span>
        </div>

        {plan.lessons.length === 0 && !plan.challenge ? (
          <p className="text-sm text-muted">
            You've completed the entire curriculum! Head to{" "}
            <Link to="/challenges" className="link-accent">
              design challenges
            </Link>{" "}
            to keep practicing.
          </p>
        ) : (
          <ol className="space-y-3">
            {plan.lessons.map((lesson, i) => {
              const done =
                completedInSession.includes(lesson.id) ||
                progress.completedLessons.includes(lesson.id);
              return (
                <li
                  key={lesson.id}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                    done ? "lesson-row-done" : "lesson-row"
                  }`}
                >
                  <span className="w-4 text-xs text-[var(--color-ink-faint)]">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="text-sm text-[var(--color-ink-soft)]">{lesson.title}</div>
                    <div className="text-xs text-subtle">
                      {formatMinutes(lesson.durationMinutes)}
                    </div>
                  </div>
                  {done ? (
                    <span className="text-xs text-[var(--color-forest)]">✓</span>
                  ) : started ? (
                    <Link
                      to={`/lesson/${lesson.id}`}
                      onClick={() => handleLessonDone(lesson.id, lesson.durationMinutes)}
                      className="link-accent text-xs"
                    >
                      Open →
                    </Link>
                  ) : null}
                </li>
              );
            })}
            {plan.challenge && (
              <li className="flex items-center gap-3 rounded-lg border border-amber-800/25 bg-amber-900/5 px-4 py-3">
                <span className="w-4 text-xs text-[var(--color-ink-faint)]">
                  {plan.lessons.length + 1}.
                </span>
                <div className="flex-1">
                  <div className="text-sm text-[var(--color-ink-soft)]">
                    Design: {plan.challenge.title}
                  </div>
                  <div className="text-xs text-subtle">
                    {formatMinutes(plan.challenge.estimatedMinutes)} ·{" "}
                    {plan.challenge.difficulty}
                  </div>
                </div>
                {started && (
                  <Link
                    to={`/challenge/${plan.challenge.id}`}
                    className="text-xs text-[var(--color-brass)] hover:text-[var(--color-gold)]"
                  >
                    Open →
                  </Link>
                )}
              </li>
            )}
          </ol>
        )}
      </div>

      {!started && plan.lessons.length > 0 && (
        <button
          onClick={() => setStarted(true)}
          className="btn-primary pulse-ring w-full py-3.5"
        >
          Start {selected < 60 ? `${selected}-minute` : "1-hour"} session
        </button>
      )}

      {started && allDone && (
        <div className="card-complete rounded-xl p-6 text-center">
          <div className="mb-2 font-serif text-2xl text-[var(--color-gold)]">✦</div>
          <h3 className="heading-md mb-1">Session complete!</h3>
          <p className="mb-4 text-sm text-muted">
            Well done, scholar. Consistency beats intensity — see you next time.
          </p>
          <Link to="/" className="btn-success">
            Back to home
          </Link>
        </div>
      )}

      {started && !allDone && plan.lessons.length > 0 && (
        <div className="mt-4 text-center">
          <p className="mb-3 text-xs text-subtle">
            Open each item above, learn, then mark it complete.
          </p>
          {!plan.lessons.every((l) => completedInSession.includes(l.id)) && (
            <Link
              to={`/lesson/${plan.lessons.find((l) => !completedInSession.includes(l.id))?.id}`}
              className="btn-primary"
            >
              Continue with next lesson →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
