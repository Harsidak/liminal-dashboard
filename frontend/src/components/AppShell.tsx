import { ReactNode } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Briefcase, BrainCircuit, MessageSquare, User, Sparkles, FlaskConical } from "lucide-react";

const AppShell = ({ children }: { children?: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: <LayoutDashboard size={19} />, label: "Dashboard", path: "/" },
    { icon: <Briefcase size={19} />,       label: "Portfolio",  path: "/portfolio" },
    { icon: <BrainCircuit size={19} />,    label: "AI Insights",path: "/ai-insights" },
    { icon: <Sparkles size={19} />,        label: "HerWealth",  path: "/herwealth" },
    // { icon: <FlaskConical size={19} />,    label: "Sandbox",    path: "/sandbox" },
    { icon: <MessageSquare size={19} />,   label: "Chat",       path: "/chat" },
    { icon: <User size={19} />,            label: "Profile",    path: "/profile" },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Top header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: "64px",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(251,113,133,0.1)",
        display: "flex", alignItems: "center",
        padding: "0 24px",
        boxShadow: "0 2px 20px rgba(244,63,94,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #FDA4AF, #C4B5FD)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(253,164,175,0.3)",
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.15rem",
            background: "linear-gradient(135deg, #E11D48, #8B5CF6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Liminal AI</span>
        </div>
        <span style={{
          marginLeft: "16px", fontSize: "0.75rem", color: "#9CA3AF",
          fontFamily: "'Outfit', sans-serif",
          borderLeft: "1px solid rgba(251,113,133,0.2)", paddingLeft: "16px",
        }}>
          Invest with grace ✨
        </span>
      </header>

      {/* Page content */}
      <div style={{ paddingTop: "64px", paddingBottom: "100px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>
          <main>{children || <Outlet />}</main>
        </div>
      </div>

      {/* Bottom pill dock */}
      <nav style={{
        position: "fixed", bottom: "24px", left: "50%",
        transform: "translateX(-50%)", zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px)",
        borderRadius: "28px",
        border: "1.5px solid rgba(251,113,133,0.15)",
        boxShadow: "0 8px 40px rgba(244,63,94,0.1), 0 2px 8px rgba(251,113,133,0.05)",
        display: "flex", alignItems: "center",
        padding: "8px 12px", gap: "4px",
      }}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} title={item.label} style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", padding: "10px 18px", borderRadius: "20px",
              border: "none", cursor: "pointer", transition: "all 0.2s ease",
              background: active
                ? "linear-gradient(135deg, rgba(253,164,175,0.15), rgba(196,181,253,0.15))"
                : "transparent",
              minWidth: "60px",
            }}>
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "32px", height: "32px", borderRadius: "12px", transition: "all 0.2",
                background: active ? "linear-gradient(135deg, #FDA4AF, #C4B5FD)" : "transparent",
                color: active ? "white" : "#6B7280",
                boxShadow: active ? "0 4px 14px rgba(253,164,175,0.3)" : "none",
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: "0.6rem", fontWeight: active ? 700 : 500,
                fontFamily: "'Outfit', sans-serif",
                color: active ? "#E11D48" : "#9CA3AF",
                letterSpacing: "0.02em",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;
