import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldCheck, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Eye
} from "lucide-react";
import { cn, formatPrice } from "../../lib/utils";
import { ListingWizardState } from "./types";
import Badge from "../Badge";

interface PreviewCardProps {
  state: ListingWizardState;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ state }) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Cover photo resolution
  const coverPhoto = state.photos.find(p => p.isCover)?.url || state.photos[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200";
  
  const displayLocation = state.areaName 
    ? `${state.areaName}, ${state.city}`
    : state.city;

  const displayPrice = typeof state.price === "number" && state.price > 0 
    ? formatPrice(state.price) 
    : "Price on Request";

  const isPlot = state.propertyType === "plot";
  const isCommercial = state.propertyType === "commercial";

  const CardContent = (
    <div className="flex flex-col h-full overflow-hidden rounded-[24px] liquid-glass-mid border border-black/10 dark:border-white/10 shadow-xl bg-white dark:bg-[#161618] text-apple-text">
      {/* Cover Image Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={coverPhoto}
          alt={state.title || "Property Preview"}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        
        {/* Purpose Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider border border-white/20">
          <span>{state.purpose === "for-sale" ? "For Sale" : "For Rent"}</span>
        </div>

        {/* Live Preview Watermark */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#5B2A86]/80 backdrop-blur-md text-[10px] font-bold text-white border border-[#C9A227]/40">
          <Eye className="w-3 h-3 text-[#F0A830]" />
          <span>Live Preview</span>
        </div>

        {/* Title Deed Verification Chip */}
        {state.titleDeedStatus !== "unverified" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#5FA84C]/90 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
            <ShieldCheck className="w-3 h-3" />
            <span className="capitalize">{state.titleDeedStatus.replace("_", " ").toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Price & Tag */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#5B2A86] dark:text-[#FAF3E6] tracking-tight">
            {displayPrice}
          </span>
          {state.purpose === "for-rent" && (
            <span className="text-xs font-semibold text-apple-text-muted">/ month</span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-apple-text tracking-tight line-clamp-2 mb-2 leading-snug">
          {state.title || `${state.size} ${state.sizeUnit.toUpperCase()} ${state.propertyType.toUpperCase()} in ${displayLocation}`}
        </h4>

        {/* Location Pin */}
        <div className="flex items-center gap-1.5 text-xs text-apple-text-muted mb-3 font-medium truncate">
          <MapPin className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#F0A830] shrink-0" />
          <span className="truncate">{displayLocation}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-apple-border/30 w-full mb-3" />

        {/* Specs Row */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-apple-text-muted font-medium mt-auto">
          {/* Size */}
          <div className="flex items-center gap-1 font-semibold text-apple-text">
            <Maximize2 className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#FAF3E6]" />
            <span>
              {state.size ? `${state.size} ${state.sizeUnit.toUpperCase()}` : "Size not set"}
            </span>
            {state.sizeSqFt > 0 && state.sizeUnit !== "sqft" && (
              <span className="text-[10px] text-apple-text-muted font-normal">
                ({state.sizeSqFt.toLocaleString()} Sq.Ft.)
              </span>
            )}
          </div>

          {/* Beds & Baths (Non-plot) */}
          {!isPlot && (
            <>
              <span className="text-apple-border">•</span>
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                <span>{state.bedrooms} Bed</span>
              </div>
              <span className="text-apple-border">•</span>
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                <span>{state.bathrooms} Bath</span>
              </div>
            </>
          )}

          {/* Furnished */}
          {!isPlot && !isCommercial && (
            <>
              <span className="text-apple-border">•</span>
              <span className="capitalize">{state.furnished}</span>
            </>
          )}
        </div>

        {/* Seller Mock Bar */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-apple-border/20 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#5B2A86]/20 text-[#5B2A86] dark:text-[#FAF3E6] flex items-center justify-center font-bold text-[10px]">
              You
            </div>
            <span className="text-[11px] font-semibold text-apple-text-muted">Your Profile</span>
            <Badge type="identity" size="sm" />
          </div>
          <span className="text-[10px] font-bold text-[#5FA84C] bg-[#5FA84C]/10 px-2 py-0.5 rounded-full border border-[#5FA84C]/30">
            Pending Submit
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP VIEWPORT: Sticky Right Column */}
      <div className="hidden lg:block w-full sticky top-24">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F0A830]" />
            Buyer Search Card Preview
          </span>
          <span className="text-[10px] font-medium text-apple-text-muted">
            Updates in real time
          </span>
        </div>
        {CardContent}
      </div>

      {/* 2. MOBILE VIEWPORT: Floating Bottom Bar + Expandable Sheet */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto">
          {/* Collapsed Pill Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(prev => !prev)}
            className="w-full h-12 px-4 rounded-full liquid-glass-foreground flex items-center justify-between text-apple-text shadow-2xl border border-white/20 cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-[#5B2A86]/20 flex items-center justify-center shrink-0">
                <Eye className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#F0A830]" />
              </div>
              <div className="text-left truncate">
                <span className="text-xs font-bold truncate block">
                  {displayPrice} · {state.title || `${state.size} ${state.sizeUnit} ${state.propertyType}`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs font-semibold text-[#5B2A86] dark:text-[#F0A830] shrink-0">
              <span>{isMobileDrawerOpen ? "Hide" : "Preview"}</span>
              {isMobileDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </button>

          {/* Expanded Bottom Sheet */}
          <AnimatePresence>
            {isMobileDrawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="mt-2 rounded-[28px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto"
                >
                  {CardContent}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default PreviewCard;
