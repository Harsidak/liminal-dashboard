import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import api from "@/lib/api";
import { type StockPrice, type NewsArticle } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Clock, Newspaper, ArrowRight, Activity, Zap } from "lucide-react";

const SearchBar = ({ navigate }: { navigate: any }) => {
  const [val, setVal] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchStocks(val);
        setResults(res);
        setIsOpen(res.length > 0);
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [val]);

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8 z-50">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search stocks (e.g. Reliance, HDFC, Tesla)"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 transition-all shadow-xl backdrop-blur-md"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => val.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161427]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => navigate(`/stock/${r.symbol}`)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-none"
            >
              <div>
                <p className="text-sm font-bold text-white">{r.symbol}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{r.name}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">{r.exch}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MarketSnapshotCard = ({ title, data }: { title: string, data?: StockPrice }) => {
  if (!data) return <div className="glass rounded-2xl p-4 animate-pulse h-28" />;
  const isPositive = data.change >= 0;
  return (
    <div className="glass hover:bg-white/10 transition-colors rounded-2xl p-4 cursor-pointer group">
      <p className="text-sm font-semibold text-[#9CA3AF] mb-2 group-hover:text-white transition-colors">{title}</p>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            ₹{data.current_price.toLocaleString("en-IN")}
          </h3>
          <p className={`text-xs font-semibold flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {data.change.toLocaleString("en-IN")} ({data.change_percent.toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
  );
};

const WatchlistSection = ({ 
  watchlists, 
  activeListId, 
  onSwitch, 
  onCreate, 
  onDeleteList, 
  items, 
  onRemoveItem, 
  navigate 
}: { 
  watchlists: any[], 
  activeListId: string | null, 
  onSwitch: (id: string) => void,
  onCreate: () => void,
  onDeleteList: (id: string) => void,
  items: StockPrice[], 
  onRemoveItem: (s: string) => void, 
  navigate: any 
}) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock size={18} className="text-[#8B5CF6]" /> Watchlists
        </h2>
        <button 
          onClick={onCreate}
          className="text-xs font-bold text-[#8B5CF6] hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20"
        >
          <Zap size={14} /> Create New
        </button>
      </div>

      {/* Watchlist Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {watchlists.map(list => (
          <div key={list.id} className="flex items-center group/tab">
            <button
              onClick={() => onSwitch(list.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${
                activeListId === list.id 
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
              }`}
            >
              {list.name}
            </button>
            {watchlists.length > 1 && activeListId === list.id && (
              <button 
                onClick={() => onDeleteList(list.id)}
                className="ml-[-10px] z-10 opacity-0 group-hover/tab:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 active:scale-95 translate-x-2"
                title="Delete watchlist"
              >
                <TrendingDown size={12} className="rotate-45" /> 
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center border-dashed border-white/10">
          <p className="text-[#9CA3AF] text-sm mb-4">This watchlist is empty. Add some stocks to track them!</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Tip: Use the search bar above to find and add stocks</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => {
            const isPositive = item.change >= 0;
            return (
              <div
                key={item.symbol}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className="glass rounded-xl p-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all relative group overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${isPositive ? "bg-emerald-500/50" : "bg-red-500/50"}`} />
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveItem(item.symbol); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-[#9CA3AF] hover:text-white transition-opacity bg-black/40 rounded-full"
                >
                  ×
                </button>
                <h3 className="font-bold text-white text-sm truncate pr-4">{item.symbol.replace(".NS", "")}</h3>
                <p className="text-[10px] text-[#9CA3AF] truncate mb-3">{item.name}</p>
                <p className="text-sm font-mono font-bold text-white">₹{item.current_price.toLocaleString("en-IN")}</p>
                <p className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${isPositive ? "text-emerald-400 bg-emerald-400/5" : "text-red-400 bg-red-400/5"}`}>
                  {isPositive ? "+" : ""}{item.change_percent.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MoverCard = ({ data, label, navigate }: { data: StockPrice, label: string, navigate: any }) => {
  const isPositive = data.change >= 0;
  return (
    <div onClick={() => navigate(`/stock/${data.symbol}`)} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
          {isPositive ? <TrendingUp size={18} className="text-emerald-400" /> : <TrendingDown size={18} className="text-red-400" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate group-hover:text-[#8B5CF6] transition-colors">{data.name?.split(' ')[0] || data.symbol.replace(".NS", "")}</p>
          <p className="text-[10px] text-[#9CA3AF] truncate">{data.symbol.replace(".NS", "")}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className="text-sm font-bold text-white">₹{data.current_price.toLocaleString("en-IN")}</p>
        <p className={`text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}{data.change_percent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<StockPrice[]>([]);
  const [movers, setMovers] = useState<{ gainers: StockPrice[], losers: StockPrice[] } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  
  // Watchlist state
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<StockPrice[]>([]);
  
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [themeStocks, setThemeStocks] = useState<StockPrice[]>([]);

  const fetchWatchlists = async () => {
    try {
      const res = await api.getWatchlists();
      setWatchlists(res);
      if (res.length > 0 && !activeListId) {
        setActiveListId(res[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWatchlistItems = async (id: string) => {
    try {
      const res = await api.getWatchlistDetail(id);
      setWatchlistItems(res.items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [snapRes, movRes, newsRes] = await Promise.all([
          api.getMarketSnapshot(),
          api.getMarketMovers(),
          api.getNews(),
        ]);
        setSnapshot(snapRes || []);
        setMovers(movRes || null);
        setNews(newsRes || []);
        fetchWatchlists();
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeListId) {
      fetchWatchlistItems(activeListId);
    }
  }, [activeListId]);

  const handleCreateWatchlist = async () => {
    const name = prompt("Enter watchlist name:");
    if (!name) return;
    try {
      const newList = await api.createWatchlist(name);
      setWatchlists(prev => [...prev, newList]);
      setActiveListId(newList.id);
    } catch (e) {
      alert("Failed to create watchlist");
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this watchlist?")) return;
    try {
      await api.deleteWatchlist(id);
      const remaining = watchlists.filter(l => l.id !== id);
      setWatchlists(remaining);
      if (activeListId === id) {
        setActiveListId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e) {
      alert("Failed to delete watchlist");
    }
  };

  const fetchTheme = async (theme: string) => {
    setActiveTheme(theme);
    setThemeStocks([]);
    try {
      const res = await api.getStockCollection(theme);
      setThemeStocks(res);
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (!activeListId) return;
    try {
      await api.removeFromWatchlist(symbol, activeListId);
      setWatchlistItems(w => w.filter(x => x.symbol !== symbol));
    } catch (e) {
      console.error(e);
    }
  };

  const idxIndices = snapshot.filter(s => s.symbol.startsWith("^")).slice(0, 3);

  return (
    <PageTransition>
      <div className="pt-2 pb-10">

        <SearchBar navigate={navigate} />

        {/* Market Snapshot Index Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {idxIndices.map(idx => (
            <MarketSnapshotCard key={idx.symbol} title={idx.symbol === "^NSEI" ? "NIFTY 50" : idx.symbol === "^BSESN" ? "SENSEX" : "BANK NIFTY"} data={idx} />
          ))}
        </div>

        <WatchlistSection 
          watchlists={watchlists}
          activeListId={activeListId}
          onSwitch={setActiveListId}
          onCreate={handleCreateWatchlist}
          onDeleteList={handleDeleteWatchlist}
          items={watchlistItems} 
          onRemoveItem={removeFromWatchlist} 
          navigate={navigate} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-strong rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-[#8B5CF6]" /> Market In Focus</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Top Gainers</h3>
                  <div className="space-y-1">
                    {movers?.gainers.map(m => <MoverCard key={m.symbol} data={m} label="Gainer" navigate={navigate} />)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Top Losers</h3>
                  <div className="space-y-1">
                    {movers?.losers.map(m => <MoverCard key={m.symbol} data={m} label="Loser" navigate={navigate} />)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap size={20} className="text-[#8B5CF6]" /> Discover Collections</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {["Technology", "EVs", "Banking", "Green Energy"].map((theme, i) => (
                  <div
                    key={theme}
                    onClick={() => fetchTheme(theme)}
                    className={`glass rounded-xl p-4 text-center cursor-pointer transition-all ${activeTheme === theme ? 'border-indigo-500 bg-indigo-500/10' : 'hover:bg-white/10'}`}
                  >
                    <div className={`h-12 w-12 mx-auto rounded-full mb-3 flex items-center justify-center bg-indigo-500/20 text-indigo-400`}>
                      <TrendingUp size={24} />
                    </div>
                    <p className="text-sm font-bold text-white">{theme}</p>
                  </div>
                ))}
              </div>

              {activeTheme && (
                <div className="glass-strong rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-indigo-400">{activeTheme} Picks</h3>
                    <button onClick={() => setActiveTheme(null)} className="text-xs text-slate-500">Close</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {themeStocks.map(s => <MoverCard key={s.symbol} data={s} label="Theme" navigate={navigate} />)}
                    {themeStocks.length === 0 && <p className="text-xs text-slate-500">Loading stocks...</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <BorderGlow borderRadius={24} glowColor="258 90 66" colors={["#6366F1", "#8B5CF6"]} fillOpacity={0.1}>
              <div className="p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Newspaper size={18} className="text-[#8B5CF6]" /> Latest Market News</h2>
                <div className="space-y-4">
                  {news.map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <p className="text-[10px] text-[#8B5CF6] font-bold mb-1 uppercase tracking-wider">{item.source.name}</p>
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#8B5CF6] transition-colors leading-snug line-clamp-2">{item.title}</h4>
                    </a>
                  ))}
                    {news.length === 0 && <p className="text-sm text-[#9CA3AF]">Loading news...</p>}
                  </div>
                </div>
              </BorderGlow>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
