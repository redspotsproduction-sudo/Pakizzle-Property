import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Scale } from "lucide-react";
import { Property } from "@/types";
import { SPRING_SNAPPY, SPRING_BOUNCY } from "../motion";

interface ComparisonDrawerProps {
  compareList: Property[];
  onToggleCompare: (property: Property) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

const ComparisonDrawer = React.memo(({ compareList, onToggleCompare, onClear, onOpenModal }: ComparisonDrawerProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { y: 160, opacity: 0, scale: 0.98 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 160, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[70] w-full max-w-4xl px-4 md:px-6 pointer-events-none"
        >
          <div className="glass-card bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl p-3.5 md:p-5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-black/10 dark:border-white/10 rounded-[28px] pointer-events-auto">
            <div className="flex items-center gap-3 md:gap-6 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
              <div className="shrink-0">
                <div className="text-xs md:text-sm font-bold tracking-tight text-apple-text dark:text-white">Property Comparison</div>
                <div className="text-[10px] font-bold text-apple-blue uppercase tracking-widest">{compareList.length} of 3</div>
              </div>

              <div className="flex items-center gap-2.5 md:gap-3.5">
                <AnimatePresence mode="popLayout">
                  {compareList.map((p) => (
                    <motion.div 
                      key={p.id} 
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={SPRING_SNAPPY}
                      className="flex items-center gap-2 bg-apple-gray/60 dark:bg-white/5 p-1.5 md:p-2 rounded-2xl border border-apple-border/20 dark:border-white/10 shrink-0 shadow-xs"
                    >
                      <img 
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"} 
                        alt={p.title || `${p.propertyType || p.type} in ${p.city}`}
                        className="w-8 h-8 md:w-11 md:h-11 rounded-xl object-cover shadow-xs" 
                        loading="lazy" 
                      />
                      <div className="text-[10px] md:text-xs font-bold pr-1 max-w-[70px] md:max-w-[110px] truncate text-apple-text dark:text-white">
                        {p.title || `${p.propertyType || p.type} in ${p.city}`}
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.1 }}
                        transition={SPRING_SNAPPY}
                        onClick={() => onToggleCompare(p)} 
                        className="p-1 hover:bg-apple-red/10 text-apple-text-muted hover:text-apple-red rounded-full transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {compareList.length < 3 && (
                  <div className="w-20 md:w-28 h-10 md:h-12 border-2 border-dashed border-apple-border/40 dark:border-white/15 rounded-2xl flex items-center justify-center text-[10px] font-bold text-apple-text-muted uppercase tracking-wider bg-apple-gray/20 dark:bg-white/[0.02]">
                    + Add
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <motion.button 
                whileTap={{ scale: 0.94 }}
                transition={SPRING_SNAPPY}
                onClick={onClear}
                className="flex-1 md:flex-none text-xs md:text-sm font-bold text-apple-text-muted hover:text-apple-red transition-colors px-3 py-2 cursor-pointer"
              >
                Clear
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                transition={SPRING_SNAPPY}
                onClick={onOpenModal}
                className="flex-[2] md:flex-none apple-button-primary !h-11 md:!h-12 !px-6 md:!px-8 flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/25 text-xs md:text-sm cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Compare</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ComparisonDrawer.displayName = "ComparisonDrawer";

export default ComparisonDrawer;
