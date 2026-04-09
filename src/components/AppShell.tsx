import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto min-h-screen relative pb-28 sm:pb-32 transition-all">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default AppShell;
