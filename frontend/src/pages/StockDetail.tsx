import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import BorderGlow from "@/components/BorderGlow";
import api, { type StockPrice, type StockHistoryPoint } from "@/lib/api";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Star, Plus, 
  BarChart3, Info, Users, Activity 
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PERIODS = ["1d", "1w", "1mo", "1y", "5y"];

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [period, setPeriod] = useState("1mo");
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<StockPrice[]>([]);
  const [activeTab, setActiveTab] = useState("performance");

  useEffect(() => {
    if (!symbol) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pRes, hRes, wRes] = await Promise.all([
          api.getStockPrice(symbol),
          api.getStockHistory(symbol, period),
          api.getWatchlist().catch(() => [])
        ]);
        setPrice(pRes);
        setHistory(hRes.data);
        setWatchlist(wRes || []);
      } catch (err) {
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [symbol, period]);

  const inWatchlist = watchlist.some(w => w.symbol === symbol);

  const toggleWatchlist = async () => {
    if (!symbol) return;
    try {
      if (inWatchlist) {
        await api.removeFromWatchlist(symbol);
        setWatchlist(w => w.filter(x => x.symbol !== symbol));
        toast.success("Removed from watchlist");
      } else {
        await api.addToWatchlist(symbol);
        const wRes = await api.getWatchlist().catch(() => []);
        setWatchlist(wRes);
        toast.success("Added to watchlist");
      }
    } catch (e) {
      toast.error("Failed to update watchlist");
    }
  };

  if (!symbol) return null;
  const isPositive = price ? price.change >= 0 : true;
  const colorStr = isPositive ? "#34D399" : "#F87171"; // emerald-400 : red-400

  return (
    <PageTransition>
        <div className="pt-2 pb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {loading && !price ? (
            <div className="animate-pulse space-y-6">
              <div className="h-20 bg-white/5 rounded-2xl w-1/3"></div>
              <div className="h-64 bg-white/5 rounded-2xl w-full"></div>
            </div>
          ) : price ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content: Header + Chart + Tabs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Header Information */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${isPositive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                        {price.symbol.charAt(0)}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{price.name || price.symbol.replace(".NS", "")}</h1>
                        <p className="text-sm text-[#9CA3AF] font-medium">{price.symbol}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-white mb-1">₹{price.current_price.toLocaleString("en-IN")}</h2>
                    <p className={`text-sm font-semibold flex items-center justify-end gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {isPositive ? "+" : ""}{price.change.toLocaleString("en-IN")} ({price.change_percent.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="glass-strong rounded-3xl p-6">
                  <div className="flex justify-end mb-6 gap-2">
                    {PERIODS.map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${period === p ? "bg-[#8B5CF6] text-white" : "bg-white/5 text-[#9CA3AF] hover:text-white hover:bg-white/10"}`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="h-[300px] w-full">
                    {history.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={colorStr} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={colorStr} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ background: "rgba(11, 9, 20, 0.9)", border: `1px solid ${colorStr}40`, borderRadius: 12, color: "#fff", fontSize: 12 }}
                            formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Price"]}
                            labelStyle={{ color: "#9CA3AF" }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="close" 
                            stroke={colorStr} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            dot={false}
                          />
                          <XAxis dataKey="date" hide />
                          <YAxis domain={['auto', 'auto']} hide />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#9CA3AF]">No chart data available</div>
                    )}
                  </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-8">
                  <div className="flex gap-6 border-b border-white/10 mb-6 px-2">
                    {[
                      { id: "performance", icon: Activity, label: "Performance" },
                      { id: "about", icon: Info, label: "About" },
                      { id: "shareholding", icon: Users, label: "Shareholding" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                          activeTab === tab.id ? "border-[#8B5CF6] text-white" : "border-transparent text-[#9CA3AF] hover:text-white"
                        }`}
                      >
                        <tab.icon size={16} /> {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "performance" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="glass p-4 rounded-2xl">
                        <p className="text-xs text-[#9CA3AF] mb-1">Today's Low</p>
                        <p className="font-bold text-white">₹{price.day_low.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="glass p-4 rounded-2xl">
                        <p className="text-xs text-[#9CA3AF] mb-1">Today's High</p>
                        <p className="font-bold text-white">₹{price.day_high.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="glass p-4 rounded-2xl">
                        <p className="text-xs text-[#9CA3AF] mb-1">Volume</p>
                        <p className="font-bold text-white">{(price.volume / 1000000).toFixed(2)}M</p>
                      </div>
                      <div className="glass p-4 rounded-2xl">
                        <p className="text-xs text-[#9CA3AF] mb-1">Market Cap</p>
                        <p className="font-bold text-white">₹{((price.market_cap || 0) / 10000000000).toFixed(2)}Cr</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "about" && (
                    <div className="glass p-6 rounded-3xl">
                      <h3 className="font-bold text-white mb-2">About {price.name}</h3>
                      <p className="text-sm text-[#9CA3AF] leading-relaxed">
                        Data provided by Yahoo Finance. {price.name} is publicly traded under the symbol {price.symbol}. 
                        Detailed fundamental and corporate information will be rendered here via FinSim integrations.
                      </p>
                    </div>
                  )}

                  {activeTab === "shareholding" && (
                    <div className="glass p-6 rounded-3xl flex items-center justify-center py-12">
                      <p className="text-sm text-[#9CA3AF]">Shareholding pattern data not available for this period.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Sidebar: Action Buttons */}
              <div className="space-y-4">
                <BorderGlow borderRadius={24} glowColor="258 90 66" colors={["#6366F1", "#8B5CF6"]} fillOpacity={inWatchlist ? 0.2 : 0.05}>
                  <button 
                    onClick={toggleWatchlist}
                    className="w-full text-left p-6 flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        {inWatchlist ? <Star size={20} className="fill-[#8B5CF6] text-[#8B5CF6]" /> : <Star size={20} className="text-[#9CA3AF] group-hover:text-white" />} 
                        {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                      </h3>
                      <p className="text-xs text-[#9CA3AF] mt-1">Track this stock's performance</p>
                    </div>
                    {!inWatchlist && <Plus size={20} className="text-[#8B5CF6]" />}
                  </button>
                </BorderGlow>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-[#9CA3AF]">Could not load stock data.</div>
          )}

        </div>
    </PageTransition>
  );
};

export default StockDetail;
