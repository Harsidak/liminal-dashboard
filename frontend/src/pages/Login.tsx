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

  const inputStyle: React.CSSProperties = {
    width: "100%", paddingLeft: "42px", paddingRight: "16px",
    paddingTop: "13px", paddingBottom: "13px",
    borderRadius: "14px", fontSize: "0.875rem",
    background: "rgba(255,255,255,0.8)",
    border: "1.5px solid rgba(196,168,255,0.3)",
    color: "#3D2054", outline: "none",
    fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
      background: "linear-gradient(135deg, #FDF6F0 0%, #FEF0F5 35%, #F5EEFE 70%, #EFF6FE 100%)",
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-5%", right: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,182,193,0.22) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "5%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(196,168,255,0.18) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "64px", height: "64px", borderRadius: "20px", marginBottom: "16px",
            background: "linear-gradient(135deg, #F9A8C0, #C4A8FF)",
            boxShadow: "0 8px 32px rgba(249,168,192,0.35)",
          }}>
            <Sparkles size={28} color="white" />
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 700,
            background: "linear-gradient(135deg, #D4668A, #9B6DD1)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "6px",
          }}>Liminal AI</h1>
          <p style={{ color: "#A07AAE", fontSize: "0.875rem", fontFamily: "'Outfit', sans-serif" }}>
            Your trusted partner in fearless investing
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)",
          borderRadius: "28px", border: "1.5px solid rgba(212,102,138,0.15)",
          boxShadow: "0 20px 60px rgba(180,120,180,0.12), 0 4px 20px rgba(212,102,138,0.08)",
          padding: "36px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "14px", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(249,168,192,0.2), rgba(196,168,255,0.2))",
              border: "1px solid rgba(212,102,138,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LogIn size={20} color="#C47ABE" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#3D2054" }}>
                Welcome back
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#A07AAE", fontFamily: "'Outfit', sans-serif" }}>Sign in to your account</p>
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: "16px", padding: "12px 16px", borderRadius: "14px",
              background: "rgba(255,100,100,0.08)", border: "1px solid rgba(255,100,100,0.2)",
              color: "#D4668A", fontSize: "0.875rem", fontFamily: "'Outfit', sans-serif",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9B6DD1", fontWeight: 600, display: "block", marginBottom: "6px", fontFamily: "'Outfit', sans-serif" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C4A8D4" }} />
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "rgba(196,168,255,0.7)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(196,168,255,0.3)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9B6DD1", fontWeight: 600, display: "block", marginBottom: "6px", fontFamily: "'Outfit', sans-serif" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C4A8D4" }} />
                <input
                  type={showPassword ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(196,168,255,0.7)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(196,168,255,0.3)"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#C4A8D4",
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* PAN */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9B6DD1", fontWeight: 600, display: "block", marginBottom: "6px", fontFamily: "'Outfit', sans-serif" }}>
                PAN Card Number
              </label>
              <div style={{ position: "relative" }}>
                <CreditCard size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C4A8D4" }} />
                <input
                  type="text" required maxLength={10} value={form.pan_card}
                  onChange={(e) => setForm({ ...form, pan_card: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  style={{ ...inputStyle, letterSpacing: "0.1em", textTransform: "uppercase" }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(196,168,255,0.7)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(196,168,255,0.3)"}
                />
              </div>
              <p style={{ fontSize: "0.68rem", color: "#C4A8D4", marginTop: "4px", fontFamily: "'Outfit', sans-serif" }}>
                Required to decrypt your CAS portfolio securely
              </p>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "rgba(196,168,255,0.4)" : "linear-gradient(135deg, #F9A8C0, #C4A8FF)",
              color: "white", fontWeight: 700, fontSize: "0.9rem",
              fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: loading ? "none" : "0 8px 24px rgba(196,168,255,0.4)",
              transition: "all 0.2s", marginTop: "4px",
            }}>
              {loading
                ? <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                : <><LogIn size={16} /> Sign In</>
              }
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#A07AAE", marginTop: "24px", fontFamily: "'Outfit', sans-serif" }}>
            New here?{" "}
            <Link to="/signup" style={{ color: "#C47ABE", fontWeight: 700, textDecoration: "none" }}>
              Create an account
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "0.72rem", color: "#C4A8D4", fontFamily: "'Outfit', sans-serif" }}>
          🔒 Your data is encrypted and never shared
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
