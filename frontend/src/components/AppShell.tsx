import { ReactNode } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Dock from "./Dock";
import Chatbot from "./Chatbot";
import {
  LayoutDashboard,
  Briefcase,
  BrainCircuit,
  MessageSquare,
  User,
} from "lucide-react";


const AppShell = ({ children }: { children?: ReactNode }) => {
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
      icon: <Briefcase size={18} />,
      label: "Portfolio",
      onClick: () => navigate("/portfolio"),
      className: location.pathname === "/portfolio" ? "dock-active" : "",
    },
    {
      icon: <BrainCircuit size={18} />,
      label: "AI Insights",
      onClick: () => navigate("/ai-insights"),
      className: location.pathname === "/ai-insights" ? "dock-active" : "",
    },
    {
      icon: <MessageSquare size={18} />,
      label: "Chat",
      onClick: () => navigate("/chat"),
      className: location.pathname === "/chat" ? "dock-active" : "",
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

      {/* Dock — fixed at viewport bottom via CSS */}
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
