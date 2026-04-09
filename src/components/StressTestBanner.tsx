import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const StressTestBanner = () => (
  <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
    <div className="glass rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:glass-strong transition-all duration-500 cursor-pointer">
      {/* Animated background orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent/15 blur-2xl animate-pulse-glow" />
      <div className="absolute -bottom-8 left-1/3 w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Zap size={14} className="text-accent" />
            </div>
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">
              Stress Test
            </p>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
            Simulate Market Crash
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mb-4 max-w-[240px]">
            See how your portfolio holds under extreme conditions.
          </p>
          <Button className="glow-button rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm px-5 hover:opacity-90 transition-all duration-300 group-hover:translate-x-1 gap-2">
            Run FDT
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center">
          <Zap size={32} className="text-accent/60" />
        </div>
      </div>
    </div>
  </div>
);

export default StressTestBanner;
