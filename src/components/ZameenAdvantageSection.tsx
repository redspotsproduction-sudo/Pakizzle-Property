import React, { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useMotionValueEvent, 
  useReducedMotion 
} from "motion/react";
import { 
  Map, 
  Calculator, 
  Building2, 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X as CloseIcon, 
  ArrowRight, 
  Zap, 
  CheckCircle2,
  TrendingUp,
  FileText,
  Lock,
  Layers,
  Flame,
  Wifi,
  ChevronRight
} from "lucide-react";
import PlotFinderModal from "./PlotFinderModal";
import PropertyTaxCalculatorModal from "./PropertyTaxCalculatorModal";
import HomeFinancingStudioModal from "./HomeFinancingStudioModal";
import LivingQualityGuideModal from "./LivingQualityGuideModal";
import TitleVerificationModal from "./TitleVerificationModal";
import { REVEAL_EASE, SPRING_TACTILE, SPRING_SNAPPY, AnimatedCard, MotionButton } from "./motion";
import { cn } from "../lib/utils";

interface AdvantageStep {
  id: string;
  stepNumber: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  actionText: string;
  modalType: "plot" | "tax" | "finance" | "living" | "title";
  accentColor: string;
  icon: React.ElementType;
  preview: {
    statValue: string;
    statLabel: string;
    highlightPill: string;
    features: string[];
    microNote: string;
  };
}

const ADVANTAGE_STEPS: AdvantageStep[] = [
  {
    id: "title-verification",
    stepNumber: "01",
    badge: "Cryptographic Title Proof",
    title: "Zero-Fraud Shanakht™ Registry",
    headline: "Pre-verified against LDA, CDA & DHA deeds.",
    description: "Every listing on Pakizzle is cross-checked against official Sub-Registrar books, town planning records, and Biometric Seller Validation. We reject over 68% of unverified broker submissions.",
    actionText: "Run Shanakht™ Verification",
    modalType: "title",
    accentColor: "from-apple-green to-teal-600",
    icon: ShieldCheck,
    preview: {
      statValue: "100%",
      statLabel: "Litigation-Free Certified",
      highlightPill: "CDA / LDA Cleared",
      features: [
        "Non-Encumbrance Certificate (NEC) verified",
        "Sub-Registrar deed matching & mutation verification",
        "Biometric NADRA ownership clearance"
      ],
      microNote: "Eliminates ghost files, unauthorized societies, and double-allotment traps."
    }
  },
  {
    id: "spatial-aesthetic",
    stepNumber: "02",
    badge: "Apple Design Constitution",
    title: "Zero Banner Spam & Popup Takeovers",
    headline: "Pure architectural focus. No Google Ad clutter.",
    description: "Traditional portals surround your property with flashing third-party display ads, predatory popups, and fake agency stamps. Pakizzle is built like an Apple operating system: whisper-quiet and focused on design.",
    actionText: "Explore Architectural Homes",
    modalType: "plot",
    accentColor: "from-blue-500 to-apple-blue",
    icon: Sparkles,
    preview: {
      statValue: "0",
      statLabel: "Third-Party Banner Ads",
      highlightPill: "Spatial Fluidity",
      features: [
        "Ultra-high resolution 4K architectural photography",
        "Zero intrusive Google AdSense or sponsor banners",
        "Verified seller direct messaging without lead brokering"
      ],
      microNote: "Your attention belongs to architecture, not spammy clickbait advertisements."
    }
  },
  {
    id: "fbr-tax-engine",
    stepNumber: "03",
    badge: "2026 Finance Act Compliance",
    title: "Statutory FBR Tax & Transfer Matrix",
    headline: "Itemized tax slips before you visit the registry.",
    description: "Never get blindsided at the registry office. Our proprietary tax engine calculates exact Section 236K (Buyer), Section 236C (Seller), 2% Stamp Duty, TMA fees, and Section 7E liability in real time.",
    actionText: "Calculate Property Taxes",
    modalType: "tax",
    accentColor: "from-gold-decoration to-orange-600",
    icon: Calculator,
    preview: {
      statValue: "PKR 0",
      statLabel: "Hidden Registry Surprises",
      highlightPill: "Finance Act 2026",
      features: [
        "Active Filer vs Non-Filer tax rate differential",
        "FBR Valuation Table vs DC Rate auto-reconciliation",
        "Net seller receivable & buyer total outlay breakdown"
      ],
      microNote: "Official tax calculation approved by chartered property tax auditors."
    }
  },
  {
    id: "spatial-plots",
    stepNumber: "04",
    badge: "Spatial Masterplanning",
    title: "Interactive Sector Plots & Livability Index",
    headline: "Street dimensions, corner premiums & live utility grids.",
    description: "Navigate real DHA & Bahria sector plots with street orientation, corner premiums (+10%), park-facing views, plus verified ground metrics for Loadshedding hours, Sui Gas pressure, and StormFiber speeds.",
    actionText: "Launch Spatial Plot Finder",
    modalType: "plot",
    accentColor: "from-teal-500 to-cyan-600",
    icon: Map,
    preview: {
      statValue: "24/7",
      statLabel: "Live Utility Telemetry",
      highlightPill: "Sector Spatial Grid",
      features: [
        "Exact plot dimension overlays with street orientation",
        "Underground electrification & sewerage status",
        "Neighborhood metrics: Sui gas pressure & water availability"
      ],
      microNote: "Verified by on-ground property inspectors and local resident telemetry."
    }
  }
];

