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
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("performance");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pRes, hRes, wRes] = await Promise.all([
          api.getStockPrice(symbol),
          api.getStockHistory(symbol, period),
          api.getWatchlists().catch(() => [])
        ]);
        setPrice(pRes);
        setHistory(hRes.data);
        setWatchlists(wRes || []);
      } catch (err) {
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [symbol, period]);

  const handleAddToWatchlist = async (watchlistId: string) => {
    if (!symbol) return;
    try {
      await api.addToWatchlist(symbol, watchlistId);
      toast.success("Added to watchlist");
      setShowPicker(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to add to watchlist");
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId: string) => {
    if (!symbol) return;
    try {
      await api.removeFromWatchlist(symbol, watchlistId);
      toast.success("Removed from watchlist");
    } catch (e: any) {
      toast.error("Failed to remove from watchlist");
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
            className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors mb-6 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} className="stroke-[3]" /> Back to market
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
                <div className="flex items-start justify-between bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-rose-100/50 shadow-xl shadow-rose-500/5">
                    <div className="flex items-center gap-4">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {price.symbol.charAt(0)}
                      </div>
                      <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">{price.name || price.symbol.replace(".NS", "")}</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{price.symbol}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <h2 className="text-3xl font-black text-slate-800 mb-1 leading-none">₹{price.current_price.toLocaleString("en-IN")}</h2>
                      <p className={`text-sm font-bold flex items-center justify-end gap-1 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                        {isPositive ? <TrendingUp size={16} className="stroke-[3]" /> : <TrendingDown size={16} className="stroke-[3]" />}
                        {isPositive ? "+" : ""}{price.change.toLocaleString("en-IN")} ({price.change_percent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>

                {/* Chart Section */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100/50 shadow-xl shadow-rose-500/5">
                  <div className="flex justify-end mb-8 gap-2">
                    {PERIODS.map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${period === p ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-rose-50 text-slate-400 hover:text-rose-500 hover:bg-rose-100"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="h-[320px] w-full">
                    {history.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={isPositive ? "#10B981" : "#F43F5E"} stopOpacity={0.15}/>
                              <stop offset="95%" stopColor={isPositive ? "#10B981" : "#F43F5E"} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ background: "white", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 16, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                            formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Price"]}
                            labelStyle={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="close" 
                            stroke={isPositive ? "#10B981" : "#F43F5E"} 
                            strokeWidth={4}
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
                        className={`pb-4 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${
                          activeTab === tab.id ? "border-rose-500 text-rose-600" : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <tab.icon size={16} className={activeTab === tab.id ? "text-rose-500" : ""} /> {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "performance" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/70 border border-rose-100/50 p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Today's Low</p>
                        <p className="font-black text-slate-800 text-lg">₹{price.day_low.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white/70 border border-rose-100/50 p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Today's High</p>
                        <p className="font-black text-slate-800 text-lg">₹{price.day_high.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-white/70 border border-rose-100/50 p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Volume</p>
                        <p className="font-black text-slate-800 text-lg">{(price.volume / 1000000).toFixed(2)}M</p>
                      </div>
                      <div className="bg-white/70 border border-rose-100/50 p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Market Cap</p>
                        <p className="font-black text-slate-800 text-lg">₹{((price.market_cap || 0) / 10000000000).toFixed(2)}Cr</p>
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
                <div className="relative">
                  <BorderGlow borderRadius={24} glowColor="345 100 50" colors={["#FB7185", "#F43F5E"]} fillOpacity={0.07}>
                    <button 
                      onClick={() => setShowPicker(!showPicker)}
                      className="w-full text-left p-6 flex items-center justify-between group"
                    >
                      <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Star size={20} className="text-rose-500 fill-rose-500" /> 
                          Watchlists
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Manage this stock in your lists</p>
                      </div>
                      <Plus size={20} className={`text-rose-500 transition-transform ${showPicker ? "rotate-45" : ""}`} />
                    </button>
                  </BorderGlow>

                  {showPicker && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl p-3 z-50 border border-rose-100 shadow-2xl animate-in fade-in slide-in-from-top-3">
                      {watchlists.map(wl => (
                        <button
                          key={wl.id}
                          onClick={() => handleAddToWatchlist(wl.id)}
                          className="w-full text-left px-5 py-4 rounded-2xl hover:bg-rose-50 text-sm font-bold text-slate-700 transition-all flex items-center justify-between border border-transparent hover:border-rose-100"
                        >
                          {wl.name}
                          <Plus size={14} className="text-rose-400" />
                        </button>
                      ))}
                      {watchlists.length === 0 && (
                        <p className="p-6 text-xs text-slate-400 font-bold text-center italic">No watchlists found.</p>
                      )}
                    </div>
                  )}
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
