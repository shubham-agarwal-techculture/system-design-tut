import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import {
  getLesson,
  getModule,
  getPhase,
  getAllLessonsOrdered,
  phaseColors,
} from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const {
    progress,
    markLessonComplete,
    setLessonNote,
    setLastVisited,
    isLessonComplete,
  } = useProgressContext();

  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const module = lesson ? getModule(lesson.moduleId) : undefined;
  const phase = lesson ? getPhase(lesson.phaseId) : undefined;
  const colors = phase ? phaseColors[phase.color] : phaseColors.indigo;
  const done = lesson ? isLessonComplete(lesson.id) : false;

  const ordered = getAllLessonsOrdered();
  const currentIdx = lesson ? ordered.findIndex((l) => l.id === lesson.id) : -1;
  const prevLesson = currentIdx > 0 ? ordered[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < ordered.length - 1
      ? ordered[currentIdx + 1]
      : null;

  useEffect(() => {
    if (lesson) setLastVisited(lesson.id);
  }, [lesson, setLastVisited]);

  if (!lesson || !phase || !module) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="text-muted">Lesson not found.</p>
        <Link to="/curriculum" className="link-accent mt-2 inline-block text-sm">
          ← Back to curriculum
        </Link>
      </div>
    );
  }

  const handleComplete = () => {
    markLessonComplete(lesson.id, lesson.durationMinutes);
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-10 animate-fade-in">
      <nav className="mb-6 flex items-center gap-2 text-xs text-subtle">
        <Link to="/curriculum" className="hover:text-[var(--color-ink-muted)]">
          Curriculum
        </Link>
        <span>/</span>
        <span className={colors.text}>{phase.title}</span>
        <span>/</span>
        <span className="text-muted">{module.title}</span>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`badge border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            Phase {phase.number}
          </span>
          <span className="text-xs text-subtle">
            {formatMinutes(lesson.durationMinutes)}
          </span>
          {done && <span className="badge-complete text-xs">✓ Completed</span>}
        </div>
        <h1 className="heading-xl">{lesson.title}</h1>
        <p className="mt-3 leading-relaxed text-muted">{lesson.summary}</p>
        <div className="divider-ornate mt-6" />
      </header>

      <section className="mb-8">
        <h2 className="section-label mb-4">Key concepts</h2>
        <ul className="space-y-3">
          {lesson.concepts.map((concept, i) => (
            <li key={i} className="card flex gap-3 px-4 py-3">
              <span className={`mt-0.5 shrink-0 font-serif ${colors.text}`}>◆</span>
              <span className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {concept}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-callout mb-8 p-5">
        <h2 className="mb-2 font-serif text-sm font-semibold text-[var(--color-brass)]">
          Why it matters
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {lesson.whyItMatters}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="section-label mb-4">Reflect on this</h2>
        <div className="space-y-3">
          {lesson.reflectionQuestions.map((q, i) => (
            <div key={i} className="card p-4">
              <p className="mb-3 text-sm italic text-[var(--color-ink-soft)]">{q}</p>
              <textarea
                placeholder="Write your thoughts in the margin..."
                defaultValue={progress.lessonNotes[lesson.id] ?? ""}
                onBlur={(e) => setLessonNote(lesson.id, e.target.value)}
                className="input-field font-serif"
                rows={2}
              />
            </div>
          ))}
        </div>
      </section>

      {lesson.resources && lesson.resources.length > 0 && (
        <section className="mb-8">
          <h2 className="section-label mb-3">Further reading</h2>
          <ul className="space-y-1 text-sm text-muted">
            {lesson.resources.map((r, i) => (
              <li key={i}>📖 {r}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-6">
        <div>
          {prevLesson && (
            <Link
              to={`/lesson/${prevLesson.id}`}
              className="text-sm text-subtle hover:text-[var(--color-ink-muted)]"
            >
              ← {prevLesson.title}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!done && (
            <button onClick={handleComplete} className="btn-success">
              Mark complete
            </button>
          )}
          {nextLesson ? (
            <Link to={`/lesson/${nextLesson.id}`} className="btn-primary">
              Next lesson →
            </Link>
          ) : (
            <Link to="/challenges" className="btn-primary">
              Start design challenges →
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
