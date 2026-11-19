/**
 * Design System — Font loading per skin
 *
 * Dynamically imports @fontsource packages when available.
 * Falls back to CSS generic stacks if a package is missing.
 *
 * Call loadFontsForSkin(skin) once after the skin is determined.
 * It's safe to call multiple times — imports are cached by the module system.
 */
import type { Skin } from "./theme";

// ─── Font weight sets per package ────────────────────────────────────────────

/**
 * Load @fontsource/barlow-semi-condensed
 * Used by: drafting, transit
 */
async function loadBarlowSemiCondensed(): Promise<void> {
  // @fontsource/barlow-semi-condensed
  await Promise.allSettled([
    import("@fontsource/barlow-semi-condensed/400.css"),
    import("@fontsource/barlow-semi-condensed/500.css"),
    import("@fontsource/barlow-semi-condensed/600.css"),
    import("@fontsource/barlow-semi-condensed/700.css"),
  ]);
}

/**
 * Load @fontsource/source-serif-4
 * Used by: drafting
 */
async function loadSourceSerif4(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/source-serif-4/400.css"),
    import("@fontsource/source-serif-4/400-italic.css"),
    import("@fontsource/source-serif-4/600.css"),
    import("@fontsource/source-serif-4/700.css"),
  ]);
}

/**
 * Load @fontsource/ibm-plex-mono
 * Used by: all skins (mono / code)
 */
async function loadIBMPlexMono(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/ibm-plex-mono/400.css"),
    import("@fontsource/ibm-plex-mono/400-italic.css"),
    import("@fontsource/ibm-plex-mono/500.css"),
  ]);
}

/**
 * Load @fontsource/overpass
 * Used by: transit
 */
async function loadOverpass(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/overpass/400.css"),
    import("@fontsource/overpass/400-italic.css"),
    import("@fontsource/overpass/600.css"),
    import("@fontsource/overpass/700.css"),
  ]);
}

/**
 * Load @fontsource/bricolage-grotesque
 * Used by: riso (heading)
 */
async function loadBricolageGrotesque(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/bricolage-grotesque/400.css"),
    import("@fontsource/bricolage-grotesque/600.css"),
    import("@fontsource/bricolage-grotesque/800.css"),
  ]);
}

/**
 * Load @fontsource/literata
 * Used by: riso (body)
 */
async function loadLiterata(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/literata/400.css"),
    import("@fontsource/literata/400-italic.css"),
    import("@fontsource/literata/600.css"),
    import("@fontsource/literata/700.css"),
  ]);
}

/**
 * Load @fontsource/space-mono
 * Used by: riso (mono)
 */
async function loadSpaceMono(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/space-mono/400.css"),
    import("@fontsource/space-mono/400-italic.css"),
    import("@fontsource/space-mono/700.css"),
  ]);
}

/**
 * Load @fontsource/ibm-plex-sans
 * Used by: instrument (heading + body)
 */
async function loadIBMPlexSans(): Promise<void> {
  await Promise.allSettled([
    import("@fontsource/ibm-plex-sans/400.css"),
    import("@fontsource/ibm-plex-sans/400-italic.css"),
    import("@fontsource/ibm-plex-sans/500.css"),
    import("@fontsource/ibm-plex-sans/600.css"),
    import("@fontsource/ibm-plex-sans/700.css"),
  ]);
}

/*
 * NOTE: Martian Mono is not available as a @fontsource package.
 * We fall back to IBM Plex Mono via the CSS font stack:
 *   "Martian Mono", "IBM Plex Mono", "Courier New", ui-monospace, monospace
 * If you self-host Martian Mono, add the @font-face rules to tokens.css.
 */

// ─── Track which skins have been loaded ──────────────────────────────────────

const loaded = new Set<Skin>();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Dynamically loads the font files required for a given skin.
 * Uses Promise.allSettled so a missing package never throws.
 * Returns a promise that resolves when loading is complete (or settled).
 */
export async function loadFontsForSkin(skin: Skin): Promise<void> {
  if (loaded.has(skin)) return; // already loaded
  loaded.add(skin);

  // IBM Plex Mono is shared across all skins
  const monoLoad = loadIBMPlexMono();

  switch (skin) {
    case "drafting":
      await Promise.allSettled([monoLoad, loadBarlowSemiCondensed(), loadSourceSerif4()]);
      break;

    case "transit":
      await Promise.allSettled([monoLoad, loadOverpass()]);
      break;

    case "riso":
      await Promise.allSettled([monoLoad, loadBricolageGrotesque(), loadLiterata(), loadSpaceMono()]);
      break;

    case "instrument":
      await Promise.allSettled([monoLoad, loadIBMPlexSans()]);
      break;

    default:
      await monoLoad;
  }
}

/**
 * Eagerly load fonts for all skins (useful for font-preview UIs).
 */
export async function loadAllFonts(): Promise<void> {
  await Promise.allSettled([
    loadBarlowSemiCondensed(),
    loadSourceSerif4(),
    loadIBMPlexMono(),
    loadOverpass(),
    loadBricolageGrotesque(),
    loadLiterata(),
    loadSpaceMono(),
    loadIBMPlexSans(),
  ]);
}
