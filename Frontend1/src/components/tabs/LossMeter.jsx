import { useState } from 'react';

export default function LossMeter({ openAI }) {
  const [risk, setRisk] = useState(40);
  const var95 = (risk * 0.18).toFixed(1);
  const var99 = (risk * 0.28).toFixed(1);

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><div className="dot amber" />Behavioral Loss Meter — VaR &amp; Risk Analytics</div>
          <div className="panel-actions">
            <span className="panel-tag tag-amber">VaR 95%</span>
            <button className="icon-btn" onClick={() => openAI('Explain Value at Risk and how loss aversion affects my investment decisions')}>✦ AI</button>
          </div>
        </div>
        <div style={{ padding:15 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>Portfolio Risk Level</span>
            <input type="range" min={10} max={100} value={risk} onChange={e => setRisk(+e.target.value)} style={{ flex:1 }} />
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--amber)', fontWeight:600, flexShrink:0 }}>{risk}%</span>
          </div>

          {/* Gauge visual */}
          <div style={{ display:'flex', justifyContent:'center', margin:'4px 0 16px' }}>
            <svg width={240} height={120} viewBox="0 0 240 120">
              <path d="M20 110 A100 100 0 0 1 220 110" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={18} strokeLinecap="round"/>
              <path d="M20 110 A100 100 0 0 1 220 110" fill="none" stroke={risk < 33 ? '#00e5a0' : risk < 66 ? '#ffc94a' : '#ff4d4d'} strokeWidth={18} strokeLinecap="round"
                strokeDasharray={`${(risk/100)*314} 314`}/>
              <text x={120} y={105} textAnchor="middle" fontFamily="DM Mono,monospace" fontSize={22} fontWeight={500} fill={risk < 33 ? '#00e5a0' : risk < 66 ? '#ffc94a' : '#ff4d4d'}>{risk}%</text>
              <text x={120} y={118} textAnchor="middle" fontFamily="Syne,sans-serif" fontSize={9} fill="var(--text3)" style={{fill:'#4a5068'}}>RISK LEVEL</text>
            </svg>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { label:'VaR (95%)',   sub:'1-day loss at 95% confidence', val:`-₹${(482350*var95/100).toLocaleString('en-IN')}`, color:'var(--amber)' },
              { label:'VaR (99%)',   sub:'Extreme scenario loss',         val:`-₹${(482350*var99/100).toLocaleString('en-IN')}`, color:'var(--red)' },
              { label:'Expected Shortfall', sub:'Average loss beyond VaR', val:`-₹${(482350*var99*1.3/100).toLocaleString('en-IN')}`, color:'var(--red)' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:7, background:'var(--panel2)', border:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{r.label}</div>
                  <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{r.sub}</div>
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, fontWeight:600, color:r.color }}>{r.val}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:12, padding:'11px 13px', background:'rgba(0,229,160,0.04)', border:'1px solid rgba(0,229,160,0.14)', borderRadius:8 }}>
            <div style={{ fontSize:10, color:'var(--green)', fontWeight:700, marginBottom:3, letterSpacing:'0.5px' }}>INFLATION EROSION</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'var(--text1)', fontWeight:500 }}>
              ₹{Math.round(482350 * Math.pow(0.942, 10)).toLocaleString('en-IN')} in 10 years
            </div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>vs ₹4,82,350 today — 6.2% annual inflation drag</div>
          </div>
        </div>
      </div>
    </>
  );
}