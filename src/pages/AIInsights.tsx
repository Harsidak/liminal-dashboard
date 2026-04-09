import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, TrendingDown } from "lucide-react";

const barData = [
  { label: "Jan", value: 60 },
  { label: "Feb", value: 80 },
  { label: "Mar", value: 45 },
  { label: "Apr", value: 90 },
  { label: "May", value: 70 },
  { label: "Jun", value: 55 },
  { label: "Jul", value: 85 },
];

const lossData = [
  { label: "Jan", value: 20 },
  { label: "Feb", value: 35 },
  { label: "Mar", value: 65 },
  { label: "Apr", value: 15 },
  { label: "May", value: 40 },
  { label: "Jun", value: 55 },
  { label: "Jul", value: 30 },
];

const explanations = [
  {
    title: "Tata Motors dipped 0.6%",
    desc: "Chip shortage fears resurfaced after a major supplier reported delays.",
    time: "2h ago",
  },
  {
    title: "HDFC Bank rose 2.1%",
    desc: "Strong quarterly earnings beat analyst expectations by 12%.",
    time: "5h ago",
  },
  {
    title: "Reliance surged 1.8%",
    desc: "Jio announced expansion into 5G services across 50 new cities.",
    time: "1d ago",
  },
];

const ChartBars = ({ data }: { data: typeof barData }) => (
  <div className="glass rounded-2xl p-5 mt-4">
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-2">
          <div className="w-full flex justify-center">
            <div
              className="w-6 rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all duration-500 hover:opacity-80"
              style={{
                height: `${d.value * 1.4}px`,
                boxShadow: "0 0 12px hsla(252, 90%, 60%, 0.4)",
              }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const AIInsights = () => {
  const [risk, setRisk] = useState([50]);

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <div className="flex items-center gap-2 mb-5">
          <BrainCircuit size={20} className="text-accent" />
          <h1 className="text-lg font-bold text-foreground">AI Insights</h1>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="w-full glass rounded-xl border-0 h-11">
            <TabsTrigger
              value="performance"
              className="flex-1 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-semibold transition-all"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="loss"
              className="flex-1 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none text-xs font-semibold transition-all"
            >
              Loss Probability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <ChartBars data={barData} />
          </TabsContent>
          <TabsContent value="loss">
            <ChartBars data={lossData} />
          </TabsContent>
        </Tabs>

        {/* Value at Risk Slider */}
        <div className="glass rounded-2xl p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">
              Value at Risk
            </p>
            <span className="text-sm font-bold text-primary">{risk[0]}%</span>
          </div>
          <Slider
            value={risk}
            onValueChange={setRisk}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-primary [&_[role=slider]]:to-accent [&_[role=slider]]:border-0 [&_[role=slider]]:glow-button [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
          />
          <div className="flex justify-between mt-2">
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
                className="glass rounded-xl p-4 transition-all duration-300 hover:glass-strong cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={14} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {e.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {e.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AIInsights;
