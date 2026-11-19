import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span
        className="text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClass =
  "w-full border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:border-[var(--color-signal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-subtle)]";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${fieldClass} ${props.className ?? ""}`}
      style={{ borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)" }}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClass} ${props.className ?? ""}`}
      style={{ borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)" }}
    />
  );
}
