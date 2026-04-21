import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import api from "@/lib/api";
import { type StockPrice, type NewsArticle } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Clock, Newspaper, ArrowRight, Activity, Zap, Trash2 } from "lucide-react";
import BorderGlow from "@/components/BorderGlow";

const C = {
  textDark: "#1F2937",      // Dark Slate
  textSoft: "#6B7280",      // Slate 500
  border: "rgba(251,113,133,0.15)", // Soft Rose
  cardBg: "rgba(255,255,255,0.7)",
  gain: "#059669",          // Emerald 600
  loss: "#E11D48",          // Rose 600
  gainBg: "rgba(16,185,129,0.08)",
  lossBg: "rgba(244,63,94,0.08)",
  rose: "#FDA4AF",
  plum: "#C4B5FD",
  lavSoft: "rgba(167,139,250,0.1)",
};

const f = (styles: any) => ({
  fontFamily: "'Outfit', sans-serif",
  ...styles,
});

const card = (styles: any) => ({
  background: C.cardBg,
  border: `1px solid ${C.border}`,
  borderRadius: "24px",
  backdropFilter: "blur(16px)",
  ...styles,
});

const themeConfig: any = {
  "High Growth": { icon: "🌱", bg: "rgba(244,63,94,0.08)", color: "#F43F5E" },
  "Dividends": { icon: "🌸", bg: "rgba(20,184,166,0.08)", color: "#14B8A6" },
  "Tech Giants": { icon: "✨", bg: "rgba(139,92,246,0.08)", color: "#8B5CF6" },
  "EV Revolution": { icon: "⚡", bg: "rgba(14,165,233,0.08)", color: "#0EA5E9" },
};

