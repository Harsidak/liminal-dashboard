import { useState } from 'react';

const BACKEND_URL = 'http://localhost:8000';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login'); // 'login' or 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'register' && !fullName) { setError('Please enter your full name.'); return; }
    setLoading(true); setError('');

    try {
      if (mode === 'login') {
        // ✅ Backend expects form data NOT json
        const formData = new URLSearchParams();
        formData.append('username', email); // backend uses 'username' field for email
        formData.append('password', password);

        const res  = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.detail || 'Login failed.'); setLoading(false); return; }

        // ✅ Store token
        localStorage.setItem('finsim_token', data.access_token);
        onLogin();

      } else {
        // Register — uses JSON
        const res  = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.detail || 'Registration failed.'); setLoading(false); return; }

        // Auto login after register
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const loginRes  = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) { setError('Registered! Please log in.'); setLoading(false); setMode('login'); return; }
        localStorage.setItem('finsim_token', loginData.access_token);
        onLogin();
      }

    } catch {
      setError('Cannot reach server. Make sure your backend is running on port 8000.');
    }
    setLoading(false);
  };

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:400, background:'var(--panel)', border:'1px solid var(--border2)', borderRadius:14, padding:'32px 28px' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <div style={{ width:34, height:34, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px rgba(0,229,160,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5 8L8 10L11 5L14 7" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="4" r="2" fill="#000"/>
            </svg>
          </div>
          <span style={{ fontSize:17, fontWeight:800, letterSpacing:-0.5, color:'var(--text1)' }}>
            Fin<span style={{ color:'var(--accent)' }}>Sim</span> AI
          </span>
          <span style={{ marginLeft:'auto', fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--amber)', border:'1px solid rgba(255,201,74,0.3)', padding:'2px 8px', borderRadius:4 }}>SEBI 2026</span>
        </div>

        {/* Mode Toggle */}
        <div style={{ display:'flex', background:'var(--panel2)', borderRadius:8, padding:3, marginBottom:22, border:'1px solid var(--border)' }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex:1, padding:'7px', border:'none', borderRadius:6, fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                background: mode===m ? 'var(--accent)' : 'transparent',
                color: mode===m ? '#000' : 'var(--text3)' }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ fontSize:16, fontWeight:700, color:'var(--text1)', marginBottom:4 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </div>
        <div style={{ fontSize:12, color:'var(--text2)', marginBottom:18 }}>
          {mode === 'login' ? 'Sign in to your simulation account' : 'Start your financial simulation journey'}
        </div>

        {/* Full Name — register only */}
        {mode === 'register' && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:5 }}>Full Name</div>
            <input
              type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Arjun Kumar"
              style={{ width:'100%', padding:'9px 12px', background:'var(--panel2)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text1)', fontFamily:'Syne,sans-serif', fontSize:13, outline:'none' }}
            />
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:5 }}>Email</div>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="you@example.com"
            style={{ width:'100%', padding:'9px 12px', background:'var(--panel2)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text1)', fontFamily:'Syne,sans-serif', fontSize:13, outline:'none' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:5 }}>Password</div>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            style={{ width:'100%', padding:'9px 12px', background:'var(--panel2)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text1)', fontFamily:'Syne,sans-serif', fontSize:13, outline:'none' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize:11.5, color:'var(--red)', background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)', borderRadius:7, padding:'8px 11px', marginBottom:14 }}>
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={submit} disabled={loading}
          style={{ width:'100%', padding:'10px', background:'var(--accent)', border:'none', borderRadius:8, color:'#000', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:loading?'wait':'pointer', boxShadow:'0 0 12px rgba(0,229,160,0.3)', opacity:loading?0.7:1 }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In ↗' : 'Create Account ↗'}
        </button>

      </div>
    </div>
  );
}