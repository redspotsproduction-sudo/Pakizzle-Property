import React, { useState } from "react";
import { motion } from "motion/react";
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
  FileText
} from "lucide-react";
import PlotFinderModal from "./PlotFinderModal";
import PropertyTaxCalculatorModal from "./PropertyTaxCalculatorModal";
import HomeFinancingStudioModal from "./HomeFinancingStudioModal";
import LivingQualityGuideModal from "./LivingQualityGuideModal";
import TitleVerificationModal from "./TitleVerificationModal";

export default function ZameenAdvantageSection() {
  const [activeModal, setActiveModal] = useState<"plot" | "tax" | "finance" | "living" | "title" | null>(null);

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
    <section className="py-16 md:py-24 bg-apple-bg border-t border-apple-border/20 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-apple-blue/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-apple-blue/10 border border-apple-blue/20 text-apple-blue text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              The Apple Standard for Real Estate
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-apple-text tracking-tight leading-tight">
              Why Pakistan's premier buyers <br className="hidden sm:block" />
              choose Pakizzle over Zameen.
            </h2>
            <p className="text-apple-text-muted text-base md:text-lg mt-4 leading-relaxed">
              No banner spam. No fake listings. Just cryptographic title verification, 
              interactive plot spatial maps, and complete tax transparency.
            </p>
          </motion.div>
        </div>

        {/* 4 Flagship Interactive Tools (The Zameen-Crushers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {/* Tool 1: Plot Finder */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#15161E] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-apple-soft transition-all cursor-pointer flex flex-col justify-between group"
            onClick={() => setActiveModal("plot")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-apple-blue flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-[10px] font-mono font-bold text-apple-blue uppercase tracking-wider mb-1">
                Spatial Navigator
              </div>
              <h3 className="text-lg font-bold text-apple-text">
                Sector Plot Finder
              </h3>
              <p className="text-xs text-apple-text-muted mt-2 leading-relaxed">
                Explore DHA & Bahria masterplans with street orientations, corner premiums (+10%), and underground grid status.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-apple-blue group-hover:translate-x-1 transition-transform">
              <span>Launch Plot Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Tool 2: FBR Tax Engine */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#15161E] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-apple-soft transition-all cursor-pointer flex flex-col justify-between group"
            onClick={() => setActiveModal("tax")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider mb-1">
                2026 Finance Act
              </div>
              <h3 className="text-lg font-bold text-apple-text">
                FBR Tax & Transfer
              </h3>
              <p className="text-xs text-apple-text-muted mt-2 leading-relaxed">
                Itemized calculation of Section 236K (Buyer), 236C (Seller), 2% Stamp Duty, TMA fees, and Section 7E liability.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Calculate Exact Taxes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Tool 3: Islamic Financing */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#15161E] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-apple-soft transition-all cursor-pointer flex flex-col justify-between group"
            onClick={() => setActiveModal("finance")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider mb-1">
                Meezan · Alfalah · HBL
              </div>
              <h3 className="text-lg font-bold text-apple-text">
                Islamic Home Studio
              </h3>
              <p className="text-xs text-apple-text-muted mt-2 leading-relaxed">
                Diminishing Musharakah monthly installment simulator with down payment %, tenor sliders, and instant pre-approval.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Simulate Financing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Tool 4: Living Quality Index */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#15161E] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-apple-soft transition-all cursor-pointer flex flex-col justify-between group"
            onClick={() => setActiveModal("living")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider mb-1">
                Area Living Index
              </div>
              <h3 className="text-lg font-bold text-apple-text">
                Utilities & Livability
              </h3>
              <p className="text-xs text-apple-text-muted mt-2 leading-relaxed">
                Verified data on Loadshedding hours, Sui Gas pressure, sweet water pipeline, StormFiber speeds, and top schools.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect Neighborhoods</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>

        {/* Shanakht Banner (Anti-Fraud Guarantee) */}
        <div 
          onClick={() => setActiveModal("title")}
          className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-[#12131A] text-white border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:border-apple-blue/50 transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold tracking-tight">Pakizzle Shanakht™ Verified Title Guarantee</h4>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  ZERO LITIGATION
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 max-w-xl">
                Every listing is cross-checked with Sub-Registrar records, LDA/CDA Masterplans, and Non-Encumbrance Certificates. No fake plots, no unauthorized files.
              </p>
            </div>
          </div>
          <button className="px-5 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs hover:bg-white/90 transition-all shrink-0 flex items-center gap-2">
            Verify a Title or Plot Number
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="bg-white dark:bg-[#15161E] rounded-3xl border border-black/5 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-apple-text tracking-tight">
              The Reality: Pakizzle vs Zameen.com
            </h3>
            <p className="text-xs text-apple-text-muted mt-1">
              Engineered with Apple's standard of user respect, clarity, and precision.
            </p>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {COMPARISONS.map((comp, idx) => (
              <div key={idx} className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <span className="text-xs font-bold text-apple-text uppercase tracking-wider block">
                    {comp.feature}
                  </span>
                </div>
                <div className="md:col-span-4 p-3 rounded-xl bg-apple-blue/5 border border-apple-blue/15">
                  <div className="text-[10px] font-bold text-apple-blue uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pakizzle Standard
                  </div>
                  <div className="text-xs text-apple-text font-medium leading-relaxed">
                    {comp.pakizzle}
                  </div>
                </div>
                <div className="md:col-span-4 p-3 rounded-xl bg-apple-gray/40 dark:bg-white/5 border border-black/5">
                  <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <CloseIcon className="w-3.5 h-3.5 text-rose-500" />
                    Zameen.com
                  </div>
                  <div className="text-xs text-apple-text-muted leading-relaxed">
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
