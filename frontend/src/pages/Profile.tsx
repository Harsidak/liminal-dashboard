import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getCASUploads } from "@/lib/api";
import { useState, useEffect } from "react";
import {
  User, Mail, CreditCard, LogOut, FileText, CheckCircle2, XCircle, Clock,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Array<{
    id: string;
    filename: string;
    status: string;
    holdings_count: number;
    upload_date: string;
  }>>([]);

  useEffect(() => {
    getCASUploads().then(setUploads).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PageTransition>
      <AppShell>
        <div className="pt-6 max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#6366F1]/30 to-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-4 ring-2 ring-[#8B5CF6]/30">
              <span className="text-2xl font-bold text-white">
                {user?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
              </span>
            </div>
            <GradientText
              className="text-xl font-bold mb-1"
              colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
              animationSpeed={8}
            >
              {user?.full_name || "User"}
            </GradientText>
            <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
          </div>

          {/* Account Details */}
          <div className="glass-strong rounded-2xl overflow-hidden mb-6">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-base font-bold text-white">Account Details</h3>
            </div>
            <div className="p-2">
              {[
                { icon: User, label: "Full Name", value: user?.full_name || "Not set" },
                { icon: Mail, label: "Email", value: user?.email || "—" },
                { icon: CreditCard, label: "PAN Status", value: user?.has_pan ? "Verified ✓" : "Not set" },
                { icon: Clock, label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Icon size={14} className="text-[#8B5CF6]" />
                    </div>
                    <p className="text-xs text-[#9CA3AF]">{label}</p>
                  </div>
                  <p className="text-xs text-white font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload History */}
          <div className="glass-strong rounded-2xl overflow-hidden mb-6">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-base font-bold text-white">CAS Upload History</h3>
              <p className="text-[10px] text-[#9CA3AF]">{uploads.length} uploads</p>
            </div>
            <div className="p-2">
              {uploads.length === 0 ? (
                <p className="text-sm text-[#9CA3AF] text-center py-6">No CAS uploads yet</p>
              ) : (
                uploads.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        u.status === "parsed" ? "bg-emerald-400/10" : "bg-red-400/10"
                      }`}>
                        {u.status === "parsed" ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : (
                          <XCircle size={14} className="text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-[#9CA3AF]" />
                          <p className="text-xs font-medium text-white">{u.filename}</p>
                        </div>
                        <p className="text-[10px] text-[#9CA3AF]">
                          {new Date(u.upload_date).toLocaleDateString("en-IN")} · {u.holdings_count} holdings
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      u.status === "parsed"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-red-400/10 text-red-400"
                    }`}>
                      {u.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-xl glass hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 text-[#9CA3AF] hover:text-red-400"
          >
            <LogOut size={16} />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </AppShell>
    </PageTransition>
  );
};

export default Profile;
