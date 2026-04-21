import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import {
  getHoldings, getStockHistory, type HoldingData, type StockHistoryPoint, api
} from "@/lib/api";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Clock, 
  Briefcase, 
  Flame, 
  ShieldCheck,
  Zap,
  TrendingDown,
  Info
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PERIODS = ["1mo", "3mo", "6mo", "1y", "5y"] as const;

const Portfolio = () => {
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("6mo");
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [stressData, setStressData] = useState<any>(null);
  const [runningStress, setRunningStress] = useState(false);

  useEffect(() => {
    getHoldings().then((h) => {
      setHoldings(h);
      if (h.length > 0) setSelected(h[0].symbol);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingChart(true);
    getStockHistory(selected, period)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoadingChart(false));
  }, [selected, period]);

  const runStressTest = async () => {
    setRunningStress(true);
    try {
      const res = await api.post("/portfolio/stress-test");
      setStressData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningStress(false);
    }
  };

  const selectedHolding = holdings.find((h) => h.symbol === selected);

  const chartData = history.map((h) => ({
    date: h.date.slice(5),
    close: h.close,
  }));

  const isUp = chartData.length >= 2 && chartData[chartData.length - 1].close >= chartData[0].close;

  return (
    <PageTransition>
      <div className="pt-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-rose-400" />
              <GradientText
                className="text-3xl font-bold"
                colors={["#E11D48", "#FB7185", "#A78BFA"]}
                animationSpeed={8}
              >
                My Portfolio
              </GradientText>
            </div>
            <p className="text-sm text-slate-500 font-medium">Analyze your assets and stress-test your risk exposure.</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/50 border border-rose-100 p-1.5 rounded-2xl shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-rose-500 data-[state=active]:text-white transition-all rounded-xl px-6 font-bold">Overview</TabsTrigger>
            <TabsTrigger value="stress-test" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-400 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all rounded-xl px-6 flex items-center gap-2 font-bold">
              <Flame size={14} /> AI Stress Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar: Holding List */}
              <Card className="lg:col-span-1 bg-white/70 border-rose-100/50 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Your Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
                  {holdings.map((h) => (
                    <button
                      key={h.symbol}
                      onClick={() => setSelected(h.symbol)}
                      className={`w-full p-4 rounded-2xl text-left transition-all border ${
                        selected === h.symbol
                          ? "bg-rose-50 border-rose-200 shadow-sm"
                          : "bg-white/40 border-transparent hover:bg-rose-50/30 hover:border-rose-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{h.symbol.split('.')[0]}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{h.name}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (h.pnl_percent || 0) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {(h.pnl_percent || 0) >= 0 ? "+" : ""}{(h.pnl_percent || 0).toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Main: Price History & Details */}
              <div className="lg:col-span-3 space-y-6">
                {selected && (
                  <Card className="bg-white/70 border-rose-100/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl shadow-rose-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-slate-700">
                          {selected.split('.')[0]}
                          <span className="text-sm font-medium text-slate-400">{selectedHolding?.name}</span>
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium pt-1">
                          {selectedHolding?.quantity} shares @ avg ₹{selectedHolding?.avg_cost?.toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-800">₹{selectedHolding?.current_price?.toLocaleString()}</p>
                        <div className={`flex items-center gap-1 justify-end font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          {holdings.find(h => h.symbol === selected)?.pnl_percent?.toFixed(2)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-8">
                        {PERIODS.map(p => (
                          <button 
                            key={p} 
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-xl border transition-all uppercase tracking-wider ${
                              period === p ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-200' : 'bg-white border-rose-100 text-slate-400 hover:border-rose-200 hover:text-rose-400'
                            }`}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div className="h-[350px] w-full">
                        {loadingChart ? (
                          <div className="h-full flex items-center justify-center"><Activity className="animate-spin text-indigo-500" /></div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={isUp ? "#10B981" : "#F43F5E"} stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor={isUp ? "#10B981" : "#F43F5E"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                              <XAxis dataKey="date" hide />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(244,63,94,0.08)' }}
                                labelStyle={{ color: '#6B7280', fontWeight: 'bold' }}
                                itemStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="close" stroke={isUp ? "#10B981" : "#F43F5E"} fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stress-test">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 bg-white/70 border-rose-100/50 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-500/5 border-l-4 border-l-rose-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck className="text-rose-500" /> Risk Radar
                  </CardTitle>
                  <CardDescription className="text-slate-500">Simulates black-swan events using your AI core.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button 
                    onClick={runStressTest} 
                    disabled={runningStress}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-7 rounded-2xl shadow-lg shadow-rose-200 border-none"
                  >
                    {runningStress ? <Activity className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                    {stressData ? "Refresh Simulation" : "Analyze Risk Exposure"}
                  </Button>

                  {stressData && (
                    <div className="space-y-6 pt-6 border-t border-rose-50">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Risk Score</p>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-extrabold text-slate-800">{(stressData.score * 10).toFixed(1)}</span>
                          <span className="text-xl text-slate-400 font-medium mb-1">/ 10</span>
                        </div>
                        <div className="w-full h-2 bg-rose-50 rounded-full mt-4 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${stressData.score > 0.6 ? 'bg-rose-500' : 'bg-rose-400'}`}
                            style={{ width: `${stressData.score * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Max Load</p>
                          <p className="text-xl font-bold text-rose-600">-{stressData.max_drawdown.toFixed(1)}%</p>
                        </div>
                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recovery</p>
                          <p className="text-xl font-bold text-slate-800">{stressData.recovery_days}d</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                {!stressData ? (
                  <Card className="h-full min-h-[400px] flex items-center justify-center bg-slate-900/40 border-slate-800 border-dashed border-2">
                    <div className="text-center p-8 max-w-md">
                      <TrendingDown size={48} className="mx-auto text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold mb-2">Simulate a Market Crash</h3>
                      <p className="text-slate-500 text-sm">Our AI agent will stress-test your specific portfolio against global black-swan scenarios to identify concentrated risks.</p>
                    </div>
                  </Card>
                ) : (
                  <>
                    <Card className="bg-white/70 border-rose-100/50 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-500/5 transition-all hover:shadow-rose-500/10">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800"><Info size={19} className="text-violet-400" /> AI Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 leading-relaxed font-medium bg-violet-50/50 p-5 rounded-2xl border-l-4 border-violet-400">
                          "{stressData.summary}"
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {stressData.metrics.map((m: any) => (
                        <Card key={m.name} className="bg-white/70 border-rose-100/50 backdrop-blur-xl rounded-2xl shadow-md border-b-2 border-b-rose-100">
                          <CardHeader className="p-4 pb-1">
                            <CardTitle className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{m.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-2xl font-bold text-slate-800">{m.value}<span className="text-sm font-medium text-slate-400 ml-1">{m.unit}</span></p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{m.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-white/70 border-rose-100/50 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-800">Scenario Sensitivity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(stressData.scenario_results).map(([k, v]: [string, any]) => ({ name: k.replace('_', ' '), val: v.total_change_pct }))}>
                              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                              <YAxis hide />
                              <Tooltip cursor={{ fill: '#F1F5F9', radius: 8 }} contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '12px' }} />
                              <Bar dataKey="val" radius={[8, 8, 0, 0]}>
                                {Object.entries(stressData.scenario_results).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill="#FB7185" />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Portfolio;