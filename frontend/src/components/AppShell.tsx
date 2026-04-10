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
    <div className="gradient-bg min-h-screen px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="screen-frame mx-auto min-h-[calc(100vh-2rem)] max-w-md rounded-[36px] px-3 pb-28 pt-2 sm:min-h-[720px] sm:rounded-[44px] sm:px-4">
          {children}
        </div>
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
