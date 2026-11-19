import { Link } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getProgressStats } from "@/utils/curriculum";
import { getDailyRecommendation, formatMinutes } from "@/utils/session";
import type { SessionDuration } from "@/types";
import { Button } from "@/design/components/Button";
import { Readout } from "@/design/components/Readout";
import { SegmentedControl } from "@/design/components/SegmentedControl";
import { CurriculumMap } from "@/design/components/motifs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sessionOptions: { value: string; label: string }[] = [
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "30", label: "30m" },
  { value: "60", label: "60m" },
];

export default function Dashboard() {
  const { progress } = useProgressContext();
  const stats = getProgressStats(progress.completedLessons);
  const daily = getDailyRecommendation(progress.completedLessons);
  const [duration, setDuration] = useState("15");
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8">
        <p
          className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-ink-muted)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Status
        </p>
        <h1
          className="text-3xl text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {daily.title
            ? `Next up: ${daily.title}`
            : "Curriculum complete — try a design challenge"}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-ink-muted)]">
          {stats.completed} of {stats.total} lessons done. Pick a session length or continue
          from where you stopped.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-4 border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-4 py-3">
        <Readout label="Lessons" value={stats.completed} suffix={`/ ${stats.total}`} />
        <Readout label="Time" value={formatMinutes(progress.totalMinutesLearned)} />
        <Readout label="Streak" value={progress.streak} suffix="days" />
        <Readout label="Challenges" value={progress.completedChallenges.length} />
      </div>

      <section className="mb-10 flex flex-wrap items-center gap-4">
        {daily.lessonId && (
          <Link to={`/lesson/${daily.lessonId}`}>
            <Button>
              Continue · {formatMinutes(daily.durationMinutes ?? 15)}
            </Button>
          </Link>
        )}
        <SegmentedControl
          ariaLabel="Session duration"
          options={sessionOptions}
          value={duration}
          onChange={setDuration}
        />
        <Button
          variant="secondary"
          onClick={() =>
            navigate(`/session?duration=${duration as unknown as SessionDuration}`)
          }
        >
          Build session
        </Button>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2
            className="text-lg text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Curriculum map
          </h2>
          <Link
            to="/curriculum"
            className="text-sm text-[var(--color-signal)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            View all
          </Link>
        </div>
        <CurriculumMap phases={stats.phaseProgress} />
      </section>
    </div>
  );
}
