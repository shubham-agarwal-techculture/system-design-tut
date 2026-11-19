import type { ReactNode } from "react";
import { Button } from "./Button";

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-[var(--color-ink)]/30"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--color-rule)] bg-[var(--color-surface)] shadow-[var(--shadow-lifted)]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-rule)] px-4 py-3">
          <h2
            className="text-sm uppercase tracking-wider text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            Close
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}
