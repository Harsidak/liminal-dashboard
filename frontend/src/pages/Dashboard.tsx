import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import api from "@/lib/api";
import { type StockPrice, type NewsArticle } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Clock, Newspaper, Activity, Zap, Leaf, Cpu, Landmark, Car } from "lucide-react";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  rose: "#D4668A", roseSoft: "#F9A8C0",
  plum: "#9B6DD1", lavender: "#C4A8FF", lavSoft: "#F5EEFE",
  textDark: "#3D2054", textSoft: "#A07AAE",
  border: "rgba(212,102,138,0.14)", cardBg: "rgba(255,255,255,0.72)",
  gain: "#2DBD8F", gainBg: "rgba(45,189,143,0.1)",
  loss: "#E05A8A", lossBg: "rgba(224,90,138,0.1)",
};
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: C.cardBg, backdropFilter: "blur(16px)",
  borderRadius: "20px", border: `1.5px solid ${C.border}`,
  boxShadow: "0 4px 24px rgba(180,120,180,0.08)", ...extra,
});
const f = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'Outfit', sans-serif", ...extra,
});

// ── Theme config ─────────────────────────────────────────────────────────────
const themeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Technology:    { icon: <Cpu size={22} />,      color: "#9B6DD1", bg: "rgba(196,168,255,0.15)" },
  EVs:           { icon: <Car size={22} />,      color: "#D4668A", bg: "rgba(249,168,192,0.15)" },
  Banking:       { icon: <Landmark size={22} />, color: "#2DBD8F", bg: "rgba(45,189,143,0.12)"  },
  "Green Energy":{ icon: <Leaf size={22} />,     color: "#5BAD8F", bg: "rgba(91,173,143,0.12)"  },
};

