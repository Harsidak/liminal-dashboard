import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, TrendingDown, TrendingUp, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const performanceData = [
  { month: "Jan", value: 9800, benchmark: 9600 },
  { month: "Feb", value: 10200, benchmark: 9900 },
  { month: "Mar", value: 9600, benchmark: 9750 },
  { month: "Apr", value: 11000, benchmark: 10100 },
  { month: "May", value: 10700, benchmark: 10300 },
  { month: "Jun", value: 11400, benchmark: 10500 },
  { month: "Jul", value: 12450, benchmark: 10800 },
];

const lossData = [
  { month: "Jan", probability: 12, impact: 5 },
  { month: "Feb", probability: 18, impact: 8 },
  { month: "Mar", probability: 35, impact: 22 },
  { month: "Apr", probability: 8, impact: 3 },
  { month: "May", probability: 22, impact: 14 },
  { month: "Jun", probability: 28, impact: 18 },
  { month: "Jul", probability: 15, impact: 9 },
];

const explanations = [
  {
    title: "Tata Motors dipped 0.6%",
    desc: "Chip shortage fears resurfaced after a major supplier reported delays.",
    time: "2h ago",
    icon: TrendingDown,
    color: "text-red-400",
  },
  {
    title: "HDFC Bank rose 2.1%",
    desc: "Strong quarterly earnings beat analyst expectations by 12%.",
    time: "5h ago",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    title: "Reliance surged 1.8%",
    desc: "Jio announced expansion into 5G services across 50 new cities.",
    time: "1d ago",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
];

type ChartTooltipPayload = {
  color?: string;
  name?: NameType;
  value?: ValueType;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-xl border border-primary/20">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 100 ? `$${p.value.toLocaleString()}` : `${p.value}%`}
        </p>
      ))}
    </div>
  );
};

const PerformanceChart = () => (
  <div className="glass rounded-2xl p-4 sm:p-5 mt-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs text-muted-foreground">Portfolio Growth</p>
        <p className="text-lg sm:text-xl font-bold text-foreground">$12,450.89</p>
      </div>
      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
        +27.04%
      </span>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="glowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity={0.15} />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(270, 20%, 30%, 0.3)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "hsl(240, 5%, 65%)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(240, 5%, 65%)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="benchmark"
          stroke="hsla(240, 5%, 65%, 0.4)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="none"
          name="Benchmark"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          fill="url(#glowFill)"
          name="Portfolio"
          filter="url(#glow)"
          dot={false}
          activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const LossChart = () => (
  <div className="glass rounded-2xl p-4 sm:p-5 mt-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs text-muted-foreground">Loss Probability</p>
        <p className="text-lg sm:text-xl font-bold text-foreground">Risk Overview</p>
      </div>
      <Activity size={18} className="text-accent" />
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={lossData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lossFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0} />
          </linearGradient>
          <filter id="redGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(270, 20%, 30%, 0.3)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "hsl(240, 5%, 65%)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(240, 5%, 65%)", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="probability"
          stroke="hsl(0, 80%, 55%)"
          strokeWidth={2.5}
          name="Probability"
          filter="url(#redGlow)"
          dot={false}
          activeDot={{ r: 5, fill: "hsl(0, 80%, 55%)", stroke: "white", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="impact"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Impact"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(var(--accent))", stroke: "white", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const AIInsights = () => {
  const [risk, setRisk] = useState([50]);

  const riskLabel = risk[0] < 30 ? "Low Risk" : risk[0] < 70 ? "Moderate Risk" : "High Risk";
  const riskColor = risk[0] < 30 ? "text-emerald-400" : risk[0] < 70 ? "text-amber-400" : "text-red-400";

  return (
    <PageTransition>
    <AppShell>
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-9 w-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <BrainCircuit size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">AI Insights</h1>
            <p className="text-[11px] text-muted-foreground">Powered by machine learning</p>
          </div>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="w-full glass rounded-xl border-0 h-11 p-1">
            <TabsTrigger
              value="performance"
              className="flex-1 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-semibold transition-all duration-300"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="loss"
              className="flex-1 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-semibold transition-all duration-300"
            >
              Loss Probability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <PerformanceChart />
          </TabsContent>
          <TabsContent value="loss">
            <LossChart />
          </TabsContent>
        </Tabs>

        {/* Value at Risk Slider */}
        <div className="glass rounded-2xl p-4 sm:p-5 mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-foreground">Value at Risk</p>
            <span className="text-sm font-bold text-primary">{risk[0]}%</span>
          </div>
          <p className={`text-[11px] font-medium ${riskColor} mb-4`}>{riskLabel}</p>
          <div className="relative">
            <div
              className="absolute h-2 rounded-full top-[calc(50%-4px)] left-0 pointer-events-none transition-all duration-200"
              style={{
                width: `${risk[0]}%`,
                background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))`,
                boxShadow: "0 0 12px hsla(var(--primary) / 0.5)",
              }}
            />
            <Slider
              value={risk}
              onValueChange={setRisk}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-primary [&_[role=slider]]:to-accent [&_[role=slider]]:border-0 [&_[role=slider]]:glow-button [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:transition-transform [&_[role=slider]]:hover:scale-125"
            />
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="text-[10px] text-muted-foreground">Conservative</span>
            <span className="text-[10px] text-muted-foreground">Aggressive</span>
          </div>
        </div>

        {/* Recent AI Explanations */}
        <div className="mt-6 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Recent AI Explanations
          </h2>
          <div className="space-y-3">
            {explanations.map((e, i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 transition-all duration-300 hover:glass-strong hover:translate-x-1 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${e.color === "text-emerald-400" ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
                      <e.icon size={14} className={`${e.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {e.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap mt-0.5">
                    {e.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
    </PageTransition>
  );
};

export default AIInsights;
