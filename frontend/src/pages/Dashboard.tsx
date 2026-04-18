import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import api from "@/lib/api";
import { type StockPrice, type NewsArticle } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Clock, Newspaper, ArrowRight, Activity, Zap } from "lucide-react";

const SearchBar = ({ onSearch }: { onSearch: (val: string) => void }) => {
  const [val, setVal] = useState("");
  return (
    <div className="relative w-full max-w-xl mx-auto mb-8 group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder="What are you looking for today?"
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 transition-all shadow-xl backdrop-blur-md"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && val.trim()) {
            onSearch(val.trim());
          }
        }}
      />
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
            {data.current_price.toLocaleString("en-IN")}
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

const WatchlistSection = ({ items, onRemove, navigate }: { items: StockPrice[], onRemove: (s: string) => void, navigate: any }) => {
  if (items.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Clock size={18} className="text-[#8B5CF6]" /> Your Watchlist</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map(item => {
          const isPositive = item.change >= 0;
          return (
            <div 
              key={item.symbol} 
              onClick={() => navigate(`/stock/${item.symbol}`)}
              className="glass rounded-xl p-4 min-w-[200px] shrink-0 cursor-pointer hover:scale-[1.02] transition-transform relative group"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(item.symbol); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-[#9CA3AF] hover:text-white transition-opacity bg-black/40 rounded-full"
              >
                ×
              </button>
              <h3 className="font-bold text-white truncate max-w-[150px]">{item.name || item.symbol.replace(".NS", "")}</h3>
              <p className="text-sm text-[#9CA3AF] mt-1">₹{item.current_price.toLocaleString("en-IN")}</p>
              <p className={`text-xs mt-2 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}{item.change_percent.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
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
          <p className="text-sm font-bold text-white truncate group-hover:text-[#8B5CF6] transition-colors">{data.name || data.symbol.replace(".NS", "")}</p>
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
  const [watchlist, setWatchlist] = useState<StockPrice[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [snapRes, movRes, newsRes, watchRes] = await Promise.all([
          api.getMarketSnapshot(),
          api.getMarketMovers(),
          api.getNews(),
          api.getWatchlist().catch(() => []) // ok if empty
        ]);
        setSnapshot(snapRes || []);
        setMovers(movRes || null);
        setNews(newsRes || []);
        setWatchlist(watchRes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (symbol: string) => {
    navigate(`/stock/${symbol.toUpperCase()}`);
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      await api.removeFromWatchlist(symbol);
      setWatchlist(w => w.filter(x => x.symbol !== symbol));
    } catch (e) {
      console.error(e);
    }
  };

  const nifty = snapshot.find(s => s.symbol === "^NSEI");
  const sensex = snapshot.find(s => s.symbol === "^BSESN");
  const bankNifty = snapshot.find(s => s.symbol === "^NSEBANK");

  return (
    <PageTransition>
      <AppShell>
        <div className="pt-2 pb-10">
          
          <SearchBar onSearch={handleSearch} />

          {/* Market Snapshot Index Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            <MarketSnapshotCard title="NIFTY 50" data={nifty} />
            <MarketSnapshotCard title="SENSEX" data={sensex} />
            <MarketSnapshotCard title="BANK NIFTY" data={bankNifty} />
          </div>

          {/* User Watchlist */}
          <WatchlistSection items={watchlist} onRemove={removeFromWatchlist} navigate={navigate} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Movers & Discover */}
            <div className="lg:col-span-2 space-y-8">
              {/* Movers Section */}
              <div className="glass-strong rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-[#8B5CF6]" /> Market In Focus</h2>
                  <button className="text-xs text-[#8B5CF6] hover:text-white transition-colors flex items-center gap-1">View All <ArrowRight size={12} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Gainers */}
                  <div>
                    <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Top Gainers</h3>
                    <div className="space-y-1">
                      {movers?.gainers.map(m => (
                        <MoverCard key={m.symbol} data={m} label="Gainer" navigate={navigate} />
                      ))}
                    </div>
                  </div>
                  {/* Top Losers */}
                  <div>
                    <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Top Losers</h3>
                    <div className="space-y-1">
                      {movers?.losers.map(m => (
                        <MoverCard key={m.symbol} data={m} label="Loser" navigate={navigate} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discover Themes */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap size={20} className="text-[#8B5CF6]" /> Discover Collections</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Technology", "Electric Vehicles", "Banking", "Green Energy"].map((theme, i) => (
                    <div key={theme} className="glass rounded-xl p-4 text-center cursor-pointer hover:bg-white/10 transition-colors">
                      <div className={`h-12 w-12 mx-auto rounded-full mb-3 flex items-center justify-center bg-gradient-to-br ${
                        i===0 ? "from-blue-500/20 to-purple-500/20 text-blue-400" :
                        i===1 ? "from-emerald-500/20 to-teal-500/20 text-emerald-400" :
                        i===2 ? "from-orange-500/20 to-red-500/20 text-orange-400" :
                        "from-green-500/20 to-blue-500/20 text-green-400"
                      }`}>
                        <TrendingUp size={24} />
                      </div>
                      <p className="text-sm font-bold text-white">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: News */}
            <div className="space-y-6">
              <BorderGlow borderRadius={24} glowColor="258 90 66" colors={["#6366F1", "#8B5CF6"]} fillOpacity={0.1}>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Newspaper size={18} className="text-[#8B5CF6]"/> Latest Market News</h2>
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
      </AppShell>
    </PageTransition>
  );
};

export default Dashboard;
