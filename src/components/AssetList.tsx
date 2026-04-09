import { TrendingUp, TrendingDown } from "lucide-react";

const assets = [
  { name: "Reliance Industries", ticker: "RELIANCE", price: "₹2,456.30", change: "+1.8%", up: true },
  { name: "Tata Motors", ticker: "TATAMOTORS", price: "₹612.75", change: "-0.6%", up: false },
  { name: "HDFC Bank", ticker: "HDFCBANK", price: "₹1,678.40", change: "+2.1%", up: true },
];

const miniSparkline = (up: boolean) => {
  const points = up
    ? "0,20 8,16 16,18 24,10 32,12 40,6 48,8"
    : "0,8 8,12 16,6 24,14 32,10 40,18 48,16";
  return (
    <svg width="48" height="24" className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "hsl(152, 69%, 53%)" : "hsl(0, 84%, 60%)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const AssetList = () => (
  <div className="mt-6 px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-foreground">Your Assets</h2>
      <button className="text-[11px] text-primary font-medium hover:underline transition-all">
        View All
      </button>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible">
      {assets.map((a) => (
        <div
          key={a.ticker}
          className="glass rounded-2xl p-4 min-w-[170px] sm:min-w-0 flex-shrink-0 transition-all duration-300 hover:glass-strong hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-[9px] font-bold text-primary">{a.ticker.slice(0, 2)}</span>
            </div>
            {miniSparkline(a.up)}
          </div>
          <p className="text-sm font-semibold text-foreground mt-1 truncate group-hover:text-primary transition-colors">
            {a.name}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
            {a.ticker}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-bold text-foreground">{a.price}</span>
            <span
              className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                a.up ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
              }`}
            >
              {a.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {a.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AssetList;
