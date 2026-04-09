import AppShell from "@/components/AppShell";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => (
  <AppShell>
    <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass rounded-3xl p-8 text-center">
        <Avatar className="h-16 w-16 mx-auto mb-4 ring-2 ring-primary/30">
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
            JD
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-foreground mb-1">John Doe</h1>
        <p className="text-sm text-muted-foreground">Liminal Pro Member</p>
      </div>
    </div>
  </AppShell>
);

export default Profile;
