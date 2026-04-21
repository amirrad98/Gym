import type { ViewKey } from "../lib/types";

type NavItem = {
  key: ViewKey;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "◐" },
  { key: "workouts", label: "Workouts", icon: "▲" },
  { key: "checkins", label: "Check-ins", icon: "◆" },
  { key: "exercises", label: "Exercises", icon: "≡" },
  { key: "measurements", label: "Measurements", icon: "◎" },
  { key: "goals", label: "Goals", icon: "★" },
  { key: "programs", label: "Programs", icon: "❏" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

type SidebarProps = {
  activeView: ViewKey;
  onSelect: (view: ViewKey) => void;
  mode: "convex" | "browser";
};

export function Sidebar({ activeView, onSelect, mode }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">GYM</span>
        <span className="sidebar-brand-name">Training log</span>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`sidebar-link${activeView === item.key ? " is-active" : ""}`}
              onClick={() => onSelect(item.key)}
            >
              <span className="sidebar-icon" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-mode">
        <span className={`mode-dot mode-${mode}`} />
        <div>
          <strong>{mode === "convex" ? "Live sync" : "Local only"}</strong>
          <p>
            {mode === "convex"
              ? "Changes write to your Convex backend."
              : "Data stays in this browser."}
          </p>
        </div>
      </div>
    </nav>
  );
}
