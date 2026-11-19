import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useProgressContext } from "@/context/ProgressContext";
import {
  getLesson,
  getModule,
  getPhase,
  getAllLessonsOrdered,
} from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";
import { sectionsForDepth } from "@/content/schema";
import { Button } from "@/design/components/Button";
import { SegmentedControl } from "@/design/components/SegmentedControl";
import { Tag } from "@/design/components/Tag";
import { Field, TextArea } from "@/design/components/Field";
import { Drawer } from "@/design/components/Drawer";
import {
  Callout,
  FreshnessStamp,
  SheetFrame,
} from "@/design/components/motifs";
import { apiHealth, apiJson, scoutToken } from "@/lib/api";
import { MermaidBlock } from "@/components/MermaidBlock";

type Depth = "core" | "deepDive" | "expert";

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
  const done = lesson ? isLessonComplete(lesson.id) : false;
  const [depth, setDepth] = useState<Depth>("core");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMsg, setTutorMsg] = useState("");
  const [tutorReply, setTutorReply] = useState("");
  const [apiUp, setApiUp] = useState(false);
  const [explain, setExplain] = useState<string | null>(null);
  const [scoutNote, setScoutNote] = useState<string | null>(null);
  const isAdmin = Boolean(scoutToken() || import.meta.env.DEV);

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

  useEffect(() => {
    void apiHealth().then(setApiUp);
  }, []);

  const sections = useMemo(() => {
    if (!lesson) return [];
    return sectionsForDepth(lesson as never, depth);
  }, [lesson, depth]);

  if (!lesson || !phase || !module) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="text-[var(--color-ink-muted)]">Lesson not found.</p>
        <Link to="/curriculum" className="text-[var(--color-signal)]">
          Back to curriculum
        </Link>
      </div>
    );
  }

  const handleComplete = () => {
    markLessonComplete(lesson.id, lesson.durationMinutes);
    if (nextLesson) navigate(`/lesson/${nextLesson.id}`);
  };

  const askTutor = async () => {
    setTutorReply("…");
    try {
      const res = await apiJson<{ text: string }>("/api/tutor", {
        method: "POST",
        body: JSON.stringify({ message: tutorMsg, lessonId: lesson.id }),
      });
      setTutorReply(res.text);
    } catch {
      setTutorReply("API unavailable. Start the server with npm run server.");
    }
  };

  const explainSection = async (text: string) => {
    if (!apiUp) return;
    try {
      const res = await apiJson<{ text: string }>("/api/explain", {
        method: "POST",
        body: JSON.stringify({ section: text, mode: "simpler" }),
      });
      setExplain(res.text);
    } catch {
      setExplain(null);
    }
  };

  const checkUpdates = async () => {
    setScoutNote("Scouting…");
    try {
      const { jobId } = await apiJson<{ jobId: string }>("/api/scout", {
        method: "POST",
        token: scoutToken(),
        body: JSON.stringify({ mode: "lesson", lessonId: lesson.id, depth: "quick" }),
      });
      setScoutNote(`Scout job ${jobId} started. See Radar for progress.`);
    } catch {
      setScoutNote("Scout API unavailable or unauthorized.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[200px_minmax(0,48rem)_240px] lg:px-8">
      <aside className="hidden lg:block">
        <div className="sticky top-8 space-y-2">
          <div
            className="text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Outline
          </div>
          {sections.map((s, i) => (
            <a
              key={i}
              href={`#sec-${i}`}
              className="block text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              {s.title}
            </a>
          ))}
          <Link
            to={`/quiz/${lesson.id}`}
            className="mt-4 block text-sm text-[var(--color-signal)]"
          >
            Practice quiz
          </Link>
        </div>
      </aside>

      <article>
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-subtle)]">
          <Link to="/curriculum">Curriculum</Link>
          <span>/</span>
          <span>{phase.title}</span>
          <span>/</span>
          <span>{module.title}</span>
        </nav>

        <header className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tag>Phase {phase.number}</Tag>
            <Tag>{formatMinutes(lesson.durationMinutes)}</Tag>
            {done && <Tag signal>Completed</Tag>}
          </div>
          <h1
            className="text-3xl text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {lesson.title}
          </h1>
          <p className="text-[var(--color-ink-muted)]">{lesson.summary}</p>
          <SegmentedControl
            ariaLabel="Depth"
            options={[
              { value: "core", label: "Core" },
              { value: "deepDive", label: "Deep dive" },
              { value: "expert", label: "Expert" },
            ]}
            value={depth}
            onChange={setDepth}
          />
        </header>

        <SheetFrame
          sheetId={lesson.id}
          revision={lesson.version}
          status={lesson.status}
        >
          <div className="space-y-10">
            {sections.length === 0 && (
              <p className="text-sm text-[var(--color-ink-muted)]">
                No {depth} content yet. Run content:deepen or switch to Core.
              </p>
            )}
            {sections.map((section, i) => (
              <section key={i} id={`sec-${i}`}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2
                    className="text-xl text-[var(--color-ink)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {section.title}
                  </h2>
                  {apiUp && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        explainSection(section.paragraphs.join("\n"))
                      }
                    >
                      Explain
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="text-[15px] leading-relaxed text-[var(--color-ink-soft)]"
                    >
                      {p}
                    </p>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 border-l border-[var(--color-rule)] pl-4">
                    {section.bullets.map((b, k) => (
                      <li
                        key={k}
                        className="text-sm leading-relaxed text-[var(--color-ink-soft)]"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </SheetFrame>

        {explain && (
          <div className="mt-6">
            <Callout title="Explanation">{explain}</Callout>
          </div>
        )}

        {(lesson.diagrams ?? []).map((d) => (
          <div key={d.id} className="mt-8">
            <h3
              className="mb-2 text-sm uppercase tracking-wider text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {d.title}
            </h3>
            <MermaidBlock chart={d.mermaid} />
            {d.caption && (
              <p className="mt-1 text-xs text-[var(--color-ink-subtle)]">
                {d.caption}
              </p>
            )}
          </div>
        ))}

        <section className="mt-10">
          <h2
            className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Concepts
          </h2>
          <dl className="space-y-2">
            {lesson.concepts.map((c, i) => (
              <div
                key={i}
                className="grid grid-cols-[auto_1fr] gap-3 border-b border-[var(--color-rule-subtle)] py-2"
              >
                <dt
                  className="tabular-nums text-xs text-[var(--color-ink-subtle)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </dt>
                <dd className="text-sm text-[var(--color-ink-soft)]">{c}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <h2
              className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Do
            </h2>
            <ul className="space-y-2">
              {lesson.practices.map((p, i) => (
                <li
                  key={i}
                  className="border-t border-[var(--color-rule)] pt-2 text-sm text-[var(--color-ink-soft)]"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2
              className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Avoid
            </h2>
            <ul className="space-y-2">
              {lesson.pitfalls.map((p, i) => (
                <li
                  key={i}
                  className="border-t border-[var(--color-rule)] pt-2 text-sm text-[var(--color-ink-soft)]"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <Callout title="Key takeaways">
            <ol className="list-decimal space-y-1 pl-4">
              {lesson.keyTakeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </Callout>
        </section>

        <section className="mt-8">
          <h2
            className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Reflect
          </h2>
          <div className="space-y-4">
            {lesson.reflectionQuestions.map((q, i) => (
              <Field key={i} label={q}>
                <TextArea
                  rows={3}
                  defaultValue={progress.lessonNotes[`${lesson.id}-${i}`] ?? ""}
                  onBlur={(e) => setLessonNote(`${lesson.id}-${i}`, e.target.value)}
                  placeholder="Notes"
                />
              </Field>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-6">
          <div>
            {prevLesson && (
              <Link
                to={`/lesson/${prevLesson.id}`}
                className="text-sm text-[var(--color-ink-muted)]"
              >
                ← {prevLesson.title}
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {apiUp && (
              <Button variant="secondary" onClick={() => setTutorOpen(true)}>
                Ask tutor
              </Button>
            )}
            {!done && (
              <Button variant="secondary" onClick={handleComplete}>
                Mark complete
              </Button>
            )}
            {nextLesson ? (
              <Link to={`/lesson/${nextLesson.id}`}>
                <Button>Next lesson</Button>
              </Link>
            ) : (
              <Link to="/challenges">
                <Button>Design challenges</Button>
              </Link>
            )}
          </div>
        </footer>
      </article>

      <aside className="hidden space-y-4 lg:block">
        <div className="sticky top-8 space-y-4">
          <FreshnessStamp kind={lesson.kind} lastReviewed={lesson.lastReviewed} />
          <div className="border border-[var(--color-rule)] p-3 text-xs text-[var(--color-ink-muted)]">
            <div style={{ fontFamily: "var(--font-label)" }} className="mb-2 uppercase tracking-wider">
              Title block
            </div>
            <div style={{ fontFamily: "var(--font-mono)" }}>
              {lesson.id}
              <br />
              v{lesson.version ?? "1.0.0"}
              <br />
              {lesson.status ?? "published"}
            </div>
          </div>
          {(lesson.sources ?? []).length > 0 && (
            <div>
              <div
                className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Sources
              </div>
              <ul className="space-y-1 text-sm">
                {(lesson.sources ?? []).map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a
                        href={s.url}
                        className="text-[var(--color-signal)]"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.title}
                      </a>
                    ) : (
                      <span className="text-[var(--color-ink-muted)]">{s.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isAdmin && (
            <div className="space-y-2">
              <Button variant="secondary" onClick={checkUpdates}>
                Check for updates
              </Button>
              {scoutNote && (
                <p className="text-xs text-[var(--color-ink-muted)]">{scoutNote}</p>
              )}
            </div>
          )}
        </div>
      </aside>

      <Drawer open={tutorOpen} onClose={() => setTutorOpen(false)} title="Tutor">
        <Field label="Question">
          <TextArea
            rows={4}
            value={tutorMsg}
            onChange={(e) => setTutorMsg(e.target.value)}
            placeholder={`Ask about ${lesson.title}`}
          />
        </Field>
        <div className="mt-3">
          <Button onClick={askTutor}>Send</Button>
        </div>
        {tutorReply && (
          <pre className="mt-4 whitespace-pre-wrap text-sm text-[var(--color-ink-soft)]">
            {tutorReply}
          </pre>
        )}
      </Drawer>
    </div>
  );
}
