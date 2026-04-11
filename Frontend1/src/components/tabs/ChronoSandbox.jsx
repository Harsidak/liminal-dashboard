import { useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const SCENARIOS = {
  bull:        { cagr: 0.14, drawdown: '-12%', sharpe: '1.12', label: '🐂 Bull Market' },
  crash:       { cagr: 0.04, drawdown: '-52%', sharpe: '0.18', label: '💥 2008 Crash' },
  covid:       { cagr: 0.09, drawdown: '-38%', sharpe: '0.55', label: '🦠 COVID Crash' },
  stagflation: { cagr: 0.02, drawdown: '-22%', sharpe: '0.10', label: '📉 Stagflation' },
  balanced:    { cagr: 0.10, drawdown: '-18%', sharpe: '0.74', label: '⚖️ Balanced' },
  custom:      { cagr: 0.08, drawdown: '-15%', sharpe: '0.60', label: '✏️ Custom' },
};

function buildData(cagr, years, start = 400000) {
  const labels = [], port = [], cash = [];
  for (let i = 0; i <= years; i++) {
    labels.push(2024 + i);
    port.push(Math.round(start * Math.pow(1 + cagr, i)));
    cash.push(Math.round(start * Math.pow(0.942, i)));
  }
  return { labels, port, cash };
}

const chartOpts = (color) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
  elements: { point: { radius: 0 }, line: { tension: 0.4 } },
});

export default function ChronoSandbox({ openAI }) {
  const [scenario, setScenario] = useState('balanced');
  const [year, setYear] = useState(2024);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const sc = SCENARIOS[scenario];
  const elapsed = year - 2024;
  const { labels, port, cash } = buildData(sc.cagr, 30);
  const portNow = port[elapsed];
  const cashNow = cash[elapsed];
  const proj30  = port[30];

  const runSim = () => {
    if (running) { clearInterval(timerRef.current); setRunning(false); return; }
    setRunning(true);
    timerRef.current = setInterval(() => {
      setYear(y => { if (y >= 2054) { clearInterval(timerRef.current); setRunning(false); return y; } return y + 1; });
    }, 120);
  };
  const reset = () => { clearInterval(timerRef.current); setRunning(false); setYear(2024); };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const slicePort = { labels: labels.slice(0, elapsed + 1), data: port.slice(0, elapsed + 1) };
  const sliceCash = { labels: labels.slice(0, elapsed + 1), data: cash.slice(0, elapsed + 1) };

  const chartData = (slice, color) => ({
    labels: slice.labels,
    datasets: [{ data: slice.data, borderColor: color, backgroundColor: color.replace(')', ',0.1)').replace('rgb', 'rgba'), fill: true, borderWidth: 1.5 }],
  });

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><div className="dot green" />Chrono-Sandbox — 30-Year Financial Simulation</div>
          <div className="panel-actions">
            <span className="panel-tag tag-green">30Y HORIZON</span>
            <button className="icon-btn">⬇</button>
            <button className="icon-btn">⤴</button>
          </div>
        </div>
        <div style={{ padding: 15 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <button className={`ctrl-btn primary`} onClick={runSim}>{running ? '⏸ Pause' : '▶ Run Simulation'}</button>
            <button className="ctrl-btn" onClick={reset}>↺ Reset</button>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:14, color:'var(--accent)', fontWeight:500, marginBottom:4 }}>{year}</div>
              <input type="range" min={2024} max={2054} value={year} onChange={e => setYear(+e.target.value)} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ padding:12 }}>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:3 }}>Portfolio Value</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:500, color:'var(--green)' }}>₹{portNow.toLocaleString('en-IN')}</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:10.5, color:'var(--text3)', marginBottom:10 }}>+{((portNow/400000-1)*100).toFixed(1)}% total return · {elapsed}Y elapsed</div>
              <div style={{ height:90 }}><Line data={chartData(slicePort, 'rgb(0,229,160)')} options={chartOpts()} /></div>
            </div>
            <div style={{ padding:12, borderLeft:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:3 }}>Cash Hoarding Value (Inflation adj.)</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:500, color:'var(--red)' }}>₹{cashNow.toLocaleString('en-IN')}</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:10.5, color:'var(--text3)', marginBottom:10 }}>{((cashNow/400000-1)*100).toFixed(1)}% real value · ₹{(400000-cashNow).toLocaleString('en-IN')} lost</div>
              <div style={{ height:90 }}><Line data={chartData(sliceCash, 'rgb(255,77,77)')} options={chartOpts()} /></div>
            </div>
          </div>

          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <div key={key} className={`scenario-chip${scenario === key ? ' active' : ''}`} onClick={() => { setScenario(key); reset(); }}>{s.label}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[
          { label:'CAGR Rate',      val:`${(sc.cagr*100).toFixed(1)}%`, color:'var(--green)',  sub:'vs 6.2% inflation' },
          { label:'Max Drawdown',   val:sc.drawdown,                    color:'var(--amber)',  sub:'Scenario dependent' },
          { label:'Sharpe Ratio',   val:sc.sharpe,                      color:'var(--purple)', sub:'Risk-adjusted return' },
          { label:'30Y Projection', val:`₹${(proj30/100000).toFixed(1)}L`, color:'var(--text1)', sub:'vs ₹8.2L (cash)' },
        ].map(c => (
          <div key={c.label} className="panel" style={{ padding:'12px 14px' }}>
            <div style={{ fontSize:9.5, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 }}>{c.label}</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:22, color:c.color, fontWeight:500 }}>{c.val}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}