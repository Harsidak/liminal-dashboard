import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, setStoredUser } from "@/lib/api";
import { LogIn, Eye, EyeOff, Mail, Lock, CreditCard, Sparkles } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", pan_card: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      if (res.user) setStoredUser(res.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-50 via-white to-rose-50/30">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-rose-200/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-rose-100/30 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 space-y-10">
        {/* Brand/Logo Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white shadow-2xl shadow-rose-500/10 border border-rose-100/50 p-1">
             <div className="h-full w-full rounded-[1.25rem] bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-inner">
               <Sparkles size={32} className="text-white" />
             </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Liminal AI</h1>
            <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">The Ethereal Trading Floor</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-rose-100/50 shadow-2xl shadow-rose-500/10 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-50" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center shadow-inner border border-rose-100/50">
              <LogIn size={20} className="text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Identity Access</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Secure Portfolio Entry</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Identifier</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="EMAIL@ACCESS.CORE" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-rose-100 focus:border-rose-400 focus:bg-white outline-none text-slate-800 font-bold text-sm transition-all shadow-sm placeholder:text-slate-300 placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cryptographic Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/50 border border-rose-100 focus:border-rose-400 focus:bg-white outline-none text-slate-800 font-bold text-sm transition-all shadow-sm placeholder:text-slate-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-400 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Verification</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                  <CreditCard size={18} />
                </div>
                <input
                  type="text" required maxLength={10} value={form.pan_card}
                  onChange={(e) => setForm({ ...form, pan_card: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-rose-100 focus:border-rose-400 focus:bg-white outline-none text-slate-800 font-bold text-sm tracking-[0.2em] uppercase transition-all shadow-sm placeholder:text-slate-300 placeholder:tracking-widest"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 rounded-[1.25rem] bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} className="stroke-[2.5]" /> Establish Link</>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              No account? <Link to="/signup" className="text-rose-500 hover:text-rose-600 ml-1 decoration-rose-100 underline-offset-4 hover:underline transition-all">Create Identity</Link>
            </p>
          </div>
        </div>

        <div className="text-center space-y-2 pb-10">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
            <Lock size={12} className="text-rose-200" /> End-to-End Encrypted Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
