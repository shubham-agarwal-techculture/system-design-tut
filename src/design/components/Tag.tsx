import type { ReactNode } from "react";

export function Tag({
  children,
  signal = false,
}: {
  children: ReactNode;
  signal?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-xs ${
        signal
          ? "border-[var(--color-signal)] text-[var(--color-signal)]"
          : "border-[var(--color-rule)] text-[var(--color-ink-muted)]"
      }`}
      style={{ fontFamily: "var(--font-label)", borderRadius: "var(--radius-sm)" }}
    >
      {children}
    </span>
  );
}
