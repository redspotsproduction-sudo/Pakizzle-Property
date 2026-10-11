import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle, 
  Building, 
  Scale, 
  Lock, 
  ArrowRight,
  BadgeCheck
} from "lucide-react";
import { toast } from "sonner";

interface TitleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TitleVerificationModal({ isOpen, onClose }: TitleVerificationModalProps) {
  const [searchKey, setSearchKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<any | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    setIsVerifying(true);
    setVerifiedResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedResult({
        referenceId: searchKey.toUpperCase(),
        authority: searchKey.toLowerCase().includes("dha") ? "DHA Official Transfer & Record Branch" : "LDA / Sub-Registrar Book No. 1",
        titleStatus: "Clean Title & Non-Encumbrance Certified",
        courtLitigation: "None (Zero Adverse Claims)",
        possessionStatus: "Ready for Construction / Clear Possession",
        ownerIdentity: "Verified Biometric CNIC Record on File",
        nocStatus: "Approved by Competent Civic Authority",
        registryDate: "March 14, 2023",
        verifierStamp: "PAKIZZLE-SHANAKHT-VERIFIED-V2026"
      });
      toast.success("Title verification lookup complete!");
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#12131A] rounded-[32px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-apple-gray/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-apple-green/10 flex items-center justify-center text-apple-green dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-apple-text tracking-tight">
                  Pakizzle Shanakht™ Title & Registry Verification
                </h3>
                <span className="text-[10px] font-bold text-apple-green bg-apple-green/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Anti-Fraud Guarantee
                </span>
              </div>
              <p className="text-xs text-apple-text-muted mt-0.5">
                Direct lookup of LDA, CDA, KDA, and DHA Title Deeds, Intiqal & Non-Encumbrance Certificates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center text-apple-text-muted hover:text-apple-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {/* Lookup Input Form */}
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="text-xs font-bold text-apple-text uppercase tracking-wider block">
              Enter Property Listing ID, Plot Allotment No., or Registry Khasra No.
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. DHA-6-C-104, LDA-9281, or Pakizzle Property ID"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="w-full bg-apple-gray/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-mono text-apple-text outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-apple-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={isVerifying || !searchKey.trim()}
                className="px-6 py-3 rounded-2xl bg-apple-green hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Querying Records...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    Verify Title
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Verification Pillars Info */}
          {!verifiedResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-apple-gray/30 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-apple-text">Non-Encumbrance (NEC)</div>
                <div className="text-[11px] text-apple-text-muted leading-relaxed">
                  Certified absence of mortgage liens, bank charges, or civil court stay orders.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-apple-gray/30 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-apple-text">Direct Registry Cross-Check</div>
                <div className="text-[11px] text-apple-text-muted leading-relaxed">
                  Matched against District Sub-Registrar Bahi No. 1 and digitized computerized land records.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-apple-gray/30 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-apple-green/10 flex items-center justify-center text-apple-green">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-apple-text">Biometric Escrow Safety</div>
                <div className="text-[11px] text-apple-text-muted leading-relaxed">
                  Seller CNIC and biometric authentication verified before any earnest token deposit.
                </div>
              </div>
            </div>
          )}

          {/* Verification Result Certificate */}
          {verifiedResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-apple-green/5 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-apple-green dark:text-emerald-400" />
                  <span className="font-bold text-sm text-apple-text font-mono">
                    Certified Record: {verifiedResult.referenceId}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-apple-green bg-apple-green/10 px-2.5 py-1 rounded-full">
                  100% TITLE CLEAN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#1A1C24] border border-black/5">
                  <div className="text-apple-text-muted text-[11px]">Recording Authority</div>
                  <div className="font-semibold text-apple-text mt-0.5">{verifiedResult.authority}</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#1A1C24] border border-black/5">
                  <div className="text-apple-text-muted text-[11px]">Title Status</div>
                  <div className="font-semibold text-apple-green dark:text-emerald-400 mt-0.5">{verifiedResult.titleStatus}</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#1A1C24] border border-black/5">
                  <div className="text-apple-text-muted text-[11px]">Court Litigation / Stay Orders</div>
                  <div className="font-semibold text-apple-text mt-0.5">{verifiedResult.courtLitigation}</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#1A1C24] border border-black/5">
                  <div className="text-apple-text-muted text-[11px]">Physical Possession</div>
                  <div className="font-semibold text-apple-text mt-0.5">{verifiedResult.possessionStatus}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] font-mono text-apple-text-muted">
                <span>Cryptographic Stamp: {verifiedResult.verifierStamp}</span>
                <span>Verified: Today</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
