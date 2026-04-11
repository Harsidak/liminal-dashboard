import { useState, useEffect, useRef } from 'react';

const MODES = {
  balanced: { r:0.5,  f:0.35, p:0.15, signal:'Moderate FOMO',      sub:'37% agents buying Infosys on trend signal' },
  bull:     { r:0.3,  f:0.6,  p:0.1,  signal:'Strong FOMO Detected',sub:'60% agents in trend-chasing mode — bubble risk elevated' },
  panic:    { r:0.2,  f:0.15, p:0.65, signal:'Mass Panic Event',     sub:'65% agents panic-selling — counter-cyclical opportunity?' },
  rational: { r:0.85, f:0.1,  p:0.05, signal:'Rational Market',      sub:'85% rational agents — efficient pricing, low volatility' },
};

function MarlGrid({ mode, cols, count }) {
  const cells = Array.from({ length: count }, (_, i) => {
    const r = Math.random();
    if (r < mode.r) return '#00e5a0';
    if (r < mode.r + mode.f) return '#ffc94a';
    return '#ff4d4d';
  });
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:2 }}>
      {cells.map((c, i) => <div key={i} style={{ aspectRatio:'1', borderRadius:2, background:c, opacity:0.7 + Math.random()*0.3 }} />)}
    </div>
  );
}

export default function HerdSimulator({ openAI }) {
  const [mode, setMode] = useState('balanced');
  const [tick, setTick] = useState(0);
  const m = MODES[mode];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><div className="dot red" />MARL Herd Simulator — 144 Agent Grid</div>
          <div className="panel-actions">
            <span className="panel-tag tag-red">LIVE AGENTS</span>
            <button className="icon-btn" onClick={() => openAI('Explain herd behavior in Indian stock markets and how MARL simulates it')}>✦ AI</button>
          </div>
        </div>
        <div style={{ padding:15 }}>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {Object.entries(MODES).map(([key]) => (
              <button key={key} onClick={() => setMode(key)}
                className="ctrl-btn"
                style={mode===key ? { borderColor:'var(--accent)', color:'var(--accent)' } : {}}>
                {key.charAt(0).toUpperCase()+key.slice(1)}
              </button>
            ))}
          </div>
          <MarlGrid key={tick + mode} mode={m} cols={12} count={144} />
          <div style={{ marginTop:10, padding:'8px 10px', background:'var(--panel2)', borderRadius:6, border:'1px solid var(--border)', fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text2)', lineHeight:1.5 }}>
            <strong style={{ color:'var(--text1)' }}>Herd Behavior: {m.signal}</strong><br/>{m.sub}
          </div>
          <div style={{ display:'flex', gap:12, marginTop:10 }}>
            {[
              { label:'Rational', count: Math.round(m.r*144), color:'var(--green)' },
              { label:'FOMO',     count: Math.round(m.f*144), color:'var(--amber)' },
              { label:'Panic',    count: Math.round(m.p*144), color:'var(--red)' },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                <span style={{ color:'var(--text2)' }}>{s.label}:</span>
                <span style={{ fontFamily:'DM Mono,monospace', color:s.color, fontWeight:600 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}