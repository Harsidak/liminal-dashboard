import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import { FlaskConical, Beaker, Shield, BarChart3 } from "lucide-react";

const features = [
  { icon: Beaker, label: "Custom Scenarios", desc: "Build your own market stress tests" },
  { icon: Shield, label: "Risk Shields", desc: "Auto-hedging strategy builder" },
  { icon: BarChart3, label: "Monte Carlo", desc: "Run 10,000+ portfolio simulations" },
];

const Sandbox = () => (
  <PageTransition>
  <AppShell>
    <div className="px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-16 w-16 rounded-2xl bg-accent/15 flex items-center justify-center mb-4 glow-button">
          <FlaskConical size={28} className="text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Risk Sandbox</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Build and test custom risk scenarios before they hit the market.
        </p>
      </div>
      <div className="space-y-3">
        {features.map((f) => (
          <div key={f.label} className="glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:glass-strong hover:translate-x-1 cursor-pointer group">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{f.label}</p>
              <p className="text-[11px] text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6 mt-6 text-center">
        <p className="text-xs text-muted-foreground">🚀 Coming Q3 2026</p>
      </div>
    </div>
  </AppShell>
  </PageTransition>
);

export default Sandbox;
