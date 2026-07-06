import { globalResources } from "@/data";
import type { GlobalResource } from "@/types";

const typeConfig: Record<
  GlobalResource["type"],
  { label: string; icon: string; color: string }
> = {
  book: { label: "Books", icon: "📖", color: "text-amber-900" },
  blog: { label: "Engineering Blogs", icon: "✍️", color: "text-slate-800" },
  opensource: { label: "Open Source", icon: "🔧", color: "text-emerald-900" },
};

export default function Resources() {
  const grouped = {
    book: globalResources.filter((r) => r.type === "book"),
    blog: globalResources.filter((r) => r.type === "blog"),
    opensource: globalResources.filter((r) => r.type === "opensource"),
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10 animate-fade-in">
      <header className="mb-10">
        <h1 className="heading-xl">Resources</h1>
        <p className="mt-2 max-w-xl text-muted">
          Curated books, engineering blogs, and open-source systems to study. Use these
          alongside the curriculum for deeper understanding.
        </p>
        <div className="divider-ornate mt-6" />
      </header>

      {(Object.entries(grouped) as [GlobalResource["type"], GlobalResource[]][]).map(
        ([type, items]) => {
          const config = typeConfig[type];
          return (
            <section key={type} className="mb-10">
              <h2 className={`heading-lg mb-4 font-serif ${config.color}`}>
                {config.icon} {config.label}
              </h2>
              <div className="space-y-3">
                {items.map((resource) => (
                  <div key={resource.title} className="card-lifted p-5">
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-burgundy)]"
                      >
                        {resource.title} ↗
                      </a>
                    ) : (
                      <div className="font-serif font-medium text-[var(--color-ink)]">
                        {resource.title}
                      </div>
                    )}
                    {resource.note && (
                      <p className="mt-1.5 text-sm text-muted">{resource.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        },
      )}

      <section className="card-callout p-6">
        <h2 className="heading-lg mb-2 text-[var(--color-burgundy)]">
          Recommended learning loop
        </h2>
        <ol className="space-y-2 text-sm text-[var(--color-ink-soft)]">
          <li>1. Learn one core concept from the curriculum</li>
          <li>2. Design a small system that requires it</li>
          <li>3. Implement a working version</li>
          <li>4. Load test to identify bottlenecks</li>
          <li>5. Add observability (metrics, logs, tracing)</li>
          <li>6. Improve based on measurements</li>
          <li>7. Read how large-scale systems solve the same problem</li>
        </ol>
      </section>
    </div>
  );
}
