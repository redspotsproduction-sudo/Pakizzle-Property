import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  AlertTriangle,
  ClipboardList, 
  Search, 
  Car, 
  ArrowRight,
  Zap,
  Activity,
  Award,
  Star,
  FileText,
  Smartphone,
  Calendar,
  Filter,
  Eye,
  MessageSquare,
  Sparkles,
  Sliders,
  AlertCircle,
  HelpCircle,
  UserCheck,
  ThumbsUp,
  X,
  Gauge,
  Cpu,
  Check,
  Shield,
  Coins
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import {
  InteractiveLuxuryShowcase,
  InspectionHotspotsExplorer,
  VerifiedBadgeBoost,
  DubizzleComparison,
  LiveNodeRadar
} from './AdvancedInspectionWidgets';

// FAQ Structure
interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Do I need to get the seller's permission first?",
    answer: "Yes. Since our mobile inspector must physically inspect and hook up diagnostic equipment to the vehicle, you should inform the seller beforehand. Most genuine sellers welcome inspections as it proves their car's condition and facilitates a faster sale."
  },
  {
    question: "Do I need to be present at the inspection site?",
    answer: "No, you don't need to be there! Over 70% of our buyers are out-of-city or busy. Our lead engineer handles the entire handshake with the seller. Once completed, a high-fidelity digital report with full paint charts, OBD diagnostics, and 4K photographs is sent directly to your phone."
  },
  {
    question: "How long does a mobile inspection sweep take?",
    answer: "A comprehensive sweep takes between 45 to 70 minutes depending on the selected package. The engineer scans all electronic modules, tests paint thickness on every panel, examines the chassis, and performs a dynamic road test."
  },
  {
    question: "What equipment do Pakizzle engineers use?",
    answer: "We use top-tier professional diagnostic hardware including Autel MaxiSys OBD-II multi-system CANbus scanners, dual-sensor magnetic ultrasonic paint thickness elcometers, cell-resistance battery load analyzers for hybrids, and pneumatic chassis inspection gear."
  },
  {
    question: "What cities are currently covered by Pakizzle mobile nodes?",
    answer: "We offer instant 60-minute dispatch across all major zones in Lahore (DHA, Gulberg, Johar Town, etc.), Karachi (Clifton, DHA, PECHS, Gulshan, etc.), and Islamabad/Rawalpindi."
  },
  {
    question: "What is your refund/cancellation policy?",
    answer: "You can reschedule or cancel your inspection free of charge up to 3 hours before the scheduled appointment. If the seller backs out at the last minute or refuses to cooperate when our engineer arrives, we only charge a minor dispatch fuel fee of PKR 1,500 and refund the rest."
  }
];

// Interactive Core Check Points
const CHECK_CATEGORIES = [
  {
    id: 'engine',
    title: 'Engine & Transmission',
    icon: Cpu,
    points: [
      'Cylinder compression uniform balance audit',
      'Oil contamination, viscosity & sludge check',
      'Radiator pressure and coolant leakage telemetry',
      'Transmission gear shift lag & clutch slip test',
      'Engine mountings resonance & abnormal noise'
    ]
  },
  {
    id: 'paint',
    title: 'Paint & Body original',
    icon: Sliders,
    points: [
      'Ultrasonic paint thickness scan on 45 panels',
      'Hidden dent repair and body filler identification',
      'Original windglass and screen frame seal audit',
      'Accidental panel respray & color matching test',
      'Trunk floor & engine apron original seal checks'
    ]
  },
  {
    id: 'obd',
    title: 'Computer OBD Diagnostics',
    icon: Gauge,
    points: [
      'Complete CANbus system diagnostic scan',
      'Real-time airbag & SRS deployment test',
      'ABS module & wheel speed sensor logging',
      'Odometer anti-rollback history checksum verification',
      'Active emissions catalytic converter monitor'
    ]
  },
  {
    id: 'chassis',
    title: 'Chassis & Suspension',
    icon: Shield,
    points: [
      'Main structural frame weld original audit',
      'Shock absorber damping fluid leak check',
      'Tie rods, steering rack & ball joint wear',
      'Chassis alignment & underbody rust scan',
      'Exhaust manifold and muffler structural check'
    ]
  }
];

