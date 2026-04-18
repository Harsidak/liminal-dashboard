import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import { useAuth } from "@/hooks/useAuth";
import { getCASUploads, uploadCAS } from "@/lib/api";
import {
  User, Mail, CreditCard, LogOut, FileText, CheckCircle2, XCircle, Clock,
  Upload, Loader2, Shield, Lock,
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

  // CAS upload state
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    status: string;
    holdings_count: number;
    error_message: string | null;
  } | null>(null);

  useEffect(() => {
    getCASUploads().then(setUploads).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // CAS upload handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type === "application/pdf") setFile(f);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await uploadCAS(file);
      setUploadResult(res);
      if (res.status === "parsed") {
        // refresh upload history
        getCASUploads().then(setUploads).catch(() => {});
        setTimeout(() => {
          setFile(null);
          setUploadResult(null);
        }, 3000);
      }
    } catch (err: any) {
      setUploadResult({
        status: "failed",
        holdings_count: 0,
        error_message: err.message || "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#6366F1]/30 to-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-4 ring-2 ring-[#8B5CF6]/30">
            <span className="text-2xl font-bold text-white">
              {user?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "??"}
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

        {/* ─── CAS Upload Widget ─── */}
        <div className="mb-6">
          <BorderGlow
            borderRadius={24}
            glowColor="258 90 66"
            colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
            fillOpacity={0.2}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#6366F1]/15 flex items-center justify-center">
                  <Upload size={18} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upload CAS Statement</h3>
                  <p className="text-[10px] text-[#9CA3AF]">Drop your CDSL/NSDL PDF to import holdings</p>
                </div>
              </div>

              {/* Drag Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                    : file
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-white/10 hover:border-[#6366F1]/30 hover:bg-white/[0.02]"
                }`}
                onClick={() => document.getElementById("cas-file-input-profile")?.click()}
              >
                <input
                  id="cas-file-input-profile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={20} className="text-emerald-400" />
                    <p className="text-xs font-bold text-white">{file.name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setUploadResult(null); }}
                      className="text-[10px] text-[#9CA3AF] hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={20} className="text-[#8B5CF6]" />
                    <p className="text-xs text-white">Drop CAS PDF here</p>
                    <p className="text-[10px] text-[#9CA3AF]">or click to browse · PDF only</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {file && !uploadResult && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full mt-4 py-2.5 rounded-xl neon-button text-white font-semibold text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload & Parse
                    </>
                  )}
                </button>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <div className={`mt-4 p-3 rounded-xl border text-xs ${
                  uploadResult.status === "parsed"
                    ? "bg-emerald-400/10 border-emerald-400/20"
                    : "bg-red-400/10 border-red-400/20"
                }`}>
                  <div className="flex items-center gap-2">
                    {uploadResult.status === "parsed" ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-red-400 shrink-0" />
                    )}
                    <p className={uploadResult.status === "parsed" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {uploadResult.status === "parsed"
                        ? `Parsed ${uploadResult.holdings_count} holdings!`
                        : uploadResult.error_message || "Upload failed"}
                    </p>
                  </div>
                </div>
              )}

              {/* Security badges */}
              <div className="mt-4 flex gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
                  <Shield size={10} className="text-[#8B5CF6]" />
                  PAN-secured
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
                  <Lock size={10} className="text-[#8B5CF6]" />
                  Encrypted
                </div>
              </div>
            </div>
          </BorderGlow>
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
    </PageTransition>
  );
};

export default Profile;
