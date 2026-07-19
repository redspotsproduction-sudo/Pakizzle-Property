import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Scale } from "lucide-react";
import { Vehicle } from "@/types";

interface ComparisonDrawerProps {
  compareList: Vehicle[];
  onToggleCompare: (vehicle: Vehicle) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

const ComparisonDrawer = React.memo(({ compareList, onToggleCompare, onClear, onOpenModal }: ComparisonDrawerProps) => {
  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        exit={{ y: 200 }}
        className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-5xl px-4 md:px-6"
      >
        <div className="glass-card bg-apple-card-bg backdrop-blur-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-10 shadow-2xl border-apple-border/20">
          <div className="flex items-center gap-4 md:gap-8 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            <div className="shrink-0">
              <div className="text-xs md:text-sm font-bold mb-0.5 md:mb-1 tracking-tight">Comparison</div>
              <div className="text-[9px] md:text-[11px] font-bold text-apple-text-muted uppercase tracking-widest">{compareList.length} of 3</div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              {compareList.map((v) => (
                <motion.div 
                  key={v.id} 
                  layout
                  className="flex items-center gap-2 md:gap-3 bg-apple-card-bg p-1.5 md:p-2.5 rounded-xl md:rounded-[20px] border border-apple-border/20 shrink-0 shadow-sm"
                >
                  <img src={v.images[0]} className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-[14px] object-cover shadow-sm" loading="lazy" />
                  <div className="text-[10px] md:text-xs font-bold pr-1 md:pr-2 max-w-[60px] md:max-w-[100px] truncate">{v.make} {v.model}</div>
                  <button onClick={() => onToggleCompare(v)} className="p-1 hover:bg-apple-red/10 hover:text-apple-red rounded-full transition-all">
                    <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                </motion.div>
              ))}
              {compareList.length < 3 && (
                <div className="w-24 md:w-32 h-12 md:h-16 border-2 border-dashed border-apple-border/50 rounded-xl md:rounded-[20px] flex items-center justify-center text-[9px] md:text-[10px] font-bold text-apple-text-muted uppercase tracking-widest bg-white/20">
                  Add
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 shrink-0 w-full md:w-auto">
            <button 
              onClick={onClear}
              className="flex-1 md:flex-none text-xs md:text-sm font-bold text-apple-text-muted hover:text-apple-red transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={onOpenModal}
              className="flex-[2] md:flex-none apple-button-primary !h-12 md:!h-14 !px-6 md:!px-10 flex items-center justify-center gap-2 md:gap-3 shadow-xl shadow-apple-blue/20"
            >
              <Scale className="w-4 h-4 md:w-5 md:h-5" />
              Compare
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

ComparisonDrawer.displayName = "ComparisonDrawer";

export default ComparisonDrawer;
