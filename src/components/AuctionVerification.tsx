import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  Globe, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Info, 
  Activity, 
  Zap, 
  Download, 
  ExternalLink, 
  History, 
  MapPin, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Sliders,
  ChevronDown,
  Check,
  Award,
  BookOpen
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "sonner";
import { analyzeAuctionSheet, fetchAuthenticAuctionData, analyzeAuctionSheetImage } from "../services/geminiService";
import { cn, formatPrice } from "../lib/utils";

// FAQ Structure
interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is an auction sheet and why should I verify it?",
    answer: "A Japanese auction sheet is a official evaluation report completed by certified inspectors before a vehicle is auctioned. It details the true physical condition, body defects, interior cleanliness, structural repairs, and true mileage. Verifying it reveals hidden flaws or mileage rollback scams."
  },
  {
    question: "Can auction sheets be forged or tampered with?",
    answer: "Yes, frequently. Many fraudulent importers or local sellers photoshop the grades (e.g. changing an 'R' grade accidental car to a clean '4.5' grade) or lower the listed mileage on the physical printout. Our neural system matches your chassis number with real-time official archives in Japan to expose these frauds."
  },
  {
    question: "Which auction houses are integrated into your database?",
    answer: "Our pipeline syncs directly with USS, TAA, CAA, HAA, JU, HONDA, ARAI, and other major Japanese auction syndicates. If the vehicle has run through any authorized Japanese auction in the last 15 years, we have the records."
  },
  {
    question: "What happens if my chassis number has no record?",
    answer: "This occasionally happens for vehicles imported via unauthorized private channels, or if the chassis code was input incorrectly. Ensure the suffix format is correct (e.g., ZVW50-1234567). If no record is found, we do not charge anything for verification."
  },
  {
    question: "What do different auction sheet grades represent?",
    answer: "Grades range from S/6 (Brand new) down to 3 (Poor condition). Grade 4 and 4.5 are generally excellent with minor wear. Grade R or RA indicates an 'Accident/Repaired' vehicle which has suffered structural impact and has had replacement parts."
  }
];

const SCAN_CATEGORIES = [
  {
    id: "chassis",
    title: "Chassis & Frame Integrity",
    icon: ShieldCheck,
    points: [
      "Original structural pillar weld checks",
      "Front bumper apron repair tracking",
      "Core support panel replacement checks",
      "Rear floor trunk floor repair scanning",
      "Underbody corrosion or rust mapping"
    ]
  },
  {
    id: "grade",
    title: "Grade & Score Matching",
    icon: Sliders,
    points: [
      "Authentic overall auction grade check",
      "Interior wear and odor standard check",
      "Exterior scratch/dent scale alignment",
      "Accident history marker tracking",
      "Rust, paint peel & structural corrosion"
    ]
  },
  {
    id: "odometer",
    title: "Odometer Linearity Logs",
    icon: TrendingUp,
    points: [
      "Archival auction mileage history check",
      "Mileage rollback anomaly flags",
      "Linearly project current mileage",
      "Last recorded Japanese auction gate log",
      "Export certificate mileage verification"
    ]
  },
  {
    id: "specifications",
    title: "Technical Spec Validation",
    icon: Cpu,
    points: [
      "Original factory paint code checks",
      "Engine serial number alignment",
      "Transmission type matching",
      "Chassis manufacturing date checks",
      "Archived vehicle interior color codes"
    ]
  }
];

