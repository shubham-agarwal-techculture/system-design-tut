import { Link } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getProgressStats, getPhase, phaseColors } from "@/utils/curriculum";
import { getDailyRecommendation, formatMinutes } from "@/utils/session";
import type { SessionDuration } from "@/types";

const sessionOptions: { duration: SessionDuration; label: string; desc: string }[] = [
  { duration: 5, label: "5 min", desc: "One quick concept" },
  { duration: 15, label: "15 min", desc: "A focused lesson" },
  { duration: 30, label: "30 min", desc: "Deep dive session" },
  { duration: 60, label: "1 hour", desc: "Lesson + design challenge" },
];

export default function Dashboard() {
  const { progress } = useProgressContext();
  const stats = getProgressStats(progress.completedLessons);
  const daily = getDailyRecommendation(progress.completedLessons);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10 animate-fade-in">
      <header className="mb-10">
        <p className="mb-1 text-sm font-medium italic text-[var(--color-burgundy)]">
          Welcome back, scholar
        </p>
        <h1 className="heading-xl">Your System Design Journey</h1>
        <p className="mt-2 max-w-xl text-muted">
          Learn from first principles. Whether you have five minutes or an hour, every
          session moves you closer to designing production-grade systems.
        </p>
        <div className="divider-ornate mt-6" />
      </header>

      <div className="mb-10 grid grid-cols-4 gap-4">
        {[
          { label: "Lessons done", value: stats.completed, suffix: `/ ${stats.total}` },
          { label: "Time invested", value: formatMinutes(progress.totalMinutesLearned), suffix: "" },
          { label: "Day streak", value: progress.streak, suffix: progress.streak === 1 ? " day" : " days" },
          { label: "Challenges", value: progress.completedChallenges.length, suffix: " done" },
        ].map((stat) => (
          <div key={stat.label} className="card gothic-arch p-4">
            <div className="mb-1 text-xs text-subtle">{stat.label}</div>
            <div className="stat-value">
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-subtle">{stat.suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {daily.lessonId && (
        <section className="mb-10">
          <h2 className="heading-lg mb-4">Continue learning</h2>
          <Link to={`/lesson/${daily.lessonId}`} className="card-featured group block p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--color-burgundy)]">
                  Up next
                </div>
                <h3 className="heading-md transition-colors group-hover:text-[var(--color-burgundy)]">
                  {daily.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{daily.description}</p>
              </div>
              <div className="ml-4 flex shrink-0 flex-col items-end gap-2">
                <span className="text-xs text-subtle">
                  {formatMinutes(daily.durationMinutes ?? 15)}
                </span>
                <span className="btn-gold">Begin →</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="mb-10">
        <h2 className="heading-lg mb-1">How much time do you have?</h2>
        <p className="mb-4 text-sm text-subtle">
          Pick a session length — we'll build a plan from where you left off.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {sessionOptions.map((opt) => (
            <Link
              key={opt.duration}
              to={`/session?duration=${opt.duration}`}
              className="card gothic-arch p-4 text-center transition-all hover:border-[var(--color-burgundy)]/30 hover:shadow-[var(--shadow-lifted)]"
            >
              <div className="font-serif text-2xl font-bold text-[var(--color-ink)]">
                {opt.label}
              </div>
              <div className="mt-1 text-xs text-subtle">{opt.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-lg">Curriculum phases</h2>
          <Link to="/curriculum" className="link-accent text-sm">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.phaseProgress.map(({ phase, total, completed, percent }) => {
            const colors = phaseColors[phase.color];
            const phaseData = getPhase(phase.id);
            if (!phaseData || total === 0) return null;
            return (
              <Link
                key={phase.id}
                to={`/curriculum#phase-${phase.id}`}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-[var(--shadow-card)] ${colors.border} ${colors.bg}`}
              >
                <div
                  className={`gothic-arch flex h-10 w-10 shrink-0 items-center justify-center bg-gradient-to-br ${colors.gradient} text-sm font-bold text-[var(--color-cream)]`}
                >
                  {phase.number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-serif font-medium text-[var(--color-ink)]">
                      {phase.title}
                    </span>
                    <span className="text-xs text-subtle">
                      {completed}/{total}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill-gold bg-gradient-to-r ${colors.gradient}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
