import { Bell, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardHeader = () => (
  <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-6 pb-4">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-primary/30 transition-all hover:ring-primary/60 hover:scale-105">
        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-sm">
          JD
        </AvatarFallback>
      </Avatar>
      <div className="hidden sm:block">
        <p className="text-xs text-muted-foreground">Welcome back</p>
        <p className="text-sm font-semibold text-foreground">John Doe</p>
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <Sparkles size={10} className="text-accent" />
      <p className="text-[11px] text-muted-foreground tracking-wider uppercase font-medium">
        Liminal <span className="text-primary font-semibold">Pro</span>
      </p>
    </div>
    <button className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl glass flex items-center justify-center transition-all duration-300 hover:glow-button hover:scale-105 relative group">
      <Bell size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
    </button>
  </header>
);

export default DashboardHeader;