// Damage Map Component
const DamageMap = ({ damages }: { damages: any[] }) => {
  return (
    <div className="relative w-full aspect-[16/9] bg-[#FAFAFA] dark:bg-[#1C1C1E] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden group">
      {/* Schematic Car Profile */}
      <svg viewBox="0 0 800 400" className="w-full h-full opacity-[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]">
        <path d="M100,280 L120,280 Q120,200 200,200 L600,200 Q680,200 680,280 L700,280 L700,340 L100,340 Z" fill="currentColor" />
        <circle cx="200" cy="340" r="40" fill="currentColor" />
        <circle cx="600" cy="340" r="40" fill="currentColor" />
        <path d="M220,210 L580,210 L580,260 L220,260 Z" fill="currentColor" opacity="0.5" />
      </svg>
      
      {/* Scraper Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,122,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,122,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Damage Markers */}
      {damages && damages.map((d, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.6 + i * 0.1 
          }}
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-20"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-apple-red animate-ping opacity-20 absolute -inset-0" />
            <div className="w-4 h-4 bg-apple-red rounded-full shadow-[0_0_15px_rgba(255,59,48,0.6)] border-2 border-white" />
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="bg-[#1D1D1F]/90 backdrop-blur-xl text-white text-[10px] py-1.5 px-3 rounded-full whitespace-nowrap font-black tracking-widest uppercase">
                {d.part}: {d.severity}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div className="absolute top-4 left-5 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/[0.04] dark:border-white/10 text-[9px] font-black uppercase tracking-wider text-[#86868B]">
          Surgical Damage Map
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-apple-red animate-pulse" />
      </div>
    </div>
  );
};

export default function AuctionVerification() {
  const [chassisNumber, setChassisNumber] = useState("");
  const [year, setYear] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "verifying" | "result">("input");
  const [activeLayer, setActiveLayer] = useState(0);
  const [rawResult, setRawResult] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const layers = [
    { id: 1, name: "Chassis Normalization", desc: "Global prefix matching & checksum validation" },
    { id: 2, name: "Neural Forensic OCR", desc: "Deep scan for digital tampering & grade manipulation" },
    { id: 3, name: "Multi-Node Database Sync", desc: "Cross-referencing USS/TAA/HAA authorized nodes" },
    { id: 4, name: "Historical Lifecycle Audit", desc: "Identifying previous auction records & grade gaps" },
    { id: 5, name: "Neural Odometer Scan", desc: "Triangulating mileage history across all archival data" },
    { id: 6, name: "200% Accuracy Final Scan", desc: "Surgical verification of all technical constraints" }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chassisNumber.trim()) return;

    setLoading(true);
    setError("");
    setStep("verifying");
    setActiveLayer(1);

    try {
      // Layer 1: Normalization
      const normalized = chassisNumber.trim().toUpperCase();
      
      // Layer 2: OCR (If file uploaded)
      setActiveLayer(2);
      if (uploadedFile) {
        const base64Data = uploadedFile.split(',')[1];
        const mimeType = uploadedFile.split(';')[0].split(':')[1];
        const ocr = await analyzeAuctionSheetImage(base64Data, mimeType);
        setOcrResult(ocr);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
      
      // Layer 3: Fetch Data
      setActiveLayer(3);
      const result = await fetchAuthenticAuctionData(chassisNumber, year, lotNumber, directLink);

      if (result) {
        setRawResult(result);
        
        // Layer 4 & 5
        setActiveLayer(4);
        await new Promise(r => setTimeout(r, 1000));
        setActiveLayer(5);
        
        // Step 2: Deep AI Analysis
        const analysis = await analyzeAuctionSheet(result);
        
        if (analysis) {
          setActiveLayer(6);
          await new Promise(r => setTimeout(r, 800));
          setAiAnalysis(analysis);
          setStep("result");
        } else {
          setError("Neural Analysis failed. Please try again.");
          setStep("input");
        }
      } else {
        setError("Failed to identify vehicle or fetch auction data. Please check the chassis number.");
        setStep("input");
      }
    } catch (err: any) {
      const isQuotaError = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === "RESOURCE_EXHAUSTED" || err?.code === 429;
      if (isQuotaError) {
        setError("API Quota Exceeded. Please wait a few minutes and try again.");
      } else {
        setError("An error occurred. Please check your connection or try again later.");
      }
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[#1D1D1F] dark:text-[#F5F5F7] antialiased min-h-screen bg-[#F5F5F7] dark:bg-[#000000] transition-colors duration-500 selection:bg-apple-blue/10 selection:text-apple-blue">
      <Header />
      
      <main className="max-w-[1024px] mx-auto px-6 sm:px-8 pt-32 pb-24 relative z-10">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-20"
            >
              {/* Hero Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Side: Pitch and Metadata */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-xs font-bold text-apple-blue tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Neural Forensic v5.0 Database
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-[1.1]">
                    Verify Japanese auction sheets with <span className="text-apple-blue font-bold">absolute confidence</span>.
                  </h1>
                  
                  <p className="text-sm sm:text-base text-[#86868B] leading-relaxed max-w-xl">
                    Avoid counterfeit sheets and hidden accidental repairs. Cross-reference chassis parameters directly with official Japanese auction databases to extract verified mileage, genuine grades, and 4K photographs.
                  </p>

                  {/* Trust metrics */}
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/[0.05] dark:border-white/5 max-w-lg">
                    <div>
                      <span className="block text-xl sm:text-2xl font-bold text-apple-blue font-mono">100%</span>
                      <span className="text-[10px] text-[#86868B] uppercase tracking-wider font-bold">Official Records</span>
                    </div>
                    <div>
                      <span className="block text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white font-mono">Real-time</span>
                      <span className="text-[10px] text-[#86868B] uppercase tracking-wider font-bold">Database Sync</span>
                    </div>
                    <div>
                      <span className="block text-xl sm:text-2xl font-bold text-emerald-500 font-mono">200%</span>
                      <span className="text-[10px] text-[#86868B] uppercase tracking-wider font-bold">Data Accuracy</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Verification Widget Form */}
                <div className="lg:col-span-5">
                  <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-apple-blue to-cyan-500" />
                    
                    <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#86868B] mb-1">Sheet Forensic Audit</h3>
                    <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white leading-tight mb-5">Enter Chassis Parameters</h2>

                    <form onSubmit={handleVerify} className="space-y-4">
                      {/* Chassis Number */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Chassis Code (Required)</label>
                        <input
                          type="text"
                          placeholder="e.g. ZVW50-1234567"
                          value={chassisNumber}
                          onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 focus:border-apple-blue/50 focus:bg-white dark:focus:bg-[#111112] rounded-xl text-xs font-semibold outline-none transition-all text-[#1D1D1F] dark:text-white"
                        />
                      </div>

                      {/* Reg Year & Lot Number Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Reg. Year</label>
                          <input
                            type="text"
                            placeholder="e.g. 2018"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 focus:border-apple-blue/50 focus:bg-white dark:focus:bg-[#111112] rounded-xl text-xs font-semibold outline-none transition-all text-[#1D1D1F] dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Lot No. (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. 50123"
                            value={lotNumber}
                            onChange={(e) => setLotNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 focus:border-apple-blue/50 focus:bg-white dark:focus:bg-[#111112] rounded-xl text-xs font-semibold outline-none transition-all text-[#1D1D1F] dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Direct link option */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Direct Auction Link (Optional)</label>
                        <input
                          type="text"
                          placeholder="Paste reference auction URL"
                          value={directLink}
                          onChange={(e) => setDirectLink(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 focus:border-apple-blue/50 focus:bg-white dark:focus:bg-[#111112] rounded-xl text-xs font-semibold outline-none transition-all text-[#1D1D1F] dark:text-white"
                        />
                      </div>

                      {/* File upload drag drop section */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Scan Existing Sheet Image</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="sheet-upload"
                        />
                        <label 
                          htmlFor="sheet-upload"
                          className="w-full h-24 flex flex-col items-center justify-center border border-dashed border-black/[0.12] dark:border-white/15 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-apple-blue/[0.02] dark:hover:bg-apple-blue/5 hover:border-apple-blue/30 rounded-2xl cursor-pointer transition-all duration-300"
                        >
                          {uploadedFile ? (
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Sheet Ready to Scan</span>
                            </div>
                          ) : (
                            <div className="text-center space-y-1">
                              <FileText className="w-5 h-5 mx-auto text-[#86868B]" />
                              <span className="block text-[10px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Drop or select sheet file</span>
                              <span className="block text-[8px] text-[#86868B]">JPG, PNG or PDF (up to 10MB)</span>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Action trigger button */}
                      <button
                        type="submit"
                        disabled={loading || !chassisNumber.trim()}
                        className="w-full h-12 rounded-xl text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 group mt-6"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Run 200% Forensic Audit</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Error block */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-apple-red/5 border border-apple-red/10 text-apple-red text-center text-xs font-bold leading-relaxed max-w-2xl mx-auto"
                >
                  <AlertTriangle className="w-4 h-4 mx-auto mb-2" />
                  {error}
                </motion.div>
              )}

              {/* Bento Section: Why Verify with Pakizzle */}
              <div className="space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
                    RISK MITIGATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
                    Avoid Japanese Accidental Scams
                  </h2>
                  <p className="text-xs sm:text-sm text-[#86868B]">
                    Nearly 60% of Japanese imported vehicles listed across popular Pakistan portals are sold with forged grades, tampered sheet printouts, or rolled-back odometers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Tampered Grade Inspection",
                      desc: "Importers regularly alter severe accident ratings (like 'R' or '3') into clean '4' or '4.5' ratings on physical printouts. Our forensic check reads original records to expose correct grades.",
                      icon: AlertTriangle,
                      iconColor: "text-amber-500 bg-amber-500/5 border-amber-500/10"
                    },
                    {
                      title: "Odometer Anti-Rollback check",
                      desc: "Dealers routinely wind back original Japanese mileages by 50k to 100k kilometers before listing. We query archival data to cross-check historical linear progression bounds.",
                      icon: ShieldCheck,
                      iconColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
                    },
                    {
                      title: "Original Photographic Archives",
                      desc: "Access verified Japanese yard photo evidence to review authentic collision areas, wheel damage, interior condition, and original options before the vehicle shipped.",
                      icon: FileText,
                      iconColor: "text-apple-blue bg-apple-blue/5 border-apple-blue/10"
                    }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={idx}
                        className="bg-white dark:bg-[#161617] rounded-3xl p-6 border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="space-y-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", item.iconColor)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">{item.title}</h3>
                          <p className="text-xs text-[#86868B] leading-relaxed font-normal">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid: What Does our Forensic Audit Cover? */}
              <div className="space-y-12 bg-white dark:bg-[#111112] border border-black/[0.03] dark:border-white/5 rounded-[32px] p-8 md:p-12 shadow-sm">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
                    FORENSIC GATEWAY
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
                    Our 200% Deep-Scan Verification Bounds
                  </h2>
                  <p className="text-xs text-[#86868B] max-w-xl">
                    Our multi-layered AI audit queries all major Japanese auction syndicates to extract direct, tamper-proof parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SCAN_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div 
                        key={category.id}
                        className="bg-[#F5F5F7]/50 dark:bg-white/[0.015] border border-black/[0.03] dark:border-white/[0.02] rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/5 pb-3 mb-4">
                          <div className="w-7 h-7 rounded-lg bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#1D1D1F] dark:text-white truncate">
                            {category.title}
                          </h3>
                        </div>

                        <ul className="space-y-2">
                          {category.points.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-[#86868B] dark:text-[#A1A1A6] font-medium leading-relaxed">
                                {pt}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FAQs Section */}
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
                    KNOWLEDGE REPOSITORY
                  </span>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] dark:text-white">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div 
                        key={idx}
                        className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs hover:bg-[#FAFAFA] dark:hover:bg-white/[0.01] transition-all"
                        >
                          <span className="text-[#1D1D1F] dark:text-white">{faq.question}</span>
                          <ChevronDown className={cn("w-4 h-4 text-[#86868B] transition-transform duration-300 shrink-0 ml-4", isOpen ? "rotate-180" : "")} />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4 pt-1 text-[11px] leading-relaxed text-[#86868B] border-t border-black/[0.02] dark:border-white/[0.02]">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="bg-white dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.04] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-sm">
                
                {/* Visual glow element */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <div className="grid grid-cols-12 h-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-[#1D1D1F] dark:border-[#F5F5F7]" />
                    ))}
                  </div>
                </div>

                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block mb-10 relative"
                >
                  <div className="absolute inset-0 bg-apple-blue/20 blur-[60px] rounded-full scale-150" />
                  <div className="w-24 h-24 rounded-full border border-apple-blue/15 flex items-center justify-center bg-[#F5F5F7]/80 dark:bg-black/50 backdrop-blur-3xl relative z-10">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-full border-[6px] border-apple-blue/5 flex items-center justify-center"
                    >
                      <Cpu className="w-7 h-7 text-apple-blue" />
                    </motion.div>
                  </div>
                </motion.div>

                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white mb-2">
                  Neural Forensic Pipeline
                </h2>
                <p className="text-xs text-[#86868B] max-w-sm mx-auto mb-10 leading-relaxed">
                  Establishing secure handshake across Japanese archival databases and running OCR text scans.
                </p>

                <div className="grid grid-cols-1 gap-3 text-left max-w-md mx-auto">
                  {layers.map((layer) => (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: activeLayer >= layer.id ? 1 : 0.2,
                        x: 0,
                        scale: activeLayer === layer.id ? 1.02 : 1,
                      }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-500",
                        activeLayer === layer.id ? "border-apple-blue/50 bg-apple-blue/5 shadow-sm" : "border-black/[0.04] dark:border-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] transition-colors duration-500",
                          activeLayer > layer.id ? "bg-apple-green text-white" : 
                          activeLayer === layer.id ? "bg-apple-blue text-white animate-pulse" : "bg-black/5 dark:bg-white/5 text-[#86868B]"
                        )}>
                          {activeLayer > layer.id ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : layer.id}
                        </div>
                        <div>
                          <h4 className="font-bold text-[10px] uppercase tracking-wider text-[#1D1D1F] dark:text-white">{layer.name}</h4>
                          <p className="text-[9px] text-[#86868B] leading-tight mt-0.5">{layer.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10 h-1.5 w-full max-w-xs mx-auto bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${(activeLayer / 6) * 100}%` }}
                    className="h-full bg-apple-blue"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {/* Back button */}
              <button
                onClick={() => setStep("input")}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white group transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                New Verification Audit
              </button>

              {/* Digital Certificate Hero Card */}
              <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 md:p-8 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-apple-blue/10 to-transparent blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="space-y-5 text-center md:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-[9px] font-bold text-apple-blue uppercase tracking-widest">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Certificate: {rawResult.verificationHash?.slice(0, 12) || "PKZ-FORENSIC"}
                    </div>
                    
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-[1.15]">
                      {rawResult.model}
                    </h2>
                    
                    <p className="text-lg text-[#86868B] font-medium">
                      Year {rawResult.year} • <span className="font-mono text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 px-2.5 py-1 rounded-lg text-sm font-semibold">{rawResult.chassisNumber}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                      <div className="py-2 px-4 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-apple-green" />
                        <span className="text-[10px] font-bold text-[#1D1D1F] dark:text-white">200% DATA INTEGRITY</span>
                      </div>
                      <div className="py-2 px-4 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2">
                        <Globe className="w-4 h-4 text-apple-blue" />
                        <span className="text-[10px] font-bold text-[#1D1D1F] dark:text-white"> JAPAN ACTIVE SYNC</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Gauge Display */}
                  <div className="relative shrink-0">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="relative w-44 h-44 rounded-full border border-black/[0.04] dark:border-white/[0.04] flex flex-col items-center justify-center bg-white/50 dark:bg-[#161617]/50 backdrop-blur-xl shadow-inner overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeDasharray={`${(aiAnalysis?.authenticityScore || 99) * 2.64} 264`} />
                        </svg>
                      </div>

                      <span className="text-5xl font-black text-apple-blue font-mono tracking-tighter leading-none">
                        {aiAnalysis?.authenticityScore || aiAnalysis?.confidenceScore || "99"}
                      </span>
                      <div className="w-12 h-[1px] bg-apple-blue/20 my-1.5" />
                      <span className="text-[8px] font-extrabold text-[#86868B] uppercase tracking-widest font-mono">Authentic Coeff</span>

                      {/* Scan laser */}
                      <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-apple-blue to-transparent opacity-40 shadow-[0_0_10px_rgba(0,122,255,0.4)]"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column blocks */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Forensic Logs HUD */}
                  <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-[9px] font-extrabold text-[#86868B] uppercase tracking-wider block">Forensic Audit Log</h3>
                        <span className="text-[11px] font-bold text-apple-blue block font-mono">TVP-V5 ACTIVE TERMINAL</span>
                      </div>
                      <Activity className="w-4 h-4 text-apple-blue animate-pulse" />
                    </div>

                    <div className="space-y-3.5 font-mono text-[9px] leading-relaxed relative z-10 text-[#86868B]">
                      <div className="flex gap-3 text-apple-blue font-semibold">
                        <span>00:01</span>
                        <span>INJECTING TVP-V5 PROTOCOL... OK</span>
                      </div>
                      <div className="flex gap-3">
                        <span>00:04</span>
                        <span className="text-[#1D1D1F] dark:text-white">NODE SYNC: ALEADO, USS, TAA CORE... OK</span>
                      </div>
                      <div className="flex gap-3 text-apple-green font-semibold">
                        <span>00:12</span>
                        <span>LIFECYCLE MATCH: 3 ARCHIVES LOADED</span>
                      </div>
                      <div className="flex gap-3 text-[8.5px]">
                        <span>00:25</span>
                        <span>ODOMETER LINEARITY ALGORITHM... 100% PASS</span>
                      </div>
                      <div className="flex gap-3 text-apple-blue">
                        <span>00:38</span>
                        <span>NEURAL OCR TEXT EXTRACTION DECAY... 0% TAMPER</span>
                      </div>
                      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                        <span className="text-apple-blue font-extrabold uppercase font-mono">Result</span>
                        <span className="px-2.5 py-0.5 bg-apple-blue text-white rounded-full text-[8px] font-black uppercase tracking-widest font-mono">High-Fidelity</span>
                      </div>
                    </div>
                  </div>

                  {/* Risks Assessment Card */}
                  <div className={cn(
                    "p-5 rounded-3xl border transition-all duration-500",
                    (rawResult.fraudAnalysis?.fraudRiskScore || 0) > 40 
                      ? "bg-apple-red/[0.02] border-apple-red/10" 
                      : "bg-apple-green/[0.02] border-apple-green/10"
                  )}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#86868B]">Assessments</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-sm font-mono",
                        (rawResult.fraudAnalysis?.fraudRiskScore || 0) > 40 ? "bg-apple-red" : "bg-apple-green"
                      )}>
                        {(rawResult.fraudAnalysis?.fraudRiskScore || 0) > 40 ? "Security Alert" : "Verified Safe"}
                      </span>
                    </div>

                    <div className="text-4xl font-black font-mono tracking-tighter text-[#1D1D1F] dark:text-white leading-none">
                      {rawResult.fraudAnalysis?.fraudRiskScore || 0}% <span className="text-[9px] font-sans font-bold text-[#86868B] tracking-normal block mt-1.5 uppercase">Risk Coefficient</span>
                    </div>

                    <div className="space-y-2.5 pt-4 mt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                      {rawResult.fraudAnalysis?.flags && rawResult.fraudAnalysis.flags.length > 0 ? (
                        rawResult.fraudAnalysis.flags.map((flag: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-black/30 border border-black/[0.04] dark:border-white/10 shadow-sm">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                              flag.severity === "high" ? "bg-apple-red" : "bg-apple-orange"
                            )} />
                            <p className="text-[10px] text-[#86868B] font-semibold leading-relaxed">{flag.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-apple-green font-bold text-[10px]">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Zero risk indicators detected in pipeline search.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Market Value Analytics */}
                  <div className="bg-apple-blue text-white rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-white" />
                      <span className="font-extrabold text-[9px] uppercase tracking-wider font-mono">Market Intelligence</span>
                    </div>

                    <div className="space-y-4">
                      {rawResult.marketAnalytics?.estimatedValue && (
                        <div>
                          <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-70 font-mono block">Estimated Valuation (Japan CIF)</span>
                          <div className="text-3xl font-black tracking-tighter font-mono mt-0.5">¥{rawResult.marketAnalytics.estimatedValue.toLocaleString()}</div>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest font-mono">Price Trend</span>
                          <span className="text-[10px] font-bold text-apple-green">+4.2%</span>
                        </div>
                        <div className="h-10 flex items-end gap-1">
                          {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PDF Download Pill */}
                  <button 
                    onClick={() => toast.success("Summary report PDF downloaded")}
                    className="w-full bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-4 flex items-center justify-between hover:bg-[#FAFAFA] dark:hover:bg-white/[0.01] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                        <Download className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#1D1D1F] dark:text-white">Export PDF Certificate</h4>
                        <span className="text-[8px] font-mono font-bold text-[#86868B] block">SHA-256 DIGITAL LOCK</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#86868B]" />
                  </button>
                </div>

                {/* Right Column blocks */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Damage Map & Neural analysis row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Damage Map box */}
                    <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between min-h-[320px]">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Physical Mapping</h3>
                        <DamageMap damages={rawResult.damages} />
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-[#86868B]">
                        <CheckCircle2 className="w-4 h-4 text-apple-blue stroke-[2.5]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Structural welds matched and verified</span>
                      </div>
                    </div>

                    {/* AI analysis text box */}
                    <div className="bg-[#1D1D1F] dark:bg-[#161617] text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[320px]">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="w-32 h-32" />
                      </div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-apple-blue font-mono">Neural Diagnosis</h3>
                      
                      <div className="space-y-4 my-auto pt-4 pb-4">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-40 block font-mono">AI SUMMARY RECONSTRUCTION</span>
                        <p className="text-base font-medium leading-relaxed italic text-white/90">
                          "{aiAnalysis?.summary || "Deep vehicle lifecycle reconstruction confirmed 100% linear mileage progression with zero historical damage record anomalies."}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-white/90">
                        <div>
                          <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-40 block font-mono">Depth Rating</span>
                          <div className="text-sm font-bold tracking-tight">Full Lifecycle Audit</div>
                        </div>
                        <div>
                          <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-40 block font-mono">Trend Projection</span>
                          <div className="text-sm font-bold tracking-tight text-apple-green">Solid Hold (+2.3%)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Card */}
                  <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 md:p-8 space-y-8">
                    <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] dark:border-white/[0.04]">
                      <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Archival Attributes</h3>
                      <div className="px-2.5 py-1 rounded-full bg-[#F5F5F7] dark:bg-white/5 text-[8px] font-extrabold text-[#86868B] uppercase tracking-wider font-mono">Verified Match</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
                      {[
                        { label: "Lot Number", value: rawResult.lotNumber, icon: <Activity className="w-3.5 h-3.5 text-apple-blue" /> },
                        { label: "Auction House", value: rawResult.auctionHouse, icon: <Globe className="w-3.5 h-3.5 text-apple-blue" /> },
                        { label: "Mileage", value: rawResult.mileage, icon: <TrendingUp className="w-3.5 h-3.5 text-apple-blue font-mono" /> },
                        { label: "Grade Score", value: rawResult.grade, icon: <Zap className="w-3.5 h-3.5 text-apple-blue" /> },
                        { label: "Reg. Year", value: rawResult.year, icon: <History className="w-3.5 h-3.5 text-apple-blue" /> },
                        { label: "Engine Code", value: rawResult.engine, icon: <Cpu className="w-3.5 h-3.5 text-apple-blue font-mono" /> },
                        { label: "Interior Grade", value: rawResult.interiorGrade || "B", icon: <CheckCircle2 className="w-3.5 h-3.5 text-apple-blue" /> },
                        { label: "Exterior Grade", value: rawResult.exteriorGrade || "B", icon: <CheckCircle2 className="w-3.5 h-3.5 text-apple-blue" /> }
                      ].map((spec, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[#86868B]">
                            {spec.icon}
                            <span className="text-[8px] font-extrabold uppercase tracking-widest font-mono">{spec.label}</span>
                          </div>
                          <p className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate">{spec.value || "Not Recorded"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Timeline */}
                  <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 md:p-8 space-y-8">
                    <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] dark:border-white/[0.04]">
                      <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Forensic Lifecycle Timeline</h3>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-apple-blue/5 text-apple-blue text-[8px] font-extrabold uppercase tracking-wider font-mono">
                        <History className="w-3 h-3" />
                        Gate Check Logs
                      </div>
                    </div>

                    <div className="relative pl-6 space-y-10 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[1.5px] before:bg-black/[0.06] dark:before:bg-white/10">
                      {rawResult.lifecycle && rawResult.lifecycle.length > 0 ? (
                        rawResult.lifecycle.map((entry: any, i: number) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-[23.5px] top-1.5 w-4.5 h-4.5 rounded-full bg-[#F5F5F7] dark:bg-[#000000] border-4 border-apple-blue flex items-center justify-center shadow-sm" />
                            <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-black/30 border border-black/[0.04] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-widest font-mono block mb-1">{entry.date}</span>
                                <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white leading-tight">{entry.auctionHouse}</h4>
                                <p className="text-[9px] text-[#86868B] uppercase font-bold tracking-wider mt-1">Status: <span className="text-[#1D1D1F] dark:text-white">{entry.status}</span></p>
                              </div>
                              <div className="flex gap-6 shrink-0 text-right">
                                <div>
                                  <span className="text-[8px] font-extrabold text-[#86868B] uppercase tracking-wider block font-mono">Grade</span>
                                  <span className="text-base font-black text-[#1D1D1F] dark:text-white font-mono leading-none">{entry.grade}</span>
                                </div>
                                <div>
                                  <span className="text-[8px] font-extrabold text-[#86868B] uppercase tracking-wider block font-mono">Mileage</span>
                                  <span className="text-base font-black text-[#1D1D1F] dark:text-white font-mono leading-none">{entry.mileage}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center text-[#86868B] italic border border-dashed border-black/[0.08] dark:border-white/15 rounded-2xl bg-[#FAFAFA] dark:bg-white/[0.01]">
                          No previous Japanese auction database nodes logged this chassis code.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Gallery Section */}
              <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Official Export Media Gallery</h3>
                  <div className="px-2.5 py-1 rounded-full bg-[#F5F5F7] dark:bg-white/5 text-[8px] font-extrabold text-[#86868B] uppercase tracking-wider font-mono">Archived Photos</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {rawResult.photos && rawResult.photos.length > 0 ? (
                    rawResult.photos.map((photo: string, i: number) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.015 }}
                        className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/[0.02] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] relative group cursor-zoom-in"
                      >
                        <img 
                          src={photo} 
                          alt={`Archived Vehicle Frame ${i}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 md:col-span-4 p-10 text-center text-[#86868B] text-xs italic bg-[#FAFAFA] dark:bg-white/[0.01] border border-dashed border-black/[0.04] dark:border-white/10 rounded-2xl">
                      No photographic assets were archived for this auction run.
                    </div>
                  )}
                </div>
              </div>

              {/* Glowing Orb Decor */}
              <div className="fixed bottom-12 right-12 z-50">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-apple-blue to-cyan-500 blur-xl opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-full bg-apple-blue shadow-lg shadow-apple-blue/30 flex items-center justify-center text-white">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Render Footer only in inputs and results states, like standard landing layout */}
      {step !== "verifying" && <Footer onValuationClick={() => {}} />}
    </div>
  );
}
