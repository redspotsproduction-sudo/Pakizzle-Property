import React, { useState } from "react";
import { 
  Maximize2, 
  Bed, 
  Bath, 
  Check, 
  AlertCircle, 
  Plus, 
  Minus,
  Sparkles
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { ListingWizardState, AreaUnit, PropertyCondition, FurnishedStatus, convertToSqFt } from "../types";

interface StepDetailsProps {
  state: ListingWizardState;
  updateState: (updates: Partial<ListingWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const UNITS: Array<{ id: AreaUnit; label: string }> = [
  { id: "marla", label: "Marla" },
  { id: "kanal", label: "Kanal" },
  { id: "sqft", label: "Sq. Ft." },
];

export const StepDetails: React.FC<StepDetailsProps> = ({
  state,
  updateState,
  onNext,
  onBack,
}) => {
  const [sizeError, setSizeError] = useState<string | null>(null);

  const isPlot = state.propertyType === "plot";
  const isCommercial = state.propertyType === "commercial";

  const handleUnitChange = (unit: AreaUnit) => {
    const currentNum = typeof state.size === "number" ? state.size : 0;
    const newSqFt = convertToSqFt(currentNum, unit);
    updateState({
      sizeUnit: unit,
      sizeSqFt: newSqFt,
    });
  };

  const handleSizeChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      updateState({ size: "", sizeSqFt: 0 });
      setSizeError("Please enter a valid positive property size.");
      return;
    }

    // Range constraints by unit
    if (state.sizeUnit === "marla" && (num < 1 || num > 500)) {
      setSizeError("Marla size typically ranges between 1 and 500.");
    } else if (state.sizeUnit === "kanal" && (num < 0.5 || num > 100)) {
      setSizeError("Kanal size typically ranges between 0.5 and 100.");
    } else if (state.sizeUnit === "sqft" && (num < 100 || num > 200000)) {
      setSizeError("Square footage must be between 100 and 200,000.");
    } else {
      setSizeError(null);
    }

    const calculatedSqFt = convertToSqFt(num, state.sizeUnit);
    updateState({
      size: num,
      sizeSqFt: calculatedSqFt,
    });
  };

  const handleBedroomStep = (delta: number) => {
    const current = state.bedrooms;
    const nextVal = Math.max(0, Math.min(15, current + delta));
    updateState({ bedrooms: nextVal });
  };

  const handleBathroomStep = (delta: number) => {
    const current = state.bathrooms;
    const nextVal = Math.max(0, Math.min(15, current + delta));
    updateState({ bathrooms: nextVal });
  };

  const handleContinue = () => {
    if (!state.size || typeof state.size !== "number" || state.size <= 0) {
      setSizeError("Size is required before proceeding.");
      return;
    }
    if (sizeError) return;
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight mb-2">
          Property Specifications & Layout
        </h2>
        <p className="text-sm text-apple-text-muted leading-relaxed">
          Provide accurate dimensions and configuration. Standardized specs ensure your listing receives maximum search visibility.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Size & Unit Segmented Switch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Property Area / Size <span className="text-[#D93A45]">*</span>
            </label>
            {state.sizeSqFt > 0 && state.sizeUnit !== "sqft" && (
              <span className="text-xs font-semibold text-[#5B2A86] dark:text-[#F0A830]">
                ≈ {state.sizeSqFt.toLocaleString()} Sq.Ft. Equivalent
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Numeric Size Input */}
            <div className="relative flex-1">
              <input
                type="number"
                step="any"
                min="0.1"
                value={state.size}
                onChange={(e) => handleSizeChange(e.target.value)}
                placeholder="e.g. 10 or 1"
                className={cn(
                  "w-full h-14 pl-4 pr-12 rounded-2xl border bg-white/80 dark:bg-white/5 text-apple-text text-base font-bold font-mono focus:outline-none transition-all",
                  sizeError
                    ? "border-[#D93A45] focus:ring-4 focus:ring-[#D93A45]/10"
                    : "border-apple-border/50 focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-apple-text-muted uppercase">
                {state.sizeUnit}
              </span>
            </div>

            {/* Segmented Unit Pill Switch */}
            <div className="inline-flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-apple-border/40 shrink-0">
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleUnitChange(u.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none",
                    state.sizeUnit === u.id
                      ? "bg-white dark:bg-[#1A1526] text-[#5B2A86] dark:text-[#FAF3E6] shadow-sm font-extrabold"
                      : "text-apple-text-muted hover:text-apple-text"
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {sizeError && (
            <p className="text-xs font-semibold text-[#D93A45] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {sizeError}
            </p>
          )}
        </div>

        {/* 2. Bedrooms & Bathrooms Steppers (Disabled for Plots) */}
        {!isPlot && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Bedrooms Stepper */}
            <div className="p-4 rounded-2xl border border-apple-border/40 bg-white/60 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5B2A86]/10 flex items-center justify-center text-[#5B2A86] dark:text-[#FAF3E6]">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
                    Bedrooms
                  </span>
                  <span className="text-lg font-bold text-apple-text font-mono">
                    {state.bedrooms} {state.bedrooms === 1 ? "Bed" : "Beds"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBedroomStep(-1)}
                  disabled={state.bedrooms <= 0}
                  className="w-9 h-9 rounded-full border border-apple-border flex items-center justify-center text-apple-text hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                  aria-label="Decrease bedrooms"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleBedroomStep(1)}
                  disabled={state.bedrooms >= 15}
                  className="w-9 h-9 rounded-full border border-apple-border flex items-center justify-center text-apple-text hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                  aria-label="Increase bedrooms"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bathrooms Stepper */}
            <div className="p-4 rounded-2xl border border-apple-border/40 bg-white/60 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5B2A86]/10 flex items-center justify-center text-[#5B2A86] dark:text-[#FAF3E6]">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
                    Bathrooms
                  </span>
                  <span className="text-lg font-bold text-apple-text font-mono">
                    {state.bathrooms} {state.bathrooms === 1 ? "Bath" : "Baths"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBathroomStep(-1)}
                  disabled={state.bathrooms <= 0}
                  className="w-9 h-9 rounded-full border border-apple-border flex items-center justify-center text-apple-text hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                  aria-label="Decrease bathrooms"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleBathroomStep(1)}
                  disabled={state.bathrooms >= 15}
                  className="w-9 h-9 rounded-full border border-apple-border flex items-center justify-center text-apple-text hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                  aria-label="Increase bathrooms"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Furnished Status & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Furnished Status (if residential/commercial) */}
          {!isPlot && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
                Furnished Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["furnished", "semi-furnished", "unfurnished"] as FurnishedStatus[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => updateState({ furnished: f })}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize text-center truncate",
                      state.furnished === f
                        ? "bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#FAF3E6] border-[#5B2A86] dark:border-[#C9A227] shadow-xs"
                        : "bg-white/80 dark:bg-white/5 border-apple-border/40 text-apple-text-muted hover:border-apple-border"
                    )}
                  >
                    {f.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Construction Condition */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Property Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["ready", "under_construction", "off_plan"] as PropertyCondition[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateState({ condition: c })}
                  className={cn(
                    "py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize text-center truncate",
                    state.condition === c
                      ? "bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#FAF3E6] border-[#5B2A86] dark:border-[#C9A227] shadow-xs"
                      : "bg-white/80 dark:bg-white/5 border-apple-border/40 text-apple-text-muted hover:border-apple-border"
                  )}
                >
                  {c.replace("_", " ")}
                </button>
              ))}
            </div>
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
          Continue to Photos →
        </button>
      </div>
    </div>
  );
};

export default StepDetails;
