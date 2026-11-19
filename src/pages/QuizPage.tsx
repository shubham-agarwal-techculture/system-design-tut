import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLesson } from "@/utils/curriculum";
import { Button } from "@/design/components/Button";
import { apiJson } from "@/lib/api";

interface Q {
  type: "mcq" | "short";
  prompt: string;
  choices?: string[];
  answer: string;
}

export default function QuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const [questions, setQuestions] = useState<Q[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    void apiJson<{ questions: Q[]; offline?: boolean }>("/api/quiz", {
      method: "POST",
      body: JSON.stringify({ lessonId }),
    })
      .then((r) => {
        setQuestions(r.questions);
        setOffline(Boolean(r.offline));
      })
      .catch(() => {
        setOffline(true);
        setQuestions(
          (lesson?.concepts ?? []).slice(0, 5).map((c) => ({
            type: "short",
            prompt: `Explain: ${c}`,
            answer: c,
          })),
        );
      });
  }, [lessonId, lesson]);

  if (!lesson) {
    return <div className="p-8">Lesson not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link to={`/lesson/${lesson.id}`} className="text-sm text-[var(--color-signal)]">
        ← {lesson.title}
      </Link>
      <h1 className="mt-4 text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        Practice quiz
      </h1>
      {offline && (
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Offline / heuristic questions. Start the API for model-generated quizzes.
        </p>
      )}
      <ol className="mt-8 space-y-6">
        {questions.map((q, i) => (
          <li key={i} className="border border-[var(--color-rule)] p-4">
            <div className="mb-2 text-sm font-medium">{q.prompt}</div>
            {q.choices && (
              <ul className="mb-2 space-y-1 text-sm text-[var(--color-ink-muted)]">
                {q.choices.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            )}
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--color-signal)]">Answer</summary>
              <p className="mt-2 text-[var(--color-ink-soft)]">{q.answer}</p>
            </details>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Button
          variant="secondary"
          onClick={() =>
            void apiJson<{ questions: Q[] }>("/api/quiz", {
              method: "POST",
              body: JSON.stringify({ lessonId }),
            }).then((r) => setQuestions(r.questions))
          }
        >
          Regenerate
        </Button>
      </div>
    </div>
  );
}
