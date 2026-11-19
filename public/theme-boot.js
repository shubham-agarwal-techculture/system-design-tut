/**
 * theme-boot.js — Inline before-paint theme initialiser
 *
 * Reads localStorage and sets data-skin / data-mode / data-colorway on <html>
 * before the first paint so there is no flash of unstyled / wrong-theme content.
 *
 * Include in index.html as:
 *   <script src="/theme-boot.js"></script>
 * placed as the LAST element inside <head> (after meta/title/link tags).
 *
 * This file must remain vanilla JS with no imports — it is loaded synchronously.
 */
(function () {
  var LS_SKIN     = "sdg-skin";
  var LS_MODE     = "sdg-mode";
  var LS_COLORWAY = "sdg-colorway";

  var VALID_SKINS     = ["drafting", "transit", "riso", "instrument"];
  var VALID_MODES     = ["light", "dark", "system"];
  var VALID_COLORWAYS = [
    // drafting
    "vermilion", "verdigris", "cobalt",
    // transit
    "ochre", "teal", "oxblood", "ultramarine",
    // riso
    "pink", "yellow", "blue",
    // instrument
    "amber", "green", "cyan",
  ];

  function safe(key, valid, fallback) {
    try {
      var val = localStorage.getItem(key);
      return val && valid.indexOf(val) !== -1 ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  var skin     = safe(LS_SKIN,     VALID_SKINS,     "drafting");
  var mode     = safe(LS_MODE,     VALID_MODES,     "system");
  var colorway = safe(LS_COLORWAY, VALID_COLORWAYS, "vermilion");

  // Resolve "system" to actual OS preference
  var resolvedMode = mode;
  if (mode === "system") {
    try {
      resolvedMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      resolvedMode = "light";
    }
  }

  var root = document.documentElement;
  root.setAttribute("data-skin",     skin);
  root.setAttribute("data-mode",     resolvedMode);
  root.setAttribute("data-colorway", colorway);
})();
