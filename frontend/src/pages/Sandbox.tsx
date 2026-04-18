import PageTransition from "@/components/PageTransition";
import { FlaskConical, Beaker, Shield, BarChart3 } from "lucide-react";

const features = [
  { icon: Beaker, label: "Custom Scenarios", desc: "Build your own market stress tests" },
  { icon: Shield, label: "Risk Shields", desc: "Auto-hedging strategy builder" },
  { icon: BarChart3, label: "Monte Carlo", desc: "Run 10,000+ portfolio simulations" },
];

const Sandbox = () => (
  <PageTransition>
    <div className="pt-6">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="h-20 w-20 rounded-2xl bg-accent/15 flex items-center justify-center mb-6 glow-button">
          <FlaskConical size={32} className="text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Risk Sandbox</h1>
        <p className="text-base text-muted-foreground max-w-md">
          Simulate market volatility, build automated hedging strategies, and run deep-risk Monte Carlo simulations in a safe environment.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.label} className="glass rounded-2xl p-6 flex flex-col items-start gap-4 transition-all duration-300 hover:glass-strong hover:-translate-y-1 cursor-pointer group">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">{f.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-strong rounded-2xl p-8 mt-12 text-center border-dashed border-primary/20 bg-primary/5">
        <p className="text-sm font-semibold text-primary/80 uppercase tracking-widest animate-pulse">
          🚀 Simulation Engine Coming Q3 2026
        </p>
      </div>
    </div>
  </PageTransition>
);

export default Sandbox;
