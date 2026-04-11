export default function RightPanel({ openAI }) {
  return (
    <aside className="rightpanel">
      <div className="rp-section">
        <div className="rp-label">AI Insights</div>
        <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.6, background:'rgba(124,109,250,0.06)', border:'1px solid rgba(124,109,250,0.15)', borderRadius:7, padding:'10px 12px' }}>
          <strong style={{ color:'var(--accent2)' }}>Behavioral Alert:</strong> Your Infosys holding shows <em>disposition effect</em> — holding losers too long. Consider your exit strategy based on fundamentals, not hope.
        </div>
        <button onClick={() => openAI('Explain the disposition effect and how it applies to my Infosys holding')}
          style={{ width:'100%', marginTop:8, padding:'8px', background:'rgba(124,109,250,0.1)', border:'1px solid rgba(124,109,250,0.3)', color:'var(--accent2)', fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, borderRadius:7, cursor:'pointer' }}>
          ✦ Ask AI Coach ↗
        </button>
      </div>

      <div className="rp-section">
        <div className="rp-label">Market Pulse</div>
        {[
          { label:'NIFTY 50', val:'+0.82%', color:'var(--green)' },
          { label:'SENSEX',   val:'+0.74%', color:'var(--green)' },
          { label:'USD/INR',  val:'₹84.32',  color:'var(--amber)' },
          { label:'Gold',     val:'+0.3%',   color:'var(--amber)' },
          { label:'10Y G-Sec',val:'7.18%',   color:'var(--text2)' },
        ].map(r => (
          <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:11 }}>
            <span style={{ color:'var(--text2)' }}>{r.label}</span>
            <span style={{ fontFamily:'DM Mono,monospace', color:r.color, fontWeight:600 }}>{r.val}</span>
          </div>
        ))}
      </div>

      <div className="rp-section">
        <div className="rp-label">Cognitive Coach</div>
        {[
          { label:'Loss Aversion', text:'You are 2.3× more sensitive to losses than gains — typical for retail investors.' },
          { label:'Recency Bias',  text:'COVID crash is over-weighted in your risk perception. Recalibrate with 30Y data.' },
          { label:'FOMO Score',    text:'Your herd-following tendency: 34/100. Below average — good discipline.' },
        ].map(b => (
          <div key={b.label} style={{ padding:'8px 10px', background:'var(--panel2)', borderRadius:7, border:'1px solid var(--border)', marginBottom:6 }}>
            <div style={{ fontSize:10, color:'var(--text3)', marginBottom:2 }}>{b.label}</div>
            <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.4 }}>{b.text}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}