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
import Sandbox from "./pages/Sandbox";
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
          <Route path="/upload" element={<Navigate to="/profile" replace />} />
          <Route path="/sandbox" element={<Sandbox />} />
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
        background: "linear-gradient(135deg, #FDF6F0 0%, #FEF0F5 35%, #F5EEFE 70%, #EFF6FE 100%)",
      }}>
        {/* Soft decorative orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div style={{
            position: "absolute", top: "-10%", right: "-5%",
            width: "600px", height: "600px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,182,193,0.18) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", left: "-10%",
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,168,255,0.15) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: "40%", left: "40%",
            width: "400px", height: "400px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,218,230,0.12) 0%, transparent 70%)",
          }} />
        </div>

        {/* Subtle dot pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, rgba(219,112,147,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
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
