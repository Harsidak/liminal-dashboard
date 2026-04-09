import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardHeader = () => (
  <header className="flex items-center justify-between px-5 pt-6 pb-4">
    <Avatar className="h-10 w-10 ring-2 ring-primary/30">
      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
        JD
      </AvatarFallback>
    </Avatar>
    <div className="text-center">
      <p className="text-[11px] text-muted-foreground tracking-wider uppercase">
        Account
      </p>
      <p className="text-xs font-semibold text-foreground">Liminal Pro</p>
    </div>
    <button className="h-10 w-10 rounded-full glass flex items-center justify-center transition-all duration-300 hover:glow-button">
      <Bell size={18} className="text-muted-foreground" />
    </button>
  </header>
);

export default DashboardHeader;
