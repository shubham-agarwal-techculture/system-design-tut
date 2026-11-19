import { useEffect, useState } from "react";
import { Button } from "@/design/components/Button";
import { TextInput } from "@/design/components/Field";
import { Tag } from "@/design/components/Tag";
import { apiHealth, apiJson, scoutToken } from "@/lib/api";

interface WatchItem {
  id: string;
  label: string;
  score: number;
  weeks: number;
}

export default function Radar() {
  const [apiUp, setApiUp] = useState(false);
  const [topic, setTopic] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [events, setEvents] = useState<{ stage: string; message: string }[]>([]);
  const [result, setResult] = useState<unknown>(null);
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiHealth().then(setApiUp);
    void apiJson<{ watchlist: WatchItem[] }>("/api/scout/jobs", {
      token: scoutToken(),
    })
      .then((r) => setWatchlist((r.watchlist as WatchItem[]) ?? []))
      .catch(() => undefined);
  }, []);

  const start = async (mode: "full" | "topic") => {
    setError(null);
    setEvents([]);
    setResult(null);
    try {
      const { jobId: id } = await apiJson<{ jobId: string }>("/api/scout", {
        method: "POST",
        token: scoutToken(),
        body: JSON.stringify({
          mode,
          query: mode === "topic" ? topic : undefined,
          depth: "quick",
          propose: false,
        }),
      });
      setJobId(id);
      const es = new EventSource(`/api/scout/${id}/stream`);
      // EventSource can't set headers — stream endpoint allows empty token in dev.
      // For token auth, we poll instead:
      es.close();
      poll(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scout failed");
    }
  };

  const poll = async (id: string) => {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 800));
      try {
        await fetch(`/api/scout/${id}/stream`, {
          headers: scoutToken() ? { "x-scout-token": scoutToken() } : {},
        }).catch(() => undefined);
        const jobs = await apiJson<{
          memory: { id: string; status: string; events: number; result?: unknown }[];
        }>("/api/scout/jobs", { token: scoutToken() });
        const job = jobs.memory.find((j) => j.id === id);
        if (job) {
          setEvents((prev) =>
            prev.length === job.events
              ? prev
              : [...prev, { stage: "progress", message: `${job.events} events · ${job.status}` }],
          );
          if (job.status !== "running") {
            setResult(job.result);
            break;
          }
        }
      } catch {
        /* keep polling */
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="mb-2 text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        Radar
      </h1>
      <p className="mb-6 text-[var(--color-ink-muted)]">
        Emerging patterns from the Trend Scout. Run on demand or review the watchlist.
      </p>

      {!apiUp && (
        <p className="mb-4 border border-[var(--color-rule)] p-3 text-sm text-[var(--color-ink-muted)]">
          API offline — start with <code>npm run server</code>. Scheduled digests still live under{" "}
          <code>content/scout/digests/</code>.
        </p>
      )}

      <div className="mb-8 flex flex-wrap items-end gap-3">
        <Button disabled={!apiUp} onClick={() => start("full")}>
          Scout now
        </Button>
        <div className="flex min-w-[16rem] flex-1 gap-2">
          <TextInput
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Scout a topic…"
          />
          <Button
            variant="secondary"
            disabled={!apiUp || !topic.trim()}
            onClick={() => start("topic")}
          >
            Scout topic
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-[var(--color-signal)]">{error}</p>}
      {jobId && (
        <p className="mb-2 text-xs text-[var(--color-ink-subtle)]" style={{ fontFamily: "var(--font-mono)" }}>
          Job {jobId}
        </p>
      )}
      {events.length > 0 && (
        <ul className="mb-6 space-y-1 border border-[var(--color-rule)] p-3 text-sm">
          {events.map((e, i) => (
            <li key={i} className="text-[var(--color-ink-muted)]">
              [{e.stage}] {e.message}
            </li>
          ))}
        </ul>
      )}
      {result != null && (
        <pre className="mb-8 overflow-x-auto border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      <section>
        <h2
          className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Watchlist
        </h2>
        {watchlist.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">No watchlist items yet.</p>
        ) : (
          <ul className="space-y-2">
            {watchlist.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between border border-[var(--color-rule)] px-3 py-2"
              >
                <span className="text-sm">{w.label}</span>
                <div className="flex items-center gap-2">
                  <Tag>score {(w.score ?? 0).toFixed(2)}</Tag>
                  <Tag>{w.weeks}w</Tag>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