// ── SearchBar ────────────────────────────────────────────────────────────────
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
    <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto 28px", zIndex: 50 }}>
      <div style={{ position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: C.textSoft }} />
        <input
          type="text" value={val}
          placeholder="Search stocks — Reliance, HDFC, Infosys..."
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => val.length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          style={{
            width: "100%", paddingLeft: "46px", paddingRight: "16px",
            paddingTop: "14px", paddingBottom: "14px", borderRadius: "18px",
            background: "rgba(255,255,255,0.88)", border: `1.5px solid ${C.border}`,
            color: C.textDark, fontSize: "0.9rem", fontFamily: "'Outfit', sans-serif",
            outline: "none", boxSizing: "border-box",
            boxShadow: "0 4px 20px rgba(180,120,180,0.1)",
          }}
        />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, ...card({ borderRadius: "16px", overflow: "hidden" }), boxShadow: "0 12px 40px rgba(180,120,180,0.18)" }}>
          {results.map((r) => (
            <button key={r.symbol} onClick={() => navigate(`/stock/${r.symbol}`)} style={{
              width: "100%", padding: "12px 16px", display: "flex", alignItems: "center",
              justifyContent: "space-between", background: "none", border: "none",
              borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left",
            }}>
              <div>
                <p style={f({ fontWeight: 700, fontSize: "0.875rem", color: C.textDark })}>{r.symbol}</p>
                <p style={f({ fontSize: "0.72rem", color: C.textSoft })}>{r.name}</p>
              </div>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: C.plum, background: C.lavSoft, padding: "3px 8px", borderRadius: "8px", fontFamily: "'Outfit', sans-serif" }}>{r.exch}</span>
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
const WatchlistSection = ({ watchlists, activeListId, onSwitch, onCreate, items, onRemoveItem, navigate }: any) => (
  <div style={{ marginBottom: "36px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <h2 style={f({ fontSize: "1rem", fontWeight: 700, color: C.textDark, display: "flex", alignItems: "center", gap: "8px" })}>
        <Clock size={17} color={C.rose} /> My Watchlists
      </h2>
      <button onClick={onCreate} style={{
        ...f({ fontSize: "0.78rem", fontWeight: 700, color: C.plum }),
        background: C.lavSoft, border: `1px solid rgba(196,168,255,0.4)`,
        borderRadius: "12px", padding: "7px 14px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <Zap size={13} /> New List
      </button>
    </div>

    <div style={{ display: "flex", gap: "8px", marginBottom: "18px", overflowX: "auto", paddingBottom: "4px" }}>
      {watchlists.map((list: any) => {
        const active = activeListId === list.id;
        return (
          <button key={list.id} onClick={() => onSwitch(list.id)} style={{
            ...f({ fontSize: "0.82rem", fontWeight: 700 }),
            padding: "8px 18px", borderRadius: "14px", whiteSpace: "nowrap",
            border: "none", cursor: "pointer", transition: "all 0.2s",
            background: active ? "linear-gradient(135deg, #F9A8C0, #C4A8FF)" : "rgba(255,255,255,0.7)",
            color: active ? "white" : C.textSoft,
            boxShadow: active ? "0 4px 16px rgba(196,168,255,0.35)" : "none",
          }}>{list.name}</button>
        );
      })}
    </div>

    {items.length === 0 ? (
      <div style={card({ padding: "36px", textAlign: "center" })}>
        <p style={f({ color: C.textSoft, fontSize: "0.9rem", marginBottom: "6px" })}>Your watchlist is empty 🌸</p>
        <p style={f({ color: C.lavender, fontSize: "0.75rem" })}>Use the search bar above to find stocks</p>
      </div>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "12px" }}>
        {items.map((item: StockPrice) => {
          const up = item.change >= 0;
          return (
            <div key={item.symbol} onClick={() => navigate(`/stock/${item.symbol}`)} style={card({ padding: "15px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "transform 0.2s" })}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: up ? C.gain : C.loss }} />
              <button onClick={(e) => { e.stopPropagation(); onRemoveItem(item.symbol); }} style={{
                position: "absolute", top: "8px", right: "8px", background: "rgba(255,255,255,0.8)",
                border: "none", borderRadius: "50%", width: "20px", height: "20px",
                cursor: "pointer", color: C.textSoft, fontSize: "13px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
              <h3 style={f({ fontWeight: 700, fontSize: "0.85rem", color: C.textDark, marginBottom: "2px" })}>
                {item.symbol.replace(".NS", "")}
              </h3>
              <p style={f({ fontSize: "0.68rem", color: C.textSoft, marginBottom: "10px" })}>{item.name}</p>
              <p style={f({ fontWeight: 700, fontSize: "0.9rem", color: C.textDark })}>₹{item.current_price.toLocaleString("en-IN")}</p>
              <span style={{
                display: "inline-block", marginTop: "4px", padding: "2px 8px", borderRadius: "8px",
                ...f({ fontSize: "0.68rem", fontWeight: 700 }),
                background: up ? C.gainBg : C.lossBg, color: up ? C.gain : C.loss,
              }}>{up ? "+" : ""}{item.change_percent.toFixed(2)}%</span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ── Dashboard ────────────────────────────────────────────────────────────────
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

        <SearchBar navigate={navigate} />

        {/* Indices */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "32px" }}>
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
          items={watchlistItems} onRemoveItem={removeFromWatchlist} navigate={navigate}
        />

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Market movers */}
            <div style={card({ padding: "24px" })}>
              <h2 style={f({ fontWeight: 700, fontSize: "1rem", color: C.textDark, display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" })}>
                <Activity size={18} color={C.rose} /> Market in Focus
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={f({ fontSize: "0.7rem", fontWeight: 700, color: C.gain, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" })}>Top Gainers</p>
                  {movers?.gainers.map(m => <MoverCard key={m.symbol} data={m} navigate={navigate} />)}
                </div>
                <div>
                  <p style={f({ fontSize: "0.7rem", fontWeight: 700, color: C.loss, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" })}>Top Losers</p>
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
                      background: isActive ? "linear-gradient(135deg, rgba(249,168,192,0.2), rgba(196,168,255,0.2))" : C.cardBg,
                      border: isActive ? "1.5px solid rgba(196,168,255,0.5)" : `1.5px solid ${C.border}`,
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "14px", margin: "0 auto 10px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color }}>{cfg.icon}</div>
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

          {/* News panel */}
          <div style={card({ padding: "22px" })}>
            <h2 style={f({ fontWeight: 700, fontSize: "1rem", color: C.textDark, display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" })}>
              <Newspaper size={17} color={C.rose} /> Market News
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {news.slice(0, 8).map((item, idx) => (
                <a key={idx} href={item.url} target="_blank" rel="noreferrer" style={{ display: "block", padding: "11px 10px", borderRadius: "12px", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.65)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <p style={f({ fontSize: "0.65rem", fontWeight: 700, color: C.plum, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" })}>{item.source.name}</p>
                  <h4 style={{ ...f({ fontSize: "0.82rem", fontWeight: 600, color: C.textDark, lineHeight: "1.4" }), display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.title}
                  </h4>
                </a>
              ))}
              {news.length === 0 && <p style={f({ color: C.textSoft, fontSize: "0.875rem" })}>Loading news...</p>}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;