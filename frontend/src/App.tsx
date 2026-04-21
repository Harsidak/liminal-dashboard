import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Chat from "./pages/Chat";
import AIInsights from "./pages/AIInsights";
import HerWealth from "./pages/HerWealth";
import Profile from "./pages/Profile";
import StockDetail from "./pages/StockDetail";
import NotFound from "./pages/NotFound";
import AppShell from "./components/AppShell";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/herwealth" element={<HerWealth />} />
          <Route path="/upload" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/watchlist" element={<Dashboard />} />
          <Route path="/analytics" element={<Navigate to="/portfolio" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="relative min-h-screen overflow-hidden" style={{
        background: "linear-gradient(135deg, #FEFBF6 0%, #FFF5F7 35%, #F8F4FF 70%, #F5F3FF 100%)",
      }}>
        {/* Ethereal Glow Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden text-primary/5">
          <div style={{
            position: "absolute", top: "-10%", right: "-5%",
            width: "700px", height: "700px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,113,133,0.08) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", left: "-10%",
            width: "600px", height: "600px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: "30%", left: "35%",
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(253,230,138,0.05) 0%, transparent 70%)",
          }} />
        </div>

        {/* Delicate Pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{
          backgroundImage: `radial-gradient(circle, #FDA4AF 0.5px, transparent 0.5px)`,
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10 h-full w-full">
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
