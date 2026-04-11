import { useState } from 'react';

const TABS = [
  { id: 'chrono', label: 'Chrono-Sandbox' },
  { id: 'xai',    label: 'XAI Explainer' },
  { id: 'herd',   label: 'Herd Simulator' },
  { id: 'loss',   label: 'Loss Meter' },
  { id: 'fdt',    label: 'My FDT' },
];

const NOTIFICATIONS = [
  { icon: '⚠️', color: 'rgba(255,201,74,0.1)', title: 'Anti-Herding Alert', titleColor: 'var(--amber)', sub: 'Infosys allocation 20% above herd average', time: '2 min ago' },
  { icon: '🧠', color: 'rgba(124,109,250,0.1)', title: 'Bias Detected', titleColor: 'var(--purple)', sub: 'Disposition effect active on Infosys holding', time: '15 min ago' },
  { icon: '📈', color: 'rgba(0,229,160,0.1)', title: 'Milestone Reached', titleColor: 'var(--green)', sub: 'Portfolio up 12.4% vs cash baseline', time: '1 hr ago' },
];

export default function Topbar({ activeTab, setActiveTab, openAI }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);

  return (
    <header className="topbar">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M2 12L5 8L8 10L11 5L14 7" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="14" cy="4" r="2" fill="#000"/>
          </svg>
        </div>
        <span className="logo-text">Fin<span>Sim</span> AI</span>
      </div>
      <div className="divider" />

      <nav className="topbar-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="topbar-right">
        <div className="sebi-badge">SEBI 2026</div>
        <div className="live-badge"><div className="live-dot" />LIVE SIM</div>

        <div style={{ position: 'relative' }}>
          <button className="notif-btn" onClick={() => { setNotifOpen(o => !o); setNotifSeen(true); }}>
            🔔
            {!notifSeen && <div className="notif-dot" />}
          </button>

          {notifOpen && (
            <div style={{ position:'absolute', top:'42px', right:0, width:300, background:'var(--panel)', border:'1px solid var(--border2)', borderRadius:10, overflow:'hidden', zIndex:200, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:12, fontWeight:700, display:'flex', justifyContent:'space-between' }}>
                Alerts <span style={{ fontSize:10, color:'var(--red)', fontFamily:'DM Mono,monospace' }}>3 new</span>
              </div>
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, cursor:'pointer' }}>
                  <div style={{ width:30, height:30, borderRadius:7, background:n.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{n.icon}</div>
                  <div>
                    <div style={{ fontSize:11.5, fontWeight:700, color:n.titleColor, marginBottom:2 }}>{n.title}</div>
                    <div style={{ fontSize:10.5, color:'var(--text3)', lineHeight:1.4 }}>{n.sub}</div>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-avatar" title="Arjun Kumar">AK</div>
      </div>
    </header>
  );
}