import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniSearch from "minisearch";
import { searchDocs } from "@/data";
import { TextInput } from "./Field";

const actions = [
  { id: "nav-home", title: "Go home", path: "/" },
  { id: "nav-curriculum", title: "Open curriculum", path: "/curriculum" },
  { id: "nav-session", title: "Start a study session", path: "/session" },
  { id: "nav-challenges", title: "Design challenges", path: "/challenges" },
  { id: "nav-explore", title: "Explore / search", path: "/explore" },
  { id: "nav-radar", title: "Trend radar", path: "/radar" },
  { id: "nav-whats-new", title: "What's new", path: "/whats-new" },
  { id: "nav-design", title: "Design system", path: "/design" },
  { id: "nav-appearance", title: "Appearance", path: "/appearance" },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const search = useMemo(() => {
    const ms = new MiniSearch({
      fields: ["title", "summary", "tags", "concepts"],
      storeFields: ["title", "id"],
      searchOptions: { fuzzy: 0.2, prefix: true },
    });
    ms.addAll(searchDocs as { id: string; title: string }[]);
    return ms;
  }, []);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else document.dispatchEvent(new CustomEvent("sdg:open-command"));
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const lessonHits =
    q.trim().length > 0
      ? (search.search(q).slice(0, 8) as unknown as { id: string; title: string }[])
      : [];
  const actionHits = actions.filter((a) =>
    a.title.toLowerCase().includes(q.toLowerCase()),
  );

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--color-ink)]/40"
        aria-label="Close command palette"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xl border border-[var(--color-rule)] bg-[var(--color-surface)] shadow-[var(--shadow-lifted)]"
        role="dialog"
        aria-label="Command palette"
      >
        <div className="border-b border-[var(--color-rule)] p-3">
          <TextInput
            autoFocus
            placeholder="Search lessons and actions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Command search"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {actionHits.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
                onClick={() => go(a.path)}
              >
                {a.title}
              </button>
            </li>
          ))}
          {lessonHits.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
                onClick={() => go(`/lesson/${l.id}`)}
              >
                <span className="text-[var(--color-ink-muted)]">Lesson · </span>
                {l.title}
              </button>
            </li>
          ))}
          {actionHits.length === 0 && lessonHits.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-[var(--color-ink-muted)]">
              No matches
            </li>
          )}
        </ul>
        <div
          className="border-t border-[var(--color-rule)] px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-subtle)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Ctrl/Cmd+K · Esc to close
        </div>
      </div>
    </div>
  );
}
