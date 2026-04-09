import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const StressTestBanner = () => (
  <div className="mx-5 mt-6">
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-accent/10 blur-2xl animate-pulse-glow" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-accent" />
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">
            Stress Test
          </p>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          Simulate Market Crash
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          See how your portfolio holds under extreme conditions.
        </p>
        <Button className="glow-button rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm px-6 hover:opacity-90 transition-all duration-300">
          Run FDT
        </Button>
      </div>
    </div>
  </div>
);

export default StressTestBanner;
