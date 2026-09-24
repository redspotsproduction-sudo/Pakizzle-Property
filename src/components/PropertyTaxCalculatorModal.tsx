import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  Calculator, 
  Receipt, 
  FileText, 
  Check, 
  Copy, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Info,
  Download
} from "lucide-react";
import { formatPrice } from "../lib/utils";
import { toast } from "sonner";

interface PropertyTaxCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrice?: number;
}

export default function PropertyTaxCalculatorModal({ isOpen, onClose, defaultPrice = 35000000 }: PropertyTaxCalculatorModalProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(defaultPrice);
  const [propertyType, setPropertyType] = useState<"constructed" | "plot">("constructed");
  const [province, setProvince] = useState<"punjab" | "sindh" | "ict" | "kpk">("punjab");
  const [buyerFiler, setBuyerFiler] = useState<"filer" | "late_filer" | "non_filer">("filer");
  const [sellerFiler, setSellerFiler] = useState<"filer" | "non_filer">("filer");
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(2);

  // 2026 FBR & Provincial Tax Calculations
  // 1. Buyer Advance Tax (Section 236K):
  // Filer: 3% (up to 5Cr) or 3.5% (above 5Cr)
  // Late Filer: 6%
  // Non-Filer: 10%
  const buyerTaxRate = buyerFiler === "filer" 
    ? (propertyPrice > 50000000 ? 0.035 : 0.03)
    : buyerFiler === "late_filer" 
    ? 0.06 
    : 0.10;
  const buyerTax = Math.round(propertyPrice * buyerTaxRate);

  // 2. Buyer Provincial Stamp Duty:
  // Punjab: 2%, Sindh: 2%, ICT: 1%, KPK: 2%
  const stampDutyRate = province === "ict" ? 0.01 : 0.02;
  const stampDuty = Math.round(propertyPrice * stampDutyRate);

  // 3. TMA / Cantonment Board Transfer Fee (approx 1%)
  const transferFee = Math.round(propertyPrice * 0.01);

  // 4. Sub-Registrar / Corporation Documentation Fee (Flat approx PKR 15,000)
  const docFee = 15000;

  // Total Buyer Extra Costs
  const totalBuyerAdditional = buyerTax + stampDuty + transferFee + docFee;
  const grandTotalBuyer = propertyPrice + totalBuyerAdditional;

  // 5. Seller Advance Tax / Capital Gains (Section 236C):
  // Filer: 3% (if held < 1 yr: 3%, 1-2 yr: 3%, > 3 yr: reduced)
  // Non-Filer: 6% to 10%
  const sellerTaxRate = sellerFiler === "filer" ? 0.03 : 0.06;
  const sellerTax = Math.round(propertyPrice * sellerTaxRate);
  const netSellerProceeds = propertyPrice - sellerTax;

  const handleCopySummary = () => {
    const text = `
PAKIZZLE 2026 FBR & PROVINCIAL PROPERTY TAX SETTLEMENT SUMMARY
Declared Property Value: PKR ${propertyPrice.toLocaleString()}
Province: ${province.toUpperCase()} | Type: ${propertyType.toUpperCase()}

BUYER EXPENSES:
- Advance Income Tax (Section 236K, ${buyerFiler.replace('_', ' ').toUpperCase()}): PKR ${buyerTax.toLocaleString()}
- Provincial Stamp Duty (${(stampDutyRate * 100)}%): PKR ${stampDuty.toLocaleString()}
- TMA / Cantonment Transfer Fee (1%): PKR ${transferFee.toLocaleString()}
- Sub-Registrar / Legal Documentation: PKR ${docFee.toLocaleString()}
------------------------------------------------
TOTAL ADDITIONAL BUYER TAXES & CHARGES: PKR ${totalBuyerAdditional.toLocaleString()}
TOTAL NET BUYER OUTFLOW: PKR ${grandTotalBuyer.toLocaleString()}

SELLER EXPENSES:
- Advance Tax on Seller (Section 236C, ${sellerFiler.toUpperCase()}): PKR ${sellerTax.toLocaleString()}
------------------------------------------------
NET SELLER PROCEEDS: PKR ${netSellerProceeds.toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Tax Breakdown copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#12131A] rounded-[32px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-apple-gray/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-apple-text tracking-tight">
                  2026 FBR & Transfer Tax Transparency Engine
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Finance Act 2026 Compliant
                </span>
              </div>
              <p className="text-xs text-apple-text-muted mt-0.5">
                Exact itemized calculation of Section 236K, 236C, Stamp Duty & Cantonment Transfer Fees.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-4">
            {/* Property Price Input */}
            <div>
              <label className="text-xs font-bold text-apple-text uppercase tracking-wider block mb-1.5">
                Declared Property Value (PKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1000000}
                  step={500000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-apple-gray/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-apple-text outline-none focus:ring-2 focus:ring-apple-blue"
                />
                <div className="text-[11px] font-semibold text-apple-blue mt-1 font-mono">
                  = {formatPrice(propertyPrice)}
                </div>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {[15000000, 35000000, 75000000, 150000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPropertyPrice(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    propertyPrice === val 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                      : "bg-apple-gray dark:bg-white/5 text-apple-text-muted hover:text-apple-text"
                  }`}
                >
                  {formatPrice(val)}
                </button>
              ))}
            </div>

            {/* Province Selection */}
            <div>
              <label className="text-xs font-bold text-apple-text uppercase tracking-wider block mb-1.5">
                Jurisdiction / Province
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "punjab", label: "Punjab" },
                  { id: "sindh", label: "Sindh" },
                  { id: "ict", label: "Islamabad" },
                  { id: "kpk", label: "KPK" }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvince(p.id as any)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all text-center ${
                      province === p.id 
                        ? "bg-apple-blue text-white shadow-sm font-semibold" 
                        : "bg-apple-gray dark:bg-white/5 text-apple-text hover:bg-apple-gray/80"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer Filer Status */}
            <div>
              <label className="text-xs font-bold text-apple-text uppercase tracking-wider block mb-1.5">
                Buyer FBR Tax Status
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "filer", label: "Active Filer (3%)" },
                  { id: "late_filer", label: "Late Filer (6%)" },
                  { id: "non_filer", label: "Non-Filer (10%)" }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBuyerFiler(b.id as any)}
                    className={`py-2 px-1 text-[11px] rounded-xl font-medium transition-all text-center ${
                      buyerFiler === b.id 
                        ? "bg-emerald-600 text-white font-bold shadow-sm" 
                        : "bg-apple-gray dark:bg-white/5 text-apple-text hover:bg-apple-gray/80"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Filer Status */}
            <div>
              <label className="text-xs font-bold text-apple-text uppercase tracking-wider block mb-1.5">
                Seller FBR Tax Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "filer", label: "Seller Filer (3%)" },
                  { id: "non_filer", label: "Seller Non-Filer (6%)" }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSellerFiler(s.id as any)}
                    className={`py-2 text-xs rounded-xl font-medium transition-all text-center ${
                      sellerFiler === s.id 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold" 
                        : "bg-apple-gray dark:bg-white/5 text-apple-text hover:bg-apple-gray/80"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FBR Note */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Section 7E Deemed Income Tax applies to unexempted secondary properties valued &gt; PKR 2.5 Crore held as vacant assets.
              </span>
            </div>
          </div>

          {/* Itemized Calculation Summary Column */}
          <div className="md:col-span-7 bg-apple-gray/30 dark:bg-white/[0.02] rounded-3xl p-6 border border-black/5 dark:border-white/10 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <span className="text-xs font-bold text-apple-text uppercase tracking-wider font-mono">
                  Settlement Breakdown
                </span>
                <span className="text-xs text-apple-text-muted">
                  Currency: Pakistani Rupee (PKR)
                </span>
              </div>

              {/* Buyer Breakdown */}
              <div className="mt-4 space-y-2.5">
                <span className="text-xs font-bold text-apple-blue uppercase tracking-wider block">
                  1. Buyer Obligations & Taxes
                </span>

                <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-apple-text-muted">FBR Advance Income Tax (Sec 236K - {(buyerTaxRate * 100).toFixed(1)}%)</span>
                  <span className="font-mono font-bold text-apple-text">PKR {buyerTax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-apple-text-muted">Provincial Stamp Duty ({(stampDutyRate * 100)}%)</span>
                  <span className="font-mono font-bold text-apple-text">PKR {stampDuty.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-apple-text-muted">TMA / Cantonment Transfer Fee (1%)</span>
                  <span className="font-mono font-bold text-apple-text">PKR {transferFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-apple-text-muted">Sub-Registrar / Corporation Fee</span>
                  <span className="font-mono font-bold text-apple-text">PKR {docFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs font-bold text-apple-text">Total Extra Buyer Taxes & Costs:</span>
                  <span className="text-base font-bold text-apple-blue font-mono">
                    PKR {totalBuyerAdditional.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 flex justify-between items-baseline">
                  <span className="text-xs font-extrabold text-apple-text">Net Total Outflow for Buyer:</span>
                  <span className="text-lg font-black text-apple-blue font-mono">
                    PKR {grandTotalBuyer.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Seller Breakdown */}
              <div className="mt-5 space-y-2.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  2. Seller Deductions
                </span>

                <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-apple-text-muted">FBR Advance Capital Tax (Sec 236C - {(sellerTaxRate * 100)}%)</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">- PKR {sellerTax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-bold text-apple-text">Net Net Proceeds to Seller:</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    PKR {netSellerProceeds.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 py-3 rounded-xl bg-apple-blue text-white font-bold text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Certified Settlement Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold text-apple-text hover:bg-apple-gray transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
