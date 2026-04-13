import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import {
  getHoldings, getPortfolioAllocation, getPortfolioSummary,
  type HoldingData, type AllocationItem, type PortfolioSummaryData,
} from "@/lib/api";
import { TrendingUp, TrendingDown, BarChart3, Layers } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#818CF8", "#7C3AED", "#5B21B6", "#4C1D95"];

const Portfolio = () => {
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [allocation, setAllocation] = useState<{
    by_sector: AllocationItem[];
    by_asset_type: AllocationItem[];
  } | null>(null);
  const [summary, setSummary] = useState<PortfolioSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"holdings" | "allocation">("holdings");

  useEffect(() => {
    const load = async () => {
      try {
        const [h, a, s] = await Promise.all([
          getHoldings(),
          getPortfolioAllocation(),
          getPortfolioSummary(),
        ]);
        setHoldings(h);
        setAllocation(a);
        setSummary(s);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const pnlData = holdings.map(h => ({
    name: h.symbol.replace(".NS", ""),
    pnl: h.pnl || 0,
  }));

  return (
    <PageTransition>
      <AppShell>
        <div className="pt-6">
          {/* Header */}
          <div className="mb-6">
            <GradientText
              className="text-2xl font-bold mb-1"
              colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
              animationSpeed={8}
            >
              Portfolio
            </GradientText>
            <p className="text-xs text-[#9CA3AF]">
              {summary ? `${summary.holdings_count} holdings · ₹${summary.current_value.toLocaleString("en-IN")} total` : "Loading..."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 glass rounded-xl mb-6 w-fit">
            {(["holdings", "allocation"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-white/10 text-white glow-button"
                    : "text-[#9CA3AF] hover:text-white"
                }`}
              >
                {tab === "holdings" ? <Layers size={14} /> : <BarChart3 size={14} />}
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "holdings" ? (
            /* Holdings List */
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-2 text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                <span className="col-span-4">Stock</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Avg Cost</span>
                <span className="col-span-2 text-right">Value</span>
                <span className="col-span-2 text-right">P&L</span>
              </div>

              {holdings.map((h) => (
                <div key={h.id} className="glass rounded-xl hover:glass-strong transition-all">
                  <div className="grid grid-cols-12 items-center px-4 py-3.5">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        (h.pnl || 0) >= 0 ? "bg-emerald-400/10" : "bg-red-400/10"
                      }`}>
                        {(h.pnl || 0) >= 0 ? (
                          <TrendingUp size={15} className="text-emerald-400" />
                        ) : (
                          <TrendingDown size={15} className="text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{h.symbol.replace(".NS", "")}</p>
                        <p className="text-[10px] text-[#9CA3AF] truncate">{h.sector || h.asset_type}</p>
                      </div>
                    </div>
                    <p className="col-span-2 text-xs text-white text-right">{h.quantity}</p>
                    <p className="col-span-2 text-xs text-[#9CA3AF] text-right">₹{(h.avg_cost || 0).toLocaleString("en-IN")}</p>
                    <p className="col-span-2 text-xs text-white font-semibold text-right">₹{(h.market_value || 0).toLocaleString("en-IN")}</p>
                    <div className="col-span-2 text-right">
                      <p className={`text-xs font-bold ${(h.pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {(h.pnl || 0) >= 0 ? "+" : ""}₹{(h.pnl || 0).toLocaleString("en-IN")}
                      </p>
                      <p className={`text-[10px] ${(h.pnl_percent || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {(h.pnl_percent || 0) >= 0 ? "+" : ""}{(h.pnl_percent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Allocation Charts */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Allocation Donut */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-base font-bold text-white mb-4">Sector Allocation</h3>
                {allocation && allocation.by_sector.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={allocation.by_sector.map(s => ({ name: s.sector, value: s.percentage }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {allocation.by_sector.map((s, i) => (
                            <Cell key={s.sector} fill={s.color || COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(11, 9, 20, 0.95)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: 12,
                            color: "#fff",
                            fontSize: 12,
                          }}
                          formatter={(val: number) => [`${val.toFixed(1)}%`, "Allocation"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {allocation.by_sector.map((s, i) => (
                        <div key={s.sector} className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ background: s.color || COLORS[i % COLORS.length] }}
                          />
                          <span className="text-[11px] text-[#9CA3AF] truncate">{s.sector}</span>
                          <span className="text-[11px] text-white font-semibold ml-auto">{s.percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#9CA3AF] text-center py-10">No data available</p>
                )}
              </div>

              {/* P&L Bar Chart */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-base font-bold text-white mb-4">Profit & Loss by Stock</h3>
                {pnlData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={pnlData} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(11, 9, 20, 0.95)",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          borderRadius: 12,
                          color: "#fff",
                          fontSize: 12,
                        }}
                        formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "P&L"]}
                      />
                      <Bar
                        dataKey="pnl"
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      >
                        {pnlData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.pnl >= 0 ? "rgba(52, 211, 153, 0.8)" : "rgba(248, 113, 113, 0.8)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-[#9CA3AF] text-center py-10">No data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </PageTransition>
  );
};

export default Portfolio;
