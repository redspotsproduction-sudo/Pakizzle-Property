import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  MapPin, 
  Zap, 
  Flame, 
  Droplets, 
  Wifi, 
  ShieldCheck, 
  GraduationCap, 
  HeartPulse, 
  Compass, 
  Check, 
  Star,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LivingQualityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AreaGuide {
  id: string;
  name: string;
  city: string;
  headline: string;
  overallScore: number;
  electricityScore: number;
  electricityNote: string;
  gasScore: number;
  gasNote: string;
  waterScore: number;
  waterNote: string;
  internetScore: number;
  internetNote: string;
  securityScore: number;
  securityNote: string;
  topSchools: string[];
  topHospitals: string[];
  distanceToAirport: string;
  rentalYield: string;
  capitalAppreciation1Y: string;
}

const AREAS_DATA: AreaGuide[] = [
  {
    id: "dha-lhr-6",
    name: "DHA Phase 6",
    city: "Lahore",
    headline: "The Gold Standard for Modern High-Growth Living",
    overallScore: 9.6,
    electricityScore: 9.8,
    electricityNote: "Underground grid with automatic backup feeder lines. 0 hours loadshedding.",
    gasScore: 9.2,
    gasNote: "Dedicated SNGPL direct pressure regulator station.",
    waterScore: 9.4,
    waterNote: "DHA automated deep tubewell network with integrated filtration plants.",
    internetScore: 9.9,
    internetNote: "StormFiber, Transworld & PTCL Flash Fiber available up to 500 Mbps.",
    securityScore: 9.8,
    securityNote: "24/7 DHA Vigilance, electronic RFID smart boom barriers and quick response force.",
    topSchools: ["LGS Phase 6", "Beaconhouse Newlands", "The City School DHA Campus"],
    topHospitals: ["National Hospital DHA", "Surgimed Phase 6", "Avicenna Medical Center"],
    distanceToAirport: "12 mins via Ring Road",
    rentalYield: "5.8% p.a.",
    capitalAppreciation1Y: "+18.4%"
  },
  {
    id: "clifton-khi",
    name: "Clifton (Block 4 & 5)",
    city: "Karachi",
    headline: "Coastal Prestige & Commercial Sophistication",
    overallScore: 9.4,
    electricityScore: 8.9,
    electricityNote: "K-Electric priority diplomatic feeder line. Exempted from unscheduled loadshedding.",
    gasScore: 8.7,
    gasNote: "SSGC stable line pressure with bulk backup connections.",
    waterScore: 8.5,
    waterNote: "DHA/CBC sweet water pipeline with commercial RO tanker terminal access.",
    internetScore: 9.8,
    internetNote: "Ultra-fast Transworld submarine cable landing loop and fiber.",
    securityScore: 9.3,
    securityNote: "Consulate-level security zone with CCTV surveillance matrix.",
    topSchools: ["Karachi Grammar School (KGS)", "Convent of Jesus & Mary", "Karachi American School"],
    topHospitals: ["South City Hospital", "Ziauddin Hospital Clifton", "Dr. Ziauddin Cancer Center"],
    distanceToAirport: "25 mins via Shahrah-e-Faisal",
    rentalYield: "6.9% p.a.",
    capitalAppreciation1Y: "+14.8%"
  },
  {
    id: "isb-f7",
    name: "Sector F-7 & F-6",
    city: "Islamabad",
    headline: "Diplomatic Green Enclave below Margalla Hills",
    overallScore: 9.7,
    electricityScore: 9.7,
    electricityNote: "IESCO VIP Red Zone Grid. Uninterrupted 24/7 supply year-round.",
    gasScore: 9.5,
    gasNote: "Optimal mountain-tier SNGPL winter gas delivery.",
    waterScore: 9.2,
    waterNote: "Simly Dam natural treated water supply plus private CDA bores.",
    internetScore: 9.6,
    internetNote: "Full fiber coverage with Nayatel 1Gbps gigabit connectivity.",
    securityScore: 9.9,
    securityNote: "Federal Capital Police Diplomatic Protection Unit & street checkpoints.",
    topSchools: ["Froebel's International", "Roots Millennium One World", "Headstart School"],
    topHospitals: ["Kulsum International Hospital", "Ali Medical Centre F-8", "Shifa International"],
    distanceToAirport: "28 mins via Srinagar Highway",
    rentalYield: "5.2% p.a.",
    capitalAppreciation1Y: "+21.2%"
  },
  {
    id: "bahria-khi",
    name: "Bahria Town (Precinct 1-10)",
    city: "Karachi",
    headline: "Self-Sustaining Smart City with Independent Power Grid",
    overallScore: 9.2,
    electricityScore: 9.9,
    electricityNote: "100% self-generated 24/7 electricity grid. Zero loadshedding guaranteed.",
    gasScore: 8.9,
    gasNote: "Bahria centralized piped gas distribution and LPG backup station.",
    waterScore: 9.1,
    waterNote: "Dedicated high-capacity industrial RO water purification plant.",
    internetScore: 9.4,
    internetNote: "Bahria Smart Net and PTCL high-speed fiber throughout.",
    securityScore: 9.7,
    securityNote: "Private armed Bahria Security Force, perimeter sensor fencing & drone patrol.",
    topSchools: ["Roots Millennium Bahria", "Beaconhouse Bahria Campus", "Baqai Cadet College"],
    topHospitals: ["Bahria International Hospital", "Dr. Ruth Pfau Medical Campus"],
    distanceToAirport: "22 mins via M-9 Motorway",
    rentalYield: "7.6% p.a.",
    capitalAppreciation1Y: "+19.0%"
  }
];

