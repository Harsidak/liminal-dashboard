import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="gradient-bg min-h-screen px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="screen-frame mx-auto min-h-[calc(100vh-2rem)] max-w-md rounded-[36px] px-3 pb-28 pt-2 sm:min-h-[720px] sm:rounded-[44px] sm:px-4">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AppShell;
