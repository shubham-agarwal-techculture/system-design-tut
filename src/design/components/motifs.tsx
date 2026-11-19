import { Link } from "react-router-dom";
import { useTheme } from "@/design/theme";
import type { Phase } from "@/types";

export function ProgressMark({ percent }: { percent: number }) {
  const { skin } = useTheme();
  const p = Math.max(0, Math.min(100, percent));

  if (skin === "instrument") {
    const angle = -90 + (p / 100) * 180;
    return (
      <svg width="48" height="28" viewBox="0 0 48 28" aria-hidden>
        <path
          d="M4 24 A20 20 0 0 1 44 24"
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="2"
        />
        <line
          x1="24"
          y1="24"
          x2={24 + Math.cos((angle * Math.PI) / 180) * 16}
          y2={24 + Math.sin((angle * Math.PI) / 180) * 16}
          stroke="var(--color-signal)"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (skin === "riso") {
    return (
      <div
        className="h-2 w-24 border border-[var(--color-rule)]"
        style={{
          backgroundImage: `radial-gradient(var(--color-signal) 1px, transparent 1px)`,
          backgroundSize: "4px 4px",
          backgroundColor: "var(--color-surface-sunken)",
          clipPath: `inset(0 ${100 - p}% 0 0)`,
        }}
        aria-label={`${p}%`}
      />
    );
  }

  if (skin === "transit") {
    return (
      <div className="flex items-center gap-1" aria-label={`${p}%`}>
        <div className="h-1 w-20 bg-[var(--color-rule)]">
          <div
            className="h-1 bg-[var(--color-signal)]"
            style={{ width: `${p}%` }}
          />
        </div>
        <span
          className="h-2.5 w-2.5 rounded-full border-2 border-[var(--color-signal)] bg-[var(--color-surface)]"
          style={{ marginLeft: `-6px` }}
        />
      </div>
    );
  }

  // drafting: scale bar
  return (
    <div className="w-28" aria-label={`${p}%`}>
      <div className="flex h-2 w-full overflow-hidden border border-[var(--color-rule)]">
        <div
          className="bg-[var(--color-signal)]"
          style={{ width: `${p}%` }}
        />
      </div>
      <div
        className="mt-0.5 flex justify-between text-[10px] text-[var(--color-ink-subtle)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>0</span>
        <span>{p}</span>
        <span>100</span>
      </div>
    </div>
  );
}

export function PhaseMarker({ number }: { number: number }) {
  const { skin } = useTheme();
  if (skin === "transit") {
    return (
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-signal)] text-sm font-semibold text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {number}
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center border border-[var(--color-rule)] bg-[var(--color-surface-raised)] text-sm text-[var(--color-ink)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {String(number).padStart(2, "0")}
    </span>
  );
}

export function FreshnessStamp({
  kind,
  lastReviewed,
}: {
  kind?: string;
  lastReviewed?: string;
}) {
  const living = kind === "living";
  return (
    <div
      className={`border px-2 py-1 text-xs ${
        living
          ? "border-[var(--color-signal)] text-[var(--color-signal)]"
          : "border-[var(--color-rule)] text-[var(--color-ink-muted)]"
      }`}
      style={{ fontFamily: "var(--font-label)" }}
    >
      {living ? "Living topic" : "Evergreen"}
      {lastReviewed ? ` · reviewed ${lastReviewed}` : ""}
    </div>
  );
}

export function SheetFrame({
  sheetId,
  revision,
  status,
  children,
}: {
  sheetId: string;
  revision?: string;
  status?: string;
  children: React.ReactNode;
}) {
  const { skin } = useTheme();
  if (skin !== "drafting") return <>{children}</>;
  return (
    <div className="border border-[var(--color-rule)] bg-[var(--color-surface-raised)]">
      <div
        className="flex flex-wrap items-center gap-3 border-b border-[var(--color-rule)] px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-muted)]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        <span>Sheet {sheetId}</span>
        <span>Rev {revision ?? "1.0.0"}</span>
        <span>{status ?? "published"}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function CurriculumMap({
  phases,
}: {
  phases: {
    phase: Phase;
    total: number;
    completed: number;
    percent: number;
  }[];
}) {
  const { skin } = useTheme();

  if (skin === "transit") {
    return (
      <div className="space-y-3">
        {phases.map(({ phase, percent, completed, total }) => (
          <Link
            key={phase.id}
            to={`/curriculum#phase-${phase.id}`}
            className="flex items-center gap-3"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: "var(--color-signal)" }}
            />
            <div className="h-px flex-1 bg-[var(--color-rule)]" />
            <span
              className="text-sm text-[var(--color-ink)]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {phase.title}
            </span>
            <span
              className="tabular-nums text-xs text-[var(--color-ink-muted)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {completed}/{total} · {percent}%
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {phases.map(({ phase, percent, completed, total }) => (
        <Link
          key={phase.id}
          to={`/curriculum#phase-${phase.id}`}
          className="flex items-center gap-3 border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-3 py-3 transition-colors hover:border-[var(--color-ink-muted)]"
        >
          <PhaseMarker number={phase.number} />
          <div className="min-w-0 flex-1">
            <div
              className="text-sm text-[var(--color-ink)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {phase.title}
            </div>
            <div className="text-xs text-[var(--color-ink-muted)]">
              {phase.subtitle}
            </div>
          </div>
          <ProgressMark percent={percent} />
          <span
            className="tabular-nums text-xs text-[var(--color-ink-subtle)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {completed}/{total}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="border-l-2 border-[var(--color-signal)] pl-4">
      <div
        className="mb-1 text-xs uppercase tracking-wider text-[var(--color-signal)]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {title}
      </div>
      <div className="text-sm text-[var(--color-ink-soft)]">{children}</div>
    </aside>
  );
}
