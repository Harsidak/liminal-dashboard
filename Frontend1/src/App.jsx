import { useState } from 'react';
import './App.css';
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
  const [activeTab, setActiveTab] = useState('chrono');
  const [aiModal, setAIModal] = useState({ open: false, prefill: '' });

  const openAI = (prefill = '') => setAIModal({ open: true, prefill });
  const closeAI = () => setAIModal({ open: false, prefill: '' });

  return (
    <div className="app">
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} openAI={openAI} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} openAI={openAI} />

      <main className="main">
        {activeTab === 'chrono'  && <ChronoSandbox openAI={openAI} />}
        {activeTab === 'xai'    && <XAIExplainer  openAI={openAI} />}
        {activeTab === 'herd'   && <HerdSimulator  openAI={openAI} />}
        {activeTab === 'loss'   && <LossMeter      openAI={openAI} />}
        {activeTab === 'fdt'    && <MyFDT          openAI={openAI} />}
      </main>

      <RightPanel openAI={openAI} />
      <AIModal isOpen={aiModal.open} prefill={aiModal.prefill} onClose={closeAI} />
    </div>
  );
}