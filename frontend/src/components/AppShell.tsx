import { ReactNode } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Dock from "./Dock";
import {
  LayoutDashboard,
  Home,
  BarChart3,
  BrainCircuit,
  Upload,
  User,
} from "lucide-react";


const AppShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      onClick: () => navigate("/"),
      className: location.pathname === "/" ? "dock-active" : "",
    },
    {
      icon: <BarChart3 size={18} />,
      label: "Analytics",
      onClick: () => navigate("/analytics"),
      className: location.pathname === "/analytics" ? "dock-active" : "",
    },
    {
      icon: <BrainCircuit size={18} />,
      label: "AI Insights",
      onClick: () => navigate("/ai-insights"),
      className: location.pathname === "/ai-insights" ? "dock-active" : "",
    },
    {
      icon: <Upload size={18} />,
      label: "Upload",
      onClick: () => navigate("/upload"),
      className: location.pathname === "/upload" ? "dock-active" : "",
    },
    {
      icon: <User size={18} />,
      label: "Profile",
      onClick: () => navigate("/profile"),
      className: location.pathname === "/profile" ? "dock-active" : "",
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Content Layer */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <main className="min-h-screen pb-40">
          {children || <Outlet />}
        </main>
      </div>
      <div className="relative z-50">
        <Dock
          items={items}
          panelHeight={70}
          baseItemSize={50}
          magnification={100}
        />
      </div>
    </div>
  );
};

export default AppShell;
