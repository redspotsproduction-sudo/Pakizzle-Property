import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Loader2, TrendingUp, Info, ShieldCheck, Gauge, ArrowRight, ArrowLeft, RefreshCw, Car, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getVehicleValuation, ValuationResult } from "../services/valuationService";
import { cn } from "../lib/utils";

const CONDITION_LEVELS = [
  {
    id: "excellent",
    title: "Excellent / Pristine",
    desc: "Looks & runs like new. Absolute zero paint defects or mechanical issues.",
    color: "border-apple-green text-apple-green bg-apple-green/5"
  },
  {
    id: "good",
    title: "Good / Standard",
    desc: "Minor cosmetic scratches. Regularly serviced and fully functional.",
    color: "border-apple-blue text-apple-blue bg-apple-blue/5"
  },
  {
    id: "fair",
    title: "Fair / Average",
    desc: "Visible wear and tear, some body scratches or denting. Fully drivable.",
    color: "border-amber-500 text-amber-500 bg-amber-500/5"
  }
];

export default function ValuationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | "loading" | "result">(1);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: 2024,
    mileage: 45000,
    condition: "good",
  });

  const loadingTexts = [
    "Querying local Classified Ads indexing engine...",
    "Computing regional inflation & currency curves...",
    "Adjusting for condition and mileage depreciation coefficients...",
    "Synthesizing live confidence analytics matrix..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "loading") {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => {
          if (prev >= loadingTexts.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Reset state when modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setResult(null);
    }
  }, [isOpen]);

  const handleNextStep = () => {
    if (formData.make.trim() && formData.model.trim()) {
      setStep(2);
    }
  };

  const handleValuate = async () => {
    setStep("loading");
    try {
      // Simulate slight delay to let gorgeous loader animate
      await new Promise((resolve) => setTimeout(resolve, 2800));
      
      const res = await getVehicleValuation(
        formData.make,
        formData.model,
        formData.year,
        formData.mileage,
        formData.condition
      );
      setResult(res);
      setStep("result");
    } catch (error) {
      console.error("Valuation failed:", error);
      setStep(2);
    }
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: 2024,
      mileage: 45000,
      condition: "good",
    });
    setResult(null);
    setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            id="valuation-modal-overlay"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-2xl border border-apple-border/50 dark:border-white/5 overflow-hidden flex flex-col"
            id="valuation-modal-container"
          >
            {/* Elegant Header */}
            <div className="p-6 sm:p-8 flex justify-between items-center border-b border-apple-border/30 dark:border-white/5 bg-apple-gray/20 dark:bg-white/2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-apple-blue/10 dark:bg-apple-blue/20 text-apple-blue">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-text">AI Smart Valuation</h2>
                  <p className="text-xs font-semibold text-apple-text-muted mt-0.5 uppercase tracking-wider">PAKISTAN CAR MARKET</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-apple-gray dark:hover:bg-white/5 rounded-full transition-colors text-apple-text-muted hover:text-apple-text"
                id="close-valuation-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper indicator line */}
            {step !== "loading" && step !== "result" && (
              <div className="w-full h-1 bg-apple-gray dark:bg-white/5 relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-apple-blue transition-all duration-500 ease-out"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            )}

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[75vh]">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-apple-blue/5 border border-apple-blue/10 p-4 rounded-2xl flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-apple-blue shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-apple-text-muted leading-relaxed">
                      Enter the basic manufacturing specifications below. Our custom local machine intelligence parses actual regional listings to build current market estimations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-apple-text-muted block">Manufacturer / Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota, Honda, Suzuki"
                        className="apple-input w-full dark:bg-white/5"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        id="val-input-make"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-apple-text-muted block">Vehicle Model Series</label>
                      <input
                        type="text"
                        placeholder="e.g. Corolla, Civic, Alto"
                        className="apple-input w-full dark:bg-white/5"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        id="val-input-model"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-apple-text-muted block">Model Year</label>
                    <select
                      className="apple-input w-full dark:bg-white/5"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      id="val-select-year"
                    >
                      {[...Array(30)].map((_, i) => (
                        <option key={i} value={2024 - i}>{2024 - i}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.make.trim() || !formData.model.trim()}
                      className={cn(
                        "apple-button-primary px-6 flex items-center justify-center gap-2",
                        (!formData.make.trim() || !formData.model.trim()) && "opacity-50 cursor-not-allowed"
                      )}
                      id="val-btn-next"
                    >
                      Next: Condition & Mileage
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-apple-text-muted">Total Mileage / Usage</label>
                      <span className="text-sm font-bold text-apple-blue font-mono bg-apple-blue/5 px-2.5 py-1 rounded-lg">
                        {formData.mileage.toLocaleString()} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300000"
                      step="5000"
                      className="w-full h-2 bg-apple-gray dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-apple-blue"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                      id="val-input-mileage-range"
                    />
                    <div className="flex justify-between text-[10px] text-apple-text-muted font-bold font-mono">
                      <span>0 KM</span>
                      <span>150,000 KM</span>
                      <span>300,000+ KM</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-apple-text-muted block">Current Structural Condition</label>
                    <div className="grid grid-cols-1 gap-3">
                      {CONDITION_LEVELS.map((level) => {
                        const isSelected = formData.condition === level.id;
                        return (
                          <button
                            key={level.id}
                            onClick={() => setFormData({ ...formData, condition: level.id })}
                            className={cn(
                              "text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5",
                              isSelected 
                                ? "border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 shadow-sm"
                                : "border-apple-border/40 dark:border-white/5 hover:border-apple-border hover:bg-apple-gray/35 dark:hover:bg-white/2"
                            )}
                            id={`val-cond-${level.id}`}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                              isSelected ? "border-apple-blue" : "border-apple-text-muted"
                            )}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-apple-blue" />}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-apple-text">{level.title}</div>
                              <div className="text-xs text-apple-text-muted mt-0.5 leading-relaxed">{level.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-apple-border/20 dark:border-white/5">
                    <button
                      onClick={() => setStep(1)}
                      className="apple-button-secondary py-2 px-5 flex items-center gap-1.5"
                      id="val-btn-back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleValuate}
                      className="apple-button-primary py-2.5 px-6 flex items-center gap-2"
                      id="val-btn-calculate"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Valuation
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "loading" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 rounded-full border-4 border-apple-blue/20 animate-pulse" />
                    <div className="w-16 h-16 rounded-full border-4 border-t-apple-blue border-r-apple-blue/40 border-b-apple-blue/10 border-l-apple-blue/60 animate-spin flex items-center justify-center" />
                    <Sparkles className="absolute w-6 h-6 text-apple-blue animate-bounce" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="font-bold text-lg text-apple-text">Analyzing Vehicle Parameters...</h3>
                    <div className="h-6 overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={loadingPhase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-xs font-semibold text-apple-blue tracking-wide uppercase font-mono"
                        >
                          {loadingTexts[loadingPhase]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="w-64 bg-apple-gray dark:bg-white/10 h-1.5 rounded-full mx-auto overflow-hidden mt-4">
                      <motion.div 
                        className="bg-apple-blue h-full rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.8, ease: "linear" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "result" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Visual Header specs badge */}
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-apple-gray/30 dark:bg-white/5 border border-apple-border/35 dark:border-white/5">
                    <div className="p-3 bg-white dark:bg-[#2C2C2E] rounded-xl text-apple-text shrink-0 shadow-sm">
                      <Car className="w-5 h-5 text-apple-blue" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-apple-text leading-tight">
                        {formData.year} {formData.make} {formData.model}
                      </h4>
                      <p className="text-xs font-semibold text-apple-text-muted mt-0.5 uppercase tracking-wider flex items-center gap-2">
                        <span>{formData.mileage.toLocaleString()} KM</span>
                        <span className="w-1 h-1 bg-apple-text-muted rounded-full inline-block" />
                        <span>{formData.condition.toUpperCase()} CONDITION</span>
                      </p>
                    </div>
                  </div>

                  {/* Main Price Card */}
                  <div className="relative text-center p-8 bg-gradient-to-br from-apple-blue/[0.04] to-apple-green/[0.04] dark:from-apple-blue/10 dark:to-apple-green/5 border border-apple-blue/10 dark:border-white/5 rounded-[24px] overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-apple-green bg-apple-green/10 border border-apple-green/20 animate-pulse">
                        <CheckCircle2 className="w-3 h-3" /> Live
                      </span>
                    </div>

                    <div className="text-xs font-bold text-apple-text-muted mb-2 uppercase tracking-widest">
                      Estimated Resale Value
                    </div>
                    <div className="text-3xl sm:text-5xl font-extrabold text-apple-blue leading-none tracking-tight my-2">
                      {result.estimatedValue.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-apple-text-muted font-bold font-mono uppercase tracking-widest mt-1">
                      PKR • PAKISTANI RUPEES
                    </p>
                  </div>

                  {/* Interactive Market Range Gauge SVG Graphic */}
                  <div className="p-5 border border-apple-border/40 dark:border-white/5 rounded-[22px] space-y-4 bg-white dark:bg-[#1D1D1F]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-apple-text uppercase tracking-wider">Estimated Market Spread</span>
                      <span className="text-[10px] font-bold text-apple-text-muted bg-apple-gray dark:bg-white/5 px-2 py-0.5 rounded-md">91% to 107% deviation</span>
                    </div>

                    <div className="relative pt-4 pb-2">
                      {/* Visual colored bar representing spread */}
                      <div className="w-full h-3 bg-apple-gray dark:bg-white/10 rounded-full relative">
                        {/* Highlights the range low to high */}
                        <div className="absolute left-[15%] right-[15%] h-full bg-gradient-to-r from-apple-blue/70 to-apple-green/70 rounded-full" />
                        
                        {/* Centered marker representing exact estimation point */}
                        <div 
                          className="absolute w-5 h-5 bg-apple-blue border-2 border-white dark:border-[#1C1C1E] rounded-full top-1/2 -translate-y-1/2 shadow-lg -translate-x-1/2 z-10 flex items-center justify-center cursor-pointer"
                          style={{ left: "50%" }}
                          title="Exact Valuation"
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>

                      {/* Tick Labels */}
                      <div className="flex justify-between text-[11px] font-bold mt-3">
                        <div className="text-left">
                          <span className="text-apple-text-muted text-[9px] block uppercase font-mono font-bold tracking-wider">Low Range</span>
                          <span className="text-apple-text font-mono">{result.marketRange.low.toLocaleString()}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-apple-blue text-[9px] block uppercase font-mono font-bold tracking-wider">Exact Match</span>
                          <span className="text-apple-blue font-mono font-extrabold">{result.estimatedValue.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-apple-text-muted text-[9px] block uppercase font-mono font-bold tracking-wider">High Range</span>
                          <span className="text-apple-text font-mono">{result.marketRange.high.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Analysis Commentary */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5 p-4.5 border border-apple-border/40 dark:border-white/5 rounded-[20px] bg-apple-gray/20 dark:bg-white/2">
                      <TrendingUp className="w-5 h-5 text-apple-blue shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-sm text-apple-text mb-1 flex items-center gap-1.5">
                          Market Trend Assessment
                          <span className="text-[9px] bg-apple-blue/10 text-apple-blue px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Stable</span>
                        </div>
                        <p className="text-xs sm:text-sm text-apple-text-muted leading-relaxed font-medium">
                          {result.analysis}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-apple-border/40 dark:border-white/5 rounded-[20px] bg-apple-gray/20 dark:bg-white/2">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-apple-blue" />
                        <span className="text-xs sm:text-sm font-bold text-apple-text">Data Confidence Rating</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-apple-gray dark:bg-white/15 h-2 rounded-full overflow-hidden shrink-0">
                          <div 
                            className="bg-apple-blue h-full rounded-full" 
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-apple-blue font-mono">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={resetForm}
                      className="apple-button-secondary py-2.5 rounded-2xl font-bold flex-1 flex items-center justify-center gap-1.5"
                      id="val-btn-another"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Evaluate Another Vehicle
                    </button>
                    <button
                      onClick={onClose}
                      className="apple-button-primary py-2.5 rounded-2xl font-bold flex-1"
                      id="val-btn-finish"
                    >
                      Done & Close
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
