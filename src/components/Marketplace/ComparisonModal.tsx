import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Scale } from "lucide-react";
import { Vehicle } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Vehicle[];
}

const ComparisonModal = React.memo(({ isOpen, onClose, compareList }: ComparisonModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl bg-apple-card-bg rounded-apple-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-apple-border flex justify-between items-center bg-apple-card-bg shrink-0">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">Vehicle Comparison</h2>
              <button onClick={onClose} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 min-w-[600px] md:min-w-0">
                <div className="space-y-8 md:space-y-12 pt-32 md:pt-48">
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Performance</div>
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Engine & Power</div>
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Drivetrain</div>
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Seating</div>
                </div>
                {compareList.map((v) => (
                  <div key={v.id} className="space-y-12">
                    <div className="text-center">
                      <img src={v.images[0]} className="w-full aspect-video object-cover rounded-apple-lg mb-4 shadow-apple-soft" loading="lazy" />
                      <h3 className="text-xl font-bold">{v.make} {v.model}</h3>
                      <div className="text-apple-blue font-bold mt-1">{formatPrice(v.price)}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">0-100 km/h</span>
                        <span className="font-bold">{v.specs?.acceleration || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Top Speed</span>
                        <span className="font-bold">{v.specs?.topSpeed || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Horsepower</span>
                        <span className="font-bold">{v.specs?.horsepower || "N/A"} hp</span>
                      </div>
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Torque</span>
                        <span className="font-bold">{v.specs?.torque || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Drive</span>
                        <span className="font-bold">{v.specs?.driveTrain || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Capacity</span>
                        <span className="font-bold">{v.specs?.seating || "N/A"} Seats</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

ComparisonModal.displayName = "ComparisonModal";

export default ComparisonModal;
