import { NavLink, useLocation } from "react-router-dom";
import { Home, FlaskConical, BrainCircuit, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/sandbox", icon: FlaskConical, label: "Sandbox" },
  { to: "/ai-insights", icon: BrainCircuit, label: "AI Insights" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="glass-strong rounded-2xl px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-primary/15 glow-button" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.7} className="relative z-10" />
              <span className="text-[9px] font-medium relative z-10">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