export default function ZameenAdvantageSection() {
  const [activeModal, setActiveModal] = useState<"plot" | "tax" | "finance" | "living" | "title" | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking across the pin-and-reveal container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track progress and update the active step sequentially
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.28) {
      setActiveStep(0);
    } else if (latest < 0.53) {
      setActiveStep(1);
    } else if (latest < 0.78) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  });

  const currentStepData = ADVANTAGE_STEPS[activeStep];
  const StepIcon = currentStepData.icon;

  const COMPARISONS = [
    {
      feature: "Visual Experience & Advertisements",
      pakizzle: "Clean Apple-standard design. 0 banner ads. 0 popups.",
      zameen: "Heavy Google AdSense banners, noisy agent stamps & distracting popups.",
      winner: "pakizzle"
    },
    {
      feature: "Title Verification & Anti-Fraud",
      pakizzle: "Pakizzle Shanakht™: Direct cross-reference with LDA, CDA, DHA records.",
      zameen: "Paid agency badges ('Titanium') with unverified listing claims.",
      winner: "pakizzle"
    },
    {
      feature: "Interactive Plot Finder",
      pakizzle: "Live sector layout, corner/park facing premiums & underground grid status.",
      zameen: "Static or laggy raster maps with missing street dimensions.",
      winner: "pakizzle"
    },
    {
      feature: "FBR Property Tax & Transfer Fees",
      pakizzle: "2026 Finance Act Engine: Section 236K/236C, Stamp Duty & net seller slips.",
      zameen: "Outdated blog posts; buyers blindsided by hidden taxes at registry.",
      winner: "pakizzle"
    },
    {
      feature: "Islamic Home Financing Studio",
      pakizzle: "Real-time Diminishing Musharakah (Meezan/Alfalah) & instant pre-approval.",
      zameen: "Basic lead capture form that sells your phone number to telemarketers.",
      winner: "pakizzle"
    },
    {
      feature: "Living & Utility Quality Index",
      pakizzle: "Live metrics for Loadshedding hours, Sui Gas pressure & Fiber speeds.",
      zameen: "Generic SEO text written years ago without verified utility data.",
      winner: "pakizzle"
    }
  ];

  return (
    <section className="bg-apple-bg border-t border-apple-border/20 relative">
      {/* 
        PIN-AND-REVEAL INTERACTION SYSTEM
        Outer multi-viewport scroll runway: container sticks for 3-4 feature points as the user scrolls
      */}
      <div 
        ref={containerRef} 
        className={cn(
          "relative",
          shouldReduceMotion ? "min-h-auto py-16" : "min-h-[280vh] md:min-h-[300vh]"
        )}
      >
        {/* Sticky Presentation Viewport */}
        <div className={cn(
          shouldReduceMotion 
            ? "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" 
            : "sticky top-16 md:top-20 min-h-[85vh] md:min-h-[88vh] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden"
        )}>
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

          {/* Section Kicker & Header */}
          <div className="mb-6 md:mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-apple-blue/10 border border-apple-blue/20 text-apple-blue text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
              <span>Scroll-Driven Feature Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-apple-text dark:text-white tracking-tight">
              Why Pakistan's Premier Buyers Choose Pakizzle
            </h2>
            <p className="text-xs sm:text-sm text-apple-text-muted dark:text-apple-text-muted mt-1 max-w-2xl">
              Engineered with Apple design restraint: 0 banner spam, 100% cryptographic title clearance, and zero surprises.
            </p>
          </div>

          {/* Main 2-Column Pin-and-Reveal Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* Left Column: Progress Timeline & Active Narrative */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              
              {/* Stepper Tabs Bar */}
              <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl bg-apple-border/60 dark:bg-white/5 border border-black/5 dark:border-white/10 w-fit">
                {ADVANTAGE_STEPS.map((step, idx) => {
                  const isCurrent = activeStep === idx;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      className={cn(
                        "relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer",
                        isCurrent 
                          ? "text-apple-text dark:text-white shadow-sm font-black" 
                          : "text-apple-text-muted hover:text-apple-text dark:hover:text-white"
                      )}
                    >
                      {isCurrent && (
                        <motion.div
                          layoutId="active-step-tab-bg"
                          transition={SPRING_TACTILE}
                          className="absolute inset-0 bg-white dark:bg-[var(--text-primary)] rounded-xl shadow-sm z-[-1] border border-black/5 dark:border-white/10"
                        />
                      )}
                      <span>{step.stepNumber}</span>
                      <span className="hidden sm:inline text-[11px] font-medium opacity-80">{step.badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Animated Content Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepData.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.45, ease: REVEAL_EASE }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                    <StepIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{currentStepData.badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-apple-text dark:text-white tracking-tight leading-tight">
                    {currentStepData.title}
                  </h3>

                  <p className="text-base font-semibold text-teal-600 dark:text-teal-400">
                    {currentStepData.headline}
                  </p>

                  <p className="text-sm text-apple-text-muted dark:text-apple-text-muted leading-relaxed">
                    {currentStepData.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <MotionButton
                      variant="emerald"
                      size="md"
                      onClick={() => setActiveModal(currentStepData.modalType)}
                      className="gap-2 shadow-md shadow-apple-surface/20"
                    >
                      <span>{currentStepData.actionText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </MotionButton>

                    <button
                      onClick={() => {
                        const el = document.getElementById("comparison-matrix-table");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-semibold text-apple-text-muted dark:text-apple-text-muted hover:text-apple-text dark:hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Compare vs Zameen.com ↓
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Continuous Scroll Indicator */}
              <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/10 hidden lg:flex items-center justify-between text-xs text-apple-text-muted">
                <span>Scroll to traverse feature points ({activeStep + 1} of 4)</span>
                <div className="w-24 h-1.5 bg-apple-border dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${((activeStep + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Physical Morphing Glass Presentation Stage */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepData.id}
                  initial={{ opacity: 0, scale: 0.96, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -30 }}
                  transition={{ duration: 0.5, ease: REVEAL_EASE }}
                  className="rounded-[32px] p-6 sm:p-8 bg-white/80 dark:bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.12)] relative overflow-hidden"
                >
                  {/* Decorative background aura */}
                  <div className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none bg-gradient-to-br",
                    currentStepData.accentColor
                  )} />

                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-black/5 dark:border-white/10 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
                        <StepIcon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-apple-text-muted dark:text-apple-text-muted">
                          Verified Architecture Stage
                        </div>
                        <h4 className="text-lg font-bold text-apple-text dark:text-white">
                          {currentStepData.title}
                        </h4>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      {currentStepData.preview.highlightPill}
                    </span>
                  </div>

                  {/* Center Highlight Stat Box */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-apple-text to-[var(--bg-surface)] text-white shadow-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-teal-300">
                        {currentStepData.preview.statValue}
                      </div>
                      <div className="text-xs font-semibold text-white/80 mt-0.5">
                        {currentStepData.preview.statLabel}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-apple-surface/60 px-2.5 py-1 rounded-full border border-apple-green/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pakizzle Verified
                      </span>
                    </div>
                  </div>

                  {/* Feature Checkpoints */}
                  <div className="space-y-3 mb-6">
                    {currentStepData.preview.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-apple-gray/70 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <div className="w-5 h-5 rounded-full bg-apple-green/20 text-apple-green dark:text-apple-green flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs font-medium text-apple-surface dark:text-apple-border leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Micro Note */}
                  <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <p className="text-[11px] text-apple-text-muted dark:text-apple-text-muted italic">
                      {currentStepData.preview.microNote}
                    </p>
                    <button
                      onClick={() => setActiveModal(currentStepData.modalType)}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                    >
                      <span>Interactive Tool</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table Section */}
      <div id="comparison-matrix-table" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-[32px] border border-black/5 dark:border-white/10 p-6 md:p-10 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
              Objective Comparison
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-apple-text dark:text-white tracking-tight">
              The Reality: Pakizzle vs Zameen.com
            </h3>
            <p className="text-xs sm:text-sm text-apple-text-muted dark:text-apple-text-muted mt-1">
              Engineered with Apple's standard of user respect, clarity, and precision.
            </p>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {COMPARISONS.map((comp, idx) => (
              <div key={idx} className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <span className="text-xs font-bold text-apple-surface dark:text-apple-border uppercase tracking-wider block">
                    {comp.feature}
                  </span>
                </div>
                <div className="md:col-span-4 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <div className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Pakizzle Standard
                  </div>
                  <div className="text-xs text-apple-text dark:text-white font-semibold leading-relaxed">
                    {comp.pakizzle}
                  </div>
                </div>
                <div className="md:col-span-4 p-3.5 rounded-2xl bg-apple-gray dark:bg-white/5 border border-black/5">
                  <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <CloseIcon className="w-3.5 h-3.5 text-apple-red" />
                    Zameen.com
                  </div>
                  <div className="text-xs text-apple-text-muted dark:text-apple-text-muted leading-relaxed">
                    {comp.zameen}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PlotFinderModal 
        isOpen={activeModal === "plot"} 
        onClose={() => setActiveModal(null)} 
      />
      <PropertyTaxCalculatorModal 
        isOpen={activeModal === "tax"} 
        onClose={() => setActiveModal(null)} 
      />
      <HomeFinancingStudioModal 
        isOpen={activeModal === "finance"} 
        onClose={() => setActiveModal(null)} 
      />
      <LivingQualityGuideModal 
        isOpen={activeModal === "living"} 
        onClose={() => setActiveModal(null)} 
      />
      <TitleVerificationModal 
        isOpen={activeModal === "title"} 
        onClose={() => setActiveModal(null)} 
      />
    </section>
  );
}
