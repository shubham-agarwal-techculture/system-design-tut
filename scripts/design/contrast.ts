/**
 * Minimal WCAG AA contrast check for skin semantic pairs.
 * Run: npm run design:contrast
 */
type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lin(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function lum([r, g, b]: RGB) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a: string, b: string) {
  const L1 = lum(hexToRgb(a));
  const L2 = lum(hexToRgb(b));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs: { skin: string; mode: string; fg: string; bg: string; min: number }[] = [
  { skin: "drafting", mode: "light", fg: "#23241F", bg: "#EDEAE2", min: 4.5 },
  { skin: "drafting", mode: "light", fg: "#FFFFFF", bg: "#D9431E", min: 3 },
  { skin: "drafting", mode: "dark", fg: "#E6E2D6", bg: "#14212B", min: 4.5 },
  { skin: "transit", mode: "light", fg: "#1B1B1B", bg: "#E9E6DF", min: 4.5 },
  { skin: "riso", mode: "light", fg: "#1A1A1A", bg: "#F3EFE6", min: 4.5 },
  { skin: "instrument", mode: "dark", fg: "#FFB000", bg: "#121412", min: 3 },
  { skin: "instrument", mode: "dark", fg: "#E6E6E6", bg: "#121412", min: 4.5 },
];

let failed = 0;
for (const p of pairs) {
  const r = ratio(p.fg, p.bg);
  const ok = r >= p.min;
  console.log(
    `${ok ? "✓" : "✗"} ${p.skin}/${p.mode} ${p.fg} on ${p.bg}: ${r.toFixed(2)} (need ${p.min})`,
  );
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`\n${failed} contrast check(s) failed`);
  process.exit(1);
}
console.log("\nContrast checks passed.");
