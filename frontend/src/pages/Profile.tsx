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
    <div className="pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <div className="glass-strong rounded-3xl p-8 text-center glow-primary relative overflow-hidden h-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
            
            <Avatar className="h-24 w-24 mx-auto mb-6 ring-4 ring-primary/20 relative shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent/40 text-primary font-bold text-3xl">
                JD
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-foreground mb-1">John Doe</h1>
            <p className="text-sm font-medium text-primary/80 mb-8 uppercase tracking-widest">Liminal Pro Member</p>
            
            <div className="grid grid-cols-3 w-full gap-4 px-2">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">3</p>
                <p className="text-[10px] text-muted-foreground uppercase">Assets</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="text-xl font-bold text-emerald-400">+3.2%</p>
                <p className="text-[10px] text-muted-foreground uppercase">Today</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">12</p>
                <p className="text-[10px] text-muted-foreground uppercase">Insights</p>
              </div>
            </div>

            <button className="mt-8 w-full glass hover:glass-strong rounded-xl py-3 text-xs font-bold text-foreground transition-all duration-300">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground mb-4 px-1">Account & Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((m) => (
              <button key={m.label} className="w-full glass rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:glass-strong hover:-translate-y-1 group border-l-4 border-l-transparent hover:border-l-primary">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <m.icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
              </button>
            ))}
            <button className="w-full glass rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:glass-strong hover:-translate-y-1 group border-l-4 border-l-transparent hover:border-l-destructive/50">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-destructive" />
              </div>
              <div className="text-left flex-1">
                <p className="text-base font-bold text-foreground group-hover:text-destructive transition-colors">Sign Out</p>
                <p className="text-xs text-muted-foreground">Logout from all devices</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  </PageTransition>
);

export default Profile;
