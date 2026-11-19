import { contentGeneratedAt } from "@/data";

const staticNotes = [
  {
    date: "2026-03-26",
    title: "AI-augmented content platform",
    body: "Content moved to validated JSON, syllabus expanded through phase 12 (agentic systems), Trend Scout and live tutor APIs added.",
  },
  {
    date: "2026-03-26",
    title: "Design system rebuild",
    body: "Four skins (Drafting, Transit, Riso, Instrument) with light/dark and colorways. Semantic tokens only.",
  },
];

export default function WhatsNew() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        What's new
      </h1>
      <p className="mb-8 text-sm text-[var(--color-ink-muted)]">
        Content index built {contentGeneratedAt}. Scout digests appear in{" "}
        <code>content/scout/digests/</code> after scheduled or on-demand runs.
      </p>
      <ol className="space-y-6">
        {staticNotes.map((n) => (
          <li key={n.title} className="border-l-2 border-[var(--color-signal)] pl-4">
            <div
              className="text-xs uppercase tracking-wider text-[var(--color-ink-subtle)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {n.date}
            </div>
            <h2 className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {n.title}
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)]">{n.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
