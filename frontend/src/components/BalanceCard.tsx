import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FlaskConical,
  ScanSearch,
} from "lucide-react";

const actions = [
  { icon: ArrowDownToLine, label: "Send" },
  { icon: ArrowUpFromLine, label: "Withdraw" },
  { icon: FlaskConical, label: "Add Money" },
  { icon: ScanSearch, label: "Paybill" },
];

const BalanceCard = () => (
  <div className="mx-3 mt-4">
    <div className="glass-strong rounded-[26px] p-4 glow-primary relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative">
        <p className="text-[11px] text-muted-foreground mb-2 text-center">
          Your Balance
        </p>
        <h1 className="text-center text-4xl font-bold tracking-tight text-foreground">
          $250.89<span className="text-3xl text-muted-foreground">,32</span>
        </h1>
        <div className="mb-5 mt-2 flex items-center justify-center gap-2">
          <span className="rounded-full bg-emerald-400/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            +2.3%
          </span>
          <span className="text-[10px] text-muted-foreground">this week</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {actions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20">
                <Icon size={17} className="text-white" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default BalanceCard;
