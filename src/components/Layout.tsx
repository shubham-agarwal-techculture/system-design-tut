import { NavLink, Outlet } from "react-router-dom";
import { useProgressContext } from "@/context/ProgressContext";
import { getProgressStats } from "@/utils/curriculum";

const navItems = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/session", label: "Study", icon: "✦" },
  { to: "/curriculum", label: "Curriculum", icon: "☰" },
  { to: "/challenges", label: "Design", icon: "◈" },
  { to: "/resources", label: "Resources", icon: "📚" },
];

export default function Layout() {
  const { progress } = useProgressContext();
  const stats = getProgressStats(progress.completedLessons);

  return (
    <div className="flex min-h-screen">
      <aside className="sidebar fixed inset-y-0 left-0 z-30 flex w-56 flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="sidebar-brand-icon flex h-9 w-9 items-center justify-center rounded-md text-sm">
            SD
          </div>
          <div>
            <div className="sidebar-title text-base font-semibold leading-tight">
              System Design
            </div>
            <div className="sidebar-subtitle text-xs italic">Journey</div>
          </div>
        </div>

        <div className="divider-ornate mx-4 mb-2" />

        <nav className="flex-1 space-y-0.5 px-3 pt-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 px-3 py-2.5 text-sm ${
                  isActive ? "nav-item-active" : ""
                }`
              }
            >
              <span className="w-5 text-center text-base opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-wood-light)]/40 p-4">
          <div className="sidebar-progress-card p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--color-ink-faint)]">
              <span className="font-serif italic">Scholarship</span>
              <span>{stats.percent}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill-gold"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
            {progress.streak > 0 && (
              <div className="mt-2 text-xs text-[var(--color-gold-light)]">
                ✦ {progress.streak} day streak
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content ml-56 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
