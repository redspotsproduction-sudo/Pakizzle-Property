import React, { useState, useEffect } from 'react';
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
  Video, 
  Radar, 
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types & interfaces for the interactive components
interface Hotspot {
  id: string;
  name: string;
  x: string; // position percentage on SVG
  y: string;
  tool: string;
  metricName: string;
  metricValue: string;
  status: 'perfect' | 'warning' | 'alert';
  description: string;
  checks: string[];
}

export function InspectionHotspotsExplorer() {
  const [activeHotspotId, setActiveHotspotId] = useState<string>('engine');

  const hotspots: Hotspot[] = [
    {
      id: 'engine',
      name: 'Engine Bay & Cylinders',
      x: '50%',
      y: '22%',
      tool: 'Acoustic Ultrasound Engine Analyzer',
      metricName: 'Cylinder Compression Uniformity',
      metricValue: '98.4% (Nominal)',
      status: 'perfect',
      description: 'Our specialists perform a deep diagnostic audit of cylinder compression, dynamic valve timings, oil contamination levels, and starter motor cranking currents.',
      checks: [
        'Cylinder block compression ratio mapping',
        'Head gasket combustion gas seepage test',
        'Alternator output charging curve mapping',
        'Tensioners & auxiliary belt wear diagnostics'
      ]
    },
    {
      id: 'ecu',
      name: 'OBD-II CANbus Interface',
      x: '50%',
      y: '48%',
      tool: 'Autel MaxiSys Ultra deep-link',
      metricName: 'ECU Module Integrity Check',
      metricValue: '0 Active / 0 Cleared Faults',
      status: 'perfect',
      description: 'Full handshake with all internal ECUs. Unlike standard checkups, Pakizzle probes historical shadow codes and mileage discrepancies to catch rolled-back odometers.',
      checks: [
        'Anti-rollback odometer verification',
        'SRS airbag deployment circuit analysis',
        'ABS & ESP electronic handshake checks',
        'Historical diagnostic trouble code (DTC) logs'
      ]
    },
    {
      id: 'paint',
      name: 'Chassis & Paint Depth',
      x: '82%',
      y: '60%',
      tool: 'Dual-Sensor Ultrasonic Elcometer',
      metricName: 'Paint Thickness Resonance',
      metricValue: '102μm average (Factory standard)',
      status: 'perfect',
      description: 'Calculates the distance to the raw metal core at 45 distinct spots. Identifies hidden structural body fillers, re-sprays, and major panel replacements.',
      checks: [
        'A-B-C pillars paint consistency audit',
        'Bonnet, boot, and side panel thickness mapping',
        'Chassis member weld line original audit',
        'Inner fender well structural seam checks'
      ]
    },
    {
      id: 'suspension',
      name: 'Underbody & Steering',
      x: '50%',
      y: '80%',
      tool: 'Pneumatic Laser Alignment Hub',
      metricName: 'Strut Dampening Coefficient',
      metricValue: '0.85 (High Efficiency)',
      status: 'perfect',
      description: 'Lifting the vehicle to analyze tie-rods, suspension bushings, transmission drive axles, catalytic converter health, and structural frame fatigue.',
      checks: [
        'Shock absorber hydraulic fluid leak test',
        'CV joint boot & steering rack alignment sweep',
        'Exhaust system corrosion & exhaust emission scan',
        'Floorbed under-coating rust integrity check'
      ]
    },
    {
      id: 'hybrid',
      name: 'Hybrid Traction Battery',
      x: '50%',
      y: '65%',
      tool: 'Dynamic Resistance Load Balancer',
      metricName: 'Battery SOH (State of Health)',
      metricValue: '94.2% (Cell Balance Peak)',
      status: 'perfect',
      description: 'Exclusive to premium Pakizzle hybrid checks. We measure delta voltage between individual cell blocks under acceleration and braking to evaluate accurate battery life.',
      checks: [
        'Individual hybrid cell block resistance log',
        'Cooling fan dynamic airflow efficiency check',
        'State of Charge (SOC) fluctuation balance test',
        'Inverter/Converter high-voltage isolation scan'
      ]
    }
  ];

  const currentHotspot = hotspots.find(h => h.id === activeHotspotId) || hotspots[0];

  return (
    <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-apple-blue/5 rounded-full blur-[90px] pointer-events-none -mr-32 -mt-32" />
      
      <div className="relative z-10 space-y-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 rounded-full border border-apple-blue/15">
            Interactive Diagnostics Blueprint
          </span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            240-Point Deep-Scan
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-snug">
          Pakizzle Forensic Telemetry Matrix
        </h2>
        <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
          While competitors offer basic physical evaluations, Pakizzle uses advanced hardware telemetry to profile the vehicle's true mechanical DNA. Click on the hotspots to explore our scanning procedure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive CAD BluePrint (Left 5 Columns) */}
        <div className="lg:col-span-5 flex justify-center bg-[#F5F5F7] dark:bg-[#111112] rounded-2xl p-6 border border-black/[0.02] dark:border-white/[0.02] relative min-h-[360px] sm:min-h-[420px] select-none overflow-hidden">
          {/* Blueprint Grid Lines */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          
          {/* Premium Vector Car Chassis Outline (Top-Down) */}
          <svg className="w-44 sm:w-52 h-auto text-[#1D1D1F]/20 dark:text-white/10 transition-colors" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main Body */}
            <path d="M50 100C50 60 70 40 100 40C130 40 150 60 150 100V300C150 340 130 360 100 360C70 360 50 340 50 300V100Z" stroke="currentColor" strokeWidth="2.5" />
            {/* Front Bumper */}
            <path d="M60 40H140" stroke="currentColor" strokeWidth="1.5" />
            <path d="M65 30H135" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            {/* Wheels */}
            <rect x="35" y="65" width="15" height="35" rx="3" fill="currentColor" opacity="0.4" />
            <rect x="150" y="65" width="15" height="35" rx="3" fill="currentColor" opacity="0.4" />
            <rect x="35" y="295" width="15" height="35" rx="3" fill="currentColor" opacity="0.4" />
            <rect x="150" y="295" width="15" height="35" rx="3" fill="currentColor" opacity="0.4" />
            {/* Front Windshield */}
            <path d="M60 120C60 105 75 95 100 95C125 95 140 105 140 120H60Z" stroke="currentColor" strokeWidth="1.5" />
            {/* Rear Windshield */}
            <path d="M60 280C60 290 75 295 100 295C125 295 140 290 140 280H60Z" stroke="currentColor" strokeWidth="1.5" />
            {/* Side Mirrors */}
            <path d="M48 105H40" stroke="currentColor" strokeWidth="1.5" />
            <path d="M152 105H160" stroke="currentColor" strokeWidth="1.5" />
            {/* Hood lines */}
            <path d="M80 40V80" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <path d="M120 40V80" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            {/* Rear spoilers / Tail lines */}
            <path d="M60 340C70 350 130 350 140 340" stroke="currentColor" strokeWidth="1.5" />
          </svg>

          {/* Hotspot Indicators */}
          {hotspots.map((hs) => {
            const isActive = activeHotspotId === hs.id;
            return (
              <button
                key={hs.id}
                onClick={() => setActiveHotspotId(hs.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group focus:outline-none"
                style={{ left: hs.x, top: hs.y }}
              >
                {/* Outer Breathing Rings */}
                <span className={cn(
                  "absolute inset-0 rounded-full w-8 h-8 -left-4 -top-4 transition-all duration-500 scale-100",
                  isActive 
                    ? "bg-apple-blue/20 border border-apple-blue animate-ping" 
                    : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:scale-125"
                )} />
                {/* Inner Core Solid Circle */}
                <div className={cn(
                  "w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-300 relative z-10 shadow-md",
                  isActive 
                    ? "bg-apple-blue border-white text-white scale-110" 
                    : "bg-white dark:bg-[#2C2C2E] border-[#86868B]/40 text-[#86868B] group-hover:border-apple-blue"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-white scale-125 animate-pulse" : "bg-[#86868B] group-hover:bg-apple-blue"
                  )} />
                </div>
                
                {/* Micro Floating Tag */}
                <div className={cn(
                  "absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1D1D1F] text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md",
                  isActive && "opacity-100"
                )}>
                  {hs.name.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Overlay Display Card (Right 7 Columns) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHotspot.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-5 bg-[#F5F5F7]/30 dark:bg-white/[0.01] rounded-2xl p-5 sm:p-6 border border-black/[0.03] dark:border-white/[0.02]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.04] dark:border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-apple-blue uppercase tracking-widest block font-mono">
                    SENSOR PORT: {currentHotspot.id.toUpperCase()}
                  </span>
                  <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-apple-blue" />
                    {currentHotspot.name}
                  </h3>
                </div>
                
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-bold text-[#86868B] uppercase block">LIVE TELEMETRY STATUS</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-500 font-mono tracking-tight">{currentHotspot.metricValue}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Standard Core Diagnostic Equipment</span>
                  <div className="px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/5 rounded-xl text-[11px] font-bold text-apple-blue flex items-center gap-2 font-mono shadow-sm">
                    <Cpu className="w-3.5 h-3.5 text-apple-blue animate-pulse" />
                    {currentHotspot.tool}
                  </div>
                </div>

                <p className="text-[11px] text-[#86868B] leading-relaxed font-normal">
                  {currentHotspot.description}
                </p>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Mandatory Verification Checklist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentHotspot.checks.map((check, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-[#1C1C1E] px-3 py-2 border border-black/[0.03] dark:border-white/5 rounded-xl">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-[10px] text-[#1D1D1F] dark:text-white/90 font-medium leading-snug">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-black/[0.04] dark:border-white/5">
            <div className="flex items-center gap-1.5">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setActiveHotspotId(h.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                    activeHotspotId === h.id
                      ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                      : "bg-[#F5F5F7] dark:bg-white/5 border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  )}
                >
                  {h.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-bold text-[#86868B] flex items-center gap-1 font-mono uppercase tracking-wide">
              Selected 1 of 5 Nodes
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export function VerifiedBadgeBoost() {
  const [activeTab, setActiveTab] = useState<'with' | 'without'>('with');
  const [priceMultiplier, setPriceMultiplier] = useState<number>(35); // 3.5 Lacs over value

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Interactive Mockup Listing Card (Left 5 Columns) */}
      <div className="lg:col-span-5 bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between relative overflow-hidden shadow-md">
        
        {/* Toggle Pills */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] font-mono">Simulated Ad Card</span>
          <div className="bg-[#F5F5F7] dark:bg-white/5 p-0.5 rounded-lg flex gap-1 border border-black/[0.02] dark:border-white/5">
            <button
              onClick={() => setActiveTab('with')}
              className={cn(
                "px-2.5 py-1 text-[9px] font-bold uppercase rounded-md transition-colors",
                activeTab === 'with'
                  ? "bg-white dark:bg-[#2C2C2E] text-apple-blue shadow-sm"
                  : "text-[#86868B]"
              )}
            >
              With Badge
            </button>
            <button
              onClick={() => setActiveTab('without')}
              className={cn(
                "px-2.5 py-1 text-[9px] font-bold uppercase rounded-md transition-colors",
                activeTab === 'without'
                  ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white/80 shadow-sm"
                  : "text-[#86868B]"
              )}
            >
              Standard
            </button>
          </div>
        </div>

        {/* Listing Mock Frame */}
        <div className="bg-[#F5F5F7]/30 dark:bg-white/[0.005] border border-black/[0.03] dark:border-white/5 rounded-2xl p-4 space-y-4 relative">
          
          {/* Card Media Simulator */}
          <div className="h-44 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 flex flex-col justify-between p-3 relative overflow-hidden">
            {/* Background Texture mock */}
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
            
            {/* Pakizzle Verified Badge overlay */}
            <AnimatePresence>
              {activeTab === 'with' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-apple-blue/90 border border-white/20 text-white rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-lg w-fit z-10 animate-pulse backdrop-blur-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5px]" />
                  Pakizzle Verified™
                </motion.div>
              )}
            </AnimatePresence>

            <div className="z-10 flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-white/75 font-mono">DHA PHASE 6 • LAHORE</span>
                <h4 className="text-sm font-bold text-white leading-tight">Toyota Civic Oriel 1.5 VTEC</h4>
              </div>
              <span className="text-xs font-mono font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">2023</span>
            </div>
          </div>

          {/* Ad Details Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold font-mono tracking-tight text-[#1D1D1F] dark:text-white">
                PKR 7,850,000
              </span>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Verified Price Match
              </span>
            </div>

            {/* Simulated Live Statistics */}
            <div className="grid grid-cols-2 gap-3 border-t border-black/[0.04] dark:border-white/5 pt-3 text-[10px]">
              <div className="space-y-0.5">
                <span className="text-[#86868B] font-bold block uppercase tracking-wider">Search Impressions</span>
                <span className="font-mono font-bold text-[#1D1D1F] dark:text-white">
                  {activeTab === 'with' ? '42,890 / wk' : '11,200 / wk'}
                </span>
                <span className={cn("text-[8px] font-bold block", activeTab === 'with' ? 'text-emerald-500' : 'text-[#86868B]')}>
                  {activeTab === 'with' ? '+380% Search Velocity' : 'Baseline performance'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#86868B] font-bold block uppercase tracking-wider">Average Days to Sell</span>
                <span className="font-mono font-bold text-[#1D1D1F] dark:text-white">
                  {activeTab === 'with' ? '4 Days (Fastest)' : '32 Days (Typical)'}
                </span>
                <span className={cn("text-[8px] font-bold block", activeTab === 'with' ? 'text-emerald-500' : 'text-amber-500')}>
                  {activeTab === 'with' ? '8x Higher Click-Through' : 'Market average'}
                </span>
              </div>
            </div>

            {/* Dynamic Telemetry Seal Log on Card */}
            {activeTab === 'with' && (
              <div className="bg-apple-blue/5 border border-apple-blue/15 rounded-xl p-2.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-apple-blue" />
                  <span className="font-semibold text-apple-blue">240-Point Diagnostics Seal Attached</span>
                </div>
                <span className="font-mono font-bold text-apple-blue text-[9px] uppercase tracking-wider">SECURE MATCH</span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Advanced Performance Stats Panel (Right 7 Columns) */}
      <div className="lg:col-span-7 bg-[#1D1D1F] dark:bg-[#111112] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/5 flex flex-col justify-between shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/15 rounded-full blur-[90px] pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 space-y-5">
          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-apple-blue uppercase tracking-[0.25em] block">
              SELLER OPTIMIZATION SIMULATOR
            </span>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
              The Pakizzle Verified™ Premium Advantage
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-normal">
              Unlike Dubizzle or other regional listings where buyers have to negotiate under severe doubt, a Pakizzle Verified badge establishes immediate trust. Look at the verified conversion parameters:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { label: 'Odometer Integrity', value: '100% Genuine', note: 'Autel deep-ECU verification block', color: 'text-apple-blue' },
              { label: 'Buyer Call Velocity', value: '4.8x Multiplier', note: 'Compared to standard listings', color: 'text-emerald-400' },
              { label: 'Price Premium Boost', value: 'PKR 3.5 Lacs+', note: 'Secured via forensic reports', color: 'text-amber-400' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] font-bold text-white/55 uppercase block tracking-wider">{stat.label}</span>
                <span className={cn("text-base font-bold font-mono tracking-tight block", stat.color)}>{stat.value}</span>
                <span className="text-[8px] text-white/40 block leading-normal">{stat.note}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-2xl p-4.5 border border-white/5 space-y-3.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-white/50 uppercase tracking-wider">
              <span>Adjust Estimated Premium Secured Above Market Value</span>
              <span className="font-mono text-apple-blue">PKR {(priceMultiplier * 10000).toLocaleString()} Premium</span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={priceMultiplier}
                onChange={(e) => setPriceMultiplier(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-apple-blue focus:outline-none"
              />
              <div className="flex justify-between text-[8px] text-white/40 font-mono">
                <span>PKR 1.0 Lacs</span>
                <span>PKR 4.5 Lacs (Avg premium saved)</span>
                <span>PKR 8.0 Lacs+ (Luxury SUV spec)</span>
              </div>
            </div>
          </div>

        </div>

        <div className="relative z-10 pt-5 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest block font-mono">ESTIMATED RETURN ON INITIATIVE</span>
            <span className="text-sm font-bold text-emerald-400">
              Secures up to {Math.round(((priceMultiplier * 10000) / 8500))}x the inspection fee cost back on final sales price
            </span>
          </div>

          <button
            onClick={() => window.location.href = '/inspection/book'}
            className="px-5 py-2.5 bg-apple-blue hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition-colors text-center"
          >
            Schedule Dispatch Verification
          </button>
        </div>

      </div>
    </div>
  );
}

export function DubizzleComparison() {
  return (
    <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-apple-blue/5 rounded-full blur-[80px] pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10 space-y-2 mb-6">
        <span className="text-[9px] font-extrabold text-apple-blue uppercase tracking-[0.25em] block">
          THE GENERATIONAL AUTO-TECH JUMP
        </span>
        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
          Beyond Middle Eastern Standards: Pakizzle vs. Competitors
        </h3>
        <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
          While Dubai's classic inspection sites provide manual checkpoints, Pakizzle's connected hardware network utilizes deep cloud diagnostics and blockchain encryption to establish foolproof vehicle pedigree.
        </p>
      </div>

      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/10 text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
              <th className="py-3 px-4">Verification Capability</th>
              <th className="py-3 px-4 text-center bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue border-x border-apple-blue/10">Pakizzle Forensic Audit</th>
              <th className="py-3 px-4 text-center">Typical Dubai Inspection</th>
              <th className="py-3 px-4 text-center">Standard Local Mechanic</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-semibold text-[#1D1D1F] dark:text-white/90 divide-y divide-black/[0.03] dark:divide-white/5">
            {[
              {
                spec: "Odometer Anti-Tampering Engine Probes",
                pakizzle: "ECU shadow code diagnostics + odometer module registry comparison (Absolute)",
                dubizzle: "Manual odometer inspection & digital value log only",
                local: "Odometer visual dial check"
              },
              {
                spec: "Ultrasonic Body Paint Panel Mapping",
                pakizzle: "3D panel resonance scan over 45 panel points with micron accuracy",
                dubizzle: "Electronic paint gauge check on selected exterior panels",
                local: "Knocking on panels to listen to sound"
              },
              {
                spec: "Hybrid Vehicle Traction Battery Diagnosis",
                pakizzle: "Dynamic individual cell SOH load resistance & module balancing analysis",
                dubizzle: "Standard diagnostic code scanning check",
                local: "None available"
              },
              {
                spec: "4K Video Tour & Multi-Angle Photographic Documentation",
                pakizzle: "60+ high-res images + 4K ultra-smooth video walkaround stream",
                dubizzle: "Standard 25 to 30 JPEG photo bundle",
                local: "None available"
              },
              {
                spec: "Blockchain-secured Report Registry",
                pakizzle: "Reports are cryptographic tokens secured from deletion or retrospect edits",
                dubizzle: "PDF report sent via email (no tamper prevention)",
                local: "Verbal feedback or handwriting notepad paper"
              },
              {
                spec: "Local Dispatch Response Radar",
                pakizzle: "Nearest physical diagnostic node dispatched in under 60 mins across main hubs",
                dubizzle: "Booking scheduled days in advance or drive to designated workshop center",
                local: "Workshop location visit only"
              }
            ].map((row, idx) => (
              <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                <td className="py-4 px-4 max-w-[200px] leading-relaxed text-xs">{row.spec}</td>
                <td className="py-4 px-4 text-center bg-apple-blue/[0.01] dark:bg-apple-blue/5 text-apple-blue border-x border-apple-blue/10 max-w-[250px] leading-normal font-bold">
                  {row.pakizzle}
                </td>
                <td className="py-4 px-4 text-center text-[#86868B] max-w-[200px] leading-normal font-medium">
                  {row.dubizzle}
                </td>
                <td className="py-4 px-4 text-center text-[#86868B] max-w-[150px] leading-normal font-medium">
                  {row.local}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LiveNodeRadar() {
  const [selectedCity, setSelectedCity] = useState<'khi' | 'lhe' | 'isb'>('lhe');

  const cityDetails = {
    khi: {
      activeNodes: 12,
      avgEta: '45 mins',
      cityTitle: 'Karachi Central Operations',
      dispatchCenters: ['Clifton Node', 'DHA Node VII', 'PECHS Dispatch Hub', 'Gulshan-e-Iqbal Sector 4'],
      leadEngineer: 'Engr. Zain Malik',
      specializedFleet: '6 Connected Telemetry Vans'
    },
    lhe: {
      activeNodes: 15,
      avgEta: '38 mins',
      cityTitle: 'Lahore Metropolitan Network',
      dispatchCenters: ['Gulberg II Main Office', 'DHA Phase 6 Tech Node', 'Model Town Base Center', 'Johar Town Sector G'],
      leadEngineer: 'Engr. Haris Khan',
      specializedFleet: '8 Connected Telemetry Vans'
    },
    isb: {
      activeNodes: 8,
      avgEta: '52 mins',
      cityTitle: 'Islamabad/Rawalpindi Operations',
      dispatchCenters: ['F-8 Markaz Central Hub', 'Saddar Pindi Node', 'G-11 Technology Center', 'Bahria Phase 7 Hub'],
      leadEngineer: 'Engr. Bilal Shah',
      specializedFleet: '4 Connected Telemetry Vans'
    }
  };

  const details = cityDetails[selectedCity];

  return (
    <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Animated Radar Graph (Left 4 Columns) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-[#111112] rounded-2xl p-6 border border-black/[0.02] dark:border-white/[0.02] relative min-h-[250px] select-none overflow-hidden">
          {/* Radar circle concentric lines */}
          <div className="absolute w-44 h-44 border border-emerald-500/10 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 border border-emerald-500/15 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border border-emerald-500/30 rounded-full" />
              </div>
            </div>
          </div>

          {/* Sweeper Arm line */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-24 h-24 origin-top-left border-l border-emerald-500/40 bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            style={{ x: 0, y: 0 }}
          />

          {/* Pulsing Active Blips */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-apple-blue rounded-full animate-pulse shadow-[0_0_10px_rgba(0,113,227,0.7)]" />

          {/* Micro telemetry label */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold font-mono tracking-widest text-[#86868B] uppercase">
            ACTIVE SCANNING LOCAL RADAR
          </div>

          <Radar className="w-8 h-8 text-emerald-500 relative z-10 animate-bounce" />
        </div>

        {/* Dynamic City Node Details (Right 8 Columns) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-[#86868B] uppercase tracking-[0.25em] block">
              PAKIZZLE ACTIVE COMMAND NETWORK
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
              Dynamic Inspector Fleet Operations
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              We operate highly optimized logistics networks in core cities. This allows our certified engineers to arrive at the seller's doorstep within minutes of booking.
            </p>
          </div>

          {/* City Selector Buttons */}
          <div className="flex gap-2">
            {[
              { id: 'lhe' as const, label: 'Lahore Hub' },
              { id: 'khi' as const, label: 'Karachi Hub' },
              { id: 'isb' as const, label: 'Islamabad / Rawalpindi Hub' }
            ].map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold rounded-xl transition-all border",
                  selectedCity === city.id
                    ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-black border-transparent shadow"
                    : "bg-[#F5F5F7] dark:bg-white/5 border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                {city.label}
              </button>
            ))}
          </div>

          {/* City Statistics & Node List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left side node list */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider block">Active Dispatch Centers</span>
              <div className="space-y-1.5">
                {details.dispatchCenters.map((hub, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#F5F5F7]/50 dark:bg-white/5 px-3 py-1.5 border border-black/[0.02] dark:border-white/[0.02] rounded-xl text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span className="text-[#1D1D1F] dark:text-white/95">{hub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side telemetry parameters */}
            <div className="space-y-3.5 bg-[#F5F5F7]/30 dark:bg-white/[0.005] border border-black/[0.03] dark:border-white/5 rounded-2xl p-4">
              <h4 className="text-[10px] font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">{details.cityTitle}</h4>
              
              <div className="space-y-2 text-[10px] font-semibold text-[#86868B]">
                <div className="flex justify-between border-b border-black/[0.03] dark:border-white/5 pb-1.5">
                  <span>Active Specialists On-Duty</span>
                  <span className="text-[#1D1D1F] dark:text-white">{details.activeNodes} Engineers</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.03] dark:border-white/5 pb-1.5">
                  <span>Average Response ETA</span>
                  <span className="text-apple-blue font-bold font-mono">{details.avgEta}</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.03] dark:border-white/5 pb-1.5">
                  <span>Hub Coordinator</span>
                  <span className="text-[#1D1D1F] dark:text-white">{details.leadEngineer}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Telemetry Rig Fleet</span>
                  <span className="text-emerald-500 font-bold">{details.specializedFleet}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Interactive Luxury Car Showcase with Red Grid Pattern & Floating High-fidelity Hotspots
export function InteractiveLuxuryShowcase() {
  const [activeTab, setActiveTab] = useState<'report' | 'anywhere' | 'points'>('report');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('bodyPaint');

  // Custom hotspots for the red vehicle side profile
  const hotspots = [
    {
      id: 'bodyPaint',
      name: 'Ultrasonic Paint Scan',
      x: '25%',
      y: '55%',
      desc: 'Dual-sensor magnetic elcometer audit across 45 distinct panels to detect deep body filler and accidental resprays.',
      metric: '102μm average (Factory Range)'
    },
    {
      id: 'engineCompartment',
      name: 'Dynamic Engine Diagnostic',
      x: '80%',
      y: '48%',
      desc: 'Cylinder compression profiling, active timing scans, and fluid chemistry analysis to detect block wear.',
      metric: '98.2% Efficiency Balance'
    },
    {
      id: 'ecuScan',
      name: 'ODB-II CANbus handshake',
      x: '62%',
      y: '50%',
      desc: 'Deep logic scan of all electrical systems to pull active codes, deployment history, and odometer validation markers.',
      metric: '0 Active Fault Codes'
    },
    {
      id: 'tireSuspension',
      name: 'Undercarriage Sweep',
      x: '75%',
      y: '72%',
      desc: 'Chassis rails weld validation, hydraulic suspension dampener leak checks, and steering alignment sweep.',
      metric: 'Optimal Dampening Ratio (0.84)'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      
      {/* Title block */}
      <div className="relative z-10 space-y-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 dark:bg-red-500/10 rounded-full border border-red-500/15">
            Interactive Showcase
          </span>
          <span className="text-[10px] text-apple-blue font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-apple-blue rounded-full animate-pulse" />
            Interactive Simulation
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-snug">
          Explore the Pakizzle Verification Suite
        </h2>
        <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
          Hover or click on the floating diagnostic cards or directly on the luxury vehicle profile hotspots to trigger active telemetry readings.
        </p>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Interactive Image Frame (Left 7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center bg-[#FFF8F8] dark:bg-[#151111] rounded-2xl p-4 sm:p-8 border border-red-500/10 dark:border-red-500/5 relative min-h-[380px] overflow-hidden select-none">
          
          {/* Aesthetic pinkish/reddish Grid lines background EXACTLY like the image attached by the user */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(to right, rgba(239, 68, 68, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 68, 68, 0.08) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }} />

          {/* Luxury Red Mercedes Sedan profile with absolute positioning */}
          <div className="relative w-full max-w-[500px] z-10 py-6">
            <img 
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000" 
              alt="Red Luxury Sedan" 
              className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_25px_50px_rgba(239,68,68,0.06)] rounded-xl transition-all duration-500"
              referrerPolicy="no-referrer"
            />

            {/* Glowing Hotspots on the Red Car */}
            {hotspots.map((hs) => {
              const isActive = selectedHotspot === hs.id;
              return (
                <button
                  key={hs.id}
                  onClick={() => {
                    setSelectedHotspot(hs.id);
                    if (hs.id === 'bodyPaint') setActiveTab('points');
                    if (hs.id === 'engineCompartment') setActiveTab('report');
                    if (hs.id === 'ecuScan') setActiveTab('report');
                    if (hs.id === 'tireSuspension') setActiveTab('points');
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group focus:outline-none"
                  style={{ left: hs.x, top: hs.y }}
                >
                  <span className={cn(
                    "absolute inset-0 rounded-full w-8 h-8 -left-4 -top-4 transition-all duration-500 scale-100",
                    isActive 
                      ? "bg-red-500/20 border border-red-500 animate-ping" 
                      : "bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 group-hover:scale-125"
                  )} />
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 relative z-10 shadow-md",
                    isActive 
                      ? "bg-red-500 border-white text-white scale-110" 
                      : "bg-white dark:bg-[#2C2C2E] border-red-500/40 text-red-500 group-hover:border-red-500"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      isActive ? "bg-white scale-125 animate-pulse" : "bg-red-400 group-hover:bg-red-500"
                    )} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Floating UI Cards with elegant design matching user image */}
          
          {/* Card 1: Instant Inspection Report (Top Left) */}
          <div 
            onClick={() => {
              setActiveTab('report');
              setSelectedHotspot('ecuScan');
            }}
            className={cn(
              "absolute top-4 left-4 sm:top-6 sm:left-6 bg-white dark:bg-[#1E1E1F] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-3 flex items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-[1.03] transition-all z-20",
              activeTab === 'report' ? "ring-2 ring-apple-blue/50 dark:ring-apple-blue" : ""
            )}
          >
            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#1D1D1F] dark:text-white leading-tight">Instant</div>
              <div className="text-[10px] font-semibold text-[#86868B] leading-tight">Inspection Report</div>
            </div>
          </div>

          {/* Card 2: Inspect Anywhere! (Top Right) */}
          <div 
            onClick={() => {
              setActiveTab('anywhere');
              setSelectedHotspot('tireSuspension');
            }}
            className={cn(
              "absolute top-4 right-4 sm:top-6 sm:right-6 bg-white dark:bg-[#1E1E1F] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-3 flex items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-[1.03] transition-all z-20",
              activeTab === 'anywhere' ? "ring-2 ring-purple-500/50 dark:ring-purple-500" : ""
            )}
          >
            <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold shadow-sm">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#1D1D1F] dark:text-white leading-tight">Inspect</div>
              <div className="text-[10px] font-semibold text-[#86868B] leading-tight">Anywhere!</div>
            </div>
          </div>

          {/* Card 3: 120 - 240 Points Covered (Bottom Center) */}
          <div 
            onClick={() => {
              setActiveTab('points');
              setSelectedHotspot('bodyPaint');
            }}
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E1E1F] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-3 flex items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-[1.03] transition-all z-20 whitespace-nowrap",
              activeTab === 'points' ? "ring-2 ring-emerald-500/50 dark:ring-emerald-500" : ""
            )}
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#1D1D1F] dark:text-white leading-tight">120 - 240</div>
              <div className="text-[10px] font-semibold text-[#86868B] leading-tight">Points Covered</div>
            </div>
          </div>

        </div>

        {/* Dynamic Telemetry Inspector Dashboard (Right 5 Columns) */}
        <div className="lg:col-span-5 bg-[#FAFAFA] dark:bg-[#19191B] rounded-2xl p-5 sm:p-6 border border-black/[0.03] dark:border-white/[0.02] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {activeTab === 'report' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-apple-blue uppercase tracking-widest font-mono">MODULE METRIC DEEP-LINK</span>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-apple-blue" />
                      Instant Telemetry Digital Feedback
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#86868B] leading-relaxed">
                    Once our doorstep sweep concludes, we translate pure mechanical engine vibrations and digital fault memories into a gorgeous, cloud-hosted dashboard sent to your phone.
                  </p>

                  <div className="bg-white dark:bg-[#2C2C2E] p-3 rounded-xl border border-black/[0.03] dark:border-white/5 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-[#86868B]">Odometer ODB-II Hash</span>
                      <span className="text-emerald-500 font-mono font-bold">100% Intact</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-[#86868B]">Airbag Circuit Deploy Log</span>
                      <span className="text-emerald-500 font-mono font-bold">Passed (Factory Spec)</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-[#86868B]">ECU Warning Shadows</span>
                      <span className="text-emerald-500 font-mono font-bold">0 Errors Found</span>
                    </div>
                  </div>

                  {selectedHotspot && hotspots.find(h => h.id === selectedHotspot) && (
                    <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 p-3 rounded-xl text-[10px] space-y-1">
                      <div className="font-bold text-apple-blue flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 animate-pulse" />
                        Selected Hotspot: {hotspots.find(h => h.id === selectedHotspot)?.name}
                      </div>
                      <p className="text-[#86868B] leading-normal">{hotspots.find(h => h.id === selectedHotspot)?.desc}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'anywhere' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest font-mono">60-MIN DOORSTEP DISPATCH</span>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                      <Radar className="w-4 h-4 text-purple-500" />
                      Doorstep Mobile Fleet Nodes
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#86868B] leading-relaxed">
                    You do not need to pull the seller away or drive the car to standard workshops. Our connected dispatch network has active teams waiting to execute inspections across Lahore, Karachi, and Islamabad.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { city: 'Lahore', nodes: '15 Active Nodes', eta: '38m ETA' },
                      { city: 'Karachi', nodes: '12 Active Nodes', eta: '45m ETA' },
                      { city: 'Islamabad', nodes: '8 Active Nodes', eta: '52m ETA' }
                    ].map((c, i) => (
                      <div key={i} className="bg-white dark:bg-[#2C2C2E] p-2 rounded-xl text-center border border-black/[0.03] dark:border-white/5">
                        <div className="text-[10px] font-bold text-[#1D1D1F] dark:text-white">{c.city}</div>
                        <div className="text-[8px] text-[#86868B] mt-0.5">{c.nodes}</div>
                        <div className="text-[9px] text-purple-500 font-bold font-mono mt-1">{c.eta}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15 p-3 rounded-xl text-[10px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping shrink-0" />
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Continuous live location telemetry matches seller address perfectly.</span>
                  </div>
                </div>
              )}

              {activeTab === 'points' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">MANDATORY 240-POINT MATRIX</span>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Deep Forensic Inspection Coverage
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#86868B] leading-relaxed">
                    Unlike manual mechanic checkups, we scan everything under extreme hardware calibration. Every panel, cylinder, brake pads, steering joint, and hybrid cell state of health is certified.
                  </p>

                  <div className="space-y-2">
                    {hotspots.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHotspot(h.id)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl border text-[10px] flex items-center justify-between transition-colors",
                          selectedHotspot === h.id
                            ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-[#1D1D1F] dark:text-white"
                            : "bg-white dark:bg-[#2C2C2E] border-black/[0.03] dark:border-white/5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                        )}
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {h.name}
                        </span>
                        <span className="font-mono font-semibold text-[9px] text-emerald-600 dark:text-emerald-400 shrink-0">
                          {h.metric}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="pt-4 border-t border-black/[0.04] dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#86868B]">Select tabs or car blips to sweep</span>
            <span className="text-[9px] font-bold uppercase text-red-500 font-mono tracking-wider flex items-center gap-1">
              LIVE SIGNAL ACTIVE
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

