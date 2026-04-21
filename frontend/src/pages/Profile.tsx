import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import { useAuth } from "@/hooks/useAuth";
import { getCASUploads, uploadCAS } from "@/lib/api";
import {
  User, Mail, CreditCard, LogOut, FileText, CheckCircle2, XCircle, Clock,
  Upload, Loader2, Shield, Lock, Plus,
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
        <div className="text-center mb-12">
          <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/10 border border-rose-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm group-hover:opacity-0 transition-opacity" />
            <span className="text-4xl font-black text-rose-500 relative z-10 tracking-tighter">
              {user?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "??"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            {user?.full_name || "Account Profile"}
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100">
            <Mail size={12} className="text-rose-400" />
            <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.2em]">{user?.email}</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-3xl border border-rose-100/50 rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl shadow-rose-500/5">
          <div className="p-5 border-b border-rose-50">
            <h3 className="text-base font-black text-slate-800">Account Details</h3>
          </div>
          <div className="p-3">
            {[
              { icon: User, label: "Full Name", value: user?.full_name || "Not set" },
              { icon: Mail, label: "Email", value: user?.email || "—" },
              { icon: CreditCard, label: "PAN Status", value: user?.has_pan ? "Verified ✓" : "Not set" },
              { icon: Clock, label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50/50 transition-all border border-transparent hover:border-rose-100">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center shadow-inner">
                    <Icon size={16} className="text-rose-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
                </div>
                <p className="text-sm text-slate-700 font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CAS Upload Widget ─── */}
        <div className="mb-6">
          <BorderGlow
            borderRadius={24}
            glowColor="345 100 50"
            colors={["#FB7185", "#F43F5E", "#FFF1F2"]}
            fillOpacity={0.05}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center shadow-inner">
                  <Upload size={20} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Import Holdings</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">CDSL/NSDL PDF Import</p>
                </div>
              </div>

              {/* Drag Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-500 cursor-pointer ${
                  dragActive
                    ? "border-rose-400 bg-rose-50 shadow-inner"
                    : file
                    ? "border-emerald-400/50 bg-emerald-50"
                    : "border-rose-100 hover:border-rose-300 hover:bg-rose-50/30"
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
                  <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
                    <FileText size={24} className="text-emerald-500" />
                    <p className="text-sm font-black text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setUploadResult(null); }}
                      className="text-[10px] text-slate-400 hover:text-rose-500 font-black uppercase tracking-[0.2em] transition-colors mt-2"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-1">
                       <Plus size={20} className="stroke-[3]" />
                    </div>
                    <p className="text-sm font-black text-slate-700">Drop CAS Statement</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">or browse your files</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {file && !uploadResult && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full mt-6 py-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-rose-200"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Parsing Intelligence...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="stroke-[3]" />
                      Process Statement
                    </>
                  )}
                </button>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <div className={`mt-6 p-4 rounded-2xl border ${
                  uploadResult.status === "parsed"
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-rose-50 border-rose-100"
                }`}>
                  <div className="flex items-center gap-3">
                    {uploadResult.status === "parsed" ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-rose-500 shrink-0" />
                    )}
                    <p className={`text-xs font-black uppercase tracking-tight ${uploadResult.status === "parsed" ? "text-emerald-600" : "text-rose-600"}`}>
                      {uploadResult.status === "parsed"
                        ? `Parsed ${uploadResult.holdings_count} assets successfully!`
                        : uploadResult.error_message || "Upload Failed"}
                    </p>
                  </div>
                </div>
              )}

              {/* Security badges */}
              <div className="mt-8 flex gap-4 justify-center">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Shield size={12} className="text-rose-400" />
                  PAN Protected
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Lock size={12} className="text-rose-400" />
                  TLS Encrypted
                </div>
              </div>
            </div>
          </BorderGlow>
        </div>

        {/* Upload History */}
        <div className="bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-3xl overflow-hidden mb-8 shadow-xl shadow-rose-500/5">
          <div className="p-6 border-b border-rose-50">
            <h3 className="text-base font-black text-slate-800">Import History</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{uploads.length} verified logs</p>
          </div>
          <div className="p-3">
            {uploads.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-10 italic">No activity detected</p>
            ) : (
              uploads.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50/50 transition-all border border-transparent hover:border-rose-100">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-inner ${
                      u.status === "parsed" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {u.status === "parsed" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={12} className="text-slate-400" />
                        <p className="text-sm font-bold text-slate-700">{u.filename}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(u.upload_date).toLocaleDateString("en-IN")} · {u.holdings_count} assets
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl ${
                    u.status === "parsed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
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
          className="w-full p-5 rounded-[2rem] bg-white/80 hover:bg-rose-50 border border-rose-100/50 backdrop-blur-xl transition-all flex items-center justify-center gap-3 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-rose-500/5"
        >
          <LogOut size={16} className="stroke-[3]" />
          <span>Sign Out Securely</span>
        </button>
      </div>
    </PageTransition>
  );
};

export default Profile;
