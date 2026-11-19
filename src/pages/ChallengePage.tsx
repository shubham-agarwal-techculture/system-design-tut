import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useProgressContext } from "@/context/ProgressContext";
import { getChallenge } from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";
import { Button } from "@/design/components/Button";
import { Tag } from "@/design/components/Tag";
import { TextArea } from "@/design/components/Field";
import { apiJson } from "@/lib/api";

export default function ChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { markChallengeComplete, isChallengeComplete } = useProgressContext();
  const challenge = challengeId ? getChallenge(challengeId) : undefined;
  const done = challenge ? isChallengeComplete(challenge.id) : false;
  const [answer, setAnswer] = useState("");
  const [review, setReview] = useState<string | null>(null);

  if (!challenge) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="text-[var(--color-ink-muted)]">Challenge not found.</p>
        <Link to="/challenges" className="text-[var(--color-signal)]">
          Back to challenges
        </Link>
      </div>
    );
  }

  const runReview = async () => {
    setReview("Reviewing…");
    try {
      const res = await apiJson<{
        strengths: string[];
        gaps: string[];
        nextSteps: string[];
        offline?: boolean;
      }>("/api/design-review", {
        method: "POST",
        body: JSON.stringify({ challengeId: challenge.id, answer }),
      });
      setReview(
        [
          res.offline ? "(offline heuristic)" : "",
          "Strengths:",
          ...res.strengths.map((s) => `• ${s}`),
          "",
          "Gaps:",
          ...res.gaps.map((g) => `• ${g}`),
          "",
          "Next:",
          ...res.nextSteps.map((n) => `• ${n}`),
        ]
          .filter(Boolean)
          .join("\n"),
      );
    } catch {
      setReview("API unavailable. Start npm run server for AI review.");
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-8 py-10 lg:grid-cols-[1fr_280px]">
      <div>
        <Link to="/challenges" className="text-xs text-[var(--color-ink-muted)]">
          ← All challenges
        </Link>
        <header className="mt-4 mb-6">
          <div className="mb-2 flex gap-2">
            <Tag>{challenge.difficulty}</Tag>
            <Tag>{formatMinutes(challenge.estimatedMinutes)}</Tag>
            {done && <Tag signal>Done</Tag>}
          </div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
            {challenge.title}
          </h1>
          <p className="mt-2 text-[var(--color-ink-muted)]">{challenge.description}</p>
        </header>

        <section className="mb-6">
          <h2
            className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Your design
          </h2>
          <TextArea
            rows={14}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Requirements, estimates, APIs, data model, architecture, trade-offs…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={runReview} disabled={!answer.trim()}>
              AI review
            </Button>
            {!done && (
              <Button variant="secondary" onClick={() => markChallengeComplete(challenge.id)}>
                Mark complete
              </Button>
            )}
          </div>
          {review && (
            <pre className="mt-4 whitespace-pre-wrap border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-4 text-sm">
              {review}
            </pre>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <div>
          <h2
            className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Checklist
          </h2>
          <ul className="space-y-1 text-sm text-[var(--color-ink-soft)]">
            {challenge.checklist.map((c) => (
              <li key={c} className="border-t border-[var(--color-rule-subtle)] py-1">
                {c}
              </li>
            ))}
          </ul>
        </div>
        {(challenge.rubric ?? []).length > 0 && (
          <div>
            <h2
              className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Rubric
            </h2>
            <ul className="space-y-1 text-sm text-[var(--color-ink-soft)]">
              {(challenge.rubric ?? []).map((r) => (
                <li key={r} className="border-t border-[var(--color-rule-subtle)] py-1">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2
            className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Hints
          </h2>
          <ul className="space-y-1 text-sm text-[var(--color-ink-muted)]">
            {challenge.hints.map((h) => (
              <li key={h}>• {h}</li>
            ))}
          </ul>
        </div>
        {(challenge.scaleVariants ?? []).length > 0 && (
          <div>
            <h2
              className="mb-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Scale 10×
            </h2>
            <ul className="text-sm text-[var(--color-ink-muted)]">
              {(challenge.scaleVariants ?? []).map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
