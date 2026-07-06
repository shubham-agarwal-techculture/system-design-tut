import { Link, useParams } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getChallenge } from "@/utils/curriculum";
import { formatMinutes } from "@/utils/session";

const designFramework = [
  "Functional requirements",
  "Non-functional requirements",
  "Capacity estimation",
  "API design",
  "Data model",
  "High-level architecture",
  "Component interactions",
  "Bottlenecks",
  "Failure scenarios",
  "Scaling strategy",
  "Security",
  "Monitoring",
  "Deployment",
  "Trade-offs",
  "Cost optimization",
];

export default function ChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { markChallengeComplete, isChallengeComplete } = useProgressContext();
  const challenge = challengeId ? getChallenge(challengeId) : undefined;
  const done = challenge ? isChallengeComplete(challenge.id) : false;

  if (!challenge) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="text-muted">Challenge not found.</p>
        <Link to="/challenges" className="link-accent mt-2 inline-block text-sm">
          ← Back to challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10 animate-fade-in">
      <nav className="mb-6">
        <Link to="/challenges" className="text-xs text-subtle hover:text-[var(--color-ink-muted)]">
          ← All challenges
        </Link>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="badge border border-amber-800/30 bg-amber-900/8 text-amber-900 capitalize">
            {challenge.difficulty}
          </span>
          <span className="text-xs text-subtle">
            {formatMinutes(challenge.estimatedMinutes)}
          </span>
          {done && <span className="badge-complete text-xs">✓ Completed</span>}
        </div>
        <h1 className="heading-xl">{challenge.title}</h1>
        <p className="mt-3 leading-relaxed text-muted">{challenge.description}</p>
        <div className="divider-ornate mt-6" />
      </header>

      <section className="mb-8">
        <h2 className="section-label mb-4">Hints</h2>
        <ul className="space-y-2">
          {challenge.hints.map((hint, i) => (
            <li key={i} className="card flex gap-3 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
              <span className="shrink-0 text-[var(--color-gold)]">◆</span>
              {hint}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="section-label mb-4">Your design checklist</h2>
        <div className="space-y-2">
          {challenge.checklist.map((item, i) => (
            <label
              key={i}
              className="card flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-cream)]"
            >
              <input type="checkbox" className="checkbox-field" />
              <span className="text-sm text-[var(--color-ink-soft)]">{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card-callout mb-8 p-5">
        <h2 className="mb-3 font-serif text-sm font-semibold text-[var(--color-burgundy)]">
          Design framework (Phase 8)
        </h2>
        <p className="mb-3 text-xs text-subtle">
          For every system, work through these 15 questions:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {designFramework.map((item, i) => (
            <div key={i} className="text-xs text-muted">
              {i + 1}. {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="section-label mb-3">Your design notes</h2>
        <textarea
          placeholder="Sketch your architecture, capacity estimates, API design, and trade-offs here..."
          className="input-field font-mono"
          rows={12}
        />
      </section>

      <footer className="flex justify-end gap-3 border-t border-[var(--color-border-subtle)] pt-6">
        {!done && (
          <button onClick={() => markChallengeComplete(challenge.id)} className="btn-success">
            Mark complete
          </button>
        )}
        <Link to="/challenges" className="btn-secondary">
          Back to challenges
        </Link>
      </footer>
    </div>
  );
}
