import { useState } from 'react';
import './App.css';
import useTheme from './hooks/useTheme';
import LoginPage from './components/LoginPage';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import AIModal from './components/AIModal';
import ChronoSandbox from './components/tabs/ChronoSandbox';
import XAIExplainer from './components/tabs/XAIExplainer';
import HerdSimulator from './components/tabs/HerdSimulator';
import LossMeter from './components/tabs/LossMeter';
import MyFDT from './components/tabs/MyFDT';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('finsim_token'));
  const [activeTab, setActiveTab]   = useState('chrono');
  const [aiModal, setAIModal]       = useState({ open: false, prefill: '' });
  const [theme, toggleTheme]        = useTheme();

  const openAI  = (prefill = '') => setAIModal({ open: true, prefill });
  const closeAI = () => setAIModal({ open: false, prefill: '' });
  const logout  = () => { localStorage.removeItem('finsim_token'); localStorage.removeItem('finsim_user'); setIsLoggedIn(false); };

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="app">
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} openAI={openAI} theme={theme} toggleTheme={toggleTheme} onLogout={logout} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} openAI={openAI} />
      <main className="main">
        {activeTab === 'chrono' && <ChronoSandbox openAI={openAI} />}
        {activeTab === 'xai'   && <XAIExplainer  openAI={openAI} />}
        {activeTab === 'herd'  && <HerdSimulator  openAI={openAI} />}
        {activeTab === 'loss'  && <LossMeter      openAI={openAI} />}
        {activeTab === 'fdt'   && <MyFDT          openAI={openAI} />}
      </main>
      <RightPanel openAI={openAI} />
      <AIModal isOpen={aiModal.open} prefill={aiModal.prefill} onClose={closeAI} />
    </div>
  );
}