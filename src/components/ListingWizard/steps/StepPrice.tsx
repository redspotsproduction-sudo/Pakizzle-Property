import React, { useState } from "react";
import { 
  DollarSign, 
  ShieldCheck, 
  Info, 
  AlertCircle, 
  Check, 
  HelpCircle 
} from "lucide-react";
import { cn, formatPrice } from "../../../lib/utils";
import { ListingWizardState } from "../types";

interface StepPriceProps {
  state: ListingWizardState;
  updateState: (updates: Partial<ListingWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TITLE_DEED_OPTIONS = [
  {
    id: "lda_approved" as const,
    title: "LDA / CDA / RDA Approved",
    desc: "Development authority verified non-encumbrance & approved map layout",
    badge: "Maximum Trust",
  },
  {
    id: "dha_transfer" as const,
    title: "DHA Direct Transfer Allotment",
    desc: "Clear DHA allocation/intimation letter ready for direct transfer",
    badge: "High Liquidity",
  },
  {
    id: "registry_inteqal" as const,
    title: "Fard / Registry & Inteqal",
    desc: "Sub-registrar mutation record & official land revenue transfer",
    badge: "Official Deed",
  },
  {
    id: "unverified" as const,
    title: "Standard Ownership Document",
    desc: "Private developer file or society membership undergoing verification",
    badge: "Basic",
  },
];

export const StepPrice: React.FC<StepPriceProps> = ({
  state,
  updateState,
  onNext,
  onBack,
}) => {
  const [priceError, setPriceError] = useState<string | null>(null);

  const isRent = state.purpose === "for-rent";
  const minValidPrice = isRent ? 5000 : 500000; // 5k rent or 5 Lacs sale

  // Format verbal PKR breakdown (e.g. 4.5 Crore, 85 Lacs)
  const getVerbalPrice = (amount: number | ""): string => {
    if (!amount || typeof amount !== "number" || amount <= 0) return "";
    if (amount >= 10000000) {
      const crore = (amount / 10000000).toFixed(2);
      return `${crore} Crore PKR`;
    }
    if (amount >= 100000) {
      const lac = (amount / 100000).toFixed(2);
      return `${lac} Lac PKR`;
    }
    return `${amount.toLocaleString()} PKR`;
  };

  const handlePriceChange = (val: string) => {
    const rawVal = val.replace(/,/g, "").trim();
    if (!rawVal) {
      updateState({ price: "" });
      setPriceError("Price is required.");
      return;
    }

    const num = parseFloat(rawVal);
    if (isNaN(num) || num <= 0) {
      updateState({ price: "" });
      setPriceError("Please enter a valid positive numerical price.");
      return;
    }

    if (num < minValidPrice) {
      setPriceError(
        isRent
          ? "Monthly rental price must be at least PKR 5,000."
          : "Property sale price must be at least PKR 500,000 (5 Lacs)."
      );
    } else if (num > 5000000000) {
      // 5 Billion cap
      setPriceError("Price exceeds platform transaction threshold.");
    } else {
      setPriceError(null);
    }

    updateState({ price: num });
  };

  const handleContinue = () => {
    if (!state.price || typeof state.price !== "number" || state.price <= 0) {
      setPriceError("Please provide an asking price before continuing.");
      return;
    }
    if (priceError) return;
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight mb-2">
          Pricing & Legal Title Status
        </h2>
        <p className="text-sm text-apple-text-muted leading-relaxed">
          Transparent pricing and verified title clearance unlock the Shanakht™ verified buyer shield.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Asking Price Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Asking Price ({isRent ? "Monthly Rent in PKR" : "Total Price in PKR"}) <span className="text-[#D93A45]">*</span>
            </label>
            {typeof state.price === "number" && state.price > 0 && (
              <span className="text-xs font-bold text-[#5B2A86] dark:text-[#F0A830]">
                {getVerbalPrice(state.price)}
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-apple-text-muted">
              PKR
            </div>

            <input
              type="number"
              step="1000"
              value={state.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder={isRent ? "e.g. 150000" : "e.g. 45000000"}
              className={cn(
                "w-full h-14 pl-14 pr-24 rounded-2xl border bg-white/80 dark:bg-white/5 text-apple-text text-base font-bold font-mono focus:outline-none transition-all",
                priceError
                  ? "border-[#D93A45] focus:ring-4 focus:ring-[#D93A45]/10"
                  : "border-apple-border/50 focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10"
              )}
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-apple-text-muted">
              {isRent ? "/ month" : "Lump sum"}
            </span>
          </div>

          {priceError && (
            <p className="text-xs font-semibold text-[#D93A45] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {priceError}
            </p>
          )}

          {/* Negotiable Checkbox */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={state.isPriceNegotiable}
                onChange={(e) => updateState({ isPriceNegotiable: e.target.checked })}
                className="w-4 h-4 rounded text-[#5B2A86] focus:ring-[#5B2A86] accent-[#5B2A86] cursor-pointer"
              />
              <span className="text-xs font-medium text-apple-text">
                Price is negotiable upon meeting with serious, verified buyers
              </span>
            </label>
          </div>
        </div>

        {/* 2. Title Deed / Documentation Clearance */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Title Deed & Registry Status
            </label>
            <span className="text-[11px] text-apple-text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5FA84C]" />
              Informs LQI trust ranking
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TITLE_DEED_OPTIONS.map((opt) => {
              const isSelected = state.titleDeedStatus === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateState({ titleDeedStatus: opt.id })}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2",
                    isSelected
                      ? "bg-[#5B2A86]/5 dark:bg-[#5B2A86]/15 border-[#5B2A86] dark:border-[#C9A227] shadow-sm ring-1 ring-[#5B2A86] dark:ring-[#C9A227]"
                      : "bg-white/80 dark:bg-white/5 border-apple-border/40 hover:border-apple-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-apple-text tracking-tight">
                      {opt.title}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                        isSelected
                          ? "bg-[#5B2A86] text-white border-[#5B2A86]"
                          : "bg-black/5 dark:bg-white/5 text-apple-text-muted border-apple-border/30"
                      )}
                    >
                      {opt.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-apple-text-muted leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Valuation Guidance Info Box */}
        <div className="p-4 rounded-2xl bg-[#5B2A86]/5 dark:bg-[#5B2A86]/10 border border-[#5B2A86]/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#5B2A86] dark:text-[#F0A830] shrink-0 mt-0.5" />
          <div className="text-xs text-apple-text-muted leading-relaxed">
            <span className="font-bold text-apple-text block mb-0.5">
              Shanakht™ Automated Market Valuation:
            </span>
            Based on recent verified transactions in {state.areaName || state.city}, pricing this {state.size} {state.sizeUnit} {state.propertyType} competitively attracts 3x higher inquiries. You can adjust your price at any time from your Seller Dashboard.
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-full border border-apple-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs text-apple-text transition-all cursor-pointer"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="h-12 px-8 rounded-full pakizzle-button-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  );
};

export default StepPrice;