export default function InspectionLanding() {
  const navigate = useNavigate();
  
  // Interactive estimator states
  const [estCity, setEstCity] = useState<'khi' | 'lhe' | 'isb'>('lhe');
  const [estCarType, setEstCarType] = useState<'hatch' | 'sedan' | 'suv'>('sedan');
  const [estBrand, setEstBrand] = useState('Toyota');

  // Interactive sample report states
  const [reportTab, setReportTab] = useState<'paint' | 'engine' | 'obd'>('paint');

  // FAQ Expand state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Dynamic price quote calculation
  const calculatedPrice = useMemo(() => {
    let base = 6500;
    if (estCarType === 'hatch') base = 5500;
    if (estCarType === 'suv') base = 9500;

    // Premium multiplier for cities
    if (estCity === 'isb') base += 500;
    return base;
  }, [estCarType, estCity]);

  const handleBookNow = () => {
    toast.success("Estimator locked!", {
      description: `Proceeding with booking for ${estBrand} in ${estCity.toUpperCase()}.`
    });
    navigate('/inspection/book');
  };

  return (
    <div className="text-[var(--text-primary)] dark:text-[var(--text-primary)] antialiased min-h-screen bg-[var(--text-primary)] dark:bg-[var(--bg-page)] transition-colors duration-500 selection:bg-apple-blue/10 selection:text-apple-blue">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-white to-[var(--text-primary)] dark:from-[var(--bg-surface)] dark:to-[var(--bg-page)] border-b border-black/[0.04] dark:border-white/[0.04]">
        {/* Abstract vector backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 dark:bg-apple-blue/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gold-decoration/5 dark:bg-gold-decoration/5 rounded-full blur-[80px] pointer-events-none -ml-40 -mb-20" />

        <div className="max-w-[1024px] mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and Pitch */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-xs font-bold text-apple-blue tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pakistan’s Ultimate 240+ Point Mobile Inspection
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.1]">
                Buy used cars with <span className="text-apple-blue font-bold">100% confidence</span>.
              </h1>
              
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Avoid costly surprises. Pakizzle’s certified mobile engineers inspect the chassis, body paint thickness, OBD-II telemetry, and road handling at the seller's doorstep within 60 minutes.
              </p>

              <div className="flex flex-wrap gap-4 items-center pt-2">
                <button
                  onClick={() => navigate('/inspection/book')}
                  className="px-6 py-3 text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white rounded-full transition-all shadow-md flex items-center gap-2 group"
                >
                  Book Doorstep Inspection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a 
                  href="#how-it-works"
                  className="text-xs font-bold text-[var(--text-primary)] dark:text-white hover:text-apple-blue transition-colors flex items-center gap-1"
                >
                  See How It Works
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </a>
              </div>

              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/[0.05] dark:border-white/5 max-w-lg">
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-apple-blue font-mono">240+</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Points Scanned</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-[var(--text-primary)] dark:text-white font-mono">1 Hour</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Digital Report</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-apple-green font-mono">99.8%</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Accurate Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Quote Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-apple-blue to-cyan-500" />
                
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-1">Get an Instant Estimate</h3>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-white leading-tight mb-5">Select Car Parameters</h2>

                <div className="space-y-4">
                  {/* City Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">City Node</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'lhe' as const, label: 'Lahore' },
                        { id: 'khi' as const, label: 'Karachi' },
                        { id: 'isb' as const, label: 'Islamabad' }
                      ].map((city) => (
                        <button
                          key={city.id}
                          onClick={() => setEstCity(city.id)}
                          className={cn(
                            "py-2 text-[10px] font-bold rounded-xl border text-center transition-all",
                            estCity === city.id
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-[var(--text-primary)] dark:bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                          )}
                        >
                          {city.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Class */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Vehicle Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hatch' as const, label: 'Hatchback', desc: 'Alto, Vitz, Cultus' },
                        { id: 'sedan' as const, label: 'Sedan', desc: 'Civic, Corolla, City' },
                        { id: 'suv' as const, label: 'SUV / Premium', desc: 'Fortuner, Sportage, Sport' }
                      ].map((classItem) => (
                        <button
                          key={classItem.id}
                          onClick={() => setEstCarType(classItem.id)}
                          className={cn(
                            "p-2 text-left rounded-xl border transition-all flex flex-col justify-between min-h-[56px]",
                            estCarType === classItem.id
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-[var(--text-primary)] dark:bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                          )}
                        >
                          <span className="text-[10px] font-bold block">{classItem.label}</span>
                          <span className={cn("text-[7px] block truncate", estCarType === classItem.id ? "text-white/80" : "text-[var(--text-secondary)]")}>
                            {classItem.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick details */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Vehicle Brand / Model</label>
                    <input 
                      type="text"
                      placeholder="e.g. Toyota Civic Oriel"
                      value={estBrand}
                      onChange={(e) => setEstBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-xl text-xs font-semibold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                    />
                  </div>

                  {/* dynamic price quote block */}
                  <div className="bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 rounded-2xl p-4 flex justify-between items-center mt-5">
                    <div>
                      <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-wider block">ESTIMATED INSPECTION FEE</span>
                      <span className="text-xl font-bold font-mono text-[var(--text-primary)] dark:text-white">PKR {calculatedPrice.toLocaleString()}</span>
                      <span className="text-[8px] text-[var(--text-secondary)] block mt-0.5">All mobile travel fees included.</span>
                    </div>

                    <button
                      onClick={handleBookNow}
                      className="px-4 py-2.5 bg-apple-blue hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Luxury Showcase Section */}
      <section className="py-12 max-w-[1024px] mx-auto px-6 sm:px-8">
        <InteractiveLuxuryShowcase />
      </section>

      {/* Trust & Pain points section: "Why get a Pakizzle Inspection?" */}
      <section className="py-20 max-w-[1024px] mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            MARKET DANGERS IN PAKISTAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Avoid Costly Used Car Scams
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Over 65% of used cars listed online in Pakistan carry hidden structural repairs, electronic fault wipes, or rolled-back odometers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Odometer Tampering Check",
              desc: "Dishonest dealers routinely rollback odometers. Our advanced Autel multi-ECU scan compares mileage memory counters across airbag, transmission, and cluster modules to reveal true mileage.",
              icon: AlertTriangle,
              iconColor: "text-gold-decoration bg-gold-decoration/5 dark:bg-gold-decoration/10 border-gold-decoration/10"
            },
            {
              title: "Accident / Chassis Weld Audit",
              desc: "Cars with structural damage are completely unsafe. We use dual-probe paint thickness meters and inspect weld seams to catch major impact repairs covered up by smart cosmetic repaint.",
              icon: ShieldCheck,
              iconColor: "text-apple-red bg-apple-red/5 dark:bg-apple-red/10 border-apple-red/10"
            },
            {
              title: "Sludge & Cylinder Failure Check",
              desc: "A compression mismatch indicates deep engine rot. We analyze cylinder uniform balance, oil viscosity, sludge build-ups, and coolant blowouts so you don't buy an engine needing immediate rebuild.",
              icon: Activity,
              iconColor: "text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 border-apple-blue/10"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl p-6 border border-black/[0.04] dark:border-white/[0.04] hover:shadow-[0_12px_30px_rgba(0,0,0,0.015)] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", item.iconColor)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--text-primary)] dark:text-white">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Feature Coverage Grid */}
      <section className="py-20 bg-white dark:bg-[var(--bg-surface)] border-y border-black/[0.03] dark:border-white/5">
        <div className="max-w-[1024px] mx-auto px-6 sm:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
                COMPREHENSIVE CHECKS
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
                What does our 240+ Point Sweep Cover?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                Every single mobile inspection covers extensive physical, electronic, dynamic and forensic components. Look at the key areas scanned below:
              </p>
            </div>

            <button
              onClick={() => navigate('/inspection/book')}
              className="shrink-0 px-5 py-2.5 text-xs font-semibold bg-[var(--text-primary)] dark:bg-white/5 hover:bg-black/[0.04] dark:hover:bg-white/10 text-[var(--text-primary)] dark:text-white border border-black/[0.04] dark:border-white/10 rounded-full transition-all flex items-center gap-1.5"
            >
              Configure Custom Audit
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHECK_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div 
                  key={category.id}
                  className="bg-[var(--text-primary)]/50 dark:bg-white/[0.015] border border-black/[0.03] dark:border-white/[0.02] rounded-3xl p-5 hover:border-apple-blue/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5 border-b border-black/[0.04] dark:border-white/5 pb-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white truncate">
                      {category.title}
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {category.points.map((pt, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-apple-green shrink-0 mt-0.5" />
                        <span className="text-[11px] text-[var(--text-secondary)] dark:text-[var(--text-secondary)] font-medium leading-relaxed">
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
      </section>

      {/* Interactive Diagnostics Labs & Market Tools */}
      <section className="py-20 bg-gradient-to-b from-[var(--text-primary)] to-white dark:from-[var(--bg-page)] dark:to-[var(--bg-surface)] border-t border-black/[0.03] dark:border-white/5">
        <div className="max-w-[1024px] mx-auto px-6 sm:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
              DIAGNOSTIC TECHNOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
              Pakizzle Diagnostic Engineering Labs
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Experience the military-grade hardware, real-time node tracking, and digital frameworks that power Pakistan's most accurate inspection network.
            </p>
          </div>

          {/* Hotspots Chassis X-Ray Explorer */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/[0.04] dark:border-white/5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white">
                  01. Car Chassis & Frame X-Ray
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Click on the key zones to run simulated diagnostics of structural weld seals and safety cages.
                </p>
              </div>
            </div>
            <InspectionHotspotsExplorer />
          </div>

          {/* Split row: Real-time Dispatch Node Radar & Market Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="pb-2 border-b border-black/[0.04] dark:border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white">
                  02. Real-Time Node Tracking Radar
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Live location sweep of our certified inspector nodes dispatched across major city hubs.
                </p>
              </div>
              <LiveNodeRadar />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="pb-2 border-b border-black/[0.04] dark:border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white">
                  03. Pakizzle Badge Sell-Speed Boost
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Simulate buyer trust metrics with and without our mandatory verified badge reports.
                </p>
              </div>
              <VerifiedBadgeBoost />
            </div>
          </div>

          {/* Deep Market Comparisons */}
          <div className="space-y-6 pt-8">
            <div className="pb-2 border-b border-black/[0.04] dark:border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white">
                04. Technical Service Comparison Matrix
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                How Pakizzle compares to standard roadside mechanics or listing platform checkups.
              </p>
            </div>
            <DubizzleComparison />
          </div>

        </div>
      </section>

      {/* Virtual Interactive Sample Report Showcase */}
      <section className="py-20 max-w-[1024px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block font-mono">
                HIGH-FIDELITY DIGITAL FEEDBACK
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
                Inspect our real Digital Diagnostic Report
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                We deliver a beautiful, cloud-hosted dashboard link directly to your phone. It translates technical telemetry codes into understandable gauges and visual mapping indicators.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-apple-green/10 text-apple-green flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">Includes clear Red/Yellow/Green health ratings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-apple-green/10 text-apple-green flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">Interactive paint micron thickness mapping</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-apple-green/10 text-apple-green flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">4K detailed walkthrough images attached</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => toast.success("PDF Download Initiated", { description: "Preparing comprehensive 240-point sample vehicle report." })}
                className="px-5 py-2.5 bg-[var(--text-primary)] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 hover:bg-black/[0.04] text-xs font-bold rounded-full transition-all"
              >
                Download Sample PDF Report
              </button>
            </div>
          </div>

          {/* Right Live Interactive Simulator Box */}
          <div className="lg:col-span-7 bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.015)]">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4.5 h-4.5 text-apple-blue" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white">Live Sample Report Viewer</h3>
              </div>
              <span className="text-[8px] font-extrabold text-apple-blue font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-apple-blue/5 border border-apple-blue/15">
                SAMPLE: COMPLETED CIVIC
              </span>
            </div>

            {/* Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[var(--text-primary)] dark:bg-white/5 p-1 rounded-xl mb-4">
              {[
                { id: 'paint' as const, label: 'Paint Depth Map' },
                { id: 'engine' as const, label: 'Compression' },
                { id: 'obd' as const, label: 'ECU Telemetry' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportTab(tab.id)}
                  className={cn(
                    "py-1.5 text-[10px] font-bold rounded-lg transition-all",
                    reportTab === tab.id
                      ? "bg-white dark:bg-[var(--bg-inset)] text-[var(--text-primary)] dark:text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Interactive Render */}
            <div className="bg-[var(--text-primary)]/30 dark:bg-white/[0.005] border border-black/[0.02] dark:border-white/[0.02] rounded-2xl p-4 min-h-[180px] flex flex-col justify-center">
              
              {reportTab === 'paint' && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[var(--text-secondary)] border-b border-black/[0.04] dark:border-white/5 pb-1">
                    <span>Exterior panel scanned</span>
                    <span>Micron reading</span>
                  </div>
                  <div className="space-y-2 text-[11px] font-semibold">
                    <div className="flex justify-between text-apple-green">
                      <span>Front Bonnet / Hood</span>
                      <span>105μm (Factory original paint)</span>
                    </div>
                    <div className="flex justify-between text-gold-decoration">
                      <span>Rear Right Door Panel</span>
                      <span>190μm (Resprayed cosmetically)</span>
                    </div>
                    <div className="flex justify-between text-apple-red">
                      <span>Front Left Fender / Wing</span>
                      <span>440μm (Accidental damage with body filler)</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-[var(--text-secondary)] pt-1 italic font-normal">
                    *Factory paint range across Pakistan assembly vehicles: 85μm - 120μm.
                  </div>
                </div>
              )}

              {reportTab === 'engine' && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[var(--text-secondary)] border-b border-black/[0.04] dark:border-white/5 pb-1">
                    <span>Dynamic compression test</span>
                    <span>SOH Rate</span>
                  </div>
                  <div className="space-y-2.5 text-[10px] font-mono font-bold">
                    {[
                      { name: "Cylinder 1 Compression", value: "98% Nominal Balance", color: "bg-apple-green", percent: 98 },
                      { name: "Cylinder 2 Compression", value: "97% Nominal Balance", color: "bg-apple-green", percent: 97 },
                      { name: "Cylinder 3 Compression", value: "98% Nominal Balance", color: "bg-apple-green", percent: 98 },
                      { name: "Cylinder 4 Compression", value: "94% Minimal Variance", color: "bg-apple-green", percent: 94 }
                    ].map((cyl, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-[var(--text-primary)] dark:text-white truncate">{cyl.name}</span>
                        <div className="flex-1 h-1.5 bg-[var(--border)] dark:bg-white/10 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", cyl.color)} style={{ width: `${cyl.percent}%` }} />
                        </div>
                        <span className="text-[var(--text-secondary)] shrink-0 font-bold tracking-tight">{cyl.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportTab === 'obd' && (
                <div className="space-y-2 text-[11px] font-semibold">
                  <div className="flex justify-between py-1.5 border-b border-black/[0.03] dark:border-white/5 text-apple-green">
                    <span>Engine Control Module (ECM) Scan</span>
                    <span>0 Active Errors</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/[0.03] dark:border-white/5 text-apple-green">
                    <span>SRS Airbag Circuit Handshake</span>
                    <span>Deployment logs verify intact</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/[0.03] dark:border-white/5 text-apple-green">
                    <span>Odometer Rollback Anti-tamper block</span>
                    <span>Odometer verified genuine</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-gold-decoration">
                    <span>ABS Dynamic Sensor Logging</span>
                    <span>1 Historical low-voltage flag</span>
                  </div>
                </div>
              )}

            </div>

            <div className="pt-4 border-t border-black/[0.04] dark:border-white/5 flex items-center justify-between text-[10px]">
              <span className="text-[var(--text-secondary)] font-bold">240 data points fully analyzed</span>
              <span className="font-mono text-apple-blue font-bold tracking-tight flex items-center gap-0.5">
                VERIFIED SECURED SEAL
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-[var(--bg-surface)] border-t border-black/[0.03] dark:border-white/5">
        <div className="max-w-[1024px] mx-auto px-6 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block font-mono">
              SIMPLE 3-STEP FLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
              Our Step-by-Step Inspection Process
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              No effort needed from your end. We manage the seller coordination, execute the diagnostic sweep, and email your detailed report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Book Sweep Online",
                desc: "Choose your preferred packages, input vehicle parameters (make/model), and confirm the date and location of the seller. Schedule in under 2 minutes."
              },
              {
                step: "02",
                title: "Mobile Node Dispatched",
                desc: "Our nearest certified engineering unit drives directly to the seller’s location (home, office, or showroom) to execute a comprehensive dynamic diagnostics sweep."
              },
              {
                step: "03",
                title: "Download Cloud Report",
                desc: "Within 60 minutes of completion, your customized digital report with paint thickness mapping, OBD codes, and dynamic performance feedback is uploaded."
              }
            ].map((stepItem, idx) => (
              <div key={idx} className="relative space-y-4 p-4.5">
                <div className="text-4xl sm:text-5xl font-extrabold text-apple-blue/15 font-mono leading-none">
                  {stepItem.step}
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] dark:text-white leading-snug">
                  {stepItem.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                  {stepItem.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Pricing / Packages Comparison Section */}
      <section className="py-20 max-w-[1024px] mx-auto px-6 sm:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            TRANSPARENT VALUE
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Transparent Mobile Inspection Packages
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Simple flat-rate pricing with absolutely no hidden dispatch charges or travel costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Lite-Scan Coverage",
              points: "120+ Point check",
              price: "PKR 5,500",
              desc: "Ideal for basic local hatchbacks, low-budget commuter vehicles, or checking showroom cars that carry structural certificates already.",
              buttonText: "Schedule Lite-Scan",
              features: [
                'Engine bay general check',
                '10 Panel Paint thickness gauge',
                'Primary ECU trouble code log',
                'Road handling validation',
                'Basic cloud-hosted PDF report'
              ],
              isPopular: false,
              accent: "border-black/[0.04] dark:border-white/[0.04]"
            },
            {
              title: "Pro-Verify Sweep",
              points: "200+ Point check",
              price: "PKR 8,500",
              desc: "Our highly recommended package for Japanese imports, premium sedans, compact crossovers, and high-frequency hybrid vehicles.",
              buttonText: "Schedule Pro-Verify",
              features: [
                '200+ Point thorough inspection',
                'Full panel 3D paint mapping',
                'Complete CANbus system scan',
                'Hybrid State of Health analysis',
                'Anti-rollback odometer checksum',
                'Brake and tire depth measurement'
              ],
              isPopular: true,
              accent: "border-apple-blue shadow-[0_15px_40px_rgba(0,113,227,0.06)] scale-[1.03]"
            },
            {
              title: "Forensic Master Audit",
              points: "250+ Point check",
              price: "PKR 12,500",
              desc: "Ultimate coverage designed specifically for high-end German luxury brands, sports cars, dynamic 4x4 trucks, or remote buyers.",
              buttonText: "Schedule Forensic Audit",
              features: [
                '250+ Maximum diagnostic checklist',
                'Acoustic cylinder compression balance',
                'Thermal battery check under load',
                'Laser alignment chassis check',
                '4K Video walkaround bundle',
                'Priority certified dispatch support'
              ],
              isPopular: false,
              accent: "border-black/[0.04] dark:border-white/[0.04]"
            }
          ].map((pkg, idx) => (
            <div 
              key={idx}
              className={cn(
                "bg-white dark:bg-[var(--bg-surface)] rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden",
                pkg.accent
              )}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 right-0 bg-apple-blue text-white text-[9px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-bl-xl shadow-sm">
                  Popular Choice
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block font-mono">{pkg.points}</span>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] dark:text-white">{pkg.title}</h3>
                  <div className="text-2xl font-bold font-mono tracking-tight text-apple-blue dark:text-white pt-1">
                    {pkg.price}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                  {pkg.desc}
                </p>

                <div className="border-t border-black/[0.04] dark:border-white/5 pt-4 space-y-3">
                  <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">Features included</span>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-apple-green shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-black/[0.04] dark:border-white/5">
                <button
                  onClick={() => navigate('/inspection/book')}
                  className={cn(
                    "w-full py-3 text-center text-xs font-bold rounded-xl transition-all shadow-sm",
                    pkg.isPopular
                      ? "bg-apple-blue hover:bg-blue-600 text-white"
                      : "bg-[var(--text-primary)] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 text-[var(--text-primary)] dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
                  )}
                >
                  {pkg.buttonText}
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Accordion FAQ Area */}
      <section className="py-20 bg-white dark:bg-[var(--bg-surface)] border-t border-black/[0.03] dark:border-white/5">
        <div className="max-w-[800px] mx-auto px-6 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
              Inspection Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIdx === index;
              return (
                <div 
                  key={index}
                  className="bg-[var(--text-primary)]/40 dark:bg-white/[0.005] border border-black/[0.03] dark:border-white/[0.03] rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : index)}
                    className="w-full py-4.5 px-5 flex justify-between items-center text-left hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-[var(--text-secondary)] shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 text-apple-blue"
                    )} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
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
      </section>

      {/* Bottom CTA Conversion section */}
      <section className="relative py-20 bg-gradient-to-tr from-[var(--text-primary)] to-[var(--bg-surface)] text-white border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-apple-blue/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20" />
        
        <div className="max-w-[1024px] mx-auto px-6 sm:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-apple-blue">
            <Coins className="w-3.5 h-3.5" />
            SECURE INVESTMENT PROTECTION
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white max-w-xl mx-auto leading-tight">
            Protect your hard-earned savings from used car frauds.
          </h2>

          <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto leading-relaxed">
            Whether you want standard body checkups or forensic ECU scans, our mobile nodes are dispatched to prove your vehicle pedigree in under an hour.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <button
              onClick={() => navigate('/inspection/book')}
              className="w-full sm:w-auto px-7 py-3 text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
            >
              Book Doorstep Sweep Now
            </button>
            <button
              onClick={() => toast.info("WhatsApp Helpline Launched", { description: "Connecting directly to lead technician coordinator." })}
              className="w-full sm:w-auto px-7 py-3 text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-colors"
            >
              Chat with Lead Engineer
            </button>
          </div>

          <p className="text-[10px] text-white/40 font-mono">
            Secure card checkout, EasyPaisa, JazzCash, or dynamic Cash-on-Sweep accepted.
          </p>
        </div>
      </section>

      <Footer onValuationClick={() => {}} />
    </div>
  );
}
