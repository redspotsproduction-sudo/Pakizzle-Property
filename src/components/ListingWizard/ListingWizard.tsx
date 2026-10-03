import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Header from "../Header";
import Footer from "../Footer";
import StepperNav from "./StepperNav";
import PreviewCard from "./PreviewCard";
import StepPropertyType from "./steps/StepPropertyType";
import StepLocation from "./steps/StepLocation";
import StepDetails from "./steps/StepDetails";
import StepPhotos from "./steps/StepPhotos";
import StepPrice from "./steps/StepPrice";
import StepReview from "./steps/StepReview";
import { ListingWizardState, INITIAL_WIZARD_STATE } from "./types";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../lib/utils";

export default function ListingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<ListingWizardState>(() => {
    return INITIAL_WIZARD_STATE;
  });

  const [createdListing, setCreatedListing] = useState<{
    id: number;
    reference_id: string;
    title: string;
    price: number;
    location: string;
    status: string;
  } | null>(null);

  const [copiedRef, setCopiedRef] = useState(false);

  // Auto-restore draft from gateway on initial mount
  useEffect(() => {
    fetch("/api/listings/draft")
      .then((res) => res.json())
      .then((data) => {
        if (data.draft && data.draft.title) {
          setState((prev) => ({
            ...prev,
            ...data.draft,
            lastSavedAt: data.draft.savedAt 
              ? new Date(data.draft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : prev.lastSavedAt,
          }));
          toast.info("Resumed from your previous saved draft");
        }
      })
      .catch(() => {
        // Quiet fallback if offline or no draft
      });
  }, []);

  const updateState = (updates: Partial<ListingWizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Step advancement handler with completed tracking & auto-save to gateway
  const handleStepComplete = async (fromStepIndex: number) => {
    const nextCompleted = Array.from(new Set([...state.completedSteps, fromStepIndex]));
    const nextStep = Math.min(5, fromStepIndex + 1);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => ({
      ...prev,
      completedSteps: nextCompleted,
      currentStep: nextStep,
      lastSavedAt: nowTime,
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Auto-save draft to backend API on step completion (Stage 5 wired here)
    try {
      await fetch("/api/listings/draft/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          completedSteps: nextCompleted,
          currentStep: nextStep,
        }),
      });
    } catch (e) {
      console.warn("Auto-save draft sync note:", e);
    }
  };

  const handleStepBack = (toStepIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, toStepIndex),
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = async () => {
    setState((prev) => ({
      ...prev,
      isDraftSaving: true,
    }));

    try {
      const res = await fetch("/api/listings/draft/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();

      const timeStr = data.savedAt 
        ? new Date(data.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setState((prev) => ({
        ...prev,
        isDraftSaving: false,
        lastSavedAt: timeStr,
      }));
      toast.success("Draft saved successfully to gateway API");
    } catch (err) {
      setState((prev) => ({ ...prev, isDraftSaving: false }));
      toast.error("Failed to save draft to gateway");
    }
  };

  const handleFinalSubmitSuccess = (response: any) => {
    if (response && response.listing) {
      setCreatedListing(response.listing);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/marketplace");
    }
  };

  const handleCopyRef = () => {
    if (!createdListing) return;
    navigator.clipboard.writeText(createdListing.reference_id);
    setCopiedRef(true);
    toast.success("Property Reference ID copied to clipboard!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="min-h-screen bg-apple-bg text-apple-text flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* SUCCESS STATE MODAL/SCREEN */}
        {createdListing ? (
          <div className="max-w-2xl mx-auto py-12 px-6 sm:px-8 rounded-[36px] bg-white/80 dark:bg-black/40 border border-[#C9A227]/40 shadow-2xl backdrop-blur-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Animated Checkmark Badge */}
            <div className="w-20 h-20 rounded-full bg-[#5FA84C]/15 border-2 border-[#5FA84C] flex items-center justify-center mx-auto text-[#5FA84C] shadow-lg">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5FA84C]/10 text-[#5FA84C] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5FA84C]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Submitted For Shanakht™ Approval
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-apple-text tracking-tight mb-2">
                Property Submitted Successfully!
              </h1>
              <p className="text-sm text-apple-text-muted max-w-md mx-auto leading-relaxed">
                Your listing has entered the verification queue. Once our title examiners review the non-encumbrance records, it will be published to the live marketplace.
              </p>
            </div>

            {/* Reference ID Showcase Card */}
            <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-apple-border/50 max-w-md mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted block">
                Official Shareable Property Reference ID
              </span>
              
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-[#5B2A86] dark:text-[#FAF3E6]">
                  #{createdListing.reference_id}
                </span>

                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-2.5 rounded-xl border border-apple-border hover:bg-black/5 dark:hover:bg-white/10 text-apple-text transition-all cursor-pointer"
                  title="Copy Reference ID"
                >
                  {copiedRef ? (
                    <Check className="w-5 h-5 text-[#5FA84C]" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-[11px] text-apple-text-muted">
                Buyers can search this exact 7-digit ID directly in the Pakizzle search bar.
              </p>
            </div>

            {/* Quick Listing Snapshot */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-apple-border/30 text-left max-w-md mx-auto text-xs space-y-1.5">
              <p className="font-bold text-apple-text truncate text-sm">
                {createdListing.title}
              </p>
              <div className="flex items-center justify-between text-apple-text-muted">
                <span>{createdListing.location}</span>
                <span className="font-bold font-mono text-[#5B2A86] dark:text-[#FAF3E6]">
                  {formatPrice(createdListing.price)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto h-12 px-6 rounded-full border border-apple-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs text-apple-text flex items-center justify-center gap-2 transition-all"
              >
                <span>Browse Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/dashboard/wishlist"
                className="w-full sm:w-auto h-12 px-8 rounded-full pakizzle-button-primary font-bold text-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* STANDARD 6-STEP WIZARD */
          <>
            {/* Top Control Bar */}
            <div className="flex items-center justify-between py-4 mb-6 border-b border-apple-border/40">
              <Link
                to="/marketplace"
                className="flex items-center gap-1.5 text-xs font-semibold text-apple-text-muted hover:text-apple-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to Marketplace</span>
              </Link>

              <div className="flex items-center gap-3">
                {state.lastSavedAt && (
                  <span className="hidden sm:inline text-xs text-apple-text-muted">
                    Auto-saved at {state.lastSavedAt}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={state.isDraftSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-apple-border/60 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-apple-text transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{state.isDraftSaving ? "Saving..." : "Save Draft"}</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress Navigation */}
            <div className="mb-8">
              <StepperNav
                currentStep={state.currentStep}
                completedSteps={state.completedSteps}
                onStepClick={(idx) => handleStepBack(idx)}
              />
            </div>

            {/* Main Two-Column Layout (Form Steps + Live Preview Card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Active Step Form (7 Cols) */}
              <div className="lg:col-span-7 bg-white/60 dark:bg-black/20 p-6 sm:p-8 rounded-[32px] border border-apple-border/40 shadow-sm backdrop-blur-xl">
                {state.currentStep === 0 && (
                  <StepPropertyType
                    state={state}
                    updateState={updateState}
                    onNext={() => handleStepComplete(0)}
                  />
                )}

                {state.currentStep === 1 && (
                  <StepLocation
                    state={state}
                    updateState={updateState}
                    onNext={() => handleStepComplete(1)}
                    onBack={() => handleStepBack(0)}
                  />
                )}

                {state.currentStep === 2 && (
                  <StepDetails
                    state={state}
                    updateState={updateState}
                    onNext={() => handleStepComplete(2)}
                    onBack={() => handleStepBack(1)}
                  />
                )}

                {state.currentStep === 3 && (
                  <StepPhotos
                    state={state}
                    updateState={updateState}
                    onNext={() => handleStepComplete(3)}
                    onBack={() => handleStepBack(2)}
                  />
                )}

                {state.currentStep === 4 && (
                  <StepPrice
                    state={state}
                    updateState={updateState}
                    onNext={() => handleStepComplete(4)}
                    onBack={() => handleStepBack(3)}
                  />
                )}

                {state.currentStep === 5 && (
                  <StepReview
                    state={state}
                    updateState={updateState}
                    onSubmit={handleFinalSubmitSuccess}
                    onBack={() => handleStepBack(4)}
                  />
                )}
              </div>

              {/* Right Column: Live Updating Preview Card (5 Cols) */}
              <div className="lg:col-span-5">
                <PreviewCard state={state} />
              </div>
            </div>
          </>
        )}
      </main>

      <Footer onValuationClick={() => {}} />
    </div>
  );
}
