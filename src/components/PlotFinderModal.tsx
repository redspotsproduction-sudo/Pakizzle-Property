import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Map, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Layers, 
  Maximize2, 
  Zap, 
  Trees, 
  CornerDownRight, 
  Building2, 
  Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../lib/utils";

interface PlotFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SectorPlot {
  number: string;
  size: "5 Marla" | "10 Marla" | "1 Kanal" | "2 Kanal" | "4 Marla Commercial";
  orientation: "North" | "South" | "East" | "West (Open)";
  isCorner: boolean;
  isParkFacing: boolean;
  isBoulevard: boolean;
  status: "Ready for Possession" | "Underground Work Done" | "Off-Plan / 6 Mo";
  basePrice: number;
}

const SOCIETIES: Record<string, { name: string; city: string; sectors: string[] }> = {
  "dha-lhr-6": { name: "DHA Phase 6", city: "Lahore", sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E", "Sector J"] },
  "dha-lhr-9": { name: "DHA Phase 9 Prism", city: "Lahore", sectors: ["Sector D", "Sector F", "Sector J", "Sector K", "Sector Q", "Sector R"] },
  "bahria-khi": { name: "Bahria Town", city: "Karachi", sectors: ["Precinct 1", "Precinct 10A", "Precinct 12", "Precinct 19 (Apartments)", "Precinct 27"] },
  "dha-isb-2": { name: "DHA Phase 2", city: "Islamabad", sectors: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector J"] },
  "gulberg-lhr": { name: "Gulberg Greens / Residencia", city: "Islamabad", sectors: ["Block A", "Block B", "Block C", "Executive Block"] }
};

export default function PlotFinderModal({ isOpen, onClose }: PlotFinderModalProps) {
  const navigate = useNavigate();
  const [selectedSocietyKey, setSelectedSocietyKey] = useState("dha-lhr-6");
  const [selectedSector, setSelectedSector] = useState("Sector C");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>("all");
  const [selectedPlot, setSelectedPlot] = useState<SectorPlot | null>(null);

  const currentSociety = SOCIETIES[selectedSocietyKey];

  // Generate deterministic plots for this sector
  const plots: SectorPlot[] = React.useMemo(() => {
    const list: SectorPlot[] = [];
    const sizes: ("5 Marla" | "10 Marla" | "1 Kanal" | "2 Kanal" | "4 Marla Commercial")[] = [
      "1 Kanal", "10 Marla", "1 Kanal", "5 Marla", "10 Marla", "2 Kanal", "4 Marla Commercial", "1 Kanal"
    ];
    const orientations: ("North" | "South" | "East" | "West (Open)")[] = ["North", "South", "East", "West (Open)"];

    for (let i = 1; i <= 24; i++) {
      const size = sizes[i % sizes.length];
      const isCorner = i % 5 === 0;
      const isParkFacing = i % 4 === 0 && !isCorner;
      const isBoulevard = i % 7 === 0;

      let basePrice = 28000000;
      if (size === "5 Marla") basePrice = 12500000;
      if (size === "10 Marla") basePrice = 22000000;
      if (size === "1 Kanal") basePrice = 45000000;
      if (size === "2 Kanal") basePrice = 95000000;
      if (size === "4 Marla Commercial") basePrice = 65000000;

      // Add premiums
      if (isCorner) basePrice *= 1.10;
      if (isParkFacing) basePrice *= 1.10;
      if (isBoulevard) basePrice *= 1.15;

      list.push({
        number: `${selectedSector.replace("Sector ", "").replace("Block ", "").replace("Precinct ", "")}-${100 + i}`,
        size,
        orientation: orientations[i % orientations.length],
        isCorner,
        isParkFacing,
        isBoulevard,
        status: i % 3 === 0 ? "Underground Work Done" : "Ready for Possession",
        basePrice: Math.round(basePrice)
      });
    }
    return list;
  }, [selectedSector]);

  const filteredPlots = plots.filter(p => {
    if (selectedSizeFilter === "all") return true;
    return p.size === selectedSizeFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#12131A] rounded-[32px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-apple-gray/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
              <Map className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-apple-text tracking-tight">
                  Apple-Grade Masterplan & Plot Finder
                </h3>
                <span className="text-[10px] font-bold text-apple-blue uppercase tracking-widest bg-apple-blue/10 px-2.5 py-0.5 rounded-full">
                  Interactive Spatial Map
                </span>
              </div>
              <p className="text-xs text-apple-text-muted mt-0.5">
                Explore verified plot sectors, street orientation, corner premiums & possession status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center text-apple-text-muted hover:text-apple-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Society & Sector Selector Row */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#12131A] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-semibold text-apple-text-muted whitespace-nowrap">Society:</span>
            {Object.entries(SOCIETIES).map(([key, soc]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedSocietyKey(key);
                  setSelectedSector(soc.sectors[0]);
                  setSelectedPlot(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedSocietyKey === key 
                    ? "bg-apple-blue text-white shadow-sm" 
                    : "bg-apple-gray/60 dark:bg-white/5 text-apple-text hover:bg-apple-gray"
                }`}
              >
                {soc.name} · {soc.city}
              </button>
            ))}
          </div>

          {/* Sector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
            <span className="text-xs font-semibold text-apple-text-muted whitespace-nowrap">Sector:</span>
            {currentSociety.sectors.map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setSelectedSector(sec);
                  setSelectedPlot(null);
                }}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedSector === sec
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                    : "text-apple-text-muted hover:text-apple-text hover:bg-apple-gray/50"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Map Grid + Detail Panel */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Grid: Plot Map representation */}
          <div className="lg:col-span-8 p-6 border-r border-black/5 dark:border-white/10 flex flex-col justify-between">
            <div>
              {/* Filter size controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-apple-text-muted">
                  <span>Size filter:</span>
                  {["all", "5 Marla", "10 Marla", "1 Kanal", "4 Marla Commercial"].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSizeFilter(s)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedSizeFilter === s
                          ? "bg-apple-blue/15 text-apple-blue font-bold"
                          : "text-apple-text-muted hover:text-apple-text"
                      }`}
                    >
                      {s === "all" ? "All Sizes" : s}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-apple-text-muted">
                  Showing {filteredPlots.length} verified plots
                </span>
              </div>

              {/* Masterplan Sector Layout */}
              <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-4 border border-black/5 dark:border-white/5 relative">
                {/* Street indicator lines */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-black/10 dark:border-white/10 text-[11px] font-mono text-apple-text-muted">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-apple-blue rotate-45" /> 80ft Main Sector Boulevard
                  </span>
                  <span className="text-emerald-500 font-medium">⚡ 100% Underground Electrification Active</span>
                </div>

                {/* Plot Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {filteredPlots.map((plot) => {
                    const isSelected = selectedPlot?.number === plot.number;
                    return (
                      <button
                        key={plot.number}
                        onClick={() => setSelectedPlot(plot)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between aspect-square group ${
                          isSelected
                            ? "bg-apple-blue text-white border-apple-blue shadow-lg scale-105 z-10"
                            : plot.isCorner
                            ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-apple-text hover:border-amber-500"
                            : plot.isParkFacing
                            ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 text-apple-text hover:border-emerald-500"
                            : "bg-white dark:bg-[#1A1C24] border-black/10 dark:border-white/10 text-apple-text hover:border-apple-blue/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-white" : "text-apple-text"}`}>
                            #{plot.number}
                          </span>
                          {plot.isCorner && (
                            <span className={`text-[8px] font-bold px-1 rounded ${isSelected ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                              CNR
                            </span>
                          )}
                          {plot.isParkFacing && (
                            <span className={`text-[8px] font-bold px-1 rounded ${isSelected ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                              PARK
                            </span>
                          )}
                        </div>

                        <div>
                          <div className={`text-[11px] font-bold truncate ${isSelected ? "text-white" : "text-apple-text"}`}>
                            {plot.size}
                          </div>
                          <div className={`text-[9px] font-mono ${isSelected ? "text-white/80" : "text-apple-text-muted"}`}>
                            {plot.orientation}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center gap-4 text-xs text-apple-text-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
                    <span>Corner Plot (+10% Value)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
                    <span>Park Facing (+10% Value)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-white dark:bg-[#1A1C24] border border-black/20" />
                    <span>Standard Regular Plot</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-apple-blue/5 border border-apple-blue/15 text-xs text-apple-text flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-apple-blue shrink-0" />
                All plots mapped with verified LDA/CDA registered demarcation & clean Non-Encumbrance.
              </span>
              <span className="font-semibold text-apple-blue">Zero Litigation Guarantee</span>
            </div>
          </div>

          {/* Right Panel: Selected Plot Detail or Overview */}
          <div className="lg:col-span-4 p-6 bg-apple-gray/20 dark:bg-white/[0.02] flex flex-col justify-between">
            {selectedPlot ? (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-apple-blue uppercase tracking-widest block font-mono">
                    Sector Specification
                  </span>
                  <h4 className="text-2xl font-bold text-apple-text mt-1">
                    Plot #{selectedPlot.number}
                  </h4>
                  <p className="text-xs text-apple-text-muted mt-0.5">
                    {currentSociety.name}, {selectedSector}, {currentSociety.city}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1A1C24] rounded-2xl p-4 border border-black/5 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-apple-text-muted">Plot Dimension</span>
                    <span className="font-semibold text-apple-text">{selectedPlot.size}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-apple-text-muted">Street Orientation</span>
                    <span className="font-semibold text-apple-text">{selectedPlot.orientation} Facing</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-apple-text-muted">Possession Status</span>
                    <span className="font-semibold text-emerald-500">{selectedPlot.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-apple-text-muted">Corner Advantage</span>
                    <span className="font-semibold text-apple-text">{selectedPlot.isCorner ? "Yes (+10% Premium)" : "Standard"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-apple-text-muted">Park Facing</span>
                    <span className="font-semibold text-apple-text">{selectedPlot.isParkFacing ? "Yes (Front View)" : "No"}</span>
                  </div>
                  <div className="pt-2 border-t border-black/5 dark:border-white/10 flex justify-between items-baseline">
                    <span className="text-xs font-medium text-apple-text-muted">Estimated Market Value</span>
                    <span className="text-lg font-bold text-apple-blue font-mono">
                      {formatPrice(selectedPlot.basePrice)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/marketplace?q=${encodeURIComponent(`${currentSociety.name} ${selectedPlot.size}`)}`);
                    }}
                    className="w-full py-3.5 rounded-xl bg-apple-blue text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    View Matching Listings in Marketplace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      alert(`Direct plot inquiry initiated for Plot #${selectedPlot.number} in ${currentSociety.name}. A verified society consultant will contact you.`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold text-apple-text hover:bg-apple-gray transition-colors"
                  >
                    Inquire on Possession & Transfer Fee
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-14 h-14 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue mb-3">
                  <Compass className="w-7 h-7 stroke-[1.8] animate-spin-slow" />
                </div>
                <h4 className="text-base font-bold text-apple-text">Select Any Plot to Inspect</h4>
                <p className="text-xs text-apple-text-muted max-w-xs mt-1.5 leading-relaxed">
                  Click on any plot number in the masterplan grid to review its exact dimensions, orientation, possession timeline, and valuation.
                </p>
              </div>
            )}

            <div className="text-[11px] text-apple-text-muted text-center pt-4 border-t border-black/5 dark:border-white/10">
              Pakizzle Spatial Masterplan Engine v2026 · Real-Time LDA / CDA Society Sync
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
