import { globalResources } from "@/data";

export default function Resources() {
  const books = globalResources.filter((r) => r.type === "book");
  const blogs = globalResources.filter((r) => r.type === "blog");
  const oss = globalResources.filter((r) => r.type === "opensource");

  const Section = ({
    title,
    items,
  }: {
    title: string;
    items: typeof globalResources;
  }) => (
    <section className="mb-10">
      <h2
        className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {title}
      </h2>
      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.title}
            className="border border-[var(--color-rule)] bg-[var(--color-surface-raised)] px-4 py-3"
          >
            {r.url ? (
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-signal)]"
              >
                {r.title}
              </a>
            ) : (
              <span>{r.title}</span>
            )}
            {r.note && (
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{r.note}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        Resources
      </h1>
      <p className="mb-8 text-[var(--color-ink-muted)]">
        Books, engineering blogs, and open-source systems worth reading.
      </p>
      <Section title="Books" items={books} />
      <Section title="Engineering blogs" items={blogs} />
      <Section title="Open source" items={oss} />
    </div>
  );
}
