import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getProgressStats } from "@/utils/curriculum";
import { CommandPalette } from "@/design/components/CommandPalette";
import { ProgressMark } from "@/design/components/motifs";
import {
  IconBook,
  IconChallenge,
  IconClock,
  IconGrid,
  IconHome,
  IconRadar,
  IconSearch,
  IconSettings,
  IconSpark,
} from "@/design/icons";
import { loadFontsForSkin } from "@/design/fonts";
import { useTheme } from "@/design/theme";

const navItems = [
  { to: "/", label: "Home", icon: IconHome, end: true },
  { to: "/session", label: "Study", icon: IconClock },
  { to: "/curriculum", label: "Curriculum", icon: IconGrid },
  { to: "/challenges", label: "Design", icon: IconChallenge },
  { to: "/explore", label: "Explore", icon: IconSearch },
  { to: "/radar", label: "Radar", icon: IconRadar },
  { to: "/whats-new", label: "Updates", icon: IconSpark },
  { to: "/resources", label: "Resources", icon: IconBook },
  { to: "/appearance", label: "Appearance", icon: IconSettings },
];

export default function Layout() {
  const { progress } = useProgressContext();
  const stats = getProgressStats(progress.completedLessons);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { skin } = useTheme();

  useEffect(() => {
    loadFontsForSkin(skin);
  }, [skin]);

  useEffect(() => {
    const open = () => setCmdOpen(true);
    document.addEventListener("sdg:open-command", open);
    return () => document.removeEventListener("sdg:open-command", open);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-[var(--color-rule)] bg-[var(--color-surface-raised)]">
        <div className="border-b border-[var(--color-rule)] px-4 py-4">
          <div
            className="text-xs uppercase tracking-[0.14em] text-[var(--color-signal)]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            SDG
          </div>
          <div
            className="text-lg leading-tight text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            System Design
          </div>
          <div className="text-xs text-[var(--color-ink-muted)]">Guide</div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-3 px-3 text-sm transition-colors ${
                  isActive
                    ? "border-l-2 border-[var(--color-signal)] bg-[var(--color-accent-subtle)] text-[var(--color-ink)]"
                    : "border-l-2 border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`
              }
            >
              <item.icon size={18} />
              <span style={{ fontFamily: "var(--font-label)" }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-rule)] p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
            <span style={{ fontFamily: "var(--font-label)" }}>Progress</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{stats.percent}%</span>
          </div>
          <ProgressMark percent={stats.percent} />
          <button
            type="button"
            className="mt-3 w-full border border-[var(--color-rule)] px-2 py-1.5 text-left text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-ink-muted)]"
            onClick={() => setCmdOpen(true)}
            style={{ fontFamily: "var(--font-label)" }}
          >
            Search · Ctrl/Cmd+K
          </button>
        </div>
      </aside>

      <main className="ml-52 min-h-screen flex-1">
        <Outlet />
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
