import { useState } from "react";
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
    <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-rose-100/50">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} className="text-xs font-bold flex justify-between gap-4 mb-0.5" style={{ color: p.color === "hsl(var(--primary))" || p.color === "url(#lineGradient)" ? "#E11D48" : p.color }}>
          <span>{p.name}:</span>
          <span>{typeof p.value === "number" && p.value > 1000 ? `₹${p.value.toLocaleString()}` : `${p.value}${p.name === "Probability" || p.name === "Impact" ? "%" : ""}`}</span>
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
            <stop offset="0%" stopColor="#FB7185" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#FB7185" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
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
          strokeWidth={3}
          fill="url(#glowFill)"
          name="Portfolio"
          dot={false}
          activeDot={{ r: 6, fill: "#E11D48", stroke: "white", strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const LossChart = () => (
  <div className="bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-3xl p-6 shadow-xl shadow-rose-500/5">
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Loss Probability</p>
        <p className="text-xl font-bold text-slate-800 tracking-tight">Risk Overview</p>
      </div>
      <Activity size={20} className="text-rose-400" />
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={lossData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lossFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="probability"
          stroke="#F43F5E"
          strokeWidth={3}
          name="Probability"
          dot={false}
          activeDot={{ r: 6, fill: "#F43F5E", stroke: "white", strokeWidth: 3 }}
        />
        <Line
          type="monotone"
          dataKey="impact"
          stroke="#C4B5FD"
          strokeWidth={2}
          strokeDasharray="6 4"
          name="Impact"
          dot={false}
          activeDot={{ r: 5, fill: "#C4B5FD", stroke: "white", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const AIInsights = () => {
  const [risk, setRisk] = useState([50]);

  const riskLabel = risk[0] < 30 ? "Secure" : risk[0] < 70 ? "Moderate" : "Elevated";
  const riskColor = risk[0] < 30 ? "text-emerald-500" : risk[0] < 70 ? "text-amber-500" : "text-rose-500";

  return (
    <PageTransition>
      <div className="pt-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center shadow-inner">
            <BrainCircuit size={20} className="text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">AI Insights</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Predictive analytics and portfolio reasoning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="w-full bg-white/50 border border-rose-100 p-1.5 rounded-2xl shadow-sm h-14 mb-4">
                <TabsTrigger
                  value="performance"
                  className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-rose-500 data-[state=active]:text-white font-bold transition-all"
                >
                  Growth Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="loss"
                  className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-400 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold transition-all"
                >
                  Risk Engine
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="mt-0">
                <PerformanceChart />
              </TabsContent>
              <TabsContent value="loss" className="mt-0">
                <LossChart />
              </TabsContent>
            </Tabs>

            {/* Hidden on desktop, moved to sidebar */}
            <div className="lg:hidden space-y-6">
               <div className="bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-3xl p-6 shadow-xl shadow-rose-500/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-slate-700">Value at Risk</p>
                  <span className="text-sm font-extrabold text-rose-500">{risk[0]}%</span>
                </div>
                <p className={`text-[11px] font-bold ${riskColor} mb-6 tracking-wider uppercase`}>{riskLabel}</p>
                <div className="relative h-6 flex items-center pb-2">
                  <Slider
                    value={risk}
                    onValueChange={setRisk}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-rose-400 [&_[role=slider]]:to-rose-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-rose-300 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Value at Risk Sidebar (Desktop Only) */}
            <div className="hidden lg:block bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-3xl p-6 shadow-xl shadow-rose-500/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-base font-bold text-slate-800">Value at Risk</p>
                <span className="text-lg font-extrabold text-rose-500">{risk[0]}%</span>
              </div>
              <p className={`text-[11px] font-bold ${riskColor} mb-8 tracking-wider uppercase`}>{riskLabel}</p>
              <div className="mt-4 pb-2">
                <Slider
                  value={risk}
                  onValueChange={setRisk}
                  max={100}
                  step={1}
                  className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-rose-400 [&_[role=slider]]:to-rose-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-rose-300 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
                />
              </div>
              <div className="flex justify-between mt-6">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Safe</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Risky</span>
              </div>
            </div>

            {/* AI Explanations */}
            <div className="bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-3xl overflow-hidden shadow-xl shadow-rose-500/5">
              <div className="p-5 border-b border-rose-50">
                <h2 className="text-base font-bold text-slate-800">Market Intelligence</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Reasoning Core</p>
              </div>
              <div className="p-3 space-y-2">
                {explanations.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-rose-50/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-rose-100"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${e.color === "text-emerald-400" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      <e.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-rose-600 transition-colors">
                          {e.title}
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold tracking-wider shrink-0 ml-2">
                          {e.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {e.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AIInsights;
