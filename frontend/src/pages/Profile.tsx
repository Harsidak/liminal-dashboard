import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import { Settings, CreditCard, Shield, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { icon: CreditCard, label: "Subscription", desc: "Liminal Pro — Active" },
  { icon: Shield, label: "Security", desc: "2FA enabled" },
  { icon: Settings, label: "Settings", desc: "Notifications, theme" },
];

const Profile = () => (
  <PageTransition>
  <AppShell>
    <div className="px-4 sm:px-6 lg:px-8 pt-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8 text-center glow-primary relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-primary/30 relative">
          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-bold text-2xl">
            JD
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-0.5">John Doe</h1>
        <p className="text-sm text-muted-foreground">Liminal Pro Member</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-[10px] text-muted-foreground">Assets</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">+3.24%</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">12</p>
            <p className="text-[10px] text-muted-foreground">Insights</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {menuItems.map((m) => (
          <button key={m.label} className="w-full glass rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:glass-strong hover:translate-x-1 group">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <m.icon size={18} className="text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.desc}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  </AppShell>
  </PageTransition>
);

export default Profile;
