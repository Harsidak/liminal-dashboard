import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import PageTransition from "@/components/PageTransition";
import GradientText from "@/components/GradientText";
import BorderGlow from "@/components/BorderGlow";
import { uploadCAS } from "@/lib/api";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Shield, Lock } from "lucide-react";

const UploadCAS = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    holdings_count: number;
    error_message: string | null;
  } | null>(null);

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
    setResult(null);
    try {
      const res = await uploadCAS(file);
      setResult(res);
      if (res.status === "parsed") {
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err: any) {
      setResult({
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
      <AppShell>
        <div className="pt-10 max-w-2xl mx-auto space-y-12 pb-20">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Synchronize Core</h1>
            <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] max-w-sm mx-auto">
              Upload CAS Statement PDF to establish your portfolio link
            </p>
          </div>

          {/* Upload Zone */}
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-rose-100/50 shadow-2xl shadow-rose-500/10 p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-50" />
            
            {/* Drag Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-500 cursor-pointer group ${
                dragActive
                  ? "border-rose-400 bg-rose-50/50"
                  : file
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-rose-100 hover:border-rose-300 hover:bg-rose-50/30"
              }`}
              onClick={() => document.getElementById("cas-file-input")?.click()}
            >
              <input
                id="cas-file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
                    <FileText size={32} className="text-emerald-500 shadow-lg" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-800 tracking-tight">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {(file.size / 1024).toFixed(1)} KB · VALID PDF CORE
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setResult(null);
                    }}
                    className="mt-2 text-[10px] font-black text-rose-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-100 transition-all"
                  >
                    <XCircle size={12} /> Discard File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Upload size={32} className="text-rose-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-800 tracking-tight">
                      Deploy Statement PDF
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Drag & Drop or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {file && !result && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-8 py-5 rounded-[1.25rem] bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Initializing Parser...
                  </>
                ) : (
                  <>
                    <Shield size={18} className="stroke-[2.5]" />
                    Establish Link
                  </>
                )}
              </button>
            )}

            {/* Result */}
            {result && (
              <div className={`mt-8 p-6 rounded-3xl border animate-in slide-in-from-top-4 duration-500 ${
                result.status === "parsed"
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-rose-50 border-rose-100"
              }`}>
                <div className="flex items-center gap-4">
                  {result.status === "parsed" ? (
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <XCircle size={24} className="text-rose-500" />
                    </div>
                  )}
                  <div>
                    {result.status === "parsed" ? (
                      <>
                        <p className="text-sm font-black text-slate-800 tracking-tight">
                          Sync Successful: {result.holdings_count} Core Assets Identified
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          Redirecting to primary dashboard...
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-black text-slate-800 tracking-tight underline decoration-rose-200 decoration-2">Link Interrupted</p>
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-0.5">
                          {result.error_message || "Could not decouple the encrypted core"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/50 p-6 rounded-3xl border border-rose-100/50 flex items-start gap-4 shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-rose-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Encrypted Probe</p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  Your PAN acts as a temporal key for decryption. We never archive your raw identifier.
                </p>
              </div>
            </div>
            <div className="bg-white/50 p-6 rounded-3xl border border-rose-100/50 flex items-start gap-4 shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Lock size={20} className="text-rose-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Volatile Cache</p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  Statement files are obliterated from our nodes immediately after technical decoupling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
};

export default UploadCAS;