const SearchBar = ({ navigate }: { navigate: any }) => {
  const [val, setVal] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      try { const r = await api.searchStocks(val); setResults(r); setOpen(r.length > 0); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [val]);

  return (
    <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto 32px", zIndex: 50 }}>
      <div style={{ position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
        <input
          type="text" value={val}
          placeholder="Search stocks — Reliance, HDFC, Infosys..."
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => val.length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          style={{
            width: "100%", paddingLeft: "46px", paddingRight: "16px",
            paddingTop: "15px", paddingBottom: "15px", borderRadius: "20px",
            background: "rgba(255,255,255,0.85)", border: `1.5px solid rgba(251,113,133,0.25)`,
            color: "#1F2937", fontSize: "0.9rem", fontFamily: "'Outfit', sans-serif",
            outline: "none", boxSizing: "border-box",
            boxShadow: "0 10px 30px rgba(244,63,94,0.06)",
          }}
        />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", left: 0, right: 0,
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
          borderRadius: "20px", border: "1px solid rgba(251,113,133,0.15)",
          boxShadow: "0 20px 60px rgba(180,120,180,0.15)", overflow: "hidden"
        }}>
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => navigate(`/stock/${r.symbol}`)}
              className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left border-b border-rose-50 last:border-none"
            >
              <div>
                <p className="text-sm font-bold text-slate-800">{r.symbol}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{r.name}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">{r.exch}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Market Snapshot Card ─────────────────────────────────────────────────────
const SnapshotCard = ({ title, data }: { title: string; data?: StockPrice }) => {
  if (!data) return <div style={card({ padding: "20px", height: "110px" })} />;
  const up = data.change >= 0;
  return (
    <div style={card({ padding: "20px", cursor: "pointer", transition: "transform 0.2s" })}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
      <p style={f({ fontSize: "0.78rem", fontWeight: 600, color: C.textSoft, marginBottom: "10px" })}>{title}</p>
      <h3 style={f({ fontSize: "1.3rem", fontWeight: 700, color: C.textDark, marginBottom: "6px" })}>
        ₹{data.current_price.toLocaleString("en-IN")}
      </h3>
      <p style={{ display: "flex", alignItems: "center", gap: "4px", ...f({ fontSize: "0.78rem", fontWeight: 700, color: up ? C.gain : C.loss }) }}>
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {data.change.toLocaleString("en-IN")} ({data.change_percent.toFixed(2)}%)
      </p>
    </div>
  );
};

// ── Mover Card ───────────────────────────────────────────────────────────────
const MoverCard = ({ data, navigate }: { data: StockPrice; navigate: any }) => {
  const up = data.change >= 0;
  return (
    <div onClick={() => navigate(`/stock/${data.symbol}`)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 12px", borderRadius: "14px", cursor: "pointer", transition: "background 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.65)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0, background: up ? C.gainBg : C.lossBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {up ? <TrendingUp size={16} color={C.gain} /> : <TrendingDown size={16} color={C.loss} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...f({ fontWeight: 700, fontSize: "0.875rem", color: C.textDark }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.name?.split(" ")[0] || data.symbol.replace(".NS", "")}
          </p>
          <p style={f({ fontSize: "0.7rem", color: C.textSoft })}>{data.symbol.replace(".NS", "")}</p>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
        <p style={f({ fontWeight: 700, fontSize: "0.875rem", color: C.textDark })}>₹{data.current_price.toLocaleString("en-IN")}</p>
        <p style={f({ fontSize: "0.75rem", fontWeight: 600, color: up ? C.gain : C.loss })}>{up ? "+" : ""}{data.change_percent.toFixed(2)}%</p>
      </div>
    </div>
  );
};

// ── Watchlist Section ────────────────────────────────────────────────────────
const WatchlistSection = ({ watchlists, activeListId, onSwitch, onCreate, onDeleteList, items, onRemoveItem, navigate }: any) => (
  <div style={{ marginBottom: "36px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <h2 style={f({ fontSize: "1rem", fontWeight: 700, color: C.textDark, display: "flex", alignItems: "center", gap: "8px" })}>
        <Clock size={17} color="#F43F5E" /> My Watchlists
      </h2>
      <button onClick={onCreate} style={{
        ...f({ fontSize: "0.78rem", fontWeight: 700, color: "#E11D48" }),
        background: "rgba(251,113,133,0.1)", border: `1px solid rgba(251,113,133,0.2)`,
        borderRadius: "12px", padding: "7px 14px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <Zap size={13} /> New List
      </button>
    </div>

      {/* Watchlist Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {watchlists.map((list: any) => (
          <div key={list.id} className="flex items-center group/tab">
            <button
              onClick={() => onSwitch(list.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${
                activeListId === list.id 
                  ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white border-rose-400 shadow-[0_4px_16px_rgba(244,63,94,0.3)]" 
                  : "bg-white/40 text-slate-500 border-rose-100 hover:bg-rose-50/50"
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
                <Trash2 size={12} /> 
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
          {items.map((item: any) => {
            const isPositive = item.change >= 0;
            return (
              <div
                key={item.symbol}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className="glass rounded-xl p-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all relative group overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${isPositive ? "bg-emerald-400" : "bg-rose-400"}`} />
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveItem(item.symbol); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity bg-white/60 rounded-full"
                >
                  ×
                </button>
                <h3 className="font-bold text-slate-800 text-sm truncate pr-4">{item.symbol.replace(".NS", "")}</h3>
                <p className="text-[10px] text-slate-400 truncate mb-3">{item.name}</p>
                <p className="text-sm font-mono font-bold text-slate-700">₹{item.current_price.toLocaleString("en-IN")}</p>
                <p className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                  {isPositive ? "+" : ""}{item.change_percent.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );


const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<StockPrice[]>([]);
  const [movers, setMovers] = useState<{ gainers: StockPrice[]; losers: StockPrice[] } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<StockPrice[]>([]);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [themeStocks, setThemeStocks] = useState<StockPrice[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, m, n] = await Promise.all([api.getMarketSnapshot(), api.getMarketMovers(), api.getNews()]);
        setSnapshot(s || []); setMovers(m || null); setNews(n || []);
        const wl = await api.getWatchlists();
        setWatchlists(wl);
        if (wl.length > 0) setActiveListId(wl[0].id);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!activeListId) return;
    api.getWatchlistDetail(activeListId).then(r => setWatchlistItems(r.items)).catch(() => {});
  }, [activeListId]);

  const handleCreateWatchlist = async () => {
    const name = prompt("Name your new watchlist:");
    if (!name) return;
    try {
      const n = await api.createWatchlist(name);
      setWatchlists(p => [...p, n]); setActiveListId(n.id);
    } catch { alert("Failed to create watchlist"); }
  };

  const fetchTheme = async (theme: string) => {
    setActiveTheme(theme); setThemeStocks([]);
    try { setThemeStocks(await api.getStockCollection(theme)); } catch {}
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (!activeListId) return;
    try { await api.removeFromWatchlist(symbol, activeListId); setWatchlistItems(w => w.filter(x => x.symbol !== symbol)); } catch {}
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this watchlist?")) return;
    try {
      await api.deleteWatchlist(id);
      setWatchlists(prev => {
        const next = prev.filter(w => w.id !== id);
        if (activeListId === id) setActiveListId(next.length > 0 ? next[0].id : null);
        return next;
      });
    } catch { alert("Failed to delete watchlist"); }
  };

  const indices = snapshot.filter(s => s.symbol.startsWith("^")).slice(0, 3);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <PageTransition>
      <div style={{ paddingTop: "8px", paddingBottom: "40px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={f({ fontWeight: 700, fontSize: "1.6rem", color: C.textDark, marginBottom: "4px" })}>
            Hello, {firstName} 🌸
          </h1>
          <p style={f({ color: C.textSoft, fontSize: "0.9rem" })}>Here's what the market looks like today</p>
        </div>

        <SearchBar 
          navigate={navigate}
        />

        {/* Indices */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "36px" }}>
          {indices.map(idx => (
            <SnapshotCard key={idx.symbol}
              title={idx.symbol === "^NSEI" ? "NIFTY 50" : idx.symbol === "^BSESN" ? "SENSEX" : "BANK NIFTY"}
              data={idx}
            />
          ))}
        </div>

        <WatchlistSection
          watchlists={watchlists} activeListId={activeListId}
          onSwitch={setActiveListId} onCreate={handleCreateWatchlist}
          onDeleteList={handleDeleteWatchlist}
          items={watchlistItems} onRemoveItem={removeFromWatchlist} navigate={navigate}
        />

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Market movers */}
            <div style={card({ padding: "24px", boxShadow: "0 10px 40px rgba(244,63,94,0.05)" })}>
              <h2 style={f({ fontWeight: 700, fontSize: "1rem", color: C.textDark, display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" })}>
                <Activity size={18} color="#E11D48" /> Market in Focus
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={f({ fontSize: "0.7rem", fontWeight: 700, color: C.gain, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" })}>Top Gainers</p>
                  {movers?.gainers.map(m => <MoverCard key={m.symbol} data={m} navigate={navigate} />)}
                </div>
                <div>
                  <p style={f({ fontSize: "0.7rem", fontWeight: 700, color: C.loss, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" })}>Top Losers</p>
                  {movers?.losers.map(m => <MoverCard key={m.symbol} data={m} navigate={navigate} />)}
                </div>
              </div>
            </div>

            {/* Collections */}
            <div>
              <h2 style={f({ fontWeight: 700, fontSize: "1rem", color: C.textDark, display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" })}>
                <Zap size={17} color={C.plum} /> Discover Collections
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "14px" }}>
                {Object.keys(themeConfig).map((theme) => {
                  const cfg = themeConfig[theme];
                  const isActive = activeTheme === theme;
                  return (
                    <div key={theme} onClick={() => fetchTheme(theme)} style={{
                      ...card({ padding: "16px 10px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }),
                      background: isActive ? "linear-gradient(135deg, rgba(253,164,175,0.15), rgba(196,181,253,0.15))" : C.cardBg,
                      border: isActive ? "1.5px solid rgba(251,113,133,0.4)" : `1.5px solid ${C.border}`,
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(244,63,94,0.08)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "14px", margin: "0 auto 10px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, fontSize: "1.2rem" }}>{cfg.icon}</div>
                      <p style={f({ fontSize: "0.78rem", fontWeight: 700, color: C.textDark })}>{theme}</p>
                    </div>
                  );
                })}
              </div>
              {activeTheme && (
                <div style={card({ padding: "20px" })}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h3 style={f({ fontWeight: 700, color: C.plum, fontSize: "0.9rem" })}>{activeTheme} Picks</h3>
                    <button onClick={() => setActiveTheme(null)} style={{ background: "none", border: "none", cursor: "pointer", ...f({ fontSize: "0.78rem", color: C.textSoft }) }}>Close</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    {themeStocks.map(s => <MoverCard key={s.symbol} data={s} navigate={navigate} />)}
                    {themeStocks.length === 0 && <p style={f({ fontSize: "0.8rem", color: C.textSoft })}>Loading...</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <BorderGlow borderRadius={24} glowColor="350 89 60" colors={["#FDA4AF", "#C4B5FD"]} fillOpacity={0.04}>
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <Newspaper size={18} className="text-rose-500" /> Latest News
                </h2>
                <div className="space-y-4">
                  {news.map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl hover:bg-rose-50/50 transition-colors group border border-transparent hover:border-rose-100">
                      <p className="text-[10px] text-rose-500 font-bold mb-1 uppercase tracking-wider">{item.source.name}</p>
                      <h4 className="text-sm font-semibold text-slate-700 group-hover:text-rose-600 transition-colors leading-snug line-clamp-2">{item.title}</h4>
                    </a>
                  ))}
                    {news.length === 0 && <p className="text-sm text-slate-400">Fetching latest stories...</p>}
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