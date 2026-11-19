interface Props {
  label: string;
  value: string | number;
  suffix?: string;
}

export function Readout({ label, value, suffix }: Props) {
  return (
    <div className="flex items-baseline gap-2 border-r border-[var(--color-rule)] pr-4 last:border-0 last:pr-0">
      <span
        className="text-xs uppercase tracking-wider text-[var(--color-ink-subtle)]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {label}
      </span>
      <span
        className="text-lg tabular-nums text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
        {suffix ? (
          <span className="text-xs text-[var(--color-ink-muted)]"> {suffix}</span>
        ) : null}
      </span>
    </div>
  );
}
