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
        <div className="pt-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <GradientText
              className="text-2xl font-bold mb-2"
              colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
              animationSpeed={8}
            >
              Upload CAS Statement
            </GradientText>
            <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
              Upload your Consolidated Account Statement (CAS) PDF from CDSL or NSDL.
              Your PAN will be used to decrypt the document securely.
            </p>
          </div>

          {/* Upload Zone */}
          <BorderGlow
            borderRadius={24}
            glowColor="258 90 66"
            colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
            fillOpacity={0.3}
          >
            <div className="p-8">
              {/* Drag Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                    : file
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-white/10 hover:border-[#6366F1]/30 hover:bg-white/[0.02]"
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
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
                      <FileText size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {(file.size / 1024).toFixed(1)} KB · PDF
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setResult(null);
                      }}
                      className="text-xs text-[#9CA3AF] hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center">
                      <Upload size={24} className="text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Drop your CAS PDF here
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        or click to browse · PDF only
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
                  className="w-full mt-6 py-3 rounded-xl neon-button text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Parsing your portfolio...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload & Parse
                    </>
                  )}
                </button>
              )}

              {/* Result */}
              {result && (
                <div className={`mt-6 p-4 rounded-xl border ${
                  result.status === "parsed"
                    ? "bg-emerald-400/10 border-emerald-400/20"
                    : "bg-red-400/10 border-red-400/20"
                }`}>
                  <div className="flex items-center gap-3">
                    {result.status === "parsed" ? (
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={20} className="text-red-400 shrink-0" />
                    )}
                    <div>
                      {result.status === "parsed" ? (
                        <>
                          <p className="text-sm font-bold text-emerald-400">
                            Successfully parsed {result.holdings_count} holdings!
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            Redirecting to dashboard...
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-red-400">Upload Failed</p>
                          <p className="text-xs text-[#9CA3AF]">
                            {result.error_message || "Could not parse the CAS PDF"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </BorderGlow>

          {/* Security Info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4 flex items-start gap-3">
              <Shield size={18} className="text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">PAN-Secured Decryption</p>
                <p className="text-[10px] text-[#9CA3AF]">
                  Your PAN is used only to decrypt the PDF and is never stored in plaintext.
                </p>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-start gap-3">
              <Lock size={18} className="text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Data Privacy</p>
                <p className="text-[10px] text-[#9CA3AF]">
                  CAS files are processed server-side and deleted after parsing. Holdings data is stored securely.
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
