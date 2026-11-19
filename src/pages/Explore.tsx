import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MiniSearch from "minisearch";
import { searchDocs, contentGraph } from "@/data";
import { TextInput } from "@/design/components/Field";
import { Tag } from "@/design/components/Tag";

export default function Explore() {
  const [q, setQ] = useState("");
  const search = useMemo(() => {
    const ms = new MiniSearch({
      fields: ["title", "summary", "tags", "concepts"],
      storeFields: ["title", "id", "phaseId", "moduleId", "kind"],
      searchOptions: { fuzzy: 0.2, prefix: true },
    });
    ms.addAll(searchDocs as object[]);
    return ms;
  }, []);

  const hits =
    q.trim().length > 0
      ? (search.search(q).slice(0, 30) as unknown as {
          id: string;
          title: string;
          phaseId: string;
          kind: string;
        }[])
      : (searchDocs as { id: string; title: string; phaseId: string; kind: string }[]).slice(
          0,
          20,
        );

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1
        className="mb-2 text-3xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Explore
      </h1>
      <p className="mb-6 text-[var(--color-ink-muted)]">
        Search the curriculum and inspect the prerequisite graph.
      </p>
      <TextInput
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search lessons, tags, concepts…"
        aria-label="Search"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2
            className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Lessons
          </h2>
          <ul className="space-y-2">
            {hits.map((h) => (
              <li key={h.id}>
                <Link
                  to={`/lesson/${h.id}`}
                  className="flex items-center justify-between border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-3 py-2 hover:border-[var(--color-ink-muted)]"
                >
                  <span className="text-sm text-[var(--color-ink)]">{h.title}</span>
                  <Tag signal={h.kind === "living"}>{h.kind}</Tag>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2
            className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Prerequisite edges ({contentGraph.edges.length})
          </h2>
          <ul className="max-h-[28rem] space-y-1 overflow-y-auto text-sm text-[var(--color-ink-muted)]">
            {contentGraph.edges.slice(0, 80).map((e, i) => (
              <li key={i} style={{ fontFamily: "var(--font-mono)" }}>
                {e.from} → {e.to}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
