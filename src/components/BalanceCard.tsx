import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FlaskConical,
  ScanSearch,
} from "lucide-react";

const actions = [
  { icon: ArrowDownToLine, label: "Deposit", color: "from-emerald-500 to-emerald-600" },
  { icon: ArrowUpFromLine, label: "Withdraw", color: "from-orange-500 to-amber-500" },
  { icon: FlaskConical, label: "Risk Sandbox", color: "from-primary to-accent" },
  { icon: ScanSearch, label: "AI X-Ray", color: "from-blue-500 to-cyan-400" },
];

const BalanceCard = () => (
  <div className="mx-5 mt-2">
    <div className="glass-strong rounded-3xl p-6 glow-primary">
      <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">
        Total Portfolio Value
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1">
        $12,450<span className="text-2xl text-muted-foreground">.89</span>
      </h1>
      <p className="text-xs font-medium text-emerald-400 mb-6">
        ↑ +3.24% today
      </p>

      <div className="grid grid-cols-4 gap-2">
        {actions.map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
            >
              <Icon size={20} className="text-white" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default BalanceCard;
