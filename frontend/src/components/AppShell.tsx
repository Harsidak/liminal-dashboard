import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Dock from "./Dock";
import {
  LayoutDashboard,
  PieChart,
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
      isActive: location.pathname === "/",
    },
    {
      icon: <PieChart size={18} />,
      label: "Portfolio",
      onClick: () => navigate("/portfolio"),
      isActive: location.pathname === "/portfolio",
    },
    {
      icon: <BarChart3 size={18} />,
      label: "Analytics",
      onClick: () => navigate("/analytics"),
      isActive: location.pathname === "/analytics",
    },
    {
      icon: <BrainCircuit size={18} />,
      label: "XAI",
      onClick: () => navigate("/ai-insights"),
      isActive: location.pathname === "/ai-insights",
    },
    {
      icon: <Upload size={18} />,
      label: "Upload",
      onClick: () => navigate("/upload"),
      isActive: location.pathname === "/upload",
    },
    {
      icon: <User size={18} />,
      label: "Profile",
      onClick: () => navigate("/profile"),
      isActive: location.pathname === "/profile",
    },
  ];

  return (
    <div className="gradient-bg min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <main className="relative min-h-[calc(100vh-8rem)] pb-32 lg:pb-12">
          {children}
        </main>
      </div>
      <Dock
        items={items}
        panelHeight={70}
        baseItemSize={50}
        magnification={100}
      />
    </div>
  );
};

export default AppShell;
