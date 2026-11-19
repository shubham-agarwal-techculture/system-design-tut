import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-signal)] text-[var(--color-accent-fg)] hover:bg-[var(--color-signal-hover)] border border-transparent",
  secondary:
    "bg-[var(--color-surface-raised)] text-[var(--color-ink)] border border-[var(--color-rule)] hover:border-[var(--color-ink-muted)]",
  ghost:
    "bg-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)] border border-transparent",
  danger:
    "bg-transparent text-[var(--color-signal)] border border-[var(--color-signal)] hover:bg-[var(--color-accent-subtle)]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-[background,border-color,color] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)] disabled:opacity-50 ${styles[variant]} ${className}`}
      style={{ fontFamily: "var(--font-label)", borderRadius: "var(--radius-md)" }}
      {...rest}
    >
      {children}
    </button>
  );
}
