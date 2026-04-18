import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

// Pages
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

/** Simple auth guard — checks for JWT token in localStorage */
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
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes Wrap */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/upload" element={<Navigate to="/profile" replace />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="/profile" element={<Profile />} />
          {/* Legacy redirect */}
          <Route path="/analytics" element={<Navigate to="/portfolio" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

import PixelBlast from "./components/PixelBlast";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#0B0914]">
        {/* Global Background Layer */}
        <div className="fixed inset-0 z-0">
          <PixelBlast
    variant="square"
    pixelSize={4}
    color="#B497CF"
    patternScale={4.5}
    patternDensity={1.25}
    pixelSizeJitter={0}
    enableRipples
    rippleSpeed={0.4}
    rippleThickness={0.12}
    rippleIntensityScale={1.5}
    liquid={false}
    liquidStrength={0.12}
    liquidRadius={1.2}
    liquidWobbleSpeed={5}
    speed={0.65}
    edgeFade={0.26}
    transparent
          />
        </div>

        {/* Global Content Layer */}
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
