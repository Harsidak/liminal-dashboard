import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import {
  getHoldings, getStockHistory, type HoldingData, type StockHistoryPoint,
} from "@/lib/api";
import { ArrowUpRight, ArrowDownRight, Activity, Clock } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const PERIODS = ["1mo", "3mo", "6mo", "1y", "5y"] as const;

const Analytics = () => {
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("6mo");
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

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

  const selectedHolding = holdings.find((h) => h.symbol === selected);

  const chartData = history.map((h) => ({
    date: h.date.slice(5),
    close: h.close,
    high: h.high,
    low: h.low,
    volume: h.volume,
  }));

  const priceChange = chartData.length >= 2
    ? chartData[chartData.length - 1].close - chartData[0].close
    : 0;
  const priceChangePercent = chartData.length >= 2 && chartData[0].close > 0
    ? (priceChange / chartData[0].close) * 100
    : 0;
  const isUp = priceChange >= 0;

  return (
    <PageTransition>
      <AppShell>
        <div className="pt-6">
          {/* Page Header */}
          <div className="mb-6">
            <GradientText
              className="text-2xl font-bold mb-1"
              colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
              animationSpeed={8}
            >
              Stock Analytics
            </GradientText>
            <p className="text-xs text-[#9CA3AF]">Live charts powered by Yahoo Finance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stock Selector — Left sidebar */}
            <div className="lg:col-span-1 space-y-1.5">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">Your Stocks</p>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-none">
                {holdings.map((h) => (
                  <button
                    key={h.symbol}
                    onClick={() => setSelected(h.symbol)}
                    className={`w-full p-3 rounded-xl text-left transition-all group ${
                      selected === h.symbol
                        ? "glass-strong glow-button"
                        : "glass hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${
                          selected === h.symbol ? "text-white" : "text-[#9CA3AF] group-hover:text-white"
                        }`}>
                          {h.symbol.replace(".NS", "")}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF] truncate">{h.name}</p>
                      </div>
                      <span className={`text-[10px] font-semibold shrink-0 ml-2 px-1.5 py-0.5 rounded-full ${
                        (h.pnl_percent || 0) >= 0
                          ? "text-emerald-400 bg-emerald-400/10"
                          : "text-red-400 bg-red-400/10"
                      }`}>
                        {(h.pnl_percent || 0) >= 0 ? "+" : ""}{(h.pnl_percent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area — Main */}
            <div className="lg:col-span-3 space-y-6">
              {selected && (
                <>
                  {/* Price Header */}
                  <div className="glass-strong rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Activity size={18} className="text-[#8B5CF6]" />
                          <h3 className="text-lg font-bold text-white">
                            {selected.replace(".NS", "")}
                          </h3>
                        </div>
                        <p className="text-xs text-[#9CA3AF]">
                          {selectedHolding?.name || selected}
                        </p>
                        {selectedHolding && (
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            {selectedHolding.quantity} shares · Avg ₹{selectedHolding.avg_cost?.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ₹{selectedHolding?.current_price?.toLocaleString("en-IN") || "—"}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${
                          isUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                        }`}>
                          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isUp ? "+" : ""}{priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Period Selector */}
                    <div className="flex items-center gap-1 mb-5">
                      <Clock size={14} className="text-[#9CA3AF] mr-1" />
                      {PERIODS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            period === p
                              ? "bg-[#6366F1]/20 text-[#8B5CF6] glow-button"
                              : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Chart */}
                    {loadingChart ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={isUp ? "#34D399" : "#F87171"} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={isUp ? "#34D399" : "#F87171"} stopOpacity={0} />
                            </linearGradient>
                            <filter id="chartGlow">
                              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "#9CA3AF", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: "#9CA3AF", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(11, 9, 20, 0.95)",
                              border: `1px solid ${isUp ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                              borderRadius: 12,
                              color: "#fff",
                              fontSize: 12,
                            }}
                            formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Close"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="close"
                            stroke={isUp ? "#34D399" : "#F87171"}
                            strokeWidth={2}
                            fill="url(#aFill)"
                            filter="url(#chartGlow)"
                            dot={false}
                            activeDot={{
                              r: 4,
                              fill: isUp ? "#34D399" : "#F87171",
                              stroke: "white",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Stats Row */}
                  {selectedHolding && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Market Value", value: `₹${(selectedHolding.market_value || 0).toLocaleString("en-IN")}` },
                        { label: "Sectors", value: selectedHolding.sector || "—" },
                        {
                          label: "Total P&L",
                          value: `${(selectedHolding.pnl || 0) >= 0 ? "+" : ""}₹${(selectedHolding.pnl || 0).toLocaleString("en-IN")}`,
                          color: (selectedHolding.pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400",
                        },
                        { label: "Type", value: selectedHolding.asset_type.replace("_", " ") },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="glass rounded-xl p-4 text-center">
                          <p className="text-[10px] text-[#9CA3AF] mb-1">{label}</p>
                          <p className={`text-sm font-bold capitalize ${color || "text-white"}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
};

export default Analytics;
