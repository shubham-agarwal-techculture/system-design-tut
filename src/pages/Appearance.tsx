import {
  SKIN_COLORWAYS,
  useTheme,
  type Colorway,
  type Mode,
  type Skin,
} from "@/design/theme";
import { SegmentedControl } from "@/design/components/SegmentedControl";
import { loadAllFonts } from "@/design/fonts";
import { useEffect } from "react";

const skins: { value: Skin; label: string; blurb: string }[] = [
  { value: "drafting", label: "Drafting", blurb: "Engineering drawings, title blocks, revision clouds." },
  { value: "transit", label: "Transit", blurb: "Curriculum as lines and stations." },
  { value: "riso", label: "Riso", blurb: "Two-color print notebook." },
  { value: "instrument", label: "Instrument", blurb: "Lab instruments and telemetry." },
];

export default function Appearance() {
  const { skin, mode, colorway, switchSkin, setMode, setColorway } = useTheme();

  useEffect(() => {
    void loadAllFonts();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        Appearance
      </h1>
      <p className="mb-8 text-[var(--color-ink-muted)]">
        Choose a skin, mode, and colorway. Changes apply immediately and persist locally.
      </p>

      <section className="mb-10">
        <h2
          className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Skin
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {skins.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => switchSkin(s.value)}
              className={`border p-4 text-left transition-colors ${
                skin === s.value
                  ? "border-[var(--color-signal)] bg-[var(--color-accent-subtle)]"
                  : "border-[var(--color-rule)] hover:border-[var(--color-ink-muted)]"
              }`}
            >
              <div style={{ fontFamily: "var(--font-heading)" }} className="text-lg">
                {s.label}
              </div>
              <div className="mt-1 text-sm text-[var(--color-ink-muted)]">{s.blurb}</div>
              <div
                className="mt-3 flex h-8 overflow-hidden border border-[var(--color-rule)]"
                aria-hidden
              >
                <div className="flex-1 bg-[var(--color-surface)]" />
                <div className="flex-1 bg-[var(--color-surface-raised)]" />
                <div className="w-8 bg-[var(--color-signal)]" />
                <div className="flex-1 bg-[var(--color-ink)]" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Mode
        </h2>
        <SegmentedControl
          ariaLabel="Color mode"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
        />
      </section>

      <section>
        <h2
          className="mb-3 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Colorway
        </h2>
        <div className="flex flex-wrap gap-2">
          {SKIN_COLORWAYS[skin].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColorway(c as Colorway)}
              className={`border px-3 py-2 text-sm capitalize ${
                colorway === c
                  ? "border-[var(--color-signal)] text-[var(--color-signal)]"
                  : "border-[var(--color-rule)] text-[var(--color-ink-muted)]"
              }`}
              style={{ fontFamily: "var(--font-label)" }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
