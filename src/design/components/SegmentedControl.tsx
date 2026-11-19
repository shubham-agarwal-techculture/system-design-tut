interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex border border-[var(--color-rule)] bg-[var(--color-surface-sunken)] p-0.5"
      style={{ borderRadius: "var(--radius-md)" }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`min-h-9 px-3 text-sm transition-colors duration-150 ${
              active
                ? "bg-[var(--color-surface-raised)] text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
            style={{
              fontFamily: "var(--font-label)",
              borderRadius: "calc(var(--radius-md) - 2px)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
