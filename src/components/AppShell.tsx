import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-md mx-auto min-h-screen relative pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default AppShell;
