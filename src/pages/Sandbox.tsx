import AppShell from "@/components/AppShell";
import { FlaskConical } from "lucide-react";

const Sandbox = () => (
  <AppShell>
    <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass rounded-3xl p-8 text-center">
        <FlaskConical size={40} className="text-accent mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Risk Sandbox</h1>
        <p className="text-sm text-muted-foreground">
          Coming soon — build and test custom risk scenarios.
        </p>
      </div>
    </div>
  </AppShell>
);

export default Sandbox;
