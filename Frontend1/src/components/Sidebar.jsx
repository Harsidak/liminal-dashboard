const NAV = [
  { id: 'chrono', label: 'Sandbox',   badge: null },
  { id: 'xai',    label: 'Asset X-Ray', badge: { text:'3', cls:'' } },
  { id: 'loss',   label: 'Loss Meter',  badge: { text:'VaR', cls:'amber' } },
  { id: 'herd',   label: 'Herd MARL',   badge: { text:'FOMO', cls:'amber' } },
  { id: 'fdt',    label: 'My FDT',      badge: null },
];

const HOLDINGS = [
  { label: 'NIFTY 50 ETF', badge: { text:'45%', cls:'' } },
  { label: 'Infosys',       badge: { text:'-0.8%', cls:'red' } },
  { label: 'SBI MF',        badge: { text:'28%', cls:'' } },
];

export default function Sidebar({ activeTab, setActiveTab, openAI }) {
  return (
    <aside className="sidebar">
      <div className="portfolio-card">
        <div className="portfolio-card-label">Sandbox Portfolio</div>
        <div className="portfolio-card-val">₹4,82,350</div>
        <div className="portfolio-card-change">▲ +12.4% vs cash</div>
        <div className="sim-prog-wrap">
          <div className="sim-prog-row"><span>Simulation</span><span>2024</span></div>
          <div className="sim-prog-bar"><div className="sim-prog-fill" style={{ width:'23%' }} /></div>
        </div>
      </div>

      <div className="sidebar-section">Navigation</div>
      {NAV.map(n => (
        <div key={n.id} className={`sidebar-nav-item${activeTab === n.id ? ' active' : ''}`} onClick={() => setActiveTab(n.id)}>
          <span style={{ fontSize:12 }}>◈</span>
          {n.label}
          {n.badge && <span className={`badge ${n.badge.cls}`}>{n.badge.text}</span>}
        </div>
      ))}

      <div className="sidebar-section" style={{ marginTop:8 }}>Holdings</div>
      {HOLDINGS.map(h => (
        <div key={h.label} className="sidebar-nav-item">
          <span style={{ fontSize:12 }}>◈</span>
          {h.label}
          <span className={`badge ${h.badge.cls}`}>{h.badge.text}</span>
        </div>
      ))}

      <div className="sidebar-spacer" />
      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" onClick={() => openAI('Help me review my FinSim portfolio allocation and risk exposure')}>
          <span>✦</span> Ask AI Coach
        </button>
      </div>
    </aside>
  );
}