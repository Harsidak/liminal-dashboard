import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, setStoredUser } from "@/lib/api";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import { LogIn, Eye, EyeOff, Mail, Lock, CreditCard } from "lucide-react";

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
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <GradientText
            className="text-4xl font-bold mb-2"
            colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
            animationSpeed={6}
          >
            Liminal AI
          </GradientText>
          <p className="text-sm text-[#9CA3AF]">
            Intelligent portfolio analytics for fearless investing
          </p>
        </div>

        {/* Login Card */}
        <BorderGlow
          className="w-full"
          borderRadius={24}
          glowColor="258 90 66"
          colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
          fillOpacity={0.3}
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <LogIn size={20} className="text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                <p className="text-xs text-[#9CA3AF]">Sign in to your account</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* PAN Card */}
              <div>
                <label className="text-xs text-[#9CA3AF] mb-1.5 block">PAN Card Number</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={form.pan_card}
                    onChange={(e) => setForm({ ...form, pan_card: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/30 transition-all uppercase tracking-wider"
                  />
                </div>
                <p className="text-[10px] text-[#9CA3AF]/60 mt-1">Required to decrypt your CAS portfolio</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl neon-button text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#9CA3AF] mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
};

export default Login;
