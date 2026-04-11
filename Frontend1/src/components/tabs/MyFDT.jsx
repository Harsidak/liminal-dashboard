import { useState } from 'react';

const MILESTONES = [
  { yr:2024, label:'You Start SIP',    sub:'Monthly investment begins',          color:'var(--green)',  i:0 },
  { yr:2031, label:'7Y Checkpoint',    sub:'First wealth decade',               color:'var(--purple)', i:7 },
  { yr:2039, label:'15Y Milestone',    sub:'AI rebalanced portfolio',           color:'var(--amber)',  i:15 },
  { yr:2054, label:'Retirement Goal',  sub:'30Y compound result',               color:'var(--text3)',  i:30 },
];

export default function MyFDT({ openAI }) {
  const [sip, setSip]       = useState(5000);
  const [capital, setCapital] = useState(400000);
  const [cagr, setCagr]     = useState(12);
  const rate = cagr / 100;

  const project = (i) => Math.round(capital * Math.pow(1 + rate, i) + sip * 12 * ((Math.pow(1 + rate, i) - 1) / rate));
  const you     = project(30);
  const twinB   = Math.round(capital * Math.pow(0.942, 30));
  const diff    = Math.round((1 - twinB / you) * 100);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title"><div className="dot amber" />My Financial Destiny Timeline (FDT)</div>
        <div className="panel-actions">
          <span className="panel-tag tag-amber">30Y PLAN</span>
          <button className="icon-btn" onClick={() => openAI('Review my FDT financial destiny timeline and suggest improvements')}>✦ AI</button>
        </div>
      </div>
      <div style={{ padding:15, display:'grid', gridTemplateColumns:'200px 1fr', gap:20 }}>
        {/* Controls */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'Monthly SIP (₹)', value:sip,     set:setSip,     min:500,    max:50000, step:500 },
            { label:'Initial Capital (₹)', value:capital, set:setCapital, min:10000, max:2000000, step:10000 },
            { label:'Expected CAGR (%)', value:cagr,   set:setCagr,   min:4,     max:25,   step:0.5 },
          ].map(c => (
            <div key={c.label}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text3)', marginBottom:4 }}>
                <span>{c.label}</span>
                <span style={{ fontFamily:'DM Mono,monospace', color:'var(--accent)', fontWeight:600 }}>{c.label.includes('%') ? `${c.value}%` : `₹${c.value.toLocaleString('en-IN')}`}</span>
              </div>
              <input type="range" min={c.min} max={c.max} step={c.step} value={c.value} onChange={e => c.set(+e.target.value)} />
            </div>
          ))}
          <div style={{ padding:'10px 12px', background:'rgba(255,77,77,0.06)', border:'1px solid rgba(255,77,77,0.15)', borderRadius:8, marginTop:4 }}>
            <div style={{ fontSize:9.5, color:'var(--red)', fontWeight:700, marginBottom:3 }}>TWIN B (Cash Hoarder)</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'var(--text1)' }}>
              ₹{twinB.toLocaleString('en-IN')} <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'Syne,sans-serif' }}>(-{diff}% vs you)</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          {MILESTONES.map((m, idx) => {
            const val = project(m.i);
            const isLast = idx === MILESTONES.length - 1;
            return (
              <div key={m.yr} style={{ display:'flex', gap:12, marginBottom:4 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:m.color, flexShrink:0, marginTop:2, boxShadow:`0 0 6px ${m.color}` }} />
                  {!isLast && <div style={{ width:1, flex:1, background:'var(--border2)', margin:'4px 0' }} />}
                </div>
                <div style={{ paddingBottom:16 }}>
                  <div style={{ fontSize:11.5, fontWeight:700, color:'var(--text1)' }}>{m.yr} — {m.label}</div>
                  <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{m.sub}</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:m.color, marginTop:3, fontWeight:600 }}>
                    {isLast ? 'Projected' : 'Capital'}: ₹{val.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}