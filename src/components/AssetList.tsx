import { TrendingUp, TrendingDown } from "lucide-react";

const assets = [
  { name: "Reliance Industries", ticker: "RELIANCE", price: "₹2,456.30", change: "+1.8%", up: true },
  { name: "Tata Motors", ticker: "TATAMOTORS", price: "₹612.75", change: "-0.6%", up: false },
  { name: "HDFC Bank", ticker: "HDFCBANK", price: "₹1,678.40", change: "+2.1%", up: true },
];

const AssetList = () => (
  <div className="mt-6 px-5">
    <h2 className="text-sm font-semibold text-foreground mb-3">Your Assets</h2>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {assets.map((a) => (
        <div
          key={a.ticker}
          className="glass rounded-2xl p-4 min-w-[160px] flex-shrink-0 transition-all duration-300 hover:glass-strong hover:scale-[1.02] cursor-pointer"
        >
          <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
            {a.ticker}
          </p>
          <p className="text-sm font-semibold text-foreground mt-1 truncate">
            {a.name}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-bold text-foreground">{a.price}</span>
            <span
              className={`text-xs font-semibold flex items-center gap-0.5 ${
                a.up ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {a.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {a.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AssetList;
