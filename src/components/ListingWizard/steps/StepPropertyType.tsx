import React from "react";
import { Home, Building2, Layers, Sparkles, Building } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ListingWizardState, ListingPurpose, PropertyTypeSlug } from "../types";

interface StepPropertyTypeProps {
  state: ListingWizardState;
  updateState: (updates: Partial<ListingWizardState>) => void;
  onNext: () => void;
}

const PROPERTY_TYPES: Array<{
  id: PropertyTypeSlug;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}> = [
  {
    id: "house",
    title: "House / Villa",
    desc: "Bespoke residences, independent bungalows, and modern duplexes",
    icon: Home,
    tag: "Most Popular",
  },
  {
    id: "apartment",
    title: "Flat / Apartment",
    desc: "Luxury residential towers, high-rises, and managed serviced flats",
    icon: Building2,
    tag: "High Yield",
  },
  {
    id: "plot",
    title: "Plot & Land",
    desc: "Residential, commercial, and investment development plots",
    icon: Layers,
    tag: "Capital Growth",
  },
  {
    id: "commercial",
    title: "Commercial Plaza",
    desc: "Corporate office floors, retail shops, and commercial buildings",
    icon: Building,
    tag: "Commercial",
  },
  {
    id: "penthouse",
    title: "Sky Penthouse",
    desc: "Top-floor duplex luxury residences with panoramic private terraces",
    icon: Sparkles,
    tag: "Ultra Luxury",
  },
];

export const StepPropertyType: React.FC<StepPropertyTypeProps> = ({
  state,
  updateState,
  onNext,
}) => {
  const handlePurposeChange = (purpose: ListingPurpose) => {
    updateState({ purpose });
  };

  const handleTypeSelect = (propertyType: PropertyTypeSlug) => {
    updateState({ propertyType });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight mb-2">
          What are you listing?
        </h2>
        <p className="text-sm text-apple-text-muted leading-relaxed">
          Select your listing purpose and property typology to configure appropriate legal compliance fields.
        </p>
      </div>

      {/* 1. Purpose Pill Toggle (For Sale vs For Rent) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
          Listing Purpose
        </label>
        <div className="inline-flex p-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-apple-border/40 shadow-inner">
          <button
            type="button"
            onClick={() => handlePurposeChange("for-sale")}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none",
              state.purpose === "for-sale"
                ? "pakizzle-button-primary text-white shadow-md scale-102"
                : "text-apple-text-muted hover:text-apple-text"
            )}
          >
            Sell Property
          </button>
          <button
            type="button"
            onClick={() => handlePurposeChange("for-rent")}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none",
              state.purpose === "for-rent"
                ? "pakizzle-button-primary text-white shadow-md scale-102"
                : "text-apple-text-muted hover:text-apple-text"
            )}
          >
            Rent Out Property
          </button>
        </div>
      </div>

      {/* 2. Visual Property Type Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
          Select Property Typology
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PROPERTY_TYPES.map((type) => {
            const isSelected = state.propertyType === type.id;
            const Icon = type.icon;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeSelect(type.id)}
                className={cn(
                  "group relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 cursor-pointer",
                  isSelected
                    ? "bg-[#5B2A86]/5 dark:bg-[#5B2A86]/15 border-[#5B2A86] dark:border-[#C9A227] shadow-[0_4px_20px_rgba(91,42,134,0.12)] scale-[1.01]"
                    : "bg-white/80 dark:bg-white/5 border-apple-border/40 hover:border-[#5B2A86]/40 hover:bg-black/[0.02]"
                )}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "pakizzle-button-primary text-white shadow-md"
                      : "bg-black/5 dark:bg-white/10 text-[#5B2A86] dark:text-[#FAF3E6] group-hover:scale-105"
                  )}
                >
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-apple-text tracking-tight truncate">
                      {type.title}
                    </h3>
                  </div>
                  <p className="text-xs text-apple-text-muted leading-relaxed line-clamp-2">
                    {type.desc}
                  </p>
                </div>

                {/* Tag Chip */}
                <span
                  className={cn(
                    "absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors",
                    isSelected
                      ? "bg-[#5B2A86] text-white border-[#5B2A86]"
                      : "bg-black/5 dark:bg-white/5 text-apple-text-muted border-apple-border/40"
                  )}
                >
                  {type.tag}
                </span>

                {/* Radio checkmark circle */}
                <div
                  className={cn(
                    "absolute bottom-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    isSelected
                      ? "border-[#5B2A86] dark:border-[#C9A227] bg-[#5B2A86] dark:bg-[#C9A227]"
                      : "border-apple-border"
                  )}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Action */}
      <div className="pt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={onNext}
          className="h-12 px-8 rounded-full pakizzle-button-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Continue to Location →
        </button>
      </div>
    </div>
  );
};

export default StepPropertyType;
