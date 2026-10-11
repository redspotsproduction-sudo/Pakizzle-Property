import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Loader2, TrendingUp, Info, ShieldCheck, Gauge, ArrowRight, ArrowLeft, RefreshCw, Home, CheckCircle2, Bed, Bath, Layers, DollarSign, ListCollapse, Calculator, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { getPropertyValuation, PropertyValuationResult, ValuationQueryParams } from "../services/valuationService";
import { cn } from "../lib/utils";

const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Faisalabad",
  "Multan",
  "Quetta",
  "Sialkot",
  "Gujranwala"
];

const PROPERTY_TYPES = [
  { id: "House", title: "House / Villa", desc: "Constructed residential structure" },
  { id: "Apartment", title: "Apartment / Flat", desc: "Multi-family residential unit" },
  { id: "Penthouse", title: "Penthouse", desc: "Premium top-floor luxury residence" },
  { id: "Plot", title: "Plot / Raw Land", desc: "Residential or commercial empty plotting" },
  { id: "Commercial", title: "Commercial Space", desc: "Shops, offices, or commercial buildings" }
];

const PROPERTY_CONDITIONS = [
  {
    id: "brand_new",
    title: "Brand New / Completed",
    desc: "Newly constructed structure, unused, built to modern layout standards.",
    color: "border-apple-green text-apple-green bg-apple-green/5 dark:bg-apple-green/10"
  },
  {
    id: "excellent",
    title: "Excellent / Premium",
    desc: "Very highly maintained, premium tile/marble flooring, updated fittings.",
    color: "border-sky-500 text-sky-500 bg-sky-500/5 dark:bg-sky-500/10"
  },
  {
    id: "good",
    title: "Good / Standard",
    desc: "Standard Pakistani brick/concrete layout, regular maintenance, fully ready.",
    color: "border-apple-blue text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10"
  },
  {
    id: "renovated",
    title: "Renovated Structure",
    desc: "Older structure but completely upgraded kitchens, baths, and wiring.",
    color: "border-purple-500 text-purple-500 bg-purple-500/5 dark:bg-purple-500/10"
  },
  {
    id: "fair",
    title: "Fair / Needs Repair",
    desc: "Has visible cosmetic or structural issues, paint updates, or damp checks needed.",
    color: "border-gold-decoration text-gold-decoration bg-gold-decoration/5 dark:bg-gold-decoration/10"
  }
];

const AVAILABLE_AMENITIES = [
  { id: "solar", title: "Solar Power / Hybrid Grid", desc: "Installed solar panels/hybrid backup" },
  { id: "corner", title: "Corner Plot Placement", desc: "Premium corner plot (double-road access)" },
  { id: "boulevard", title: "Main Boulevard Facing", desc: "Located directly on standard main boulevard" },
  { id: "basement", title: "Constructed Basement", desc: "Includes functional basement layout" },
  { id: "security", title: "Gated Comm / CCTV Setup", desc: "Located in walled sector with 24/7 guard security" }
];

// Helper to format values in Lakhs and Crores
function formatLacsCrores(val: number) {
  if (val >= 10000000) {
    const crore = val / 10000000;
    return `${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} Crore`;
  } else if (val >= 100000) {
    const lac = val / 100000;
    return `${lac % 1 === 0 ? lac.toFixed(0) : lac.toFixed(2)} Lac`;
  }
  return `${val.toLocaleString()} PKR`;
}

