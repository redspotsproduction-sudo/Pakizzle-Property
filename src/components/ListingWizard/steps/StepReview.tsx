import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  FileText, 
  HelpCircle, 
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "../../../lib/utils";
import { ListingWizardState } from "../types";

interface StepReviewProps {
  state: ListingWizardState;
  updateState: (updates: Partial<ListingWizardState>) => void;
  onSubmit: (finalListingData: any) => void;
  onBack: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  state,
  updateState,
  onSubmit,
  onBack,
}) => {
  const [isEnhancingAi, setIsEnhancingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isFaqExpanded, setIsFaqExpanded] = useState(true);

  // Call the real AI enhancement endpoint
  const handleEnhanceWithAi = async () => {
    setIsEnhancingAi(true);
    try {
      const response = await fetch("/api/listings/enhance-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType: state.propertyType,
          purpose: state.purpose,
          city: state.city,
          areaName: state.areaName,
          size: state.size,
          sizeUnit: state.sizeUnit,
          bedrooms: state.bedrooms,
          bathrooms: state.bathrooms,
          condition: state.condition,
          furnished: state.furnished,
          price: state.price,
          features: [
            state.titleDeedStatus.replace("_", " ").toUpperCase(),
            "24/7 Gated Security",
            "Underground Utilities",
            "Prime Location"
          ]
        }),
      });

      if (!response.ok) {
        throw new Error("AI service returned a non-200 response");
      }

      const data = await response.json();
      if (data.title && data.description) {
        updateState({
          title: data.title,
          description: data.description,
          aiSuggestedFaqs: data.faqs || [],
          isAiEnhanced: true,
        });
        toast.success("AI draft generated! Review and personalize below before submitting.");
      }
    } catch (err: any) {
      console.error("AI enhancement error:", err);
      toast.error("AI enhancement failed. You can write your custom copy directly.");
    } finally {
      setIsEnhancingAi(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!state.confirmationChecked) {
      toast.error("Please confirm the legal ownership checkbox before submitting.");
      return;
    }
    if (!state.title || state.title.trim().length < 5) {
      toast.error("Please provide a property title.");
      return;
    }
    if (!state.description || state.description.trim().length < 20) {
      toast.error("Please provide a description (at least 20 characters).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        propertyType: state.propertyType,
        purpose: state.purpose,
        city: state.city,
        areaName: state.areaName,
        addressDetail: state.addressDetail,
        size: state.size,
        sizeUnit: state.sizeUnit,
        sizeSqFt: state.sizeSqFt,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        condition: state.condition,
        furnished: state.furnished,
        photos: state.photos.map((p) => p.url),
        price: state.price,
        isPriceNegotiable: state.isPriceNegotiable,
        titleDeedStatus: state.titleDeedStatus,
        title: state.title,
        description: state.description,
        aiSuggestedFaqs: state.aiSuggestedFaqs,
      };

      const response = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Submission rejected by server");
      }

      const result = await response.json();
      toast.success("Listing submitted successfully for Shanakht™ title approval!");
      onSubmit(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "Network error. Please try again.");
      toast.error(err.message || "Failed to submit listing");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight mb-2">
          Review, Enhance with AI & Publish
        </h2>
        <p className="text-sm text-apple-text-muted leading-relaxed">
          Review your structured property data, generate conversion-optimized marketing copy, and submit for official Shanakht™ title approval.
        </p>
      </div>

      {/* 1. AI Enhancement Banner & Trigger */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#5B2A86]/10 via-[#FAF3E6]/30 to-[#F0A830]/10 dark:from-[#5B2A86]/20 dark:to-transparent border border-[#5B2A86]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#F0A830]" />
            <h4 className="text-sm font-bold text-apple-text">
              Optimize with Pakizzle Real Estate AI
            </h4>
          </div>
          <p className="text-xs text-apple-text-muted leading-relaxed max-w-lg">
            Automatically craft an SEO/AEO-optimized title, comprehensive multi-paragraph description, and buyer FAQ block from your specs. Never published without your review.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEnhanceWithAi}
          disabled={isEnhancingAi}
          className="h-11 px-5 rounded-full pakizzle-button-primary text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isEnhancingAi ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating AI Copy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#F0A830]" />
              <span>Enhance with AI</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* 2. Editable Title Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Listing Headline Title <span className="text-[#D93A45]">*</span>
            </label>
            <span className="text-[11px] text-apple-text-muted">
              {state.title.length}/100 chars
            </span>
          </div>

          <input
            type="text"
            maxLength={100}
            value={state.title}
            onChange={(e) => updateState({ title: e.target.value })}
            placeholder="e.g. Luxury 10 Marla Modern Designer Villa in DHA Phase 6"
            className="w-full h-14 px-4 rounded-2xl border border-apple-border/50 bg-white/80 dark:bg-white/5 text-apple-text text-sm font-bold focus:outline-none focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10 transition-all"
          />
        </div>

        {/* 3. Editable Description Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Marketing Description <span className="text-[#D93A45]">*</span>
            </label>
            {state.isAiEnhanced && (
              <span className="text-[11px] font-semibold text-[#5FA84C] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                AI Generated & Editable
              </span>
            )}
          </div>

          <textarea
            rows={5}
            value={state.description}
            onChange={(e) => updateState({ description: e.target.value })}
            placeholder="Describe the architectural layout, room flows, natural lighting, finishes, society amenities, and nearby landmarks..."
            className="w-full p-4 rounded-2xl border border-apple-border/50 bg-white/80 dark:bg-white/5 text-apple-text text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10 transition-all resize-none"
          />
        </div>

        {/* 4. Buyer FAQ Block (AI Generated, Editable) */}
        {state.aiSuggestedFaqs && state.aiSuggestedFaqs.length > 0 && (
          <div className="p-4 rounded-2xl border border-apple-border/40 bg-black/5 dark:bg-white/5 space-y-3">
            <button
              type="button"
              onClick={() => setIsFaqExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#5B2A86] dark:text-[#F0A830]" />
                <span className="text-xs font-bold text-apple-text">
                  Buyer/Tenant FAQs ({state.aiSuggestedFaqs.length} Items)
                </span>
              </div>
              {isFaqExpanded ? (
                <ChevronUp className="w-4 h-4 text-apple-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-apple-text-muted" />
              )}
            </button>

            {isFaqExpanded && (
              <div className="space-y-3 pt-2">
                {state.aiSuggestedFaqs.map((faq, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/60 dark:bg-white/5 text-xs">
                    <p className="font-bold text-apple-text mb-1">Q: {faq.question}</p>
                    <p className="text-apple-text-muted leading-relaxed">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Summary Spec Recap Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-apple-border/40 bg-white/40 dark:bg-white/5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted block">
            Listing Summary Snapshot
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-apple-text-muted block text-[11px]">Type / Purpose</span>
              <span className="font-bold capitalize text-apple-text">
                {state.propertyType} ({state.purpose === "for-sale" ? "Sale" : "Rent"})
              </span>
            </div>

            <div>
              <span className="text-apple-text-muted block text-[11px]">Location</span>
              <span className="font-bold text-apple-text truncate block">
                {state.areaName}, {state.city}
              </span>
            </div>

            <div>
              <span className="text-apple-text-muted block text-[11px]">Size & Specs</span>
              <span className="font-bold text-apple-text">
                {state.size} {state.sizeUnit} {state.propertyType !== "plot" && `(${state.bedrooms}B / ${state.bathrooms}B)`}
              </span>
            </div>

            <div>
              <span className="text-apple-text-muted block text-[11px]">Asking Price</span>
              <span className="font-bold text-[#5B2A86] dark:text-[#FAF3E6]">
                {typeof state.price === "number" ? formatPrice(state.price) : "Contact"}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Legal Confirmation Checkbox */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={state.confirmationChecked}
              onChange={(e) => updateState({ confirmationChecked: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded text-[#5B2A86] focus:ring-[#5B2A86] accent-[#5B2A86] cursor-pointer shrink-0"
            />
            <div className="text-xs leading-relaxed text-apple-text">
              <span className="font-bold block text-apple-text mb-0.5">
                Authorized Representation & Title Disclosure:
              </span>
              I certify that I am the registered title deed holder or authorized marketing representative for this property. I acknowledge that fraudulent representations or stolen photos will result in immediate delisting and account suspension under Pakizzle trust regulations.
            </div>
          </label>
        </div>

        {submitError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs font-semibold text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 px-6 rounded-full border border-apple-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs text-apple-text transition-all cursor-pointer disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting || !state.confirmationChecked}
          className={cn(
            "h-12 px-8 rounded-full pakizzle-button-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer",
            (isSubmitting || !state.confirmationChecked) && "opacity-60 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Submitting for Approval...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#F0A830]" />
              <span>Submit for Title Approval →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepReview;
