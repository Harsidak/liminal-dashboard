import { useState } from 'react';

const ASSETS = {
  nifty: {
    name: 'NIFTY 50 ETF', sub: 'Large-cap index fund · 45% allocation', pct: '+2.1%', color: 'var(--green)', icon: 'N',
    shap: [
      { label: 'Quarterly Earnings Growth', pct: 35, color: 'var(--green)' },
      { label: 'Inflation Headwind (6.2%)',  pct: 40, color: 'var(--red)' },
      { label: 'FII Net Buying',             pct: 18, color: 'var(--purple)' },
      { label: 'Sector Rotation',            pct: 7,  color: 'var(--amber)' },
    ],
    summary: 'NIFTY 50 rose 2.1% today. 35% driven by strong Q3 earnings. Inflation at 6.2% creates a 40% headwind — this dip is temporary and expected in a growth trajectory.',
  },
  info: {
    name: 'Infosys', sub: 'IT sector large-cap · 27% allocation', pct: '-0.8%', color: 'var(--red)', icon: 'I',
    shap: [
      { label: 'USD/INR Weakness',    pct: 45, color: 'var(--red)' },
      { label: 'Deal Win Momentum',   pct: 30, color: 'var(--green)' },
      { label: 'IT Sector Sentiment', pct: 15, color: 'var(--amber)' },
      { label: 'Attrition Rate',      pct: 10, color: 'var(--purple)' },
    ],
    summary: 'Infosys fell 0.8% primarily due to USD/INR currency headwinds. Strong deal pipeline is a positive, but macro currency risk is the dominant driver today.',
  },
  sbi: {
    name: 'SBI Mutual Fund', sub: 'Balanced growth fund · 28% allocation', pct: '+0.4%', color: 'var(--amber)', icon: 'S',
    shap: [
      { label: 'RBI Rate Stability',  pct: 38, color: 'var(--green)' },
      { label: 'Credit Growth',       pct: 32, color: 'var(--amber)' },
      { label: 'NPA Reduction',       pct: 20, color: 'var(--purple)' },
      { label: 'Global Cues',         pct: 10, color: 'var(--red)' },
    ],
    summary: 'SBI MF gained marginally. RBI\'s stable rate stance is the biggest positive factor at 38%, supported by improving credit growth across PSU banks.',
  },
};

export default function XAIExplainer({ openAI }) {
  const [selected, setSelected] = useState('nifty');
  const asset = ASSETS[selected];

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><div className="dot purple" />XAI Asset Explainer — SHAP Attribution</div>
          <div className="panel-actions">
            <span className="panel-tag tag-purple">SHAP v2</span>
            <button className="icon-btn" onClick={() => openAI('Explain the XAI SHAP attribution model and how it applies to my portfolio')}>✦ AI</button>
          </div>
        </div>
        <div style={{ padding:'13px 15px' }}>
          <div style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>Select an asset to see why it moved — powered by SHAP explainability engine</div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {Object.entries(ASSETS).map(([key, a]) => (
              <div key={key}
                onClick={() => setSelected(key)}
                style={{ display:'grid', gridTemplateColumns:'30px 1fr auto', alignItems:'center', gap:10, padding:'9px 11px', borderRadius:8, background:'var(--panel2)', border:`1px solid ${selected === key ? 'var(--accent2)' : 'var(--border)'}`, cursor:'pointer', transition:'all 0.2s', background: selected===key ? 'rgba(124,109,250,0.07)':'var(--panel2)' }}>
                <div style={{ width:30, height:30, borderRadius:7, background:`${a.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:10, color:a.color }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{a.name}</div>
                  <div style={{ fontSize:10, color:'var(--text2)' }}>{a.sub}</div>
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:12.5, fontWeight:600, color:a.color }}>{a.pct}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:12, padding:'12px 13px', background:'var(--panel2)', borderRadius:8, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:11, display:'flex', alignItems:'center', gap:6 }}>
              <div className="dot purple" /> SHAP Feature Attribution — <span style={{ color:'var(--accent2)' }}>{asset.name}</span>
            </div>
            {asset.shap.map(s => (
              <div key={s.label} style={{ marginBottom:9 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:10.5 }}>
                  <span style={{ color:'var(--text2)' }}>{s.label}</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontWeight:600, color:s.color }}>{s.pct}%</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.07)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${s.pct}%`, borderRadius:2, background:s.color, transition:'width 0.6s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop:10, padding:'10px 12px', background:'rgba(124,109,250,0.06)', border:'1px solid rgba(124,109,250,0.15)', borderRadius:7, fontSize:11, color:'var(--text2)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--accent2)' }}>AI Summary:</strong> {asset.summary}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><div className="dot green" />Portfolio Allocation Breakdown</div>
          <span className="panel-tag tag-green">LIVE</span>
        </div>
        <div style={{ padding:'14px 15px', display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'NIFTY 50 ETF', pct:'45%', color:'var(--green)' },
            { label:'SBI MF',       pct:'28%', color:'var(--amber)' },
            { label:'Infosys',      pct:'27%', color:'var(--red)' },
          ].map(h => (
            <div key={h.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'var(--panel2)', borderRadius:7, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:h.color }} />
                <span style={{ fontSize:12, fontWeight:600 }}>{h.label}</span>
              </div>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:h.color }}>{h.pct}</span>
            </div>
          ))}
          <button onClick={() => openAI('Analyze my portfolio allocation and suggest optimal rebalancing')}
            style={{ padding:'8px 14px', borderRadius:7, border:'1px solid rgba(0,229,160,0.25)', background:'rgba(0,229,160,0.07)', color:'var(--green)', fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, cursor:'pointer', marginTop:4 }}>
            ✦ AI Rebalancing Advice ↗
          </button>
        </div>
      </div>
    </>
  );
}