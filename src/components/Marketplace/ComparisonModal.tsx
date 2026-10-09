import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Scale, Home, BedDouble, Bath, MapPin, Layers } from "lucide-react";
import { Property } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Property[];
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold tracking-tight">Property Comparison</h2>
                  <p className="text-xs text-apple-text-muted">Compare real estate specifications, layouts, and pricing side-by-side</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-apple-gray rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 min-w-[600px] md:min-w-0">
                <div className="space-y-8 md:space-y-12 pt-32 md:pt-48">
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Area & Dimension</div>
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Beds & Baths</div>
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Furnishing Status</div>
                  <div className="text-[10px] md:text-sm font-bold text-apple-text-muted uppercase tracking-widest border-b border-apple-border pb-4">Location & City</div>
                </div>
                {compareList.map((p) => (
                  <div key={p.id} className="space-y-12">
                    <div className="text-center">
                      <img 
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"} 
                        className="w-full aspect-video object-cover rounded-apple-lg mb-4 shadow-apple-soft" 
                        loading="lazy" 
                        alt={p.title || "Property image"}
                      />
                      <h3 className="text-lg md:text-xl font-bold truncate">{p.title || `${p.propertyType || p.type} in ${p.city}`}</h3>
                      <div className="text-apple-blue font-bold mt-1">{formatPrice(p.price)}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Covered Area</span>
                        <span className="font-bold">{p.areaSize || p.size || "1 Kanal"}</span>
                      </div>
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Property Type</span>
                        <span className="font-bold capitalize">{p.propertyType || p.type || "Residential"}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Bedrooms</span>
                        <span className="font-bold">{p.beds || p.bedrooms || 0} Beds</span>
                      </div>
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Bathrooms</span>
                        <span className="font-bold">{p.baths || p.bathrooms || 0} Baths</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">Furnishing</span>
                        <span className="font-bold capitalize">{p.furnishedStatus || (p as any).furnishing || "Unfurnished"}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm py-4 border-b border-apple-border">
                        <span className="text-apple-text-muted">City / Location</span>
                        <span className="font-bold truncate max-w-[130px]">{p.city} • {p.location || p.society || "Prime"}</span>
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
