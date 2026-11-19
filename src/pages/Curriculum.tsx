import { Link } from "react-router-dom";
import { phases } from "@/data";
import { useProgressContext } from "@/context/ProgressContext";
import { getModulesForPhase, getLessonsForModule } from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";
import { PhaseMarker, ProgressMark } from "@/design/components/motifs";
import { Tag } from "@/design/components/Tag";

export default function Curriculum() {
  const { isLessonComplete, progress } = useProgressContext();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <header className="mb-10">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
          Curriculum
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Phases from foundations through agentic systems. Progress sequentially — each phase
          builds on the last.
        </p>
      </header>

      <div className="space-y-12">
        {phases.map((phase) => {
          const phaseModules = getModulesForPhase(phase.id);
          const lessons = phaseModules.flatMap((m) => getLessonsForModule(m.id));
          const completed = lessons.filter((l) => isLessonComplete(l.id)).length;
          const percent =
            lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

          return (
            <section key={phase.id} id={`phase-${phase.id}`} className="scroll-mt-8">
              <div className="mb-4 flex items-start gap-4">
                <PhaseMarker number={phase.number} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2
                      className="text-xl text-[var(--color-ink)]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {phase.title}
                    </h2>
                    <ProgressMark percent={percent} />
                  </div>
                  <p className="text-sm text-[var(--color-ink-muted)]">{phase.subtitle}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{phase.description}</p>
                </div>
              </div>

              <div className="space-y-6 border-l border-[var(--color-rule)] pl-6">
                {phaseModules.map((mod) => {
                  const modLessons = getLessonsForModule(mod.id);
                  if (modLessons.length === 0) return null;
                  return (
                    <div key={mod.id}>
                      <h3
                        className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
                        style={{ fontFamily: "var(--font-label)" }}
                      >
                        {mod.title}
                      </h3>
                      <ul className="space-y-1">
                        {modLessons.map((lesson) => {
                          const done = isLessonComplete(lesson.id);
                          return (
                            <li key={lesson.id}>
                              <Link
                                to={`/lesson/${lesson.id}`}
                                className="flex items-center justify-between gap-3 border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm hover:border-[var(--color-ink-muted)]"
                              >
                                <span className="text-[var(--color-ink)]">{lesson.title}</span>
                                <span className="flex items-center gap-2">
                                  {lesson.kind === "living" && <Tag signal>Living</Tag>}
                                  {done && <Tag>Done</Tag>}
                                  <span
                                    className="text-xs text-[var(--color-ink-subtle)]"
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {formatMinutes(lesson.durationMinutes)}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-[var(--color-ink-subtle)]">
        {progress.completedLessons.length} lessons completed in this browser.
      </p>
    </div>
  );
}