export default function ValuationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | "loading" | "result">(1);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<PropertyValuationResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"value" | "yield" | "tax" | "comparable">("value");

  // Property Form State
  const [propertyType, setPropertyType] = useState("House");
  const [city, setCity] = useState("Lahore");
  const [areaName, setAreaName] = useState("");
  const [size, setSize] = useState<number>(5);
  const [sizeUnit, setSizeUnit] = useState<"Marla" | "Kanal" | "Sq. Yards" | "Sq. Ft.">("Marla");
  const [beds, setBeds] = useState<number>(3);
  const [baths, setBaths] = useState<number>(3);
  const [floors, setFloors] = useState<string>("Double Story");
  const [condition, setCondition] = useState<string>("brand_new");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const loadingTexts = [
    "Querying regional registry transaction archives...",
    "Assessing localized FBR valuation indices...",
    "Computing construction commodity inflation metrics...",
    "Compiling active rental yields & tax brackets...",
    "Synthesizing high-confidence property estimation..."
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

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setResult(null);
      setActiveResultTab("value");
    }
  }, [isOpen]);

  // Handle Property Size Unit changes to sensible defaults
  useEffect(() => {
    if (sizeUnit === "Kanal") {
      setSize(1);
    } else if (sizeUnit === "Marla") {
      setSize(10);
    } else if (sizeUnit === "Sq. Yards") {
      setSize(240);
    } else if (sizeUnit === "Sq. Ft.") {
      setSize(2250);
    }
  }, [sizeUnit]);

  // Feature selection helper
  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleNextStep = () => {
    if (areaName.trim()) {
      setStep(2);
    }
  };

  const handleValuate = async () => {
    setStep("loading");
    try {
      // Small artificial delay to allow gorgeous loading texts to transition
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const isPlot = propertyType === "Plot";

      const queryParams: ValuationQueryParams = {
        propertyType,
        city,
        areaName,
        size,
        sizeUnit,
        beds: isPlot ? 0 : beds,
        baths: isPlot ? 0 : baths,
        condition: isPlot ? "raw_land" : condition,
        floors: isPlot ? "Not Applicable" : floors,
        features: selectedFeatures
      };

      const res = await getPropertyValuation(queryParams);
      setResult(res);
      setStep("result");
    } catch (error) {
      console.error("Property valuation calculation failed:", error);
      setStep(2);
    }
  };

  const resetForm = () => {
    setPropertyType("House");
    setCity("Lahore");
    setAreaName("");
    setSize(5);
    setSizeUnit("Marla");
    setBeds(3);
    setBaths(3);
    setFloors("Double Story");
    setCondition("brand_new");
    setSelectedFeatures([]);
    setResult(null);
    setStep(1);
    setActiveResultTab("value");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md"
            id="valuation-modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-[var(--bg-raised)] rounded-[32px] shadow-2xl border border-neutral-200/50 dark:border-neutral-800/60 overflow-hidden flex flex-col max-h-[90vh]"
            id="valuation-modal-container"
          >
            {/* Elegant Header */}
            <div className="p-5 sm:p-6 flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-apple-green/10 dark:bg-apple-green/25 text-apple-green dark:text-apple-green">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">AI Property Valuation</h2>
                  <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Pakistan Real Estate Hub</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                id="close-valuation-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper indicator line */}
            {step !== "loading" && step !== "result" && (
              <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 relative">
                <div
                  className="absolute left-0 top-0 h-full bg-apple-green transition-all duration-500 ease-out"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            )}

            {/* Content Body - Scrollable */}
            <div className="p-5 sm:p-6 md:p-8 overflow-y-auto flex-1">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="space-y-6"
                >
                  {/* Top Banner Info */}
                  <div className="bg-apple-green/[0.04] border border-apple-green/15 p-4 rounded-2xl flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-apple-green shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                      Estimate any residential, plot, or commercial valuation. Our valuation engine utilizes real localized listings, regional inflation curves, and FBR tax multipliers.
                    </p>
                  </div>

                  {/* Property Type Grid Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Property Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PROPERTY_TYPES.map((type) => {
                        const isSelected = propertyType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setPropertyType(type.id)}
                            className={cn(
                              "text-left p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between h-20",
                              isSelected
                                ? "border-apple-green bg-apple-green/[0.03] dark:bg-apple-green/10 shadow-sm"
                                : "border-neutral-200/50 dark:border-neutral-800 hover:border-neutral-300 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/30"
                            )}
                            id={`val-type-${type.id}`}
                          >
                            <span className={cn("font-bold text-xs", isSelected ? "text-apple-green dark:text-apple-green" : "text-neutral-800 dark:text-neutral-200")}>
                              {type.title}
                            </span>
                            <span className="text-[9px] text-neutral-500 dark:text-neutral-400 leading-tight">
                              {type.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* City & Area Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Metropolitan City</label>
                      <select
                        className="apple-input w-full dark:bg-neutral-800"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        id="val-city-select"
                      >
                        {PAKISTAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Sector / Locality Name</label>
                      <input
                        type="text"
                        placeholder="e.g. DHA Phase 6, Clifton, G-11, Gulberg"
                        className="apple-input w-full dark:bg-neutral-800"
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                        id="val-area-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Dimensions & Size Row */}
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Land / Area Dimensions</h4>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Define unit and precise numeric size</p>
                      </div>
                      <div className="flex bg-neutral-200/50 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        {(["Marla", "Kanal", "Sq. Yards", "Sq. Ft."] as const).map((unit) => (
                          <button
                            key={unit}
                            onClick={() => setSizeUnit(unit)}
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
                              sizeUnit === unit
                                ? "bg-white dark:bg-[var(--bg-inset)] shadow-sm text-apple-green dark:text-apple-green"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
                            )}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        className="apple-input font-mono font-bold text-center w-28 text-apple-green dark:text-apple-green text-lg py-2.5 dark:bg-neutral-800"
                        value={size}
                        onChange={(e) => setSize(Math.max(1, Number(e.target.value)))}
                        id="val-size-input"
                      />
                      <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400 italic">
                        {sizeUnit === "Marla" && `Approx. ${(size * 225).toLocaleString()} Sq. Ft. / ${(size * 25).toLocaleString()} Sq. Yards`}
                        {sizeUnit === "Kanal" && `Approx. ${(size * 20).toLocaleString()} Marlas / ${(size * 4500).toLocaleString()} Sq. Ft.`}
                        {sizeUnit === "Sq. Yards" && `Approx. ${(size * 9).toLocaleString()} Sq. Ft. (${(size / 30.25).toFixed(1)} Marla)`}
                        {sizeUnit === "Sq. Ft." && `Approx. ${(size / 9).toFixed(1)} Sq. Yards (${(size / 225).toFixed(1)} Marla)`}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleNextStep}
                      disabled={!areaName.trim()}
                      className={cn(
                        "apple-button-primary px-6 flex items-center justify-center gap-2",
                        !areaName.trim() && "opacity-50 cursor-not-allowed"
                      )}
                      id="val-btn-next-step"
                    >
                      Next: Structure & Amenities
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-6"
                >
                  {/* Grid details shown only if NOT a raw plot */}
                  {propertyType !== "Plot" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Bed Selector */}
                      <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-neutral-400" /> Bedrooms
                        </label>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setBeds(Math.max(1, beds - 1))}
                            className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-base text-neutral-800 dark:text-white">{beds}</span>
                          <button
                            onClick={() => setBeds(Math.min(10, beds + 1))}
                            className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Bath Selector */}
                      <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-neutral-400" /> Bathrooms
                        </label>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setBaths(Math.max(1, baths - 1))}
                            className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-base text-neutral-800 dark:text-white">{baths}</span>
                          <button
                            onClick={() => setBaths(Math.min(10, baths + 1))}
                            className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Floors Select */}
                      <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-neutral-400" /> Floors
                        </label>
                        <select
                          className="apple-input w-full text-xs font-bold py-1.5 mt-1 border-neutral-300 dark:bg-neutral-800"
                          value={floors}
                          onChange={(e) => setFloors(e.target.value)}
                        >
                          <option value="Single Story">Single Story</option>
                          <option value="Double Story">Double Story</option>
                          <option value="Triple Story">Triple Story</option>
                          <option value="Multi-Story">Multi-Story</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gold-decoration/5 border border-gold-decoration/15 p-4 rounded-xl flex gap-3 items-center">
                      <Info className="w-5 h-5 text-gold-decoration shrink-0" />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
                        Empty plot valuation automatically omits bedroom, bathroom, and building structure filters. Value is computed strictly as raw land plotting equity.
                      </p>
                    </div>
                  )}

                  {/* Construction Condition Selection (Only for constructed properties) */}
                  {propertyType !== "Plot" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Structural Condition</label>
                      <div className="grid grid-cols-1 gap-2">
                        {PROPERTY_CONDITIONS.map((cond) => {
                          const isSelected = condition === cond.id;
                          return (
                            <button
                              key={cond.id}
                              onClick={() => setCondition(cond.id)}
                              className={cn(
                                "text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3",
                                isSelected
                                  ? "border-apple-green bg-apple-green/[0.02] dark:bg-apple-green/10 shadow-sm"
                                  : "border-neutral-200/50 dark:border-neutral-800/60 hover:border-neutral-300 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/20"
                              )}
                              id={`val-cond-${cond.id}`}
                            >
                              <div className={cn(
                                "w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                                isSelected ? "border-apple-green" : "border-neutral-400"
                              )}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-apple-green" />}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 block">{cond.title}</span>
                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight block mt-0.5">{cond.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Premium Locational & Amenity features */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Premium Features & Attributes</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_AMENITIES.map((amenity) => {
                        const isSelected = selectedFeatures.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            onClick={() => toggleFeature(amenity.id)}
                            className={cn(
                              "text-left p-3 rounded-xl border transition-all flex items-start gap-3",
                              isSelected
                                ? "border-apple-green bg-apple-green/[0.02] dark:bg-apple-green/5 shadow-sm"
                                : "border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                              isSelected ? "border-apple-green bg-apple-green text-white" : "border-neutral-400"
                            )}>
                              {isSelected && <span className="text-[9px] font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 block leading-none">{amenity.title}</span>
                              <span className="text-[9px] text-neutral-500 dark:text-neutral-400 leading-tight block mt-1">{amenity.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Back and Calculation Actions */}
                  <div className="pt-4 flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => setStep(1)}
                      className="apple-button-secondary py-2 px-4 flex items-center gap-1.5"
                      id="val-btn-back-step"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleValuate}
                      className="apple-button-primary bg-apple-green hover:bg-apple-green border-apple-green dark:border-apple-green hover:border-apple-green text-white py-2.5 px-6 flex items-center gap-2"
                      id="val-btn-generate"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Property Valuation
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
                    <div className="absolute w-20 h-20 rounded-full border-4 border-apple-green/20 animate-pulse" />
                    <div className="w-16 h-16 rounded-full border-4 border-t-apple-green border-r-apple-green/40 border-b-apple-green/10 border-l-apple-green/60 animate-spin flex items-center justify-center" />
                    <Home className="absolute w-6 h-6 text-apple-green animate-bounce" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-white">Analyzing Real Estate Metrics...</h3>
                    <div className="h-6 overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={loadingPhase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-xs font-semibold text-apple-green dark:text-apple-green tracking-wide uppercase font-mono"
                        >
                          {loadingTexts[loadingPhase]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="w-64 bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mx-auto overflow-hidden mt-4">
                      <motion.div
                        className="bg-apple-green h-full rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
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
                  {/* Property Specifications Summary Header Card */}
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/80">
                    <div className="p-3 bg-white dark:bg-[var(--bg-inset)] rounded-xl text-apple-green shrink-0 shadow-sm border border-neutral-100 dark:border-neutral-800">
                      <Home className="w-5 h-5 text-apple-green" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-neutral-900 dark:text-white leading-tight">
                        {size} {sizeUnit} {propertyType}
                      </h4>
                      <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5 uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                        <span>{areaName}, {city}</span>
                        {propertyType !== "Plot" && (
                          <>
                            <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full inline-block" />
                            <span>{beds} Bed • {baths} Bath</span>
                          </>
                        )}
                        <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full inline-block" />
                        <span>{condition.replace("_", " ")}</span>
                      </p>
                    </div>
                  </div>

                  {/* Main Estimation Hero Box */}
                  <div className="relative text-center p-7 bg-gradient-to-br from-apple-green/[0.04] to-sky-500/[0.04] dark:from-apple-surface/20 dark:to-sky-950/10 border border-apple-green/10 dark:border-apple-green/20 rounded-[24px] overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-apple-green bg-apple-green/10 border border-apple-green/20 animate-pulse">
                        <CheckCircle2 className="w-3 h-3" /> AI Validated
                      </span>
                    </div>

                    <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-widest">
                      Estimated Market Valuation
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-apple-green dark:text-apple-green leading-none tracking-tight my-1">
                      {formatLacsCrores(result.estimatedValue)}
                    </div>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono uppercase tracking-widest mt-1">
                      PKR • Approx. {result.estimatedValue.toLocaleString()} Pakistani Rupees
                    </p>
                  </div>

                  {/* Interactive Tabbed Valuation details */}
                  <div className="space-y-4">
                    {/* Navigation tabs */}
                    <div className="flex border-b border-neutral-100 dark:border-neutral-800 gap-1 overflow-x-auto pb-0.5">
                      {[
                        { id: "value", title: "Valuation Spread", icon: Gauge },
                        { id: "yield", title: "Rental Cashflow", icon: TrendingUp },
                        { id: "tax", title: "Government Taxes", icon: Calculator },
                        { id: "comparable", title: "Comparables", icon: ListCollapse }
                      ].map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeResultTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveResultTab(tab.id as any)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all",
                              isActive
                                ? "border-apple-green text-apple-green dark:text-apple-green"
                                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-200"
                            )}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            {tab.title}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab panels */}
                    <div>
                      {/* VALUE TAB */}
                      {activeResultTab === "value" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="p-4 border border-neutral-200/50 dark:border-neutral-800 rounded-[22px] space-y-4 bg-neutral-50/20 dark:bg-neutral-900/10">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Estimated Market Spread</span>
                              <span className="text-[9px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">±8% standard deviation</span>
                            </div>

                            <div className="relative pt-3 pb-2">
                              {/* Range bar */}
                              <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full relative">
                                <div className="absolute left-[15%] right-[15%] h-full bg-gradient-to-r from-apple-green/70 to-sky-500/70 rounded-full" />
                                <div
                                  className="absolute w-4.5 h-4.5 bg-apple-green border-2 border-white dark:border-[var(--bg-raised)] rounded-full top-1/2 -translate-y-1/2 shadow-md -translate-x-1/2 z-10 flex items-center justify-center cursor-pointer"
                                  style={{ left: "50%" }}
                                >
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              </div>

                              {/* Tick Labels */}
                              <div className="flex justify-between text-[10px] font-bold mt-3">
                                <div className="text-left">
                                  <span className="text-[8px] text-neutral-400 block uppercase font-mono tracking-wider">Low Range Resale</span>
                                  <span className="text-neutral-700 dark:text-neutral-300 font-mono">{formatLacsCrores(result.marketRange.low)}</span>
                                </div>
                                <div className="text-center">
                                  <span className="text-apple-green text-[8px] block uppercase font-mono tracking-wider">Exact Valuation</span>
                                  <span className="text-apple-green font-mono font-extrabold">{formatLacsCrores(result.estimatedValue)}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-neutral-400 block uppercase font-mono tracking-wider">High Range Resale</span>
                                  <span className="text-neutral-700 dark:text-neutral-300 font-mono">{formatLacsCrores(result.marketRange.high)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Assessment Paragraph */}
                          <div className="p-4.5 border border-neutral-150 dark:border-neutral-800/80 rounded-[20px] bg-neutral-50/50 dark:bg-neutral-900/10 space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-apple-green" />
                                Local Market Trend Analysis
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-apple-green/10 text-apple-green dark:text-apple-green uppercase tracking-wide">
                                Price Trend: {result.priceTrend}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                              {result.analysis}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* YIELD TAB */}
                      {activeResultTab === "yield" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          {propertyType !== "Plot" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4.5 bg-neutral-50/30 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-800 rounded-2xl flex flex-col justify-between space-y-4">
                                <div>
                                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Estimated Monthly Rent</span>
                                  <span className="text-2xl font-extrabold text-neutral-800 dark:text-white block mt-1">
                                    {formatLacsCrores(result.investmentYield.estimatedRent)} <span className="text-xs font-semibold text-neutral-500">/ mo</span>
                                  </span>
                                  <span className="text-[10px] text-neutral-500 block mt-1 font-mono">
                                    ~ PKR {result.investmentYield.estimatedRent.toLocaleString()} monthly
                                  </span>
                                </div>
                                <p className="text-[10px] text-neutral-500 leading-relaxed">
                                  Computed based on local demand densities, layout beds/baths availability, and regional rental averages.
                                </p>
                              </div>

                              <div className="p-4.5 bg-neutral-50/30 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-800 rounded-2xl flex flex-col justify-between space-y-4">
                                <div>
                                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Gross Rental Yield (Annual)</span>
                                  <span className="text-2xl font-extrabold text-apple-green block mt-1">
                                    {result.investmentYield.grossYield}%
                                  </span>
                                  <span className="text-[10px] text-neutral-500 block mt-1 font-mono">
                                    Annual rent relative to resale value
                                  </span>
                                </div>
                                <p className="text-[10px] text-neutral-500 leading-relaxed">
                                  Standard property yields in Pakistan vary from 3.5% (large houses) to 8.5% (highly packed commercial offices).
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl space-y-2">
                              <Info className="w-8 h-8 text-neutral-400 mx-auto" />
                              <h5 className="font-bold text-xs text-neutral-800 dark:text-neutral-200">Plots Do Not Generate Direct Rent</h5>
                              <p className="text-[10px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                Raw plot assets do not generate standard monthly lease cashflow. Real estate return is generated entirely through raw land speculation and development capital gains.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* TAX TAB */}
                      {activeResultTab === "tax" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-gold-decoration/[0.03] border border-gold-decoration/15 p-4 rounded-xl flex gap-3 items-start">
                            <Info className="w-4 h-4 text-gold-decoration shrink-0 mt-0.5" />
                            <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
                              Pakistan Government property transfer taxes are determined by tax residency status (FBR Active Filer vs Non-Filer). Rates vary according to budget modifications in 2024-2026.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* ACTIVE FILER CARD */}
                            <div className="p-4.5 bg-apple-green/[0.02] dark:bg-apple-surface/5 border border-apple-green/10 dark:border-apple-green/20 rounded-2xl space-y-3.5">
                              <div className="flex justify-between items-center border-b border-apple-green/10 pb-2">
                                <span className="font-extrabold text-xs text-apple-green dark:text-apple-green">Active Taxpayer (Filer)</span>
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-apple-green/10 text-apple-green uppercase tracking-widest">Optimized</span>
                              </div>
                              <div className="space-y-2 text-xs font-semibold">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">FBR Advance Tax (3%)</span>
                                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatLacsCrores(result.taxBreakdown.filerFbrTax)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Provincial Stamp Duty (2%)</span>
                                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatLacsCrores(result.taxBreakdown.stampDuty)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Transfer/Registry Fee (1%)</span>
                                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatLacsCrores(result.taxBreakdown.transferFee)}</span>
                                </div>
                                <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2 font-bold text-neutral-900 dark:text-white">
                                  <span>Total Transfer Cost</span>
                                  <span className="font-mono text-apple-green dark:text-apple-green">
                                    {formatLacsCrores(result.taxBreakdown.filerFbrTax + result.taxBreakdown.stampDuty + result.taxBreakdown.transferFee)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* NON FILER CARD */}
                            <div className="p-4.5 bg-apple-red/[0.02] dark:bg-rose-950/5 border border-apple-red/10 dark:border-apple-red/20 rounded-2xl space-y-3.5">
                              <div className="flex justify-between items-center border-b border-apple-red/10 pb-2">
                                <span className="font-extrabold text-xs text-apple-red dark:text-rose-400">Non-Taxpayer (Non-Filer)</span>
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-apple-red/10 text-apple-red uppercase tracking-widest">Penalty Rate</span>
                              </div>
                              <div className="space-y-2 text-xs font-semibold">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">FBR Advance Tax (10%)</span>
                                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatLacsCrores(result.taxBreakdown.nonFilerFbrTax)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Provincial Stamp Duty (2%)</span>
                                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatLacsCrores(result.taxBreakdown.stampDuty)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Transfer/Registry Fee (1%)</span>
                                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatLacsCrores(result.taxBreakdown.transferFee)}</span>
                                </div>
                                <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2 font-bold text-neutral-900 dark:text-white">
                                  <span>Total Transfer Cost</span>
                                  <span className="font-mono text-apple-red dark:text-rose-400">
                                    {formatLacsCrores(result.taxBreakdown.nonFilerFbrTax + result.taxBreakdown.stampDuty + result.taxBreakdown.transferFee)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* COMPARABLE TAB */}
                      {activeResultTab === "comparable" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="border border-neutral-150 dark:border-neutral-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[9px] font-bold">
                                <tr>
                                  <th className="p-3">Reference Listing</th>
                                  <th className="p-3">Size</th>
                                  <th className="p-3 text-right">Estimated Resale</th>
                                  <th className="p-3 text-right">Verification</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-semibold text-neutral-800 dark:text-neutral-200">
                                {result.comparableProperties.map((comp, idx) => (
                                  <tr key={idx} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10 transition-colors">
                                    <td className="p-3 flex items-center gap-1.5">
                                      <Home className="w-3.5 h-3.5 text-neutral-400" />
                                      {comp.title}
                                    </td>
                                    <td className="p-3 font-mono">{comp.size}</td>
                                    <td className="p-3 text-right font-mono text-apple-green dark:text-apple-green">{formatLacsCrores(comp.price)}</td>
                                    <td className="p-3 text-right">
                                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold">
                                        {comp.source}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-[10px] text-neutral-400 italic text-right">
                            *Comparables computed using active listings and verified agent transactions.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Trust indicator */}
                  <div className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-[20px] bg-neutral-50/35 dark:bg-neutral-900/10">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-apple-green shrink-0" />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">AI Estimation Confidence Matrix</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden shrink-0">
                        <div
                          className="bg-apple-green h-full rounded-full"
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-apple-green dark:text-apple-green font-mono">
                        {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Result Actions */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={resetForm}
                      className="apple-button-secondary py-2.5 rounded-2xl font-bold flex-1 flex items-center justify-center gap-1.5"
                      id="val-btn-another-property"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Evaluate Another Property
                    </button>
                    <button
                      onClick={onClose}
                      className="apple-button-primary bg-apple-green hover:bg-apple-green border-apple-green hover:border-apple-green text-white py-2.5 rounded-2xl font-bold flex-1"
                      id="val-btn-result-close"
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