export default function LivingQualityGuideModal({ isOpen, onClose }: LivingQualityGuideModalProps) {
  const navigate = useNavigate();
  const [selectedAreaId, setSelectedAreaId] = useState(AREAS_DATA[0].id);

  const currentArea = AREAS_DATA.find(a => a.id === selectedAreaId) || AREAS_DATA[0];

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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-apple-text tracking-tight">
                  Pakizzle Living Quality Index™
                </h3>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Live Utility & Lifestyle Intelligence
                </span>
              </div>
              <p className="text-xs text-apple-text-muted mt-0.5">
                Real-time utility ratings (Loadshedding, Sui Gas, Water, Fiber) & neighborhood livability.
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

        {/* Area Navigation Pills */}
        <div className="px-6 py-3 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#12131A] flex items-center gap-2 overflow-x-auto">
          {AREAS_DATA.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedAreaId === area.id
                  ? "bg-apple-blue text-white shadow-sm font-semibold"
                  : "bg-apple-gray dark:bg-white/5 text-apple-text hover:bg-apple-gray/80"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {area.name}, {area.city}
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                selectedAreaId === area.id ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10 text-apple-blue"
              }`}>
                {area.overallScore}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Main Area Profile */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-apple-blue uppercase tracking-wider">
                  {currentArea.city} Real Estate Guide
                </span>
                <span className="text-apple-text-muted">·</span>
                <span className="text-xs font-medium text-emerald-500">
                  Appreciation: {currentArea.capitalAppreciation1Y} YoY
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-apple-text tracking-tight mt-1">
                {currentArea.name}
              </h2>
              <p className="text-sm text-apple-text-muted mt-1 leading-relaxed">
                {currentArea.headline}
              </p>
            </div>

            {/* Utility Score Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-apple-text uppercase tracking-wider block">
                Infrastructure & Utilities Benchmark
              </span>

              {/* Electricity */}
              <div className="p-4 rounded-2xl bg-apple-gray/40 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-apple-text">Electricity Grid & Loadshedding</div>
                      <div className="text-[11px] text-apple-text-muted">{currentArea.electricityNote}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-amber-500">{currentArea.electricityScore}</span>
                    <span className="text-[10px] text-apple-text-muted font-mono"> / 10</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${currentArea.electricityScore * 10}%` }}
                  />
                </div>
              </div>

              {/* Sui Gas */}
              <div className="p-4 rounded-2xl bg-apple-gray/40 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-apple-text">Sui Gas Supply & Pressure</div>
                      <div className="text-[11px] text-apple-text-muted">{currentArea.gasNote}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-blue-500">{currentArea.gasScore}</span>
                    <span className="text-[10px] text-apple-text-muted font-mono"> / 10</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${currentArea.gasScore * 10}%` }}
                  />
                </div>
              </div>

              {/* Clean Water */}
              <div className="p-4 rounded-2xl bg-apple-gray/40 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-apple-text">Clean Ground & Pipeline Water</div>
                      <div className="text-[11px] text-apple-text-muted">{currentArea.waterNote}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-cyan-500">{currentArea.waterScore}</span>
                    <span className="text-[10px] text-apple-text-muted font-mono"> / 10</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${currentArea.waterScore * 10}%` }}
                  />
                </div>
              </div>

              {/* Fiber Internet */}
              <div className="p-4 rounded-2xl bg-apple-gray/40 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-apple-text">High-Speed Fiber Optic</div>
                      <div className="text-[11px] text-apple-text-muted">{currentArea.internetNote}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-purple-500">{currentArea.internetScore}</span>
                    <span className="text-[10px] text-apple-text-muted font-mono"> / 10</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${currentArea.internetScore * 10}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lifestyle & Direct Listings */}
          <div className="lg:col-span-5 bg-apple-gray/20 dark:bg-white/[0.02] rounded-3xl p-6 border border-black/5 dark:border-white/10 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* Overall Living Score Badge */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-apple-blue/15 to-blue-600/5 border border-apple-blue/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-apple-blue uppercase tracking-wider font-mono">
                    Living Quality Index
                  </span>
                  <div className="text-2xl font-black text-apple-text mt-0.5">
                    Tier-1 Prime Sector
                  </div>
                  <div className="text-xs text-apple-text-muted mt-0.5">
                    Airport: {currentArea.distanceToAirport}
                  </div>
                </div>
                <div className="text-center bg-white dark:bg-[#1A1C24] p-3 rounded-2xl shadow-sm border border-black/5">
                  <div className="text-2xl font-black text-apple-blue font-mono">
                    {currentArea.overallScore}
                  </div>
                  <div className="text-[9px] font-bold text-apple-text-muted uppercase">out of 10</div>
                </div>
              </div>

              {/* Top Schools */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-apple-text mb-2">
                  <GraduationCap className="w-4 h-4 text-apple-blue" />
                  <span>Premier Schools (Within 10 mins)</span>
                </div>
                <div className="space-y-1.5">
                  {currentArea.topSchools.map((school, i) => (
                    <div key={i} className="text-xs p-2 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-apple-text flex items-center justify-between">
                      <span>{school}</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-semibold">5-8 min</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Hospitals */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-apple-text mb-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Leading Hospitals & Trauma Centers</span>
                </div>
                <div className="space-y-1.5">
                  {currentArea.topHospitals.map((hospital, i) => (
                    <div key={i} className="text-xs p-2 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-apple-text flex items-center justify-between">
                      <span>{hospital}</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-semibold">Under 10 min</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Return Summary */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 flex justify-between text-xs">
                <div>
                  <div className="text-apple-text-muted">Gross Rental Yield</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{currentArea.rentalYield}</div>
                </div>
                <div className="text-right">
                  <div className="text-apple-text-muted">1-Year Capital Growth</div>
                  <div className="font-mono font-bold text-apple-blue mt-0.5">{currentArea.capitalAppreciation1Y}</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                onClose();
                navigate(`/marketplace?city=${encodeURIComponent(currentArea.city)}&q=${encodeURIComponent(currentArea.name)}`);
              }}
              className="w-full py-3.5 rounded-xl bg-apple-blue text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              Browse Verified Properties in {currentArea.name}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
