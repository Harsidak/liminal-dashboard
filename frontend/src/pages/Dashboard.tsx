import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import { getPortfolioSummary, getHoldings, type PortfolioSummaryData, type HoldingData } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, TrendingDown, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#818CF8", "#7C3AED", "#5B21B6", "#4C1D95"];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<PortfolioSummaryData | null>(null);
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, h] = await Promise.all([getPortfolioSummary(), getHoldings()]);
        setSummary(s);
        setHoldings(h);
      } catch {
        // User may not have uploaded CAS yet
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sectorData = holdings.reduce((acc, h) => {
    const sector = h.sector || "Other";
    const existing = acc.find(a => a.name === sector);
    const val = h.market_value || 0;
    if (existing) existing.value += val;
    else acc.push({ name: sector, value: val });
    return acc;
  }, [] as { name: string; value: number }[]);

  const topHoldings = [...holdings]
    .sort((a, b) => (b.market_value || 0) - (a.market_value || 0))
    .slice(0, 5);

  // Generate mock performance timeline for chart
  const perfData = Array.from({ length: 7 }, (_, i) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const baseValue = (summary?.total_invested || 100000) * 0.9;
    const growth = 1 + (i * 0.035) + (Math.random() * 0.02 - 0.01);
    return { month: months[i], value: Math.round(baseValue * growth) };
  });

  const hasData = holdings.length > 0;

  return (
    <PageTransition>
      <AppShell>
        <div className="pt-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <p className="text-xs text-[#9CA3AF] mb-1">Welcome back</p>
            <GradientText
              className="text-2xl font-bold"
              colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
              animationSpeed={8}
            >
              {user?.full_name || "Investor"}
            </GradientText>
          </div>

          {!hasData && !loading ? (
            /* Empty State — Prompt CAS Upload */
            <div className="flex flex-col items-center justify-center py-20">
              <BorderGlow
                borderRadius={24}
                glowColor="258 90 66"
                colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
                fillOpacity={0.3}
              >
                <div className="p-10 text-center max-w-md">
                  <div className="h-16 w-16 rounded-2xl bg-[#6366F1]/20 flex items-center justify-center mx-auto mb-6">
                    <Upload size={28} className="text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Your CAS</h3>
                  <p className="text-sm text-[#9CA3AF] mb-6">
                    Upload your Consolidated Account Statement (CAS) PDF to see your portfolio analytics, AI insights, and more.
                  </p>
                  <button
                    onClick={() => navigate("/upload")}
                    className="px-6 py-3 rounded-xl neon-button text-white font-semibold text-sm flex items-center gap-2 mx-auto"
                  >
                    <Upload size={16} />
                    Upload CAS PDF
                  </button>
                </div>
              </BorderGlow>
            </div>
          ) : (
            /* Dashboard Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Portfolio Summary Card */}
                <BorderGlow
                  borderRadius={24}
                  glowColor="258 90 66"
                  colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
                  fillOpacity={0.3}
                >
                  <div className="p-6">
                    <p className="text-xs text-[#9CA3AF] mb-2">Total Portfolio Value</p>
                    <div className="flex items-end gap-3 mb-1">
                      <h1 className="text-3xl font-bold text-white">
                        ₹{(summary?.current_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </h1>
                      {summary && (
                        <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          summary.total_pnl >= 0
                            ? "text-emerald-400 bg-emerald-400/10"
                            : "text-red-400 bg-red-400/10"
                        }`}>
                          {summary.total_pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {summary.total_pnl_percent >= 0 ? "+" : ""}{summary.total_pnl_percent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3AF]">
                      Invested: ₹{(summary?.total_invested || 0).toLocaleString("en-IN")} · P&L: ₹{(summary?.total_pnl || 0).toLocaleString("en-IN")}
                    </p>

                    {/* Mini Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {[
                        { icon: Wallet, label: "Invested", value: `₹${((summary?.total_invested || 0) / 1000).toFixed(1)}K` },
                        { icon: summary?.total_pnl && summary.total_pnl >= 0 ? TrendingUp : TrendingDown, label: "P&L", value: `₹${((summary?.total_pnl || 0) / 1000).toFixed(1)}K` },
                        { icon: BarChart3, label: "Holdings", value: String(summary?.holdings_count || 0) },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="glass rounded-xl p-3 text-center">
                          <Icon size={16} className="text-[#8B5CF6] mx-auto mb-1" />
                          <p className="text-xs text-[#9CA3AF]">{label}</p>
                          <p className="text-sm font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </BorderGlow>

                {/* Performance Chart */}
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-[#9CA3AF] mb-1">Portfolio Growth</p>
                  <p className="text-lg font-bold text-white mb-4">Performance Timeline</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={perfData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dashLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                        <filter id="dashGlow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(11, 9, 20, 0.9)",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          borderRadius: 12,
                          color: "#fff",
                          fontSize: 12,
                        }}
                        formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Value"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="url(#dashLine)"
                        strokeWidth={2.5}
                        fill="url(#dashFill)"
                        filter="url(#dashGlow)"
                        dot={false}
                        activeDot={{ r: 5, fill: "#6366F1", stroke: "white", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Sector Allocation Pie */}
                {sectorData.length > 0 && (
                  <div className="glass rounded-2xl p-5">
                    <p className="text-xs text-[#9CA3AF] mb-1">Allocation</p>
                    <p className="text-base font-bold text-white mb-3">By Sector</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {sectorData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(11, 9, 20, 0.9)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: 12,
                            color: "#fff",
                            fontSize: 12,
                          }}
                          formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Value"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {sectorData.slice(0, 6).map((s, i) => (
                        <div key={s.name} className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] text-[#9CA3AF] truncate">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Holdings */}
                <div className="glass-strong rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-base font-bold text-white">Top Holdings</h3>
                    <p className="text-[10px] text-[#9CA3AF]">By market value</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {topHoldings.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            (h.pnl || 0) >= 0 ? "bg-emerald-400/10" : "bg-red-400/10"
                          }`}>
                            {(h.pnl || 0) >= 0 ? (
                              <TrendingUp size={16} className="text-emerald-400" />
                            ) : (
                              <TrendingDown size={16} className="text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-[#8B5CF6] transition-colors">
                              {h.symbol.replace(".NS", "")}
                            </p>
                            <p className="text-[10px] text-[#9CA3AF] truncate">{h.name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-bold text-white">
                            ₹{(h.market_value || 0).toLocaleString("en-IN")}
                          </p>
                          <p className={`text-[10px] font-medium ${
                            (h.pnl_percent || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {(h.pnl_percent || 0) >= 0 ? "+" : ""}{(h.pnl_percent || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </PageTransition>
  );
};

export default Dashboard;
