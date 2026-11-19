/**
 * Design System — Theme types, context, and helpers
 *
 * Skins control the overall visual language (palette + fonts).
 * Mode controls light / dark. Colorway selects the accent color.
 * All three are stored as data-attributes on <html> and persisted to localStorage.
 */
import { createContext, useContext, useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Skin =
  | "drafting"   // technical drawing / blueprinting
  | "transit"    // public-transit map / wayfinding
  | "riso"       // risograph print / zine
  | "instrument"; // electronics / oscilloscope / lab

export type Mode = "light" | "dark" | "system";

/** Per-skin colorway options */
export type DraftingColorway = "vermilion" | "verdigris" | "cobalt";
export type TransitColorway  = "ochre" | "teal" | "oxblood" | "ultramarine";
export type RisoColorway     = "pink" | "teal" | "yellow" | "blue";
export type InstrumentColorway = "amber" | "green" | "cyan";

/** Union of all colorway strings across all skins */
export type Colorway =
  | DraftingColorway
  | TransitColorway
  | RisoColorway
  | InstrumentColorway;

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_SKIN: Skin      = "drafting";
export const DEFAULT_MODE: Mode      = "system";
export const DEFAULT_COLORWAY: Colorway = "vermilion";

export const SKIN_DEFAULT_COLORWAYS: Record<Skin, Colorway> = {
  drafting:   "vermilion",
  transit:    "ochre",
  riso:       "pink",
  instrument: "amber",
};

export const SKIN_COLORWAYS: Record<Skin, Colorway[]> = {
  drafting:   ["vermilion", "verdigris", "cobalt"],
  transit:    ["ochre", "teal", "oxblood", "ultramarine"],
  riso:       ["pink", "teal", "yellow", "blue"],
  instrument: ["amber", "green", "cyan"],
};

// ─── localStorage keys ───────────────────────────────────────────────────────

const LS_SKIN     = "sdg-skin";
const LS_MODE     = "sdg-mode";
const LS_COLORWAY = "sdg-colorway";

// ─── applyTheme ──────────────────────────────────────────────────────────────

/**
 * Sets data-skin, data-mode, data-colorway on <html> and persists to localStorage.
 * Pass resolved = true when you have already resolved "system" to "light"/"dark".
 */
export function applyTheme(
  skin: Skin,
  mode: Mode,
  colorway: Colorway,
  persist = true,
): void {
  const root = document.documentElement;

  root.setAttribute("data-skin", skin);
  root.setAttribute("data-colorway", colorway);

  // Resolve "system" to the actual OS preference
  const resolvedMode: "light" | "dark" =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;

  root.setAttribute("data-mode", resolvedMode);

  if (persist) {
    try {
      localStorage.setItem(LS_SKIN, skin);
      localStorage.setItem(LS_MODE, mode); // store intent, not resolved
      localStorage.setItem(LS_COLORWAY, colorway);
    } catch {
      // localStorage blocked (private mode, storage full, etc.)
    }
  }
}

// ─── Read persisted theme ─────────────────────────────────────────────────────

function readPersistedTheme(): {
  skin: Skin;
  mode: Mode;
  colorway: Colorway;
} {
  try {
    const skin     = (localStorage.getItem(LS_SKIN)     as Skin)     || DEFAULT_SKIN;
    const mode     = (localStorage.getItem(LS_MODE)     as Mode)     || DEFAULT_MODE;
    const colorway = (localStorage.getItem(LS_COLORWAY) as Colorway) || DEFAULT_COLORWAY;
    return { skin, mode, colorway };
  } catch {
    return { skin: DEFAULT_SKIN, mode: DEFAULT_MODE, colorway: DEFAULT_COLORWAY };
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface ThemeContextValue {
  skin: Skin;
  mode: Mode;
  colorway: Colorway;
  setSkin:     (skin: Skin) => void;
  setMode:     (mode: Mode) => void;
  setColorway: (colorway: Colorway) => void;
  /** Convenience: switch to a skin, resetting colorway to its default */
  switchSkin:  (skin: Skin) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── ThemeProvider ────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initial = readPersistedTheme();

  const [skin,     setSkinState]     = useState<Skin>(initial.skin);
  const [mode,     setModeState]     = useState<Mode>(initial.mode);
  const [colorway, setColorwayState] = useState<Colorway>(initial.colorway);

  // Apply theme on mount and whenever values change
  useEffect(() => {
    applyTheme(skin, mode, colorway);
  }, [skin, mode, colorway]);

  // Re-resolve "system" mode when OS preference changes
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(skin, "system", colorway, false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [skin, mode, colorway]);

  const setSkin = (next: Skin) => {
    setSkinState(next);
    // Don't auto-reset colorway here; keep user's last choice if compatible
  };

  const setMode = (next: Mode) => setModeState(next);

  const setColorway = (next: Colorway) => setColorwayState(next);

  const switchSkin = (next: Skin) => {
    setSkinState(next);
    setColorwayState(SKIN_DEFAULT_COLORWAYS[next]);
  };

  return (
    <ThemeContext.Provider
      value={{ skin, mode, colorway, setSkin, setMode, setColorway, switchSkin }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() must be used inside <ThemeProvider>");
  }
  return ctx;
}
