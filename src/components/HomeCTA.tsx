import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ShieldCheck, Map, Calculator, Building2, ArrowRight } from "lucide-react";
import PlotFinderModal from "./PlotFinderModal";
import PropertyTaxCalculatorModal from "./PropertyTaxCalculatorModal";
import HomeFinancingStudioModal from "./HomeFinancingStudioModal";

export default function HomeCTA() {
  const [activeModal, setActiveModal] = useState<"plot" | "tax" | "finance" | null>(null);

  return (
    <>
      <section className="py-12 bg-apple-gray/30 border-t border-b border-apple-border/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <Link 
              to="/marketplace" 
              className="apple-button-primary !h-14 md:!h-16 !px-4 text-sm md:text-base shadow-2xl shadow-apple-blue/30 group w-full"
            >
              <span className="flex items-center justify-center gap-3">
                Explore Properties
                <motion.span 
                  animate={{ x: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </span>
            </Link>

            <button 
              onClick={() => setActiveModal("plot")}
              className="apple-button-secondary !h-14 md:!h-16 !px-4 text-sm md:text-base group bg-apple-card-bg w-full"
            >
              <span className="flex items-center justify-center gap-3">
                <Map className="w-5 h-5 text-apple-blue group-hover:scale-110 transition-transform" />
                Sector Plot Finder
              </span>
            </button>

            <button 
              onClick={() => setActiveModal("tax")}
              className="apple-button-secondary !h-14 md:!h-16 !px-4 text-sm md:text-base group bg-white dark:bg-[#1D1D1F] border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 w-full"
            >
              <span className="flex items-center justify-center gap-3">
                <Calculator className="w-5 h-5 group-hover:scale-110 transition-transform" />
                FBR Tax Calculator
              </span>
            </button>

            <button 
              onClick={() => setActiveModal("finance")}
              className="apple-button-secondary !h-14 md:!h-16 !px-4 text-sm md:text-base group bg-white dark:bg-[#1D1D1F] border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/5 w-full"
            >
              <span className="flex items-center justify-center gap-3">
                <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Islamic Financing
              </span>
            </button>
          </motion.div>
        </div>
      </section>

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
    </>
  );
}
