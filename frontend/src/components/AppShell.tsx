import { ReactNode } from "react";
import Dock from "./Dock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';

const items = [
  { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
  { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
  { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
  { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <main className="relative min-h-[calc(100vh-8rem)] pb-32 lg:pb-12">
          {children}
        </main>
      </div>
      <Dock 
        items={items}
        panelHeight={70}
        baseItemSize={50}
        magnification={100}
      />
    </div>
  );
};

export default AppShell;
