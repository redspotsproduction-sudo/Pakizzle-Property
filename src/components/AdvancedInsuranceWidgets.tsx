import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Check, 
  ChevronRight, 
  Zap, 
  Eye, 
  BarChart3, 
  AlertCircle, 
  Sliders, 
  Smartphone, 
  Radar, 
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Shield,
  Clock,
  Compass,
  MapPin,
  Heart,
  HeartCrack,
  Flame,
  CloudLightning,
  Coins,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';

// INTERACTIVE COMPONENT 1: InsuranceCoverageExplorer
interface InsuranceCoveragePoint {
  id: string;
  name: string;
  x: string;
  y: string;
  payoutLimit: string;
  features: string[];
  description: string;
  metric: string;
}

export function InsuranceCoverageExplorer() {
  const [activeCoverageId, setActiveCoverageId] = useState<string>('collision');

  const coverages: InsuranceCoveragePoint[] = [
    {
      id: 'collision',
      name: 'Bumper-to-Bumper Collision Shield',
      x: '15%',
      y: '55%',
      payoutLimit: 'Up to 100% Market Value',
      features: [
        'Total accidental body frame damage restoration',
        'Genuine parts replacement at authorized dealerships',
        'Airbag, radiator, and structural rebuilds',
        'Paint depth match verification at delivery'
      ],
      description: 'Covers full cost repairs of minor fender benders and catastrophic head-on collisions. All repairs are synchronized with authorized OEM dealership centers across Pakistan.',
      metric: 'Bumper-to-Bumper Zero-Depreciation Protection'
    },
    {
      id: 'theft',
      name: 'Anti-Theft Satellite Track & Recovery',
      x: '50%',
      y: '48%',
      payoutLimit: '100% Value Reimbursement',
      features: [
        'Free satellite tracking terminal installation',
        'Real-time GPS boundary breach alarms',
        '24/7 localized recovery dispatcher team dispatch',
        'Reimbursement of total value on unrecoverable cases'
      ],
      description: 'Combines proactive hardware security with financial guarantees. Includes free high-end GPS-satellite tracker mapping and dynamic geo-fencing alerts on your phone.',
      metric: '98.9% Vehicle Recovery Success Rate'
    },
    {
      id: 'third_party',
      name: 'Legal & Third-Party Liability Shield',
      x: '85%',
      y: '58%',
      payoutLimit: 'PKR 1,500,000 Guarantee',
      features: [
        'Third-party vehicle structural damage restoration',
        'Bodily injury and medical liability protection',
        'Instant legal counsel dispatch on-site',
        'Cross-court legal defense representation'
      ],
      description: 'Protects you from expensive out-of-pocket lawsuits or community compensation issues. Standardized zero-friction claim payout directly to affected third parties.',
      metric: 'Zero Out-of-Pocket Liability'
    },
    {
      id: 'force_majeure',
      name: 'Act of God (Floods, Fires & Weather)',
      x: '48%',
      y: '15%',
      payoutLimit: 'Up to 100% Market Value',
      features: [
        'Monsoon urban flood engine submersion rebuild',
        'Spontaneous battery/fuel combustion damage',
        'Hailstorm glass impact and dent repair',
        'Riot, vandalism, and political unrest protection'
      ],
      description: 'Shields your asset from catastrophic environmental hazards. Critical for high-value hybrid or electric sedans vulnerable to monsoon water damage.',
      metric: 'All-Weather Environmental Insurance'
    }
  ];

  const currentCoverage = coverages.find(c => c.id === activeCoverageId) || coverages[0];

  return (
    <div className="bg-white dark:bg-[var(--surface-dark)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-apple-blue/5 rounded-full blur-[90px] pointer-events-none -mr-32 -mt-32" />
      
      <div className="relative z-10 space-y-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 rounded-full border border-apple-blue/15">
            Active Security Matrix
          </span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            Comprehensive Autoshield
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-snug">
          Pakizzle Insurance Coverage Explorer
        </h2>
        <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
          Hover over or select active hotspots on the vehicle frame below to understand how different policy layers intercept and absorb real-world risks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Side: X-Ray Blueprint Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-[#F5F5F7] dark:bg-black/35 rounded-2xl border border-black/[0.03] dark:border-white/[0.02] relative min-h-[300px]">
          {/* Subtle Pink/Blue Coordinate Grid */}
          <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]" style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 102, 204, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 102, 204, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />

          {/* Luxury Red Sedan Profile Backdrop */}
          <div className="relative w-full max-w-[480px] pointer-events-none select-none my-auto">
            <img 
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000" 
              alt="Luxury Car Red Profile"
              className="w-full h-auto object-contain brightness-95 dark:brightness-75 saturate-110 drop-shadow-lg"
              referrerPolicy="no-referrer"
            />

            {/* Interactive Pulse Blips overlay */}
            <div className="absolute inset-0 pointer-events-auto">
              {coverages.map((cov) => {
                const isActive = cov.id === activeCoverageId;
                return (
                  <button
                    key={cov.id}
                    onClick={() => setActiveCoverageId(cov.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/blip"
                    style={{ left: cov.x, top: cov.y }}
                  >
                    <span className={cn(
                      "absolute inset-0 rounded-full w-10 h-10 -left-5 -top-5 transition-all duration-1000",
                      isActive 
                        ? "bg-apple-blue/20 border border-apple-blue/40 animate-ping" 
                        : "bg-transparent group-hover/blip:bg-apple-blue/10"
                    )} />
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300",
                      isActive 
                        ? "bg-apple-blue border-white text-white scale-110" 
                        : "bg-[#2C2C2E]/90 border-white/40 text-white/80 hover:scale-105 hover:bg-[#1C1C1E]"
                    )}>
                      {cov.id === 'collision' && <Shield className="w-3 h-3" />}
                      {cov.id === 'theft' && <Cpu className="w-3 h-3" />}
                      {cov.id === 'third_party' && <Coins className="w-3 h-3" />}
                      {cov.id === 'force_majeure' && <CloudLightning className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick HUD status info bar bottom */}
          <div className="w-full bg-white dark:bg-[#111112] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-xl mt-6 flex justify-between items-center text-[10px] relative z-10 shadow-sm">
            <span className="font-mono text-[#86868B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-apple-blue animate-pulse" />
              HOTSPOT CALIBRATION: {activeCoverageId.toUpperCase()}
            </span>
            <span className="font-bold text-apple-blue">{currentCoverage.metric}</span>
          </div>
        </div>

        {/* Right Side: Dynamic Content Details Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F5F5F7] dark:bg-black/30 border border-black/[0.04] dark:border-white/[0.03] rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-apple-blue font-mono block">PROTECTION CATEGORY</span>
              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight">
                {currentCoverage.name}
              </h3>
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              {currentCoverage.description}
            </p>

            <div className="bg-white dark:bg-[#111112] border border-black/[0.03] dark:border-white/[0.04] p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[8px] font-bold text-[#86868B] uppercase block">ESTIMATED PAYOUT LIMIT</span>
                <span className="text-base font-black text-apple-blue font-mono">{currentCoverage.payoutLimit}</span>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#00802B]" />
            </div>

            <div className="space-y-2.5">
              <span className="text-[8px] font-extrabold text-[#86868B] uppercase tracking-wider block">KEY POLICY BENEFITS</span>
              <div className="space-y-2">
                {currentCoverage.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[#1D1D1F] dark:text-white/80 font-medium leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// INTERACTIVE COMPONENT 2: LiveClaimsRadar
interface ClaimLog {
  id: string;
  city: string;
  vehicle: string;
  amount: string;
  status: 'approved' | 'dispatched';
  timestamp: string;
}

export function LiveClaimsRadar() {
  const [activeTab, setActiveTab] = useState<'claims' | 'nodes'>('claims');
  const [claims, setClaims] = useState<ClaimLog[]>([
    { id: 'CLM-0421', city: 'Lahore (DHA Phase 6)', vehicle: 'Toyota Civic 2022', amount: 'PKR 145,000', status: 'approved', timestamp: 'Just now' },
    { id: 'CLM-0398', city: 'Karachi (Clifton)', vehicle: 'Honda Vezel 2021', amount: 'PKR 342,000', status: 'approved', timestamp: '2 mins ago' },
    { id: 'CLM-0387', city: 'Islamabad (F-11)', vehicle: 'Hyundai Tucson 2023', amount: 'PKR 89,000', status: 'dispatched', timestamp: '5 mins ago' }
  ]);

  // Simulate incoming live claims
  useEffect(() => {
    const interval = setInterval(() => {
      const cities = ['Karachi (DHA Phase 5)', 'Lahore (Gulberg III)', 'Islamabad (G-11)', 'Rawalpindi (Bahria Town)'];
      const cars = ['Toyota Corolla Altis', 'Suzuki Alto VXL', 'Honda City Aspire', 'Kia Sportage AWD'];
      const amounts = ['PKR 45,000', 'PKR 128,000', 'PKR 250,000', 'PKR 75,000'];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomCar = cars[Math.floor(Math.random() * cars.length)];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      
      const newClaim: ClaimLog = {
        id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
        city: randomCity,
        vehicle: randomCar,
        amount: randomAmount,
        status: Math.random() > 0.4 ? 'approved' : 'dispatched',
        timestamp: 'Just now'
      };

      setClaims(prev => [newClaim, ...prev.slice(0, 2)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Live Claims Node Radar Map (5 columns) */}
      <div className="lg:col-span-5 bg-black text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/5 flex flex-col justify-between shadow-lg">
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 102, 204, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 102, 204, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-apple-blue uppercase tracking-[0.25em] font-mono">LIVE CLAIMS SIGNAL TELEMETRY</span>
            <span className="w-2 h-2 rounded-full bg-[#00802B] animate-pulse" />
          </div>

          {/* Circular radar mesh animation */}
          <div className="h-48 my-2 relative rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-black/40">
            {/* Rotating radar sweeps */}
            <div className="absolute inset-0 rounded-full border border-white/5 scale-[0.66]" />
            <div className="absolute inset-0 rounded-full border border-white/5 scale-[0.33]" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute w-full h-full border-r border-apple-blue/25 origin-center rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 50%, rgba(0, 102, 204, 0.15) 100%)'
              }}
            />

            {/* Target blips (mocking major cities in Pakistan) */}
            <div className="absolute top-[30%] left-[45%] text-[#0066CC] animate-pulse">
              <MapPin className="w-5 h-5 animate-bounce text-apple-blue" />
              <span className="text-[7px] font-mono font-bold block bg-black/80 px-1 rounded -mt-1 whitespace-nowrap">ISB NODE</span>
            </div>
            <div className="absolute top-[50%] left-[65%] text-[#0066CC] animate-pulse">
              <MapPin className="w-5 h-5 animate-bounce text-[#00802B]" />
              <span className="text-[7px] font-mono font-bold block bg-black/80 px-1 rounded -mt-1 whitespace-nowrap">LHE NODE</span>
            </div>
            <div className="absolute top-[75%] left-[30%] text-[#0066CC] animate-pulse">
              <MapPin className="w-5 h-5 animate-bounce text-red-500" />
              <span className="text-[7px] font-mono font-bold block bg-black/80 px-1 rounded -mt-1 whitespace-nowrap">KHI NODE</span>
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-bold text-white">Active Signal Lock: Pakistan</h4>
            <p className="text-[10px] text-[#86868B] max-w-xs mx-auto leading-relaxed mt-1">
              Live claims tracking and mobile emergency response hubs synchronized across Lahore, Karachi, and Islamabad/Rawalpindi.
            </p>
          </div>
        </div>
      </div>

      {/* Live Activity Feed (7 columns) */}
      <div className="lg:col-span-7 bg-white dark:bg-[var(--surface-dark)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-black/[0.05] dark:border-white/5 pb-4">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-[#86868B] uppercase tracking-widest font-mono">AUTOMATED HANDSHAKE</span>
              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight">Live Dispatch & Settlement Feed</h3>
            </div>

            {/* Selector tabs */}
            <div className="flex bg-[#F5F5F7] dark:bg-white/5 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('claims')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
                  activeTab === 'claims'
                    ? "bg-white dark:bg-[#1D1D1F] text-apple-blue shadow-sm"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                Claims
              </button>
              <button
                onClick={() => setActiveTab('nodes')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
                  activeTab === 'nodes'
                    ? "bg-white dark:bg-[#1D1D1F] text-apple-blue shadow-sm"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                Rescue Nodes
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {activeTab === 'claims' ? (
                claims.map((claim) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-4 bg-[#F5F5F7] dark:bg-black/25 rounded-2xl border border-black/[0.02] dark:border-white/[0.02] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#86868B] font-mono block uppercase">{claim.id} • {claim.timestamp}</span>
                        <h4 className="font-bold text-[#1D1D1F] dark:text-white leading-snug">{claim.vehicle}</h4>
                        <span className="text-[10px] text-[#86868B] block mt-0.5">{claim.city}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="block font-mono font-bold text-apple-blue">{claim.amount}</span>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide",
                        claim.status === 'approved' 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                      )}>
                        {claim.status === 'approved' ? 'Claim Approved' : 'Tow Dispatched'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="space-y-3">
                  {[
                    { id: 'RSC-092', location: 'DHA Phase 6 Block H, Lahore', speed: '14 mins ETA', task: 'Tow & Crane Dispatch' },
                    { id: 'RSC-045', location: 'Sharah-e-Faisal, Karachi', speed: '6 mins ETA', task: 'On-Site Flat-Tyre Support' },
                    { id: 'RSC-021', location: 'Zero Point Interchange, Islamabad', speed: '19 mins ETA', task: 'Battery Jumpstart Node' }
                  ].map(node => (
                    <div key={node.id} className="flex items-center justify-between p-4 bg-[#F5F5F7] dark:bg-black/25 rounded-2xl border border-black/[0.02] dark:border-white/[0.02] text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                          <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-[#86868B] font-mono block uppercase">{node.id} • ACTIVE NODE</span>
                          <h4 className="font-bold text-[#1D1D1F] dark:text-white leading-snug">{node.task}</h4>
                          <span className="text-[10px] text-[#86868B] block mt-0.5">{node.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-500 font-bold block">{node.speed}</span>
                        <span className="text-[8px] text-[#86868B] uppercase tracking-wider block mt-0.5">Dispatched via GPS</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="pt-6 border-t border-black/[0.05] dark:border-white/5 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] text-[#86868B]">
          <p className="max-w-md">
            Our central terminal automates payout verification using AI photo validation and elcometer scan records, reducing average approval latency to 120 seconds.
          </p>
          <span className="font-bold text-apple-blue uppercase tracking-widest font-mono flex items-center gap-1 shrink-0">
            <Zap className="w-3.5 h-3.5" /> Live API Connected
          </span>
        </div>
      </div>

    </div>
  );
}

// INTERACTIVE COMPONENT 3: ClaimSettlementSimulator
export function ClaimSettlementSimulator() {
  const [valuation, setValuation] = useState<number>(45); // PKR in lacs
  
  const coverageRate = 1.65; // average rate

  const calculatedPremium = useMemo(() => {
    return (valuation * 100000) * (coverageRate / 100);
  }, [valuation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      
      {/* Visual representation of saved expenses (5 columns) */}
      <div className="lg:col-span-5 bg-[#1D1D1F] dark:bg-[#111112] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/5 flex flex-col justify-between shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/15 rounded-full blur-[90px] pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-apple-blue uppercase tracking-[0.25em] block">
              PORTFOLIO SAFETY EVALUATOR
            </span>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
              Loss Prevention Analysis
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Understand how comprehensive insurance shields your car's valuation weight from random market hazards and heavy accidental losses:
            </p>
          </div>

          <div className="space-y-3">
            {[
              { hazard: 'Major Frontal Crash Rebuild', directCost: 'PKR 650,000+', netOutofPocket: 'PKR 0 (100% Covered)', saved: 'Saved PKR 650,000', color: 'text-[#00802B]' },
              { hazard: 'Wet Monsoon Engine Seizure', directCost: 'PKR 450,000+', netOutofPocket: 'PKR 0 (100% Covered)', saved: 'Saved PKR 450,000', color: 'text-apple-blue' },
              { hazard: 'Unrecoverable Vehicle Theft', directCost: 'PKR 4.5M (Market Value)', netOutofPocket: 'PKR 0 (100% Cashout)', saved: 'Fully Safeguarded', color: 'text-amber-400' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white leading-snug">{item.hazard}</h4>
                  <span className="text-[10px] text-white/50 block mt-0.5">Direct Repair Cost: {item.directCost}</span>
                </div>
                <div className="text-right">
                  <span className={cn("font-bold block", item.color)}>{item.netOutofPocket}</span>
                  <span className="text-[8px] text-white/30 uppercase block mt-0.5">{item.saved}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Range Simulator (7 columns) */}
      <div className="lg:col-span-7 bg-white dark:bg-[var(--surface-dark)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 rounded-full border border-apple-blue/15 w-fit block">
              Dynamic Cost Modeler
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-snug">
              Simulate Your Policy Cost Weight
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed max-w-xl">
              Drag the premium slider below to define your vehicle’s current market valuation weight. Watch our dynamic model calculate the real-time annual insurance premium.
            </p>
          </div>

          <div className="bg-[#F5F5F7] dark:bg-black/25 rounded-2xl p-6 border border-black/[0.02] dark:border-white/[0.02] space-y-6">
            <div className="flex justify-between items-center text-[10px] font-black text-[#86868B] uppercase tracking-wider">
              <span>VEHICLE MARKET VALUE</span>
              <span className="font-mono text-apple-blue text-sm">PKR {(valuation).toFixed(1)} Lacs ({valuation * 100000 >= 10000000 ? `${(valuation / 10).toFixed(2)} Crore` : `${valuation.toFixed(1)} Lakhs`})</span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="8"
                max="150"
                step="2"
                value={valuation}
                onChange={(e) => setValuation(parseInt(e.target.value))}
                className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-apple-blue focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-[#86868B] font-mono">
                <span>PKR 8 Lakhs (Alto)</span>
                <span>PKR 55 Lakhs (Corolla/Civic)</span>
                <span>PKR 1.5 Crores (Fortuner / EV)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Premium calculation result */}
          <div className="bg-apple-blue/5 border border-apple-blue/15 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-widest block font-mono">ESTIMATED ANNUAL PREMIUM</span>
              <span className="text-2xl font-black font-mono text-[#1D1D1F] dark:text-white leading-none block mt-1">
                PKR {Math.round(calculatedPremium).toLocaleString()} / yr
              </span>
              <span className="text-[8px] text-[#86868B] block mt-1">Includes 100% comprehensive bumper-to-bumper protection.</span>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-bold text-[#86868B] uppercase block">PREMIUM RATE APPLIED</span>
              <span className="text-sm font-extrabold text-emerald-500 font-mono">{coverageRate}% flat</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-black/[0.05] dark:border-white/5 mt-6 flex justify-between items-center text-[10px] text-[#86868B]">
          <span>*Final rates vary depending on specific insurance company underwriters select.</span>
          <span className="font-bold text-apple-blue uppercase tracking-wider font-mono">
            Zero-interest installment options available
          </span>
        </div>
      </div>

    </div>
  );
}
