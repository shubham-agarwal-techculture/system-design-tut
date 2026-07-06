import { Link } from "react-router-dom";
import { phases } from "@/data";
import { useProgressContext } from "@/context/ProgressContext";
import {
  getModulesForPhase,
  getLessonsForModule,
  phaseColors,
} from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";

export default function Curriculum() {
  const { isLessonComplete } = useProgressContext();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10 animate-fade-in">
      <header className="mb-10">
        <h1 className="heading-xl">Curriculum</h1>
        <p className="mt-2 text-muted">
          Eight phases from foundations to design mastery. Start at Phase 1 and progress
          sequentially — each phase builds on the last.
        </p>
        <div className="divider-ornate mt-6" />
      </header>

      <div className="space-y-12">
        {phases.map((phase) => {
          const colors = phaseColors[phase.color];
          const phaseModules = getModulesForPhase(phase.id);

          return (
            <section key={phase.id} id={`phase-${phase.id}`} className="scroll-mt-8">
              <div className="mb-6 flex items-start gap-4">
                <div
                  className={`gothic-arch flex h-12 w-12 shrink-0 items-center justify-center bg-gradient-to-br ${colors.gradient} font-serif text-lg font-bold text-[var(--color-cream)]`}
                >
                  {phase.number}
                </div>
                <div>
                  <h2 className="heading-md">{phase.title}</h2>
                  <p className="text-sm italic text-subtle">{phase.subtitle}</p>
                  <p className="mt-1 text-sm text-muted">{phase.description}</p>
                </div>
              </div>

              {phaseModules.map((mod) => {
                const modLessons = getLessonsForModule(mod.id);
                if (modLessons.length === 0) return null;

                return (
                  <div key={mod.id} className="mb-6 ml-16">
                    <h3 className={`mb-3 font-serif text-sm font-semibold ${colors.text}`}>
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="mb-3 text-xs text-subtle">{mod.description}</p>
                    )}
                    <div className="space-y-2">
                      {modLessons.map((lesson) => {
                        const done = isLessonComplete(lesson.id);
                        return (
                          <Link
                            key={lesson.id}
                            to={`/lesson/${lesson.id}`}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                              done ? "lesson-row-done" : "lesson-row"
                            }`}
                          >
                            <span
                              className={`lesson-marker ${
                                done ? "lesson-marker-done" : "lesson-marker-pending"
                              }`}
                            >
                              {done ? "✓" : "○"}
                            </span>
                            <span
                              className={`flex-1 text-sm ${
                                done ? "text-subtle line-through decoration-[var(--color-stone-dark)]" : "text-[var(--color-ink-soft)]"
                              }`}
                            >
                              {lesson.title}
                            </span>
                            <span className="text-xs text-subtle">
                              {formatMinutes(lesson.durationMinutes)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    {mod.resources && mod.resources.length > 0 && (
                      <div className="mt-3 text-xs italic text-[var(--color-ink-faint)]">
                        📖 {mod.resources.join(" · ")}
                      </div>
                    )}
                  </div>
                );
              })}

              {phase.id === "design-systems" && (
                <div className="ml-16 mt-4">
                  <Link
                    to="/challenges"
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:shadow-[var(--shadow-soft)] ${colors.border} ${colors.bg} ${colors.text}`}
                  >
                    ◈ View design challenges →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
