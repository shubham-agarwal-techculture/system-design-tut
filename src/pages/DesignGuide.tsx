import { Button } from "@/design/components/Button";
import { SegmentedControl } from "@/design/components/SegmentedControl";
import { Readout } from "@/design/components/Readout";
import { Tag } from "@/design/components/Tag";
import { Callout, FreshnessStamp, ProgressMark } from "@/design/components/motifs";
import { useState } from "react";

export default function DesignGuide() {
  const [seg, setSeg] = useState("core");
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-8 py-10">
      <header>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
          Design system
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Living style guide for tokens, type, and primitives. Switch skins in Appearance to
          verify each theme.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-label)" }}>
          Type
        </h2>
        <p className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
          Heading / Display
        </p>
        <p className="text-base" style={{ fontFamily: "var(--font-body)" }}>
          Body text for lessons — measured for a 64–72 character measure.
        </p>
        <p className="text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          Mono 0123456789 tabular
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-label)" }}>
          Colors
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            "surface",
            "surface-raised",
            "ink",
            "ink-muted",
            "rule",
            "signal",
            "accent-subtle",
          ].map((name) => (
            <div key={name}>
              <div
                className="h-12 border border-[var(--color-rule)]"
                style={{ background: `var(--color-${name})` }}
              />
              <div className="mt-1 text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
                {name}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-label)" }}>
          Components
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <SegmentedControl
          options={[
            { value: "core", label: "Core" },
            { value: "deepDive", label: "Deep dive" },
            { value: "expert", label: "Expert" },
          ]}
          value={seg}
          onChange={setSeg}
        />
        <div className="flex gap-4 border border-[var(--color-rule)] p-3">
          <Readout label="Lessons" value={42} suffix="/ 116" />
          <Readout label="Streak" value={3} suffix="days" />
        </div>
        <div className="flex gap-2">
          <Tag>Evergreen</Tag>
          <Tag signal>Living</Tag>
        </div>
        <ProgressMark percent={64} />
        <FreshnessStamp kind="living" lastReviewed="2026-03-26" />
        <Callout title="Callout">Structure carries meaning; decoration does not.</Callout>
      </section>
    </div>
  );
}
