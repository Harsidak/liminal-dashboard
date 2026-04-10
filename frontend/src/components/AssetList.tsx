import { Gift, TrendingDown, TrendingUp } from "lucide-react";

const activities = [
  { name: "Hobby", time: "23:04 | EUR", value: "- £1.00", up: false },
  { name: "Income From Papieh", time: "23:04 | EUR", value: "+ £243.00", up: true },
  { name: "Deposit", time: "21:18 | EUR", value: "+ £80.00", up: true },
];

const AssetList = () => (
  <div className="mt-5 px-3">
    <div className="mb-3">
      <h2 className="text-base font-semibold text-foreground">Top Deals</h2>
    </div>
    <div className="mb-5 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {["Up To 90% Off", "Daily Rewards", "Cashback Bonus"].map((deal) => (
        <div
          key={deal}
          className="glass min-w-[230px] rounded-2xl p-4 transition-all duration-300 hover:glass-strong"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
              <Gift size={16} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{deal}</p>
              <p className="text-[11px] text-muted-foreground">Selected Partners Only</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
      <button className="text-[11px] text-muted-foreground hover:text-foreground">See all</button>
    </div>
    <div className="space-y-2.5">
      {activities.map((a) => (
        <div key={a.name} className="glass rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                {a.up ? <TrendingUp size={13} className="text-emerald-300" /> : <TrendingDown size={13} className="text-rose-300" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <p className="text-[10px] text-muted-foreground">{a.time}</p>
              </div>
            </div>
            <p className={`text-sm font-semibold ${a.up ? "text-emerald-300" : "text-rose-300"}`}>{a.value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AssetList;
