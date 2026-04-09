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
  <div className="mx-4 sm:mx-6 lg:mx-8 mt-2">
    <div className="glass-strong rounded-3xl p-5 sm:p-7 glow-primary relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative">
        <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1.5">
          Total Portfolio Value
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-1">
          $12,450<span className="text-2xl sm:text-3xl text-muted-foreground font-bold">.89</span>
        </h1>
        <div className="flex items-center gap-2 mb-7">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            ↑ +3.24%
          </span>
          <span className="text-[11px] text-muted-foreground">today</span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {actions.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-active:scale-95`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
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
