import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardHeader = () => (
  <header className="flex items-start justify-between px-3 pt-5">
    <div className="flex items-center gap-2.5">
      <Avatar className="h-10 w-10 ring-2 ring-primary/35">
        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-[11px] font-semibold text-primary">
          AS
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-[10px] text-muted-foreground">Account</p>
        <p className="text-sm font-semibold text-foreground">Alexander Sams</p>
      </div>
    </div>
    <button className="relative h-10 w-10 rounded-full glass flex items-center justify-center transition-all duration-300 hover:glow-button hover:scale-105 group">
      <Bell size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
    </button>
  </header>
);

export default DashboardHeader;
