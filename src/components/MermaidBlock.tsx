import { useEffect, useId, useState } from "react";

export function MermaidBlock({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict",
        });
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, chart);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Diagram render failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <pre className="overflow-x-auto border border-[var(--color-rule)] bg-[var(--color-surface-sunken)] p-3 text-xs text-[var(--color-ink-muted)]">
        {chart}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="border border-[var(--color-rule)] p-6 text-sm text-[var(--color-ink-muted)]">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
